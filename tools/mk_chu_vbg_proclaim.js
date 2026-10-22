const fs = require("fs");
const path = require("path");
const sharp = require("sharp");
const ROOT = "c:/git/decolonizaciya";
const GOAL = path.join(ROOT, "gfx/interface/goals");
const GFX = path.join(ROOT, "interface/DEC_chu_goals.gfx");

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

async function main() {
  const svg = `<svg width="90" height="90" xmlns="http://www.w3.org/2000/svg">
  <defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="1">
    <stop offset="0%" stop-color="#4a3a1e"/><stop offset="100%" stop-color="#261e0e"/>
  </linearGradient></defs>
  <rect width="90" height="90" rx="8" fill="url(#g)"/>
  <rect x="4" y="4" width="82" height="82" rx="6" fill="none" stroke="#f5e6b8" stroke-width="2" opacity="0.55"/>
  <polygon points="45,12 74,72 16,72" fill="#e8c547"/>
  <circle cx="45" cy="48" r="10" fill="#261e0e"/>
  <path d="M12 78 Q45 58 78 78" fill="none" stroke="#6eb5ff" stroke-width="3"/>
</svg>`;
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
  const id = "DEC_CHU_vbg_proclaim";
  writeDDS(bgra, info.width, info.height, path.join(GOAL, id + ".dds"));
  let gfx = fs.readFileSync(GFX, "utf8");
  if (!gfx.includes("GFX_" + id)) {
    gfx = gfx.replace(
      /\r?\n}\s*$/,
      `\n\tspriteType = {\n\t\tname = "GFX_${id}"\n\t\ttexturefile = "gfx/interface/goals/${id}.dds"\n\t}\n}\n`
    );
    fs.writeFileSync(GFX, gfx);
  }
  console.log("ok", id);
}

function appendLoc(file, block, marker) {
  let buf = fs.readFileSync(file);
  const bom = buf.length >= 3 && buf[0] === 0xef && buf[1] === 0xbb && buf[2] === 0xbf;
  let text = bom ? buf.slice(3).toString("utf8") : buf.toString("utf8");
  if (text.includes(marker)) {
    console.log("loc skip", path.basename(file));
    return;
  }
  if (!text.endsWith("\n")) text += "\n";
  text += block;
  const out = Buffer.from(text, "utf8");
  fs.writeFileSync(file, bom ? Buffer.concat([Buffer.from([0xef, 0xbb, 0xbf]), out]) : out);
  console.log("loc +", path.basename(file));
}

main()
  .then(() => {
    appendLoc(
      path.join(ROOT, "localisation/english/DEC_l_english.yml"),
      `
 DEC_CHU_vbg_proclaim: "Proclaim Volga Bulgaria"
 DEC_CHU_vbg_proclaim_desc: "Rename the Chuvash republic as restored Volga Bulgaria — flag, name and Bulgar cores."
 DEC_CHU_vbg_proclaim_tt: "§YBecome Volga Bulgaria§! (cosmetic tag VBG)."
 DEC_CHU_become_vbg_tt: "§YChuvashia becomes Volga Bulgaria.§! Cores of VBG added on owned Bulgar/Chuvash lands."
 DEC_form_volga_bulgaria: "Form Volga Bulgaria"
 DEC_form_volga_bulgaria_desc: "Proclaim continuity with medieval Volga Bulgaria from Cheboksary."
 DEC_form_volga_bulgaria_tt: "§YBecome Volga Bulgaria§! (cosmetic)."
 DEC_form_volga_bulgaria_trigger_tt: "Have taken power in Chuvashia (or unlocked / completed the Bulgar restore focus)."
`,
      "DEC_CHU_vbg_proclaim:"
    );
    appendLoc(
      path.join(ROOT, "localisation/russian/DEC_l_russian.yml"),
      `
 DEC_CHU_vbg_proclaim: "Провозгласить Волжскую Булгарию"
 DEC_CHU_vbg_proclaim_desc: "Переименовать чувашскую республику в восстановленную Волжскую Булгарию — флаг, название и булгарские ядра."
 DEC_CHU_vbg_proclaim_tt: "§YСтать Волжской Булгарией§! (косметический тег VBG)."
 DEC_CHU_become_vbg_tt: "§YЧувашия становится Волжской Булгарией.§! Ядра VBG на подконтрольных булгарских/чувашских землях."
 DEC_form_volga_bulgaria: "Образовать Волжскую Булгарию"
 DEC_form_volga_bulgaria_desc: "Провозгласить преемственность средневековой Волжской Булгарии из Чебоксар."
 DEC_form_volga_bulgaria_tt: "§YСтать Волжской Булгарией§! (косметик)."
 DEC_form_volga_bulgaria_trigger_tt: "Взять власть в Чувашии (или открыть / завершить фокус воссоздания Булгарии)."
`,
      "DEC_CHU_vbg_proclaim:"
    );
  })
  .catch((e) => {
    console.error(e);
    process.exit(1);
  });
