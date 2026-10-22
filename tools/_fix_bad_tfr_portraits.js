const fs = require("fs");
const path = require("path");
const https = require("https");
const http = require("http");
const sharp = require("sharp");

const OUT = path.join(__dirname, "..", "gfx", "leaders", "DEC");
const UA = "DecolonizaciyaMod/1.0 (portraits)";

function fetchBuf(url, redirects = 0) {
  return new Promise((resolve, reject) => {
    if (!url || redirects > 8) return reject(new Error("bad"));
    if (url.startsWith("//")) url = "https:" + url;
    const lib = url.startsWith("https") ? https : http;
    const req = lib.get(
      url,
      { headers: { "User-Agent": UA, Accept: "*/*" }, timeout: 30000 },
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
  });
}

function writeDDS(bgra, w, h, out) {
  const header = Buffer.alloc(128);
  header.write("DDS ", 0);
  header.writeUInt32LE(124, 4);
  header.writeUInt32LE(0x1 | 0x2 | 0x4 | 0x1000 | 0x8, 8);
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
  fs.writeFileSync(out, Buffer.concat([header, bgra]));
}

async function toDDS(buf, out) {
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
  writeDDS(bgra, info.width, info.height, out);
}

async function makePlaceholder(label, outPath) {
  const initials = label
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0].toUpperCase())
    .join("");
  const hue = [...label].reduce((a, c) => a + c.charCodeAt(0), 0) % 360;
  const svg = `<svg width="160" height="210" xmlns="http://www.w3.org/2000/svg">
  <defs><linearGradient id="g" x1="0" y1="0" x2="0" y2="1">
    <stop offset="0%" stop-color="hsl(${hue},38%,40%)"/>
    <stop offset="100%" stop-color="hsl(${hue},38%,20%)"/>
  </linearGradient></defs>
  <rect width="160" height="210" fill="url(#g)"/>
  <circle cx="80" cy="78" r="44" fill="rgba(255,255,255,0.16)"/>
  <text x="80" y="92" text-anchor="middle" font-family="Arial" font-size="34" fill="#fff" font-weight="700">${initials}</text>
  <text x="80" y="178" text-anchor="middle" font-family="Arial" font-size="9" fill="#eee">${label.slice(0, 28)}</text>
</svg>`;
  await toDDS(await sharp(Buffer.from(svg)).png().toBuffer(), outPath);
}

async function pageImage(lang, title) {
  const api =
    `https://${lang}.wikipedia.org/w/api.php?action=query&format=json&prop=pageimages&piprop=original|thumbnail&pithumbsize=800&redirects=1&titles=` +
    encodeURIComponent(title);
  const j = JSON.parse((await fetchBuf(api)).toString("utf8"));
  const page = Object.values(j.query.pages)[0];
  if (!page || page.missing != null) return null;
  return (page.original && page.original.source) || (page.thumbnail && page.thumbnail.source) || null;
}

async function tryWiki(file, label, tries) {
  const out = path.join(OUT, file);
  for (const [lang, title] of tries) {
    try {
      const url = await pageImage(lang, title);
      if (!url) continue;
      const buf = await fetchBuf(url);
      if (buf.length < 3000) continue;
      await toDDS(buf, out);
      console.log("OK", file, lang, title);
      return true;
    } catch (e) {
      console.log("fail", file, lang, title, e.message);
    }
    await new Promise((r) => setTimeout(r, 1500));
  }
  await makePlaceholder(label, out);
  console.log("PLACEHOLDER", file);
  return false;
}

(async () => {
  // Katz: known wiki page
  await tryWiki("maksim_katz.dds", "Maksim Katz", [
    ["en", "Maxim Katz"],
    ["ru", "Кац, Максим Евгеньевич"],
  ]);
  // Kutluguzhin: obscure — prefer placeholder over wrong group photo
  await makePlaceholder("Yunir Kutluguzhin", path.join(OUT, "yunir_kutluguzhin.dds"));
  console.log("PLACEHOLDER yunir_kutluguzhin.dds (forced)");
  // Baymetov: obscure
  await makePlaceholder("Vladimir Baymetov", path.join(OUT, "vladimir_baymetov.dds"));
  console.log("PLACEHOLDER vladimir_baymetov.dds (forced)");
})();
