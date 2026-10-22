const fs = require("fs");
const path = require("path");
const sharp = require("sharp");

const OUT = "c:/git/decolonizaciya/gfx/leaders/DEC";
const PREV = "c:/git/decolonizaciya/tools/_ph_preview";

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

async function toDDS(buf, outPath) {
  const { data, info } = await sharp(buf)
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
  await toDDS(await sharp(Buffer.from(svg)).png().toBuffer(), outPath);
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

async function main() {
  // User confirmed: ONLY Oreshnikov + Semenov are correct.
  // Reset everyone else to placeholders (no wrong faces).
  const reset = [
    "Semyon Kochkin",
    "Vadim Nikiforov",
    "Oleg Elkin",
    "Denis Olenov",
    "Rodion Evdokimov",
    "Dmitry Karuev",
    "White Chuvashia Council",
  ];
  for (const name of reset) {
    const slug = name
      .normalize("NFKD")
      .replace(/[^\w]+/g, "_")
      .replace(/^_|_$/g, "")
      .toLowerCase();
    await makePlaceholder(name, path.join(OUT, slug + ".dds"));
    console.log("PH", slug);
  }

  const ROWS = [
    { name: "Mishshi Oreshnikov", slug: "mishshi_oreshnikov", role: "Партия Булгарской Конфедерации", ok: true },
    { name: "Dmitry Semenov", slug: "dmitry_semenov", role: "Либералы Чувашии", ok: true },
    { name: "Semyon Kochkin", slug: "semyon_kochkin", role: "Демократы Чувашии", ok: false },
    { name: "Vadim Nikiforov", slug: "vadim_nikiforov", role: "Чувашский йомзя", ok: false },
    { name: "Oleg Elkin", slug: "oleg_elkin", role: "Социал-демократы Чувашии", ok: false },
    { name: "Denis Olenov", slug: "denis_olenov", role: "Левый фронт", ok: false },
    { name: "Rodion Evdokimov", slug: "rodion_evdokimov", role: "Нац. социализм / Ирĕклĕх", ok: false },
    { name: "Dmitry Karuev", slug: "dmitry_karuev", role: "Нац. большевики", ok: false },
    { name: "White Chuvashia Council", slug: "white_chuvashia_council", role: "Белая Чувашия", ok: false },
  ];

  const cols = 3;
  const n = ROWS.length;
  const rws = Math.ceil(n / cols);
  const cellW = 220,
    cellH = 300,
    pad = 24,
    headerH = 120;
  const W = pad * 2 + cols * cellW + (cols - 1) * 16;
  const H = headerH + pad + rws * cellH + (rws - 1) * 16 + 40;
  const bgSvg = `<svg width="${W}" height="${H}" xmlns="http://www.w3.org/2000/svg">
    <rect width="${W}" height="${H}" fill="#120e08"/>
    <text x="${W / 2}" y="46" text-anchor="middle" font-family="Georgia" font-size="34" fill="#e8c547" font-weight="700">SELECT YOUR FIGHTER</text>
    <text x="${W / 2}" y="78" text-anchor="middle" font-family="Arial" font-size="16" fill="#c9a227">CHUVASHIA — BULGAR CONFEDERATION</text>
    <text x="${W / 2}" y="102" text-anchor="middle" font-family="Arial" font-size="12" fill="#888">only Oreshnikov + Semenov verified</text>
  </svg>`;
  const layers = [{ input: await sharp(Buffer.from(bgSvg)).png().toBuffer(), top: 0, left: 0 }];
  for (let i = 0; i < n; i++) {
    const row = ROWS[i];
    const col = i % cols;
    const rr = Math.floor(i / cols);
    const x = pad + col * (cellW + 16);
    const y = headerH + rr * (cellH + 16);
    const portrait = await ddsToPng(path.join(OUT, row.slug + ".dds"));
    const framed = await sharp({
      create: { width: cellW, height: cellH, channels: 4, background: { r: 18, g: 14, b: 8, alpha: 1 } },
    })
      .composite([
        {
          input: await sharp(portrait).resize(180, 210, { fit: "cover" }).png().toBuffer(),
          top: 16,
          left: 20,
        },
        {
          input: Buffer.from(`<svg width="${cellW}" height="${cellH}" xmlns="http://www.w3.org/2000/svg">
            <rect x="8" y="8" width="${cellW - 16}" height="${cellH - 16}" fill="none" stroke="#e8c547" stroke-width="3"/>
            <text x="${cellW / 2}" y="250" text-anchor="middle" font-family="Arial" font-size="12" fill="#f5e6b8" font-weight="700">${row.name}</text>
            <text x="${cellW / 2}" y="268" text-anchor="middle" font-family="Arial" font-size="9" fill="#aaa">${row.role.slice(0, 36)}</text>
            <text x="${cellW / 2}" y="286" text-anchor="middle" font-family="Arial" font-size="9" fill="${row.ok ? "#6d6" : "#c66"}">${row.ok ? "VERIFIED" : "NO PHOTO"}</text>
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
  console.log("Wrote", outPng);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
