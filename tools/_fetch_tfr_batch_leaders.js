/**
 * Fetch TFR-recommended DEC leaders → 160x210 DDS portraits.
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
    file: "victor_vorobyov.dds",
    wiki: [
      ["en", "Victor Vorobyov"],
      ["ru", "Воробьёв, Виктор Викторович"],
    ],
  },
  {
    file: "yunir_kutluguzhin.dds",
    wiki: [
      ["ru", "Кутлугужин, Юнир"],
      ["ru", "Кутлугужин"],
    ],
    search: "Юнир Кутлугужин",
  },
  {
    file: "vladimir_baymetov.dds",
    wiki: [["ru", "Байметов, Владимир"]],
    search: "Владимир Байметов Удмурт",
  },
  {
    file: "igor_kudryavtsev.dds",
    wiki: [["ru", "Кудрявцев, Игорь"]],
    search: "Игорь Кудрявцев Марий Ушем",
  },
  {
    file: "sergey_levchenko.dds",
    wiki: [
      ["en", "Sergey Levchenko"],
      ["ru", "Левченко, Сергей Георгиевич"],
    ],
  },
  {
    file: "nikolai_starikov.dds",
    wiki: [
      ["en", "Nikolai Starikov"],
      ["ru", "Стариков, Николай Викторович"],
    ],
  },
  {
    file: "maksim_katz.dds",
    wiki: [
      ["en", "Maxim Katz"],
      ["ru", "Кац, Максим Евгеньевич"],
    ],
  },
  {
    file: "nikolay_bondarenko.dds",
    wiki: [
      ["en", "Nikolay Bondarenko"],
      ["ru", "Бондаренко, Николай Николаевич"],
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

async function commonsSearch(query) {
  const url =
    "https://commons.wikimedia.org/w/api.php?action=query&list=search&srnamespace=6&srlimit=10&format=json&srsearch=" +
    encodeURIComponent(query);
  const j = await fetchJson(url);
  for (const h of (j.query && j.query.search) || []) {
    if (/\.(webm|opus|svg|png)$/i.test(h.title) && !/\.(jpe?g|png)$/i.test(h.title)) continue;
    if (!/\.(jpe?g|png|webp)$/i.test(h.title)) continue;
    try {
      const fileUrl =
        "https://commons.wikimedia.org/wiki/Special:FilePath/" +
        encodeURIComponent(h.title.replace(/^File:/, "").replace(/^Файл:/, "")) +
        "?width=800";
      const buf = await fetchBuf(fileUrl);
      if (buf.length > 3000) return { buf, title: h.title };
    } catch (_) {}
  }
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

async function makePlaceholder(name, outPath) {
  const initials = name
    .split(/[_\s.]+/)
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
</svg>`;
  await toPortraitDDS(await sharp(Buffer.from(svg)).png().toBuffer(), outPath);
}

async function main() {
  fs.mkdirSync(OUT, { recursive: true });
  for (const p of PEOPLE) {
    const outPath = path.join(OUT, p.file);
    let ok = false;
    for (const [lang, title] of p.wiki || []) {
      try {
        const url = await pageImage(lang, title);
        if (!url) continue;
        const buf = await fetchBuf(url);
        if (buf.length < 2000) continue;
        await toPortraitDDS(buf, outPath);
        console.log(`OK ${p.file} wiki ${lang}/${title}`);
        ok = true;
        break;
      } catch (e) {
        console.log(`fail wiki ${lang}/${title}: ${e.message}`);
      }
    }
    if (!ok && p.search) {
      try {
        const hit = await commonsSearch(p.search);
        if (hit) {
          await toPortraitDDS(hit.buf, outPath);
          console.log(`OK ${p.file} commons ${hit.title}`);
          ok = true;
        }
      } catch (e) {
        console.log(`fail commons ${p.search}: ${e.message}`);
      }
    }
    if (!ok) {
      await makePlaceholder(p.file.replace(".dds", ""), outPath);
      console.log(`PLACEHOLDER ${p.file}`);
    }
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
