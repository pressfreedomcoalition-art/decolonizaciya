/**
 * Download historically appropriate flags (Wikimedia Commons) and convert
 * to HOI4 TGA: large 82x52, medium 41x26, small 10x7 (32-bit BGRA).
 */
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import sharp from 'sharp';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..');
const OUT = path.join(ROOT, 'gfx', 'flags');
const CACHE = path.join(ROOT, 'tools', '_flag_cache');
const UA = 'DecolonizaciyaFlagBot/1.0 (HOI4 mod asset prep; contact: local maintainer)';

/** tag -> { file, note, url? } — url skips API when known */
const FLAGS = {
  CIR: {
    file: 'Circassian_flag.svg',
    note: 'Circassian national flag (stars & arrows)',
    url: 'https://upload.wikimedia.org/wikipedia/commons/5/5a/Circassian_flag.svg',
  },
  IDL: {
    file: 'Flag_of_Idel-Ural_State.svg',
    note: 'Idel-Ural State 1918',
    url: 'https://upload.wikimedia.org/wikipedia/commons/f/f4/Flag_of_Idel-Ural_State.svg',
  },
  ZKL: {
    file: 'Flag_of_Green_Ukraine.svg',
    note: 'Green Ukraine / Zeleny Klin',
    url: 'https://upload.wikimedia.org/wikipedia/commons/9/96/Flag_of_Green_Ukraine.svg',
  },
  IGR: {
    file: 'Flag_of_Ingrian_people.svg',
    note: 'Ingrian Finns',
    url: 'https://upload.wikimedia.org/wikipedia/commons/6/6b/Flag_of_Ingrian_people.svg',
  },
  LAP: {
    file: 'Sami_flag.svg',
    note: 'Sámi flag (Lapland)',
    url: 'https://upload.wikimedia.org/wikipedia/commons/1/1b/Sami_flag.svg',
  },
  MOK: {
    file: 'Flag_of_the_Moksha_people.svg',
    note: 'Moksha people',
    url: 'https://upload.wikimedia.org/wikipedia/commons/e/e1/Flag_of_the_Moksha_people.svg',
  },
  ERZ: {
    file: 'Erzya_Flag.svg',
    note: 'Erzya ethnic flag',
    url: 'https://upload.wikimedia.org/wikipedia/commons/2/28/Erzya_Flag.svg',
  },
  NOG: {
    file: 'Nogai_flag.svg',
    note: 'Nogai people',
    url: 'https://upload.wikimedia.org/wikipedia/commons/a/af/Nogai_flag.svg',
  },
  KBC: {
    file: "Flag_of_Kuban_People's_Republic.svg",
    note: "Kuban People's Republic 1918–20",
    url: 'https://upload.wikimedia.org/wikipedia/commons/d/da/Flag_of_Kuban_People%27s_Republic.svg',
  },
  CAU: {
    file: 'Flag_of_the_Mountain_Republic.svg',
    note: 'Mountain Republic (N. Caucasus)',
    url: 'https://upload.wikimedia.org/wikipedia/commons/e/e6/Flag_of_the_Mountain_Republic.svg',
  },
  OSA: {
    file: 'Flag_of_North_Ossetia.svg',
    note: 'North Ossetia–Alania',
    url: 'https://upload.wikimedia.org/wikipedia/commons/1/1c/Flag_of_North_Ossetia.svg',
  },
  BLK: {
    file: 'Flag_of_Kabardino-Balkaria.svg',
    note: 'Kabardino-Balkaria (Alans/Balkars)',
    url: 'https://upload.wikimedia.org/wikipedia/commons/d/d8/Flag_of_Kabardino-Balkaria.svg',
  },
  BGR: {
    file: 'Flag_of_Belgorod_Oblast.svg',
    note: 'Belgorod Oblast',
    url: 'https://upload.wikimedia.org/wikipedia/commons/2/2b/Flag_of_Belgorod_Oblast.svg',
  },
  SMO: {
    file: 'Flag_of_Smolensk_Oblast.svg',
    note: 'Smolensk Oblast',
    url: 'https://upload.wikimedia.org/wikipedia/commons/f/fa/Flag_of_Smolensk_Oblast.svg',
  },
  VOR: {
    file: 'Flag_of_Voronezh_Oblast.svg',
    note: 'Voronezh Oblast',
    url: 'https://upload.wikimedia.org/wikipedia/commons/6/64/Flag_of_Voronezh_Oblast.svg',
  },
  SEV: {
    file: 'Flag_of_Chernihiv_Oblast.svg',
    note: 'Chernihiv Oblast (Severia heartland)',
    url: 'https://upload.wikimedia.org/wikipedia/commons/f/f7/Flag_of_Chernihiv_Oblast.svg',
  },
  BJA: {
    file: 'Flag_of_Arkhangelsk_Oblast.svg',
    note: 'Arkhangelsk Oblast (Bjarmia proxy)',
    url: 'https://upload.wikimedia.org/wikipedia/commons/1/16/Flag_of_Arkhangelsk_Oblast.svg',
  },
  VYK: {
    file: 'Ural_Cossacks_flag.png',
    note: 'Ural / Yaik Cossacks',
    url: 'https://upload.wikimedia.org/wikipedia/commons/f/f6/Ural_Cossacks_flag.png',
  },
  VBG: {
    file: 'Flag_of_Volga_Bulgaria.png',
    note: 'Volga Bulgaria (reconstructed / speculative)',
    url: 'https://upload.wikimedia.org/wikipedia/commons/3/3a/Flag_of_Volga_Bulgaria.png',
  },
  BCF: {
    file: 'Flag_of_Chuvashia.svg',
    note: 'Chuvashia (Volga Bulgar cultural heir)',
    url: 'https://upload.wikimedia.org/wikipedia/commons/d/d7/Flag_of_Chuvashia.svg',
  },
  RHO: {
    file: 'Flag_of_Rhodesia_(1968–1979).svg',
    note: 'Rhodesia 1968–1979',
    url: 'https://upload.wikimedia.org/wikipedia/commons/0/02/Flag_of_Rhodesia_%281968%E2%80%931979%29.svg',
  },
  APT: {
    file: 'Flag_of_South_Africa_(1928–1994,_dark_colors).svg',
    note: 'South Africa 1928–1994',
    url: 'https://upload.wikimedia.org/wikipedia/commons/a/a6/Flag_of_South_Africa_%281928%E2%80%931994%2C_dark_colors%29.svg',
  },
  BHA: {
    file: 'Flag_of_India.svg',
    note: 'India / Bharat',
    url: 'https://upload.wikimedia.org/wikipedia/commons/4/41/Flag_of_India.svg',
  },
  ABY: {
    file: 'Banner_of_the_Qulla_Suyu_(1979).svg',
    note: 'Wiphala / Qulla Suyu (Abya Yala)',
    url: 'https://upload.wikimedia.org/wikipedia/commons/4/40/Banner_of_the_Qulla_Suyu_%281979%29.svg',
  },
  CBN: {
    file: 'Flag_of_the_UNIA.svg',
    note: 'UNIA / Pan-African (Marcus Garvey)',
    url: 'https://upload.wikimedia.org/wikipedia/commons/a/ab/Flag_of_the_UNIA.svg',
  },
  ASN: {
    file: 'Naval_Ensign_of_Japan.svg',
    note: 'IJN rising sun (Asian Sphere proxy)',
    url: 'https://upload.wikimedia.org/wikipedia/commons/4/4f/Naval_Ensign_of_Japan.svg',
  },
  KHF: {
    file: 'Black_Standard.svg',
    note: 'Black Standard (Caliphate)',
    url: 'https://upload.wikimedia.org/wikipedia/commons/3/36/Black_Standard.svg',
  },
  RYS: {
    file: 'Flag_of_Chechen_Republic_of_Ichkeria.svg',
    note: 'Ichkeria (Chechen jihadist milieu proxy)',
    url: 'https://upload.wikimedia.org/wikipedia/commons/d/d6/Flag_of_Chechen_Republic_of_Ichkeria.svg',
  },
  WBR: {
    file: 'Naval_Jack_of_Russia.svg',
    note: 'Russian naval jack (White movement era)',
    url: 'https://upload.wikimedia.org/wikipedia/commons/2/21/Naval_Jack_of_Russia.svg',
  },
};

const SIZES = [
  { dir: '', w: 82, h: 52 },
  { dir: 'medium', w: 41, h: 26 },
  { dir: 'small', w: 10, h: 7 },
];

function sleep(ms) {
  return new Promise((r) => setTimeout(r, ms));
}

function writeTga(filePath, width, height, rgba) {
  // Uncompressed true-color TGA, 32-bit, bottom-left origin (descriptor 8 = 8 alpha bits)
  const header = Buffer.alloc(18);
  header[2] = 2; // image type
  header.writeUInt16LE(width, 12);
  header.writeUInt16LE(height, 14);
  header[16] = 32;
  header[17] = 8;

  const pixels = Buffer.alloc(width * height * 4);
  // rgba is top-left row-major; TGA bottom-left → flip Y, RGB→BGR
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

async function resolveUrl(commonsFile) {
  const title = 'File:' + decodeURIComponent(commonsFile).replace(/_/g, ' ');
  const api =
    'https://commons.wikimedia.org/w/api.php?action=query&titles=' +
    encodeURIComponent(title) +
    '&prop=imageinfo&iiprop=url|mime|size&format=json';
  let lastErr;
  for (let attempt = 0; attempt < 6; attempt++) {
    const res = await fetch(api, { headers: { 'User-Agent': UA } });
    if (res.status === 429) {
      const wait = 5000 * (attempt + 1);
      await sleep(wait);
      lastErr = new Error(`API 429 for ${title}`);
      continue;
    }
    if (!res.ok) throw new Error(`API ${res.status} for ${title}`);
    const data = await res.json();
    const page = Object.values(data.query.pages)[0];
    if (!page || page.missing || !page.imageinfo) {
      throw new Error(`Missing on Commons: ${title}`);
    }
    // Original file (SVG/PNG). sharp rasters SVG.
    return { url: page.imageinfo[0].url.split('?')[0], mime: page.imageinfo[0].mime };
  }
  throw lastErr || new Error(`API failed for ${title}`);
}

async function download(url, dest) {
  if (fs.existsSync(dest) && fs.statSync(dest).size > 100) return dest;
  let lastErr;
  for (let attempt = 0; attempt < 5; attempt++) {
    const res = await fetch(url, { headers: { 'User-Agent': UA, Accept: 'image/*,*/*' } });
    if (res.status === 429) {
      await sleep(5000 * (attempt + 1));
      lastErr = new Error(`Download 429: ${url}`);
      continue;
    }
    if (!res.ok) throw new Error(`Download ${res.status}: ${url}`);
    const buf = Buffer.from(await res.arrayBuffer());
    fs.writeFileSync(dest, buf);
    return dest;
  }
  throw lastErr || new Error(`Download failed: ${url}`);
}

async function convertTag(tag, srcPath) {
  const img = sharp(srcPath, { density: 300 }).ensureAlpha();
  const meta = await img.metadata();
  for (const { dir, w, h } of SIZES) {
    const outDir = dir ? path.join(OUT, dir) : OUT;
    fs.mkdirSync(outDir, { recursive: true });
    const outFile = path.join(outDir, `${tag}.tga`);
    // Fit flag into HOI4 ratio without heavy crop; pad with edge/near-black if needed
    const { data, info } = await sharp(srcPath, { density: 300 })
      .ensureAlpha()
      .resize(w, h, {
        fit: 'fill',
        kernel: sharp.kernel.lanczos3,
      })
      .raw()
      .toBuffer({ resolveWithObject: true });
    if (info.channels !== 4) {
      throw new Error(`${tag}: expected 4 channels, got ${info.channels}`);
    }
    writeTga(outFile, w, h, data);
  }
  return { w: meta.width, h: meta.height };
}

async function main() {
  fs.mkdirSync(CACHE, { recursive: true });
  fs.mkdirSync(OUT, { recursive: true });
  fs.mkdirSync(path.join(OUT, 'medium'), { recursive: true });
  fs.mkdirSync(path.join(OUT, 'small'), { recursive: true });

  const report = [];
  const tags = Object.keys(FLAGS);
  for (let i = 0; i < tags.length; i++) {
    const tag = tags[i];
    const { file, note, url: knownUrl } = FLAGS[tag];
    process.stdout.write(`[${i + 1}/${tags.length}] ${tag} … `);
    try {
      let url = knownUrl;
      let mime = knownUrl?.endsWith('.png') ? 'image/png' : 'image/svg+xml';
      if (!url) {
        ({ url, mime } = await resolveUrl(file));
        await sleep(1200);
      }
      const ext = mime === 'image/svg+xml' ? '.svg' : path.extname(url.split('?')[0]) || '.bin';
      const cacheFile = path.join(CACHE, `${tag}${ext}`);
      await download(url, cacheFile);
      await sleep(600);
      await convertTag(tag, cacheFile);
      console.log(`OK  (${note})`);
      report.push({ tag, ok: true, note, file, url });
    } catch (e) {
      console.log(`FAIL  ${e.message}`);
      report.push({ tag, ok: false, note, file, error: e.message });
    }
  }

  const ok = report.filter((r) => r.ok).length;
  const fail = report.filter((r) => !r.ok);
  const manifest = path.join(OUT, 'DEC_FLAGS_SOURCES.txt');
  const lines = [
    'DEC country flags — sources (Wikimedia Commons)',
    `Generated: ${new Date().toISOString()}`,
    `OK: ${ok} / ${report.length}`,
    '',
    ...report.map((r) =>
      r.ok
        ? `${r.tag}\tOK\t${r.file}\t${r.note}`
        : `${r.tag}\tFAIL\t${r.file}\t${r.error}`
    ),
    '',
  ];
  fs.writeFileSync(manifest, lines.join('\n'), 'utf8');
  console.log(`\nDone: ${ok} ok, ${fail.length} fail. Manifest: ${manifest}`);
  if (fail.length) process.exitCode = 1;
}

main();
