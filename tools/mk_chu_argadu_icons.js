const fs = require("fs");
const path = require("path");
const sharp = require("sharp");
const ROOT = "c:/git/decolonizaciya";
const GOAL = path.join(ROOT, "gfx/interface/goals");

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

async function svgToGoal(svg, dest) {
  const { data, info } = await sharp(Buffer.from(svg))
    .resize(90, 90)
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
  writeDDS(bgra, info.width, info.height, dest);
}

function icon(bg1, bg2, motif) {
  return `<svg width="90" height="90" xmlns="http://www.w3.org/2000/svg">
  <defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="1">
    <stop offset="0%" stop-color="${bg1}"/><stop offset="100%" stop-color="${bg2}"/>
  </linearGradient></defs>
  <rect width="90" height="90" rx="8" fill="url(#g)"/>
  <rect x="4" y="4" width="82" height="82" rx="6" fill="none" stroke="#f5e6b8" stroke-width="2" opacity="0.55"/>
  ${motif}
</svg>`;
}

async function main() {
  const icons = {
    DEC_CHU_pol_g_ummah: icon(
      "#1e4a3a",
      "#0e2820",
      `<path d="M45 16 L62 70 L28 70 Z" fill="none" stroke="#e8c547" stroke-width="3"/>
       <circle cx="55" cy="34" r="9" fill="none" stroke="#8fa86a" stroke-width="2"/>`
    ),
    DEC_CHU_pol_p_argadu: icon(
      "#1e4038",
      "#0e2420",
      `<circle cx="45" cy="45" r="24" fill="none" stroke="#e8c547" stroke-width="2"/>
       <path d="M30 45 Q45 25 60 45 Q45 65 30 45" fill="#8fa86a"/>`
    ),
    DEC_CHU_pol_pwr_argadu: icon(
      "#244038",
      "#142420",
      `<path d="M45 16 L62 70 L28 70 Z" fill="#e8c547"/>
       <circle cx="45" cy="48" r="8" fill="#142420"/>`
    ),
  };
  let gfx = fs.readFileSync(path.join(ROOT, "interface/DEC_chu_goals.gfx"), "utf8");
  for (const [id, svg] of Object.entries(icons)) {
    await svgToGoal(svg, path.join(GOAL, id + ".dds"));
    if (!gfx.includes("GFX_" + id)) {
      gfx = gfx.replace(
        /\r?\n}\s*$/,
        `\n\tspriteType = {\n\t\tname = "GFX_${id}"\n\t\ttexturefile = "gfx/interface/goals/${id}.dds"\n\t}\n}\n`
      );
    }
  }
  fs.writeFileSync(path.join(ROOT, "interface/DEC_chu_goals.gfx"), gfx);
  console.log("ok", Object.keys(icons).length);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
