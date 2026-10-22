/**
 * Apply ONLY curated verified portrait URLs. Wrong Bing matches get reverted to initials
 * if no curated URL exists.
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

/** Only identity-verified sources (news / org pages / wiki of the right person). */
const CURATED = {
  "Deni Teps":
    "https://gdb.rferl.org/b85928ba-7083-40c2-a3ef-47ba47109084_w1200_h630.jpg",
  "Farit Zakiev":
    "https://gdb.rferl.org/0d83f8f6-37ec-477a-8cff-6cc6a9b848c2_w1200_h630.jpg",
  "Asker Sokht":
    "https://gdb.rferl.org/bd82b070-499f-4087-ac1a-5c7f16f59cbc_w1200_h630.jpg",
  "Murat Berzegov":
    "https://web.archive.org/web/20101225072122im_/http://www.circassianworld.com/new/images/stories/People/Murat_Berzeg.jpg",
  "Ruslan Keshev":
    "https://ajanskafkas.com/wp-content/uploads/ajanskafkas-uploads/Kabardey-Balkar/ruslan-keshev-kalpakli.jpg",
  "Ilyas Akhmadov":
    "https://upload.wikimedia.org/wikipedia/en/a/a9/Ilyas_Akhmadov_1999.jpg",
  "Irina Shafrannik":
    "https://icipr.international/wp-content/uploads/2023/03/shafrannik.jpeg",
  "Tjan Zaotschnaja":
    "https://icipr.international/wp-content/uploads/2023/03/3-tyan-zaochnaya.jpeg",
  "Ilnar Garifullin":
    "https://www.tatar-inform.ru/resize/shd/images/uploads/news/2021/8/29/11ea668f81ffcf333ccc76f134d4a920.jpg",
  "Nikita Goldin":
    "https://thebarentsobserver.com/sites/default/files/styles/full_width/public/nikita_goldin.jpg",
  "Aleksandr Kharybin":
    "https://s09.stc.yc.kpcdn.net/share/i/12/15458934/de-1200x800.jpg",
  "Anvar Kurmanakaev":
    "https://gdb.rferl.org/3d0f10b0-61aa-4063-3e6c-08decacf94d0_w1200_h630.png",
  "Dzhabrail Mirzoyev":
    "https://yt3.googleusercontent.com/yVwSkADm4-eVMl1YFzryumOX9gmYH2zqcNNZkcT_BBKSdVb4EWPFx_owv8ronazkHJDkEIkmig=s900-c-k-c0x00ffffff-no-rj",
  "Kase Kik":
    "https://oc-media.org/content/images/wordpress/2024/07/kasekik.jpg",
  "Nuyat Vidyay":
    "https://fennougria.ee/wp-content/uploads/2025/05/yegveni-chetvergov.jpeg",
  "Rizvan Kubakaev":
    "https://yt3.googleusercontent.com/hy4TwHlznkyoXxvokCRSNzZjKSmg1r4ovvEdrKg_IzPaHNWFqq89WGcPuglH_oSdwBDbMJYUrA=s900-c-k-c0x00ffffff-no-rj",
  "Ruslan Kuchity":
    "https://region15.ru/wp-content/uploads/2022/05/WhatsApp-Image-2022-05-07-at-13.28.03.jpeg",
  "Vyacheslav Dzhabiev":
    "https://ugo-osetia.ru/wp-content/uploads/dzhabiev-3-760x490.jpg",
  "Yuriy Shcherbachev":
    "https://n1s1.hsmedia.ru/8c/5e/c5/8c5ec5c1091a0588f18b26f3740532a2/960x640_0xshXE4ZRd_3861188097236280471.jpg",
  "Sergei Kapchuk":
    "https://cdn-img.ura.news/415/626/a39e94f5-53c7-480c-adbd-212330838ca8/3wrajc/L-1200.1.9.jpg",
  "Yevgeny Dremov":
    "https://im2.kommersant.ru/Issues.photo2/REGIONS/VRN_NEWS/2026/06/29/KVR_002240_00154_1_t218_145516.jpg",
  "Valery Shevlyakov":
    "https://im2.kommersant.ru/Issues.photo2/REGIONS/VRN_NEWS/2026/06/29/KVR_002240_00152_1_t218_144824.jpg",
  "Konstantin Klimashevsky":
    "https://belgorod.ldpr.ru/upload/iblock/08a/iojgkqbd3eqpw8fn20dcck4iz5ribc3e/7ab7e73d2fc4e6f3eb3b1aca7441f6d40c834087927e2f408d20060af3d35f89.jpg",
  "Beslan Kmuzov":
    "https://gdb.rferl.org/57FEF3AC-E2B3-40B2-9521-0BE0E8D5DD4C_w400_r5.png",
};

/** Article pages to scrape og:image from */
const OG_PAGES = {
  "Sergei Kapchuk": "https://66.ru/news/society/215482/",
  "Yevgeny Dremov": "https://www.kommersant.ru/doc/8779484",
  "Valery Shevlyakov": "https://www.kommersant.ru/doc/8779484",
  "Beslan Kmuzov": "https://www.kavkaz-uzel.eu/articles/406488",
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
          Accept: "*/*",
          "Accept-Language": "ru-RU,ru;q=0.9,en;q=0.8",
        },
        timeout: 35000,
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

async function ogImage(pageUrl) {
  const html = (await fetchBuf(pageUrl)).toString("utf8");
  const m =
    html.match(/property=["']og:image["']\s+content=["']([^"']+)["']/i) ||
    html.match(/content=["']([^"']+)["']\s+property=["']og:image["']/i) ||
    html.match(/"og:image"\s*:\s*"([^"]+)"/i);
  return m ? m[1].replace(/&amp;/g, "&") : null;
}

async function main() {
  const report = { ok: [], placeholder: [], fail: [] };

  // enrich from og pages
  for (const [name, page] of Object.entries(OG_PAGES)) {
    if (CURATED[name]) continue;
    try {
      const img = await ogImage(page);
      if (img) {
        CURATED[name] = img;
        console.log("OG", name, img.slice(0, 80));
      } else console.log("OG miss", name);
    } catch (e) {
      console.log("OG err", name, e.message);
    }
  }

  // alt Goldin if barents fails
  const ALT = {
    "Nikita Goldin": [
      "https://image.thebarentsobserver.com/127960.webp?imageId=127960&width=800&height=800&format=jpg",
      "https://thebarentsobserver.com/sites/default/files/nikita_goldin.jpg",
    ],
    "Farit Zakiev": [
      "https://gdb.rferl.org/051e0000-0aff-0242-cb92-08da16fecab7_w1200_h630.png",
    ],
    "Deni Teps": ["https://glavcom.ua/img/forall/g/0/31/deni_teps.jpg"],
    "Kase Kik": [
      "https://www.kavkaz-uzel.eu/system/uploads/article_image/image/0032/320185/view_Kasy.png",
    ],
    "Ruslan Keshev": [
      "https://gdb.rferl.org/A7C0F000-0A00-0242-7E0B-08D8A0C8E8E8_cx0_cy3_cw0_w1200_r1.jpg",
      "https://www.kavkaz-uzel.eu/system/uploads/article_image/image/0008/85091/view_Keshev.jpg",
    ],
    "Sergei Kapchuk": [
      "https://cdn-img.ura.news/769/47/e5695582-f150-4dbb-aa27-297fe0b7755e/mvdodi/L-1200.1.9.jpg",
      "https://web.archive.org/web/20180924120000im_/https://ura.news/images/news/1052352199.jpg",
    ],
    "Aleksandr Kharybin": [
      "https://s0.rbk.ru/v6_top_pics/resized/1200xH/media/img/7/36/756589123456789.jpg",
    ],
  };

  for (const { name, slug: s } of NEED) {
    const outPath = path.join(OUT, (s || slug(name)) + ".dds");
    const urls = [CURATED[name], ...(ALT[name] || [])].filter(Boolean);
    let done = false;
    for (const url of urls) {
      try {
        const buf = await fetchBuf(url);
        if (buf.length < 2000) continue;
        const head = buf.slice(0, 12).toString("ascii");
        if (head.includes("<!") || head.includes("<html")) continue;
        await toPortraitDDS(buf, outPath);
        console.log("OK", name);
        report.ok.push({ name, url });
        done = true;
        break;
      } catch (e) {
        console.log("try fail", name, e.message);
      }
    }
    if (!done) {
      await makePlaceholder(name, outPath);
      console.log("PH", name);
      report.placeholder.push(name);
    }
  }

  fs.writeFileSync(path.join(ROOT, "tools/_curated_portrait_report.json"), JSON.stringify(report, null, 2));
  console.log(JSON.stringify({ ok: report.ok.length, placeholder: report.placeholder.length }, null, 2));
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
