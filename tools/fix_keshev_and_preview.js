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

async function ogImage(pageUrl) {
  const html = (await fetchBuf(pageUrl)).toString("utf8");
  let m = html.match(/property=["']og:image["'][^>]*content=["']([^"']+)/i);
  if (!m) m = html.match(/content=["']([^"']+)["'][^>]*property=["']og:image["']/i);
  if (!m) {
    const imgs = [...html.matchAll(/https?:\/\/[^"'\\\s>]+\.(?:jpg|jpeg|png|webp)/gi)].map((x) => x[0]);
    console.log("candidates", imgs.slice(0, 12));
    return imgs.find((u) => /keshev|kalpak|wp-content/i.test(u)) || imgs[0] || null;
  }
  return m[1].replace(/&amp;/g, "&");
}

async function main() {
  // Fix wrong Keshev (was Kmuzov thumb)
  const pages = [
    "https://www.ajanskafkas.com/analysis/ruslan-keshev-what-is-circassian-question/",
    "https://www.ajanskafkas.com/kabardey-balkar/ruslan-keshev-kalpakli/",
  ];
  let done = false;
  for (const page of pages) {
    try {
      const img = await ogImage(page);
      console.log("page", page, "img", img);
      if (!img) continue;
      const buf = await fetchBuf(img);
      if (buf.length < 3000) continue;
      await toDDS(buf, path.join(OUT, "ruslan_keshev.dds"));
      await sharp(buf).resize(160, 210, { fit: "cover", position: "attention" }).png().toFile("c:/git/decolonizaciya/tools/_ph_preview/ruslan_keshev.png");
      console.log("OK Keshev", buf.length);
      done = true;
      break;
    } catch (e) {
      console.log("fail", e.message);
    }
  }
  if (!done) {
    await makePlaceholder("Ruslan Keshev", path.join(OUT, "ruslan_keshev.dds"));
    console.log("PH Keshev");
  }

  // Kapchuk from anticorr file if present
  const kap = "c:/git/decolonizaciya/tools/_tmp_kapchuk.jpg";
  if (fs.existsSync(kap) && fs.statSync(kap).size > 10000) {
    const buf = fs.readFileSync(kap);
    await toDDS(buf, path.join(OUT, "sergei_kapchuk.dds"));
    await sharp(buf).resize(160, 210, { fit: "cover", position: "attention" }).png().toFile("c:/git/decolonizaciya/tools/_ph_preview/sergei_kapchuk.png");
    console.log("OK Kapchuk from file", buf.length);
  }

  // preview a few curated
  const preview = ["deni_teps", "farit_zakiev", "ilyas_akhmadov", "kase_kik", "asker_sokht", "nikita_goldin"];
  for (const s of preview) {
    const dds = path.join(OUT, s + ".dds");
    if (!fs.existsSync(dds)) continue;
    const buf = fs.readFileSync(dds);
    const w = buf.readUInt32LE(16);
    const h = buf.readUInt32LE(12);
    const bgra = buf.slice(128, 128 + w * h * 4);
    const rgba = Buffer.alloc(bgra.length);
    for (let i = 0; i < bgra.length; i += 4) {
      rgba[i] = bgra[i + 2];
      rgba[i + 1] = bgra[i + 1];
      rgba[i + 2] = bgra[i];
      rgba[i + 3] = bgra[i + 3];
    }
    await sharp(rgba, { raw: { width: w, height: h, channels: 4 } })
      .png()
      .toFile("c:/git/decolonizaciya/tools/_ph_preview/" + s + ".png");
  }
  console.log("previews done");
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
