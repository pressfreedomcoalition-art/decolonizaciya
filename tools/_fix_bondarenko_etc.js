const fs = require("fs");
const path = require("path");
const https = require("https");
const http = require("http");
const sharp = require("sharp");

const OUT = path.join(__dirname, "..", "gfx", "leaders", "DEC");
const UA = "DecolonizaciyaMod/1.0";

function fetchBuf(url, r = 0) {
  return new Promise((res, rej) => {
    if (!url || r > 8) return rej(new Error("bad"));
    if (url.startsWith("//")) url = "https:" + url;
    const lib = url.startsWith("https") ? https : http;
    const req = lib.get(url, { headers: { "User-Agent": UA }, timeout: 30000 }, (x) => {
      if ([301, 302, 303, 307, 308].includes(x.statusCode) && x.headers.location) {
        x.resume();
        return res(fetchBuf(new URL(x.headers.location, url).toString(), r + 1));
      }
      if (x.statusCode !== 200) {
        x.resume();
        return rej(new Error("HTTP " + x.statusCode));
      }
      const c = [];
      x.on("data", (d) => c.push(d));
      x.on("end", () => res(Buffer.concat(c)));
    });
    req.on("error", rej);
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

async function ph(label, out) {
  const initials = label
    .split(/\s+/)
    .slice(0, 2)
    .map((w) => w[0].toUpperCase())
    .join("");
  const hue = [...label].reduce((a, c) => a + c.charCodeAt(0), 0) % 360;
  const svg = `<svg width="160" height="210" xmlns="http://www.w3.org/2000/svg">
  <rect width="160" height="210" fill="hsl(${hue},38%,28%)"/>
  <circle cx="80" cy="78" r="44" fill="rgba(255,255,255,0.16)"/>
  <text x="80" y="92" text-anchor="middle" font-family="Arial" font-size="34" fill="#fff" font-weight="700">${initials}</text>
</svg>`;
  await toDDS(await sharp(Buffer.from(svg)).png().toBuffer(), out);
}

async function wikiImg(lang, title) {
  const api =
    `https://${lang}.wikipedia.org/w/api.php?action=query&format=json&prop=pageimages&piprop=original|thumbnail&pithumbsize=800&redirects=1&titles=` +
    encodeURIComponent(title);
  const j = JSON.parse((await fetchBuf(api)).toString("utf8"));
  const page = Object.values(j.query.pages)[0];
  if (!page || page.missing != null) return null;
  return (page.original && page.original.source) || (page.thumbnail && page.thumbnail.source) || null;
}

(async () => {
  // Katz
  try {
    const url = await wikiImg("ru", "Кац, Максим Евгеньевич");
    if (url) {
      await toDDS(await fetchBuf(url), path.join(OUT, "maksim_katz.dds"));
      console.log("OK katz", url.slice(0, 90));
    } else {
      await ph("Maksim Katz", path.join(OUT, "maksim_katz.dds"));
      console.log("PH katz");
    }
  } catch (e) {
    await ph("Maksim Katz", path.join(OUT, "maksim_katz.dds"));
    console.log("PH katz", e.message);
  }

  await new Promise((r) => setTimeout(r, 1500));

  // Bondarenko politician
  try {
    const url = await wikiImg("ru", "Бондаренко, Николай Николаевич (политик)");
    if (url) {
      await toDDS(await fetchBuf(url), path.join(OUT, "nikolay_bondarenko.dds"));
      console.log("OK bondarenko", url.slice(0, 90));
    } else {
      await ph("Nikolay Bondarenko", path.join(OUT, "nikolay_bondarenko.dds"));
      console.log("PH bondarenko");
    }
  } catch (e) {
    await ph("Nikolay Bondarenko", path.join(OUT, "nikolay_bondarenko.dds"));
    console.log("PH bondarenko", e.message);
  }

  // Obscure / wrong Bing hits → clean placeholders
  await ph("Yunir Kutluguzhin", path.join(OUT, "yunir_kutluguzhin.dds"));
  await ph("Vladimir Baymetov", path.join(OUT, "vladimir_baymetov.dds"));
  await ph("Igor Kudryavtsev", path.join(OUT, "igor_kudryavtsev.dds"));
  console.log("PH kutluguzhin baymetov kudryavtsev");
})();
