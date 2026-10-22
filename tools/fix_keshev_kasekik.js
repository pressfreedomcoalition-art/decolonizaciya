const fs = require("fs");
const sharp = require("sharp");
const https = require("https");
const path = require("path");

const OUT = "c:/git/decolonizaciya/gfx/leaders/DEC";

function writeDDS(bgra, w, h, outPath) {
  const header = Buffer.alloc(128);
  header.write("DDS ", 0);
  header.writeUInt32LE(124, 4);
  header.writeUInt32LE(0x100F, 8);
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

async function makePlaceholder(name, outPath) {
  const initials = name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0].toUpperCase())
    .join("");
  const hue = [...name].reduce((a, c) => a + c.charCodeAt(0), 0) % 360;
  const safe = name.replace(/[<>&]/g, "");
  const svg = `<svg width="160" height="210" xmlns="http://www.w3.org/2000/svg">
  <defs><linearGradient id="g" x1="0" y1="0" x2="0" y2="1">
    <stop offset="0%" stop-color="hsl(${hue},38%,40%)"/>
    <stop offset="100%" stop-color="hsl(${hue},38%,20%)"/>
  </linearGradient></defs>
  <rect width="160" height="210" fill="url(#g)"/>
  <circle cx="80" cy="78" r="44" fill="rgba(255,255,255,0.16)"/>
  <text x="80" y="92" text-anchor="middle" font-family="Arial" font-size="34" fill="#fff" font-weight="700">${initials}</text>
  <text x="80" y="178" text-anchor="middle" font-family="Arial" font-size="10" fill="#eee">${safe.slice(0, 24)}</text>
</svg>`;
  await toDDS(await sharp(Buffer.from(svg)).png().toBuffer(), outPath);
}

function fetchBuf(url, r = 0) {
  return new Promise((res, rej) => {
    if (r > 8) return rej(new Error("redir"));
    const lib = url.startsWith("https") ? https : require("http");
    const req = lib.get(
      url,
      { headers: { "User-Agent": "Mozilla/5.0" }, timeout: 30000 },
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
  });
}

async function main() {
  await makePlaceholder("Ruslan Keshev", path.join(OUT, "ruslan_keshev.dds"));
  console.log("PH Keshev");

  // better Kase Kik portrait from Kavkaz-Uzel
  try {
    const buf = await fetchBuf(
      "https://www.kavkaz-uzel.eu/system/uploads/article_image/image/0032/320185/view_Kasy.png"
    );
    await toDDS(buf, path.join(OUT, "kase_kik.dds"));
    await sharp(buf)
      .resize(160, 210, { fit: "cover", position: "attention" })
      .png()
      .toFile("c:/git/decolonizaciya/tools/_ph_preview/kase_kik.png");
    console.log("OK Kase Kik", buf.length);
  } catch (e) {
    console.log("Kase fail", e.message);
  }

  // copy collage assets
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
