/* Generate Asian Awakening (Азиатское пробуждение) — East + SE Asia (no India/Hindu) */
const fs = require("fs");
const path = require("path");
const ROOT = path.resolve(__dirname, "..");

const BLOCKS = {
  china: {
    title_ru: "Китайский мир", title_en: "Sinosphere", x: -20,
    regions: {
      core: { title_ru: "Срединная держава", title_en: "Middle Kingdom", tags: ["CHI", "TAI"] },
      coasts: { title_ru: "Побережье", title_en: "Coastal Cities", tags: ["HKG", "MAC"] },
      highlands: { title_ru: "Высокогорье", title_en: "Highlands", tags: ["TIB", "MON", "OMG"] },
    },
  },
  northeast: {
    title_ru: "Северо-Восточная Азия", title_en: "Northeast Asia", x: 0,
    regions: {
      korea: { title_ru: "Корея", title_en: "Korea", tags: ["KOR", "NKO"] },
      japan: { title_ru: "Япония", title_en: "Japan", tags: ["JAP", "RYU"] },
    },
  },
  mainland: {
    title_ru: "Материковая ЮВА", title_en: "Mainland SEA", x: 16,
    regions: {
      indochina: { title_ru: "Индокитай", title_en: "Indochina", tags: ["VIE", "LAO", "CBD"] },
      theravada: { title_ru: "Тхеравада", title_en: "Theravada Belt", tags: ["SIA", "BRM"] },
    },
  },
  maritime: {
    title_ru: "Морская ЮВА", title_en: "Maritime SEA", x: 32,
    regions: {
      malay: { title_ru: "Малайский мир", title_en: "Malay World", tags: ["MAY", "SIN", "BRU", "IND"] },
      philippines: { title_ru: "Филиппины", title_en: "Philippines", tags: ["PHI"] },
    },
  },
};

const NAMES_RU = {
  CHI: "Китая", TAI: "Тайваня", HKG: "Гонконга", MAC: "Макао", TIB: "Тибета", MON: "Монголии", OMG: "Внешней Монголии",
  KOR: "Южной Кореи", NKO: "Северной Кореи", JAP: "Японии", RYU: "Рюкю",
  VIE: "Вьетнама", LAO: "Лаоса", CBD: "Камбоджи", SIA: "Таиланда", BRM: "Мьянмы",
  MAY: "Малайзии", SIN: "Сингапура", BRU: "Брунея", IND: "Индонезии", PHI: "Филиппин",
};
const NAMES_EN = {
  CHI: "China", TAI: "Taiwan", HKG: "Hong Kong", MAC: "Macau", TIB: "Tibet", MON: "Mongolia", OMG: "Outer Mongolia",
  KOR: "South Korea", NKO: "North Korea", JAP: "Japan", RYU: "Ryukyu",
  VIE: "Vietnam", LAO: "Laos", CBD: "Cambodia", SIA: "Thailand", BRM: "Myanmar",
  MAY: "Malaysia", SIN: "Singapore", BRU: "Brunei", IND: "Indonesia", PHI: "the Philippines",
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
# Asian Awakening / Азиатское пробуждение
# East + Southeast Asia (India reserved for Hindu)
############################################

DEC_has_asian_right_ideology = {
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

DEC_is_asian_nation = {
	OR = {
`;
  for (const t of allTags()) p += `\t\toriginal_tag = ${t}\n\t\ttag = ${t}\n`;
  p += `\t\thas_cosmetic_tag = ASN
\t\thas_cosmetic_tag = DEC_GEA
\t\thas_cosmetic_tag = DEC_SEA
\t}
}

`;
  for (const [bid, b] of Object.entries(BLOCKS)) {
    const tagsB = [];
    for (const r of Object.values(b.regions)) tagsB.push(...r.tags);
    p += `DEC_ASI_is_${bid} = {\n${triggerOrTags(tagsB)}\n}\n\n`;
    for (const [rid, r] of Object.entries(b.regions)) {
      p += `DEC_ASI_is_${bid}_${rid} = {\n${triggerOrTags(r.tags)}\n}\n\n`;
    }
    const ups = [];
    for (const r of Object.values(b.regions)) for (const t of r.tags) ups.push(`has_completed_focus = DEC_ASI_uprising_${t}`);
    p += `DEC_ASI_${bid}_block_complete = {
	OR = {
		has_country_flag = DEC_ASI_${bid}_block_done
		AND = {
${ups.map(u => `\t\t\t${u}`).join("\n")}
		}
	}
}

`;
  }
  p += `DEC_can_access_asian_awakening = {
	DEC_is_asian_nation = yes
	DEC_has_asian_right_ideology = yes
	NOT = {
		OR = {
			has_completed_focus = DEC_WHT_white_revival
			has_completed_focus = DEC_BAW_black_awakening
			has_completed_focus = DEC_IND_indigenous_awakening
			has_completed_focus = DEC_HND_hindu_awakening
			has_completed_focus = DEC_CAL_world_caliphate
		}
	}
}

DEC_is_asian_invitee = {
	DEC_is_asian_nation = yes
	OR = {
		DEC_has_ns = yes
		DEC_has_asian_right_ideology = yes
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
  return `DEC_ASI_uprising_${tag} = {
	log = "DEC_ASI: NS uprising ${tag}"
	if = {
		limit = { country_exists = ${tag} ${tag} = { DEC_has_ns = yes } }
		custom_effect_tooltip = DEC_ASI_uprising_already_tt
	}
	else_if = {
		limit = { OR = { tag = ${tag} original_tag = ${tag} } }
		DEC_ASI_ns_conversion_setup = yes
		custom_effect_tooltip = DEC_ASI_self_convert_tt
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
			DEC_ASI_ns_conversion_setup = yes
			if = { limit = { ROOT = { is_in_faction = yes } } ROOT = { add_to_faction = PREV } set_country_flag = DEC_joined_named_faction }
		}
	}
	else_if = {
		limit = { country_exists = ${tag} }
		${tag} = {
			if = {
				limit = { is_subject = yes }
				OVERLORD = { save_event_target_as = DEC_asi_former_overlord }
				OVERLORD = { set_autonomy = { target = PREV autonomy_state = autonomy_free } }
			}
			DEC_ASI_ns_conversion_setup = yes
		}
		if = { limit = { ROOT = { is_in_faction = yes } } ROOT = { add_to_faction = ${tag} } }
		${tag} = {
			if = {
				limit = { has_event_target = DEC_asi_former_overlord }
				declare_war_on = { target = event_target:DEC_asi_former_overlord type = annex_everything }
			}
		}
	}
	else = {
		random_state = {
			limit = { is_core_of = ${tag} }
			OWNER = { save_event_target_as = DEC_asi_occ }
			OWNER = { release = ${tag} }
		}
		if = {
			limit = { country_exists = ${tag} }
			${tag} = { DEC_ASI_ns_conversion_setup = yes }
			if = { limit = { ROOT = { is_in_faction = yes } } ROOT = { add_to_faction = ${tag} } }
			${tag} = {
				if = {
					limit = { has_event_target = DEC_asi_occ }
					declare_war_on = { target = event_target:DEC_asi_occ type = annex_everything }
				}
			}
		}
	}
}
`;
}


function genEffects() {
  let out = `############################################
# Asian Awakening scripted effects
############################################

DEC_ASI_add_ns_amt = {
	if = { limit = { NOT = { has_variable = party_pop_array^21 } } set_variable = { party_pop_array^21 = 0 } }
	add_to_variable = { party_pop_array^21 = DEC_asi_ns_amt }
	clamp_variable = { var = party_pop_array^21 min = 0 max = 1 }
	add_popularity = { ideology = nationalist popularity = DEC_asi_ns_amt }
	recalculate_party = yes
}

DEC_ASI_ns_conversion_setup = {
	set_variable = { party_pop_array^21 = 0.55 }
	add_popularity = { ideology = nationalist popularity = 0.55 }
	set_variable = { ruling_party = 21 }
	recalculate_party = yes
	set_politics = { ruling_party = nationalist elections_allowed = no }
	set_country_flag = DEC_rebel_nation
}

DEC_ASI_boost_all = {
	every_country = {
		limit = { DEC_is_asian_nation = yes exists = yes }
		set_temp_variable = { DEC_asi_ns_amt = ROOT.DEC_asi_ns_amt }
		DEC_ASI_add_ns_amt = yes
	}
}
`;
  for (const bid of Object.keys(BLOCKS)) {
    out += `DEC_ASI_boost_${bid} = {
	every_country = { limit = { DEC_ASI_is_${bid} = yes exists = yes }
		set_temp_variable = { DEC_asi_ns_amt = ROOT.DEC_asi_ns_amt }
		DEC_ASI_add_ns_amt = yes
	}
}
`;
    for (const rid of Object.keys(BLOCKS[bid].regions)) {
      out += `DEC_ASI_boost_${bid}_${rid} = {
	every_country = { limit = { DEC_ASI_is_${bid}_${rid} = yes exists = yes }
		set_temp_variable = { DEC_asi_ns_amt = ROOT.DEC_asi_ns_amt }
		DEC_ASI_add_ns_amt = yes
	}
}
`;
    }
  }
  for (const t of allTags()) {
    out += `DEC_ASI_boost_country_${t} = {
	if = { limit = { country_exists = ${t} }
		${t} = { set_temp_variable = { DEC_asi_ns_amt = ROOT.DEC_asi_ns_amt } DEC_ASI_add_ns_amt = yes }
	}
}
`;
    out += uprisingEffect(t);
  }
  out += `
DEC_create_asian_sphere = {
	DEC_mark_named_alliance_member = yes
	if = { limit = { is_in_faction = yes } leave_faction = yes }
	set_rule = { can_create_factions = yes }
	create_faction_from_template = faction_template_dec_asian_sphere
	set_global_flag = DEC_ASI_sphere_formed
}

DEC_invite_asian_sphere_members = {
	every_other_country = {
		limit = { DEC_is_asian_invitee = yes NOT = { is_in_faction_with = ROOT } }
		set_country_flag = DEC_joined_named_faction
		if = { limit = { is_in_faction = yes } leave_faction = yes }
		ROOT = { add_to_faction = PREV }
	}
}

DEC_ASI_create_greater_east_asia = {
	DEC_mark_named_alliance_member = yes
	if = { limit = { is_in_faction = yes } leave_faction = yes }
	set_rule = { can_create_factions = yes }
	create_faction_from_template = faction_template_dec_greater_east_asia
	set_cosmetic_tag = DEC_GEA
	set_global_flag = DEC_ASI_gea
	every_other_country = {
		limit = {
			OR = { DEC_ASI_is_china = yes DEC_ASI_is_northeast = yes }
			DEC_is_asian_invitee = yes
			NOT = { tag = ROOT }
		}
		set_country_flag = DEC_joined_named_faction
		if = { limit = { is_in_faction = yes } leave_faction = yes }
		ROOT = { add_to_faction = PREV }
	}
}

DEC_ASI_create_asean_revival = {
	DEC_mark_named_alliance_member = yes
	if = { limit = { is_in_faction = yes } leave_faction = yes }
	set_rule = { can_create_factions = yes }
	create_faction_from_template = faction_template_dec_asean_revival
	set_cosmetic_tag = DEC_SEA
	set_global_flag = DEC_ASI_sea
	every_other_country = {
		limit = {
			OR = { DEC_ASI_is_mainland = yes DEC_ASI_is_maritime = yes }
			DEC_is_asian_invitee = yes
			NOT = { tag = ROOT }
		}
		set_country_flag = DEC_joined_named_faction
		if = { limit = { is_in_faction = yes } leave_faction = yes }
		ROOT = { add_to_faction = PREV }
	}
}

DEC_ASI_oath_start = {
	set_country_flag = DEC_ASI_oath_caller
	save_global_event_target_as = DEC_asi_overlord
	every_other_country = {
		limit = { is_in_faction_with = ROOT is_subject = no NOT = { tag = ROOT } }
		country_event = { id = dec_asi.1 hours = 8 }
	}
}

DEC_ASI_unite_sphere = {
	every_other_country = {
		limit = { OR = { is_subject_of = ROOT has_country_flag = DEC_ASI_oath_accepted } }
		every_owned_state = { add_core_of = ROOT }
		ROOT = { annex_country = { target = PREV transfer_troops = yes } }
	}
	set_cosmetic_tag = ASN
	set_global_flag = DEC_ASI_united
	custom_effect_tooltip = DEC_ASI_unite_sphere_tt
}
`;
  for (const bid of Object.keys(BLOCKS)) {
    out += `DEC_ASI_wargoals_${bid} = {
	every_country = {
		limit = {
			exists = yes DEC_ASI_is_${bid} = yes
			NOT = { tag = ROOT } NOT = { is_in_faction_with = ROOT } NOT = { is_subject_of = ROOT }
		}
		ROOT = { create_wargoal = { type = annex_everything target = PREV } }
	}
	set_country_flag = DEC_ASI_${bid}_block_done
}
`;
  }
  out += `DEC_ASI_wargoals_world = {
	every_country = {
		limit = {
			exists = yes NOT = { tag = ROOT } NOT = { is_in_faction_with = ROOT }
			NOT = { is_subject_of = ROOT } NOT = { DEC_is_asian_nation = yes }
		}
		ROOT = { create_wargoal = { type = annex_everything target = PREV } }
	}
	set_global_flag = DEC_ASI_world_crusade
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
	relative_position_id = DEC_ASI_asian_awakening
	x = ${x}
	y = ${y}
	cost = ${cost}
${pr}${byp}
	available = { ${available || "DEC_can_access_asian_awakening = yes"} }
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
# Shared: Asian Awakening — Азиатское пробуждение
############################################

shared_focus = {
	id = DEC_ASI_asian_awakening
	icon = Ultranationalism
	x = 280
	y = 0
	cost = 5
	allow_branch = { DEC_can_access_asian_awakening = yes }
	search_filters = { FOCUS_FILTER_POLITICAL FOCUS_FILTER_DIPLOMACY }
	available = { DEC_can_access_asian_awakening = yes }
	completion_reward = {
		log = "[GetDateText]: [Root.GetName]: Focus DEC_ASI_asian_awakening"
		set_variable = { DEC_asi_ns_amt = 0.10 }
		DEC_ASI_boost_all = yes
		add_political_power = 50
		custom_effect_tooltip = DEC_ASI_boost_plus1_tt
	}
	ai_will_do = { base = 40 }
}
`;
  lines += focusBlock({
    id: "DEC_ASI_declare_sphere", icon: "alliance", x: -28, y: 1, cost: 8,
    prereq: ["DEC_ASI_asian_awakening"],
    rewards: ["DEC_create_asian_sphere = yes", "custom_effect_tooltip = DEC_ASI_declare_sphere_tt"],
    available: "DEC_can_access_asian_awakening = yes\n\t\tis_subject = no\n\t\tis_in_faction = no", ai: 45,
  });
  lines += focusBlock({
    id: "DEC_ASI_call_unity", icon: "major_alliance", x: -28, y: 2, cost: 8,
    prereq: ["DEC_ASI_declare_sphere"],
    rewards: ["DEC_invite_asian_sphere_members = yes", "custom_effect_tooltip = DEC_ASI_call_unity_tt"],
    available: "DEC_can_access_asian_awakening = yes\n\t\tis_faction_leader = yes", ai: 40,
  });
  lines += focusBlock({
    id: "DEC_ASI_call_oath", icon: "national_unity", x: -28, y: 3, cost: 10,
    prereq: ["DEC_ASI_call_unity"],
    rewards: ["DEC_ASI_oath_start = yes", "custom_effect_tooltip = DEC_ASI_call_oath_tt"],
    available: "DEC_can_access_asian_awakening = yes\n\t\tis_faction_leader = yes", ai: 35,
  });
  lines += focusBlock({
    id: "DEC_ASI_unite_sphere", icon: "annex_country", x: -28, y: 4, cost: 12,
    prereq: ["DEC_ASI_call_oath"],
    rewards: ["DEC_ASI_unite_sphere = yes"],
    available: "DEC_can_access_asian_awakening = yes\n\t\tis_faction_leader = yes\n\t\tany_subject_country = { always = yes }", ai: 30,
  });

  lines += focusBlock({
    id: "DEC_ASI_greater_east_asia", icon: "major_alliance", x: -10, y: 1, cost: 8,
    prereq: ["DEC_ASI_china"],
    rewards: ["DEC_ASI_create_greater_east_asia = yes", "custom_effect_tooltip = DEC_ASI_gea_tt"],
    available: "DEC_can_access_asian_awakening = yes\n\t\tis_subject = no", ai: 40,
  });
  lines += focusBlock({
    id: "DEC_ASI_asean_revival", icon: "major_alliance", x: 24, y: 1, cost: 8,
    prereq: ["DEC_ASI_mainland"],
    rewards: ["DEC_ASI_create_asean_revival = yes", "custom_effect_tooltip = DEC_ASI_sea_tt"],
    available: "DEC_can_access_asian_awakening = yes\n\t\tis_subject = no", ai: 40,
  });

  for (const [bid, b] of Object.entries(BLOCKS)) {
    lines += focusBlock({
      id: `DEC_ASI_${bid}`, icon: "national_unity", x: b.x, y: 1, cost: 7,
      prereq: ["DEC_ASI_asian_awakening"],
      rewards: ["set_variable = { DEC_asi_ns_amt = 0.15 }", `DEC_ASI_boost_${bid} = yes`, "custom_effect_tooltip = DEC_ASI_boost_plus2_tt"],
      ai: 30,
    });
    const regs = Object.entries(b.regions);
    let cursor = b.x - Math.floor(regs.reduce((a, [, r]) => a + r.tags.length, 0) / 2);
    for (const [rid, r] of regs) {
      const rx = cursor;
      lines += focusBlock({
        id: `DEC_ASI_reg_${bid}_${rid}`, icon: "national_unity", x: rx, y: 2, cost: 7,
        prereq: [`DEC_ASI_${bid}`],
        rewards: ["set_variable = { DEC_asi_ns_amt = 0.20 }", `DEC_ASI_boost_${bid}_${rid} = yes`, "custom_effect_tooltip = DEC_ASI_boost_plus3_tt"],
        ai: 25,
      });
      r.tags.forEach((tag, j) => {
        const cx = rx + j;
        lines += focusBlock({
          id: `DEC_ASI_country_${tag}`, icon: "nationalist_administration", x: cx, y: 3, cost: 6,
          prereq: [`DEC_ASI_reg_${bid}_${rid}`],
          rewards: ["set_variable = { DEC_asi_ns_amt = 0.25 }", `DEC_ASI_boost_country_${tag} = yes`, "custom_effect_tooltip = DEC_ASI_boost_plus4_tt"],
          ai: 15,
        });
        lines += focusBlock({
          id: `DEC_ASI_uprising_${tag}`, icon: "generic_fascist_uprising", x: cx, y: 4, cost: 8,
          prereq: [`DEC_ASI_country_${tag}`],
          rewards: [`DEC_ASI_uprising_${tag} = yes`],
          bypass: `country_exists = ${tag}\n\t\t${tag} = { DEC_has_ns = yes }`,
          ai: 12,
        });
      });
      cursor += r.tags.length + 1;
    }
    const ups = [];
    for (const r of Object.values(b.regions)) for (const t of r.tags) ups.push(`DEC_ASI_uprising_${t}`);
    const prereqLines = ups.map(u => `\tprerequisite = { focus = ${u} }`).join("\n");
    lines += `
shared_focus = {
	id = DEC_ASI_crusade_${bid}
	icon = war
	relative_position_id = DEC_ASI_asian_awakening
	x = ${b.x}
	y = 5
	cost = 10
${prereqLines}
	available = { DEC_can_access_asian_awakening = yes }
	search_filters = { FOCUS_FILTER_WAR_SUPPORT FOCUS_FILTER_ANNEXATION }
	completion_reward = {
		log = "[GetDateText]: [Root.GetName]: Focus DEC_ASI_crusade_${bid}"
		DEC_ASI_wargoals_${bid} = yes
		custom_effect_tooltip = DEC_ASI_crusade_${bid}_tt
	}
	ai_will_do = { base = 35 }
}
`;
  }
  const crusadePrereqs = Object.keys(BLOCKS).map(bid => `\tprerequisite = { focus = DEC_ASI_crusade_${bid} }`).join("\n");
  lines += `
shared_focus = {
	id = DEC_ASI_crusade_world
	icon = annex_country
	relative_position_id = DEC_ASI_asian_awakening
	x = 8
	y = 6
	cost = 15
${crusadePrereqs}
	available = { DEC_can_access_asian_awakening = yes }
	search_filters = { FOCUS_FILTER_WAR_SUPPORT FOCUS_FILTER_ANNEXATION }
	completion_reward = {
		log = "[GetDateText]: [Root.GetName]: Focus DEC_ASI_crusade_world"
		DEC_ASI_wargoals_world = yes
		custom_effect_tooltip = DEC_ASI_crusade_world_tt
	}
	ai_will_do = { base = 50 }
}
`;
  return lines;
}

function genLocRu() {
  let lines = [
    ' # --- Азиатское пробуждение ---',
    ' DEC_ASIAN_SPHERE_FACTION: "Азиатская сфера"',
    ' DEC_GREATER_EAST_ASIA_FACTION: "Великая Восточная Азия"',
    ' DEC_ASEAN_REVIVAL_FACTION: "Возрождённый АСЕАН"',
    ' DEC_ASI_asian_awakening: "Азиатское пробуждение"',
    ' DEC_ASI_asian_awakening_desc: "Нации Восточной и Юго-Восточной Азии поднимают программу пробуждения. +1 НС всем странам списка."',
    ' DEC_ASI_boost_plus1_tt: "§Y+1 НС§! всем странам Азиатского пробуждения."',
    ' DEC_ASI_boost_plus2_tt: "§Y+2 НС§! странам этого макроблока."',
    ' DEC_ASI_boost_plus3_tt: "§Y+3 НС§! странам субрегиона."',
    ' DEC_ASI_boost_plus4_tt: "§Y+4 НС§! этой стране."',
    ' DEC_ASI_declare_sphere: "Объявить Азиатскую сферу"',
    ' DEC_ASI_declare_sphere_desc: "Создать альянс азиатских наций."',
    ' DEC_ASI_declare_sphere_tt: "Создаёт фракцию §YАзиатская сфера§!."',
    ' DEC_ASI_call_unity: "Призвать к сплочению"',
    ' DEC_ASI_call_unity_desc: "Пригласить в альянс все страны списка с подходящей правой / НС идеологией."',
    ' DEC_ASI_call_unity_tt: "Приглашает подходящие страны в §YАзиатскую сферу§!."',
    ' DEC_ASI_call_oath: "Призвать к присяге"',
    ' DEC_ASI_call_oath_desc: "Потребовать вассалитета от членов альянса. Отказ — война и восстание НС."',
    ' DEC_ASI_call_oath_tt: "Члены альянса получают ивент присяги."',
    ' DEC_ASI_unite_sphere: "Объединить Азиатскую сферу"',
    ' DEC_ASI_unite_sphere_desc: "Слить вассалов и присягнувших в единое азиатское государство."',
    ' DEC_ASI_unite_sphere_tt: "Аннексия вассалов; косметика §YАзиатская сфера§! (ASN)."',
    ' DEC_ASI_greater_east_asia: "Основать Великую Восточную Азию"',
    ' DEC_ASI_greater_east_asia_desc: "Региональная фракция Китая, Кореи и Японии."',
    ' DEC_ASI_gea_tt: "Создаёт §YВеликую Восточную Азию§! и приглашает северо-восток."',
    ' DEC_ASI_asean_revival: "Возродить АСЕАН"',
    ' DEC_ASI_asean_revival_desc: "Региональная фракция Юго-Восточной Азии."',
    ' DEC_ASI_sea_tt: "Создаёт §YВозрождённый АСЕАН§! и приглашает ЮВА."',
    ' DEC_ASI_uprising_already_tt: "В стране уже у власти §Yнационал-социалисты§! — фокус пропускается."',
    ' DEC_ASI_crusade_world: "Освободительный поход по Миру"',
    ' DEC_ASI_crusade_world_desc: "Все блоковые походы объявлены. Мандат на захват остального мира."',
    ' DEC_ASI_crusade_world_tt: "Казус белли на все страны вне Азиатского пробуждения."',
    ' ASN: "Азиатская сфера"',
    ' ASN_DEF: "Азиатская сфера"',
    ' ASN_ADJ: "Азиатск"',
    ' DEC_GEA: "Великая Восточная Азия"',
    ' DEC_GEA_DEF: "Великая Восточная Азия"',
    ' DEC_GEA_ADJ: "Восточноазиатск"',
    ' DEC_SEA: "Возрождённый АСЕАН"',
    ' DEC_SEA_DEF: "Возрождённый АСЕАН"',
    ' DEC_SEA_ADJ: "Асеановск"',
    ' DEC_ASI_local_council: "Местный совет"',
    ' DEC_ASI_local_council_desc: "Укрепить местную власть азиатского пробуждения."',
    ' dec_asi.1.t: "Присяга Азиатской сфере"',
    ' dec_asi.1.d: "Лидер Сферы требует вассальной присяги. Отказ будет объявлен отступничеством."',
    ' dec_asi.1.a: "Присягнуть"',
    ' dec_asi.1.b: "Отказать"',
    ' dec_asi.2.t: "Отказ от присяги"',
    ' dec_asi.2.d: "Член альянса отверг присягу. Война и восстание НС неизбежны."',
    ' dec_asi.2.a: "Так им и надо"',
  ];
  for (const [bid, b] of Object.entries(BLOCKS)) {
    lines.push(` DEC_ASI_${bid}: "${b.title_ru}"`);
    lines.push(` DEC_ASI_${bid}_desc: "Макроблок: ${b.title_ru}. +2 НС странам блока."`);
    lines.push(` DEC_ASI_crusade_${bid}: "Освободительный поход по: ${b.title_ru}"`);
    lines.push(` DEC_ASI_crusade_${bid}_desc: "После всех восстаний блока — казус белли на страны блока вне альянса."`);
    lines.push(` DEC_ASI_crusade_${bid}_tt: "Казус белли на страны макроблока §Y${b.title_ru}§!."`);
    for (const [rid, r] of Object.entries(b.regions)) {
      lines.push(` DEC_ASI_reg_${bid}_${rid}: "${r.title_ru}"`);
      lines.push(` DEC_ASI_reg_${bid}_${rid}_desc: "Субрегион: ${r.title_ru}. +3 НС."`);
      for (const t of r.tags) {
        const nr = NAMES_RU[t] || t;
        lines.push(` DEC_ASI_country_${t}: "${nr}"`);
        lines.push(` DEC_ASI_country_${t}_desc: "+4 НС стране (${t})."`);
        lines.push(` DEC_ASI_uprising_${t}: "Восстание азиатских националистов ${nr}"`);
        lines.push(` DEC_ASI_uprising_${t}_desc: "Если уже НС — пропуск. Если независима — гражданская война за НС. Если нет страны — восстание на ядрах у оккупанта. Восставшие вступают в Азиатскую сферу."`);
      }
    }
  }
  return lines.join("\n") + "\n";
}

function genLocEn() {
  let lines = [
    ' # --- Asian Awakening ---',
    ' DEC_ASIAN_SPHERE_FACTION: "Asian Sphere"',
    ' DEC_GREATER_EAST_ASIA_FACTION: "Greater East Asia"',
    ' DEC_ASEAN_REVIVAL_FACTION: "ASEAN Revival"',
    ' DEC_ASI_asian_awakening: "Asian Awakening"',
    ' DEC_ASI_asian_awakening_desc: "Nations of East and Southeast Asia raise an awakening programme. +1 NS across the list."',
    ' DEC_ASI_boost_plus1_tt: "§Y+1 NS§! to all Asian Awakening nations."',
    ' DEC_ASI_boost_plus2_tt: "§Y+2 NS§! to nations of this macro-block."',
    ' DEC_ASI_boost_plus3_tt: "§Y+3 NS§! to nations of this sub-region."',
    ' DEC_ASI_boost_plus4_tt: "§Y+4 NS§! to this nation."',
    ' DEC_ASI_declare_sphere: "Declare the Asian Sphere"',
    ' DEC_ASI_declare_sphere_desc: "Found the alliance of Asian nations."',
    ' DEC_ASI_declare_sphere_tt: "Creates the §YAsian Sphere§! faction."',
    ' DEC_ASI_call_unity: "Call to Unity"',
    ' DEC_ASI_call_unity_desc: "Invite all list nations with qualifying right-wing / NS ideology."',
    ' DEC_ASI_call_unity_tt: "Invites eligible nations into the §YAsian Sphere§!."',
    ' DEC_ASI_call_oath: "Call to Oath"',
    ' DEC_ASI_call_oath_desc: "Demand vassalage from alliance members. Refusal means war and an NS uprising."',
    ' DEC_ASI_call_oath_tt: "Alliance members receive an oath event."',
    ' DEC_ASI_unite_sphere: "Unite the Asian Sphere"',
    ' DEC_ASI_unite_sphere_desc: "Merge vassals and oath-takers into a single Asian state."',
    ' DEC_ASI_unite_sphere_tt: "Annexes vassals; applies §YAsian Sphere§! (ASN) cosmetic."',
    ' DEC_ASI_greater_east_asia: "Found Greater East Asia"',
    ' DEC_ASI_greater_east_asia_desc: "Regional faction for China, Korea and Japan."',
    ' DEC_ASI_gea_tt: "Creates §YGreater East Asia§! and invites the northeast."',
    ' DEC_ASI_asean_revival: "Revive ASEAN"',
    ' DEC_ASI_asean_revival_desc: "Regional faction for Southeast Asia."',
    ' DEC_ASI_sea_tt: "Creates §YASEAN Revival§! and invites SEA."',
    ' DEC_ASI_uprising_already_tt: "National Socialists already rule — focus is bypassed."',
    ' DEC_ASI_crusade_world: "Liberation Crusade for the World"',
    ' DEC_ASI_crusade_world_desc: "All block crusades are declared. Mandate to conquer the rest of the world."',
    ' DEC_ASI_crusade_world_tt: "Wargoals on all nations outside Asian Awakening."',
    ' ASN: "Asian Sphere"',
    ' ASN_DEF: "the Asian Sphere"',
    ' ASN_ADJ: "Asian"',
    ' DEC_GEA: "Greater East Asia"',
    ' DEC_GEA_DEF: "Greater East Asia"',
    ' DEC_GEA_ADJ: "East Asian"',
    ' DEC_SEA: "ASEAN Revival"',
    ' DEC_SEA_DEF: "ASEAN Revival"',
    ' DEC_SEA_ADJ: "ASEAN"',
    ' DEC_ASI_local_council: "Local Council"',
    ' DEC_ASI_local_council_desc: "Strengthen local Asian Awakening authority."',
    ' dec_asi.1.t: "Oath to the Asian Sphere"',
    ' dec_asi.1.d: "The Sphere leader demands vassal oath. Refusal will be branded apostasy."',
    ' dec_asi.1.a: "Swear the oath"',
    ' dec_asi.1.b: "Refuse"',
    ' dec_asi.2.t: "Oath Refused"',
    ' dec_asi.2.d: "An alliance member rejected the oath. War and an NS uprising follow."',
    ' dec_asi.2.a: "So be it"',
  ];
  for (const [bid, b] of Object.entries(BLOCKS)) {
    lines.push(` DEC_ASI_${bid}: "${b.title_en}"`);
    lines.push(` DEC_ASI_${bid}_desc: "Macro-block: ${b.title_en}. +2 NS to block nations."`);
    lines.push(` DEC_ASI_crusade_${bid}: "Liberation Crusade for ${b.title_en}"`);
    lines.push(` DEC_ASI_crusade_${bid}_desc: "After all uprisings of the block — wargoals on block nations outside the alliance."`);
    lines.push(` DEC_ASI_crusade_${bid}_tt: "Wargoals on nations of the §Y${b.title_en}§! macro-block."`);
    for (const [rid, r] of Object.entries(b.regions)) {
      lines.push(` DEC_ASI_reg_${bid}_${rid}: "${r.title_en}"`);
      lines.push(` DEC_ASI_reg_${bid}_${rid}_desc: "Sub-region: ${r.title_en}. +3 NS."`);
      for (const t of r.tags) {
        const ne = NAMES_EN[t] || t;
        lines.push(` DEC_ASI_country_${t}: "${ne}"`);
        lines.push(` DEC_ASI_country_${t}_desc: "+4 NS to this nation (${t})."`);
        lines.push(` DEC_ASI_uprising_${t}: "Asian Nationalist Uprising in ${ne}"`);
        lines.push(` DEC_ASI_uprising_${t}_desc: "If NS already rules — bypass. If independent — civil war for NS. If missing — uprising on cores vs occupier. Rebels join the Asian Sphere."`);
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
  fs.writeFileSync(path.join(ROOT, "common/scripted_triggers/DEC_asian_awakening_triggers.txt"), genTriggers(), "utf8");
  fs.writeFileSync(path.join(ROOT, "common/scripted_effects/DEC_asian_awakening.txt"), genEffects(), "utf8");
  fs.writeFileSync(path.join(ROOT, "common/national_focus/DEC_asian_awakening_shared.txt"), genFocuses(), "utf8");
  patchLoc(path.join(ROOT, "localisation/russian/DEC_l_russian.yml"), [" # --- Азиатское пробуждение"], genLocRu());
  let ru = fs.readFileSync(path.join(ROOT, "localisation/russian/DEC_l_russian.yml"), "utf8");
  if (!ru.includes("DEC_ASI_asian_awakening")) {
    fs.writeFileSync(path.join(ROOT, "localisation/russian/DEC_l_russian.yml"), ru.replace(/\s+$/, "") + "\n\n" + genLocRu(), "utf8");
  }
  let en = fs.readFileSync(path.join(ROOT, "localisation/english/DEC_l_english.yml"), "utf8");
  if (en.includes(" # --- Asian Awakening")) {
    patchLoc(path.join(ROOT, "localisation/english/DEC_l_english.yml"), [" # --- Asian Awakening"], genLocEn());
  } else {
    fs.writeFileSync(path.join(ROOT, "localisation/english/DEC_l_english.yml"), en.replace(/\s+$/, "") + "\n\n" + genLocEn(), "utf8");
  }
  console.log("tags", allTags().length);
  console.log("focus KB", Math.round(fs.statSync(path.join(ROOT, "common/national_focus/DEC_asian_awakening_shared.txt")).size / 1024));
}

main();
