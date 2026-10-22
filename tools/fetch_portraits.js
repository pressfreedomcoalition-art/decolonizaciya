/**
 * Re-fetch portraits using Wikipedia pageimages API (reliable thumbs).
 * Converts to 160x210 uncompressed DDS.
 */
const fs = require("fs");
const path = require("path");
const https = require("https");
const http = require("http");
const sharp = require("sharp");

const ROOT = "c:/git/decolonizaciya";
const OUT = path.join(ROOT, "gfx/leaders/DEC");
const HIST = path.join(ROOT, "history/countries");
const UA = "DecolonizaciyaMod/1.0 (https://github.com/local; portraits for HOI4 mod)";

fs.mkdirSync(OUT, { recursive: true });

/** English name → wiki titles to try [lang, title] */
const WIKI = [
  ["Akhmed Zakayev", "ru", "Закаев, Ахмед Халидович"],
  ["Akhmed Zakayev", "en", "Akhmed Zakayev"],
  ["Syres Bolyaen", "ru", "Боляень Сыресь"],
  ["Ruslan Gabbasov", "ru", "Габбасов, Руслан Раисович"],
  ["Ruslan Gabbasov", "en", "Ruslan Gabbasov"],
  ["Rafis Kashapov", "ru", "Кашапов, Рафис Рафаилович"],
  ["Rafis Kashapov", "en", "Rafis Kashapov"],
  ["Pavel Sulyandziga", "ru", "Суляндзига, Павел Васильевич"],
  ["Sergei Furgal", "ru", "Фургал, Сергей Иванович"],
  ["Sergei Furgal", "en", "Sergei Furgal"],
  ["Yevgeny Roizman", "ru", "Ройзман, Евгений Вадимович"],
  ["Yevgeny Roizman", "en", "Yevgeny Roizman"],
  ["Aleksandr Barkashov", "ru", "Баркашов, Александр Петрович"],
  ["Aleksandr Barkashov", "en", "Alexander Barkashov"],
  ["Anton Bakov", "ru", "Баков, Антон Алексеевич"],
  ["Anton Bakov", "en", "Anton Bakov"],
  ["Eduard Kokoity", "ru", "Кокойты, Эдуард Джабеевич"],
  ["Eduard Kokoity", "en", "Eduard Kokoity"],
  ["Anatoly Bibilov", "ru", "Бибилов, Анатолий Ильич"],
  ["Anatoly Bibilov", "en", "Anatoly Bibilov"],
  ["Alan Gagloyev", "ru", "Гаглоев, Алан Эдуардович"],
  ["Alan Gagloyev", "en", "Alan Gagloev"],
  ["Oleksiy Goncharenko", "uk", "Гончаренко Олексій Олексійович"],
  ["Oleksiy Goncharenko", "en", "Oleksiy Goncharenko"],
  ["Dmitry Gudkov", "ru", "Гудков, Дмитрий Геннадьевич"],
  ["Dmitry Gudkov", "en", "Dmitry Gudkov"],
  ["Ivan Zhdanov", "ru", "Жданов, Иван Юрьевич"],
  ["Ivan Zhdanov", "en", "Ivan Zhdanov"],
  ["Roman Yuneman", "ru", "Юнеман, Роман Александрович"],
  ["Andrei Klychkov", "ru", "Клычков, Андрей Евгеньевич"],
  ["Nikolai Fyodorov", "ru", "Фёдоров, Николай Васильевич (политик)"],
  ["Boris Ebzeyev", "ru", "Эбзеев, Борис Сафарович"],
  ["Fauzia Bayramova", "ru", "Байрамова, Фаузия Аухадиевна"],
  ["Ibrahim Yaganov", "ru", "Яганов, Ибрагим"],
  ["Pavel Ivlev", "ru", "Ивлев, Павел Петрович"],
  ["Andriy Illienko", "uk", "Іллєнко Андрій Юрійович"],
  ["Pavlo Vyshebaba", "uk", "Вишебаба Павло Олександрович"],
  ["Olga Alimova", "ru", "Алимова, Ольга Николаевна"],
  ["Aleksei Manannikov", "ru", "Мананников, Алексей Петрович"],
  ["Ilyas Akhmadov", "ru", "Ахмадов, Ильяс Хож-Махмедович"],
  ["Ilyas Akhmadov", "en", "Ilyas Akhmadov"],
  ["Mariz Kemal", "ru", "Маризь Кемаль"],
  ["Andrei Lugovoy", "ru", "Луговой, Андрей Константинович"],
  ["Vladimir Netesov", "ru", "Нетесов, Владимир Иванович"],
  ["Valentin Shurchanov", "ru", "Шурчанов, Валентин Сергеевич"],
  ["David Sanakoyev", "ru", "Санакоев, Давид Георгиевич"],
  ["Murat Berzegov", "ru", "Берзегов, Мурат Пшимафович"],
  ["Asker Sokht", "ru", "Сохт, Аскер"],
  ["Kshumantsyan Pirguzh", "ru", "Кшуманцянь Пиргуж"],
  ["Grigory Musalyov", "ru", "Кшуманцянь Пиргуж"],
  ["Roman Khudyakov", "ru", "Худяков, Роман Иванович"],
  ["Maxim Kuzakhmetov", "ru", "Кузахметов, Максим"],
  ["Pavel Mezerin", "ru", "Мезерин, Павел"],
  ["Deni Teps", "ru", "Тепс Дени"],
  ["Mishshi Oreshnikov", "ru", "Орешников, Михаил Викторович"],
  ["Vladislav Zhivitsa", "ru", "Живица Владислав"],
  ["Ilya Kostyukov", "ru", "Костюков Илья"],
  ["Ruslan Keshev", "ru", "Кешев Руслан"],
  ["Nafis Kashapov", "ru", "Кашапов Нафис"],
  ["Farit Zakiev", "ru", "Закиев Фарит"],
  ["Yana Tannagasheva", "ru", "Таннагашева Яна"],
  ["Dmitry Berezhkov", "ru", "Бережков Дмитрий"],
  ["Pavel Sulyandziga", "en", "Pavel Sulyandziga"],
  ["Aida Abdrakhmanova", "ru", "Абдрахманова Аида"],
  ["Taulan Salpagarov", "ru", "Салпагаров Таулан"],
  ["Vladislav Nobel-Oleynik", "ru", "Олейник Владислав"],
  ["Ansar Garkho", "ru", "Гаркхо Ансар"],
  ["Yevgeny Bursanidis", "ru", "Бурсанидис Евгений"],
  ["Dmitry Dorovskikh", "ru", "Доровских Дмитрий"],
  ["Irina Shafrannik", "ru", "Шафранник Ирина"],
  ["Andrei Danilov", "ru", "Данилов Андрей саами"],
  ["Tjan Zaotschnaja", "ru", "Заочная Тьян"],
  ["Vitaliy Romashkin", "ru", "Ромашкин Виталий"],
  ["Donisi Chovganon", "ru", "Ковалёв Денис мокша"],
  ["Anvar Kurmanakaev", "ru", "Курманакаев Анвар"],
  ["Rizvan Kubakaev", "ru", "Кубакаев Ризван"],
  ["Vladimir Miroshnichenko", "ru", "Мирошниченко Владимир черкес"],
  ["Beslan Kmuzov", "ru", "Кмузов Беслан"],
  ["Olaf Lappalainen", "fi", "Olaf Lappalainen"],
  ["Nikita Goldin", "ru", "Голдин Никита"],
  ["Yuriy Shcherbachev", "ru", "Щербачев Юрий"],
  ["Ivan Kulenko", "ru", "Куленко Иван"],
  ["Ilya Ignatov", "ru", "Игнатов Илья мари"],
  ["Rodion Evdokimov", "ru", "Евдокимов Родион чувашия"],
  ["Sergei Revenko", "ru", "Ревенко Сергей Яблоко"],
  ["Sergei Rudakov", "ru", "Рудаков Сергей Воронеж"],
  ["Yevgeny Dremov", "ru", "Дрёмов Евгений"],
  ["Yevgeny Mozgovskoy", "ru", "Мозговской Евгений"],
  ["Aleksandr Kharybin", "ru", "Харыбин Александр"],
  ["Valery Shevlyakov", "ru", "Шевляков Валерий"],
  ["Andrei Kuznetsov", "ru", "Кузнецов Андрей Смоленск"],
  ["Pavel Konkov", "ru", "Коньков Павел"],
  ["Igor Kazakov", "ru", "Казаков Игорь Воронеж"],
  ["Sergei Ivanov", "ru", "Иванов Сергей политик"],
  ["Sergei Kapchuk", "ru", "Капчук Сергей"],
  ["Aleksei Kudryashov", "ru", "Кудряшов Алексей"],
  ["Dmitry Semenov", "ru", "Семёнов Дмитрий"],
  ["Aleksei Kazakov", "ru", "Казаков Алексей"],
  ["Nina Aleshina", "ru", "Алёшина Нина"],
  ["Pavel Grishin", "ru", "Гришин Павел"],
  ["Aleksandr Adamov", "ru", "Адамов Александр"],
  ["Vladimir Kemaikin", "ru", "Кемайкин Владимир"],
  ["Nuyat Vidyay", "ru", "Нуят Видяй"],
  ["Inal Pliev", "ru", "Плиев Инал"],
  ["Ruslan Kuchity", "ru", "Кучиты Руслан"],
  ["Vyacheslav Dzhabiev", "ru", "Джабиев Вячеслав"],
  ["Oleg Zurabov", "ru", "Зурабов Олег"],
  ["Ibragim Guchigov", "ru", "Гучигов Ибрагим"],
  ["Islam Atabiyev", "ru", "Атабиев Ислам"],
  ["Murat Zalikhanov", "ru", "Залиханов Мурат"],
  ["Murat Auezov", "ru", "Ауэзов Мурат"],
  ["Ismail Kerimov", "ru", "Керимов Исмаил"],
  ["Aslanbek Naimanov", "ru", "Найманов Асланбек"],
  ["Magomed Yarlykapov", "ru", "Ярлыкапов Магомед"],
  ["Dzhabrail Mirzoyev", "ru", "Мирзоев Джабраил"],
  ["Muslim Tsebiev", "ru", "Цебиев Муслим"],
  ["Kase Kik", "ru", "Касе Кик"],
  ["Mikhail Kalyamin", "ru", "Калямин Михаил"],
  ["Denis Ugryumov", "ru", "Угрюмов Денис"],
  ["Artur Ankkalainen", "fi", "Artur Ankkalainen"],
  ["Linus Linsen", "fi", "Linus Linsen"],
  ["Yelena Kaminskaya", "ru", "Каминская Елена"],
  ["Konstantin Klimashevsky", "ru", "Климашевский Константин"],
  ["Ilnar Garifullin", "ru", "Гарифуллин Ильнар"],
  ["Ivan Grigoryev", "ru", "Григорьев Иван"],
  ["Farit Zakiev", "tt", "Зәкиев"],
];

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
          const next = new URL(res.headers.location, url).toString();
          res.resume();
          return resolve(fetchBuf(next, redirects + 1));
        }
        if (res.statusCode !== 200) {
          res.resume();
          return reject(new Error(`HTTP ${res.statusCode}`));
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

async function pageImage(lang, title) {
  const api =
    `https://${lang}.wikipedia.org/w/api.php?action=query&format=json&prop=pageimages&piprop=thumbnail|original&pithumbsize=800&redirects=1&titles=` +
    encodeURIComponent(title);
  const j = await fetchJson(api);
  const pages = j.query && j.query.pages;
  if (!pages) return null;
  const page = Object.values(pages)[0];
  if (!page || page.missing != null) return null;
  if (page.original && page.original.source) return page.original.source;
  if (page.thumbnail && page.thumbnail.source) return page.thumbnail.source;
  return null;
}

async function commonsFilePath(fileTitle) {
  // fileTitle like "File:Foo.jpg"
  const name = fileTitle.replace(/^File:/, "");
  return `https://commons.wikimedia.org/wiki/Special:FilePath/${encodeURIComponent(name)}?width=800`;
}

async function commonsSearch(name) {
  const url =
    "https://commons.wikimedia.org/w/api.php?action=query&list=search&srnamespace=6&srlimit=8&format=json&srsearch=" +
    encodeURIComponent(`"${name}" OR ${name}`);
  const j = await fetchJson(url);
  for (const h of (j.query && j.query.search) || []) {
    try {
      const u = await commonsFilePath(h.title);
      const buf = await fetchBuf(u);
      if (buf.length > 2000) return buf;
    } catch (_) {}
  }
  return null;
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
  await toPortraitDDS(await sharp(Buffer.from(svg)).png().toBuffer(), outPath);
}

function collectNames() {
  const names = new Set();
  for (const f of fs.readdirSync(HIST)) {
    if (!f.endsWith(".txt")) continue;
    const text = fs.readFileSync(path.join(HIST, f), "utf8");
    for (const m of text.matchAll(/name = "([^"]+)"/g)) names.add(m[1]);
  }
  names.add("Deni Teps");
  names.add("Akhmed Zakayev");
  return [...names].sort();
}

async function findImageBuf(name) {
  const tries = WIKI.filter((x) => x[0] === name);
  // also try the English name itself on en/ru
  tries.push([name, "en", name], [name, "ru", name]);
  for (const [, lang, title] of tries) {
    try {
      const url = await pageImage(lang, title);
      if (!url) continue;
      const buf = await fetchBuf(url);
      if (buf.length > 2000) return { buf, url };
    } catch (_) {}
  }
  try {
    const buf = await commonsSearch(name);
    if (buf) return { buf, url: "commons-search" };
  } catch (_) {}
  return null;
}

async function main() {
  const names = collectNames();
  const report = { ok: [], placeholder: [] };
  console.log("total", names.length);

  for (const name of names) {
    const file = slug(name) + ".dds";
    const outPath = path.join(OUT, file);
    try {
      const found = await findImageBuf(name);
      if (found) {
        await toPortraitDDS(found.buf, outPath);
        report.ok.push({ name, file, url: found.url });
        console.log("OK", name);
        continue;
      }
    } catch (e) {
      console.log("err", name, e.message);
    }
    await makePlaceholder(name, outPath);
    report.placeholder.push({ name, file });
    console.log("PH", name);
  }

  // patch history
  for (const f of fs.readdirSync(HIST)) {
    if (!f.endsWith(".txt")) continue;
    let text = fs.readFileSync(path.join(HIST, f), "utf8");
    text = text.replace(/create_country_leader = \{[\s\S]*?\n\t\}/g, (block) => {
      const nm = block.match(/name = "([^"]+)"/);
      if (!nm) return block;
      const pic = `gfx/leaders/DEC/${slug(nm[1])}.dds`;
      let b = block.replace(/\n\t\tpicture = "[^"]+"/g, "");
      if (/desc = "/.test(b)) b = b.replace(/(desc = "[^"]+"\n)/, `$1\t\tpicture = "${pic}"\n`);
      else b = b.replace(/(name = "[^"]+"\n)/, `$1\t\tpicture = "${pic}"\n`);
      return b;
    });
    fs.writeFileSync(path.join(HIST, f), text);
  }

  const se = path.join(ROOT, "common/scripted_effects/DEC_party_leaders.txt");
  if (fs.existsSync(se)) {
    let t = fs.readFileSync(se, "utf8");
    for (const n of ["Deni Teps", "Akhmed Zakayev"]) {
      const re = new RegExp(`(name = "${n}"[\\s\\S]*?)picture = "[^"]+"`);
      t = t.replace(re, `$1picture = "gfx/leaders/DEC/${slug(n)}.dds"`);
    }
    fs.writeFileSync(se, t);
  }

  fs.writeFileSync(path.join(ROOT, "tools/portrait_report.json"), JSON.stringify({ total: names.length, ...report }, null, 2));
  console.log(JSON.stringify({ total: names.length, ok: report.ok.length, placeholder: report.placeholder.length }, null, 2));
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
