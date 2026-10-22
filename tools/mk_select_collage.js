/**
 * Mortal Kombat-style character select collage of all DEC leaders.
 */
const fs = require("fs");
const path = require("path");
const sharp = require("./node_modules/sharp");

const DEC = "c:/git/decolonizaciya/gfx/leaders/DEC";
const BG = "C:/Users/Admin/.cursor/projects/c-git-decolonizaciya/assets/mk_russia_shatter_bg.png";
const OUT_DIR = "c:/git/decolonizaciya/gfx/leaders/DEC";
const OUT = path.join(OUT_DIR, "DEC_leaders_mk_select.png");
const OUT_ASSETS = "C:/Users/Admin/.cursor/projects/c-git-decolonizaciya/assets/DEC_leaders_mk_select.png";

const CELL_W = 96;
const CELL_H = 126;
const PAD = 6;
const FRAME = 3;
const LABEL_H = 18;
const TITLE_H = 70;
const MARGIN = 24;

function slugToName(slug) {
  return slug
    .replace(/\.dds$/i, "")
    .split("_")
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ");
}

function readUncompressedDDS(filePath) {
  const buf = fs.readFileSync(filePath);
  if (buf.slice(0, 4).toString() !== "DDS ") return null;
  const h = buf.readUInt32LE(12);
  const w = buf.readUInt32LE(16);
  const pfFlags = buf.readUInt32LE(80);
  const fourCC = buf.slice(84, 88).toString();
  // Uncompressed BGRA only (our generated ones)
  if (fourCC === "DXT1" || fourCC === "DXT3" || fourCC === "DXT5" || (pfFlags & 0x4)) {
    return null; // compressed — skip
  }
  const pixels = buf.slice(128);
  const expected = w * h * 4;
  if (pixels.length < expected) return null;
  // BGRA → RGBA
  const rgba = Buffer.alloc(expected);
  for (let i = 0; i < expected; i += 4) {
    rgba[i] = pixels[i + 2];
    rgba[i + 1] = pixels[i + 1];
    rgba[i + 2] = pixels[i];
    rgba[i + 3] = pixels[i + 3];
  }
  return { rgba, w, h };
}

async function portraitPng(filePath) {
  const raw = readUncompressedDDS(filePath);
  if (!raw) return null;
  return sharp(raw.rgba, { raw: { width: raw.w, height: raw.h, channels: 4 } })
    .resize(CELL_W, CELL_H, { fit: "cover" })
    .png()
    .toBuffer();
}

function escapeXml(s) {
  return s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

(async () => {
  const files = fs
    .readdirSync(DEC)
    .filter((f) => f.endsWith(".dds") && !f.startsWith("DEC_"))
    .sort();

  const portraits = [];
  for (const f of files) {
    const png = await portraitPng(path.join(DEC, f));
    if (!png) {
      console.log("skip compressed", f);
      continue;
    }
    portraits.push({ file: f, name: slugToName(f), png });
  }
  console.log("portraits", portraits.length);

  // Grid: prefer ~16 columns
  const cols = 13;
  const rows = Math.ceil(portraits.length / cols);
  const gridW = cols * (CELL_W + PAD * 2 + FRAME * 2) + MARGIN * 2;
  const gridH =
    TITLE_H + rows * (CELL_H + LABEL_H + PAD * 2 + FRAME * 2) + MARGIN * 2;

  // Scale background to cover
  const bg = await sharp(BG)
    .resize(gridW, gridH, { fit: "cover", position: "centre" })
    .modulate({ brightness: 0.55, saturation: 0.85 })
    .blur(0.3)
    .png()
    .toBuffer();

  // Dark vignette overlay
  const overlaySvg = `<svg width="${gridW}" height="${gridH}" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <radialGradient id="v" cx="50%" cy="45%" r="70%">
        <stop offset="0%" stop-color="rgba(0,0,0,0.15)"/>
        <stop offset="100%" stop-color="rgba(0,0,0,0.72)"/>
      </radialGradient>
      <linearGradient id="top" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stop-color="rgba(0,0,0,0.85)"/>
        <stop offset="100%" stop-color="rgba(0,0,0,0)"/>
      </linearGradient>
    </defs>
    <rect width="100%" height="100%" fill="url(#v)"/>
    <rect width="100%" height="${TITLE_H + 20}" fill="url(#top)"/>
    <text x="50%" y="42" text-anchor="middle" font-family="Arial Black, Impact, sans-serif" font-size="36" fill="#f5d76e" stroke="#3a2a00" stroke-width="1.5" letter-spacing="4">SELECT YOUR FIGHTER</text>
    <text x="50%" y="62" text-anchor="middle" font-family="Arial" font-size="14" fill="#c8c8c8" letter-spacing="2">DECOLONIZACIYA — POST-RUSSIA LEADERS</text>
  </svg>`;

  const composites = [
    { input: await sharp(Buffer.from(overlaySvg)).png().toBuffer(), left: 0, top: 0 },
  ];

  for (let i = 0; i < portraits.length; i++) {
    const col = i % cols;
    const row = Math.floor(i / cols);
    const cellStrideX = CELL_W + PAD * 2 + FRAME * 2;
    const cellStrideY = CELL_H + LABEL_H + PAD * 2 + FRAME * 2;
    const x = MARGIN + col * cellStrideX;
    const y = TITLE_H + MARGIN + row * cellStrideY;

    // Gold frame
    const frameSvg = `<svg width="${CELL_W + FRAME * 2}" height="${CELL_H + FRAME * 2 + LABEL_H}" xmlns="http://www.w3.org/2000/svg">
      <rect x="0" y="0" width="${CELL_W + FRAME * 2}" height="${CELL_H + FRAME * 2}" fill="#1a1208" stroke="#e0b84a" stroke-width="3" rx="2"/>
      <rect x="2" y="2" width="${CELL_W + FRAME * 2 - 4}" height="${CELL_H + FRAME * 2 - 4}" fill="none" stroke="#7a5a18" stroke-width="1"/>
      <text x="50%" y="${CELL_H + FRAME * 2 + 13}" text-anchor="middle" font-family="Arial" font-size="9" fill="#f0e6c8">${escapeXml(portraits[i].name.slice(0, 18))}</text>
    </svg>`;

    composites.push({
      input: await sharp(Buffer.from(frameSvg)).png().toBuffer(),
      left: x,
      top: y,
    });
    composites.push({
      input: portraits[i].png,
      left: x + FRAME,
      top: y + FRAME,
    });
  }

  // Footer count
  const footer = `<svg width="${gridW}" height="28" xmlns="http://www.w3.org/2000/svg">
    <text x="50%" y="18" text-anchor="middle" font-family="Arial" font-size="12" fill="#aaa">${portraits.length} LEADERS — DECOLONIZACIYA</text>
  </svg>`;
  composites.push({
    input: await sharp(Buffer.from(footer)).png().toBuffer(),
    left: 0,
    top: gridH - 28,
  });

  const result = await sharp(bg)
    .composite(composites)
    .png()
    .toBuffer();

  fs.writeFileSync(OUT, result);
  fs.writeFileSync(OUT_ASSETS, result);
  console.log("Wrote", OUT, "size", result.length, "dims", gridW, "x", gridH);
})();
