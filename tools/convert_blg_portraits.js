const fs = require("fs");
const path = require("path");
const sharp = require("./node_modules/sharp");

const assets = "C:/Users/Admin/.cursor/projects/c-git-decolonizaciya/assets";
const out = "c:/git/decolonizaciya/gfx/leaders/DEC";

const map = {
  "vadim_nikiforov.png": "vadim_nikiforov.dds",
  "denis_olenov.png": "denis_olenov.dds",
  "oleg_elkin.png": "oleg_elkin.dds",
  "semyon_kochkin.png": "semyon_kochkin.dds",
  "dmitry_karuev.png": "dmitry_karuev.dds",
  "white_chuvashia_council.png": "white_chuvashia_council.dds",
};

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

(async () => {
  for (const [srcName, destName] of Object.entries(map)) {
    const src = path.join(assets, srcName);
    if (!fs.existsSync(src)) {
      console.log("missing", srcName);
      continue;
    }
    const { data, info } = await sharp(src)
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
    const dest = path.join(out, destName);
    writeDDS(bgra, info.width, info.height, dest);
    console.log("OK", destName);
  }
})();
