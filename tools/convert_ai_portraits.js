const fs = require("fs");
const path = require("path");
const sharp = require("./node_modules/sharp");

const assets = "C:/Users/Admin/.cursor/projects/c-git-decolonizaciya/assets";
const out = "c:/git/decolonizaciya/gfx/leaders/DEC";

const map = {
  "ruslan_gabbasov.png": "Ruslan Gabbasov",
  "rafis_kashapov.png": "Rafis Kashapov",
  "mishshi_oreshnikov.png": "Mishshi Oreshnikov",
  "pavel_mezerin.png": "Pavel Mezerin",
  "vladislav_nobel_oleynik.png": "Vladislav Nobel-Oleynik",
  "yevgeny_bursanidis.png": "Yevgeny Bursanidis",
  "vitaliy_romashkin.png": "Vitaliy Romashkin",
  "aida_abdrakhmanova.png": "Aida Abdrakhmanova",
  "yana_tannagasheva.png": "Yana Tannagasheva",
  "maxim_kuzakhmetov.png": "Maxim Kuzakhmetov",
  "dmitry_berezhkov.png": "Dmitry Berezhkov",
  "dmitry_dorovskikh.png": "Dmitry Dorovskikh",
  "nafis_kashapov.png": "Nafis Kashapov",
  "ilya_kostyukov.png": "Ilya Kostyukov",
};

function slug(name) {
  return name
    .normalize("NFKD")
    .replace(/[^\w]+/g, "_")
    .replace(/^_|_$/g, "")
    .toLowerCase();
}

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
  const bad = path.join(out, ".dds");
  if (fs.existsSync(bad)) fs.unlinkSync(bad);

  for (const [file, name] of Object.entries(map)) {
    const src = path.join(assets, file);
    if (!fs.existsSync(src)) {
      console.log("missing", file);
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
    const dest = path.join(out, slug(name) + ".dds");
    writeDDS(bgra, info.width, info.height, dest);
    console.log("OK", slug(name) + ".dds", fs.statSync(dest).size);
  }

  const histDir = "c:/git/decolonizaciya/history/countries";
  const names = new Set();
  for (const f of fs.readdirSync(histDir)) {
    if (!f.endsWith(".txt")) continue;
    const t = fs.readFileSync(path.join(histDir, f), "utf8");
    for (const m of t.matchAll(/name = "([^"]+)"/g)) names.add(m[1]);
  }
  names.add("Deni Teps");
  names.add("Akhmed Zakayev");

  const ai = new Set(Object.values(map));
  const leaders = [...names].sort().map((n) => {
    const file = slug(n) + ".dds";
    const exists = fs.existsSync(path.join(out, file));
    return {
      name: n,
      file,
      exists,
      source: ai.has(n) ? "ai_generated" : "internet_or_stylized",
    };
  });

  fs.writeFileSync(
    "c:/git/decolonizaciya/tools/portrait_report.json",
    JSON.stringify(
      {
        total: leaders.length,
        with_file: leaders.filter((l) => l.exists).length,
        ai_generated: [...ai],
        leaders,
      },
      null,
      2
    )
  );
  console.log(
    "leaders",
    leaders.length,
    "files",
    leaders.filter((l) => l.exists).length,
    "missing",
    leaders.filter((l) => !l.exists).map((l) => l.name)
  );
})();
