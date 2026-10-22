const fs = require("fs");
const path = require("path");

const need = JSON.parse(fs.readFileSync("c:/git/decolonizaciya/tools/_need_portraits.json"));
const report = JSON.parse(fs.readFileSync("c:/git/decolonizaciya/tools/portrait_report.json"));
const map = {};
for (const L of report.leaders || []) {
  map[L.file.replace(".dds", "")] = L.name;
}
const histDir = "c:/git/decolonizaciya/history/countries";
const names = new Set(["Deni Teps", "Akhmed Zakayev"]);
for (const f of fs.readdirSync(histDir).filter((x) => x.endsWith(".txt"))) {
  const t = fs.readFileSync(path.join(histDir, f), "utf8");
  for (const m of t.matchAll(/name = "([^"]+)"/g)) names.add(m[1]);
}
function slug(name) {
  return name
    .normalize("NFKD")
    .replace(/[^\w]+/g, "_")
    .replace(/^_|_$/g, "")
    .toLowerCase();
}
for (const n of names) map[slug(n)] = n;

const pairs = need.map((r) => ({ slug: r.slug, name: map[r.slug] || r.slug }));
fs.writeFileSync("c:/git/decolonizaciya/tools/_need_named.json", JSON.stringify(pairs, null, 2));
console.log(pairs.map((p) => p.name).join("\n"));
console.log("count", pairs.length);
