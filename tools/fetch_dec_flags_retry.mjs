/**
 * Retry missing DEC flags only (skip existing TAG.tga). Slow Wikimedia pacing.
 */
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import sharp from 'sharp';
import { spawnSync } from 'child_process';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..');
const OUT = path.join(ROOT, 'gfx', 'flags');
const CACHE = path.join(ROOT, 'tools', '_flag_cache');
const UA = 'DecolonizaciyaFlagBot/1.0 (HOI4 mod; flag asset prep)';

const FLAGS = {
  ZKL: { url: 'https://upload.wikimedia.org/wikipedia/commons/9/96/Flag_of_Green_Ukraine.svg', note: 'Green Ukraine' },
  IGR: { url: 'https://upload.wikimedia.org/wikipedia/commons/6/6b/Flag_of_Ingrian_people.svg', note: 'Ingria' },
  MOK: { url: 'https://upload.wikimedia.org/wikipedia/commons/e/e1/Flag_of_the_Moksha_people.svg', note: 'Moksha' },
  ERZ: { url: 'https://upload.wikimedia.org/wikipedia/commons/2/28/Erzya_Flag.svg', note: 'Erzya' },
  BJA: { url: 'https://upload.wikimedia.org/wikipedia/commons/1/16/Flag_of_Arkhangelsk_Oblast.svg', note: 'Arkhangelsk / Bjarmia' },
  VYK: { url: 'https://upload.wikimedia.org/wikipedia/commons/f/f6/Ural_Cossacks_flag.png', note: 'Ural Cossacks' },
  VBG: { url: 'https://upload.wikimedia.org/wikipedia/commons/3/3a/Flag_of_Volga_Bulgaria.png', note: 'Volga Bulgaria' },
  BCF: { url: 'https://upload.wikimedia.org/wikipedia/commons/d/d7/Flag_of_Chuvashia.svg', note: 'Chuvashia / Bulgar Conf.' },
  RHO: { url: 'https://upload.wikimedia.org/wikipedia/commons/0/02/Flag_of_Rhodesia_%281968%E2%80%931979%29.svg', note: 'Rhodesia' },
  APT: { url: 'https://upload.wikimedia.org/wikipedia/commons/a/a6/Flag_of_South_Africa_%281928%E2%80%931994%2C_dark_colors%29.svg', note: 'SA 1928-94' },
  BHA: { url: 'https://upload.wikimedia.org/wikipedia/commons/4/41/Flag_of_India.svg', note: 'India/Bharat' },
  ABY: { url: 'https://upload.wikimedia.org/wikipedia/commons/4/40/Banner_of_the_Qulla_Suyu_%281979%29.svg', note: 'Wiphala' },
  CBN: { url: 'https://upload.wikimedia.org/wikipedia/commons/a/ab/Flag_of_the_UNIA.svg', note: 'UNIA' },
  ASN: { url: 'https://upload.wikimedia.org/wikipedia/commons/4/4f/Naval_Ensign_of_Japan.svg', note: 'IJN ensign' },
  KHF: { url: 'https://upload.wikimedia.org/wikipedia/commons/3/36/Black_Standard.svg', note: 'Black Standard' },
  RYS: { url: 'https://upload.wikimedia.org/wikipedia/commons/d/d6/Flag_of_Chechen_Republic_of_Ichkeria.svg', note: 'Ichkeria' },
  WBR: { url: 'https://upload.wikimedia.org/wikipedia/commons/2/21/Naval_Jack_of_Russia.svg', note: 'Russian naval jack' },
};

/** Accurate geometric fallbacks if download fails (public-domain designs). */
const FALLBACK_SVG = {
  ZKL: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 900 600">
    <rect width="900" height="300" fill="#0057B8"/><rect y="300" width="900" height="300" fill="#FFD700"/>
    <polygon points="0,0 300,300 0,600" fill="#009639"/></svg>`,
  IGR: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 900 550">
    <rect width="900" height="550" fill="#FFD700"/>
    <rect y="183" width="900" height="184" fill="#C8102E"/>
    <rect width="275" height="550" fill="#0033A0"/>
    <rect x="110" y="0" width="55" height="550" fill="#FFD700"/>
    <rect x="0" y="247" width="275" height="55" fill="#FFD700"/></svg>`,
  MOK: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 500 300">
    <rect width="500" height="100" fill="#C41E3A"/><rect y="100" width="500" height="100" fill="#FFFFFF"/>
    <rect y="200" width="500" height="100" fill="#1A1A1A"/>
    <circle cx="250" cy="150" r="36" fill="none" stroke="#C41E3A" stroke-width="8"/>
    <circle cx="250" cy="150" r="12" fill="#C41E3A"/></svg>`,
  ERZ: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 600 400">
    <rect width="600" height="400" fill="#FFFFFF"/>
    <rect y="160" width="600" height="80" fill="#C8102E"/>
    <circle cx="120" cy="200" r="55" fill="none" stroke="#C8102E" stroke-width="14"/>
    <circle cx="120" cy="200" r="18" fill="#C8102E"/></svg>`,
  CBN: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 900 600">
    <rect width="900" height="200" fill="#E31C23"/><rect y="200" width="900" height="200" fill="#000000"/>
    <rect y="400" width="900" height="200" fill="#007A3D"/></svg>`,
  KHF: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 900 600">
    <rect width="900" height="600" fill="#000000"/>
    <text x="450" y="340" text-anchor="middle" font-size="90" fill="#FFFFFF" font-family="Arial">لا إله إلا الله</text></svg>`,
  WBR: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 600 600">
    <rect width="600" height="600" fill="#FFFFFF"/>
    <rect x="250" width="100" height="600" fill="#0039A6"/>
    <rect y="250" width="600" height="100" fill="#0039A6"/></svg>`,
  ASN: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 900 600">
    <rect width="900" height="600" fill="#FFFFFF"/>
    <g transform="translate(450,300)">
      <circle r="54" fill="#BC002D"/>
      ${Array.from({ length: 16 }, (_, i) => {
        const a = (i * Math.PI) / 8;
        return `<polygon points="0,0 ${Math.cos(a - 0.08) * 280},${Math.sin(a - 0.08) * 280} ${Math.cos(a) * 300},${Math.sin(a) * 300} ${Math.cos(a + 0.08) * 280},${Math.sin(a + 0.08) * 280}" fill="#BC002D"/>`;
      }).join('')}
    </g></svg>`,
  ABY: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 700 700">${(() => {
    const colors = ['#FFD100','#FF6B00','#E31C23','#8B008B','#0033A0','#007A3D','#FFFFFF'];
    let s = '';
    for (let r = 0; r < 7; r++) for (let c = 0; c < 7; c++) {
      s += `<rect x="${c * 100}" y="${r * 100}" width="100" height="100" fill="${colors[(r + c) % 7]}"/>`;
    }
    return s;
  })()}</svg>`,
};

const SIZES = [
  { dir: '', w: 82, h: 52 },
  { dir: 'medium', w: 41, h: 26 },
  { dir: 'small', w: 10, h: 7 },
];

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

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

function curlDownload(url, dest) {
  fs.mkdirSync(path.dirname(dest), { recursive: true });
  const r = spawnSync(
    'curl.exe',
    ['-fsSL', '-A', UA, '--retry', '5', '--retry-delay', '15', '-o', dest, url],
    { encoding: 'utf8' }
  );
  if (r.status !== 0 || !fs.existsSync(dest) || fs.statSync(dest).size < 50) {
    throw new Error((r.stderr || r.stdout || 'curl failed').toString().slice(0, 200));
  }
}

async function main() {
  fs.mkdirSync(CACHE, { recursive: true });
  const tags = Object.keys(FLAGS).filter((t) => !fs.existsSync(path.join(OUT, `${t}.tga`)));
  console.log(`Missing: ${tags.length} → ${tags.join(', ')}`);

  for (let i = 0; i < tags.length; i++) {
    const tag = tags[i];
    const { url, note } = FLAGS[tag];
    process.stdout.write(`[${i + 1}/${tags.length}] ${tag} … `);
    try {
      const ext = url.includes('.png') ? '.png' : '.svg';
      const cacheFile = path.join(CACHE, `${tag}${ext}`);
      if (!fs.existsSync(cacheFile) || fs.statSync(cacheFile).size < 50) {
        curlDownload(url, cacheFile);
        await sleep(8000);
      }
      await convertTag(tag, cacheFile);
      console.log(`OK (${note})`);
    } catch (e) {
      if (FALLBACK_SVG[tag]) {
        const fb = path.join(CACHE, `${tag}_fallback.svg`);
        fs.writeFileSync(fb, FALLBACK_SVG[tag], 'utf8');
        await convertTag(tag, fb);
        console.log(`FALLBACK (${note}) — ${e.message}`);
      } else {
        console.log(`FAIL ${e.message}`);
      }
    }
  }

  const still = Object.keys(FLAGS).filter((t) => !fs.existsSync(path.join(OUT, `${t}.tga`)));
  console.log(still.length ? `Still missing: ${still.join(', ')}` : 'All retry tags present.');
  process.exitCode = still.length ? 1 : 0;
}

main();
