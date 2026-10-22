/**
 * Build Chuvash politics focus branch: unique DDS icons, gfx, effects, focuses, loc.
 */
const fs = require("fs");
const path = require("path");
const sharp = require("sharp");

const ROOT = "c:/git/decolonizaciya";
const ASSETS = "C:/Users/Admin/.cursor/projects/c-git-decolonizaciya/assets";
const GOAL_DIR = path.join(ROOT, "gfx/interface/goals");
fs.mkdirSync(GOAL_DIR, { recursive: true });

const ICONS = [
  "DEC_CHU_pol_root",
  "DEC_CHU_pol_g_dem",
  "DEC_CHU_pol_g_sov",
  "DEC_CHU_pol_g_com",
  "DEC_CHU_pol_g_third",
  "DEC_CHU_pol_g_neu",
  "DEC_CHU_pol_g_nat",
  "DEC_CHU_pol_c_street",
  "DEC_CHU_pol_c_reform",
  "DEC_CHU_pol_c_neu",
  "DEC_CHU_pol_c_nat",
  "DEC_CHU_pol_p_lib",
  "DEC_CHU_pol_p_cons",
  "DEC_CHU_pol_p_soc",
  "DEC_CHU_pol_p_wa",
  "DEC_CHU_pol_p_est",
  "DEC_CHU_pol_p_kprf",
  "DEC_CHU_pol_p_oresh",
  "DEC_CHU_pol_p_olen",
  "DEC_CHU_pol_p_luk",
  "DEC_CHU_pol_p_khuz",
  "DEC_CHU_pol_p_evd",
  "DEC_CHU_pol_p_yukh",
  "DEC_CHU_pol_pwr",
];

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

async function makePowerDDS(partyJpg, wreathJpg, dest) {
  const base = await sharp(partyJpg).rotate().resize(90, 90, { fit: "cover", position: "attention" }).ensureAlpha().png().toBuffer();
  const wreath = await sharp(wreathJpg).rotate().resize(90, 90, { fit: "cover" }).ensureAlpha().modulate({ brightness: 1.15 }).png().toBuffer();
  const { data, info } = await sharp(base)
    .composite([{ input: wreath, blend: "overlay" }])
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

function findAsset(stem) {
  for (const ext of [".jpg", ".png", ".jpeg"]) {
    const p = path.join(ASSETS, stem + ext);
    if (fs.existsSync(p)) return p;
  }
  return null;
}

function gfxBlock() {
  let s = "spriteTypes = {\n";
  for (const id of ICONS) {
    s += `\tspriteType = {\n\t\tname = "GFX_${id}"\n\t\ttexturefile = "gfx/interface/goals/${id}.dds"\n\t}\n`;
  }
  const pwrParties = ["lib", "cons", "soc", "wa", "est", "kprf", "oresh", "olen", "luk", "khuz", "evd", "yukh"];
  for (const p of pwrParties) {
    s += `\tspriteType = {\n\t\tname = "GFX_DEC_CHU_pol_pwr_${p}"\n\t\ttexturefile = "gfx/interface/goals/DEC_CHU_pol_pwr_${p}.dds"\n\t}\n`;
  }
  s += "}\n";
  return s;
}

function focus({ id, icon, rel, x, y, cost, prereq, mutex, reward, available, ai }) {
  const lines = [];
  lines.push(`shared_focus = {`);
  lines.push(`\tid = ${id}`);
  lines.push(`\ticon = ${icon}`);
  lines.push(`\tallow_branch = { OR = { original_tag = CHU original_tag = BCF } }`);
  if (rel) lines.push(`\trelative_position_id = ${rel}`);
  lines.push(`\tx = ${x}`);
  lines.push(`\ty = ${y}`);
  lines.push(`\tcost = ${cost}`);
  if (prereq) {
    for (const p of prereq) lines.push(`\tprerequisite = { focus = ${p} }`);
  }
  if (mutex) lines.push(`\tmutually_exclusive = { focus = ${mutex} }`);
  lines.push(`\tsearch_filters = { FOCUS_FILTER_POLITICAL }`);
  if (available) {
    lines.push(`\tavailable = {`);
    lines.push(`\t\t${available}`);
    lines.push(`\t}`);
  }
  lines.push(`\tcompletion_reward = {`);
  lines.push(`\t\tlog = "[GetDateText]: [Root.GetName]: Focus ${id}"`);
  for (const r of reward) lines.push(`\t\t${r}`);
  lines.push(`\t}`);
  lines.push(`\tai_will_do = { base = ${ai || 4} }`);
  lines.push(`}`);
  lines.push(``);
  return lines.join("\n");
}

function boostGroup(group, amt, tt) {
  return [
    `add_popularity = { ideology = ${group} popularity = ${amt} }`,
    `add_political_power = 25`,
    `recalculate_party = yes`,
    `custom_effect_tooltip = ${tt}`,
  ];
}

function boostSlot(slot, group, amtSlot, amtGroup, tt) {
  return [
    `add_to_variable = { party_pop_array^${slot} = ${amtSlot} }`,
    `clamp_variable = { var = party_pop_array^${slot} min = 0 max = 1 }`,
    `add_popularity = { ideology = ${group} popularity = ${amtGroup} }`,
    `add_political_power = 20`,
    `recalculate_party = yes`,
    `custom_effect_tooltip = ${tt}`,
  ];
}

function takePower(slot, group, tt) {
  return [
    `add_to_variable = { party_pop_array^${slot} = 0.18 }`,
    `clamp_variable = { var = party_pop_array^${slot} min = 0 max = 1 }`,
    `add_popularity = { ideology = ${group} popularity = 0.12 }`,
    `set_variable = { ruling_party = ${slot} }`,
    `recalculate_party = yes`,
    `set_politics = { ruling_party = ${group} elections_allowed = yes }`,
    `add_political_power = 100`,
    `add_stability = 0.05`,
    `custom_effect_tooltip = ${tt}`,
  ];
}

function buildFocusFile() {
  const parts = [];
  parts.push(`############################################`);
  parts.push(`# Chuvash politics: binary ideology forks -> party -> take power`);
  parts.push(`# Propaganda focuses add group/slot popularity.`);
  parts.push(`############################################`);
  parts.push(``);

  parts.push(
    focus({
      id: "DEC_CHU_pol_root",
      icon: "GFX_DEC_CHU_pol_root",
      x: 72,
      y: 0,
      cost: 4,
      reward: [
        `add_political_power = 50`,
        `add_stability = 0.02`,
        `custom_effect_tooltip = DEC_CHU_pol_root_tt`,
      ],
      ai: 12,
    })
  );

  parts.push(
    focus({
      id: "DEC_CHU_pol_g_dem",
      icon: "GFX_DEC_CHU_pol_g_dem",
      rel: "DEC_CHU_pol_root",
      x: -16,
      y: 1,
      cost: 5,
      prereq: ["DEC_CHU_pol_root"],
      mutex: "DEC_CHU_pol_g_sov",
      reward: boostGroup("democratic", "0.08", "DEC_CHU_pol_boost_dem_tt"),
      ai: 6,
    })
  );
  parts.push(
    focus({
      id: "DEC_CHU_pol_g_sov",
      icon: "GFX_DEC_CHU_pol_g_sov",
      rel: "DEC_CHU_pol_root",
      x: 16,
      y: 1,
      cost: 5,
      prereq: ["DEC_CHU_pol_root"],
      mutex: "DEC_CHU_pol_g_dem",
      reward: [
        `add_popularity = { ideology = communism popularity = 0.04 }`,
        `add_popularity = { ideology = nationalist popularity = 0.03 }`,
        `add_popularity = { ideology = neutrality popularity = 0.03 }`,
        `add_political_power = 25`,
        `recalculate_party = yes`,
        `custom_effect_tooltip = DEC_CHU_pol_boost_sov_tt`,
      ],
      ai: 5,
    })
  );

  parts.push(
    focus({
      id: "DEC_CHU_pol_c_street",
      icon: "GFX_DEC_CHU_pol_c_street",
      rel: "DEC_CHU_pol_g_dem",
      x: -8,
      y: 1,
      cost: 5,
      prereq: ["DEC_CHU_pol_g_dem"],
      mutex: "DEC_CHU_pol_c_reform",
      reward: boostGroup("democratic", "0.05", "DEC_CHU_pol_boost_dem_tt"),
    })
  );
  parts.push(
    focus({
      id: "DEC_CHU_pol_c_reform",
      icon: "GFX_DEC_CHU_pol_c_reform",
      rel: "DEC_CHU_pol_g_dem",
      x: 8,
      y: 1,
      cost: 5,
      prereq: ["DEC_CHU_pol_g_dem"],
      mutex: "DEC_CHU_pol_c_street",
      reward: boostGroup("democratic", "0.05", "DEC_CHU_pol_boost_dem_tt"),
    })
  );

  const partiesDem = [
    ["DEC_CHU_pol_p_lib", "GFX_DEC_CHU_pol_p_lib", "DEC_CHU_pol_c_street", -4, "DEC_CHU_pol_p_cons", 2, "democratic", "DEC_CHU_pol_slot_lib_tt"],
    ["DEC_CHU_pol_p_cons", "GFX_DEC_CHU_pol_p_cons", "DEC_CHU_pol_c_street", 4, "DEC_CHU_pol_p_lib", 1, "democratic", "DEC_CHU_pol_slot_cons_tt"],
    ["DEC_CHU_pol_p_soc", "GFX_DEC_CHU_pol_p_soc", "DEC_CHU_pol_c_reform", -4, "DEC_CHU_pol_p_wa", 3, "democratic", "DEC_CHU_pol_slot_soc_tt"],
    ["DEC_CHU_pol_p_wa", "GFX_DEC_CHU_pol_p_wa", "DEC_CHU_pol_c_reform", 4, "DEC_CHU_pol_p_soc", 0, "democratic", "DEC_CHU_pol_slot_wa_tt"],
  ];
  for (const [id, icon, rel, x, mutex, slot, group, tt] of partiesDem) {
    parts.push(
      focus({
        id,
        icon,
        rel,
        x,
        y: 1,
        cost: 5,
        prereq: [rel],
        mutex,
        reward: boostSlot(slot, group, "0.08", "0.04", tt),
      })
    );
  }

  parts.push(
    focus({
      id: "DEC_CHU_pol_g_com",
      icon: "GFX_DEC_CHU_pol_g_com",
      rel: "DEC_CHU_pol_g_sov",
      x: -10,
      y: 1,
      cost: 5,
      prereq: ["DEC_CHU_pol_g_sov"],
      mutex: "DEC_CHU_pol_g_third",
      reward: boostGroup("communism", "0.08", "DEC_CHU_pol_boost_com_tt"),
    })
  );
  parts.push(
    focus({
      id: "DEC_CHU_pol_g_third",
      icon: "GFX_DEC_CHU_pol_g_third",
      rel: "DEC_CHU_pol_g_sov",
      x: 10,
      y: 1,
      cost: 5,
      prereq: ["DEC_CHU_pol_g_sov"],
      mutex: "DEC_CHU_pol_g_com",
      reward: [
        `add_popularity = { ideology = neutrality popularity = 0.05 }`,
        `add_popularity = { ideology = nationalist popularity = 0.05 }`,
        `add_political_power = 25`,
        `recalculate_party = yes`,
        `custom_effect_tooltip = DEC_CHU_pol_boost_third_tt`,
      ],
    })
  );

  parts.push(
    focus({
      id: "DEC_CHU_pol_p_est",
      icon: "GFX_DEC_CHU_pol_p_est",
      rel: "DEC_CHU_pol_g_com",
      x: -4,
      y: 1,
      cost: 5,
      prereq: ["DEC_CHU_pol_g_com"],
      mutex: "DEC_CHU_pol_p_kprf",
      reward: boostSlot(6, "communism", "0.08", "0.04", "DEC_CHU_pol_slot_est_tt"),
    })
  );
  parts.push(
    focus({
      id: "DEC_CHU_pol_p_kprf",
      icon: "GFX_DEC_CHU_pol_p_kprf",
      rel: "DEC_CHU_pol_g_com",
      x: 4,
      y: 1,
      cost: 5,
      prereq: ["DEC_CHU_pol_g_com"],
      mutex: "DEC_CHU_pol_p_est",
      reward: boostSlot(4, "communism", "0.08", "0.04", "DEC_CHU_pol_slot_kprf_tt"),
    })
  );

  parts.push(
    focus({
      id: "DEC_CHU_pol_g_neu",
      icon: "GFX_DEC_CHU_pol_g_neu",
      rel: "DEC_CHU_pol_g_third",
      x: -10,
      y: 1,
      cost: 5,
      prereq: ["DEC_CHU_pol_g_third"],
      mutex: "DEC_CHU_pol_g_nat",
      reward: boostGroup("neutrality", "0.08", "DEC_CHU_pol_boost_neu_tt"),
    })
  );
  parts.push(
    focus({
      id: "DEC_CHU_pol_g_nat",
      icon: "GFX_DEC_CHU_pol_g_nat",
      rel: "DEC_CHU_pol_g_third",
      x: 10,
      y: 1,
      cost: 5,
      prereq: ["DEC_CHU_pol_g_third"],
      mutex: "DEC_CHU_pol_g_neu",
      reward: boostGroup("nationalist", "0.08", "DEC_CHU_pol_boost_nat_tt"),
    })
  );

  parts.push(
    focus({
      id: "DEC_CHU_pol_p_oresh",
      icon: "GFX_DEC_CHU_pol_p_oresh",
      rel: "DEC_CHU_pol_g_neu",
      x: -8,
      y: 1,
      cost: 5,
      prereq: ["DEC_CHU_pol_g_neu"],
      mutex: "DEC_CHU_pol_c_neu",
      reward: boostSlot(16, "neutrality", "0.08", "0.04", "DEC_CHU_pol_slot_oresh_tt"),
    })
  );
  parts.push(
    focus({
      id: "DEC_CHU_pol_c_neu",
      icon: "GFX_DEC_CHU_pol_c_neu",
      rel: "DEC_CHU_pol_g_neu",
      x: 8,
      y: 1,
      cost: 5,
      prereq: ["DEC_CHU_pol_g_neu"],
      mutex: "DEC_CHU_pol_p_oresh",
      reward: boostGroup("neutrality", "0.05", "DEC_CHU_pol_boost_neu_tt"),
    })
  );
  parts.push(
    focus({
      id: "DEC_CHU_pol_p_olen",
      icon: "GFX_DEC_CHU_pol_p_olen",
      rel: "DEC_CHU_pol_c_neu",
      x: -4,
      y: 1,
      cost: 5,
      prereq: ["DEC_CHU_pol_c_neu"],
      mutex: "DEC_CHU_pol_p_luk",
      reward: boostSlot(19, "neutrality", "0.08", "0.04", "DEC_CHU_pol_slot_olen_tt"),
    })
  );
  parts.push(
    focus({
      id: "DEC_CHU_pol_p_luk",
      icon: "GFX_DEC_CHU_pol_p_luk",
      rel: "DEC_CHU_pol_c_neu",
      x: 4,
      y: 1,
      cost: 5,
      prereq: ["DEC_CHU_pol_c_neu"],
      mutex: "DEC_CHU_pol_p_olen",
      reward: boostSlot(17, "neutrality", "0.08", "0.04", "DEC_CHU_pol_slot_luk_tt"),
    })
  );

  parts.push(
    focus({
      id: "DEC_CHU_pol_p_khuz",
      icon: "GFX_DEC_CHU_pol_p_khuz",
      rel: "DEC_CHU_pol_g_nat",
      x: -8,
      y: 1,
      cost: 5,
      prereq: ["DEC_CHU_pol_g_nat"],
      mutex: "DEC_CHU_pol_c_nat",
      reward: boostSlot(20, "nationalist", "0.08", "0.04", "DEC_CHU_pol_slot_khuz_tt"),
    })
  );
  parts.push(
    focus({
      id: "DEC_CHU_pol_c_nat",
      icon: "GFX_DEC_CHU_pol_c_nat",
      rel: "DEC_CHU_pol_g_nat",
      x: 8,
      y: 1,
      cost: 5,
      prereq: ["DEC_CHU_pol_g_nat"],
      mutex: "DEC_CHU_pol_p_khuz",
      reward: boostGroup("nationalist", "0.05", "DEC_CHU_pol_boost_nat_tt"),
    })
  );
  parts.push(
    focus({
      id: "DEC_CHU_pol_p_evd",
      icon: "GFX_DEC_CHU_pol_p_evd",
      rel: "DEC_CHU_pol_c_nat",
      x: -4,
      y: 1,
      cost: 5,
      prereq: ["DEC_CHU_pol_c_nat"],
      mutex: "DEC_CHU_pol_p_yukh",
      reward: boostSlot(21, "nationalist", "0.08", "0.04", "DEC_CHU_pol_slot_evd_tt"),
    })
  );
  parts.push(
    focus({
      id: "DEC_CHU_pol_p_yukh",
      icon: "GFX_DEC_CHU_pol_p_yukh",
      rel: "DEC_CHU_pol_c_nat",
      x: 4,
      y: 1,
      cost: 5,
      prereq: ["DEC_CHU_pol_c_nat"],
      mutex: "DEC_CHU_pol_p_evd",
      reward: boostSlot(22, "nationalist", "0.08", "0.04", "DEC_CHU_pol_slot_yukh_tt"),
    })
  );

  const powers = [
    ["lib", "DEC_CHU_pol_p_lib", 2, "democratic", "DEC_CHU_pol_pwr_lib_tt"],
    ["cons", "DEC_CHU_pol_p_cons", 1, "democratic", "DEC_CHU_pol_pwr_cons_tt"],
    ["soc", "DEC_CHU_pol_p_soc", 3, "democratic", "DEC_CHU_pol_pwr_soc_tt"],
    ["wa", "DEC_CHU_pol_p_wa", 0, "democratic", "DEC_CHU_pol_pwr_wa_tt"],
    ["est", "DEC_CHU_pol_p_est", 6, "communism", "DEC_CHU_pol_pwr_est_tt"],
    ["kprf", "DEC_CHU_pol_p_kprf", 4, "communism", "DEC_CHU_pol_pwr_kprf_tt"],
    ["oresh", "DEC_CHU_pol_p_oresh", 16, "neutrality", "DEC_CHU_pol_pwr_oresh_tt"],
    ["olen", "DEC_CHU_pol_p_olen", 19, "neutrality", "DEC_CHU_pol_pwr_olen_tt"],
    ["luk", "DEC_CHU_pol_p_luk", 17, "neutrality", "DEC_CHU_pol_pwr_luk_tt"],
    ["khuz", "DEC_CHU_pol_p_khuz", 20, "nationalist", "DEC_CHU_pol_pwr_khuz_tt"],
    ["evd", "DEC_CHU_pol_p_evd", 21, "nationalist", "DEC_CHU_pol_pwr_evd_tt"],
    ["yukh", "DEC_CHU_pol_p_yukh", 22, "nationalist", "DEC_CHU_pol_pwr_yukh_tt"],
  ];
  for (const [key, prereq, slot, group, tt] of powers) {
    parts.push(
      focus({
        id: `DEC_CHU_pol_pwr_${key}`,
        icon: `GFX_DEC_CHU_pol_pwr_${key}`,
        rel: prereq,
        x: 0,
        y: 1,
        cost: 7,
        prereq: [prereq],
        available: `check_variable = { party_pop_array^${slot} > 0.18 }`,
        reward: takePower(slot, group, tt),
        ai: 8,
      })
    );
  }

  return parts.join("\n");
}

function appendLoc(file, block) {
  let raw = fs.readFileSync(file);
  const bom = raw[0] === 0xef && raw[1] === 0xbb && raw[2] === 0xbf;
  let text = raw.toString("utf8");
  if (text.charCodeAt(0) === 0xfeff) text = text.slice(1);
  if (!text.endsWith("\n")) text += "\n";
  if (text.includes("DEC_CHU_pol_root:")) {
    // replace previous block if re-run
    text = text.replace(/\n DEC_CHU_pol_root:[\s\S]*$/, "\n");
  }
  text += block;
  const out = Buffer.from(text, "utf8");
  fs.writeFileSync(file, bom ? Buffer.concat([Buffer.from([0xef, 0xbb, 0xbf]), out]) : out);
}

const RU = `
 DEC_CHU_pol_root: "Чувашская политика"
 DEC_CHU_pol_root_desc: "Пропаганда начинается с выбора лагеря. Каждая развилка усиливает группу идеологий, пока не останется одна партия."
 DEC_CHU_pol_root_tt: "Открывает бинарные развилки чувашской политики."
 DEC_CHU_pol_g_dem: "Гражданский лагерь"
 DEC_CHU_pol_g_dem_desc: "Пропаганда демократического лагеря: улица, реформа и западные партии Чувашии."
 DEC_CHU_pol_g_sov: "Суверенный лагерь"
 DEC_CHU_pol_g_sov_desc: "Пропаганда против чисто гражданского курса: левые, нейтралы и националисты."
 DEC_CHU_pol_g_com: "Левый лагерь"
 DEC_CHU_pol_g_com_desc: "Пропаганда коммунистической группы: партия власти против КПРФ."
 DEC_CHU_pol_g_third: "Третий путь"
 DEC_CHU_pol_g_third_desc: "Пропаганда вне двух больших лагерей: нейтралитет или национализм."
 DEC_CHU_pol_g_neu: "Нейтральный лагерь"
 DEC_CHU_pol_g_neu_desc: "Пропаганда нейтральной группы: либертарианство, левый фронт, национальное возрождение."
 DEC_CHU_pol_g_nat: "Национальный лагерь"
 DEC_CHU_pol_g_nat_desc: "Пропаганда националистической группы: конгресс, коалиция, культурный центр."
 DEC_CHU_pol_c_street: "Уличная демократия"
 DEC_CHU_pol_c_street_desc: "Пропаганда гражданского протеста: Открытая Чувашия и штаб «Весны»."
 DEC_CHU_pol_c_reform: "Реформаторы"
 DEC_CHU_pol_c_reform_desc: "Пропаганда парламентской и медийной реформы: «Яблоко» и «Сердитая Чувашия»."
 DEC_CHU_pol_c_neu: "Социальный нейтралитет"
 DEC_CHU_pol_c_neu_desc: "Пропаганда внутри нейтралов: Левый фронт против ЧАП."
 DEC_CHU_pol_c_nat: "Радикальный национализм"
 DEC_CHU_pol_c_nat_desc: "Пропаганда жёсткого национального крыла: Коалиция свободы и ЧОКЦ."
 DEC_CHU_pol_p_lib: "Открытая Чувашия"
 DEC_CHU_pol_p_lib_desc: "Пропаганда партии Семёнова. Готовит приход либералов к власти."
 DEC_CHU_pol_p_cons: "Весна — штаб Навального"
 DEC_CHU_pol_p_cons_desc: "Пропаганда партии Кочкина. Готовит приход гражданских демократов к власти."
 DEC_CHU_pol_p_soc: "Яблоко Чувашии"
 DEC_CHU_pol_p_soc_desc: "Пропаганда партии Елькина. Готовит приход «Яблока» к власти."
 DEC_CHU_pol_p_wa: "Сердитая Чувашия"
 DEC_CHU_pol_p_wa_desc: "Пропаганда медиа-проекта Никифорова. Готовит его приход к власти."
 DEC_CHU_pol_p_est: "Консерваторы Чувашии"
 DEC_CHU_pol_p_est_desc: "Пропаганда партии Фёдорова. Готовит закрепление партии власти."
 DEC_CHU_pol_p_kprf: "КПРФ Чувашии"
 DEC_CHU_pol_p_kprf_desc: "Пропаганда партии Шурчанова. Готовит приход коммунистов к власти."
 DEC_CHU_pol_p_oresh: "Партия Булгарской Конфедерации"
 DEC_CHU_pol_p_oresh_desc: "Пропаганда курса Орешникова. Готовит либертарианский приход к власти."
 DEC_CHU_pol_p_olen: "Левый фронт"
 DEC_CHU_pol_p_olen_desc: "Пропаганда Оленова. Готовит приход Левого фронта к власти."
 DEC_CHU_pol_p_luk: "Чувашское национальное возрождение"
 DEC_CHU_pol_p_luk_desc: "Пропаганда ЧАП Лукианова. Готовит приход партии возрождения к власти."
 DEC_CHU_pol_p_khuz: "Чувашский национальный конгресс"
 DEC_CHU_pol_p_khuz_desc: "Пропаганда ЧНК Хузангая. Готовит приход конгресса к власти."
 DEC_CHU_pol_p_evd: "Коалиция свободы"
 DEC_CHU_pol_p_evd_desc: "Пропаганда Дипломатического совета Евдокимова. Готовит его приход к власти."
 DEC_CHU_pol_p_yukh: "Чувашский общественно-культурный центр"
 DEC_CHU_pol_p_yukh_desc: "Пропаганда курса Юхмы. Готовит приход ЧОКЦ к власти."
 DEC_CHU_pol_pwr_lib: "Либералы у власти"
 DEC_CHU_pol_pwr_lib_desc: "Открытая Чувашия формирует правительство."
 DEC_CHU_pol_pwr_cons: "Весна у власти"
 DEC_CHU_pol_pwr_cons_desc: "Гражданские демократы Кочкина берут кабинет."
 DEC_CHU_pol_pwr_soc: "Яблоко у власти"
 DEC_CHU_pol_pwr_soc_desc: "«Яблоко» Чувашии формирует правительство."
 DEC_CHU_pol_pwr_wa: "Сердитая Чувашия у власти"
 DEC_CHU_pol_pwr_wa_desc: "Медиа-проект становится партией власти."
 DEC_CHU_pol_pwr_est: "Консерваторы удерживают власть"
 DEC_CHU_pol_pwr_est_desc: "Партия Фёдорова закрепляет кабинет."
 DEC_CHU_pol_pwr_kprf: "КПРФ у власти"
 DEC_CHU_pol_pwr_kprf_desc: "Коммунисты Шурчанова формируют правительство."
 DEC_CHU_pol_pwr_oresh: "Булгарская конфедерация у власти"
 DEC_CHU_pol_pwr_oresh_desc: "Орешников возглавляет правительство независимой Чувашии."
 DEC_CHU_pol_pwr_olen: "Левый фронт у власти"
 DEC_CHU_pol_pwr_olen_desc: "Левый фронт формирует кабинет."
 DEC_CHU_pol_pwr_luk: "ЧАП у власти"
 DEC_CHU_pol_pwr_luk_desc: "Партия национального возрождения формирует правительство."
 DEC_CHU_pol_pwr_khuz: "Конгресс у власти"
 DEC_CHU_pol_pwr_khuz_desc: "ЧНК Хузангая берёт государственную власть."
 DEC_CHU_pol_pwr_evd: "Коалиция у власти"
 DEC_CHU_pol_pwr_evd_desc: "Дипломатический совет Евдокимова становится правительством."
 DEC_CHU_pol_pwr_yukh: "ЧОКЦ у власти"
 DEC_CHU_pol_pwr_yukh_desc: "Культурно-национальный центр Юхмы формирует кабинет."
 DEC_CHU_pol_boost_dem_tt: "§G+ поддержка демократической группы§!"
 DEC_CHU_pol_boost_sov_tt: "§G+ поддержка коммунистов, националистов и нейтралов§!"
 DEC_CHU_pol_boost_com_tt: "§G+ поддержка коммунистической группы§!"
 DEC_CHU_pol_boost_third_tt: "§G+ поддержка нейтралов и националистов§!"
 DEC_CHU_pol_boost_neu_tt: "§G+ поддержка нейтральной группы§!"
 DEC_CHU_pol_boost_nat_tt: "§G+ поддержка националистической группы§!"
 DEC_CHU_pol_slot_lib_tt: "§G+ популярность Открытой Чувашии§!"
 DEC_CHU_pol_slot_cons_tt: "§G+ популярность «Весны»§!"
 DEC_CHU_pol_slot_soc_tt: "§G+ популярность «Яблока»§!"
 DEC_CHU_pol_slot_wa_tt: "§G+ популярность «Сердитой Чувашии»§!"
 DEC_CHU_pol_slot_est_tt: "§G+ популярность консерваторов Фёдорова§!"
 DEC_CHU_pol_slot_kprf_tt: "§G+ популярность КПРФ§!"
 DEC_CHU_pol_slot_oresh_tt: "§G+ популярность Партии Булгарской Конфедерации§!"
 DEC_CHU_pol_slot_olen_tt: "§G+ популярность Левого фронта§!"
 DEC_CHU_pol_slot_luk_tt: "§G+ популярность ЧАП§!"
 DEC_CHU_pol_slot_khuz_tt: "§G+ популярность ЧНК§!"
 DEC_CHU_pol_slot_evd_tt: "§G+ популярность Коалиции свободы§!"
 DEC_CHU_pol_slot_yukh_tt: "§G+ популярность ЧОКЦ§!"
 DEC_CHU_pol_pwr_lib_tt: "§YОткрытая Чувашия становится правящей партией.§!"
 DEC_CHU_pol_pwr_cons_tt: "§Y«Весна» становится правящей партией.§!"
 DEC_CHU_pol_pwr_soc_tt: "§Y«Яблоко» становится правящей партией.§!"
 DEC_CHU_pol_pwr_wa_tt: "§Y«Сердитая Чувашия» становится правящей партией.§!"
 DEC_CHU_pol_pwr_est_tt: "§YКонсерваторы закрепляют власть.§!"
 DEC_CHU_pol_pwr_kprf_tt: "§YКПРФ становится правящей партией.§!"
 DEC_CHU_pol_pwr_oresh_tt: "§YПартия Булгарской Конфедерации становится правящей.§!"
 DEC_CHU_pol_pwr_olen_tt: "§YЛевый фронт становится правящей партией.§!"
 DEC_CHU_pol_pwr_luk_tt: "§YЧАП становится правящей партией.§!"
 DEC_CHU_pol_pwr_khuz_tt: "§YЧНК становится правящей партией.§!"
 DEC_CHU_pol_pwr_evd_tt: "§YКоалиция свободы становится правящей партией.§!"
 DEC_CHU_pol_pwr_yukh_tt: "§YЧОКЦ становится правящей партией.§!"
`;

const EN = `
 DEC_CHU_pol_root: "Chuvash Politics"
 DEC_CHU_pol_root_desc: "Propaganda starts with a camp. Each fork boosts an ideology group until one party remains."
 DEC_CHU_pol_root_tt: "Unlocks the binary Chuvash politics forks."
 DEC_CHU_pol_g_dem: "Civic Camp"
 DEC_CHU_pol_g_dem_desc: "Propaganda for the democratic camp: street, reform, and western parties of Chuvashia."
 DEC_CHU_pol_g_sov: "Sovereign Camp"
 DEC_CHU_pol_g_sov_desc: "Propaganda against a purely civic course: left, neutrals, and nationalists."
 DEC_CHU_pol_g_com: "Left Camp"
 DEC_CHU_pol_g_com_desc: "Propaganda for the communist group: party of power versus the CPRF."
 DEC_CHU_pol_g_third: "Third Way"
 DEC_CHU_pol_g_third_desc: "Propaganda outside the two big camps: neutrality or nationalism."
 DEC_CHU_pol_g_neu: "Neutral Camp"
 DEC_CHU_pol_g_neu_desc: "Propaganda for the neutrality group."
 DEC_CHU_pol_g_nat: "National Camp"
 DEC_CHU_pol_g_nat_desc: "Propaganda for the nationalist group."
 DEC_CHU_pol_c_street: "Street Democracy"
 DEC_CHU_pol_c_street_desc: "Propaganda for civic protest: Open Chuvashia and Vesna HQ."
 DEC_CHU_pol_c_reform: "Reformers"
 DEC_CHU_pol_c_reform_desc: "Propaganda for parliamentary and media reform: Yabloko and Angry Chuvashia."
 DEC_CHU_pol_c_neu: "Social Neutrality"
 DEC_CHU_pol_c_neu_desc: "Propaganda inside the neutrals: Left Front versus CHAP."
 DEC_CHU_pol_c_nat: "Radical Nationalism"
 DEC_CHU_pol_c_nat_desc: "Propaganda for the hard national wing: Coalition of Freedom and the OCC."
 DEC_CHU_pol_p_lib: "Open Chuvashia"
 DEC_CHU_pol_p_lib_desc: "Propaganda for Semenov's party. Prepares liberals to take power."
 DEC_CHU_pol_p_cons: "Vesna — Navalny HQ"
 DEC_CHU_pol_p_cons_desc: "Propaganda for Kochkin's party. Prepares civic democrats to take power."
 DEC_CHU_pol_p_soc: "Yabloko of Chuvashia"
 DEC_CHU_pol_p_soc_desc: "Propaganda for Elkin's party. Prepares Yabloko to take power."
 DEC_CHU_pol_p_wa: "Angry Chuvashia"
 DEC_CHU_pol_p_wa_desc: "Propaganda for Nikiforov's media project. Prepares it to take power."
 DEC_CHU_pol_p_est: "Conservatives of Chuvashia"
 DEC_CHU_pol_p_est_desc: "Propaganda for Fyodorov's party. Prepares the establishment to hold power."
 DEC_CHU_pol_p_kprf: "CPRF of Chuvashia"
 DEC_CHU_pol_p_kprf_desc: "Propaganda for Shurchanov's party. Prepares communists to take power."
 DEC_CHU_pol_p_oresh: "Party of the Bulgar Confederation"
 DEC_CHU_pol_p_oresh_desc: "Propaganda for Oreshnikov's current. Prepares libertarians to take power."
 DEC_CHU_pol_p_olen: "Left Front"
 DEC_CHU_pol_p_olen_desc: "Propaganda for Olenov. Prepares the Left Front to take power."
 DEC_CHU_pol_p_luk: "Chuvash National Revival"
 DEC_CHU_pol_p_luk_desc: "Propaganda for Lukianov's CHAP. Prepares the revival party to take power."
 DEC_CHU_pol_p_khuz: "Chuvash National Congress"
 DEC_CHU_pol_p_khuz_desc: "Propaganda for Khuzangay's CNC. Prepares the congress to take power."
 DEC_CHU_pol_p_evd: "Coalition of Freedom"
 DEC_CHU_pol_p_evd_desc: "Propaganda for Evdokimov's Diplomatic Council. Prepares it to take power."
 DEC_CHU_pol_p_yukh: "Chuvash Civic-Cultural Centre"
 DEC_CHU_pol_p_yukh_desc: "Propaganda for Yukhma's current. Prepares the OCC to take power."
 DEC_CHU_pol_pwr_lib: "Liberals in Power"
 DEC_CHU_pol_pwr_lib_desc: "Open Chuvashia forms the government."
 DEC_CHU_pol_pwr_cons: "Vesna in Power"
 DEC_CHU_pol_pwr_cons_desc: "Kochkin's civic democrats take the cabinet."
 DEC_CHU_pol_pwr_soc: "Yabloko in Power"
 DEC_CHU_pol_pwr_soc_desc: "Yabloko of Chuvashia forms the government."
 DEC_CHU_pol_pwr_wa: "Angry Chuvashia in Power"
 DEC_CHU_pol_pwr_wa_desc: "The media project becomes the ruling party."
 DEC_CHU_pol_pwr_est: "Conservatives Hold Power"
 DEC_CHU_pol_pwr_est_desc: "Fyodorov's party consolidates the cabinet."
 DEC_CHU_pol_pwr_kprf: "CPRF in Power"
 DEC_CHU_pol_pwr_kprf_desc: "Shurchanov's communists form the government."
 DEC_CHU_pol_pwr_oresh: "Bulgar Confederation in Power"
 DEC_CHU_pol_pwr_oresh_desc: "Oreshnikov heads the government of independent Chuvashia."
 DEC_CHU_pol_pwr_olen: "Left Front in Power"
 DEC_CHU_pol_pwr_olen_desc: "The Left Front forms the cabinet."
 DEC_CHU_pol_pwr_luk: "CHAP in Power"
 DEC_CHU_pol_pwr_luk_desc: "The national revival party forms the government."
 DEC_CHU_pol_pwr_khuz: "Congress in Power"
 DEC_CHU_pol_pwr_khuz_desc: "Khuzangay's CNC takes state power."
 DEC_CHU_pol_pwr_evd: "Coalition in Power"
 DEC_CHU_pol_pwr_evd_desc: "Evdokimov's Diplomatic Council becomes the government."
 DEC_CHU_pol_pwr_yukh: "OCC in Power"
 DEC_CHU_pol_pwr_yukh_desc: "Yukhma's cultural-national centre forms the cabinet."
 DEC_CHU_pol_boost_dem_tt: "§G+ democratic group support§!"
 DEC_CHU_pol_boost_sov_tt: "§G+ communist, nationalist and neutrality support§!"
 DEC_CHU_pol_boost_com_tt: "§G+ communist group support§!"
 DEC_CHU_pol_boost_third_tt: "§G+ neutrality and nationalist support§!"
 DEC_CHU_pol_boost_neu_tt: "§G+ neutrality group support§!"
 DEC_CHU_pol_boost_nat_tt: "§G+ nationalist group support§!"
 DEC_CHU_pol_slot_lib_tt: "§G+ Open Chuvashia popularity§!"
 DEC_CHU_pol_slot_cons_tt: "§G+ Vesna popularity§!"
 DEC_CHU_pol_slot_soc_tt: "§G+ Yabloko popularity§!"
 DEC_CHU_pol_slot_wa_tt: "§G+ Angry Chuvashia popularity§!"
 DEC_CHU_pol_slot_est_tt: "§G+ Fyodorov conservative popularity§!"
 DEC_CHU_pol_slot_kprf_tt: "§G+ CPRF popularity§!"
 DEC_CHU_pol_slot_oresh_tt: "§G+ Bulgar Confederation party popularity§!"
 DEC_CHU_pol_slot_olen_tt: "§G+ Left Front popularity§!"
 DEC_CHU_pol_slot_luk_tt: "§G+ CHAP popularity§!"
 DEC_CHU_pol_slot_khuz_tt: "§G+ CNC popularity§!"
 DEC_CHU_pol_slot_evd_tt: "§G+ Coalition of Freedom popularity§!"
 DEC_CHU_pol_slot_yukh_tt: "§G+ OCC popularity§!"
 DEC_CHU_pol_pwr_lib_tt: "§YOpen Chuvashia becomes the ruling party.§!"
 DEC_CHU_pol_pwr_cons_tt: "§YVesna becomes the ruling party.§!"
 DEC_CHU_pol_pwr_soc_tt: "§YYabloko becomes the ruling party.§!"
 DEC_CHU_pol_pwr_wa_tt: "§YAngry Chuvashia becomes the ruling party.§!"
 DEC_CHU_pol_pwr_est_tt: "§YConservatives consolidate power.§!"
 DEC_CHU_pol_pwr_kprf_tt: "§YThe CPRF becomes the ruling party.§!"
 DEC_CHU_pol_pwr_oresh_tt: "§YThe Party of the Bulgar Confederation becomes ruling.§!"
 DEC_CHU_pol_pwr_olen_tt: "§YThe Left Front becomes the ruling party.§!"
 DEC_CHU_pol_pwr_luk_tt: "§YCHAP becomes the ruling party.§!"
 DEC_CHU_pol_pwr_khuz_tt: "§YThe CNC becomes the ruling party.§!"
 DEC_CHU_pol_pwr_evd_tt: "§YThe Coalition of Freedom becomes the ruling party.§!"
 DEC_CHU_pol_pwr_yukh_tt: "§YThe OCC becomes the ruling party.§!"
`;

async function main() {
  const wreath = findAsset("DEC_CHU_pol_pwr");
  if (!wreath) throw new Error("missing power wreath asset");
  for (const id of ICONS) {
    const src = findAsset(id);
    if (!src) throw new Error("missing asset " + id);
    await jpgToGoalDDS(src, path.join(GOAL_DIR, id + ".dds"));
    console.log("dds", id);
  }
  const partyKeys = {
    lib: "DEC_CHU_pol_p_lib",
    cons: "DEC_CHU_pol_p_cons",
    soc: "DEC_CHU_pol_p_soc",
    wa: "DEC_CHU_pol_p_wa",
    est: "DEC_CHU_pol_p_est",
    kprf: "DEC_CHU_pol_p_kprf",
    oresh: "DEC_CHU_pol_p_oresh",
    olen: "DEC_CHU_pol_p_olen",
    luk: "DEC_CHU_pol_p_luk",
    khuz: "DEC_CHU_pol_p_khuz",
    evd: "DEC_CHU_pol_p_evd",
    yukh: "DEC_CHU_pol_p_yukh",
  };
  for (const [key, stem] of Object.entries(partyKeys)) {
    await makePowerDDS(findAsset(stem), wreath, path.join(GOAL_DIR, `DEC_CHU_pol_pwr_${key}.dds`));
    console.log("pwr", key);
  }

  fs.writeFileSync(path.join(ROOT, "interface/DEC_chu_goals.gfx"), gfxBlock());
  fs.writeFileSync(path.join(ROOT, "common/national_focus/DEC_chuvash_politics.txt"), buildFocusFile());
  appendLoc(path.join(ROOT, "localisation/russian/DEC_l_russian.yml"), RU);
  appendLoc(path.join(ROOT, "localisation/english/DEC_l_english.yml"), EN);
  console.log("written focuses/gfx/loc");
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
