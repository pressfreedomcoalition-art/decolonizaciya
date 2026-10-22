const fs = require("fs");
const path = require("path");
const need = JSON.parse(fs.readFileSync("c:/git/decolonizaciya/tools/_need_named.json"));
const needSet = new Set(need.map((n) => n.name));
const hist = "c:/git/decolonizaciya/history/countries";
const out = [];
for (const f of fs.readdirSync(hist).filter((x) => x.endsWith(".txt"))) {
  const t = fs.readFileSync(path.join(hist, f), "utf8");
  const country = f.replace(/\.txt$/, "");
  for (const block of t.matchAll(/create_country_leader = \{[\s\S]*?\n\t\}/g)) {
    const b = block[0];
    const name = (b.match(/name = "([^"]+)"/) || [])[1];
    if (!name || !needSet.has(name)) continue;
    const ideo = (b.match(/ideology = (\S+)/) || [])[1];
    out.push({ country, name, ideo });
  }
}
// Deni Teps from scripted effects
if (needSet.has("Deni Teps")) out.push({ country: "CHE", name: "Deni Teps", ideo: "liberalism" });
console.log(JSON.stringify(out, null, 2));
fs.writeFileSync("c:/git/decolonizaciya/tools/_need_context.json", JSON.stringify(out, null, 2));
