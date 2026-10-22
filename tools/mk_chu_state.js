/**
 * Chuvash independent-state focus branch: icons, gfx, focuses, loc, ideas hooks.
 * Layout sits BELOW politics (y=8 from pol_root) to avoid overlap with VBG/lib/war.
 */
const fs = require("fs");
const path = require("path");
const sharp = require("sharp");

const ROOT = "c:/git/decolonizaciya";
const GOAL_DIR = path.join(ROOT, "gfx/interface/goals");
const GFX = path.join(ROOT, "interface/DEC_chu_goals.gfx");
const FOCUS = path.join(ROOT, "common/national_focus/DEC_chuvash_state.txt");
fs.mkdirSync(GOAL_DIR, { recursive: true });

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

async function svgToGoal(svg, dest) {
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
  writeDDS(bgra, info.width, info.height, dest);
}

function iconSvg(bg1, bg2, motif, accent = "#f5e6b8") {
  return `<svg width="90" height="90" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="g" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="${bg1}"/>
      <stop offset="100%" stop-color="${bg2}"/>
    </linearGradient>
  </defs>
  <rect width="90" height="90" rx="8" fill="url(#g)"/>
  <rect x="4" y="4" width="82" height="82" rx="6" fill="none" stroke="${accent}" stroke-width="2" opacity="0.55"/>
  ${motif}
</svg>`;
}

const ICONS = {
  DEC_CHU_state_root: iconSvg(
    "#1a3a5c",
    "#0d2137",
    `<polygon points="45,14 70,70 20,70" fill="none" stroke="#e8c547" stroke-width="3"/>
     <circle cx="45" cy="48" r="8" fill="#e8c547"/>`
  ),
  DEC_CHU_ind_root: iconSvg(
    "#3d4a2e",
    "#1e2616",
    `<rect x="18" y="40" width="54" height="28" fill="#8fa86a"/>
     <rect x="26" y="28" width="12" height="12" fill="#c9d9a8"/>
     <rect x="52" y="22" width="12" height="18" fill="#c9d9a8"/>
     <rect x="38" y="34" width="10" height="6" fill="#e8c547"/>`
  ),
  DEC_CHU_ind_tractor: iconSvg(
    "#4a5c2e",
    "#243016",
    `<circle cx="28" cy="58" r="12" fill="none" stroke="#e8c547" stroke-width="3"/>
     <circle cx="62" cy="58" r="8" fill="none" stroke="#e8c547" stroke-width="3"/>
     <rect x="22" y="30" width="40" height="18" rx="3" fill="#c9d9a8"/>`
  ),
  DEC_CHU_ind_chem: iconSvg(
    "#2e4a4a",
    "#163030",
    `<rect x="30" y="22" width="10" height="40" fill="#7ec8c8"/>
     <rect x="48" y="34" width="10" height="28" fill="#7ec8c8"/>
     <path d="M35 22 Q40 10 45 22" fill="none" stroke="#e8c547" stroke-width="2"/>
     <path d="M53 34 Q58 22 63 34" fill="none" stroke="#e8c547" stroke-width="2"/>`
  ),
  DEC_CHU_ind_volga: iconSvg(
    "#1e3a5c",
    "#0e2040",
    `<path d="M10 50 Q30 30 45 50 T80 50" fill="none" stroke="#6eb5ff" stroke-width="4"/>
     <path d="M10 62 Q30 42 45 62 T80 62" fill="none" stroke="#3d7ab8" stroke-width="3"/>`
  ),
  DEC_CHU_ind_heavy: iconSvg(
    "#4a3a2e",
    "#261c16",
    `<rect x="20" y="35" width="50" height="30" fill="#c4a574"/>
     <rect x="28" y="20" width="8" height="15" fill="#e8c547"/>
     <rect x="54" y="24" width="8" height="11" fill="#e8c547"/>`
  ),
  DEC_CHU_army_root: iconSvg(
    "#4a2e2e",
    "#261616",
    `<polygon points="45,16 58,70 32,70" fill="#d4a0a0"/>
     <rect x="41" y="28" width="8" height="28" fill="#e8c547"/>`
  ),
  DEC_CHU_army_draft: iconSvg(
    "#5c3a2e",
    "#301e16",
    `<circle cx="45" cy="32" r="10" fill="#e8c547"/>
     <path d="M28 70 Q45 48 62 70" fill="#d4a0a0"/>`
  ),
  DEC_CHU_army_officers: iconSvg(
    "#3a2e4a",
    "#1c1626",
    `<polygon points="45,18 52,40 45,36 38,40" fill="#e8c547"/>
     <rect x="35" y="40" width="20" height="28" fill="#b8a0d4"/>`
  ),
  DEC_CHU_army_milind: iconSvg(
    "#4a2e3a",
    "#26161e",
    `<rect x="18" y="45" width="54" height="22" fill="#c490a8"/>
     <circle cx="45" cy="32" r="14" fill="none" stroke="#e8c547" stroke-width="3"/>`
  ),
  DEC_CHU_army_doctrine: iconSvg(
    "#2e3a4a",
    "#161e26",
    `<path d="M45 16 L70 70 L20 70 Z" fill="none" stroke="#e8c547" stroke-width="3"/>
     <circle cx="45" cy="48" r="6" fill="#6eb5ff"/>`
  ),
  DEC_CHU_cul_root: iconSvg(
    "#3a4a2e",
    "#1e2616",
    `<circle cx="45" cy="45" r="22" fill="none" stroke="#e8c547" stroke-width="3"/>
     <circle cx="45" cy="45" r="8" fill="#c9d9a8"/>`
  ),
  DEC_CHU_cul_tene: iconSvg(
    "#2e4a3a",
    "#163024",
    `<circle cx="45" cy="28" r="8" fill="#e8c547"/>
     <path d="M45 36 L45 70" stroke="#e8c547" stroke-width="3"/>
     <path d="M30 50 L60 50" stroke="#8fa86a" stroke-width="3"/>
     <path d="M34 62 L56 62" stroke="#8fa86a" stroke-width="2"/>`
  ),
  DEC_CHU_cul_keremet: iconSvg(
    "#24402e",
    "#142418",
    `<path d="M45 70 L45 30" stroke="#c9d9a8" stroke-width="4"/>
     <path d="M45 30 L28 48" stroke="#c9d9a8" stroke-width="3"/>
     <path d="M45 30 L62 48" stroke="#c9d9a8" stroke-width="3"/>
     <circle cx="45" cy="22" r="6" fill="#e8c547"/>`
  ),
  DEC_CHU_cul_calendar: iconSvg(
    "#2e4038",
    "#182420",
    `<rect x="22" y="24" width="46" height="44" rx="4" fill="none" stroke="#e8c547" stroke-width="2"/>
     <circle cx="34" cy="40" r="4" fill="#8fa86a"/>
     <circle cx="45" cy="40" r="4" fill="#e8c547"/>
     <circle cx="56" cy="40" r="4" fill="#8fa86a"/>
     <circle cx="34" cy="54" r="4" fill="#8fa86a"/>
     <circle cx="45" cy="54" r="4" fill="#8fa86a"/>`
  ),
  DEC_CHU_cul_secular: iconSvg(
    "#2e3a4a",
    "#161e26",
    `<rect x="28" y="22" width="34" height="46" rx="3" fill="#8ab0d4"/>
     <rect x="34" y="30" width="22" height="4" fill="#e8c547"/>
     <rect x="34" y="40" width="22" height="4" fill="#e8c547"/>
     <rect x="34" y="50" width="14" height="4" fill="#e8c547"/>`
  ),
  DEC_CHU_cul_islam: iconSvg(
    "#2e4a3a",
    "#163024",
    `<path d="M45 18 L58 70 L32 70 Z" fill="none" stroke="#e8c547" stroke-width="3"/>
     <circle cx="52" cy="36" r="10" fill="none" stroke="#c9d9a8" stroke-width="2"/>`
  ),
  DEC_CHU_pty_hub: iconSvg(
    "#3a2e4a",
    "#1c1626",
    `<circle cx="45" cy="45" r="20" fill="none" stroke="#e8c547" stroke-width="3"/>
     <circle cx="45" cy="45" r="6" fill="#b8a0d4"/>
     <circle cx="45" cy="22" r="4" fill="#e8c547"/>
     <circle cx="65" cy="55" r="4" fill="#e8c547"/>
     <circle cx="25" cy="55" r="4" fill="#e8c547"/>`
  ),
  DEC_CHU_pty_west: iconSvg(
    "#1e3a6a",
    "#0e2040",
    `<rect x="20" y="30" width="50" height="30" fill="#6eb5ff"/>
     <circle cx="35" cy="45" r="8" fill="#e8c547"/>
     <rect x="48" y="38" width="16" height="14" fill="#fff" opacity="0.7"/>`
  ),
  DEC_CHU_pty_west_corr: iconSvg(
    "#1e4a5c",
    "#0e2830",
    `<path d="M30 60 L45 25 L60 60 Z" fill="#e8c547"/>
     <rect x="42" y="40" width="6" height="20" fill="#0e2830"/>`
  ),
  DEC_CHU_pty_west_euro: iconSvg(
    "#1e3a6a",
    "#0e2040",
    `<circle cx="45" cy="45" r="22" fill="none" stroke="#e8c547" stroke-width="3"/>
     <circle cx="45" cy="45" r="4" fill="#e8c547"/>
     <circle cx="45" cy="28" r="3" fill="#fff"/>
     <circle cx="60" cy="52" r="3" fill="#fff"/>
     <circle cx="30" cy="52" r="3" fill="#fff"/>`
  ),
  DEC_CHU_pty_left: iconSvg(
    "#6a1e1e",
    "#400e0e",
    `<path d="M45 18 L70 70 L20 70 Z" fill="#e05050"/>
     <rect x="42" y="35" width="6" height="25" fill="#e8c547"/>`
  ),
  DEC_CHU_pty_left_work: iconSvg(
    "#5c2e1e",
    "#30160e",
    `<rect x="25" y="40" width="40" height="24" fill="#d48060"/>
     <circle cx="35" cy="30" r="8" fill="#e8c547"/>
     <circle cx="55" cy="30" r="8" fill="#e8c547"/>`
  ),
  DEC_CHU_pty_left_plan: iconSvg(
    "#4a1e2e",
    "#260e16",
    `<rect x="22" y="22" width="46" height="46" fill="none" stroke="#e8c547" stroke-width="2"/>
     <path d="M28 60 L40 40 L52 50 L62 30" fill="none" stroke="#e05050" stroke-width="3"/>`
  ),
  DEC_CHU_pty_nat: iconSvg(
    "#4a3a1e",
    "#261e0e",
    `<rect x="30" y="20" width="30" height="50" fill="#e8c547"/>
     <rect x="36" y="28" width="18" height="8" fill="#261e0e"/>
     <circle cx="45" cy="52" r="8" fill="#261e0e"/>`
  ),
  DEC_CHU_pty_nat_lang: iconSvg(
    "#3a4a1e",
    "#1e260e",
    `<rect x="24" y="28" width="42" height="34" rx="3" fill="#c9d9a8"/>
     <text x="45" y="52" text-anchor="middle" font-size="16" fill="#1e260e" font-family="Arial" font-weight="700">Ç</text>`
  ),
  DEC_CHU_pty_nat_mem: iconSvg(
    "#4a3a2e",
    "#261c16",
    `<rect x="35" y="20" width="20" height="50" fill="#c4a574"/>
     <rect x="28" y="55" width="34" height="10" fill="#e8c547"/>`
  ),
  DEC_CHU_pty_argadu: iconSvg(
    "#1e4a3a",
    "#0e2820",
    `<path d="M45 16 L62 70 L28 70 Z" fill="none" stroke="#e8c547" stroke-width="3"/>
     <circle cx="55" cy="34" r="9" fill="none" stroke="#8fa86a" stroke-width="2"/>`
  ),
  DEC_CHU_pty_argadu_ummah: iconSvg(
    "#1e4038",
    "#0e2420",
    `<circle cx="45" cy="45" r="24" fill="none" stroke="#e8c547" stroke-width="2"/>
     <path d="M30 45 Q45 25 60 45 Q45 65 30 45" fill="#8fa86a"/>`
  ),
  DEC_CHU_pty_argadu_law: iconSvg(
    "#244038",
    "#142420",
    `<rect x="28" y="22" width="34" height="46" fill="#e8c547"/>
     <rect x="34" y="30" width="22" height="4" fill="#142420"/>
     <rect x="34" y="40" width="22" height="4" fill="#142420"/>
     <rect x="34" y="50" width="14" height="4" fill="#142420"/>`
  ),
  DEC_CHU_pty_est: iconSvg(
    "#3a3a4a",
    "#1e1e26",
    `<rect x="25" y="35" width="40" height="28" fill="#a0a0b8"/>
     <rect x="35" y="22" width="20" height="13" fill="#e8c547"/>`
  ),
  DEC_CHU_pty_est_cont: iconSvg(
    "#3a3a4a",
    "#1e1e26",
    `<circle cx="45" cy="45" r="20" fill="none" stroke="#e8c547" stroke-width="3"/>
     <path d="M45 25 L45 45 L58 52" fill="none" stroke="#a0a0b8" stroke-width="3"/>`
  ),
  DEC_CHU_dip_root: iconSvg(
    "#1e2e5c",
    "#0e1830",
    `<circle cx="45" cy="45" r="22" fill="none" stroke="#6eb5ff" stroke-width="3"/>
     <path d="M23 45 Q45 20 67 45 Q45 70 23 45" fill="none" stroke="#e8c547" stroke-width="2"/>`
  ),
  DEC_CHU_dip_nato: iconSvg(
    "#1e2e6a",
    "#0e1840",
    `<circle cx="45" cy="45" r="10" fill="#e8c547"/>
     <circle cx="45" cy="22" r="5" fill="#6eb5ff"/>
     <circle cx="65" cy="55" r="5" fill="#6eb5ff"/>
     <circle cx="25" cy="55" r="5" fill="#6eb5ff"/>
     <circle cx="65" cy="32" r="5" fill="#6eb5ff"/>
     <circle cx="25" cy="32" r="5" fill="#6eb5ff"/>`
  ),
  DEC_CHU_dip_bulgar: iconSvg(
    "#4a3a1e",
    "#261e0e",
    `<polygon points="45,14 72,70 18,70" fill="#e8c547"/>
     <circle cx="45" cy="48" r="8" fill="#261e0e"/>`
  ),
  DEC_CHU_dip_volga: iconSvg(
    "#3a4a2e",
    "#1e2616",
    `<path d="M12 55 Q30 35 45 55 T78 55" fill="none" stroke="#6eb5ff" stroke-width="3"/>
     <circle cx="28" cy="40" r="5" fill="#e8c547"/>
     <circle cx="45" cy="32" r="5" fill="#e8c547"/>
     <circle cx="62" cy="40" r="5" fill="#e8c547"/>`
  ),
  DEC_CHU_dip_euro: iconSvg(
    "#2e3a5c",
    "#161e30",
    `<rect x="20" y="28" width="50" height="34" rx="4" fill="#6eb5ff"/>
     <circle cx="35" cy="45" r="6" fill="#e8c547"/>
     <circle cx="55" cy="45" r="6" fill="#e8c547"/>`
  ),
  DEC_CHU_dip_cau: iconSvg(
    "#4a2e3a",
    "#26161e",
    `<polygon points="45,18 70,70 20,70" fill="none" stroke="#e8c547" stroke-width="3"/>
     <polygon points="45,34 58,62 32,62" fill="#c490a8"/>`
  ),
};

function focusBlock(o) {
  const lines = [];
  lines.push("shared_focus = {");
  lines.push(`\tid = ${o.id}`);
  lines.push(`\ticon = GFX_${o.icon || o.id}`);
  lines.push(`\tallow_branch = { ${o.allow} }`);
  if (o.rel) {
    lines.push(`\trelative_position_id = ${o.rel}`);
    lines.push(`\tx = ${o.x}`);
    lines.push(`\ty = ${o.y}`);
  } else {
    lines.push(`\tx = ${o.x}`);
    lines.push(`\ty = ${o.y}`);
  }
  lines.push(`\tcost = ${o.cost ?? 6}`);
  if (o.prereq) {
    for (const p of o.prereq) lines.push(`\tprerequisite = { ${p} }`);
  }
  if (o.mutex) {
    for (const m of o.mutex) lines.push(`\tmutually_exclusive = { focus = ${m} }`);
  }
  if (o.available) {
    lines.push("\tavailable = {");
    for (const a of o.available) lines.push(`\t\t${a}`);
    lines.push("\t}");
  }
  if (o.bypass) {
    lines.push("\tbypass = {");
    for (const b of o.bypass) lines.push(`\t\t${b}`);
    lines.push("\t}");
  }
  lines.push(`\tsearch_filters = { ${o.filters || "FOCUS_FILTER_POLITICAL"} }`);
  lines.push("\tcompletion_reward = {");
  lines.push(`\t\tlog = "[GetDateText]: [Root.GetName]: Focus ${o.id}"`);
  for (const r of o.reward) lines.push(`\t\t${r}`);
  lines.push("\t}");
  lines.push(`\tai_will_do = { base = ${o.ai ?? 5} }`);
  lines.push("}");
  lines.push("");
  return lines.join("\n");
}

const TAG = "OR = { original_tag = CHU original_tag = BCF }";
const STATE = `${TAG} has_country_flag = DEC_CHU_any_power`;
const WEST = `${STATE} has_country_flag = DEC_CHU_camp_west`;
const LEFT = `${STATE} has_country_flag = DEC_CHU_camp_left`;
const NAT = `${STATE} has_country_flag = DEC_CHU_camp_nat`;
const ARG = `${STATE} has_country_flag = DEC_CHU_camp_argadu`;
const EST = `${STATE} has_country_flag = DEC_CHU_camp_est`;
const LIBP = `${STATE} has_country_flag = DEC_CHU_camp_lib`;
const NAT_OR_LIB = `${TAG} has_country_flag = DEC_CHU_any_power OR = { has_country_flag = DEC_CHU_camp_nat has_country_flag = DEC_CHU_camp_lib }`;
const TENE_OK = `${STATE} NOT = { has_country_flag = DEC_CHU_camp_argadu }`;
const ISLAM_OK = `${STATE} has_country_flag = DEC_CHU_camp_argadu`;

const IND_CIV = `random_owned_controlled_state = {
			limit = { is_core_of = ROOT free_building_slots = { building = industrial_complex size > 0 include_locked = yes } }
			add_extra_state_shared_building_slots = 1
			add_building_construction = { type = industrial_complex level = 1 instant_build = yes }
		}`;
const IND_MIL = `random_owned_controlled_state = {
			limit = { is_core_of = ROOT free_building_slots = { building = arms_factory size > 0 include_locked = yes } }
			add_extra_state_shared_building_slots = 1
			add_building_construction = { type = arms_factory level = 1 instant_build = yes }
		}`;
const IND_INF = `random_owned_controlled_state = {
			limit = { is_core_of = ROOT free_building_slots = { building = infrastructure size > 0 include_locked = yes } }
			add_building_construction = { type = infrastructure level = 1 instant_build = yes }
		}`;

function buildFocusFile() {
  const F = [];
  F.push("############################################");
  F.push("# Chuvashia / BCF: independent state tree");
  F.push("# Unlocks after any party take-power focus.");
  F.push("# Placed below politics (y=8) — no overlap with VBG/lib/war.");
  F.push("############################################");
  F.push("");

  // ROOT
  F.push(
    focusBlock({
      id: "DEC_CHU_state_root",
      allow: STATE,
      rel: "DEC_CHU_pol_root",
      x: 0,
      y: 8,
      cost: 5,
      filters: "FOCUS_FILTER_POLITICAL",
      reward: [
        "add_political_power = 75",
        "add_stability = 0.03",
        "custom_effect_tooltip = DEC_CHU_state_root_tt",
      ],
      ai: 12,
    })
  );

  // INDUSTRY
  F.push(
    focusBlock({
      id: "DEC_CHU_ind_root",
      allow: STATE,
      rel: "DEC_CHU_state_root",
      x: -18,
      y: 1,
      cost: 5,
      prereq: ["focus = DEC_CHU_state_root"],
      filters: "FOCUS_FILTER_INDUSTRY",
      reward: ["add_ideas = DEC_CHU_ind_drive", "custom_effect_tooltip = DEC_CHU_ind_root_tt"],
      ai: 9,
    })
  );
  F.push(
    focusBlock({
      id: "DEC_CHU_ind_tractor",
      allow: STATE,
      rel: "DEC_CHU_ind_root",
      x: -2,
      y: 1,
      prereq: ["focus = DEC_CHU_ind_root"],
      filters: "FOCUS_FILTER_INDUSTRY",
      reward: [IND_CIV, "add_political_power = 25", "custom_effect_tooltip = DEC_CHU_ind_tractor_tt"],
      ai: 7,
    })
  );
  F.push(
    focusBlock({
      id: "DEC_CHU_ind_chem",
      allow: STATE,
      rel: "DEC_CHU_ind_root",
      x: 0,
      y: 1,
      prereq: ["focus = DEC_CHU_ind_root"],
      filters: "FOCUS_FILTER_INDUSTRY",
      reward: [IND_CIV, "add_tech_bonus = { name = DEC_CHU_chem_bonus bonus = 0.5 uses = 1 category = industry }", "custom_effect_tooltip = DEC_CHU_ind_chem_tt"],
      ai: 7,
    })
  );
  F.push(
    focusBlock({
      id: "DEC_CHU_ind_volga",
      allow: STATE,
      rel: "DEC_CHU_ind_root",
      x: 2,
      y: 1,
      prereq: ["focus = DEC_CHU_ind_root"],
      filters: "FOCUS_FILTER_INDUSTRY",
      reward: [IND_INF, IND_INF, "custom_effect_tooltip = DEC_CHU_ind_volga_tt"],
      ai: 7,
    })
  );
  F.push(
    focusBlock({
      id: "DEC_CHU_ind_heavy",
      allow: STATE,
      rel: "DEC_CHU_ind_tractor",
      x: 2,
      y: 1,
      prereq: ["focus = DEC_CHU_ind_tractor", "focus = DEC_CHU_ind_chem", "focus = DEC_CHU_ind_volga"],
      filters: "FOCUS_FILTER_INDUSTRY",
      reward: [IND_CIV, IND_MIL, "add_ideas = DEC_CHU_heavy_industry", "custom_effect_tooltip = DEC_CHU_ind_heavy_tt"],
      ai: 8,
    })
  );

  // ARMY
  F.push(
    focusBlock({
      id: "DEC_CHU_army_root",
      allow: STATE,
      rel: "DEC_CHU_state_root",
      x: -6,
      y: 1,
      cost: 5,
      prereq: ["focus = DEC_CHU_state_root"],
      filters: "FOCUS_FILTER_MILITARY_EQUIPMENT FOCUS_FILTER_MANPOWER",
      reward: ["add_ideas = DEC_CHU_army_reform", "custom_effect_tooltip = DEC_CHU_army_root_tt"],
      ai: 9,
    })
  );
  F.push(
    focusBlock({
      id: "DEC_CHU_army_draft",
      allow: STATE,
      rel: "DEC_CHU_army_root",
      x: -2,
      y: 1,
      prereq: ["focus = DEC_CHU_army_root"],
      filters: "FOCUS_FILTER_MANPOWER",
      reward: ["add_manpower = 25000", "add_war_support = 0.05", "custom_effect_tooltip = DEC_CHU_army_draft_tt"],
      ai: 7,
    })
  );
  F.push(
    focusBlock({
      id: "DEC_CHU_army_officers",
      allow: STATE,
      rel: "DEC_CHU_army_root",
      x: 0,
      y: 1,
      prereq: ["focus = DEC_CHU_army_root"],
      filters: "FOCUS_FILTER_MILITARY_EQUIPMENT",
      reward: ["army_experience = 25", "add_ideas = DEC_CHU_officer_school", "custom_effect_tooltip = DEC_CHU_army_officers_tt"],
      ai: 7,
    })
  );
  F.push(
    focusBlock({
      id: "DEC_CHU_army_milind",
      allow: STATE,
      rel: "DEC_CHU_army_root",
      x: 2,
      y: 1,
      prereq: ["focus = DEC_CHU_army_root"],
      filters: "FOCUS_FILTER_INDUSTRY",
      reward: [IND_MIL, IND_MIL, "custom_effect_tooltip = DEC_CHU_army_milind_tt"],
      ai: 7,
    })
  );
  F.push(
    focusBlock({
      id: "DEC_CHU_army_doctrine",
      allow: STATE,
      rel: "DEC_CHU_army_draft",
      x: 2,
      y: 1,
      prereq: ["focus = DEC_CHU_army_draft", "focus = DEC_CHU_army_officers", "focus = DEC_CHU_army_milind"],
      filters: "FOCUS_FILTER_MILITARY_EQUIPMENT",
      reward: ["add_doctrine_cost_reduction = { name = DEC_CHU_land_doc cost_reduction = 0.5 uses = 2 category = land_doctrine }", "add_ideas = DEC_CHU_defense_doctrine", "custom_effect_tooltip = DEC_CHU_army_doctrine_tt"],
      ai: 8,
    })
  );

  // CULTURE
  F.push(
    focusBlock({
      id: "DEC_CHU_cul_root",
      allow: STATE,
      rel: "DEC_CHU_state_root",
      x: 4,
      y: 1,
      cost: 5,
      prereq: ["focus = DEC_CHU_state_root"],
      reward: ["add_political_power = 40", "custom_effect_tooltip = DEC_CHU_cul_root_tt"],
      ai: 8,
    })
  );
  F.push(
    focusBlock({
      id: "DEC_CHU_cul_tene",
      allow: TENE_OK,
      rel: "DEC_CHU_cul_root",
      x: -2,
      y: 1,
      prereq: ["focus = DEC_CHU_cul_root"],
      mutex: ["DEC_CHU_cul_secular", "DEC_CHU_cul_islam"],
      reward: ["add_ideas = DEC_CHU_tene_tur", "add_stability = 0.04", "custom_effect_tooltip = DEC_CHU_cul_tene_tt"],
      ai: 6,
    })
  );
  F.push(
    focusBlock({
      id: "DEC_CHU_cul_keremet",
      allow: TENE_OK,
      rel: "DEC_CHU_cul_tene",
      x: -1,
      y: 1,
      prereq: ["focus = DEC_CHU_cul_tene"],
      reward: ["add_ideas = DEC_CHU_keremet", "add_war_support = 0.05", "custom_effect_tooltip = DEC_CHU_cul_keremet_tt"],
      ai: 5,
    })
  );
  F.push(
    focusBlock({
      id: "DEC_CHU_cul_calendar",
      allow: TENE_OK,
      rel: "DEC_CHU_cul_tene",
      x: 1,
      y: 1,
      prereq: ["focus = DEC_CHU_cul_tene"],
      reward: ["add_stability = 0.03", "add_political_power = 50", "custom_effect_tooltip = DEC_CHU_cul_calendar_tt"],
      ai: 5,
    })
  );
  F.push(
    focusBlock({
      id: "DEC_CHU_cul_secular",
      allow: STATE,
      rel: "DEC_CHU_cul_root",
      x: 0,
      y: 1,
      prereq: ["focus = DEC_CHU_cul_root"],
      mutex: ["DEC_CHU_cul_tene", "DEC_CHU_cul_islam"],
      reward: ["add_ideas = DEC_CHU_secular_civic", "add_research_slot = 1", "custom_effect_tooltip = DEC_CHU_cul_secular_tt"],
      ai: 5,
    })
  );
  F.push(
    focusBlock({
      id: "DEC_CHU_cul_islam",
      allow: ISLAM_OK,
      rel: "DEC_CHU_cul_root",
      x: 2,
      y: 1,
      prereq: ["focus = DEC_CHU_cul_root"],
      mutex: ["DEC_CHU_cul_tene", "DEC_CHU_cul_secular"],
      reward: ["add_ideas = DEC_CHU_islamic_bulgar", "add_popularity = { ideology = fascism popularity = 0.05 }", "custom_effect_tooltip = DEC_CHU_cul_islam_tt"],
      ai: 6,
    })
  );

  // PARTY HUB
  F.push(
    focusBlock({
      id: "DEC_CHU_pty_hub",
      allow: STATE,
      rel: "DEC_CHU_state_root",
      x: 14,
      y: 1,
      cost: 4,
      prereq: ["focus = DEC_CHU_state_root"],
      reward: ["add_political_power = 50", "custom_effect_tooltip = DEC_CHU_pty_hub_tt"],
      ai: 10,
    })
  );

  // WEST
  F.push(
    focusBlock({
      id: "DEC_CHU_pty_west",
      allow: WEST,
      rel: "DEC_CHU_pty_hub",
      x: -6,
      y: 1,
      prereq: ["focus = DEC_CHU_pty_hub"],
      reward: ["add_stability = 0.04", "add_ideas = DEC_CHU_west_program", "custom_effect_tooltip = DEC_CHU_pty_west_tt"],
      ai: 8,
    })
  );
  F.push(
    focusBlock({
      id: "DEC_CHU_pty_west_corr",
      allow: WEST,
      rel: "DEC_CHU_pty_west",
      x: -1,
      y: 1,
      prereq: ["focus = DEC_CHU_pty_west"],
      reward: ["add_political_power = 75", "add_stability = 0.03", "custom_effect_tooltip = DEC_CHU_pty_west_corr_tt"],
      ai: 6,
    })
  );
  F.push(
    focusBlock({
      id: "DEC_CHU_pty_west_euro",
      allow: WEST,
      rel: "DEC_CHU_pty_west",
      x: 1,
      y: 1,
      prereq: ["focus = DEC_CHU_pty_west"],
      reward: ["add_opinion_modifier = { target = USA modifier = DEC_chu_west_align }", "add_opinion_modifier = { target = ENG modifier = DEC_chu_west_align }", "add_opinion_modifier = { target = GER modifier = DEC_chu_west_align }", "custom_effect_tooltip = DEC_CHU_pty_west_euro_tt"],
      ai: 6,
    })
  );

  // EST
  F.push(
    focusBlock({
      id: "DEC_CHU_pty_est",
      allow: EST,
      rel: "DEC_CHU_pty_hub",
      x: -2,
      y: 1,
      prereq: ["focus = DEC_CHU_pty_hub"],
      reward: ["add_ideas = DEC_CHU_est_continuity", "add_political_power = 60", "custom_effect_tooltip = DEC_CHU_pty_est_tt"],
      ai: 7,
    })
  );
  F.push(
    focusBlock({
      id: "DEC_CHU_pty_est_cont",
      allow: EST,
      rel: "DEC_CHU_pty_est",
      x: 0,
      y: 1,
      prereq: ["focus = DEC_CHU_pty_est"],
      reward: [IND_CIV, "add_stability = 0.05", "custom_effect_tooltip = DEC_CHU_pty_est_cont_tt"],
      ai: 6,
    })
  );

  // LEFT
  F.push(
    focusBlock({
      id: "DEC_CHU_pty_left",
      allow: LEFT,
      rel: "DEC_CHU_pty_hub",
      x: 2,
      y: 1,
      prereq: ["focus = DEC_CHU_pty_hub"],
      reward: ["add_ideas = DEC_CHU_left_program", "add_popularity = { ideology = communism popularity = 0.05 }", "custom_effect_tooltip = DEC_CHU_pty_left_tt"],
      ai: 7,
    })
  );
  F.push(
    focusBlock({
      id: "DEC_CHU_pty_left_work",
      allow: LEFT,
      rel: "DEC_CHU_pty_left",
      x: -1,
      y: 1,
      prereq: ["focus = DEC_CHU_pty_left"],
      reward: ["add_manpower = 15000", "add_stability = 0.03", "custom_effect_tooltip = DEC_CHU_pty_left_work_tt"],
      ai: 6,
    })
  );
  F.push(
    focusBlock({
      id: "DEC_CHU_pty_left_plan",
      allow: LEFT,
      rel: "DEC_CHU_pty_left",
      x: 1,
      y: 1,
      prereq: ["focus = DEC_CHU_pty_left"],
      reward: [IND_CIV, IND_CIV, "custom_effect_tooltip = DEC_CHU_pty_left_plan_tt"],
      ai: 6,
    })
  );

  // NAT (+ libertarian gets a short national-culture-adjacent nod via same nat hub if they took oresh? No - lib has own tree. Nat camp only.)
  F.push(
    focusBlock({
      id: "DEC_CHU_pty_nat",
      allow: NAT_OR_LIB,
      rel: "DEC_CHU_pty_hub",
      x: 6,
      y: 1,
      prereq: ["focus = DEC_CHU_pty_hub"],
      reward: ["add_ideas = DEC_CHU_nat_program", "add_stability = 0.03", "custom_effect_tooltip = DEC_CHU_pty_nat_tt"],
      ai: 7,
    })
  );
  F.push(
    focusBlock({
      id: "DEC_CHU_pty_nat_lang",
      allow: NAT_OR_LIB,
      rel: "DEC_CHU_pty_nat",
      x: -1,
      y: 1,
      prereq: ["focus = DEC_CHU_pty_nat"],
      reward: ["add_ideas = DEC_CHU_language_law", "add_political_power = 40", "custom_effect_tooltip = DEC_CHU_pty_nat_lang_tt"],
      ai: 6,
    })
  );
  F.push(
    focusBlock({
      id: "DEC_CHU_pty_nat_mem",
      allow: NAT_OR_LIB,
      rel: "DEC_CHU_pty_nat",
      x: 1,
      y: 1,
      prereq: ["focus = DEC_CHU_pty_nat"],
      reward: ["add_war_support = 0.06", "add_stability = 0.02", "custom_effect_tooltip = DEC_CHU_pty_nat_mem_tt"],
      ai: 6,
    })
  );

  // ARGADU
  F.push(
    focusBlock({
      id: "DEC_CHU_pty_argadu",
      allow: ARG,
      rel: "DEC_CHU_pty_hub",
      x: 10,
      y: 1,
      prereq: ["focus = DEC_CHU_pty_hub"],
      reward: ["add_ideas = DEC_CHU_argadu_program", "add_popularity = { ideology = fascism popularity = 0.06 }", "custom_effect_tooltip = DEC_CHU_pty_argadu_tt"],
      ai: 8,
    })
  );
  F.push(
    focusBlock({
      id: "DEC_CHU_pty_argadu_ummah",
      allow: ARG,
      rel: "DEC_CHU_pty_argadu",
      x: -1,
      y: 1,
      prereq: ["focus = DEC_CHU_pty_argadu"],
      reward: ["add_to_variable = { party_pop_array^11 = 0.08 }", "clamp_variable = { var = party_pop_array^11 min = 0 max = 1 }", "recalculate_party = yes", "custom_effect_tooltip = DEC_CHU_pty_argadu_ummah_tt"],
      ai: 6,
    })
  );
  F.push(
    focusBlock({
      id: "DEC_CHU_pty_argadu_law",
      allow: ARG,
      rel: "DEC_CHU_pty_argadu",
      x: 1,
      y: 1,
      prereq: ["focus = DEC_CHU_pty_argadu"],
      reward: ["add_ideas = DEC_CHU_argadu_law", "add_stability = -0.02", "add_war_support = 0.08", "custom_effect_tooltip = DEC_CHU_pty_argadu_law_tt"],
      ai: 5,
    })
  );

  // DIPLOMACY
  F.push(
    focusBlock({
      id: "DEC_CHU_dip_root",
      allow: STATE,
      rel: "DEC_CHU_state_root",
      x: 28,
      y: 1,
      cost: 5,
      prereq: ["focus = DEC_CHU_state_root"],
      reward: ["add_political_power = 50", "custom_effect_tooltip = DEC_CHU_dip_root_tt"],
      ai: 9,
    })
  );
  F.push(
    focusBlock({
      id: "DEC_CHU_dip_nato",
      allow: WEST,
      rel: "DEC_CHU_dip_root",
      x: -2,
      y: 1,
      cost: 8,
      prereq: ["focus = DEC_CHU_dip_root"],
      mutex: ["DEC_CHU_dip_bulgar"],
      available: [
        "has_country_flag = DEC_CHU_camp_west",
        "NOT = { has_idea = NATO_member }",
        "USA = { exists = yes is_faction_leader = yes }",
        "is_subject = no",
      ],
      bypass: ["has_idea = NATO_member"],
      filters: "FOCUS_FILTER_POLITICAL",
      reward: [
        "DEC_nato_admit_quiet = yes",
        "custom_effect_tooltip = DEC_CHU_dip_nato_tt",
      ],
      ai: 4,
    })
  );
  F.push(
    focusBlock({
      id: "DEC_CHU_dip_bulgar",
      allow: STATE,
      rel: "DEC_CHU_dip_root",
      x: 2,
      y: 1,
      cost: 8,
      prereq: ["focus = DEC_CHU_dip_root"],
      mutex: ["DEC_CHU_dip_nato"],
      available: ["is_subject = no", "NOT = { has_idea = NATO_member }"],
      bypass: ["is_in_faction = yes is_faction_leader = yes"],
      filters: "FOCUS_FILTER_POLITICAL",
      reward: [
        "DEC_CHU_ensure_bulgar_faction = yes",
        "set_country_flag = DEC_CHU_bulgar_faction",
        "custom_effect_tooltip = DEC_CHU_dip_bulgar_tt",
      ],
      ai: 6,
    })
  );
  F.push(
    focusBlock({
      id: "DEC_CHU_dip_volga",
      allow: STATE,
      rel: "DEC_CHU_dip_bulgar",
      x: -2,
      y: 1,
      cost: 6,
      prereq: ["focus = DEC_CHU_dip_bulgar"],
      available: ["has_country_flag = DEC_CHU_bulgar_faction", "is_faction_leader = yes"],
      filters: "FOCUS_FILTER_POLITICAL",
      reward: ["DEC_CHU_invite_volga_heirs = yes", "custom_effect_tooltip = DEC_CHU_dip_volga_tt"],
      ai: 5,
    })
  );
  F.push(
    focusBlock({
      id: "DEC_CHU_dip_euro",
      allow: STATE,
      rel: "DEC_CHU_dip_bulgar",
      x: 0,
      y: 1,
      cost: 6,
      prereq: ["focus = DEC_CHU_dip_bulgar"],
      available: ["has_country_flag = DEC_CHU_bulgar_faction", "is_faction_leader = yes"],
      filters: "FOCUS_FILTER_POLITICAL",
      reward: ["DEC_CHU_invite_euro_heirs = yes", "custom_effect_tooltip = DEC_CHU_dip_euro_tt"],
      ai: 4,
    })
  );
  F.push(
    focusBlock({
      id: "DEC_CHU_dip_cau",
      allow: STATE,
      rel: "DEC_CHU_dip_bulgar",
      x: 2,
      y: 1,
      cost: 6,
      prereq: ["focus = DEC_CHU_dip_bulgar"],
      available: ["has_country_flag = DEC_CHU_bulgar_faction", "is_faction_leader = yes"],
      filters: "FOCUS_FILTER_POLITICAL",
      reward: ["DEC_CHU_invite_cau_heirs = yes", "custom_effect_tooltip = DEC_CHU_dip_cau_tt"],
      ai: 4,
    })
  );

  return F.join("\n");
}

const LOC_EN = `
 # --- Chuvash independent state tree ---
 DEC_CHU_state_root: "Independent Chuvash State"
 DEC_CHU_state_root_desc: "With a government in place, Chuvashia builds the institutions of a real state: industry, army, culture, party programme and foreign policy."
 DEC_CHU_state_root_tt: "Unlocks industry, army, culture, party and diplomacy branches."
 DEC_CHU_ind_root: "Industrial Drive"
 DEC_CHU_ind_root_desc: "Factories, chemicals and the Volga corridor — the backbone of independence."
 DEC_CHU_ind_root_tt: "Adds the industrial drive national spirit."
 DEC_CHU_ind_tractor: "Cheboksary Tractor Works"
 DEC_CHU_ind_tractor_desc: "Restart and expand the tractor and machine-building complex."
 DEC_CHU_ind_tractor_tt: "§G+1§! civilian factory in a core state."
 DEC_CHU_ind_chem: "Volga Chemistry"
 DEC_CHU_ind_chem_desc: "Chemical and energy complexes along the river."
 DEC_CHU_ind_chem_tt: "§G+1§! civilian factory and an industry research bonus."
 DEC_CHU_ind_volga: "Volga Logistics"
 DEC_CHU_ind_volga_desc: "Ports, roads and rail along the Volga."
 DEC_CHU_ind_volga_tt: "§G+2§! infrastructure levels in core states."
 DEC_CHU_ind_heavy: "Heavy Industry Push"
 DEC_CHU_ind_heavy_desc: "Finish the industrial programme with heavy and dual-use plant."
 DEC_CHU_ind_heavy_tt: "§G+1§! civilian and §G+1§! military factory; heavy industry spirit."
 DEC_CHU_army_root: "Armed Forces of Chuvashia"
 DEC_CHU_army_root_desc: "From police remnants to a national army."
 DEC_CHU_army_root_tt: "Adds the army reform national spirit."
 DEC_CHU_army_draft: "National Call-up"
 DEC_CHU_army_draft_desc: "Mobilise volunteers and reservists for the new republic."
 DEC_CHU_army_draft_tt: "§G+25 000§! manpower and war support."
 DEC_CHU_army_officers: "Officer School"
 DEC_CHU_army_officers_desc: "Train a Chuvash officer corps independent of Moscow."
 DEC_CHU_army_officers_tt: "Army experience and officer school spirit."
 DEC_CHU_army_milind: "Defence Plants"
 DEC_CHU_army_milind_desc: "Local arms and repair capacity."
 DEC_CHU_army_milind_tt: "§G+2§! military factories."
 DEC_CHU_army_doctrine: "Chuvash Defence Doctrine"
 DEC_CHU_army_doctrine_desc: "A coherent doctrine for a small Volga state."
 DEC_CHU_army_doctrine_tt: "Doctrine cost reduction and defence doctrine spirit."
 DEC_CHU_cul_root: "Cultural Course"
 DEC_CHU_cul_root_desc: "Choose the spiritual and cultural face of the republic."
 DEC_CHU_cul_root_tt: "Opens cultural forks."
 DEC_CHU_cul_tene: "Tene Tur"
 DEC_CHU_cul_tene_desc: "Restore Chuvash native faith — Tene Tur — as a living tradition, not folklore."
 DEC_CHU_cul_tene_tt: "Adds the Tene Tur national spirit."
 DEC_CHU_cul_keremet: "Keremet Groves"
 DEC_CHU_cul_keremet_desc: "Protect and revive sacred keremet sites across Chuvashia."
 DEC_CHU_cul_keremet_tt: "Keremet spirit and war support."
 DEC_CHU_cul_calendar: "Chuvash Calendar"
 DEC_CHU_cul_calendar_desc: "Public holidays and ritual calendar tied to Tene Tur."
 DEC_CHU_cul_calendar_tt: "Stability and political power."
 DEC_CHU_cul_secular: "Civic Secularism"
 DEC_CHU_cul_secular_desc: "A modern secular republic: schools, science, civic ritual."
 DEC_CHU_cul_secular_tt: "Secular spirit and §G+1§! research slot."
 DEC_CHU_cul_islam: "Islamic Bulgar Path"
 DEC_CHU_cul_islam_desc: "ARGADU frames Chuvashia as heir to Muslim Volga Bulgaria."
 DEC_CHU_cul_islam_tt: "Islamic Bulgar spirit; boosts Caliphate popularity."
 DEC_CHU_pty_hub: "Party Programme"
 DEC_CHU_pty_hub_desc: "The ruling party turns campaign slogans into state policy."
 DEC_CHU_pty_hub_tt: "Opens the path matching the party in power."
 DEC_CHU_pty_west: "Western Civic Agenda"
 DEC_CHU_pty_west_desc: "Open Chuvashia, Vesna, Yabloko or Angry Chuvashia set a liberal-democratic course."
 DEC_CHU_pty_west_tt: "Western programme spirit."
 DEC_CHU_pty_west_corr: "Anti-Corruption Drive"
 DEC_CHU_pty_west_corr_desc: "Clean up ministries and local bosses."
 DEC_CHU_pty_west_corr_tt: "Political power and stability."
 DEC_CHU_pty_west_euro: "Euro-Atlantic Orientation"
 DEC_CHU_pty_west_euro_desc: "Court Western capitals and prepare the ground for NATO talks."
 DEC_CHU_pty_west_euro_tt: "Opinion boosts with USA, UK and Germany."
 DEC_CHU_pty_est: "Continuity Government"
 DEC_CHU_pty_est_desc: "Fyodorov's conservatives keep the administrative machine running."
 DEC_CHU_pty_est_tt: "Continuity spirit."
 DEC_CHU_pty_est_cont: "Managerial Stability"
 DEC_CHU_pty_est_cont_desc: "Patronage plus competence: keep factories open."
 DEC_CHU_pty_est_cont_tt: "Civilian factory and stability."
 DEC_CHU_pty_left: "Left Programme"
 DEC_CHU_pty_left_desc: "CPRF or Left Front social agenda."
 DEC_CHU_pty_left_tt: "Left programme spirit."
 DEC_CHU_pty_left_work: "Workers' Councils"
 DEC_CHU_pty_left_work_desc: "Mobilise labour and veterans."
 DEC_CHU_pty_left_work_tt: "Manpower and stability."
 DEC_CHU_pty_left_plan: "Planned Restart"
 DEC_CHU_pty_left_plan_desc: "State-led industrial restart."
 DEC_CHU_pty_left_plan_tt: "§G+2§! civilian factories."
 DEC_CHU_pty_nat: "National Programme"
 DEC_CHU_pty_nat_desc: "Language, memory and Bulgar heritage for national or libertarian cabinets."
 DEC_CHU_pty_nat_tt: "National programme spirit."
 DEC_CHU_pty_nat_lang: "Chuvash Language Law"
 DEC_CHU_pty_nat_lang_desc: "Official status and schooling in Chuvash."
 DEC_CHU_pty_nat_lang_tt: "Language law spirit."
 DEC_CHU_pty_nat_mem: "Memory of the Ancestors"
 DEC_CHU_pty_nat_mem_desc: "Monuments, museums and national holidays."
 DEC_CHU_pty_nat_mem_tt: "War support and stability."
 DEC_CHU_pty_argadu: "ARGADU Programme"
 DEC_CHU_pty_argadu_desc: "Sergey Andreev's radical Islamic programme for Chuvashia."
 DEC_CHU_pty_argadu_tt: "ARGADU programme spirit."
 DEC_CHU_pty_argadu_ummah: "Call to the Ummah"
 DEC_CHU_pty_argadu_ummah_desc: "Link local networks to the wider Caliphate current."
 DEC_CHU_pty_argadu_ummah_tt: "§G+§! Caliphate party popularity."
 DEC_CHU_pty_argadu_law: "Sharia Courts"
 DEC_CHU_pty_argadu_law_desc: "Parallel religious courts — harsh order, lower civic calm."
 DEC_CHU_pty_argadu_law_tt: "ARGADU law spirit."
 DEC_CHU_dip_root: "Foreign Policy"
 DEC_CHU_dip_root_desc: "Choose a camp: Euro-Atlantic or Bulgar Confederation."
 DEC_CHU_dip_root_tt: "Opens NATO vs Bulgar Confederation."
 DEC_CHU_dip_nato: "Join NATO"
 DEC_CHU_dip_nato_desc: "Western cabinets petition for Alliance membership. Mutually exclusive with the Bulgar Confederation."
 DEC_CHU_dip_nato_tt: "Quietly admits ROOT into NATO (faction + NATO_member)."
 DEC_CHU_dip_bulgar: "Bulgar Confederation Alliance"
 DEC_CHU_dip_bulgar_desc: "Found a new alliance of Bulgar heirs. Mutually exclusive with NATO."
 DEC_CHU_dip_bulgar_tt: "Creates the §YBulgar Confederation§! faction with ROOT as leader."
 DEC_CHU_dip_volga: "Invite Volga Heirs"
 DEC_CHU_dip_volga_desc: "Invite Tatarstan, Bashkortostan, Mari El, Udmurtia, Moksha, Erzya, Komi and related Volga tags."
 DEC_CHU_dip_volga_tt: "Invites eligible Volga heir nations into the faction."
 DEC_CHU_dip_euro: "Invite European Heirs"
 DEC_CHU_dip_euro_desc: "Invite Bulgaria, Hungary, North Macedonia and Ukraine as cultural-political heirs."
 DEC_CHU_dip_euro_tt: "Invites BUL, HUN, MAC and UKR if eligible."
 DEC_CHU_dip_cau: "Invite Caucasian Heirs"
 DEC_CHU_dip_cau_desc: "Invite Alan Balkaria and related Caucasian Bulgar-linked tags."
 DEC_CHU_dip_cau_tt: "Invites BLK and related Caucasian tags if eligible."
`;

const LOC_RU = `
 # --- Чувашия: древо независимого государства ---
 DEC_CHU_state_root: "Независимое чувашское государство"
 DEC_CHU_state_root_desc: "После прихода партии к власти Чувашия строит настоящее государство: индустрия, армия, культура, партийная программа и внешняя политика."
 DEC_CHU_state_root_tt: "Открывает ветки индустрии, армии, культуры, партий и дипломатии."
 DEC_CHU_ind_root: "Индустриальный рывок"
 DEC_CHU_ind_root_desc: "Заводы, химия и волжский коридор — основа независимости."
 DEC_CHU_ind_root_tt: "Даёт национальный дух индустриального рывка."
 DEC_CHU_ind_tractor: "Чебоксарский тракторный"
 DEC_CHU_ind_tractor_desc: "Перезапуск и расширение тракторного и машиностроительного комплекса."
 DEC_CHU_ind_tractor_tt: "§G+1§! гражданский завод в ядре."
 DEC_CHU_ind_chem: "Волжская химия"
 DEC_CHU_ind_chem_desc: "Химические и энергетические комплексы по Волге."
 DEC_CHU_ind_chem_tt: "§G+1§! гражданский завод и бонус к исследованиям индустрии."
 DEC_CHU_ind_volga: "Волжская логистика"
 DEC_CHU_ind_volga_desc: "Порты, дороги и железная дорога вдоль Волги."
 DEC_CHU_ind_volga_tt: "§G+2§! уровня инфраструктуры в ядрах."
 DEC_CHU_ind_heavy: "Тяжёлая промышленность"
 DEC_CHU_ind_heavy_desc: "Завершение индустриальной программы тяжёлыми и двойными мощностями."
 DEC_CHU_ind_heavy_tt: "§G+1§! гражданский и §G+1§! военный завод; дух тяжёлой промышленности."
 DEC_CHU_army_root: "Вооружённые силы Чувашии"
 DEC_CHU_army_root_desc: "От обломков милиции к национальной армии."
 DEC_CHU_army_root_tt: "Даёт дух армейской реформы."
 DEC_CHU_army_draft: "Национальный призыв"
 DEC_CHU_army_draft_desc: "Мобилизация добровольцев и резервистов."
 DEC_CHU_army_draft_tt: "§G+25 000§! человек и поддержка войны."
 DEC_CHU_army_officers: "Офицерская школа"
 DEC_CHU_army_officers_desc: "Чувашский офицерский корпус вне Москвы."
 DEC_CHU_army_officers_tt: "Опыт армии и дух офицерской школы."
 DEC_CHU_army_milind: "Оборонные заводы"
 DEC_CHU_army_milind_desc: "Местное оружие и ремонт."
 DEC_CHU_army_milind_tt: "§G+2§! военных завода."
 DEC_CHU_army_doctrine: "Чувашская оборонная доктрина"
 DEC_CHU_army_doctrine_desc: "Связный подход для малого государства Поволжья."
 DEC_CHU_army_doctrine_tt: "Снижение стоимости доктрин и дух обороны."
 DEC_CHU_cul_root: "Культурный курс"
 DEC_CHU_cul_root_desc: "Выбор духовного и культурного лица республики."
 DEC_CHU_cul_root_tt: "Открывает культурные развилки."
 DEC_CHU_cul_tene: "Тене Тур"
 DEC_CHU_cul_tene_desc: "Возрождение чувашской народной веры Тене Тур как живой традиции, а не фольклора."
 DEC_CHU_cul_tene_tt: "Даёт национальный дух Тене Тур."
 DEC_CHU_cul_keremet: "Керемети"
 DEC_CHU_cul_keremet_desc: "Охрана и возрождение священных кереметей."
 DEC_CHU_cul_keremet_tt: "Дух кереметей и поддержка войны."
 DEC_CHU_cul_calendar: "Чувашский календарь"
 DEC_CHU_cul_calendar_desc: "Праздники и обрядовый календарь Тене Тур."
 DEC_CHU_cul_calendar_tt: "Стабильность и политическая власть."
 DEC_CHU_cul_secular: "Гражданский секуляризм"
 DEC_CHU_cul_secular_desc: "Современная светская республика: школа, наука, гражданский ритуал."
 DEC_CHU_cul_secular_tt: "Секулярный дух и §G+1§! слот исследований."
 DEC_CHU_cul_islam: "Исламский булгарский путь"
 DEC_CHU_cul_islam_desc: "ARGADU представляет Чувашию наследницей мусульманской Волжской Булгарии."
 DEC_CHU_cul_islam_tt: "Дух исламской Булгарии; усиливает популярность Халифата."
 DEC_CHU_pty_hub: "Партийная программа"
 DEC_CHU_pty_hub_desc: "Правящая партия превращает лозунги в государственную политику."
 DEC_CHU_pty_hub_tt: "Открывает путь правящей партии."
 DEC_CHU_pty_west: "Западная гражданская повестка"
 DEC_CHU_pty_west_desc: "Открытая Чувашия, Весна, Яблоко или Сердитая Чувашия задают либерально-демократический курс."
 DEC_CHU_pty_west_tt: "Дух западной программы."
 DEC_CHU_pty_west_corr: "Антикоррупционный курс"
 DEC_CHU_pty_west_corr_desc: "Чистка министерств и местных князьков."
 DEC_CHU_pty_west_corr_tt: "Политическая власть и стабильность."
 DEC_CHU_pty_west_euro: "Евроатлантическая ориентация"
 DEC_CHU_pty_west_euro_desc: "Сближение с западными столицами и подготовка к переговорам о НАТО."
 DEC_CHU_pty_west_euro_tt: "Бонус мнения с США, Британией и Германией."
 DEC_CHU_pty_est: "Правительство преемственности"
 DEC_CHU_pty_est_desc: "Консерваторы Фёдорова сохраняют административную машину."
 DEC_CHU_pty_est_tt: "Дух преемственности."
 DEC_CHU_pty_est_cont: "Управленческая стабильность"
 DEC_CHU_pty_est_cont_desc: "Патронаж плюс компетенция: заводы не останавливать."
 DEC_CHU_pty_est_cont_tt: "Гражданский завод и стабильность."
 DEC_CHU_pty_left: "Левая программа"
 DEC_CHU_pty_left_desc: "Повестка КПРФ или Левого фронта."
 DEC_CHU_pty_left_tt: "Дух левой программы."
 DEC_CHU_pty_left_work: "Рабочие советы"
 DEC_CHU_pty_left_work_desc: "Мобилизация труда и ветеранов."
 DEC_CHU_pty_left_work_tt: "Людские ресурсы и стабильность."
 DEC_CHU_pty_left_plan: "Плановый перезапуск"
 DEC_CHU_pty_left_plan_desc: "Государственный индустриальный перезапуск."
 DEC_CHU_pty_left_plan_tt: "§G+2§! гражданских завода."
 DEC_CHU_pty_nat: "Национальная программа"
 DEC_CHU_pty_nat_desc: "Язык, память и булгарское наследие для национальных или либертарианских кабинетов."
 DEC_CHU_pty_nat_tt: "Дух национальной программы."
 DEC_CHU_pty_nat_lang: "Закон о чувашском языке"
 DEC_CHU_pty_nat_lang_desc: "Официальный статус и школа на чувашском."
 DEC_CHU_pty_nat_lang_tt: "Дух языкового закона."
 DEC_CHU_pty_nat_mem: "Память предков"
 DEC_CHU_pty_nat_mem_desc: "Памятники, музеи и национальные праздники."
 DEC_CHU_pty_nat_mem_tt: "Поддержка войны и стабильность."
 DEC_CHU_pty_argadu: "Программа ARGADU"
 DEC_CHU_pty_argadu_desc: "Радикальная исламская программа Сергея Андреева."
 DEC_CHU_pty_argadu_tt: "Дух программы ARGADU."
 DEC_CHU_pty_argadu_ummah: "Призыв к умме"
 DEC_CHU_pty_argadu_ummah_desc: "Связь местных сетей с течением Халифата."
 DEC_CHU_pty_argadu_ummah_tt: "§G+§! популярности партии Халифата."
 DEC_CHU_pty_argadu_law: "Шариатские суды"
 DEC_CHU_pty_argadu_law_desc: "Параллельные религиозные суды — жёсткий порядок, меньше гражданского спокойствия."
 DEC_CHU_pty_argadu_law_tt: "Дух шариатского права ARGADU."
 DEC_CHU_dip_root: "Внешняя политика"
 DEC_CHU_dip_root_desc: "Выбор лагеря: евроатлантический или Булгарская Конфедерация."
 DEC_CHU_dip_root_tt: "Открывает НАТО против Булгарской Конфедерации."
 DEC_CHU_dip_nato: "Вступление в НАТО"
 DEC_CHU_dip_nato_desc: "Западные кабинеты просят членства в Альянсе. Взаимоисключающе с Булгарской Конфедерацией."
 DEC_CHU_dip_nato_tt: "Тихо принимает ROOT в НАТО (фракция + NATO_member)."
 DEC_CHU_dip_bulgar: "Альянс Булгарской Конфедерации"
 DEC_CHU_dip_bulgar_desc: "Основать альянс наследников булгар. Взаимоисключающе с НАТО."
 DEC_CHU_dip_bulgar_tt: "Создаёт фракцию §YБулгарская Конфедерация§! с ROOT во главе."
 DEC_CHU_dip_volga: "Пригласить волжских наследников"
 DEC_CHU_dip_volga_desc: "Пригласить Татарстан, Башкортостан, Марий Эл, Удмуртию, Мокшу, Эрзю, Коми и родственные теги."
 DEC_CHU_dip_volga_tt: "Приглашает подходящие волжские нации во фракцию."
 DEC_CHU_dip_euro: "Пригласить европейских наследников"
 DEC_CHU_dip_euro_desc: "Пригласить Болгарию, Венгрию, Северную Македонию и Украину."
 DEC_CHU_dip_euro_tt: "Приглашает BUL, HUN, MAC и UKR, если возможно."
 DEC_CHU_dip_cau: "Пригласить кавказских наследников"
 DEC_CHU_dip_cau_desc: "Пригласить Алан-Балкарию и родственные кавказские теги."
 DEC_CHU_dip_cau_tt: "Приглашает BLK и родственные теги, если возможно."
`;

function appendLoc(file, block, marker) {
  let buf = fs.readFileSync(file);
  const bom = buf.length >= 3 && buf[0] === 0xef && buf[1] === 0xbb && buf[2] === 0xbf;
  let text = bom ? buf.slice(3).toString("utf8") : buf.toString("utf8");
  if (text.includes(marker)) {
    console.log("loc skip (exists)", path.basename(file));
    return;
  }
  if (!text.endsWith("\n")) text += "\n";
  text += block;
  const out = Buffer.from(text, "utf8");
  fs.writeFileSync(file, bom ? Buffer.concat([Buffer.from([0xef, 0xbb, 0xbf]), out]) : out);
  console.log("loc +", path.basename(file));
}

function patchGfx(ids) {
  let gfx = fs.readFileSync(GFX, "utf8");
  const missing = ids.filter((id) => !gfx.includes(`GFX_${id}`));
  if (!missing.length) {
    console.log("gfx ok");
    return;
  }
  const extra = missing
    .map((id) => `\tspriteType = {\n\t\tname = "GFX_${id}"\n\t\ttexturefile = "gfx/interface/goals/${id}.dds"\n\t}`)
    .join("\n");
  gfx = gfx.replace(/\r?\n}\s*$/, "\n" + extra + "\n}\n");
  fs.writeFileSync(GFX, gfx);
  console.log("gfx +", missing.length);
}

async function main() {
  const ids = Object.keys(ICONS);
  for (const id of ids) {
    await svgToGoal(ICONS[id], path.join(GOAL_DIR, id + ".dds"));
  }
  console.log("icons", ids.length);

  fs.writeFileSync(FOCUS, buildFocusFile(), "utf8");
  console.log("wrote", FOCUS);

  patchGfx(ids);
  appendLoc(path.join(ROOT, "localisation/english/DEC_l_english.yml"), LOC_EN, "DEC_CHU_state_root:");
  appendLoc(path.join(ROOT, "localisation/russian/DEC_l_russian.yml"), LOC_RU, "DEC_CHU_state_root:");
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
