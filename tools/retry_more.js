const https = require("https");
const http = require("http");
const fs = require("fs");
const path = require("path");
const sharp = require("sharp");

const UA = "Mozilla/5.0";
const OUT = "c:/git/decolonizaciya/gfx/leaders/DEC";

function fetchBuf(url, r = 0) {
  return new Promise((res, rej) => {
    if (r > 8) return rej(new Error("redir"));
    if (url.startsWith("//")) url = "https:" + url;
    const lib = url.startsWith("https") ? https : http;
    const req = lib.get(
      url,
      { headers: { "User-Agent": UA, Accept: "*/*" }, timeout: 40000 },
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

function slug(name) {
  return name
    .normalize("NFKD")
    .replace(/[^\w]+/g, "_")
    .replace(/^_|_$/g, "")
    .toLowerCase();
}

const MORE = {
  "Sergei Kapchuk": [
    "https://anticorr.media/wp-content/uploads/2018/06/%D0%9A%D0%B0%D0%BF%D1%87%D1%83%D0%BA-%D0%BA%D0%BE%D0%BB%D0%B5%D1%81%D0%BE-%D0%9B%D0%BE%D0%BD%D0%B4%D0%BE%D0%BD.jpg",
    "https://anticorr.media/wp-content/uploads/2018/06/Kapchuk-koleso-London.jpg",
  ],
  "Aleksandr Kharybin": [
    "https://newpeople.ru/upload/iblock/kharybin.jpg",
  ],
};

async function main() {
  for (const [name, urls] of Object.entries(MORE)) {
    const out = path.join(OUT, slug(name) + ".dds");
    let ok = false;
    for (const url of urls) {
      try {
        const buf = await fetchBuf(url);
        if (buf.length < 3000) continue;
        const head = buf.slice(0, 8).toString("ascii");
        if (head.includes("<!") || head.includes("<html")) continue;
        await toDDS(buf, out);
        console.log("OK", name, url.slice(0, 70));
        ok = true;
        break;
      } catch (e) {
        console.log("fail", name, e.message);
      }
    }
    if (!ok) console.log("PH", name);
  }
}

main();
