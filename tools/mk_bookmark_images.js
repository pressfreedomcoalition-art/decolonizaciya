/**
 * Build DEC scenario bookmark DDS (180x104 uncompressed BGRA).
 */
const fs = require("fs");
const path = require("path");
const sharp = require("./node_modules/sharp");

const ASSETS = "C:/Users/Admin/.cursor/projects/c-git-decolonizaciya/assets";
const OUT = "c:/git/decolonizaciya/gfx/interface";

const JOBS = [
  { src: "dec_bookmark_2000.jpg", out: "select_date_dec_2000.dds" },
  { src: "dec_bookmark_2013.jpg", out: "select_date_dec_2013.dds" },
  { src: "dec_bookmark_2022.jpg", out: "select_date_dec_2022.dds" },
];

function writeDDS(bgra, w, h, outPath) {
  const header = Buffer.alloc(128);
  header.write("DDS ", 0);
  header.writeUInt32LE(124, 4);
  // DDSD_CAPS | DDSD_HEIGHT | DDSD_WIDTH | DDSD_PIXELFORMAT | DDSD_PITCH
  header.writeUInt32LE(0x1 | 0x2 | 0x4 | 0x1000 | 0x8, 8);
  header.writeUInt32LE(h, 12);
  header.writeUInt32LE(w, 16);
  header.writeUInt32LE(w * 4, 20);
  header.writeUInt32LE(32, 76); // pf size
  header.writeUInt32LE(0x41, 80); // DDPF_RGB | DDPF_ALPHAPIXELS
  header.writeUInt32LE(32, 88);
  header.writeUInt32LE(0x00ff0000, 92);
  header.writeUInt32LE(0x0000ff00, 96);
  header.writeUInt32LE(0x000000ff, 100);
  header.writeUInt32LE(0xff000000, 104);
  header.writeUInt32LE(0x1000, 108); // DDSCAPS_TEXTURE
  fs.writeFileSync(outPath, Buffer.concat([header, bgra]));
}

(async () => {
  fs.mkdirSync(OUT, { recursive: true });
  for (const job of JOBS) {
    const srcPath = path.join(ASSETS, job.src);
    if (!fs.existsSync(srcPath)) {
      console.error("missing", srcPath);
      process.exit(1);
    }
    const { data, info } = await sharp(srcPath)
      .resize(180, 104, { fit: "cover", position: "attention" })
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
    const outPath = path.join(OUT, job.out);
    writeDDS(bgra, info.width, info.height, outPath);
    console.log("wrote", outPath, info.width, "x", info.height, fs.statSync(outPath).size);
  }
})();
