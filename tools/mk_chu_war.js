const fs = require("fs");
const path = require("path");
const sharp = require("sharp");
const ROOT = "c:/git/decolonizaciya";
const ASSETS = "C:/Users/Admin/.cursor/projects/c-git-decolonizaciya/assets";
const GOAL_DIR = path.join(ROOT, "gfx/interface/goals");

function writeUncompressedDDS(bgra, width, height, outPath) {
  const header = Buffer.alloc(128);
  header.write("DDS ", 0);
  header.writeUInt32LE(124, 4);
  header.writeUInt32LE(0x1 | 0x2 | 0x4 | 0x1000 | 0x8, 8);
  header.writeUInt32LE(height, 12);
  header.writeUInt32LE(width, 16);
  header.writeUInt32LE(width * 4, 20);
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

async function jpgToGoalDDS(src, dest) {
  const { data, info } = await sharp(src)
    .rotate()
    .resize(90, 90, { fit: "cover", position: "attention" })
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
  writeUncompressedDDS(bgra, info.width, info.height, dest);
}

function appendLoc(file, block) {
  let buf = fs.readFileSync(file);
  const bom = buf.length >= 3 && buf[0] === 0xef && buf[1] === 0xbb && buf[2] === 0xbf;
  let text = bom ? buf.slice(3).toString("utf8") : buf.toString("utf8");
  if (!text.endsWith("\n")) text += "\n";
  if (text.includes("DEC_CHU_war_in:")) return;
  text += block;
  const out = Buffer.from(text, "utf8");
  fs.writeFileSync(file, bom ? Buffer.concat([Buffer.from([0xef, 0xbb, 0xbf]), out]) : out);
}

async function main() {
  const icons = ["DEC_CHU_war_in", "DEC_CHU_war_diaspora", "DEC_CHU_war_dn"];
  for (const id of icons) {
    await jpgToGoalDDS(path.join(ASSETS, id + ".jpg"), path.join(GOAL_DIR, id + ".dds"));
  }
  const gfxPath = path.join(ROOT, "interface/DEC_chu_goals.gfx");
  let gfx = fs.readFileSync(gfxPath, "utf8");
  if (!gfx.includes("GFX_DEC_CHU_war_in")) {
    const extra = icons
      .map((id) => `\tspriteType = {\n\t\tname = "GFX_${id}"\n\t\ttexturefile = "gfx/interface/goals/${id}.dds"\n\t}`)
      .join("\n");
    gfx = gfx.replace(/\r?\n}\s*$/, "\n" + extra + "\n}\n");
    fs.writeFileSync(gfxPath, gfx);
  }

  appendLoc(
    path.join(ROOT, "localisation/russian/DEC_l_russian.yml"),
    `
 DEC_CHU_war_in: "Чувашия в войне"
 DEC_CHU_war_in_desc: "Пока идёт война, Чувашия может выжать мобилизацию. Фокус доступен только в войне."
 DEC_CHU_war_in_tt: "§G+100 000§! человек."
 DEC_CHU_war_diaspora: "Призыв чувашей со всего мира"
 DEC_CHU_war_diaspora_desc: "Диаспора возвращается: резерв пополняется массово."
 DEC_CHU_war_diaspora_tt: "§G+500 000§! человек."
 DEC_CHU_war_chuvash: "Война по-чувашски"
 DEC_CHU_war_chuvash_desc: "Каждый месяц войны можно заказать удар Частной Чувашской Армии Дронов через DeathNote.Rip — случайный персонаж противника, включая правителя, погибает."
 DEC_CHU_war_chuvash_tt: "§YПока идёт война, каждый месяц: эвент «Заказать виновного в войне у DeathNote.Rip».§!"
 dec_chu_dn.1.t: "Заказать виновного в войне у DeathNote.Rip"
 dec_chu_dn.1.d: "Частная Чувашская Армия Дронов ждёт заказ. Выберите противника в этой войне: у него погибнет случайный персонаж — генерал, советник или сам правитель."
 dec_chu_dn.1.e1: "[DEC_chu_dn_e1.GetName]"
 dec_chu_dn.1.e2: "[DEC_chu_dn_e2.GetName]"
 dec_chu_dn.1.e3: "[DEC_chu_dn_e3.GetName]"
 dec_chu_dn.1.e4: "[DEC_chu_dn_e4.GetName]"
 dec_chu_dn.1.e5: "[DEC_chu_dn_e5.GetName]"
 dec_chu_dn.1.e6: "[DEC_chu_dn_e6.GetName]"
 dec_chu_dn.1.skip: "Отложить заказ"
 dec_chu_dn.2.t: "Атака Частной Чувашской Армии Дронов"
 dec_chu_dn.2.d: "По заказу DeathNote.Rip чувашские дроны нанесли удар. Один из наших персонажей — возможно, правитель — погиб."
 dec_chu_dn.2.a: "Это война."
 DEC_CHU_dn_order_sent_tt: "§YЗаказ DeathNote.Rip отправлен.§!"
 DEC_CHU_dn_kill_random_tt: "§RСлучайный персонаж погибает (включая правителя).§!"
`
  );
  appendLoc(
    path.join(ROOT, "localisation/english/DEC_l_english.yml"),
    `
 DEC_CHU_war_in: "Chuvashia at War"
 DEC_CHU_war_in_desc: "While the war lasts, Chuvashia can squeeze out a mobilisation. This focus is only available in wartime."
 DEC_CHU_war_in_tt: "§G+100,000§! manpower."
 DEC_CHU_war_diaspora: "Call-up of the Chuvash of the World"
 DEC_CHU_war_diaspora_desc: "The diaspora returns: the reserve is filled in bulk."
 DEC_CHU_war_diaspora_tt: "§G+500,000§! manpower."
 DEC_CHU_war_chuvash: "War the Chuvash Way"
 DEC_CHU_war_chuvash_desc: "Every month of war you may order a Private Chuvash Drone Army strike via DeathNote.Rip — a random character of the enemy, including the ruler, dies."
 DEC_CHU_war_chuvash_tt: "§YWhile at war, each month: the event 'Order a war culprit from DeathNote.Rip'.§!"
 dec_chu_dn.1.t: "Order a war culprit from DeathNote.Rip"
 dec_chu_dn.1.d: "The Private Chuvash Drone Army awaits an order. Choose a wartime opponent: a random character of theirs — general, advisor, or the ruler — will die."
 dec_chu_dn.1.e1: "[DEC_chu_dn_e1.GetName]"
 dec_chu_dn.1.e2: "[DEC_chu_dn_e2.GetName]"
 dec_chu_dn.1.e3: "[DEC_chu_dn_e3.GetName]"
 dec_chu_dn.1.e4: "[DEC_chu_dn_e4.GetName]"
 dec_chu_dn.1.e5: "[DEC_chu_dn_e5.GetName]"
 dec_chu_dn.1.e6: "[DEC_chu_dn_e6.GetName]"
 dec_chu_dn.1.skip: "Postpone the order"
 dec_chu_dn.2.t: "Private Chuvash Drone Army strike"
 dec_chu_dn.2.d: "On a DeathNote.Rip order, Chuvash drones struck. One of our characters — possibly the ruler — is dead."
 dec_chu_dn.2.a: "This is war."
 DEC_CHU_dn_order_sent_tt: "§YDeathNote.Rip order sent.§!"
 DEC_CHU_dn_kill_random_tt: "§RA random character dies (including the ruler).§!"
`
  );
  console.log("ok");
}
main().catch((e) => {
  console.error(e);
  process.exit(1);
});
