/**
 * Fetch TFR-inspired CHE leaders: Rashid Temrezov, Apti Alaudinov → 160x210 DDS.
 */
const fs = require("fs");
const path = require("path");
const https = require("https");
const http = require("http");
const sharp = require("sharp");

const OUT = path.join(__dirname, "..", "gfx", "leaders", "DEC");
const UA = "DecolonizaciyaMod/1.0 (portraits for HOI4 mod)";

const PEOPLE = [
  {
    file: "rashid_temrezov.dds",
    // Wikipedia pageimage is mis-cropped Matovnikov; use Commons portrait file.
    commons: "Temrezov portret.jpeg",
  },
  {
    file: "apti_alaudinov.dds",
    wiki: [
      ["en", "Apti Alaudinov"],
      ["ru", "Алаудинов, Апти Аронович"],
    ],
  },
];

function fetchBuf(url, redirects = 0) {
  return new Promise((resolve, reject) => {
    if (!url || redirects > 6) return reject(new Error("bad url"));
    const lib = url.startsWith("https") ? https : http;
    const req = lib.get(
      url,
      { headers: { "User-Agent": UA, Accept: "*/*" }, timeout: 25000 },
      (res) => {
        if ([301, 302, 303, 307, 308].includes(res.statusCode) && res.headers.location) {
          const next = new URL(res.headers.location, url).toString();
          res.resume();
          return resolve(fetchBuf(next, redirects + 1));
        }
        if (res.statusCode !== 200) {
          res.resume();
          return reject(new Error(`HTTP ${res.statusCode}`));
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

async function fetchJson(url) {
  return JSON.parse((await fetchBuf(url)).toString("utf8"));
}

async function pageImage(lang, title) {
  const api =
    `https://${lang}.wikipedia.org/w/api.php?action=query&format=json&prop=pageimages&piprop=thumbnail|original&pithumbsize=800&redirects=1&titles=` +
    encodeURIComponent(title);
  const j = await fetchJson(api);
  const pages = j.query && j.query.pages;
  if (!pages) return null;
  const page = Object.values(pages)[0];
  if (!page || page.missing != null) return null;
  if (page.original && page.original.source) return page.original.source;
  if (page.thumbnail && page.thumbnail.source) return page.thumbnail.source;
  return null;
}

function writeUncompressedDDS(bgra, width, height, outPath) {
  const header = Buffer.alloc(128);
  header.write("DDS ", 0);
  header.writeUInt32LE(124, 4);
  header.writeUInt32LE(0x1 | 0x2 | 0x4 | 0x1000 | 0x8, 8);
  header.writeUInt32LE(height, 12);
  header.writeUInt32LE(width, 16);
  header.writeUInt32LE(width * 4, 20);
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
  writeUncompressedDDS(bgra, info.width, info.height, outPath);
}

async function main() {
  fs.mkdirSync(OUT, { recursive: true });
  for (const p of PEOPLE) {
    const outPath = path.join(OUT, p.file);
    let ok = false;
    if (p.commons) {
      try {
        const url =
          "https://commons.wikimedia.org/wiki/Special:FilePath/" +
          encodeURIComponent(p.commons) +
          "?width=800";
        const buf = await fetchBuf(url);
        if (buf.length > 2000) {
          await toPortraitDDS(buf, outPath);
          console.log(`OK ${p.file} from commons: ${p.commons}`);
          ok = true;
        }
      } catch (e) {
        console.log(`fail commons ${p.commons}: ${e.message}`);
      }
    }
    for (const [lang, title] of p.wiki || []) {
      if (ok) break;
      try {
        const url = await pageImage(lang, title);
        if (!url) {
          console.log(`no image ${lang}/${title}`);
          continue;
        }
        const buf = await fetchBuf(url);
        if (buf.length < 2000) continue;
        await toPortraitDDS(buf, outPath);
        console.log(`OK ${p.file} from ${lang}: ${url}`);
        ok = true;
        break;
      } catch (e) {
        console.log(`fail ${lang}/${title}: ${e.message}`);
      }
    }
    if (!ok) console.error(`FAILED ${p.file}`);
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
