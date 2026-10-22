/**
 * Replace bad/placeholder portraits with face-like photos from Bing image search.
 * Validates skin/color/variance so documents/icons/initials are rejected.
 */
const fs = require("fs");
const path = require("path");
const https = require("https");
const http = require("http");
const sharp = require("sharp");

const ROOT = "c:/git/decolonizaciya";
const OUT = path.join(ROOT, "gfx/leaders/DEC");
const NEED = JSON.parse(fs.readFileSync(path.join(ROOT, "tools/_need_named.json"), "utf8"));
const UA =
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36";

/** English -> Russian / alt search queries */
const ALIASES = {
  "Aleksandr Kharybin": ["Александр Харыбин", "Харыбин Александр"],
  "Aleksei Kudryashov": ["Алексей Кудряшов", "Кудряшов Алексей деколонизация"],
  "Andrei Kuznetsov": ["Андрей Кузнецов", "Андрей Кузнецов политик"],
  "Anvar Kurmanakaev": ["Анвар Курманакаев", "Курманакаев"],
  "Artur Ankkalainen": ["Artur Ankkalainen", "Артур Анккалайнен", "Ankkalainen Karelia"],
  "Asker Sokht": ["Аскер Сохт", "Asker Sokht Адыгэ Хасэ"],
  "Aslanbek Naimanov": ["Асланбек Найманов", "Найманов Осетия"],
  "Beslan Kmuzov": ["Беслан Кмузов", "Кмузов"],
  "Deni Teps": ["Дени Тепс", "Дени Тэпс", "Deni Teps Chechen", "Тепс Всемирный конгресс"],
  "Dzhabrail Mirzoyev": ["Джабраил Мирзоев", "Мирзоев Джабраил"],
  "Farit Zakiev": ["Фарит Закиев", "Фарит Закиев ВТОЦ", "Farit Zakiev"],
  "Ibragim Guchigov": ["Ибрагим Гучигов", "Гучигов"],
  "Ilnar Garifullin": ["Ильнар Гарифуллин", "Гарифуллин"],
  "Ilyas Akhmadov": ["Ильяс Ахмадов", "Ilyas Akhmadov", "Ильяс Ахмадов министр"],
  "Irina Shafrannik": ["Ирина Шафранник", "Шафранник"],
  "Islam Atabiyev": ["Ислам Атабиев", "Атабиев"],
  "Ismail Kerimov": ["Исмаил Керимов", "Керимов Исмаил"],
  "Ivan Kulenko": ["Иван Куленко", "Куленко"],
  "Kase Kik": ["Касе Кик", "Kase Kik", "Kasekik"],
  "Konstantin Klimashevsky": ["Константин Климашевский", "Климашевский"],
  "Magomed Yarlykapov": ["Магомед Ярлыкапов", "Ярлыкапов"],
  "Mikhail Kalyamin": ["Михаил Калямин", "Калямин"],
  "Murat Berzegov": ["Мурат Берзегов", "Мурат Берзегов Черкесский конгресс"],
  "Murat Zalikhanov": ["Мурат Залиханов", "Залиханов"],
  "Muslim Tsebiev": ["Муслим Цебиев", "Цебиев"],
  "Nikita Goldin": ["Никита Голдин", "Никита Гольдин"],
  "Nina Aleshina": ["Нина Алешина", "Алешина Нина"],
  "Nuyat Vidyay": ["Нуят Видяй", "Nuyat Vidyay", "Видяй"],
  "Olaf Lappalainen": ["Olaf Lappalainen", "Олаф Лаппалайнен", "Lappalainen Karelia"],
  "Oleg Zurabov": ["Олег Зурабов", "Зурабов"],
  "Pavel Grishin": ["Павел Гришин", "Павел Гришин деколонизация", "Grishin Free Nations"],
  "Rizvan Kubakaev": ["Ризван Кубакаев", "Кубакаев"],
  "Rodion Evdokimov": ["Родион Евдокимов", "Евдокимов Родион Чувашия", "Rodion Evdokimov"],
  "Ruslan Keshev": ["Руслан Кешев", "Keshev Circassian", "Кешев черкес"],
  "Ruslan Kuchity": ["Руслан Кучиты", "Кучиты", "Ruslan Kuchity"],
  "Sergei Kapchuk": ["Сергей Капчук", "Капчук"],
  "Sergei Revenko": ["Сергей Ревенко", "Ревенко"],
  "Tjan Zaotschnaja": ["Tjan Zaotschnaja", "Тьян Заочная", "Zaotschnaja", "Tjan Karelian"],
  "Valery Shevlyakov": ["Валерий Шевляков", "Шевляков"],
  "Vladimir Kemaikin": ["Владимир Кемайкин", "Кемайкин"],
  "Vyacheslav Dzhabiev": ["Вячеслав Джабиев", "Джабиев"],
  "Yelena Kaminskaya": ["Елена Каминская", "Каминская Елена"],
  "Yevgeny Dremov": ["Евгений Дремов", "Дремов Евгений"],
  "Yevgeny Mozgovskoy": ["Евгений Мозговской", "Мозговской"],
  "Yuriy Shcherbachev": ["Юрий Щербачев", "Щербачев"],
};

/** Hand-picked direct URLs when search fails or is ambiguous */
const DIRECT = {
  "Ilyas Akhmadov":
    "https://upload.wikimedia.org/wikipedia/commons/thumb/8/8e/Ilyas_Akhmadov.jpg/800px-Ilyas_Akhmadov.jpg",
};

function slug(name) {
  return name
    .normalize("NFKD")
    .replace(/[^\w]+/g, "_")
    .replace(/^_|_$/g, "")
    .toLowerCase();
}

function fetchBuf(url, redirects = 0) {
  return new Promise((resolve, reject) => {
    if (!url || redirects > 8) return reject(new Error("bad url"));
    if (url.startsWith("//")) url = "https:" + url;
    const lib = url.startsWith("https") ? https : http;
    const req = lib.get(
      url,
      {
        headers: {
          "User-Agent": UA,
          Accept: "image/avif,image/webp,image/apng,image/*,*/*;q=0.8",
          "Accept-Language": "ru-RU,ru;q=0.9,en;q=0.8",
          Referer: "https://www.bing.com/",
        },
        timeout: 30000,
      },
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

function fetchText(url) {
  return fetchBuf(url).then((b) => b.toString("utf8"));
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

/** Score how face-like an image buffer is. Higher = better. */
async function faceScore(imgBuf) {
  try {
    const { data, info } = await sharp(imgBuf)
      .rotate()
      .resize(80, 105, { fit: "cover", position: "centre" })
      .removeAlpha()
      .raw()
      .toBuffer({ resolveWithObject: true });
    const w = info.width;
    const h = info.height;
    const colors = new Set();
    let n = 0;
    let skin = 0;
    let sum = 0;
    let sum2 = 0;
    let white = 0;
    for (let i = 0; i < data.length; i += 3) {
      const r = data[i];
      const g = data[i + 1];
      const b = data[i + 2];
      const lum = (r + g + b) / 3;
      sum += lum;
      sum2 += lum * lum;
      n++;
      colors.add((r >> 4 << 8) | (g >> 4 << 4) | (b >> 4));
      if (r > 200 && g > 200 && b > 200) white++;
      if (r > 60 && r < 240 && g > 30 && g < 210 && b > 15 && b < 190 && r > g - 5 && g >= b - 15 && r - b > 10) {
        skin++;
      }
    }
    const mean = sum / n;
    const variance = sum2 / n - mean * mean;
    const skinR = skin / n;
    const whiteR = white / n;
    if (colors.size < 60) return -1;
    if (variance < 1200) return -1;
    if (skinR < 0.04) return -1;
    if (whiteR > 0.4) return -1;
    // prefer portraits with moderate skin + rich colors
    return skinR * 100 + Math.min(colors.size, 300) / 10 + Math.min(variance, 8000) / 200;
  } catch {
    return -1;
  }
}

async function bingImageUrls(query, count = 12) {
  const url =
    "https://www.bing.com/images/search?q=" +
    encodeURIComponent(query) +
    "&form=HDRSC2&first=1&tsc=ImageHoverTitle";
  const html = await fetchText(url);
  const urls = [];
  // murl":"https://...
  const re = /murl&quot;:&quot;(https?:\/\/[^&]+?)&quot;/g;
  let m;
  while ((m = re.exec(html)) && urls.length < count) {
    const u = m[1].replace(/\\u0026/g, "&").replace(/\\\//g, "/");
    if (!urls.includes(u)) urls.push(u);
  }
  // fallback: "murl":"https
  const re2 = /"murl"\s*:\s*"(https?:\\\/\\\/[^"]+)"/g;
  while ((m = re2.exec(html)) && urls.length < count) {
    const u = m[1].replace(/\\\//g, "/").replace(/\\u0026/g, "&");
    if (!urls.includes(u)) urls.push(u);
  }
  // another format
  const re3 = /murl":"([^"]+)"/g;
  while ((m = re3.exec(html)) && urls.length < count) {
    let u = m[1].replace(/\\u0026/g, "&").replace(/\\\//g, "/");
    if (u.startsWith("http") && !urls.includes(u)) urls.push(u);
  }
  return urls;
}

async function wikiPageImage(lang, title) {
  const api =
    `https://${lang}.wikipedia.org/w/api.php?action=query&format=json&prop=pageimages&piprop=original&titles=` +
    encodeURIComponent(title);
  const j = JSON.parse((await fetchBuf(api)).toString("utf8"));
  const pages = j.query && j.query.pages;
  if (!pages) return null;
  for (const p of Object.values(pages)) {
    if (p.original && p.original.source) return p.original.source;
  }
  return null;
}

async function wikidataP18(name) {
  for (const lang of ["en", "ru"]) {
    const search =
      `https://www.wikidata.org/w/api.php?action=wbsearchentities&format=json&language=${lang}&type=item&limit=5&search=` +
      encodeURIComponent(name);
    const s = JSON.parse((await fetchBuf(search)).toString("utf8"));
    for (const hit of s.search || []) {
      try {
        const ent = JSON.parse(
          (
            await fetchBuf("https://www.wikidata.org/wiki/Special:EntityData/" + hit.id + ".json")
          ).toString("utf8")
        );
        const entity = ent.entities[hit.id];
        const p18 = entity.claims && entity.claims.P18;
        if (!p18 || !p18[0]) continue;
        const file = p18[0].mainsnak.datavalue.value;
        return (
          "https://commons.wikimedia.org/wiki/Special:FilePath/" +
          encodeURIComponent(file) +
          "?width=800"
        );
      } catch (_) {}
    }
  }
  return null;
}

async function findBestPhoto(name) {
  const queries = [name, ...(ALIASES[name] || [])].map((q) => q + " фото");
  queries.push(...(ALIASES[name] || []).map((q) => q + " portrait"));
  queries.push(name + " portrait photo");

  const candidates = [];

  if (DIRECT[name]) candidates.push({ url: DIRECT[name], src: "direct" });

  // Wikipedia / Wikidata first
  for (const q of [name, ...(ALIASES[name] || [])].slice(0, 3)) {
    try {
      const wd = await wikidataP18(q.replace(/ фото$/, ""));
      if (wd) candidates.push({ url: wd, src: "wikidata" });
    } catch (_) {}
    for (const lang of ["ru", "en"]) {
      try {
        const wi = await wikiPageImage(lang, q.replace(/ фото$/, "").replace(/ portrait.*/, ""));
        if (wi) candidates.push({ url: wi, src: "wiki-" + lang });
      } catch (_) {}
    }
  }

  for (const q of queries.slice(0, 6)) {
    try {
      const urls = await bingImageUrls(q, 10);
      for (const u of urls) candidates.push({ url: u, src: "bing:" + q.slice(0, 40) });
    } catch (e) {
      console.log("  bing fail", q, e.message);
    }
  }

  // dedupe
  const seen = new Set();
  const uniq = [];
  for (const c of candidates) {
    if (seen.has(c.url)) continue;
    seen.add(c.url);
    uniq.push(c);
  }

  let best = null;
  for (const c of uniq.slice(0, 25)) {
    try {
      const buf = await fetchBuf(c.url);
      if (buf.length < 4000 || buf.length > 15_000_000) continue;
      // skip obvious non-images
      const head = buf.slice(0, 20).toString("ascii");
      if (head.includes("<!DOC") || head.includes("<html") || head.includes("<?xml")) continue;
      const score = await faceScore(buf);
      if (score < 0) continue;
      if (!best || score > best.score) {
        best = { buf, url: c.url, src: c.src, score };
      }
      // good enough
      if (score > 40) break;
    } catch (_) {}
  }
  return best;
}

async function main() {
  const report = { ok: [], fail: [] };
  console.log("need", NEED.length);

  for (const { name, slug: s } of NEED) {
    const outPath = path.join(OUT, (s || slug(name)) + ".dds");
    process.stdout.write(">> " + name + " ... ");
    try {
      const found = await findBestPhoto(name);
      if (!found) {
        console.log("FAIL");
        report.fail.push(name);
        continue;
      }
      await toPortraitDDS(found.buf, outPath);
      console.log("OK", found.score.toFixed(1), found.src);
      report.ok.push({ name, url: found.url, src: found.src, score: found.score });
    } catch (e) {
      console.log("ERR", e.message);
      report.fail.push(name);
    }
  }

  fs.writeFileSync(path.join(ROOT, "tools/_fill_google_report.json"), JSON.stringify(report, null, 2));
  console.log(JSON.stringify({ ok: report.ok.length, fail: report.fail.length, failed: report.fail }, null, 2));
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
