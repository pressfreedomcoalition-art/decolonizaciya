/* Generate Indigenous Awakening (Коренное пробуждение) — Americas + Oceania */
const fs = require("fs");
const path = require("path");
const ROOT = path.resolve(__dirname, "..");
const PFX = "DEC_IND";

const BLOCKS = {
  north: {
    title_ru: "Turtle Island", title_en: "Turtle Island", x: -24,
    regions: {
      plains: { title_ru: "Великие равнины", title_en: "Great Plains", tags: ["LKT", "GLC"] },
      pacific: { title_ru: "Тихоокеанский север", title_en: "Pacific North", tags: ["CAS", "HWI", "GRN"] },
      settlers: { title_ru: "Поселенческие державы", title_en: "Settler Powers", tags: ["USA", "CAN"] },
    },
  },
  meso: {
    title_ru: "Мезоамерика", title_en: "Mesoamerica", x: -6,
    regions: {
      mexico: { title_ru: "Мексика и Юкатан", title_en: "Mexico and Yucatan", tags: ["MEX", "YUC"] },
      central: { title_ru: "Центральная Америка", title_en: "Central America", tags: ["GUA", "HON", "ELS", "NIC", "COS", "PAN", "BLZ"] },
    },
  },
  andes: {
    title_ru: "Анды", title_en: "Andes", x: 10,
    regions: {
      tauantinsuyu: { title_ru: "Тауантинсуйю", title_en: "Tawantinsuyu", tags: ["BOL", "PRU", "ECU"] },
      northern: { title_ru: "Северные Анды", title_en: "Northern Andes", tags: ["COL"] },
    },
  },
  south: {
    title_ru: "Юг и Амазония", title_en: "South and Amazonia", x: 22,
    regions: {
      amazon: { title_ru: "Амазония", title_en: "Amazonia", tags: ["BRA", "VEN", "GUY", "SUR"] },
      cone: { title_ru: "Южный конус", title_en: "Southern Cone", tags: ["ARG", "CHL", "PAT", "PAR", "URG"] },
    },
  },
  melanesia: {
    title_ru: "Меланезия", title_en: "Melanesia", x: 38,
    regions: {
      black_pacific: { title_ru: "Чёрный Тихий океан", title_en: "Black Pacific", tags: ["PAP", "SOL", "VAN", "FIJ"] },
      timor: { title_ru: "Тимор", title_en: "Timor", tags: ["TIM"] },
    },
  },
  polynesia: {
    title_ru: "Полинезия и Австралазия", title_en: "Polynesia and Australasia", x: 52,
    regions: {
      maori: { title_ru: "Маори и Полинезия", title_en: "Maori and Polynesia", tags: ["NZL", "SAM", "TON", "TUL", "KIR"] },
      micronesia: { title_ru: "Микронезия", title_en: "Micronesia", tags: ["MIC", "PAU", "NAU"] },
      australia: { title_ru: "Австралия", title_en: "Australia", tags: ["AST"] },
    },
  },
};

const NAMES_RU = {
  LKT: "Лакоты", GLC: "Конфедерации Великих озёр", CAS: "Каскадии", HWI: "Гавайев", GRN: "Гренландии",
  USA: "США", CAN: "Канады",
  MEX: "Мексики", YUC: "Юкатана", GUA: "Гватемалы", HON: "Гондураса", ELS: "Сальвадора",
  NIC: "Никарагуа", COS: "Коста-Рики", PAN: "Панамы", BLZ: "Белиза",
  BOL: "Боливии", PRU: "Перу", ECU: "Эквадора", COL: "Колумбии",
  BRA: "Бразилии", VEN: "Венесуэлы", GUY: "Гайаны", SUR: "Суринама",
  ARG: "Аргентины", CHL: "Чили", PAT: "Патагонии", PAR: "Парагвая", URG: "Уругвая",
  PAP: "Папуа — Новой Гвинеи", SOL: "Соломоновых Островов", VAN: "Вануату", FIJ: "Фиджи", TIM: "Восточного Тимора",
  NZL: "Новой Зеландии", SAM: "Самоа", TON: "Тонги", TUL: "Тувалу", KIR: "Кирибати",
  MIC: "Микронезии", PAU: "Палау", NAU: "Науру", AST: "Австралии",
};
const NAMES_EN = {
  LKT: "Lakota", GLC: "the Great Lakes Confederation", CAS: "Cascadia", HWI: "Hawaii", GRN: "Greenland",
  USA: "the United States", CAN: "Canada",
  MEX: "Mexico", YUC: "Yucatan", GUA: "Guatemala", HON: "Honduras", ELS: "El Salvador",
  NIC: "Nicaragua", COS: "Costa Rica", PAN: "Panama", BLZ: "Belize",
  BOL: "Bolivia", PRU: "Peru", ECU: "Ecuador", COL: "Colombia",
  BRA: "Brazil", VEN: "Venezuela", GUY: "Guyana", SUR: "Suriname",
  ARG: "Argentina", CHL: "Chile", PAT: "Patagonia", PAR: "Paraguay", URG: "Uruguay",
  PAP: "Papua New Guinea", SOL: "the Solomon Islands", VAN: "Vanuatu", FIJ: "Fiji", TIM: "East Timor",
  NZL: "New Zealand", SAM: "Samoa", TON: "Tonga", TUL: "Tuvalu", KIR: "Kiribati",
  MIC: "Micronesia", PAU: "Palau", NAU: "Nauru", AST: "Australia",
};

function allTags() {
  const tags = [];
  for (const b of Object.values(BLOCKS)) for (const r of Object.values(b.regions)) tags.push(...r.tags);
  return [...new Set(tags)];
}
function triggerOrTags(tags, indent = "\t\t") {
  let s = `${indent}OR = {\n`;
  for (const t of tags) s += `${indent}\toriginal_tag = ${t}\n${indent}\ttag = ${t}\n`;
  return s + `${indent}}`;
}

function genTriggers() {
  let p = `############################################
# Indigenous Awakening / Коренное пробуждение
# Americas + Oceania (incl. Melanesian Black Pacific)
############################################

DEC_has_indigenous_right_ideology = {
	OR = {
		western_autocrats_are_in_power = yes
		western_conservatism_are_in_power = yes
		neutrality_neutral_conservatism_are_in_power = yes
		emerging_reactionaries_are_in_power = yes
		nationalist_right_wing_populists_are_in_power = yes
		nationalist_fascist_are_in_power = yes
		nationalist_military_junta_are_in_power = yes
		nationalist_monarchists_are_in_power = yes
	}
}

DEC_is_indigenous_nation = {
	OR = {
`;
  for (const t of allTags()) p += `\t\toriginal_tag = ${t}\n\t\ttag = ${t}\n`;
  p += `\t\thas_cosmetic_tag = ABY
\t\thas_cosmetic_tag = DEC_TIL
\t\thas_cosmetic_tag = DEC_MEL
\t}
}

`;
  for (const [bid, b] of Object.entries(BLOCKS)) {
    const tagsB = [];
    for (const r of Object.values(b.regions)) tagsB.push(...r.tags);
    p += `DEC_IND_is_${bid} = {\n${triggerOrTags(tagsB)}\n}\n\n`;
    for (const [rid, r] of Object.entries(b.regions)) {
      p += `DEC_IND_is_${bid}_${rid} = {\n${triggerOrTags(r.tags)}\n}\n\n`;
    }
    const ups = [];
    for (const r of Object.values(b.regions)) for (const t of r.tags) ups.push(`has_completed_focus = DEC_IND_uprising_${t}`);
    p += `DEC_IND_${bid}_block_complete = {
	OR = {
		has_country_flag = DEC_IND_${bid}_block_done
		AND = {
${ups.map(u => `\t\t\t${u}`).join("\n")}
		}
	}
}

`;
  }
  p += `DEC_can_access_indigenous_awakening = {
	DEC_is_indigenous_nation = yes
	DEC_has_indigenous_right_ideology = yes
	NOT = {
		OR = {
			has_completed_focus = DEC_WHT_white_revival
			has_completed_focus = DEC_BAW_black_awakening
			has_completed_focus = DEC_ASI_asian_awakening
			has_completed_focus = DEC_HND_hindu_awakening
			has_completed_focus = DEC_CAL_world_caliphate
		}
	}
}

DEC_is_indigenous_invitee = {
	DEC_is_indigenous_nation = yes
	OR = {
		DEC_has_ns = yes
		DEC_has_indigenous_right_ideology = yes
	}
	exists = yes
	NOT = { has_war_with = ROOT }
	OR = {
		is_subject = no
		is_subject_of = ROOT
	}
}
`;
  return p;
}

function uprisingEffect(tag) {
  return `DEC_IND_uprising_${tag} = {
	log = "DEC_IND: NS uprising ${tag}"
	if = {
		limit = { country_exists = ${tag} ${tag} = { DEC_has_ns = yes } }
		custom_effect_tooltip = DEC_IND_uprising_already_tt
	}
	else_if = {
		limit = { OR = { tag = ${tag} original_tag = ${tag} } }
		DEC_IND_ns_conversion_setup = yes
		custom_effect_tooltip = DEC_IND_self_convert_tt
	}
	else_if = {
		limit = { country_exists = ${tag} ${tag} = { is_subject = no } }
		${tag} = {
			set_variable = { party_pop_array^21 = 0.45 }
			add_popularity = { ideology = nationalist popularity = 0.45 }
			recalculate_party = yes
			start_civil_war = { ideology = nationalist size = 0.45 }
		}
		random_country = {
			limit = { original_tag = ${tag} has_government = nationalist has_war_with = ${tag} }
			DEC_IND_ns_conversion_setup = yes
			if = { limit = { ROOT = { is_in_faction = yes } } ROOT = { add_to_faction = PREV } set_country_flag = DEC_joined_named_faction }
		}
	}
	else_if = {
		limit = { country_exists = ${tag} }
		${tag} = {
			if = {
				limit = { is_subject = yes }
				OVERLORD = { save_event_target_as = DEC_ind_former_overlord }
				OVERLORD = { set_autonomy = { target = PREV autonomy_state = autonomy_free } }
			}
			DEC_IND_ns_conversion_setup = yes
		}
		if = { limit = { ROOT = { is_in_faction = yes } } ROOT = { add_to_faction = ${tag} } }
		${tag} = {
			if = {
				limit = { has_event_target = DEC_ind_former_overlord }
				declare_war_on = { target = event_target:DEC_ind_former_overlord type = annex_everything }
			}
		}
	}
	else = {
		random_state = {
			limit = { is_core_of = ${tag} }
			OWNER = { save_event_target_as = DEC_ind_occ }
			OWNER = { release = ${tag} }
		}
		if = {
			limit = { country_exists = ${tag} }
			${tag} = { DEC_IND_ns_conversion_setup = yes }
			if = { limit = { ROOT = { is_in_faction = yes } } ROOT = { add_to_faction = ${tag} } }
			${tag} = {
				if = {
					limit = { has_event_target = DEC_ind_occ }
					declare_war_on = { target = event_target:DEC_ind_occ type = annex_everything }
				}
			}
		}
	}
}
`;
}


function genEffects() {
  let out = `############################################
# Indigenous Awakening scripted effects
############################################

DEC_IND_add_ns_amt = {
	if = { limit = { NOT = { has_variable = party_pop_array^21 } } set_variable = { party_pop_array^21 = 0 } }
	add_to_variable = { party_pop_array^21 = DEC_ind_ns_amt }
	clamp_variable = { var = party_pop_array^21 min = 0 max = 1 }
	add_popularity = { ideology = nationalist popularity = DEC_ind_ns_amt }
	recalculate_party = yes
}

DEC_IND_ns_conversion_setup = {
	set_variable = { party_pop_array^21 = 0.55 }
	add_popularity = { ideology = nationalist popularity = 0.55 }
	set_variable = { ruling_party = 21 }
	recalculate_party = yes
	set_politics = { ruling_party = nationalist elections_allowed = no }
	set_country_flag = DEC_rebel_nation
}

DEC_IND_boost_all = {
	every_country = {
		limit = { DEC_is_indigenous_nation = yes exists = yes }
		set_temp_variable = { DEC_ind_ns_amt = ROOT.DEC_ind_ns_amt }
		DEC_IND_add_ns_amt = yes
	}
}
`;
  for (const bid of Object.keys(BLOCKS)) {
    out += `DEC_IND_boost_${bid} = {
	every_country = { limit = { DEC_IND_is_${bid} = yes exists = yes }
		set_temp_variable = { DEC_ind_ns_amt = ROOT.DEC_ind_ns_amt }
		DEC_IND_add_ns_amt = yes
	}
}
`;
    for (const rid of Object.keys(BLOCKS[bid].regions)) {
      out += `DEC_IND_boost_${bid}_${rid} = {
	every_country = { limit = { DEC_IND_is_${bid}_${rid} = yes exists = yes }
		set_temp_variable = { DEC_ind_ns_amt = ROOT.DEC_ind_ns_amt }
		DEC_IND_add_ns_amt = yes
	}
}
`;
    }
  }
  for (const t of allTags()) {
    out += `DEC_IND_boost_country_${t} = {
	if = { limit = { country_exists = ${t} }
		${t} = { set_temp_variable = { DEC_ind_ns_amt = ROOT.DEC_ind_ns_amt } DEC_IND_add_ns_amt = yes }
	}
}
`;
    out += uprisingEffect(t);
  }
  out += `
DEC_create_abya_yala_council = {
	DEC_mark_named_alliance_member = yes
	if = { limit = { is_in_faction = yes } leave_faction = yes }
	set_rule = { can_create_factions = yes }
	create_faction_from_template = faction_template_dec_abya_yala
	set_global_flag = DEC_IND_council_formed
}

DEC_invite_abya_yala_members = {
	every_other_country = {
		limit = { DEC_is_indigenous_invitee = yes NOT = { is_in_faction_with = ROOT } }
		set_country_flag = DEC_joined_named_faction
		if = { limit = { is_in_faction = yes } leave_faction = yes }
		ROOT = { add_to_faction = PREV }
	}
}

DEC_IND_create_turtle_island = {
	DEC_mark_named_alliance_member = yes
	if = { limit = { is_in_faction = yes } leave_faction = yes }
	set_rule = { can_create_factions = yes }
	create_faction_from_template = faction_template_dec_turtle_island
	set_cosmetic_tag = DEC_TIL
	set_global_flag = DEC_IND_turtle_island
	every_other_country = {
		limit = { DEC_IND_is_north = yes DEC_is_indigenous_invitee = yes NOT = { tag = ROOT } }
		set_country_flag = DEC_joined_named_faction
		if = { limit = { is_in_faction = yes } leave_faction = yes }
		ROOT = { add_to_faction = PREV }
	}
}

DEC_IND_create_melanesian_league = {
	DEC_mark_named_alliance_member = yes
	if = { limit = { is_in_faction = yes } leave_faction = yes }
	set_rule = { can_create_factions = yes }
	create_faction_from_template = faction_template_dec_melanesian_league
	set_cosmetic_tag = DEC_MEL
	set_global_flag = DEC_IND_melanesian_league
	every_other_country = {
		limit = {
			OR = { DEC_IND_is_melanesia = yes DEC_IND_is_polynesia = yes }
			DEC_is_indigenous_invitee = yes
			NOT = { tag = ROOT }
		}
		set_country_flag = DEC_joined_named_faction
		if = { limit = { is_in_faction = yes } leave_faction = yes }
		ROOT = { add_to_faction = PREV }
	}
}

DEC_IND_oath_start = {
	set_country_flag = DEC_IND_oath_caller
	save_global_event_target_as = DEC_ind_overlord
	every_other_country = {
		limit = { is_in_faction_with = ROOT is_subject = no NOT = { tag = ROOT } }
		country_event = { id = dec_ind.1 hours = 8 }
	}
}

DEC_IND_unite_council = {
	every_other_country = {
		limit = { OR = { is_subject_of = ROOT has_country_flag = DEC_IND_oath_accepted } }
		every_owned_state = { add_core_of = ROOT }
		ROOT = { annex_country = { target = PREV transfer_troops = yes } }
	}
	set_cosmetic_tag = ABY
	set_global_flag = DEC_IND_united
	custom_effect_tooltip = DEC_IND_unite_council_tt
}
`;
  for (const bid of Object.keys(BLOCKS)) {
    out += `DEC_IND_wargoals_${bid} = {
	every_country = {
		limit = {
			exists = yes DEC_IND_is_${bid} = yes
			NOT = { tag = ROOT } NOT = { is_in_faction_with = ROOT } NOT = { is_subject_of = ROOT }
		}
		ROOT = { create_wargoal = { type = annex_everything target = PREV } }
	}
	set_country_flag = DEC_IND_${bid}_block_done
}
`;
  }
  out += `DEC_IND_wargoals_world = {
	every_country = {
		limit = {
			exists = yes NOT = { tag = ROOT } NOT = { is_in_faction_with = ROOT }
			NOT = { is_subject_of = ROOT } NOT = { DEC_is_indigenous_nation = yes }
		}
		ROOT = { create_wargoal = { type = annex_everything target = PREV } }
	}
	set_global_flag = DEC_IND_world_crusade
}
`;
  return out;
}

function focusBlock({ id, icon, x, y, cost, prereq, rewards, bypass, available, ai = 20 }) {
  let byp = bypass ? `\n\tbypass = {\n\t\t${bypass}\n\t}` : "";
  const pr = prereq.map(p => `\tprerequisite = { focus = ${p} }`).join("\n");
  const rew = rewards.map(l => `\t\t${l}`).join("\n");
  return `
shared_focus = {
	id = ${id}
	icon = ${icon}
	relative_position_id = DEC_IND_indigenous_awakening
	x = ${x}
	y = ${y}
	cost = ${cost}
${pr}${byp}
	available = { ${available || "DEC_can_access_indigenous_awakening = yes"} }
	search_filters = { FOCUS_FILTER_POLITICAL FOCUS_FILTER_DIPLOMACY }
	completion_reward = {
		log = "[GetDateText]: [Root.GetName]: Focus ${id}"
${rew}
	}
	ai_will_do = { base = ${ai} }
}
`;
}

function genFocuses() {
  let lines = `############################################
# Shared: Indigenous Awakening — Коренное пробуждение
# Americas + Oceania
############################################

shared_focus = {
	id = DEC_IND_indigenous_awakening
	icon = Ultranationalism
	x = 240
	y = 0
	cost = 5
	allow_branch = { DEC_can_access_indigenous_awakening = yes }
	search_filters = { FOCUS_FILTER_POLITICAL FOCUS_FILTER_DIPLOMACY }
	available = { DEC_can_access_indigenous_awakening = yes }
	completion_reward = {
		log = "[GetDateText]: [Root.GetName]: Focus DEC_IND_indigenous_awakening"
		set_variable = { DEC_ind_ns_amt = 0.10 }
		DEC_IND_boost_all = yes
		add_political_power = 50
		custom_effect_tooltip = DEC_IND_boost_plus1_tt
	}
	ai_will_do = { base = 40 }
}
`;
  lines += focusBlock({
    id: "DEC_IND_declare_council", icon: "alliance", x: -36, y: 1, cost: 8,
    prereq: ["DEC_IND_indigenous_awakening"],
    rewards: ["DEC_create_abya_yala_council = yes", "custom_effect_tooltip = DEC_IND_declare_council_tt"],
    available: "DEC_can_access_indigenous_awakening = yes\n\t\tis_subject = no\n\t\tis_in_faction = no", ai: 45,
  });
  lines += focusBlock({
    id: "DEC_IND_call_unity", icon: "major_alliance", x: -36, y: 2, cost: 8,
    prereq: ["DEC_IND_declare_council"],
    rewards: ["DEC_invite_abya_yala_members = yes", "custom_effect_tooltip = DEC_IND_call_unity_tt"],
    available: "DEC_can_access_indigenous_awakening = yes\n\t\tis_faction_leader = yes", ai: 40,
  });
  lines += focusBlock({
    id: "DEC_IND_call_oath", icon: "national_unity", x: -36, y: 3, cost: 10,
    prereq: ["DEC_IND_call_unity"],
    rewards: ["DEC_IND_oath_start = yes", "custom_effect_tooltip = DEC_IND_call_oath_tt"],
    available: "DEC_can_access_indigenous_awakening = yes\n\t\tis_faction_leader = yes", ai: 35,
  });
  lines += focusBlock({
    id: "DEC_IND_unite_council", icon: "annex_country", x: -36, y: 4, cost: 12,
    prereq: ["DEC_IND_call_oath"],
    rewards: ["DEC_IND_unite_council = yes"],
    available: "DEC_can_access_indigenous_awakening = yes\n\t\tis_faction_leader = yes\n\t\tany_subject_country = { always = yes }", ai: 30,
  });

  lines += focusBlock({
    id: "DEC_IND_turtle_island", icon: "major_alliance", x: -18, y: 1, cost: 8,
    prereq: ["DEC_IND_north"],
    rewards: ["DEC_IND_create_turtle_island = yes", "custom_effect_tooltip = DEC_IND_turtle_island_tt"],
    available: "DEC_can_access_indigenous_awakening = yes\n\t\tis_subject = no", ai: 40,
  });
  lines += focusBlock({
    id: "DEC_IND_melanesian_league", icon: "major_alliance", x: 44, y: 1, cost: 8,
    prereq: ["DEC_IND_melanesia"],
    rewards: ["DEC_IND_create_melanesian_league = yes", "custom_effect_tooltip = DEC_IND_melanesian_league_tt"],
    available: "DEC_can_access_indigenous_awakening = yes\n\t\tis_subject = no", ai: 40,
  });

  for (const [bid, b] of Object.entries(BLOCKS)) {
    lines += focusBlock({
      id: `DEC_IND_${bid}`, icon: "national_unity", x: b.x, y: 1, cost: 7,
      prereq: ["DEC_IND_indigenous_awakening"],
      rewards: ["set_variable = { DEC_ind_ns_amt = 0.15 }", `DEC_IND_boost_${bid} = yes`, "custom_effect_tooltip = DEC_IND_boost_plus2_tt"],
      ai: 30,
    });
    const regs = Object.entries(b.regions);
    let cursor = b.x - Math.floor(regs.reduce((a, [, r]) => a + r.tags.length, 0) / 2);
    for (const [rid, r] of regs) {
      const rx = cursor;
      lines += focusBlock({
        id: `DEC_IND_reg_${bid}_${rid}`, icon: "national_unity", x: rx, y: 2, cost: 7,
        prereq: [`DEC_IND_${bid}`],
        rewards: ["set_variable = { DEC_ind_ns_amt = 0.20 }", `DEC_IND_boost_${bid}_${rid} = yes`, "custom_effect_tooltip = DEC_IND_boost_plus3_tt"],
        ai: 25,
      });
      r.tags.forEach((tag, j) => {
        const cx = rx + j;
        lines += focusBlock({
          id: `DEC_IND_country_${tag}`, icon: "nationalist_administration", x: cx, y: 3, cost: 6,
          prereq: [`DEC_IND_reg_${bid}_${rid}`],
          rewards: ["set_variable = { DEC_ind_ns_amt = 0.25 }", `DEC_IND_boost_country_${tag} = yes`, "custom_effect_tooltip = DEC_IND_boost_plus4_tt"],
          ai: 15,
        });
        lines += focusBlock({
          id: `DEC_IND_uprising_${tag}`, icon: "generic_fascist_uprising", x: cx, y: 4, cost: 8,
          prereq: [`DEC_IND_country_${tag}`],
          rewards: [`DEC_IND_uprising_${tag} = yes`],
          bypass: `country_exists = ${tag}\n\t\t${tag} = { DEC_has_ns = yes }`,
          ai: 12,
        });
      });
      cursor += r.tags.length + 1;
    }
    const ups = [];
    for (const r of Object.values(b.regions)) for (const t of r.tags) ups.push(`DEC_IND_uprising_${t}`);
    const prereqLines = ups.map(u => `\tprerequisite = { focus = ${u} }`).join("\n");
    lines += `
shared_focus = {
	id = DEC_IND_crusade_${bid}
	icon = war
	relative_position_id = DEC_IND_indigenous_awakening
	x = ${b.x}
	y = 5
	cost = 10
${prereqLines}
	available = { DEC_can_access_indigenous_awakening = yes }
	search_filters = { FOCUS_FILTER_WAR_SUPPORT FOCUS_FILTER_ANNEXATION }
	completion_reward = {
		log = "[GetDateText]: [Root.GetName]: Focus DEC_IND_crusade_${bid}"
		DEC_IND_wargoals_${bid} = yes
		custom_effect_tooltip = DEC_IND_crusade_${bid}_tt
	}
	ai_will_do = { base = 35 }
}
`;
  }
  const crusadePrereqs = Object.keys(BLOCKS).map(bid => `\tprerequisite = { focus = DEC_IND_crusade_${bid} }`).join("\n");
  lines += `
shared_focus = {
	id = DEC_IND_crusade_world
	icon = annex_country
	relative_position_id = DEC_IND_indigenous_awakening
	x = 14
	y = 6
	cost = 15
${crusadePrereqs}
	available = { DEC_can_access_indigenous_awakening = yes }
	search_filters = { FOCUS_FILTER_WAR_SUPPORT FOCUS_FILTER_ANNEXATION }
	completion_reward = {
		log = "[GetDateText]: [Root.GetName]: Focus DEC_IND_crusade_world"
		DEC_IND_wargoals_world = yes
		custom_effect_tooltip = DEC_IND_crusade_world_tt
	}
	ai_will_do = { base = 50 }
}
`;
  return lines;
}

function genLocRu() {
  let lines = [
    ' # --- Коренное пробуждение ---',
    ' DEC_ABYA_YALA_FACTION: "Совет Абиа-Яла"',
    ' DEC_TURTLE_ISLAND_FACTION: "Лига Turtle Island"',
    ' DEC_MELANESIAN_LEAGUE_FACTION: "Меланезийская лига"',
    ' DEC_IND_indigenous_awakening: "Коренное пробуждение"',
    ' DEC_IND_indigenous_awakening_desc: "Коренные народы Америк и Океании поднимают программу пробуждения. +1 НС всем странам списка."',
    ' DEC_IND_boost_plus1_tt: "§Y+1 НС§! всем странам Коренного пробуждения."',
    ' DEC_IND_boost_plus2_tt: "§Y+2 НС§! странам этого макроблока."',
    ' DEC_IND_boost_plus3_tt: "§Y+3 НС§! странам субрегиона."',
    ' DEC_IND_boost_plus4_tt: "§Y+4 НС§! этой стране."',
    ' DEC_IND_declare_council: "Объявить Совет Абиа-Яла"',
    ' DEC_IND_declare_council_desc: "Создать альянс коренных народов Америк и Океании."',
    ' DEC_IND_declare_council_tt: "Создаёт фракцию §YСовет Абиа-Яла§!."',
    ' DEC_IND_call_unity: "Призвать Четыре Стороны"',
    ' DEC_IND_call_unity_desc: "Пригласить в альянс все страны списка с подходящей правой / НС идеологией."',
    ' DEC_IND_call_unity_tt: "Приглашает подходящие страны в §YСовет Абиа-Яла§!."',
    ' DEC_IND_call_oath: "Призвать к присяге",',
    ' DEC_IND_call_oath_desc: "Потребовать вассалитета от членов альянса. Отказ — война и восстание НС."',
    ' DEC_IND_call_oath_tt: "Члены альянса получают ивент присяги."',
    ' DEC_IND_unite_council: "Объединить Абиа-Яла"',
    ' DEC_IND_unite_council_desc: "Слить вассалов и присягнувших в единое государство Абиа-Яла."',
    ' DEC_IND_unite_council_tt: "Аннексия вассалов; косметика §YАбиа-Яла§! (ABY)."',
    ' DEC_IND_turtle_island: "Основать Лигу Turtle Island"',
    ' DEC_IND_turtle_island_desc: "Создать региональную фракцию Северной Америки."',
    ' DEC_IND_turtle_island_tt: "Создаёт §YЛигу Turtle Island§! и приглашает северный блок."',
    ' DEC_IND_melanesian_league: "Основать Меланезийскую лигу"',
    ' DEC_IND_melanesian_league_desc: "Создать региональную фракцию Чёрного Тихого океана и Океании."',
    ' DEC_IND_melanesian_league_tt: "Создаёт §YМеланезийскую лигу§! и приглашает Океанию."',
    ' DEC_IND_uprising_already_tt: "В стране уже у власти §Yнационал-социалисты§! — фокус пропускается."',
    ' DEC_IND_crusade_world: "Освободительный поход по Миру"',
    ' DEC_IND_crusade_world_desc: "Все блоковые походы объявлены. Мандат на захват остального мира."',
    ' DEC_IND_crusade_world_tt: "Казус белли на все страны вне Коренного пробуждения."',
    ' ABY: "Абиа-Яла"',
    ' ABY_DEF: "Абиа-Яла"',
    ' ABY_ADJ: "Абиаяльск"',
    ' DEC_TIL: "Лига Turtle Island"',
    ' DEC_TIL_DEF: "Лига Turtle Island"',
    ' DEC_TIL_ADJ: "Turtle Island"',
    ' DEC_MEL: "Меланезийская лига"',
    ' DEC_MEL_DEF: "Меланезийская лига"',
    ' DEC_MEL_ADJ: "Меланезийск"',
    ' dec_ind.1.t: "Присяга Совету Абиа-Яла"',
    ' dec_ind.1.d: "Лидер Совета требует вассальной присяги. Отказ будет объявлен отступничеством."',
    ' dec_ind.1.a: "Присягнуть"',
    ' dec_ind.1.b: "Отказать"',
    ' dec_ind.2.t: "Отказ от присяги"',
    ' dec_ind.2.d: "Член альянса отверг присягу. Война и восстание НС неизбежны."',
    ' dec_ind.2.a: "Так им и надо"',
  ];
  // fix typo in call_oath line
  lines = lines.map(l => l.replace('DEC_IND_call_oath: "Призвать к присяге",', 'DEC_IND_call_oath: "Призвать к присяге"'));
  for (const [bid, b] of Object.entries(BLOCKS)) {
    lines.push(` DEC_IND_${bid}: "${b.title_ru}"`);
    lines.push(` DEC_IND_${bid}_desc: "Макроблок: ${b.title_ru}. +2 НС странам блока."`);
    lines.push(` DEC_IND_crusade_${bid}: "Освободительный поход по: ${b.title_ru}"`);
    lines.push(` DEC_IND_crusade_${bid}_desc: "После всех восстаний блока — казус белли на страны блока вне альянса."`);
    lines.push(` DEC_IND_crusade_${bid}_tt: "Казус белли на страны макроблока §Y${b.title_ru}§!."`);
    for (const [rid, r] of Object.entries(b.regions)) {
      lines.push(` DEC_IND_reg_${bid}_${rid}: "${r.title_ru}"`);
      lines.push(` DEC_IND_reg_${bid}_${rid}_desc: "Субрегион: ${r.title_ru}. +3 НС."`);
      for (const t of r.tags) {
        const nr = NAMES_RU[t] || t;
        lines.push(` DEC_IND_country_${t}: "${nr}"`);
        lines.push(` DEC_IND_country_${t}_desc: "+4 НС стране (${t})."`);
        lines.push(` DEC_IND_uprising_${t}: "Восстание коренных националистов ${nr}"`);
        lines.push(` DEC_IND_uprising_${t}_desc: "Если уже НС — пропуск. Если независима — гражданская война за НС. Если нет страны — восстание на ядрах у оккупанта. Восставшие вступают в Совет Абиа-Яла."`);
      }
    }
  }
  return lines.join("\n") + "\n";
}

function genLocEn() {
  let lines = [
    ' # --- Indigenous Awakening ---',
    ' DEC_ABYA_YALA_FACTION: "Abya Yala Council"',
    ' DEC_TURTLE_ISLAND_FACTION: "Turtle Island League"',
    ' DEC_MELANESIAN_LEAGUE_FACTION: "Melanesian League"',
    ' DEC_IND_indigenous_awakening: "Indigenous Awakening"',
    ' DEC_IND_indigenous_awakening_desc: "Indigenous nations of the Americas and Oceania raise an awakening programme. +1 NS across the list."',
    ' DEC_IND_boost_plus1_tt: "§Y+1 NS§! to all Indigenous Awakening nations."',
    ' DEC_IND_boost_plus2_tt: "§Y+2 NS§! to nations of this macro-block."',
    ' DEC_IND_boost_plus3_tt: "§Y+3 NS§! to nations of this sub-region."',
    ' DEC_IND_boost_plus4_tt: "§Y+4 NS§! to this nation."',
    ' DEC_IND_declare_council: "Declare the Abya Yala Council"',
    ' DEC_IND_declare_council_desc: "Found the alliance of indigenous nations of the Americas and Oceania."',
    ' DEC_IND_declare_council_tt: "Creates the §YAbya Yala Council§! faction."',
    ' DEC_IND_call_unity: "Call the Four Directions"',
    ' DEC_IND_call_unity_desc: "Invite all list nations with qualifying right-wing / NS ideology."',
    ' DEC_IND_call_unity_tt: "Invites eligible nations into the §YAbya Yala Council§!."',
    ' DEC_IND_call_oath: "Call to Oath"',
    ' DEC_IND_call_oath_desc: "Demand vassalage from alliance members. Refusal means war and an NS uprising."',
    ' DEC_IND_call_oath_tt: "Alliance members receive an oath event."',
    ' DEC_IND_unite_council: "Unite Abya Yala"',
    ' DEC_IND_unite_council_desc: "Merge vassals and oath-takers into a single Abya Yala state."',
    ' DEC_IND_unite_council_tt: "Annexes vassals; applies §YAbya Yala§! (ABY) cosmetic."',
    ' DEC_IND_turtle_island: "Found the Turtle Island League"',
    ' DEC_IND_turtle_island_desc: "Create the North American regional faction."',
    ' DEC_IND_turtle_island_tt: "Creates §YTurtle Island League§! and invites the northern block."',
    ' DEC_IND_melanesian_league: "Found the Melanesian League"',
    ' DEC_IND_melanesian_league_desc: "Create the Black Pacific / Oceania regional faction."',
    ' DEC_IND_melanesian_league_tt: "Creates §YMelanesian League§! and invites Oceania."',
    ' DEC_IND_uprising_already_tt: "National Socialists already rule — focus is bypassed."',
    ' DEC_IND_crusade_world: "Liberation Crusade for the World"',
    ' DEC_IND_crusade_world_desc: "All block crusades are declared. Mandate to conquer the rest of the world."',
    ' DEC_IND_crusade_world_tt: "Wargoals on all nations outside Indigenous Awakening."',
    ' ABY: "Abya Yala"',
    ' ABY_DEF: "Abya Yala"',
    ' ABY_ADJ: "Abya Yala"',
    ' DEC_TIL: "Turtle Island League"',
    ' DEC_TIL_DEF: "the Turtle Island League"',
    ' DEC_TIL_ADJ: "Turtle Island"',
    ' DEC_MEL: "Melanesian League"',
    ' DEC_MEL_DEF: "the Melanesian League"',
    ' DEC_MEL_ADJ: "Melanesian"',
    ' dec_ind.1.t: "Oath to the Abya Yala Council"',
    ' dec_ind.1.d: "The Council leader demands vassal oath. Refusal will be branded apostasy."',
    ' dec_ind.1.a: "Swear the oath"',
    ' dec_ind.1.b: "Refuse"',
    ' dec_ind.2.t: "Oath Refused"',
    ' dec_ind.2.d: "An alliance member rejected the oath. War and an NS uprising follow."',
    ' dec_ind.2.a: "So be it"',
  ];
  for (const [bid, b] of Object.entries(BLOCKS)) {
    lines.push(` DEC_IND_${bid}: "${b.title_en}"`);
    lines.push(` DEC_IND_${bid}_desc: "Macro-block: ${b.title_en}. +2 NS to block nations."`);
    lines.push(` DEC_IND_crusade_${bid}: "Liberation Crusade for ${b.title_en}"`);
    lines.push(` DEC_IND_crusade_${bid}_desc: "After all uprisings of the block — wargoals on block nations outside the alliance."`);
    lines.push(` DEC_IND_crusade_${bid}_tt: "Wargoals on nations of the §Y${b.title_en}§! macro-block."`);
    for (const [rid, r] of Object.entries(b.regions)) {
      lines.push(` DEC_IND_reg_${bid}_${rid}: "${r.title_en}"`);
      lines.push(` DEC_IND_reg_${bid}_${rid}_desc: "Sub-region: ${r.title_en}. +3 NS."`);
      for (const t of r.tags) {
        const ne = NAMES_EN[t] || t;
        lines.push(` DEC_IND_country_${t}: "${ne}"`);
        lines.push(` DEC_IND_country_${t}_desc: "+4 NS to this nation (${t})."`);
        lines.push(` DEC_IND_uprising_${t}: "Indigenous Nationalist Uprising in ${ne}"`);
        lines.push(` DEC_IND_uprising_${t}_desc: "If NS already rules — bypass. If independent — civil war for NS. If missing — uprising on cores vs occupier. Rebels join the Abya Yala Council."`);
      }
    }
  }
  return lines.join("\n") + "\n";
}

function patchLoc(file, markers, generated) {
  let text = fs.readFileSync(file, "utf8");
  let cut = -1;
  for (const m of markers) {
    const i = text.indexOf(m);
    if (i >= 0) { cut = i; break; }
  }
  if (cut >= 0) text = text.slice(0, cut).replace(/\s+$/, "") + "\n\n" + generated;
  else text = text.replace(/\s+$/, "") + "\n\n" + generated;
  fs.writeFileSync(file, text, "utf8");
}

function main() {
  fs.writeFileSync(path.join(ROOT, "common/scripted_triggers/DEC_indigenous_awakening_triggers.txt"), genTriggers(), "utf8");
  fs.writeFileSync(path.join(ROOT, "common/scripted_effects/DEC_indigenous_awakening.txt"), genEffects(), "utf8");
  fs.writeFileSync(path.join(ROOT, "common/national_focus/DEC_indigenous_awakening_shared.txt"), genFocuses(), "utf8");
  patchLoc(path.join(ROOT, "localisation/russian/DEC_l_russian.yml"), [" # --- Коренное пробуждение"], genLocRu());
  let ru = fs.readFileSync(path.join(ROOT, "localisation/russian/DEC_l_russian.yml"), "utf8");
  if (!ru.includes("DEC_IND_indigenous_awakening")) {
    fs.writeFileSync(path.join(ROOT, "localisation/russian/DEC_l_russian.yml"), ru.replace(/\s+$/, "") + "\n\n" + genLocRu(), "utf8");
  }
  let en = fs.readFileSync(path.join(ROOT, "localisation/english/DEC_l_english.yml"), "utf8");
  if (en.includes(" # --- Indigenous Awakening")) {
    patchLoc(path.join(ROOT, "localisation/english/DEC_l_english.yml"), [" # --- Indigenous Awakening"], genLocEn());
  } else {
    fs.writeFileSync(path.join(ROOT, "localisation/english/DEC_l_english.yml"), en.replace(/\s+$/, "") + "\n\n" + genLocEn(), "utf8");
  }
  console.log("tags", allTags().length);
  console.log("focus KB", Math.round(fs.statSync(path.join(ROOT, "common/national_focus/DEC_indigenous_awakening_shared.txt")).size / 1024));
}

main();
