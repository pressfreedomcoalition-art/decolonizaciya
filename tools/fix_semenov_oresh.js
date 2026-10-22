const https = require("https");
const fs = require("fs");
const sharp = require("sharp");
const path = require("path");

const UA = "Mozilla/5.0";
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

async function toDDS(buf, outPath, gravity = "attention") {
  const { data, info } = await sharp(buf)
    .rotate()
    .resize(160, 210, { fit: "cover", position: gravity })
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

async function save(slug, url, gravity = "attention") {
  const buf = await fetchBuf(url);
  await toDDS(buf, path.join(OUT, slug + ".dds"), gravity);
  await sharp(buf)
    .rotate()
    .resize(160, 210, { fit: "cover", position: gravity })
    .png()
    .toFile(path.join(PREV, slug + ".png"));
  console.log("OK", slug, buf.length);
}

async function main() {
  // Semenov with Kara-Murza — crop left (Semenov)
  await save(
    "dmitry_semenov",
    "https://gdb.rferl.org/ae5f433f-64ef-4423-a48a-5b01dd8bc5c0_cx0_cy33_cw72_w1200_h630.jpg",
    "left"
  );

  // Telegram avatars
  for (const page of [
    "https://t.me/oreshnikov_mishi",
    "https://t.me/s/oreshnikov_mishi",
    "https://t.me/asmodaus_om",
  ]) {
    try {
      const html = (await fetchBuf(page)).toString("utf8");
      const imgs = [...html.matchAll(/https:\/\/cdn\d*\.telesco\.pe\/file\/[^"'\\\s>]+/g)].map(
        (m) => m[0]
      );
      console.log(page, "imgs", imgs.length, imgs[0] && imgs[0].slice(0, 60));
      if (imgs[0]) {
        await save("mishshi_oreshnikov", imgs[0], "attention");
        break;
      }
    } catch (e) {
      console.log("tg fail", page, e.message);
    }
  }

  // Activatica Kochkin portraits — try all, keep first face-like
  const act = [
    "https://storage.googleapis.com/activatica/uploads/admin/835527a8-fce2-475c-a34d-471fb7ea8de6.jpg",
    "https://storage.googleapis.com/activatica/uploads/admin/4b555347-bc61-4d9f-8736-3d717ff1ee84.jpg",
    "https://storage.googleapis.com/activatica/uploads/admin/f0ebae77-b23d-432f-9165-48941cc93b3f.jpg",
    "https://storage.googleapis.com/activatica/uploads/admin/c80c6381-2f72-46aa-9435-0d41e3488a0c.jpg",
    "https://storage.googleapis.com/activatica/uploads/admin/0a790bc4-baf6-462b-8c8a-7785df8e33f3.jpg",
  ];
  for (let i = 0; i < act.length; i++) {
    try {
      const buf = await fetchBuf(act[i]);
      await sharp(buf)
        .resize(160, 210, { fit: "cover", position: "attention" })
        .png()
        .toFile(path.join(PREV, "kochkin_cand_" + i + ".png"));
      console.log("cand", i, buf.length);
    } catch (e) {
      console.log("cand fail", i, e.message);
    }
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
