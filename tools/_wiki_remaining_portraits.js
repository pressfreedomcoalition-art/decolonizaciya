const fs = require("fs");
const path = require("path");
const https = require("https");
const sharp = require("sharp");
const ROOT = "c:/git/decolonizaciya";
const OUT = path.join(ROOT, "gfx/leaders/DEC");

function get(url, ms = 12000) {
  return new Promise((resolve, reject) => {
    const t = setTimeout(() => {
      req.destroy();
      reject(new Error("timeout"));
    }, ms);
    const req = https.get(
      url,
      { headers: { "User-Agent": "DecolonizaciyaMod/1.0 (portraits)", Accept: "*/*" } },
      (res) => {
        if ([301, 302, 307, 308].includes(res.statusCode) && res.headers.location) {
          clearTimeout(t);
          res.resume();
          return resolve(get(new URL(res.headers.location, url).toString(), ms));
        }
        const chunks = [];
        res.on("data", (c) => chunks.push(c));
        res.on("end", () => {
          clearTimeout(t);
          if (res.statusCode !== 200) return reject(new Error("HTTP " + res.statusCode));
          resolve(Buffer.concat(chunks));
        });
      }
    );
    req.on("error", (e) => {
      clearTimeout(t);
      reject(e);
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

async function toDDS(buf, out) {
  const { data, info } = await sharp(buf).rotate().resize(160, 210, { fit: "cover", position: "attention" }).ensureAlpha().raw().toBuffer({ resolveWithObject: true });
  const bgra = Buffer.alloc(data.length);
  for (let i = 0; i < data.length; i += 4) {
    bgra[i] = data[i + 2];
    bgra[i + 1] = data[i + 1];
    bgra[i + 2] = data[i];
    bgra[i + 3] = data[i + 3];
  }
  writeDDS(bgra, info.width, info.height, out);
}

async function wikiImg(lang, title) {
  const api = `https://${lang}.wikipedia.org/w/api.php?action=query&format=json&prop=pageimages|images&piprop=original&imlimit=8&titles=` + encodeURIComponent(title);
  const j = JSON.parse((await get(api)).toString("utf8"));
  const pages = Object.values((j.query && j.query.pages) || {});
  for (const p of pages) {
    if (p.original && p.original.source) return p.original.source;
  }
  return null;
}

const JOBS = [
  { slug: "albert_razin", titles: [["en", "Albert Razin"], ["ru", "Разин, Альберт Алексеевич"]] },
  { slug: "oleg_mikhailov", titles: [["ru", "Михайлов, Олег Алексеевич"], ["ru", "Олег Михайлов"]] },
  { slug: "valery_markov", titles: [["ru", "Марков, Валерий Петрович"], ["en", "Valery Markov"]] },
  { slug: "sergei_antonov", titles: [["ru", "Антонов, Сергей"], ["en", "Sergei Antonov"]] },
  { slug: "vasiliy_popov", titles: [["ru", "Попов, Василий"]] },
];

async function stylizeFrom(srcSlug, destSlug, hue) {
  const src = path.join(OUT, srcSlug + ".dds");
  // cannot read dds easily; use a generated unique face from existing jpg assets or sharp of another png
  const seed = Buffer.alloc(160 * 210 * 3);
  for (let i = 0; i < seed.length; i += 3) {
    const n = (i * 13 + hue * 97) % 255;
    seed[i] = 80 + (n % 90);
    seed[i + 1] = 60 + ((n * 3) % 70);
    seed[i + 2] = 40 + ((n * 5) % 50);
  }
  const png = await sharp(seed, { raw: { width: 160, height: 210, channels: 3 } })
    .blur(8)
    .modulate({ hue, saturation: 1.1 })
    .jpeg()
    .toBuffer();
  await toDDS(png, path.join(OUT, destSlug + ".dds"));
}

async function main() {
  for (const job of JOBS) {
    let ok = false;
    for (const [lang, title] of job.titles) {
      try {
        const u = await wikiImg(lang, title);
        if (!u) continue;
        const buf = await get(u, 20000);
        await toDDS(buf, path.join(OUT, job.slug + ".dds"));
        console.log("OK", job.slug, lang, title);
        ok = true;
        break;
      } catch (e) {
        console.log("fail", job.slug, title, e.message);
      }
    }
    if (!ok) console.log("MISS wiki", job.slug);
  }

  // Remaining without reliable wiki: unique stylized placeholders from a known face crop variation
  // Better: reuse nearest existing verified portraits only as LAST resort with unique hue so game loads.
  const leftovers = [
    ["vitaly_golovin", 20],
    ["nikolai_suvorov", 80],
    ["alexander_grigoryev", 140],
  ];
  for (const [slug, hue] of leftovers) {
    if (fs.existsSync(path.join(OUT, slug + ".dds"))) continue;
    await stylizeFrom("fail_alsynov", slug, hue);
    console.log("PLACEHOLDER", slug);
  }

  for (const s of ["vitaly_golovin", "albert_razin", "sergei_antonov", "nikolai_suvorov", "alexander_grigoryev", "vasiliy_popov", "oleg_mikhailov", "valery_markov"]) {
    console.log(s, fs.existsSync(path.join(OUT, s + ".dds")) ? "yes" : "NO");
  }
}
main().catch((e) => {
  console.error(e);
  process.exit(1);
});
