/**
 * Offline generation of remaining DEC flags from historically documented designs.
 * (Used when Wikimedia rate-limits downloads.)
 */
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import sharp from 'sharp';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..');
const OUT = path.join(ROOT, 'gfx', 'flags');
const CACHE = path.join(ROOT, 'tools', '_flag_cache');

const SVGS = {
  // Green Ukraine / Zeleny Klin — blue-yellow with green hoist triangle
  ZKL: `<svg xmlns="http://www.w3.org/2000/svg" width="900" height="600" viewBox="0 0 900 600">
    <rect width="900" height="300" fill="#0057B8"/><rect y="300" width="900" height="300" fill="#FFD700"/>
    <polygon points="0,0 300,300 0,600" fill="#009639"/></svg>`,

  // Ingrian people — yellow / red / yellow with blue canton & Nordic cross
  IGR: `<svg xmlns="http://www.w3.org/2000/svg" width="900" height="550" viewBox="0 0 900 550">
    <rect width="900" height="550" fill="#F7D117"/>
    <rect y="183" width="900" height="184" fill="#D52B1E"/>
    <rect width="300" height="550" fill="#0033A0"/>
    <rect x="120" width="60" height="550" fill="#F7D117"/>
    <rect y="245" width="300" height="60" fill="#F7D117"/></svg>`,

  // Moksha — crimson / white / black with solar emblem
  MOK: `<svg xmlns="http://www.w3.org/2000/svg" width="500" height="300" viewBox="0 0 500 300">
    <rect width="500" height="100" fill="#C41E3A"/><rect y="100" width="500" height="100" fill="#FFFFFF"/>
    <rect y="200" width="500" height="100" fill="#1A1A1A"/>
    <g transform="translate(250,150)" fill="none" stroke="#C41E3A" stroke-width="10">
      <circle r="40"/><circle r="14" fill="#C41E3A" stroke="none"/>
      <path d="M0,-55 L8,-30 L0,-35 L-8,-30 Z M0,55 L8,30 L0,35 L-8,30 Z M55,0 L30,8 L35,0 L30,-8 Z M-55,0 L-30,8 L-35,0 L-30,-8 Z" fill="#C41E3A" stroke="none"/>
    </g></svg>`,

  // Erzya ethnic flag — white with red stripe & solar disc (Mastorava)
  ERZ: `<svg xmlns="http://www.w3.org/2000/svg" width="600" height="400" viewBox="0 0 600 400">
    <rect width="600" height="400" fill="#FFFFFF"/>
    <rect y="160" width="600" height="80" fill="#C8102E"/>
    <circle cx="140" cy="200" r="58" fill="none" stroke="#C8102E" stroke-width="16"/>
    <circle cx="140" cy="200" r="20" fill="#C8102E"/>
    <g fill="#C8102E">
      <rect x="132" y="110" width="16" height="40"/><rect x="132" y="250" width="16" height="40"/>
      <rect x="50" y="192" width="40" height="16"/><rect x="190" y="192" width="40" height="16"/>
    </g></svg>`,

  // Bjarmia proxy — Arkhangelsk-inspired: blue field, white/gold nordic feel
  BJA: `<svg xmlns="http://www.w3.org/2000/svg" width="900" height="600" viewBox="0 0 900 600">
    <rect width="900" height="600" fill="#0039A6"/>
    <rect y="240" width="900" height="120" fill="#FFFFFF"/>
    <circle cx="220" cy="300" r="70" fill="#FFD700" stroke="#8B0000" stroke-width="8"/>
    <path d="M220 250 L235 290 L280 290 L245 315 L258 360 L220 335 L182 360 L195 315 L160 290 L205 290 Z" fill="#8B0000"/></svg>`,

  // Ural / Yaik Cossacks — green field with yellow cross (common reconstruction)
  VYK: `<svg xmlns="http://www.w3.org/2000/svg" width="900" height="600" viewBox="0 0 900 600">
    <rect width="900" height="600" fill="#2E8B57"/>
    <rect x="380" width="140" height="600" fill="#FFD700"/>
    <rect y="230" width="900" height="140" fill="#FFD700"/>
    <circle cx="450" cy="300" r="55" fill="#2E8B57" stroke="#8B0000" stroke-width="6"/>
    <text x="450" y="315" text-anchor="middle" font-size="48" fill="#8B0000" font-family="serif">Я</text></svg>`,

  // Volga Bulgaria reconstruction — green with crescent & star (Turkic Bulgar style)
  VBG: `<svg xmlns="http://www.w3.org/2000/svg" width="1080" height="540" viewBox="0 0 1080 540">
    <rect width="1080" height="540" fill="#0A7A3E"/>
    <circle cx="400" cy="270" r="110" fill="none" stroke="#FFD700" stroke-width="28"/>
    <circle cx="430" cy="270" r="85" fill="#0A7A3E"/>
    <polygon points="560,270 585,250 610,270 585,290" fill="#FFD700"/>
    <polygon points="620,200 640,270 700,270 652,310 670,380 620,340 570,380 588,310 540,270 600,270" fill="#FFD700"/></svg>`,

  // Bulgar Confederation — Chuvash Tree of Life (official Chuvashia colours)
  BCF: `<svg xmlns="http://www.w3.org/2000/svg" width="900" height="600" viewBox="0 0 900 600">
    <rect width="900" height="600" fill="#FFCC00"/>
    <g transform="translate(450,320)" fill="#CC0000">
      <rect x="-18" y="-20" width="36" height="160"/>
      <circle cy="-80" r="55"/>
      <circle cx="-90" cy="-20" r="40"/><circle cx="90" cy="-20" r="40"/>
      <circle cx="-55" cy="-130" r="32"/><circle cx="55" cy="-130" r="32"/>
      <circle cy="-175" r="28"/>
    </g>
    <rect y="520" width="900" height="80" fill="#CC0000"/></svg>`,

  // Rhodesia 1968–79 — sky blue with Union-style canton simplified + coat stub
  RHO: `<svg xmlns="http://www.w3.org/2000/svg" width="1000" height="500" viewBox="0 0 1000 500">
    <rect width="1000" height="500" fill="#7CB9E8"/>
    <rect width="400" height="250" fill="#012169"/>
    <path d="M0,0 L400,250 M400,0 L0,250" stroke="#FFFFFF" stroke-width="40"/>
    <path d="M0,0 L400,250 M400,0 L0,250" stroke="#C8102E" stroke-width="24"/>
    <path d="M200,0 V250 M0,125 H400" stroke="#FFFFFF" stroke-width="66"/>
    <path d="M200,0 V250 M0,125 H400" stroke="#C8102E" stroke-width="40"/>
    <circle cx="700" cy="250" r="90" fill="#FFD700" stroke="#012169" stroke-width="6"/>
    <circle cx="700" cy="250" r="55" fill="#012169"/>
    <path d="M700 210 L715 245 L755 245 L725 268 L735 305 L700 285 L665 305 L675 268 L645 245 L685 245 Z" fill="#FFD700"/></svg>`,

  // South Africa 1928–1994 (Oranje-Blanje-Blou) simplified
  APT: `<svg xmlns="http://www.w3.org/2000/svg" width="900" height="600" viewBox="0 0 900 600">
    <rect width="900" height="200" fill="#FF6600"/>
    <rect y="200" width="900" height="200" fill="#FFFFFF"/>
    <rect y="400" width="900" height="200" fill="#007A4D"/>
    <rect x="40" y="230" width="160" height="100" fill="#012169"/>
    <rect x="200" y="230" width="160" height="100" fill="#FFFFFF" stroke="#C8102E" stroke-width="4"/>
    <rect x="45" y="255" width="70" height="50" fill="#FF6600"/>
    <rect x="115" y="255" width="70" height="50" fill="#FFFFFF"/>
    <rect x="45" y="255" width="140" height="16" fill="#012169"/>
    <rect x="210" y="250" width="60" height="60" fill="#007A4D"/>
    <rect x="280" y="250" width="60" height="60" fill="#FFD700"/></svg>`,

  // India / Bharat
  BHA: `<svg xmlns="http://www.w3.org/2000/svg" width="900" height="600" viewBox="0 0 900 600">
    <rect width="900" height="200" fill="#FF9933"/>
    <rect y="200" width="900" height="200" fill="#FFFFFF"/>
    <rect y="400" width="900" height="200" fill="#138808"/>
    <circle cx="450" cy="300" r="60" fill="none" stroke="#000080" stroke-width="8"/>
    <g stroke="#000080" stroke-width="3" transform="translate(450,300)">
      ${Array.from({ length: 24 }, (_, i) => {
        const a = (i * Math.PI) / 12;
        return `<line x1="0" y1="0" x2="${Math.cos(a) * 55}" y2="${Math.sin(a) * 55}"/>`;
      }).join('')}
      <circle r="10" fill="#000080" stroke="none"/>
    </g></svg>`,

  // Wiphala / Abya Yala
  ABY: `<svg xmlns="http://www.w3.org/2000/svg" width="700" height="700" viewBox="0 0 700 700">${(() => {
    const c = ['#FFD100', '#FF6B00', '#E31C23', '#8B008B', '#0033A0', '#007A3D', '#FFFFFF'];
    let s = '';
    for (let r = 0; r < 7; r++) for (let col = 0; col < 7; col++) {
      s += `<rect x="${col * 100}" y="${r * 100}" width="100" height="100" fill="${c[(r + col) % 7]}"/>`;
    }
    return s;
  })()}</svg>`,

  // UNIA / Black Brotherhood — red black green
  CBN: `<svg xmlns="http://www.w3.org/2000/svg" width="900" height="600" viewBox="0 0 900 600">
    <rect width="900" height="200" fill="#E31C23"/>
    <rect y="200" width="900" height="200" fill="#000000"/>
    <rect y="400" width="900" height="200" fill="#007A3D"/></svg>`,

  // Asian Sphere — Rising Sun (16 rays)
  ASN: `<svg xmlns="http://www.w3.org/2000/svg" width="900" height="600" viewBox="0 0 900 600">
    <rect width="900" height="600" fill="#FFFFFF"/>
    <g transform="translate(450,300)">
      ${Array.from({ length: 16 }, (_, i) => {
        const a = (i * Math.PI) / 8 - Math.PI / 2;
        const a0 = a - Math.PI / 32;
        const a1 = a + Math.PI / 32;
        return `<path d="M0,0 L${Math.cos(a0) * 420},${Math.sin(a0) * 420} L${Math.cos(a1) * 420},${Math.sin(a1) * 420} Z" fill="#BC002D"/>`;
      }).join('')}
      <circle r="70" fill="#BC002D"/>
    </g></svg>`,

  // World Caliphate — Black Standard (plain black; shahada unreadable at HOI4 size)
  KHF: `<svg xmlns="http://www.w3.org/2000/svg" width="900" height="600" viewBox="0 0 900 600">
    <rect width="900" height="600" fill="#0A0A0A"/>
    <rect x="60" y="200" width="780" height="20" fill="#F5F5F5"/>
    <rect x="60" y="280" width="780" height="20" fill="#F5F5F5"/>
    <rect x="60" y="360" width="520" height="20" fill="#F5F5F5"/>
    <circle cx="720" cy="370" r="55" fill="none" stroke="#F5F5F5" stroke-width="12"/>
    <circle cx="745" cy="370" r="40" fill="#0A0A0A"/>
    <polygon points="780,370 800,355 820,370 800,385" fill="#F5F5F5"/></svg>`,

  // Riyadus Salikhin — Ichkeria (green / red / white / green + wolf motif stub)
  RYS: `<svg xmlns="http://www.w3.org/2000/svg" width="1100" height="700" viewBox="0 0 1100 700">
    <rect width="1100" height="700" fill="#009639"/>
    <rect y="140" width="1100" height="70" fill="#FFFFFF"/>
    <rect y="210" width="1100" height="70" fill="#C8102E"/>
    <rect y="280" width="1100" height="70" fill="#FFFFFF"/>
    <g transform="translate(550,480)" fill="#FFD700">
      <ellipse rx="90" ry="50"/>
      <circle cx="-70" cy="-30" r="28"/><circle cx="70" cy="-30" r="28"/>
      <rect x="-15" y="-80" width="30" height="50"/>
    </g></svg>`,

  // White Brotherhood — Russian naval jack (St Andrew)
  WBR: `<svg xmlns="http://www.w3.org/2000/svg" width="600" height="600" viewBox="0 0 600 600">
    <rect width="600" height="600" fill="#FFFFFF"/>
    <path d="M0,0 L600,600 M600,0 L0,600" stroke="#0039A6" stroke-width="90"/></svg>`,
};

const SIZES = [
  { dir: '', w: 82, h: 52 },
  { dir: 'medium', w: 41, h: 26 },
  { dir: 'small', w: 10, h: 7 },
];

function writeTga(filePath, width, height, rgba) {
  const header = Buffer.alloc(18);
  header[2] = 2;
  header.writeUInt16LE(width, 12);
  header.writeUInt16LE(height, 14);
  header[16] = 32;
  header[17] = 8;
  const pixels = Buffer.alloc(width * height * 4);
  for (let y = 0; y < height; y++) {
    const srcY = height - 1 - y;
    for (let x = 0; x < width; x++) {
      const si = (srcY * width + x) * 4;
      const di = (y * width + x) * 4;
      pixels[di] = rgba[si + 2];
      pixels[di + 1] = rgba[si + 1];
      pixels[di + 2] = rgba[si];
      pixels[di + 3] = rgba[si + 3];
    }
  }
  fs.writeFileSync(filePath, Buffer.concat([header, pixels]));
}

async function convertTag(tag, srcPath) {
  for (const { dir, w, h } of SIZES) {
    const outDir = dir ? path.join(OUT, dir) : OUT;
    fs.mkdirSync(outDir, { recursive: true });
    const { data, info } = await sharp(srcPath, { density: 300 })
      .ensureAlpha()
      .resize(w, h, { fit: 'fill', kernel: sharp.kernel.lanczos3 })
      .raw()
      .toBuffer({ resolveWithObject: true });
    if (info.channels !== 4) throw new Error(`${tag}: channels=${info.channels}`);
    writeTga(path.join(outDir, `${tag}.tga`), w, h, data);
  }
}

async function main() {
  fs.mkdirSync(CACHE, { recursive: true });
  const tags = Object.keys(SVGS);
  for (const tag of tags) {
    if (fs.existsSync(path.join(OUT, `${tag}.tga`))) {
      console.log(`skip ${tag}`);
      continue;
    }
    const svgPath = path.join(CACHE, `${tag}_gen.svg`);
    fs.writeFileSync(svgPath, SVGS[tag], 'utf8');
    await convertTag(tag, svgPath);
    console.log(`OK ${tag}`);
  }
  const need = [
    'VBG','CIR','BGR','SMO','VOR','VYK','IGR','LAP','BJA','MOK','ERZ','NOG','SEV','BLK','KBC','OSA','CAU','BCF','IDL','ZKL','APT','RHO','KHF','WBR','CBN','ABY','ASN','BHA','RYS',
  ];
  const missing = need.filter((t) => !fs.existsSync(path.join(OUT, `${t}.tga`)));
  console.log(missing.length ? `MISSING: ${missing.join(', ')}` : 'All 29 country tags have large TGA.');
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
