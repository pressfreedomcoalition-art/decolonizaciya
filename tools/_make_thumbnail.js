const fs = require("fs");
const path = require("path");
const sharp = require("sharp");
const src = "C:/Users/Admin/.cursor/projects/c-git-decolonizaciya/assets/WW3_Russian_Invasion_thumb.jpg";
const dest = "c:/git/decolonizaciya/thumbnail.png";
sharp(src).resize(512, 512, { fit: "cover" }).png().toFile(dest).then(() => console.log("thumbnail", dest, fs.statSync(dest).size));
