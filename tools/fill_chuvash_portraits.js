/**
 * Fetch verified Chuvash (BCF) leader portraits and make MK-style select screenshot.
 */
const fs = require("fs");
const path = require("path");
const https = require("https");
const http = require("http");
const sharp = require("sharp");

const ROOT = "c:/git/decolonizaciya";
const OUT = path.join(ROOT, "gfx/leaders/DEC");
const PREV = path.join(ROOT, "tools/_ph_preview");
const UA =
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36";

const LEADERS = [
  {
    name: "Mishshi Oreshnikov",
    slug: "mishshi_oreshnikov",
    role: "Партия Булгарской Конфедерации",
    urls: [
      "https://cdn4.telesco.pe/file/X-DhXtbEGhgc1Usf1NjikZ7WcreI3SILeFBk8MJwjTVl2bJZaF7AIWPz0d6I0jme8YR43IHO7HBF1Xok6YovZbyoCr_bXrQD6bv9ujlOh_PtdoEnb5g_PIeqhhGGImJ3aGsLwlorZggBvzXd3QDp4hckH_TdfreCa-45Ws6VC_O_af3jKFFdfoNk8gwDLrGGpo9jVn_d-kle2kSMIK8zNDlPMy9NVKV2EvJyGHPEmWg7yA8I-dMc6sLorjx_jalVS7ZI89MXUj301mtYurkHmRUx8ElsD3eG00hLZPORh5CUO-c3A_4bFrjxY_gBrRyia_jfTDOPdJqAG8XibO5_Hw.jpg",
    ],
    pages: ["https://t.me/s/oreshnikov_mishi", "https://t.me/oreshnikov_mishi"],
  },
  {
    name: "Dmitry Semenov",
    slug: "dmitry_semenov",
    role: "Либералы Чувашии",
    urls: [],
    pages: [
      "https://www.svoboda.org/a/30422752.html",
      "https://www.svoboda.org/a/28248899.html",
      "https://www.idelreal.org/a/30422752.html",
    ],
  },
  {
    name: "Semyon Kochkin",
    slug: "semyon_kochkin",
    role: "Демократы Чувашии",
    urls: [],
    pages: [
      "https://www.idelreal.org/a/eto-byl-god-razocharovaniy-rukovoditel-proekta-serditaya-chuvashiya-semyon-kochkin-podvodit-itogi-2023-goda/32746378.html",
      "https://semnasem.org/articles/2022/10/17/zachem-eks-glava-shtaba-navalnogo-v-cheboksarah-vedet-podschet-pogibshih-v-ukraine-chuvashej-i-populyariziruet-chuvashskij-s-pomoshyu-antivoennyh-stikerov",
      "https://activatica.org/content/9654ba0f-98d4-4859-b4e4-4577aa2d9b89/semyon-kochkin-mobilizuyut-samye-nezashishennye-sloi-naseleniya",
      "https://www.svoboda.org/a/28336488.html",
    ],
  },
  {
    name: "Oleg Elkin",
    slug: "oleg_elkin",
    role: "Социал-демократы Чувашии",
    urls: [],
    pages: [
      "https://www.svoboda.org/a/31662822.html",
      "https://www.idelreal.org/a/31662822.html",
    ],
  },
  {
    name: "Denis Olenov",
    slug: "denis_olenov",
    role: "Левый фронт",
    urls: [],
    pages: [
      "https://www.ridus.ru/v-cheboksarah-organizatora-mitinga-za-chestnye-vybory-pytayutsya-privlech-k-otvetstvennosti-21017.html",
    ],
  },
  {
    name: "Vadim Nikiforov",
    slug: "vadim_nikiforov",
    role: "Чувашский йомзя",
    urls: [],
    pages: [
      "https://www.svoboda.org/a/31662822.html",
      "https://www.idelreal.org/a/31662822.html",
      "https://www.svoboda.org/amp/31662822.html",
    ],
  },
  {
    name: "Rodion Evdokimov",
    slug: "rodion_evdokimov",
    role: "Чувашский национал-социализм",
    urls: [],
    pages: ["https://freedomcoalition.net/convent"],
  },
  {
    name: "White Chuvashia Council",
    slug: "white_chuvashia_council",
    role: "Белая Чувашия",
    urls: [],
    pages: ["https://freedomcoalition.net/snb"],
    keepExistingIfOk: true,
  },
  {
    name: "Dmitry Karuev",
    slug: "dmitry_karuev",
    role: "Национал-большевики Чувашии",
    urls: [],
    pages: [
      "https://www.ridus.ru/v-cheboksarah-organizatora-mitinga-za-chestnye-vybory-pytayutsya-privlech-k-otvetstvennosti-21017.html",
    ],
  },
];

function fetchBuf(url, redirects = 0) {
  return new Promise((resolve, reject) => {
    if (!url || redirects > 8) return reject(new Error("bad url"));
    if (url.startsWith("//")) url = "https:" + url;
    const lib = url.startsWith("https") ? https : http;
    const req = lib.get(
      url,
      {
        headers: {
          "User-Agent": UA,
          Accept: "*/*",
          "Accept-Language": "ru-RU,ru;q=0.9,en;q=0.8",
        },
        timeout: 35000,
      },
      (res) => {
        if ([301, 302, 303, 307, 308].includes(res.statusCode) && res.headers.location) {
          res.resume();
          return resolve(fetchBuf(new URL(res.headers.location, url).toString(), redirects + 1));
        }
        if (res.statusCode !== 200) {
          res.resume();
          return reject(new Error("HTTP " + res.statusCode));
        }
        const chunks = [];
        res.on("data", (c) => chunks.push(c));
        res.on("end", () => resolve(Buffer.concat(chunks)));
      }
    );
    req.on("error", reject);
    req.on("timeout", () => {
      req.destroy();
      reject(new Error("timeout"));
    });
  });
}

async function extractImages(pageUrl) {
  const html = (await fetchBuf(pageUrl)).toString("utf8");
  const found = [];
  const og =
    html.match(/property=["']og:image["'][^>]*content=["']([^"']+)/i) ||
    html.match(/content=["']([^"']+)["'][^>]*property=["']og:image["']/i);
  if (og) found.push(og[1].replace(/&amp;/g, "&"));

  // RFE/RL media
  for (const m of html.matchAll(/https:\/\/gdb\.(?:rferl|svoboda)\.org\/[^"'\\\s>]+\.(?:jpg|jpeg|png|webp)/gi)) {
    found.push(m[0].replace(/\\u0026/g, "&"));
  }
  // generic imgs
  for (const m of html.matchAll(/https?:\/\/[^"'\\\s>]+\.(?:jpg|jpeg|png|webp)/gi)) {
    const u = m[0];
    if (/logo|icon|sprite|emoji|banner|pixel|1x1|favicon/i.test(u)) continue;
    found.push(u);
  }
  // telegram CDN in page
  for (const m of html.matchAll(/https:\/\/cdn\d*\.telesco\.pe\/file\/[^"'\\\s>]+/gi)) {
    found.push(m[0]);
  }
  return [...new Set(found)];
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

async function toPortraitDDS(imgBuf, outPath) {
  const { data, info } = await sharp(imgBuf)
    .rotate()
    .resize(160, 210, { fit: "cover", position: "attention" })
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

async function faceScore(imgBuf) {
  try {
    const { data, info } = await sharp(imgBuf)
      .rotate()
      .resize(80, 105, { fit: "cover", position: "centre" })
      .removeAlpha()
      .raw()
      .toBuffer({ resolveWithObject: true });
    let n = 0,
      skin = 0,
      sum = 0,
      sum2 = 0,
      white = 0;
    const colors = new Set();
    for (let i = 0; i < data.length; i += 3) {
      const r = data[i],
        g = data[i + 1],
        b = data[i + 2];
      const lum = (r + g + b) / 3;
      sum += lum;
      sum2 += lum * lum;
      n++;
      colors.add((r >> 4 << 8) | (g >> 4 << 4) | (b >> 4));
      if (r > 200 && g > 200 && b > 200) white++;
      if (r > 60 && r < 240 && g > 30 && g < 210 && b > 15 && b < 190 && r > g - 5 && g >= b - 15 && r - b > 10)
        skin++;
    }
    const variance = sum2 / n - (sum / n) ** 2;
    const skinR = skin / n;
    const whiteR = white / n;
    if (colors.size < 50) return -1;
    if (variance < 1000) return -1;
    if (skinR < 0.03) return -1;
    if (whiteR > 0.45) return -1;
    return skinR * 100 + Math.min(colors.size, 300) / 10 + Math.min(variance, 8000) / 200;
  } catch {
    return -1;
  }
}

async function makePlaceholder(name, outPath) {
  const initials = name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0].toUpperCase())
    .join("");
  const hue = [...name].reduce((a, c) => a + c.charCodeAt(0), 0) % 360;
  const safe = name.replace(/[<>&]/g, "");
  const svg = `<svg width="160" height="210" xmlns="http://www.w3.org/2000/svg">
  <defs><linearGradient id="g" x1="0" y1="0" x2="0" y2="1">
    <stop offset="0%" stop-color="hsl(${hue},38%,40%)"/>
    <stop offset="100%" stop-color="hsl(${hue},38%,20%)"/>
  </linearGradient></defs>
  <rect width="160" height="210" fill="url(#g)"/>
  <circle cx="80" cy="78" r="44" fill="rgba(255,255,255,0.16)"/>
  <text x="80" y="92" text-anchor="middle" font-family="Arial" font-size="34" fill="#fff" font-weight="700">${initials}</text>
  <text x="80" y="178" text-anchor="middle" font-family="Arial" font-size="10" fill="#eee">${safe.slice(0, 24)}</text>
</svg>`;
  await toPortraitDDS(await sharp(Buffer.from(svg)).png().toBuffer(), outPath);
}

async function findBest(leader) {
  const candidates = [...leader.urls];
  for (const page of leader.pages || []) {
    try {
      const imgs = await extractImages(page);
      console.log("  page", page.slice(0, 60), "imgs", imgs.length);
      candidates.push(...imgs.slice(0, 15));
    } catch (e) {
      console.log("  page fail", page.slice(0, 50), e.message);
    }
  }
  let best = null;
  for (const url of [...new Set(candidates)].slice(0, 30)) {
    try {
      const buf = await fetchBuf(url);
      if (buf.length < 2500 || buf.length > 12_000_000) continue;
      const head = buf.slice(0, 12).toString("ascii");
      if (head.includes("<!") || head.includes("<html")) continue;
      const score = await faceScore(buf);
      if (score < 0) continue;
      if (!best || score > best.score) best = { buf, url, score };
      if (score > 45) break;
    } catch (_) {}
  }
  return best;
}

async function ddsToPngBuffer(ddsPath) {
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

async function makeCollage(results) {
  const cols = 3;
  const rows = Math.ceil(results.length / cols);
  const cellW = 220;
  const cellH = 290;
  const pad = 24;
  const headerH = 110;
  const footerH = 50;
  const W = pad * 2 + cols * cellW + (cols - 1) * 16;
  const H = headerH + pad + rows * cellH + (rows - 1) * 16 + footerH;

  const layers = [];
  // dark bg with yellow/black chuvash vibe
  const bgSvg = `<svg width="${W}" height="${H}" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <linearGradient id="bg" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0%" stop-color="#1a1208"/>
        <stop offset="50%" stop-color="#0d0d12"/>
        <stop offset="100%" stop-color="#1a0a0a"/>
      </linearGradient>
    </defs>
    <rect width="${W}" height="${H}" fill="url(#bg)"/>
    <text x="${W / 2}" y="48" text-anchor="middle" font-family="Georgia, serif" font-size="36" fill="#e8c547" font-weight="700">SELECT YOUR FIGHTER</text>
    <text x="${W / 2}" y="82" text-anchor="middle" font-family="Arial" font-size="16" fill="#c9a227">CHUVASHIA — BULGAR CONFEDERATION</text>
  </svg>`;
  layers.push({ input: await sharp(Buffer.from(bgSvg)).png().toBuffer(), top: 0, left: 0 });

  for (let i = 0; i < results.length; i++) {
    const r = results[i];
    const col = i % cols;
    const row = Math.floor(i / cols);
    const x = pad + col * (cellW + 16);
    const y = headerH + row * (cellH + 16);
    const portrait = await ddsToPngBuffer(path.join(OUT, r.slug + ".dds"));
    const framed = await sharp({
      create: { width: cellW, height: cellH, channels: 4, background: { r: 20, g: 16, b: 10, alpha: 1 } },
    })
      .composite([
        {
          input: await sharp(portrait).resize(180, 210, { fit: "cover" }).png().toBuffer(),
          top: 12,
          left: 20,
        },
        {
          input: Buffer.from(`<svg width="${cellW}" height="${cellH}" xmlns="http://www.w3.org/2000/svg">
            <rect x="8" y="8" width="${cellW - 16}" height="${cellH - 16}" fill="none" stroke="#e8c547" stroke-width="3"/>
            <rect x="14" y="14" width="${cellW - 28}" height="${cellH - 28}" fill="none" stroke="#8b6914" stroke-width="1"/>
            <text x="${cellW / 2}" y="245" text-anchor="middle" font-family="Arial" font-size="13" fill="#f5e6b8" font-weight="700">${r.name}</text>
            <text x="${cellW / 2}" y="265" text-anchor="middle" font-family="Arial" font-size="10" fill="#aaa">${r.role.slice(0, 32)}</text>
            <text x="${cellW / 2}" y="280" text-anchor="middle" font-family="Arial" font-size="9" fill="${r.ok ? "#6d6" : "#c66"}">${r.ok ? "PHOTO" : "NO PHOTO"}</text>
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
  const assets = path.join(
    "C:/Users/Admin/.cursor/projects/c-git-decolonizaciya/assets/DEC_chuvash_mk_select.png"
  );
  await sharp({
    create: { width: W, height: H, channels: 4, background: { r: 13, g: 13, b: 18, alpha: 1 } },
  })
    .composite(layers)
    .png()
    .toFile(outPng);
  fs.copyFileSync(outPng, assets);
  console.log("collage", outPng, W, H);
  return outPng;
}

async function main() {
  fs.mkdirSync(PREV, { recursive: true });
  const report = [];
  for (const leader of LEADERS) {
    process.stdout.write(">> " + leader.name + " ... ");
    const outPath = path.join(OUT, leader.slug + ".dds");
    try {
      const found = await findBest(leader);
      if (found) {
        await toPortraitDDS(found.buf, outPath);
        await sharp(found.buf)
          .rotate()
          .resize(160, 210, { fit: "cover", position: "attention" })
          .png()
          .toFile(path.join(PREV, leader.slug + ".png"));
        console.log("OK", found.score.toFixed(1));
        report.push({ ...leader, ok: true, url: found.url, score: found.score });
      } else if (leader.keepExistingIfOk && fs.existsSync(outPath)) {
        console.log("KEEP");
        report.push({ ...leader, ok: true, url: "existing" });
      } else {
        await makePlaceholder(leader.name, outPath);
        console.log("PH");
        report.push({ ...leader, ok: false });
      }
    } catch (e) {
      console.log("ERR", e.message);
      await makePlaceholder(leader.name, outPath);
      report.push({ ...leader, ok: false, err: e.message });
    }
  }
  fs.writeFileSync(path.join(ROOT, "tools/_chuvash_portraits.json"), JSON.stringify(report, null, 2));
  await makeCollage(report);
  console.log(JSON.stringify({ ok: report.filter((r) => r.ok).length, ph: report.filter((r) => !r.ok).length }, null, 2));
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
