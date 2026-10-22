const https = require("https");
const fs = require("fs");
const sharp = require("sharp");
const path = require("path");

const UA = "Mozilla/5.0";
const OUT = "c:/git/decolonizaciya/gfx/leaders/DEC";
const PREV = "c:/git/decolonizaciya/tools/_ph_preview";

function fetchBuf(url, r = 0) {
  return new Promise((res, rej) => {
    if (r > 8) return rej(new Error("redir"));
    if (url.startsWith("//")) url = "https:" + url;
    const lib = url.startsWith("https") ? https : require("http");
    const req = lib.get(
      url,
      { headers: { "User-Agent": UA, Accept: "*/*" }, timeout: 35000 },
      (resp) => {
        if ([301, 302, 303, 307, 308].includes(resp.statusCode) && resp.headers.location) {
          resp.resume();
          return res(fetchBuf(new URL(resp.headers.location, url).toString(), r + 1));
        }
        if (resp.statusCode !== 200) {
          resp.resume();
          return rej(new Error("HTTP " + resp.statusCode));
        }
        const c = [];
        resp.on("data", (d) => c.push(d));
        resp.on("end", () => res(Buffer.concat(c)));
      }
    );
    req.on("error", rej);
    req.on("timeout", () => {
      req.destroy();
      rej(new Error("timeout"));
    });
  });
}

function writeDDS(bgra, w, h, outPath) {
  const header = Buffer.alloc(128);
  header.write("DDS ", 0);
  header.writeUInt32LE(124, 4);
  header.writeUInt32LE(0x100F, 8);
  header.writeUInt32LE(h, 12);
  header.writeUInt32LE(w, 16);
  header.writeUInt32LE(w * 4, 20);
  header.writeUInt32LE(32, 76);
  header.writeUInt32LE(0x41, 80);
  header.writeUInt32LE(32, 88);
  header.writeUInt32LE(0x00ff0000, 92);
  header.writeUInt32LE(0x0000ff00, 96);
  header.writeUInt32LE(0x000000ff, 100);
  header.writeUInt32LE(0xff000000, 104);
  header.writeUInt32LE(0x1000, 108);
  fs.writeFileSync(outPath, Buffer.concat([header, bgra]));
}

async function toDDS(buf, outPath, gravity = "attention") {
  const { data, info } = await sharp(buf)
    .rotate()
    .resize(160, 210, { fit: "cover", position: gravity })
    .ensureAlpha()
    .raw()
    .toBuffer({ resolveWithObject: true });
  const bgra = Buffer.alloc(data.length);
  for (let i = 0; i < data.length; i += 4) {
    bgra[i] = data[i + 2];
    bgra[i + 1] = data[i + 1];
    bgra[i + 2] = data[i];
    bgra[i + 3] = data[i + 3];
  }
  writeDDS(bgra, info.width, info.height, outPath);
}

async function makePlaceholder(name, outPath) {
  const initials = name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0].toUpperCase())
    .join("");
  const hue = [...name].reduce((a, c) => a + c.charCodeAt(0), 0) % 360;
  const svg = `<svg width="160" height="210" xmlns="http://www.w3.org/2000/svg">
  <defs><linearGradient id="g" x1="0" y1="0" x2="0" y2="1">
    <stop offset="0%" stop-color="hsl(${hue},38%,40%)"/>
    <stop offset="100%" stop-color="hsl(${hue},38%,20%)"/>
  </linearGradient></defs>
  <rect width="160" height="210" fill="url(#g)"/>
  <circle cx="80" cy="78" r="44" fill="rgba(255,255,255,0.16)"/>
  <text x="80" y="92" text-anchor="middle" font-family="Arial" font-size="34" fill="#fff" font-weight="700">${initials}</text>
  <text x="80" y="178" text-anchor="middle" font-family="Arial" font-size="10" fill="#eee">${name.slice(0, 24)}</text>
</svg>`;
  await toDDS(await sharp(Buffer.from(svg)).png().toBuffer(), outPath);
}

async function save(slug, url, gravity = "attention") {
  const buf = await fetchBuf(url);
  if (buf.length < 1500) throw new Error("short");
  const head = buf.slice(0, 8).toString("ascii");
  if (head.includes("<!") || head.includes("<html")) throw new Error("html");
  await toDDS(buf, path.join(OUT, slug + ".dds"), gravity);
  await sharp(buf)
    .rotate()
    .resize(160, 210, { fit: "cover", position: gravity })
    .png()
    .toFile(path.join(PREV, slug + ".png"));
  console.log("OK", slug, buf.length);
  return true;
}

async function tryUrls(slug, urls, gravity = "attention") {
  for (const url of urls) {
    try {
      await save(slug, url, gravity);
      return url;
    } catch (e) {
      console.log("fail", slug, e.message, url.slice(0, 70));
    }
  }
  await makePlaceholder(slug.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase()), path.join(OUT, slug + ".dds"));
  console.log("PH", slug);
  return null;
}

async function ddsToPng(ddsPath) {
  const buf = fs.readFileSync(ddsPath);
  const w = buf.readUInt32LE(16);
  const h = buf.readUInt32LE(12);
  const bgra = buf.slice(128, 128 + w * h * 4);
  const rgba = Buffer.alloc(bgra.length);
  for (let i = 0; i < bgra.length; i += 4) {
    rgba[i] = bgra[i + 2];
    rgba[i + 1] = bgra[i + 1];
    rgba[i + 2] = bgra[i];
    rgba[i + 3] = bgra[i + 3];
  }
  return sharp(rgba, { raw: { width: w, height: h, channels: 4 } }).png().toBuffer();
}

async function makeCollage(rows) {
  const cols = 3;
  const n = rows.length;
  const rws = Math.ceil(n / cols);
  const cellW = 220,
    cellH = 290,
    pad = 24,
    headerH = 110,
    footerH = 40;
  const W = pad * 2 + cols * cellW + (cols - 1) * 16;
  const H = headerH + pad + rws * cellH + (rws - 1) * 16 + footerH;
  const bgSvg = `<svg width="${W}" height="${H}" xmlns="http://www.w3.org/2000/svg">
    <rect width="${W}" height="${H}" fill="#120e08"/>
    <text x="${W / 2}" y="48" text-anchor="middle" font-family="Georgia" font-size="34" fill="#e8c547" font-weight="700">SELECT YOUR FIGHTER</text>
    <text x="${W / 2}" y="80" text-anchor="middle" font-family="Arial" font-size="15" fill="#c9a227">CHUVASHIA — BULGAR CONFEDERATION</text>
  </svg>`;
  const layers = [{ input: await sharp(Buffer.from(bgSvg)).png().toBuffer(), top: 0, left: 0 }];
  for (let i = 0; i < n; i++) {
    const row = rows[i];
    const col = i % cols;
    const rr = Math.floor(i / cols);
    const x = pad + col * (cellW + 16);
    const y = headerH + rr * (cellH + 16);
    const portrait = await ddsToPng(path.join(OUT, row.slug + ".dds"));
    const framed = await sharp({
      create: { width: cellW, height: cellH, channels: 4, background: { r: 18, g: 14, b: 8, alpha: 1 } },
    })
      .composite([
        { input: await sharp(portrait).resize(180, 210, { fit: "cover" }).png().toBuffer(), top: 12, left: 20 },
        {
          input: Buffer.from(`<svg width="${cellW}" height="${cellH}" xmlns="http://www.w3.org/2000/svg">
            <rect x="8" y="8" width="${cellW - 16}" height="${cellH - 16}" fill="none" stroke="#e8c547" stroke-width="3"/>
            <text x="${cellW / 2}" y="245" text-anchor="middle" font-family="Arial" font-size="12" fill="#f5e6b8" font-weight="700">${row.name}</text>
            <text x="${cellW / 2}" y="262" text-anchor="middle" font-family="Arial" font-size="9" fill="#aaa">${row.role.slice(0, 34)}</text>
            <text x="${cellW / 2}" y="278" text-anchor="middle" font-family="Arial" font-size="9" fill="${row.ok ? "#6d6" : "#c66"}">${row.ok ? "VERIFIED" : "NO PHOTO"}</text>
          </svg>`),
          top: 0,
          left: 0,
        },
      ])
      .png()
      .toBuffer();
    layers.push({ input: framed, top: y, left: x });
  }
  const outPng = path.join(OUT, "DEC_chuvash_mk_select.png");
  await sharp({
    create: { width: W, height: H, channels: 4, background: { r: 18, g: 14, b: 8, alpha: 1 } },
  })
    .composite(layers)
    .png()
    .toFile(outPng);
  fs.copyFileSync(
    outPng,
    "C:/Users/Admin/.cursor/projects/c-git-decolonizaciya/assets/DEC_chuvash_mk_select.png"
  );
  console.log("collage", outPng);
}

async function main() {
  const report = [];

  // Caption-verified RFE/RL / Telegram / Activatica
  const jobs = [
    {
      name: "Mishshi Oreshnikov",
      slug: "mishshi_oreshnikov",
      role: "Партия Булгарской Конфедерации",
      urls: [
        // official Telegram profile avatar from t.me/oreshnikov_mishi
        "https://cdn4.telesco.pe/file/X-DhXtbEGhgc1Usf1NjikZ7WcreI3SILeFBk8MJwjTVl2bJZaF7AIWPz0d6I0jme8YR43IHO7HBF1Xok6YovZbyoCr_bXrQD6bv9ujlOh_PtdoEnb5g_PIeqhhGGImJ3aGsLwlorZggBvzXd3QDp4hckH_TdfreCa-45Ws6VC_O_af3jKFFdfoNk8gwDLrGGpo9jVn_d-kle2kSMIK8zNDlPMy9NVKV2EvJyGHPEmWg7yA8I-dMc6sLorjx_jalVS7ZI89MXUj301mtYurkHmRUx8ElsD3eG00hLZPORh5CUO-c3A_4bFrjxY_gBrRyia_jfTDOPdJqAG8XibO5_Hw.jpg",
      ],
    },
    {
      name: "Dmitry Semenov",
      slug: "dmitry_semenov",
      role: "Либералы Чувашии",
      // alt explicitly names him; use portrait crop (_w250_r1_s) then larger
      urls: [
        "https://gdb.rferl.org/9b380f63-1927-4c1e-81a5-d198de4f5f0e_w250_r1_s.png",
        "https://gdb.rferl.org/9b380f63-1927-4c1e-81a5-d198de4f5f0e_w1024.png",
        "https://gdb.rferl.org/ae5f433f-64ef-4423-a48a-5b01dd8bc5c0_cx0_cy33_cw72_w1200_h630.jpg",
      ],
      gravity: "left",
    },
    {
      name: "Semyon Kochkin",
      slug: "semyon_kochkin",
      role: "Демократы Чувашии",
      urls: [
        "https://gdb.rferl.org/034d0000-0aff-0242-b326-08dadf66aa4d_cx0_cy7_cw0_w1024_r1_s.jpg",
        "https://gdb.rferl.org/034d0000-0aff-0242-b326-08dadf66aa4d_cx0_cy7_cw0_w250_r1_s.jpg",
        "https://gdb.rferl.org/084a0000-0aff-0242-847d-08d9dbf19908_w1024_r0_s.jpg",
        "https://storage.googleapis.com/activatica/uploads/admin/835527a8-fce2-475c-a34d-471fb7ea8de6.jpg",
      ],
    },
    {
      name: "Vadim Nikiforov",
      slug: "vadim_nikiforov",
      role: "Чувашский йомзя",
      urls: [
        "https://gdb.rferl.org/e622bfa2-a721-4e0a-927a-692a1abfb1c7_w1024.jpg",
        "https://gdb.rferl.org/e622bfa2-a721-4e0a-927a-692a1abfb1c7_w250_r0_s.jpg",
        "https://gdb.rferl.org/e622bfa2-a721-4e0a-927a-692a1abfb1c7_w100_r1.jpg",
      ],
    },
  ];

  for (const j of jobs) {
    const url = await tryUrls(j.slug, j.urls, j.gravity || "attention");
    report.push({ name: j.name, slug: j.slug, role: j.role, ok: !!url, url });
  }

  // No verified public headshots → placeholders (do NOT use wrong faces)
  for (const p of [
    { name: "Oleg Elkin", slug: "oleg_elkin", role: "Социал-демократы Чувашии" },
    { name: "Denis Olenov", slug: "denis_olenov", role: "Левый фронт" },
    { name: "Rodion Evdokimov", slug: "rodion_evdokimov", role: "Чувашский национал-социализм" },
    { name: "Dmitry Karuev", slug: "dmitry_karuev", role: "Национал-большевики Чувашии" },
  ]) {
    await makePlaceholder(p.name, path.join(OUT, p.slug + ".dds"));
    report.push({ ...p, ok: false });
    console.log("PH", p.slug);
  }

  // keep white chuvashia existing logo
  report.push({
    name: "White Chuvashia Council",
    slug: "white_chuvashia_council",
    role: "Белая Чувашия",
    ok: fs.existsSync(path.join(OUT, "white_chuvashia_council.dds")),
  });

  fs.writeFileSync(
    "c:/git/decolonizaciya/tools/_chuvash_portraits.json",
    JSON.stringify(report, null, 2)
  );
  await makeCollage(report);
  console.log(
    JSON.stringify(
      { verified: report.filter((r) => r.ok).length, placeholder: report.filter((r) => !r.ok).length },
      null,
      2
    )
  );
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
