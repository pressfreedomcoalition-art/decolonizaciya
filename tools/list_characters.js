const fs = require("fs");
const path = require("path");

const histDir = "c:/git/decolonizaciya/history/countries";
const report = JSON.parse(fs.readFileSync("c:/git/decolonizaciya/tools/portrait_report.json", "utf8"));
const ai = new Set(report.ai_generated || []);

const byTag = {};
for (const f of fs.readdirSync(histDir)) {
  if (!f.endsWith(".txt")) continue;
  const tag = f.split(" - ")[0];
  const country = f.replace(/\.txt$/, "").replace(/^[A-Z]+ - /, "");
  const text = fs.readFileSync(path.join(histDir, f), "utf8");
  const leaders = [];
  const blocks = text.match(/create_country_leader = \{[\s\S]*?\n\t\}/g) || [];
  for (const b of blocks) {
    const name = (b.match(/name = "([^"]+)"/) || [])[1];
    const ideology = (b.match(/ideology = (\S+)/) || [])[1];
    const picture = (b.match(/picture = "([^"]+)"/) || [])[1];
    if (!name) continue;
    leaders.push({
      name,
      ideology,
      picture,
      portrait: ai.has(name) ? "AI (нет публичного фото)" : "интернет / wiki / стилизация",
    });
  }
  byTag[tag] = { country, leaders };
}

// CHE extras
byTag.CHE = {
  country: "Chechnya (MD + DEC on_startup)",
  leaders: [
    { name: "Deni Teps", ideology: "liberalism", portrait: "интернет / wiki / стилизация" },
    { name: "Akhmed Zakayev", ideology: "Nat_Populism", portrait: "интернет / wiki" },
  ],
};

fs.writeFileSync(
  "c:/git/decolonizaciya/tools/characters_list.json",
  JSON.stringify(byTag, null, 2)
);

const unique = new Map();
for (const [tag, v] of Object.entries(byTag)) {
  for (const l of v.leaders) {
    if (!unique.has(l.name)) unique.set(l.name, []);
    unique.get(l.name).push(tag + "/" + l.ideology);
  }
}

console.log("TAGS", Object.keys(byTag).length);
console.log("UNIQUE", unique.size);
console.log(
  JSON.stringify(
    [...unique.entries()]
      .sort((a, b) => a[0].localeCompare(b[0]))
      .map(([name, slots]) => ({ name, slots })),
    null,
    2
  )
);
