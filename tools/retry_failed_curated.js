const https = require("https");
const http = require("http");
const fs = require("fs");
const path = require("path");
const sharp = require("sharp");

const UA = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/122 Safari/537.36";
const OUT = "c:/git/decolonizaciya/gfx/leaders/DEC";

function fetchBuf(url, r = 0) {
  return new Promise((res, rej) => {
    if (r > 8) return rej(new Error("redir"));
    if (url.startsWith("//")) url = "https:" + url;
    const lib = url.startsWith("https") ? https : http;
    const req = lib.get(
      url,
      { headers: { "User-Agent": UA, Accept: "*/*" }, timeout: 35000 },
      (resp) => {
        if ([301, 302, 303, 307, 308].includes(resp.statusCode) && resp.headers.location) {
          resp.resume();
          return res(fetchBuf(new URL(resp.headers.location, url).toString(), r + 1));
        }
        if (resp.statusCode !== 200) {
          resp.resume();
          return rej(new Error("HTTP " + resp.statusCode));
        }
        const c = [];
        resp.on("data", (d) => c.push(d));
        resp.on("end", () => res(Buffer.concat(c)));
      }
    );
    req.on("error", rej);
    req.on("timeout", () => {
      req.destroy();
      rej(new Error("timeout"));
    });
  });
}

function writeDDS(bgra, w, h, outPath) {
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

async function ogImage(pageUrl) {
  const html = (await fetchBuf(pageUrl)).toString("utf8");
  let m = html.match(/property=["']og:image["'][^>]*content=["']([^"']+)/i);
  if (!m) m = html.match(/content=["']([^"']+)["'][^>]*property=["']og:image["']/i);
  if (!m) {
    // collect image candidates from article
    const imgs = [...html.matchAll(/https?:\/\/[^"'\\\s>]+\.(?:jpg|jpeg|png|webp)/gi)].map((x) => x[0]);
    console.log("imgs sample", pageUrl, imgs.slice(0, 8));
    return null;
  }
  return m[1].replace(/&amp;/g, "&");
}

const RETRY = {
  "Aleksandr Kharybin": [
    "https://www.bel.kp.ru/daily/277808/5292819/",
    "https://www.bel.kp.ru/daily/277810/5294696/",
  ],
  "Sergei Kapchuk": ["https://ura.news/articles/1036276285", "https://66.ru/news/society/215482/"],
  "Ruslan Keshev": [
    "https://www.kavkaz-uzel.eu/articles/117008",
    "https://www.kavkaz-uzel.eu/articles/162580",
  ],
};

function slug(name) {
  return name
    .normalize("NFKD")
    .replace(/[^\w]+/g, "_")
    .replace(/^_|_$/g, "")
    .toLowerCase();
}

async function main() {
  // also try direct known alts
  const DIRECT = {
    "Sergei Kapchuk":
      "https://cdn-img.ura.news/769/47/e5695582-f150-4dbb-aa27-297fe0b7755e/mvdodi/L-1200.1.9.jpg",
    "Ruslan Keshev":
      "https://gdb.rferl.org/57FEF3AC-E2B3-40B2-9521-0BE0E8D5DD4C_w1200_h630.png",
  };

  for (const [name, pages] of Object.entries(RETRY)) {
    const out = path.join(OUT, slug(name) + ".dds");
    let ok = false;
    if (DIRECT[name]) {
      try {
        const buf = await fetchBuf(DIRECT[name]);
        await toDDS(buf, out);
        console.log("DIR OK", name);
        ok = true;
      } catch (e) {
        console.log("DIR fail", name, e.message);
      }
    }
    if (ok) continue;
    for (const page of pages) {
      try {
        const img = await ogImage(page);
        console.log("OG", name, img);
        if (!img) continue;
        const buf = await fetchBuf(img);
        await toDDS(buf, out);
        console.log("OK", name);
        ok = true;
        break;
      } catch (e) {
        console.log("fail", name, e.message);
      }
    }
    if (!ok) console.log("STILL PH", name);
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
