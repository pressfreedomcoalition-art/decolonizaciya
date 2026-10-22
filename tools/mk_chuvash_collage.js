const fs = require("fs");
const path = require("path");
const sharp = require("sharp");

const OUT = "c:/git/decolonizaciya/gfx/leaders/DEC";

const ROWS = [
  { name: "Mishshi Oreshnikov", slug: "mishshi_oreshnikov", role: "Партия Булгарской Конфедерации", ok: true },
  { name: "Dmitry Semenov", slug: "dmitry_semenov", role: "Либералы Чувашии", ok: true },
  { name: "Semyon Kochkin", slug: "semyon_kochkin", role: "Демократы / Сердитая Чувашия", ok: true },
  { name: "Vadim Nikiforov", slug: "vadim_nikiforov", role: "Чувашский йомзя", ok: true },
  { name: "Oleg Elkin", slug: "oleg_elkin", role: "Социал-демократы Чувашии", ok: false },
  { name: "Denis Olenov", slug: "denis_olenov", role: "Левый фронт", ok: false },
  { name: "Rodion Evdokimov", slug: "rodion_evdokimov", role: "Нац. социализм / Ирĕклĕх", ok: false },
  { name: "Dmitry Karuev", slug: "dmitry_karuev", role: "Нац. большевики / Другая Россия", ok: false },
  { name: "White Chuvashia Council", slug: "white_chuvashia_council", role: "Белая Чувашия", ok: true },
];

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
  const cols = 3;
  const n = ROWS.length;
  const rws = Math.ceil(n / cols);
  const cellW = 220,
    cellH = 300,
    pad = 24,
    headerH = 120,
    footerH = 50;
  const W = pad * 2 + cols * cellW + (cols - 1) * 16;
  const H = headerH + pad + rws * cellH + (rws - 1) * 16 + footerH;
  const bgSvg = `<svg width="${W}" height="${H}" xmlns="http://www.w3.org/2000/svg">
    <defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="#1a1408"/><stop offset="100%" stop-color="#0c0c10"/>
    </linearGradient></defs>
    <rect width="${W}" height="${H}" fill="url(#g)"/>
    <text x="${W / 2}" y="46" text-anchor="middle" font-family="Georgia" font-size="34" fill="#e8c547" font-weight="700">SELECT YOUR FIGHTER</text>
    <text x="${W / 2}" y="78" text-anchor="middle" font-family="Arial" font-size="16" fill="#c9a227">CHUVASHIA — BULGAR CONFEDERATION</text>
    <text x="${W / 2}" y="102" text-anchor="middle" font-family="Arial" font-size="12" fill="#888">verified Open Russia / Idel.Realii / Telegram — rest: no public photo</text>
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
            <text x="${cellW / 2}" y="286" text-anchor="middle" font-family="Arial" font-size="9" fill="${row.ok ? "#6d6" : "#c66"}">${row.ok ? "VERIFIED PHOTO" : "NO PUBLIC PHOTO"}</text>
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
  console.log("Wrote", outPng, W, "x", H);
}

main();
