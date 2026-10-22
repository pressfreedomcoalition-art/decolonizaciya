const fs = require("fs");
const path = require("path");
const https = require("https");
const sharp = require("sharp");

const OUT = path.join(__dirname, "..", "gfx", "leaders", "DEC");
const UA = "DecolonizaciyaMod/1.0";

function get(url, r = 0) {
  return new Promise((res, rej) => {
    if (!url || r > 8) return rej(new Error("bad"));
    https
      .get(url, { headers: { "User-Agent": UA } }, (x) => {
        if (x.statusCode >= 300 && x.statusCode < 400 && x.headers.location) {
          x.resume();
          return res(get(new URL(x.headers.location, url).toString(), r + 1));
        }
        if (x.statusCode !== 200) {
          x.resume();
          return rej(new Error("HTTP " + x.statusCode));
        }
        const c = [];
        x.on("data", (d) => c.push(d));
        x.on("end", () => res(Buffer.concat(c)));
      })
      .on("error", rej);
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

async function tryFiles(target, files) {
  for (const f of files) {
    try {
      const u =
        "https://commons.wikimedia.org/wiki/Special:FilePath/" +
        encodeURIComponent(f) +
        "?width=800";
      const b = await get(u);
      if (b.length > 4000) {
        await toDDS(b, path.join(OUT, target));
        console.log("OK", f, "->", target);
        return true;
      }
    } catch (e) {
      console.log("no", f, e.message);
    }
  }
  return false;
}

(async () => {
  await tryFiles("maksim_katz.dds", [
    "Maxim Katz (2021-09-19).jpg",
    "Maxim Katz.jpg",
    "Maxim_Katz.jpg",
    "Кац Максим.jpg",
  ]);
  await tryFiles("nikolay_bondarenko.dds", [
    "Nikolay Bondarenko (politician).jpg",
    "Nikolai Bondarenko.jpg",
    "Bondarenko NN.jpg",
  ]);
})();
