const https = require("https");
const fs = require("fs");
const sharp = require("sharp");
const path = require("path");

const UA = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/122 Safari/537.36";
const OUT = "c:/git/decolonizaciya/gfx/leaders/DEC";
const PREV = "c:/git/decolonizaciya/tools/_ph_preview";

function fetchBuf(url, r = 0) {
  return new Promise((res, rej) => {
    if (r > 8) return rej(new Error("redir"));
    if (url.startsWith("//")) url = "https:" + url;
    const lib = url.startsWith("https") ? https : require("http");
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
  const svg = `<svg width="160" height="210" xmlns="http://www.w3.org/2000/svg">
  <defs><linearGradient id="g" x1="0" y1="0" x2="0" y2="1">
    <stop offset="0%" stop-color="hsl(${hue},38%,40%)"/>
    <stop offset="100%" stop-color="hsl(${hue},38%,20%)"/>
  </linearGradient></defs>
  <rect width="160" height="210" fill="url(#g)"/>
  <circle cx="80" cy="78" r="44" fill="rgba(255,255,255,0.16)"/>
  <text x="80" y="92" text-anchor="middle" font-family="Arial" font-size="34" fill="#fff" font-weight="700">${initials}</text>
  <text x="80" y="178" text-anchor="middle" font-family="Arial" font-size="10" fill="#eee">${name.slice(0, 24)}</text>
</svg>`;
  await toDDS(await sharp(Buffer.from(svg)).png().toBuffer(), outPath);
}

async function dumpPageImages(pageUrl, outJson) {
  const html = (await fetchBuf(pageUrl)).toString("utf8");
  const items = [];
  // img tags with src + alt
  for (const m of html.matchAll(/<img[^>]+>/gi)) {
    const tag = m[0];
    const src = (tag.match(/src=["']([^"']+)/i) || [])[1];
    const alt = (tag.match(/alt=["']([^"']*)/i) || [])[1] || "";
    if (src && /\.(jpg|jpeg|png|webp)/i.test(src) || (src && src.includes("gdb."))) {
      items.push({ src: src.replace(/&amp;/g, "&"), alt });
    }
  }
  // also mediaItems / JSON blobs
  for (const m of html.matchAll(/"(https:\/\/gdb\.[^"]+\.(?:jpg|jpeg|png|webp)[^"]*)"/gi)) {
    items.push({ src: m[1].replace(/\\u0026/g, "&"), alt: "gdb" });
  }
  for (const m of html.matchAll(/Src["']?\s*:\s*["'](https:\/\/gdb\.[^"']+)/gi)) {
    items.push({ src: m[1], alt: "Src" });
  }
  fs.writeFileSync(outJson, JSON.stringify(items, null, 2));
  console.log(pageUrl, "->", items.length);
  return items;
}

async function saveLeader(slug, url) {
  const buf = await fetchBuf(url);
  if (buf.length < 2000) throw new Error("short " + buf.length);
  const head = buf.slice(0, 8).toString("ascii");
  if (head.includes("<!") || head.includes("<html")) throw new Error("html");
  await toDDS(buf, path.join(OUT, slug + ".dds"));
  await sharp(buf)
    .rotate()
    .resize(160, 210, { fit: "cover", position: "attention" })
    .png()
    .toFile(path.join(PREV, slug + ".png"));
  console.log("OK", slug, buf.length, url.slice(0, 80));
}

async function main() {
  // Dump candidate pages for manual URL picking
  await dumpPageImages(
    "https://www.svoboda.org/a/30422752.html",
    "c:/git/decolonizaciya/tools/_dump_semenov.json"
  );
  await dumpPageImages(
    "https://www.svoboda.org/a/28248899.html",
    "c:/git/decolonizaciya/tools/_dump_semenov2.json"
  );
  await dumpPageImages(
    "https://www.idelreal.org/a/31662822.html",
    "c:/git/decolonizaciya/tools/_dump_nikiforov.json"
  );
  await dumpPageImages(
    "https://www.idelreal.org/a/eto-byl-god-razocharovaniy-rukovoditel-proekta-serditaya-chuvashiya-semyon-kochkin-podvodit-itogi-2023-goda/32746378.html",
    "c:/git/decolonizaciya/tools/_dump_kochkin.json"
  );
  await dumpPageImages(
    "https://activatica.org/content/9654ba0f-98d4-4859-b4e4-4577aa2d9b89/semyon-kochkin-mobilizuyut-samye-nezashishennye-sloi-naseleniya",
    "c:/git/decolonizaciya/tools/_dump_kochkin2.json"
  );
  await dumpPageImages(
    "https://semnasem.org/articles/2022/10/17/zachem-eks-glava-shtaba-navalnogo-v-cheboksarah-vedet-podschet-pogibshih-v-ukraine-chuvashej-i-populyariziruet-chuvashskij-s-pomoshyu-antivoennyh-stikerov",
    "c:/git/decolonizaciya/tools/_dump_kochkin3.json"
  );

  // Curated verified URLs (caption-matched / org avatars)
  const CURATED = {
    // Telegram profile photo of Mishshi (t.me page)
    mishshi_oreshnikov:
      "https://cdn4.telesco.pe/file/X-DhXtbEGhgc1Usf1NjikZ7WcreI3SILeFBk8MJwjTVl2bJZaF7AIWPz0d6I0jme8YR43IHO7HBF1Xok6YovZbyoCr_bXrQD6bv9ujlOh_PtdoEnb5g_PIeqhhGGImJ3aGsLwlorZggBvzXd3QDp4hckH_TdfreCa-45Ws6VC_O_af3jKFFdfoNk8gwDLrGGpo9jVn_d-kle2kSMIK8zNDlPMy9NVKV2EvJyGHPEmWg7yA8I-dMc6sLorjx_jalVS7ZI89MXUj301mtYurkHmRUx8ElsD3eG00hLZPORh5CUO-c3A_4bFrjxY_gBrRyia_jfTDOPdJqAG8XibO5_Hw.jpg",
  };

  // Will fill after inspecting dumps
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
