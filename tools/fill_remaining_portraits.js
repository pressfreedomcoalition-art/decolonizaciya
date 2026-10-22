/**
 * Fill remaining placeholders via Wikidata P18 + curated direct URLs.
 */
const fs = require("fs");
const path = require("path");
const https = require("https");
const http = require("http");
const sharp = require("sharp");

const ROOT = "c:/git/decolonizaciya";
const OUT = path.join(ROOT, "gfx/leaders/DEC");
const REPORT = path.join(ROOT, "tools/portrait_report.json");
const UA = "DecolonizaciyaMod/1.0 (https://github.com/local; HOI4 portraits)";

const DIRECT = {
  "Vladislav Zhivitsa":
    "https://focus.ua/static/storage/thumbs/920x460/5/b1/ieqj7x---c993x496x147sx101s--791794cebaec09783e9ff6cb8d558b15.jpg?v=8764_1",
  "Vladislav Zhivitsa_alt":
    "https://gdb.currenttime.tv/01000000-0aff-0242-0d34-08db9bf231ae_cx0_cy13_cw48_w1200_h630.jpg",
  "Donisi Chovganon":
    "https://gdb.rferl.org/1e7624d0-9f11-4bbb-bd99-c9160e2bc00c_cx0_cy10_cw0_w1200_h630.jpg",
  // Copy from MD where available
};

const MD_COPIES = {
  "Yevgeny Roizman":
    "C:/Program Files (x86)/Steam/steamapps/workshop/content/394360/2777392649/gfx/leaders/SOV/URA/Roizman_Yevgeny.dds",
  "Aleksandr Barkashov":
    "C:/Program Files (x86)/Steam/steamapps/workshop/content/394360/2777392649/gfx/leaders/SOV/URA/Alexander_Barkashov.dds",
  "Anton Bakov":
    "C:/Program Files (x86)/Steam/steamapps/workshop/content/394360/2777392649/gfx/leaders/SOV/URA/Anton_Bakov.dds",
};

function slug(name) {
  return name.normalize("NFKD").replace(/[^\w]+/g, "_").replace(/^_|_$/g, "").toLowerCase();
}

function fetchBuf(url, redirects = 0) {
  return new Promise((resolve, reject) => {
    if (!url || redirects > 6) return reject(new Error("bad url"));
    const lib = url.startsWith("https") ? https : http;
    const req = lib.get(
      url,
      { headers: { "User-Agent": UA, Accept: "*/*" }, timeout: 25000 },
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
    req.on("timeout", () => {
      req.destroy();
      reject(new Error("timeout"));
    });
  });
}

async function fetchJson(url) {
  return JSON.parse((await fetchBuf(url)).toString("utf8"));
}

function writeUncompressedDDS(bgra, width, height, outPath) {
  const header = Buffer.alloc(128);
  header.write("DDS ", 0);
  header.writeUInt32LE(124, 4);
  header.writeUInt32LE(0x1 | 0x2 | 0x4 | 0x1000 | 0x8, 8);
  header.writeUInt32LE(height, 12);
  header.writeUInt32LE(width, 16);
  header.writeUInt32LE(width * 4, 20);
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

async function toPortraitDDS(imgBuf, outPath) {
  const { data, info } = await sharp(imgBuf)
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
  writeUncompressedDDS(bgra, info.width, info.height, outPath);
}

async function wikidataImage(name) {
  const search =
    "https://www.wikidata.org/w/api.php?action=wbsearchentities&format=json&language=en&uselang=en&type=item&limit=5&search=" +
    encodeURIComponent(name);
  const s = await fetchJson(search);
  for (const hit of s.search || []) {
    const entUrl =
      "https://www.wikidata.org/wiki/Special:EntityData/" + hit.id + ".json";
    try {
      const ent = await fetchJson(entUrl);
      const entity = ent.entities[hit.id];
      const p18 = entity.claims && entity.claims.P18;
      if (!p18 || !p18[0]) continue;
      const file = p18[0].mainsnak.datavalue.value; // filename
      const url =
        "https://commons.wikimedia.org/wiki/Special:FilePath/" +
        encodeURIComponent(file) +
        "?width=800";
      const buf = await fetchBuf(url);
      if (buf.length > 2000) return { buf, url, id: hit.id };
    } catch (_) {}
  }
  // also try Russian search
  const searchRu =
    "https://www.wikidata.org/w/api.php?action=wbsearchentities&format=json&language=ru&uselang=ru&type=item&limit=5&search=" +
    encodeURIComponent(name);
  const s2 = await fetchJson(searchRu);
  for (const hit of s2.search || []) {
    try {
      const ent = await fetchJson(
        "https://www.wikidata.org/wiki/Special:EntityData/" + hit.id + ".json"
      );
      const entity = ent.entities[hit.id];
      const p18 = entity.claims && entity.claims.P18;
      if (!p18 || !p18[0]) continue;
      const file = p18[0].mainsnak.datavalue.value;
      const url =
        "https://commons.wikimedia.org/wiki/Special:FilePath/" +
        encodeURIComponent(file) +
        "?width=800";
      const buf = await fetchBuf(url);
      if (buf.length > 2000) return { buf, url, id: hit.id };
    } catch (_) {}
  }
  return null;
}

async function main() {
  const report = JSON.parse(fs.readFileSync(REPORT, "utf8"));
  const remaining = report.placeholder.map((p) => p.name);
  const newly = [];
  console.log("remaining", remaining.length);

  for (const name of remaining) {
    const outPath = path.join(OUT, slug(name) + ".dds");
    let done = false;

    // MD direct copy (already DXT5 DDS — fine for HOI4)
    if (MD_COPIES[name] && fs.existsSync(MD_COPIES[name])) {
      fs.copyFileSync(MD_COPIES[name], outPath);
      newly.push({ name, source: "md-copy" });
      console.log("MD", name);
      continue;
    }

    if (DIRECT[name]) {
      try {
        const buf = await fetchBuf(DIRECT[name]);
        await toPortraitDDS(buf, outPath);
        newly.push({ name, source: DIRECT[name] });
        console.log("DIR", name);
        done = true;
      } catch (e) {
        console.log("DIR fail", name, e.message);
      }
    }
    if (done) continue;

    try {
      const wd = await wikidataImage(name);
      if (wd) {
        await toPortraitDDS(wd.buf, outPath);
        newly.push({ name, source: wd.url });
        console.log("WD", name, wd.id);
        continue;
      }
    } catch (e) {
      console.log("WD fail", name, e.message);
    }

    console.log("still PH", name);
  }

  // rebuild report
  const stillPh = remaining.filter((n) => !newly.find((x) => x.name === n));
  const okNames = new Set([...(report.ok || []).map((x) => x.name), ...newly.map((x) => x.name)]);
  const allNames = [...okNames, ...stillPh].sort();
  const newReport = {
    total: allNames.length,
    ok: [...okNames].sort().map((name) => ({ name, file: slug(name) + ".dds" })),
    placeholder: stillPh.map((name) => ({ name, file: slug(name) + ".dds" })),
    newly,
  };
  fs.writeFileSync(REPORT, JSON.stringify(newReport, null, 2));
  console.log(JSON.stringify({ ok: newReport.ok.length, placeholder: newReport.placeholder.length, newly: newly.length }, null, 2));
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
