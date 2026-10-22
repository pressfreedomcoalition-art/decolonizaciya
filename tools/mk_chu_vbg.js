/**
 * VBG + libertarian CHU branch: icons, gfx, focuses, loc.
 */
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

function focusBlock(o) {
  const lines = [];
  lines.push("shared_focus = {");
  lines.push(`\tid = ${o.id}`);
  lines.push(`\ticon = ${o.icon}`);
  lines.push(`\tallow_branch = { ${o.allow} }`);
  lines.push(`\trelative_position_id = ${o.rel}`);
  lines.push(`\tx = ${o.x}`);
  lines.push(`\ty = ${o.y}`);
  lines.push(`\tcost = ${o.cost}`);
  if (o.prereq) lines.push(`\tprerequisite = { ${o.prereq} }`);
  if (o.mutex) lines.push(`\tmutually_exclusive = { focus = ${o.mutex} }`);
  lines.push(`\tsearch_filters = { ${o.filters} }`);
  if (o.available) {
    lines.push("\tavailable = {");
    lines.push(o.available.split("\n").map((l) => "\t\t" + l).join("\n"));
    lines.push("\t}");
  }
  if (o.bypass) {
    lines.push("\tbypass = {");
    lines.push(o.bypass.split("\n").map((l) => "\t\t" + l).join("\n"));
    lines.push("\t}");
  }
  lines.push("\tcompletion_reward = {");
  lines.push(`\t\tlog = "[GetDateText]: [Root.GetName]: Focus ${o.id}"`);
  lines.push(o.reward.split("\n").map((l) => "\t\t" + l).join("\n"));
  lines.push("\t}");
  lines.push(`\tai_will_do = { base = ${o.ai} }`);
  lines.push("}");
  lines.push("");
  return lines.join("\n");
}

function pairBlocks(tag, state, prevAlly, prevWar, isFirst) {
  const prereq = isFirst
    ? "focus = DEC_CHU_vbg_restore"
    : `focus = ${prevAlly} focus = ${prevWar}`;
  const save =
    `${tag} = { save_event_target_as = DEC_chu_vbg_tgt }\n${state} = { save_event_target_as = DEC_chu_vbg_st }`;
  const libBan = `NOT = {\n\tAND = {\n\t\tDEC_is_libertarian_gov = yes\n\t\tOR = {\n\t\t\tAND = { country_exists = ${tag} ${tag} = { DEC_is_lib_or_anarchist_gov = yes } }\n\t\t\t${state} = { owner = { DEC_is_lib_or_anarchist_gov = yes } }\n\t\t}\n\t}\n}`;
  const ally = focusBlock({
    id: `DEC_CHU_vbg_ally_${tag}`,
    icon: "GFX_DEC_CHU_vbg_ally",
    allow: "DEC_CHU_vbg_path_open = yes",
    rel: isFirst ? "DEC_CHU_vbg_restore" : prevAlly,
    x: isFirst ? -1 : 0,
    y: 1,
    cost: 6,
    prereq,
    mutex: `DEC_CHU_vbg_war_${tag}`,
    filters: "FOCUS_FILTER_POLITICAL FOCUS_FILTER_ANNEXATION",
    available: `country_exists = ${tag}\n${tag} = {\n\texists = yes\n\tis_subject = no\n\tnum_of_controlled_states > 0\n\tNOT = { tag = ROOT }\n}`,
    bypass: `OR = {\n\t${state} = { is_owned_by = ROOT }\n\t${tag} = { is_in_faction_with = ROOT }\n}`,
    reward: `${save}\nDEC_CHU_vbg_ally_saved = yes\ncustom_effect_tooltip = DEC_CHU_vbg_ally_${tag}_tt`,
    ai: 3,
  });
  const war = focusBlock({
    id: `DEC_CHU_vbg_war_${tag}`,
    icon: "GFX_DEC_CHU_vbg_war",
    allow: "DEC_CHU_vbg_path_open = yes",
    rel: isFirst ? "DEC_CHU_vbg_restore" : prevWar,
    x: isFirst ? 1 : 0,
    y: 1,
    cost: 6,
    prereq,
    mutex: `DEC_CHU_vbg_ally_${tag}`,
    filters: "FOCUS_FILTER_ANNEXATION",
    available: `${libBan}\nOR = {\n\tAND = { country_exists = ${tag} ${tag} = { NOT = { tag = ROOT } } }\n\t${state} = { NOT = { is_owned_by = ROOT } }\n}`,
    bypass: `OR = {\n\t${state} = { is_owned_by = ROOT }\n\t${tag} = { is_in_faction_with = ROOT }\n}`,
    reward: `${save}\nDEC_CHU_vbg_war_saved = yes\ncustom_effect_tooltip = DEC_CHU_vbg_war_${tag}_tt`,
    ai: 1,
  });
  return ally + war;
}

function buildFocusFile() {
  const parts = [];
  parts.push("############################################");
  parts.push("# Chuvash: Volga Bulgaria restoration + libertarian economy");
  parts.push("############################################");
  parts.push("");
  parts.push(
    focusBlock({
      id: "DEC_CHU_vbg_restore",
      icon: "GFX_DEC_CHU_vbg_restore",
      allow: "DEC_CHU_vbg_path_open = yes",
      rel: "DEC_CHU_pol_root",
      x: -28,
      y: 0,
      cost: 8,
      filters: "FOCUS_FILTER_POLITICAL FOCUS_FILTER_ANNEXATION",
      reward:
        "DEC_CHU_ensure_bulgar_faction = yes\n661 = { add_claim_by = ROOT add_core_of = VBG add_core_of = BCF }\n1134 = { add_claim_by = ROOT add_core_of = VBG add_core_of = BCF }\n1118 = { add_claim_by = ROOT add_core_of = VBG add_core_of = BCF }\n1133 = { add_claim_by = ROOT add_core_of = VBG add_core_of = BCF }\n1251 = { add_claim_by = ROOT add_core_of = VBG add_core_of = BCF }\n1132 = { add_claim_by = ROOT add_core_of = VBG add_core_of = BCF }\nadd_political_power = 75\nadd_war_support = 0.05\ncustom_effect_tooltip = DEC_CHU_vbg_restore_tt",
      ai: 8,
    })
  );
  const seq = [
    ["TAT", 661],
    ["MEL", 1134],
    ["VYK", 1118],
    ["UDM", 1133],
    ["MOK", 1251],
    ["ERZ", 1132],
  ];
  for (let i = 0; i < seq.length; i++) {
    const [tag] = seq[i];
    const prev = i === 0 ? null : seq[i - 1][0];
    parts.push(
      pairBlocks(
        tag,
        seq[i][1],
        prev ? `DEC_CHU_vbg_ally_${prev}` : null,
        prev ? `DEC_CHU_vbg_war_${prev}` : null,
        i === 0
      )
    );
  }
  parts.push(
    focusBlock({
      id: "DEC_CHU_lib_bc",
      icon: "GFX_DEC_CHU_lib_bc",
      allow: "DEC_CHU_lib_path_open = yes",
      rel: "DEC_CHU_pol_root",
      x: 28,
      y: 0,
      cost: 8,
      filters: "FOCUS_FILTER_POLITICAL",
      reward:
        "add_ideas = DEC_CHU_blockchain_state\nset_country_flag = DEC_CHU_freedom_tick\nadd_political_power = 80\ncustom_effect_tooltip = DEC_CHU_lib_bc_tt",
      ai: 9,
    })
  );
  parts.push(
    focusBlock({
      id: "DEC_CHU_lib_pmcs",
      icon: "GFX_DEC_CHU_lib_pmcs",
      allow: "DEC_CHU_lib_path_open = yes",
      rel: "DEC_CHU_lib_bc",
      x: 0,
      y: 1,
      cost: 8,
      prereq: "focus = DEC_CHU_lib_bc",
      filters: "FOCUS_FILTER_POLITICAL",
      reward:
        "add_ideas = DEC_CHU_private_armies\nset_country_flag = DEC_CHU_priv_pmcs\nDEC_spawn_drone_template = yes\nadd_manpower = 5000\ncustom_effect_tooltip = DEC_CHU_lib_pmcs_tt",
      ai: 8,
    })
  );
  parts.push(
    focusBlock({
      id: "DEC_CHU_lib_coin",
      icon: "GFX_DEC_CHU_lib_coin",
      allow: "DEC_CHU_coin_path_open = yes",
      rel: "DEC_CHU_pol_root",
      x: 22,
      y: 0,
      cost: 7,
      filters: "FOCUS_FILTER_POLITICAL",
      reward:
        "add_ideas = DEC_CHU_bulcoin\nset_country_flag = DEC_CHU_bulcoin_tick\nset_temp_variable = { treasury_change = 8 }\nmodify_treasury_effect = yes\nadd_stability = 0.08\ncustom_effect_tooltip = DEC_CHU_lib_coin_tt",
      ai: 7,
    })
  );
  parts.push(
    focusBlock({
      id: "DEC_CHU_lib_priv",
      icon: "GFX_DEC_CHU_lib_priv",
      allow: "DEC_CHU_lib_path_open = yes",
      rel: "DEC_CHU_lib_coin",
      x: 0,
      y: 1,
      cost: 10,
      prereq: "focus = DEC_CHU_lib_coin",
      filters: "FOCUS_FILTER_INDUSTRY",
      reward:
        "add_ideas = DEC_CHU_privatization\nset_country_flag = DEC_CHU_priv_industry\nset_variable = { DEC_chu_priv_months = 0 }\ncustom_effect_tooltip = DEC_CHU_lib_priv_tt",
      ai: 10,
    })
  );
  return parts.join("\n");
}

function appendLoc(file, block) {
  let buf = fs.readFileSync(file);
  const bom = buf.length >= 2 && buf[0] === 0xef && buf[1] === 0xbb && buf[2] === 0xbf;
  let text = bom ? buf.slice(3).toString("utf8") : buf.toString("utf8");
  if (!text.endsWith("\n")) text += "\n";
  if (text.includes("DEC_CHU_vbg_restore:")) {
    return;
  }
  text += block;
  const out = Buffer.from(text, "utf8");
  fs.writeFileSync(file, bom ? Buffer.concat([Buffer.from([0xef, 0xbb, 0xbf]), out]) : out);
}

async function main() {
  const icons = [
    "DEC_CHU_vbg_restore",
    "DEC_CHU_vbg_ally",
    "DEC_CHU_vbg_war",
    "DEC_CHU_lib_bc",
    "DEC_CHU_lib_pmcs",
    "DEC_CHU_lib_coin",
    "DEC_CHU_lib_priv",
  ];
  for (const id of icons) {
    const jpg = path.join(ASSETS, id + ".jpg");
    if (!fs.existsSync(jpg)) throw new Error("missing " + jpg);
    await jpgToGoalDDS(jpg, path.join(GOAL_DIR, id + ".dds"));
  }

  const gfxPath = path.join(ROOT, "interface/DEC_chu_goals.gfx");
  let gfx = fs.readFileSync(gfxPath, "utf8");
  if (!gfx.includes("GFX_DEC_CHU_vbg_restore")) {
    const extra = icons
      .map(
        (id) =>
          `\tspriteType = {\n\t\tname = "GFX_${id}"\n\t\ttexturefile = "gfx/interface/goals/${id}.dds"\n\t}`
      )
      .join("\n");
    gfx = gfx.replace(/\r?\n}\s*$/, "\n" + extra + "\n}\n");
    fs.writeFileSync(gfxPath, gfx);
  }

  fs.writeFileSync(path.join(ROOT, "common/national_focus/DEC_chuvash_vbg.txt"), buildFocusFile(), "utf8");

  const polPath = path.join(ROOT, "common/national_focus/DEC_chuvash_politics.txt");
  let pol = fs.readFileSync(polPath, "utf8");
  pol = pol.replace(
    /add_political_power = 100\r?\n\t\tadd_stability = 0\.05\r?\n\t\tcustom_effect_tooltip/g,
    "add_political_power = 100\n\t\tadd_stability = 0.05\n\t\tDEC_CHU_after_take_power = yes\n\t\tcustom_effect_tooltip"
  );
  const extras = {
    oresh: "DEC_CHU_unlock_vbg = yes\n\t\tDEC_CHU_unlock_lib = yes\n\t\t",
    cons: "DEC_CHU_unlock_vbg = yes\n\t\t",
    est: "DEC_CHU_unlock_vbg = yes\n\t\t",
    luk: "DEC_CHU_unlock_vbg = yes\n\t\t",
    khuz: "DEC_CHU_unlock_vbg = yes\n\t\t",
    evd: "DEC_CHU_unlock_vbg = yes\n\t\t",
    yukh: "DEC_CHU_unlock_vbg = yes\n\t\t",
    olen: "set_country_flag = DEC_CHU_left_front_power\n\t\t",
  };
  for (const [k, extra] of Object.entries(extras)) {
    const needle = `DEC_CHU_after_take_power = yes\n\t\tcustom_effect_tooltip = DEC_CHU_pol_pwr_${k}_tt`;
    const marker = extra.trim().split("\n")[0];
    if (pol.includes(needle) && !pol.includes(marker)) {
      pol = pol.replace(needle, `DEC_CHU_after_take_power = yes\n\t\t${extra}custom_effect_tooltip = DEC_CHU_pol_pwr_${k}_tt`);
    }
  }
  fs.writeFileSync(polPath, pol, "utf8");

  const ru = `
 DEC_CHU_vbg_restore: "Воссоздание Волжской Булгарии"
 DEC_CHU_vbg_restore_desc: "Правые, фашисты и либертарианцы собирают булгарский проект: сначала претензии, затем союз или война за каждый народ Поволжья."
 DEC_CHU_vbg_restore_tt: "§YСоздаёт альянс Булгарской Конфедерации§! и претензии на Татарстан, Марий Эл, Верхнеяицкое войско, Удмуртию, Мокшу и Эрзю."
 DEC_CHU_vbg_ally_TAT: "Союз с Татарстаном"
 DEC_CHU_vbg_ally_TAT_desc: "Пригласить независимый Татарстан в альянс Булгарской Конфедерации."
 DEC_CHU_vbg_ally_TAT_tt: "§GТатарстан вступает в Булгарскую Конфедерацию.§!"
 DEC_CHU_vbg_war_TAT: "Война за Татарстан"
 DEC_CHU_vbg_war_TAT_desc: "Захватить Татарстан или объявить войну владельцу его земель."
 DEC_CHU_vbg_war_TAT_tt: "§RВойна за земли Татарстана.§!"
 DEC_CHU_vbg_ally_MEL: "Союз с Марий Эл"
 DEC_CHU_vbg_ally_MEL_desc: "Пригласить независимую Марий Эл в альянс Булгарской Конфедерации."
 DEC_CHU_vbg_ally_MEL_tt: "§GМарий Эл вступает в Булгарскую Конфедерацию.§!"
 DEC_CHU_vbg_war_MEL: "Война за Марий Эл"
 DEC_CHU_vbg_war_MEL_desc: "Захватить Марий Эл или объявить войну владельцу его земель."
 DEC_CHU_vbg_war_MEL_tt: "§RВойна за земли Марий Эл.§!"
 DEC_CHU_vbg_ally_VYK: "Союз с Верхнеяицким войском"
 DEC_CHU_vbg_ally_VYK_desc: "Пригласить независимое Верхнеяицкое войско в альянс Булгарской Конфедерации."
 DEC_CHU_vbg_ally_VYK_tt: "§GВерхнеяицкое войско вступает в Булгарскую Конфедерацию.§!"
 DEC_CHU_vbg_war_VYK: "Война за Яик"
 DEC_CHU_vbg_war_VYK_desc: "Захватить Верхнеяицкое войско или объявить войну владельцу его земель."
 DEC_CHU_vbg_war_VYK_tt: "§RВойна за земли Верхнеяицкого войска.§!"
 DEC_CHU_vbg_ally_UDM: "Союз с Удмуртией"
 DEC_CHU_vbg_ally_UDM_desc: "Пригласить независимую Удмуртию в альянс Булгарской Конфедерации."
 DEC_CHU_vbg_ally_UDM_tt: "§GУдмуртия вступает в Булгарскую Конфедерацию.§!"
 DEC_CHU_vbg_war_UDM: "Война за Удмуртию"
 DEC_CHU_vbg_war_UDM_desc: "Захватить Удмуртию или объявить войну владельцу её земель."
 DEC_CHU_vbg_war_UDM_tt: "§RВойна за земли Удмуртии.§!"
 DEC_CHU_vbg_ally_MOK: "Союз с Мокшей"
 DEC_CHU_vbg_ally_MOK_desc: "Пригласить независимую Мокшу в альянс Булгарской Конфедерации."
 DEC_CHU_vbg_ally_MOK_tt: "§GМокша вступает в Булгарскую Конфедерацию.§!"
 DEC_CHU_vbg_war_MOK: "Война за Мокшу"
 DEC_CHU_vbg_war_MOK_desc: "Захватить Мокшу или объявить войну владельцу её земель."
 DEC_CHU_vbg_war_MOK_tt: "§RВойна за земли Мокши.§!"
 DEC_CHU_vbg_ally_ERZ: "Союз с Эрзей"
 DEC_CHU_vbg_ally_ERZ_desc: "Пригласить независимую Эрзю в альянс Булгарской Конфедерации."
 DEC_CHU_vbg_ally_ERZ_tt: "§GЭрзя вступает в Булгарскую Конфедерацию.§!"
 DEC_CHU_vbg_war_ERZ: "Война за Эрзю"
 DEC_CHU_vbg_war_ERZ_desc: "Захватить Эрзю или объявить войну владельцу её земель."
 DEC_CHU_vbg_war_ERZ_tt: "§RВойна за земли Эрзи.§!"
 DEC_CHU_vbg_ally_tt: "Цель приглашается в альянс Булгарской Конфедерации."
 DEC_CHU_vbg_ally_fail_war_tt: "§YНезависимой цели нет — переход к войне за земли.§!"
 DEC_CHU_vbg_war_tt: "Объявлена война независимому государству цели."
 DEC_CHU_vbg_war_owner_tt: "Объявлена война владельцу столичных земель цели."
 DEC_CHU_vbg_already_ours_tt: "Земли уже наши."
 DEC_CHU_lib_war_ban_tt: "§GЛибертарианцы не начинают войн против либертарианцев и анархистов — предлагается союз.§!"
 DEC_CHU_lib_bc: "Создать блокчейн-государство"
 DEC_CHU_lib_bc_desc: "Цифровой реестр вместо канцелярии: быстрее наука, быстрее растёт свобода и политическая власть."
 DEC_CHU_lib_bc_tt: "§YВечный баф: скорость исследований, политвласть и рост свободы.§!"
 DEC_CHU_lib_pmcs: "Создать частные армии"
 DEC_CHU_lib_pmcs_desc: "Каждый регион ежемесячно выставляет новый отряд дронщиков."
 DEC_CHU_lib_pmcs_tt: "§YКаждый месяц: 1 отряд «Drone Swarm» в каждом подконтрольном регионе.§!"
 DEC_CHU_lib_coin: "Создать криптовалюту BulCoin"
 DEC_CHU_lib_coin_desc: "BulCoin доступен всем партиям, кроме Левого фронта: деньги в казну и стабильность."
 DEC_CHU_lib_coin_tt: "§Y+деньги и стабильность. Ежемесячный приток в казну.§! Недоступно Левому фронту."
 DEC_CHU_lib_priv: "Начать приватизацию за BulCoin"
 DEC_CHU_lib_priv_desc: "Вечный баф: каждый месяц фабрика в каждом регионе (в войне — военный завод вместо гражданской). Раз в полгода — случайное здание. Вместе со зданием появляется ячейка строительства."
 DEC_CHU_lib_priv_tt: "§YВечно: ежемесячно слот+фабрика (мир) или слот+военный завод (война) в каждом регионе. Каждые 6 месяцев — слот и случайное здание.§!"
 DEC_CHU_blockchain_state: "Блокчейн-государство"
 DEC_CHU_blockchain_state_desc: "Исследования ускорены. Свобода и политическая власть растут."
 DEC_CHU_private_armies: "Частные армии"
 DEC_CHU_private_armies_desc: "Каждый месяц каждый регион формирует дронщиков."
 DEC_CHU_bulcoin: "BulCoin"
 DEC_CHU_bulcoin_desc: "Криптовалюта пополняет казну и держит стабильность."
 DEC_CHU_privatization: "Приватизация за BulCoin"
 DEC_CHU_privatization_desc: "Каждый месяц новые слоты и заводы. Каждые полгода — случайное здание."
 DEC_CHU_lib_pact: "Пакт ненападения свободы"
 DEC_CHU_lib_pact_desc: "Либертарианское правительство не начинает войн против либертарианцев и анархистов."
`;

  const en = `
 DEC_CHU_vbg_restore: "Restore Volga Bulgaria"
 DEC_CHU_vbg_restore_desc: "Rightists, fascists and libertarians revive the Bulgar project: claims first, then alliance or war for each Volga nation."
 DEC_CHU_vbg_restore_tt: "§YCreates the Bulgar Confederation alliance§! and claims on Tatarstan, Mari El, the Yaik Host, Udmurtia, Moksha and Erzya."
 DEC_CHU_vbg_ally_TAT: "Alliance with Tatarstan"
 DEC_CHU_vbg_ally_TAT_desc: "Invite independent Tatarstan into the Bulgar Confederation."
 DEC_CHU_vbg_ally_TAT_tt: "§GTatarstan joins the Bulgar Confederation.§!"
 DEC_CHU_vbg_war_TAT: "War for Tatarstan"
 DEC_CHU_vbg_war_TAT_desc: "Seize Tatarstan or declare war on whoever owns its land."
 DEC_CHU_vbg_war_TAT_tt: "§RWar for Tatarstan's lands.§!"
 DEC_CHU_vbg_ally_MEL: "Alliance with Mari El"
 DEC_CHU_vbg_ally_MEL_desc: "Invite independent Mari El into the Bulgar Confederation."
 DEC_CHU_vbg_ally_MEL_tt: "§GMari El joins the Bulgar Confederation.§!"
 DEC_CHU_vbg_war_MEL: "War for Mari El"
 DEC_CHU_vbg_war_MEL_desc: "Seize Mari El or declare war on whoever owns its land."
 DEC_CHU_vbg_war_MEL_tt: "§RWar for Mari El's lands.§!"
 DEC_CHU_vbg_ally_VYK: "Alliance with the Yaik Host"
 DEC_CHU_vbg_ally_VYK_desc: "Invite the independent Upper Yaik Host into the Bulgar Confederation."
 DEC_CHU_vbg_ally_VYK_tt: "§GThe Yaik Host joins the Bulgar Confederation.§!"
 DEC_CHU_vbg_war_VYK: "War for the Yaik"
 DEC_CHU_vbg_war_VYK_desc: "Seize the Yaik Host or declare war on whoever owns its land."
 DEC_CHU_vbg_war_VYK_tt: "§RWar for Yaik lands.§!"
 DEC_CHU_vbg_ally_UDM: "Alliance with Udmurtia"
 DEC_CHU_vbg_ally_UDM_desc: "Invite independent Udmurtia into the Bulgar Confederation."
 DEC_CHU_vbg_ally_UDM_tt: "§GUdmurtia joins the Bulgar Confederation.§!"
 DEC_CHU_vbg_war_UDM: "War for Udmurtia"
 DEC_CHU_vbg_war_UDM_desc: "Seize Udmurtia or declare war on whoever owns its land."
 DEC_CHU_vbg_war_UDM_tt: "§RWar for Udmurtia's lands.§!"
 DEC_CHU_vbg_ally_MOK: "Alliance with Moksha"
 DEC_CHU_vbg_ally_MOK_desc: "Invite independent Moksha into the Bulgar Confederation."
 DEC_CHU_vbg_ally_MOK_tt: "§GMoksha joins the Bulgar Confederation.§!"
 DEC_CHU_vbg_war_MOK: "War for Moksha"
 DEC_CHU_vbg_war_MOK_desc: "Seize Moksha or declare war on whoever owns its land."
 DEC_CHU_vbg_war_MOK_tt: "§RWar for Moksha lands.§!"
 DEC_CHU_vbg_ally_ERZ: "Alliance with Erzya"
 DEC_CHU_vbg_ally_ERZ_desc: "Invite independent Erzya into the Bulgar Confederation."
 DEC_CHU_vbg_ally_ERZ_tt: "§GErzya joins the Bulgar Confederation.§!"
 DEC_CHU_vbg_war_ERZ: "War for Erzya"
 DEC_CHU_vbg_war_ERZ_desc: "Seize Erzya or declare war on whoever owns its land."
 DEC_CHU_vbg_war_ERZ_tt: "§RWar for Erzya lands.§!"
 DEC_CHU_vbg_ally_tt: "The target is invited into the Bulgar Confederation."
 DEC_CHU_vbg_ally_fail_war_tt: "§YNo independent target — switching to a war for the land.§!"
 DEC_CHU_vbg_war_tt: "War declared on the independent target state."
 DEC_CHU_vbg_war_owner_tt: "War declared on the owner of the target capital lands."
 DEC_CHU_vbg_already_ours_tt: "The lands are already ours."
 DEC_CHU_lib_war_ban_tt: "§GLibertarians do not start wars against libertarians or anarchists — an alliance is offered instead.§!"
 DEC_CHU_lib_bc: "Found a Blockchain State"
 DEC_CHU_lib_bc_desc: "A digital ledger instead of a chancellery: faster research, faster growth of freedom and political power."
 DEC_CHU_lib_bc_tt: "§YPermanent buff: research speed, political power and freedom growth.§!"
 DEC_CHU_lib_pmcs: "Raise Private Armies"
 DEC_CHU_lib_pmcs_desc: "Every region fields a new drone detachment each month."
 DEC_CHU_lib_pmcs_tt: "§YEach month: 1 Drone Swarm in every controlled region.§!"
 DEC_CHU_lib_coin: "Create the BulCoin Cryptocurrency"
 DEC_CHU_lib_coin_desc: "BulCoin is available to every party except the Left Front: treasury income and stability."
 DEC_CHU_lib_coin_tt: "§Y+money and stability. Monthly treasury inflow.§! Unavailable to the Left Front."
 DEC_CHU_lib_priv: "Privatize for BulCoin"
 DEC_CHU_lib_priv_desc: "Permanent buff: each month a factory in every region (a military factory instead of a civilian one during war). Every six months a random other building. Each building also adds a construction slot."
 DEC_CHU_lib_priv_tt: "§YPermanent: monthly slot+civilian factory (peace) or slot+military factory (war) in every region. Every 6 months: slot and a random building.§!"
 DEC_CHU_blockchain_state: "Blockchain State"
 DEC_CHU_blockchain_state_desc: "Research is faster. Freedom and political power grow."
 DEC_CHU_private_armies: "Private Armies"
 DEC_CHU_private_armies_desc: "Each month every region raises drone troops."
 DEC_CHU_bulcoin: "BulCoin"
 DEC_CHU_bulcoin_desc: "The cryptocurrency fills the treasury and supports stability."
 DEC_CHU_privatization: "Privatization for BulCoin"
 DEC_CHU_privatization_desc: "New slots and factories every month. A random building every six months."
 DEC_CHU_lib_pact: "Liberty Non-Aggression"
 DEC_CHU_lib_pact_desc: "A libertarian government does not start wars against libertarians or anarchists."
`;

  appendLoc(path.join(ROOT, "localisation/russian/DEC_l_russian.yml"), ru);
  appendLoc(path.join(ROOT, "localisation/english/DEC_l_english.yml"), en);
  console.log("ok");
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
