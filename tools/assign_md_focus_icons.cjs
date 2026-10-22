/* Assign Millennium Dawn goal sprites to DEC focuses (vanilla GFX_* often missing in MD). */
const fs = require("fs");
const path = require("path");
const ROOT = path.resolve(__dirname, "..");
const FOCUS_DIR = path.join(ROOT, "common/national_focus");

const VANILLA_TO_MD = {
  GFX_focus_generic_support_the_left_right: "Ultranationalism",
  GFX_goal_tripartite_pact: "alliance",
  GFX_goal_generic_major_alliance: "major_alliance",
  GFX_goal_generic_national_unity: "national_unity",
  GFX_goal_generic_occupy_states_ongoing_war: "annex_country",
  GFX_goal_generic_major_war: "war",
  GFX_focus_generic_self_management: "nationalist_administration",
  GFX_goal_generic_territory_or_war: "generic_fascist_uprising",
  GFX_focus_generic_diplomatic_treaty: "alliance",
  GFX_focus_generic_treaty: "alliance",
  GFX_goal_generic_secret_weapon: "cyberwarfare",
  GFX_goal_generic_political_pressure: "fascist_threat",
  GFX_goal_generic_improve_relations: "alliance",
  GFX_goal_generic_scientific_exchange: "nationalist_education",
  GFX_goal_generic_forceful_treaty: "annex_country",
  GFX_goal_generic_construct_civ_factory: "industry_civilian",
  GFX_goal_generic_construct_mil_factory: "industry_military",
  GFX_goal_generic_air_fighter2: "drone",
  GFX_goal_generic_production: "production",
  GFX_goal_generic_allies_build_infantry: "small_arms_west",
  GFX_goal_generic_small_arms: "small_arms",
  GFX_goal_generic_axis_build_infantry: "small_arms_east",
  GFX_goal_generic_construct_infrastructure: "infrastructure",
  GFX_goal_generic_position_armies: "army_planning",
  GFX_goal_generic_demand_territory: "annex_country",
  GFX_goal_generic_more_territorial_claims: "annex_country_2",
  GFX_goal_generic_dangerous_deal: "fascist_threat",
  GFX_goal_generic_propaganda: "propaganda",
  GFX_goal_generic_alliance: "major_alliance",
};

const BY_ID = {
  DEC_WHT_white_revival: "Ultranationalism",
  DEC_WHT_declare_brotherhood: "fascism",
  DEC_WHT_call_unity: "major_alliance",
  DEC_WHT_call_oath: "oath_of_beirut",
  DEC_WHT_unite_brotherhood: "annex_country",
  DEC_WHT_europe: "europe",
  DEC_WHT_reg_europe_west: "british_nationalism",
  DEC_WHT_reg_europe_north: "focus_NORDIC_mon_form_alliance",
  DEC_WHT_reg_europe_central: "german_nationalism",
  DEC_WHT_reg_europe_east: "europe_domination",
  DEC_WHT_reg_europe_russian: "russian_unity",
  DEC_WHT_crusade_europe: "war_in_europe",
  DEC_WHT_na: "american_nationalism",
  DEC_WHT_reg_na_usa: "american_nationalism",
  DEC_WHT_reg_na_canada: "war_against_canada",
  DEC_WHT_crusade_na: "war_against_the_united_states",
  DEC_WHT_colonies: "focus_generic_fascist_militarism",
  DEC_WHT_reg_colonies_saf: "africa_guy_shield",
  DEC_WHT_reg_colonies_rho: "african_expedition",
  DEC_WHT_reg_colonies_cone: "focus_ARG_south_american_unity",
  DEC_WHT_crusade_colonies: "african_conflict",
  DEC_WHT_finno: "focus_FIN_expansion_towards_the_atlantic",
  DEC_WHT_reg_finno_fin: "focus_NORDIC_mon_form_alliance",
  DEC_WHT_reg_finno_est: "focus_NORDIC_dem_form_alliance",
  DEC_WHT_reg_finno_north_finno: "focus_generic_winter_warfare",
  DEC_WHT_crusade_finno: "war_in_europe",
  DEC_WHT_oceania: "oceania",
  DEC_WHT_reg_oceania_ast: "aboriginal_voting",
  DEC_WHT_reg_oceania_nzl: "oceania",
  DEC_WHT_crusade_oceania: "ast_war_monger",
  DEC_WHT_crusade_world: "FRA_crusader_icon",

  DEC_BAW_black_awakening: "africa",
  DEC_BAW_declare_brotherhood: "focus_ETH_organization_of_african_unity",
  DEC_BAW_call_unity: "africa_guy_shield",
  DEC_BAW_call_oath: "oath_of_beirut",
  DEC_BAW_unite_brotherhood: "annex_country",
  DEC_BAW_panthers_america: "african_conflict",
  DEC_BAW_panthers_europe: "europe",
  DEC_BAW_west: "westwards",
  DEC_BAW_reg_west_sahel: "desert_warfare",
  DEC_BAW_reg_west_guinea: "africa2",
  DEC_BAW_reg_west_nigeria: "africa3",
  DEC_BAW_crusade_west: "african_conflict",
  DEC_BAW_central: "africa2",
  DEC_BAW_reg_central_congo: "africa",
  DEC_BAW_reg_central_equatorial: "africa3",
  DEC_BAW_crusade_central: "african_expedition",
  DEC_BAW_east: "eastwards",
  DEC_BAW_reg_east_horn: "africa_guy_shield",
  DEC_BAW_reg_east_lakes: "africa2",
  DEC_BAW_reg_east_sudan: "desert_warfare",
  DEC_BAW_reg_east_islands: "africa3",
  DEC_BAW_crusade_east: "african_conflict",
  DEC_BAW_south: "southwards",
  DEC_BAW_reg_south_cape: "africa",
  DEC_BAW_reg_south_miombo: "africa2",
  DEC_BAW_crusade_south: "african_expedition",
  DEC_BAW_america: "american_nationalism",
  DEC_BAW_reg_america_usa: "american_nationalism",
  DEC_BAW_reg_america_caribbean: "alliance_with_cuba",
  DEC_BAW_reg_america_south_am: "focus_ARG_south_american_unity",
  DEC_BAW_reg_america_central_am: "maya",
  DEC_BAW_crusade_america: "war_against_the_united_states",
  DEC_BAW_europe: "europe",
  DEC_BAW_reg_europe_fra: "FRA_crusader_icon",
  DEC_BAW_reg_europe_eng: "british_nationalism",
  DEC_BAW_reg_europe_bel: "focus_BEL_legacy_of_the_great_war",
  DEC_BAW_reg_europe_hol: "dutch_zwarte_piet",
  DEC_BAW_reg_europe_por: "europe_domination",
  DEC_BAW_crusade_europe: "war_in_europe",
  DEC_BAW_crusade_world: "war4",

  DEC_IND_indigenous_awakening: "native_americans",
  DEC_IND_declare_council: "aztec_icon",
  DEC_IND_call_unity: "maya",
  DEC_IND_call_oath: "oath_of_beirut",
  DEC_IND_unite_council: "annex_country",
  DEC_IND_turtle_island: "native_americans",
  DEC_IND_melanesian_league: "oceania",
  DEC_IND_north: "native_americans",
  DEC_IND_reg_north_plains: "native_americans",
  DEC_IND_reg_north_pacific: "oceania",
  DEC_IND_reg_north_settlers: "american_nationalism",
  DEC_IND_crusade_north: "war_against_the_united_states",
  DEC_IND_meso: "maya",
  DEC_IND_reg_meso_mexico: "aztec_icon",
  DEC_IND_reg_meso_central: "maya",
  DEC_IND_crusade_meso: "war_against_mexico",
  DEC_IND_andes: "aztec_icon",
  DEC_IND_reg_andes_tauantinsuyu: "aztec_icon",
  DEC_IND_reg_andes_northern: "maya",
  DEC_IND_crusade_andes: "war",
  DEC_IND_south: "focus_ARG_south_american_unity",
  DEC_IND_reg_south_amazon: "focus_CHL_the_spirit_of_the_war_of_the_pacific",
  DEC_IND_reg_south_cone: "focus_ARG_south_american_unity",
  DEC_IND_crusade_south: "war_against_australia",
  DEC_IND_melanesia: "oceania",
  DEC_IND_reg_melanesia_black_pacific: "oceania",
  DEC_IND_reg_melanesia_timor: "asia_pacific",
  DEC_IND_crusade_melanesia: "ast_war_monger",
  DEC_IND_polynesia: "aboriginal_voting",
  DEC_IND_reg_polynesia_maori: "oceania",
  DEC_IND_reg_polynesia_micronesia: "asia_pacific",
  DEC_IND_reg_polynesia_australia: "aboriginal_voting",
  DEC_IND_crusade_polynesia: "war_against_australia",
  DEC_IND_crusade_world: "war4",
  DEC_IND_local_council: "native_americans",

  DEC_ASI_asian_awakening: "asia",
  DEC_ASI_declare_sphere: "asian_union",
  DEC_ASI_call_unity: "alliance_with_asia",
  DEC_ASI_call_oath: "oath_of_beirut",
  DEC_ASI_unite_sphere: "annex_country",
  DEC_ASI_greater_east_asia: "japanese_imperialism",
  DEC_ASI_asean_revival: "asean_mutual_trade",
  DEC_ASI_china: "chinese_nationalism",
  DEC_ASI_reg_china_core: "china",
  DEC_ASI_reg_china_coasts: "china_lighthouse_of_democracy",
  DEC_ASI_reg_china_highlands: "china_central_asia",
  DEC_ASI_crusade_china: "war_against_china",
  DEC_ASI_northeast: "korean_peninsula",
  DEC_ASI_reg_northeast_korea: "korea_reunification_flag",
  DEC_ASI_reg_northeast_japan: "japanese_imperial_glory",
  DEC_ASI_crusade_northeast: "war_in_asia",
  DEC_ASI_mainland: "asia",
  DEC_ASI_reg_mainland_indochina: "asia_friend",
  DEC_ASI_reg_mainland_theravada: "focus_SIA_defenders_of_constitutional_liberty",
  DEC_ASI_crusade_mainland: "war_in_asia",
  DEC_ASI_maritime: "asia_pacific",
  DEC_ASI_reg_maritime_malay: "asean_mutual_trade",
  DEC_ASI_reg_maritime_philippines: "filipino_unity",
  DEC_ASI_crusade_maritime: "war_in_asia",
  DEC_ASI_crusade_world: "war4",
  DEC_ASI_local_council: "asian_union",

  DEC_HND_hindu_awakening: "hindu_india",
  DEC_HND_declare_rashtra: "dharmic_alliance_01",
  DEC_HND_call_unity: "hindu_government",
  DEC_HND_call_oath: "hindu_document",
  DEC_HND_unite_rashtra: "annex_country",
  DEC_HND_sangh: "hindu_tiger",
  DEC_HND_diaspora_league: "hindu_04",
  DEC_HND_india: "india",
  DEC_HND_reg_india_core: "hindu_india",
  DEC_HND_reg_india_bengal: "india_star",
  DEC_HND_crusade_india: "war_against_india",
  DEC_HND_himalaya: "hindu_military1",
  DEC_HND_reg_himalaya_kingdoms: "hindu_deal_06",
  DEC_HND_crusade_himalaya: "war_against_india",
  DEC_HND_island: "india_tiger_01",
  DEC_HND_reg_island_lanka: "hindu_tiger",
  DEC_HND_reg_island_maldives: "india_free",
  DEC_HND_crusade_island: "war_against_india",
  DEC_HND_northwest: "indian_army",
  DEC_HND_reg_northwest_punjab_kashmir: "indian_religious_divide",
  DEC_HND_crusade_northwest: "war_against_india",
  DEC_HND_diaspora: "india_star",
  DEC_HND_reg_diaspora_caribbean: "hindu_04",
  DEC_HND_reg_diaspora_pacific: "oceania",
  DEC_HND_reg_diaspora_mauritius: "africa3",
  DEC_HND_crusade_diaspora: "war_against_india",
  DEC_HND_crusade_world: "war4",
  DEC_HND_local_council: "hindu_government",

  DEC_WHT_local_council: "Ultranationalism",
  DEC_BAW_local_council: "africa",

  DEC_CAL_world_caliphate: "cybercaliphate",
  DEC_CAL_declare_caliphate: "ummah",
  DEC_CAL_call_jihad: "islamic_military_03",
  DEC_CAL_call_bayah: "islam",
  DEC_CAL_unite_caliphate: "cybercaliphate",
  DEC_CAL_africa: "africa",
  DEC_CAL_asia: "asia",
  DEC_CAL_europe: "europe",
  DEC_CAL_reg_afr_maghreb: "islam_laws",
  DEC_CAL_reg_afr_black: "africa_guy_shield",
  DEC_CAL_reg_asia_far: "islamic_organization",
  DEC_CAL_reg_asia_central: "islamist_gov",
  DEC_CAL_reg_asia_north: "chechnya_nationalism",
  DEC_CAL_reg_asia_me: "islamic_sword_03",
  DEC_CAL_reg_eur_volga: "islam",
  DEC_CAL_reg_eur_cau: "islamic_resistance",
  DEC_CAL_reg_eur_balk: "islamic_militia_01",
  DEC_CAL_jihad_africa: "islamic_sword_03",
  DEC_CAL_jihad_asia: "islamic_militarism",
  DEC_CAL_jihad_europe: "islamic_militia_03",
  DEC_CAL_world_jihad: "cybercaliphate",
};

function iconForId(id, current) {
  if (BY_ID[id]) return BY_ID[id];
  if (/_country_/.test(id)) return "nationalist_administration";
  if (/_uprising_/.test(id)) return "generic_fascist_uprising";
  if (/_crusade_world$/.test(id)) return "war4";
  if (/_crusade_/.test(id)) return "war";
  if (VANILLA_TO_MD[current]) return VANILLA_TO_MD[current];
  return current;
}

function patchFocusFile(file) {
  const raw = fs.readFileSync(file, "utf8");
  const nl = raw.includes("\r\n") ? "\r\n" : "\n";
  const lines = raw.split(/\r?\n/);
  const hadTrail = raw.endsWith("\n");
  const blocks = [];
  let currentId = null;
  for (let i = 0; i < lines.length; i++) {
    const idm = lines[i].match(/^\t+id = ([A-Za-z0-9_]+)\s*$/);
    if (idm) currentId = idm[1];
    const icm = lines[i].match(/^(\t+icon = )([A-Za-z0-9_]+)\s*$/);
    if (icm && currentId) {
      const next = iconForId(currentId, icm[2]);
      if (next !== icm[2]) {
        blocks.push(`${currentId}: ${icm[2]} -> ${next}`);
        lines[i] = icm[1] + next;
      }
      currentId = null;
    }
  }
  if (blocks.length) {
    let out = lines.join(nl);
    if (hadTrail && !out.endsWith(nl)) out += nl;
    fs.writeFileSync(file, out, "utf8");
  }
  return blocks;
}

function patchGenerators() {
  const gens = [
    "gen_white_revival.cjs",
    "gen_black_awakening.cjs",
    "gen_indigenous_awakening.cjs",
    "gen_asian_awakening.cjs",
    "gen_hindu_awakening.cjs",
  ];
  for (const g of gens) {
    const fp = path.join(__dirname, g);
    if (!fs.existsSync(fp)) continue;
    let s = fs.readFileSync(fp, "utf8");
    for (const [from, to] of Object.entries(VANILLA_TO_MD)) {
      s = s.split(from).join(to);
    }
    fs.writeFileSync(fp, s, "utf8");
  }
}

function main() {
  const files = fs.readdirSync(FOCUS_DIR).filter((f) => f.startsWith("DEC_") && f.endsWith(".txt"));
  let n = 0;
  for (const f of files) {
    const changed = patchFocusFile(path.join(FOCUS_DIR, f));
    if (changed.length) {
      n += changed.length;
      console.log(f, changed.length);
    }
  }
  patchGenerators();
  const leftover = [];
  for (const f of files) {
    const t = fs.readFileSync(path.join(FOCUS_DIR, f), "utf8");
    const m = t.match(/icon = GFX_[A-Za-z0-9_]+/g);
    if (m) leftover.push(f + ": " + [...new Set(m)].join(", "));
  }
  console.log("replacements", n);
  if (leftover.length) console.log("leftover GFX:\n" + leftover.join("\n"));
  else console.log("no leftover GFX_ icons in DEC focus files");
}

main();
