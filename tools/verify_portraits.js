/**
 * Fetch portraits: name+party query, take first 3 Bing photos,
 * verify they are the same person via dHash, then write HOI4 DDS.
 */
const fs = require("fs");
const path = require("path");
const https = require("https");
const http = require("http");
const sharp = require("sharp");

const ROOT = "c:/git/decolonizaciya";
const OUT = path.join(ROOT, "gfx/leaders/DEC");
const UA =
  "Mozilla/5.0 (Windows NT 10.0) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36";

const PEOPLE = [
  { name: "Fauzia Bayramova", slug: "fauzia_bayramova", party: "Иттифак", q: ["Фаузия Байрамова Иттифак", "Fauziya Bayramova Ittifaq"] },
  { name: "Farit Zakiev", slug: "farit_zakiev", party: "ВТОЦ", q: ["Фарит Закиев ВТОЦ", "Farit Zakiev VTOC"] },
  { name: "Rafis Kashapov", slug: "rafis_kashapov", party: "Свободный Идель-Урал", q: ["Рафис Кашапов", "Rafis Kashapov Tatar"] },
  { name: "Marat Mulyukov", slug: "marat_mulyukov", party: "ВТОЦ", q: ["Марат Мулюков ВТОЦ", "Marat Mulyukov Tatar"] },
  { name: "Fail Alsynov", slug: "fail_alsynov", party: "Башкорт", q: ["Фаиль Алсынов Башкорт", "Fail Alsynov Bashkort"] },
  { name: "Ruslan Gabbasov", slug: "ruslan_gabbasov", party: "Башкорт", q: ["Руслан Габбасов Башкорт", "Ruslan Gabbasov"] },
  { name: "Aigul Gimranova", slug: "aigul_gimranova", party: "Башкирский нацкомитет", q: ["Айгуль Гимранова-Лион", "Aigul Gimranova Lion"] },
  { name: "Ilnar Galin", slug: "ilnar_galin", party: "Башкорт", q: ["Ильнар Галин Башкорт", "Ilnar Galin Bashkort"] },
  { name: "Vitaly Tanakov", slug: "vitaly_tanakov", party: "Марий Ушем", q: ["Виталий Танаков Марий", "Vitaly Tanakov Mari"] },
  { name: "Anatoly Radygin", slug: "anatoly_radygin", party: "Марий Ушем", q: ["Анатолий Радыгин Марий Ушем", "Anatoly Radygin Mari"] },
  { name: "Vitaly Golovin", slug: "vitaly_golovin", party: "Он Каҥаш", q: ["Виталий Головин мари Онъыжа", "Vitaly Golovin Mari"] },
  { name: "Albert Razin", slug: "albert_razin", party: "Удмурт Кенеш", q: ["Альберт Разин Удмуртия", "Albert Razin Udmurt"] },
  { name: "Sergei Antonov", slug: "sergei_antonov", party: "Свободная Удмуртия", q: ["Сергей Антонов Свободная Удмуртия", "Sergei Antonov Udmurtia"] },
  { name: "Nikolai Suvorov", slug: "nikolai_suvorov", party: "Свободная Удмуртия", q: ["Николай Суворов Свободная Удмуртия", "Nikolai Suvorov Free Udmurtia"] },
  { name: "Alexander Grigoryev", slug: "alexander_grigoryev", party: "Карельское движение", q: ["Александр Григорьев Карельское движение", "Alexander Grigoryev Karelia national"] },
  { name: "Vasiliy Popov", slug: "vasiliy_popov", party: "Яблоко Карелия", q: ["Василий Попов Яблоко Карелия", "Vasiliy Popov Yabloko Karelia"] },
  { name: "Oleg Mikhailov", slug: "oleg_mikhailov", party: "КПРФ Коми", q: ["Олег Михайлов Коми Госсовет", "Oleg Mikhailov Komi"] },
  { name: "Valery Markov", slug: "valery_markov", party: "Коми войтыр", q: ["Валерий Марков Коми войтыр", "Valery Markov Komi Voityr"] },
  { name: "Asker Sokht", slug: "asker_sokht", party: "Адыгэ Хасэ", q: ["Аскер Сохт Адыгэ Хасэ", "Asker Sokht"] },
  { name: "Ibrahim Yaganov", slug: "ibrahim_yaganov", party: "Хасэ", q: ["Ибрагим Яганов Хасэ", "Ibrahim Yaganov Circassian"] },
];

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
          Accept: "image/avif,image/webp,image/*,*/*;q=0.8",
          Referer: "https://www.bing.com/",
        },
        timeout: 25000,
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

async function bingImageUrls(query, count = 8) {
  const url =
    "https://www.bing.com/images/search?q=" + encodeURIComponent(query) + "&form=HDRSC2&first=1";
  const html = (await fetchBuf(url)).toString("utf8");
  const urls = [];
  const re = /murl":"([^"]+)"/g;
  let m;
  while ((m = re.exec(html)) && urls.length < count) {
    const u = m[1].replace(/\\u0026/g, "&").replace(/\\\//g, "/");
    if (u.startsWith("http") && !urls.includes(u)) urls.push(u);
  }
  const re2 = /murl&quot;:&quot;(https?:\/\/[^&]+?)&quot;/g;
  while ((m = re2.exec(html)) && urls.length < count) {
    const u = m[1].replace(/\\u0026/g, "&").replace(/\\\//g, "/");
    if (!urls.includes(u)) urls.push(u);
  }
  return urls;
}

async function wikiOriginal(lang, title) {
  const api =
    `https://${lang}.wikipedia.org/w/api.php?action=query&format=json&prop=pageimages&piprop=original&titles=` +
    encodeURIComponent(title);
  const j = JSON.parse((await fetchBuf(api)).toString("utf8"));
  for (const p of Object.values((j.query && j.query.pages) || {})) {
    if (p.original && p.original.source) return p.original.source;
  }
  return null;
}

async function dhash(buf) {
  const { data } = await sharp(buf).greyscale().resize(9, 8, { fit: "fill" }).raw().toBuffer({ resolveWithObject: true });
  const bits = [];
  for (let y = 0; y < 8; y++) {
    for (let x = 0; x < 8; x++) bits.push(data[y * 9 + x] < data[y * 9 + x + 1] ? 1 : 0);
  }
  return bits;
}

function hamming(a, b) {
  let d = 0;
  for (let i = 0; i < a.length; i++) if (a[i] !== b[i]) d++;
  return d;
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

async function loadImage(url) {
  const buf = await fetchBuf(url);
  if (buf.length < 5000 || buf.length > 12_000_000) throw new Error("size");
  const head = buf.slice(0, 16).toString("ascii");
  if (head.includes("<!DOC") || head.includes("<html")) throw new Error("html");
  await sharp(buf).metadata();
  return buf;
}

async function collectThree(person) {
  const urls = [];
  for (const q of person.q) {
    try {
      const found = await bingImageUrls(q + " фото", 6);
      for (const u of found) if (!urls.includes(u)) urls.push(u);
    } catch (_) {}
  }
  for (const title of [person.name, person.q[0]]) {
    for (const lang of ["ru", "en"]) {
      try {
        const w = await wikiOriginal(lang, title);
        if (w && !urls.includes(w)) urls.unshift(w);
      } catch (_) {}
    }
  }
  const imgs = [];
  for (const u of urls) {
    if (imgs.length >= 6) break;
    try {
      const buf = await loadImage(u);
      const hash = await dhash(buf);
      imgs.push({ url: u, buf, hash });
    } catch (_) {}
  }
  return imgs;
}

function bestCluster(imgs, maxDist = 22) {
  if (imgs.length === 0) return null;
  if (imgs.length === 1) return { ok: false, reason: "only_one", pick: imgs[0], dist: [] };
  let best = null;
  for (let i = 0; i < imgs.length; i++) {
    for (let j = i + 1; j < imgs.length; j++) {
      const d12 = hamming(imgs[i].hash, imgs[j].hash);
      for (let k = j + 1; k < imgs.length; k++) {
        const d13 = hamming(imgs[i].hash, imgs[k].hash);
        const d23 = hamming(imgs[j].hash, imgs[k].hash);
        const avg = (d12 + d13 + d23) / 3;
        const allClose = d12 <= maxDist && d13 <= maxDist && d23 <= maxDist;
        const twoClose = [d12, d13, d23].filter((d) => d <= maxDist).length >= 2;
        if (!best || avg < best.avg) {
          best = { i, j, k, d12, d13, d23, avg, allClose, twoClose };
        }
      }
    }
  }
  if (!best) {
    const d = hamming(imgs[0].hash, imgs[1].hash);
    return { ok: d <= maxDist, reason: d <= maxDist ? "pair" : "mismatch", pick: imgs[0], dist: [d] };
  }
  const pick = imgs[best.i];
  return {
    ok: best.allClose || best.twoClose,
    reason: best.allClose ? "triple_match" : best.twoClose ? "two_of_three" : "mismatch",
    pick,
    dist: [best.d12, best.d13, best.d23],
  };
}

async function main() {
  const report = [];
  for (const p of PEOPLE) {
    process.stdout.write(p.name + " ... ");
    try {
      const imgs = await collectThree(p);
      const cluster = bestCluster(imgs);
      if (!cluster || !cluster.pick) {
        console.log("FAIL no images");
        report.push({ name: p.name, ok: false, reason: "no_images" });
        continue;
      }
      await toPortraitDDS(cluster.pick.buf, path.join(OUT, p.slug + ".dds"));
      console.log(cluster.reason, "d=" + cluster.dist.join("/"), cluster.ok ? "VERIFIED" : "WEAK");
      report.push({
        name: p.name,
        ok: cluster.ok,
        reason: cluster.reason,
        dist: cluster.dist,
        url: cluster.pick.url,
        n: imgs.length,
      });
    } catch (e) {
      console.log("ERR", e.message);
      report.push({ name: p.name, ok: false, reason: e.message });
    }
  }
  fs.writeFileSync(path.join(ROOT, "tools/_portrait_verify.json"), JSON.stringify(report, null, 2));
  const weak = report.filter((r) => !r.ok);
  console.log("verified", report.filter((r) => r.ok).length, "weak", weak.length);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
