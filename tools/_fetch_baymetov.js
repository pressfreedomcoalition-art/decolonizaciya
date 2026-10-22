const fs = require("fs");
const path = require("path");
const https = require("https");
const http = require("http");
const sharp = require("sharp");

const OUT = path.join(__dirname, "..", "gfx", "leaders", "DEC");
const UA =
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/122.0.0.0 Safari/537.36";

function fetchBuf(url, redirects = 0) {
  return new Promise((resolve, reject) => {
    if (!url || redirects > 8) return reject(new Error("bad"));
    if (url.startsWith("//")) url = "https:" + url;
    const lib = url.startsWith("https") ? https : http;
    const req = lib.get(
      url,
      { headers: { "User-Agent": UA, Accept: "image/*,*/*", Referer: "https://www.bing.com/" }, timeout: 25000 },
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

async function bingImgs(q) {
  const url =
    "https://www.bing.com/images/search?q=" + encodeURIComponent(q) + "&form=HDRSC2";
  const html = (await fetchBuf(url)).toString("utf8");
  const murls = [...html.matchAll(/"murl":"(https?:[^"\\]+)/g)].map((x) =>
    x[1].replace(/\\u0026/g, "&")
  );
  return murls;
}

(async () => {
  const out = path.join(OUT, "vladimir_baymetov.dds");
  for (const q of [
    "Байметов Удмурт Кенеш",
    "Baymetov Udmurt",
    "Владимир Байметов Ижевск",
    "Baymetov Udmurtia",
  ]) {
    const urls = await bingImgs(q);
    console.log(q, "urls", urls.length);
    for (const u of urls.slice(0, 15)) {
      try {
        const b = await fetchBuf(u);
        if (b.length < 4000) continue;
        await sharp(b).metadata();
        await toDDS(b, out);
        console.log("OK", u.slice(0, 120));
        return;
      } catch (_) {}
    }
  }
  console.log("baymetov still fail — keeping placeholder");
})();
