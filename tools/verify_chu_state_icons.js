const fs = require("fs");
const path = require("path");
const g = "c:/git/decolonizaciya/gfx/interface/goals";
const gfx = fs.readFileSync("c:/git/decolonizaciya/interface/DEC_chu_goals.gfx", "utf8");
const ids = [...gfx.matchAll(/name = "(GFX_DEC_CHU_[^"]+)"/g)].map((m) => m[1].replace("GFX_", ""));
let miss = 0;
for (const id of ids) {
  if (!fs.existsSync(path.join(g, id + ".dds"))) {
    console.log("missing dds", id);
    miss++;
  }
}
console.log("sprites", ids.length, "missing", miss);
const st = fs.readFileSync("c:/git/decolonizaciya/common/national_focus/DEC_chuvash_state.txt", "utf8");
const fids = [...st.matchAll(/^\tid = (DEC_CHU_\w+)/gm)].map((m) => m[1]);
console.log("state focuses", fids.length);
for (const id of fids) {
  if (!gfx.includes("GFX_" + id)) console.log("no gfx", id);
}
