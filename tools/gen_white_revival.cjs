/* Generate White Revival shared focus / effects / loc from TZ */
const fs = require("fs");
const path = require("path");
const ROOT = path.resolve(__dirname, "..");

const BLOCKS = {
  europe: {
    title_ru: "Европа", title_en: "Europe", x: -20,
    regions: {
      west: { title_ru: "Западная Европа", title_en: "Western Europe", tags: ["ENG","FRA","BEL","HOL","LUX","IRE"] },
      north: { title_ru: "Северная Европа", title_en: "Northern Europe", tags: ["SWE","NRY","DEN","ICE"] },
      central: { title_ru: "Центральная Европа", title_en: "Central Europe", tags: ["GER","AUS","SWI","LIC","POL","CZE","SLO","HUN"] },
      east: { title_ru: "Восточная Европа и Балканы", title_en: "Eastern Europe and Balkans", tags: ["ITA","SPR","POR","GRE","CYP","MLT","UKR","BLR","MLV","LAT","LIT","ROM","BUL","SER","CRO","SLV","BOS","ALB","MNT","KOS","FYR","ADO","SMA","HLS"] },
      russian: { title_ru: "Русский блок", title_en: "Russian Block", tags: ["BGR","SMO","VOR","SEV","SOV","RUS","VYK","DON","KUB"] },
    },
  },
  na: {
    title_ru: "Северная Америка", title_en: "North America", x: 8,
    regions: {
      usa: { title_ru: "США", title_en: "United States", tags: ["USA"] },
      canada: { title_ru: "Канада", title_en: "Canada", tags: ["CAN"] },
    },
  },
  colonies: {
    title_ru: "Белые колонии", title_en: "White Colonies", x: 18,
    regions: {
      saf: { title_ru: "Южная Африка", title_en: "Southern Africa", tags: ["APT"] },
      rho: { title_ru: "Родезия", title_en: "Rhodesia", tags: ["RHO"] },
      cone: { title_ru: "Южный конус", title_en: "Southern Cone", tags: ["ARG","URG","CHL","BRA"] },
    },
  },
  finno: {
    title_ru: "Финно-угры", title_en: "Finno-Ugrics", x: 30,
    regions: {
      fin: { title_ru: "Финляндия", title_en: "Finland", tags: ["FIN"] },
      est: { title_ru: "Эстония", title_en: "Estonia", tags: ["EST"] },
      north_finno: { title_ru: "Северные финно-угры", title_en: "Northern Finno-Ugrics", tags: ["IGR","KAE","LAP","BJA"] },
    },
  },
  oceania: {
    title_ru: "Океания", title_en: "Oceania", x: 42,
    regions: {
      ast: { title_ru: "Австралия", title_en: "Australia", tags: ["AST"] },
      nzl: { title_ru: "Новая Зеландия", title_en: "New Zealand", tags: ["NZL"] },
    },
  },
};

const NAMES_RU = { ENG:"Великобритании",FRA:"Франции",BEL:"Бельгии",HOL:"Нидерландов",LUX:"Люксембурга",IRE:"Ирландии",SWE:"Швеции",NRY:"Норвегии",DEN:"Дании",ICE:"Исландии",GER:"Германии",AUS:"Австрии",SWI:"Швейцарии",LIC:"Лихтенштейна",POL:"Польши",CZE:"Чехии",SLO:"Словакии",HUN:"Венгрии",ITA:"Италии",SPR:"Испании",POR:"Португалии",GRE:"Греции",CYP:"Кипра",MLT:"Мальты",UKR:"Украины",BLR:"Беларуси",MLV:"Молдовы",LAT:"Латвии",LIT:"Литвы",ROM:"Румынии",BUL:"Болгарии",SER:"Сербии",CRO:"Хорватии",SLV:"Словении",BOS:"Боснии",ALB:"Албании",MNT:"Черногории",KOS:"Косово",FYR:"Северной Македонии",ADO:"Андорры",SMA:"Сан-Марино",HLS:"Ватикана",BGR:"Белгорода",SMO:"Смоленска",VOR:"Воронежа",SEV:"Северии",SOV:"России",RUS:"Локотской республики",VYK:"Верхнеяицкого Войска",DON:"Дона",KUB:"Кубани",USA:"США",CAN:"Канады",APT:"Апартеида",RHO:"Родезии",ARG:"Аргентины",URG:"Уругвая",CHL:"Чили",BRA:"Бразилии",FIN:"Финляндии",EST:"Эстонии",IGR:"Ингрии",KAE:"Карелии",LAP:"Лапландии",BJA:"Бьярмии",AST:"Австралии",NZL:"Новой Зеландии" };
const NAMES_EN = { ENG:"Britain",FRA:"France",BEL:"Belgium",HOL:"the Netherlands",LUX:"Luxembourg",IRE:"Ireland",SWE:"Sweden",NRY:"Norway",DEN:"Denmark",ICE:"Iceland",GER:"Germany",AUS:"Austria",SWI:"Switzerland",LIC:"Liechtenstein",POL:"Poland",CZE:"Czechia",SLO:"Slovakia",HUN:"Hungary",ITA:"Italy",SPR:"Spain",POR:"Portugal",GRE:"Greece",CYP:"Cyprus",MLT:"Malta",UKR:"Ukraine",BLR:"Belarus",MLV:"Moldova",LAT:"Latvia",LIT:"Lithuania",ROM:"Romania",BUL:"Bulgaria",SER:"Serbia",CRO:"Croatia",SLV:"Slovenia",BOS:"Bosnia",ALB:"Albania",MNT:"Montenegro",KOS:"Kosovo",FYR:"North Macedonia",ADO:"Andorra",SMA:"San Marino",HLS:"the Holy See",BGR:"Belgorod",SMO:"Smolensk",VOR:"Voronezh",SEV:"Severia",SOV:"Russia",RUS:"Lokot",VYK:"the Yaik Host",DON:"the Don",KUB:"Kuban",USA:"the United States",CAN:"Canada",APT:"Apartheid",RHO:"Rhodesia",ARG:"Argentina",URG:"Uruguay",CHL:"Chile",BRA:"Brazil",FIN:"Finland",EST:"Estonia",IGR:"Ingria",KAE:"Karelia",LAP:"Lapland",BJA:"Bjarmia",AST:"Australia",NZL:"New Zealand" };

function allTags() {
  const tags = [];
  for (const b of Object.values(BLOCKS)) for (const r of Object.values(b.regions)) tags.push(...r.tags);
  return tags;
}

function triggerOrTags(tags, indent = "\t\t") {
  let s = `${indent}OR = {\n`;
  for (const t of tags) s += `${indent}\toriginal_tag = ${t}\n${indent}\ttag = ${t}\n`;
  s += `${indent}}`;
  return s;
}

function genTriggers() {
  let p = `############################################
# White Revival / White Brotherhood (full TZ)
############################################

DEC_has_ns = {
	nationalist_fascist_are_in_power = yes
}

DEC_has_white_right_ideology = {
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

DEC_is_white_brotherhood_nation = {
	OR = {
`;
  for (const t of allTags()) p += `\t\toriginal_tag = ${t}\n\t\ttag = ${t}\n`;
  p += `\t\thas_cosmetic_tag = DEC_RNS
\t\thas_cosmetic_tag = DEC_RNS_imperial
\t\thas_cosmetic_tag = DEC_RNS_rdk
\t\thas_cosmetic_tag = DEC_RNS_tricolor
\t\thas_cosmetic_tag = DEC_RNS_wbw
\t\thas_cosmetic_tag = WBR
\t}
}

`;
  for (const [bid, b] of Object.entries(BLOCKS)) {
    const tagsB = [];
    for (const r of Object.values(b.regions)) tagsB.push(...r.tags);
    p += `DEC_WHT_is_${bid} = {\n${triggerOrTags(tagsB)}\n}\n\n`;
    for (const [rid, r] of Object.entries(b.regions)) {
      p += `DEC_WHT_is_${bid}_${rid} = {\n${triggerOrTags(r.tags)}\n}\n\n`;
    }
    const ups = [];
    for (const r of Object.values(b.regions)) for (const t of r.tags) ups.push(`has_completed_focus = DEC_WHT_uprising_${t}`);
    p += `DEC_WHT_${bid}_block_complete = {
	OR = {
		has_country_flag = DEC_WHT_${bid}_block_done
		AND = {
${ups.map(u => `\t\t\t${u}`).join("\n")}
		}
	}
}

`;
  }
  p += `DEC_can_access_white_revival = {
	DEC_is_white_brotherhood_nation = yes
	DEC_has_white_right_ideology = yes
}

DEC_is_white_brotherhood_invitee = {
	DEC_is_white_brotherhood_nation = yes
	OR = {
		DEC_has_ns = yes
		DEC_has_white_right_ideology = yes
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
  return `DEC_WHT_uprising_${tag} = {
	log = "DEC_WHT: NS uprising ${tag}"
	if = {
		limit = {
			country_exists = ${tag}
			${tag} = { DEC_has_ns = yes }
		}
		custom_effect_tooltip = DEC_WHT_uprising_already_tt
	}
	else_if = {
		limit = {
			country_exists = ${tag}
			${tag} = { is_subject = no }
		}
		${tag} = {
			set_variable = { party_pop_array^21 = 0.45 }
			add_popularity = { ideology = nationalist popularity = 0.45 }
			recalculate_party = yes
			start_civil_war = {
				ideology = nationalist
				size = 0.45
			}
		}
		random_country = {
			limit = {
				original_tag = ${tag}
				has_government = nationalist
				has_war_with = ${tag}
			}
			DEC_WHT_ns_conversion_setup = yes
			if = {
				limit = { ROOT = { is_in_faction = yes } }
				ROOT = { add_to_faction = PREV }
				set_country_flag = DEC_joined_named_faction
			}
		}
	}
	else_if = {
		limit = { country_exists = ${tag} }
		${tag} = {
			OVERLORD = { set_temp_variable = { DEC_wht_overlord = THIS.id } }
			DEC_WHT_ns_conversion_setup = yes
			if = { limit = { is_subject = yes } OVERLORD = { set_autonomy = { target = PREV autonomy_state = autonomy_free } } }
		}
		if = {
			limit = { ROOT = { is_in_faction = yes } }
			ROOT = { add_to_faction = ${tag} }
		}
		${tag} = {
			if = {
				limit = { has_variable = DEC_wht_overlord }
				declare_war_on = { target = var:DEC_wht_overlord type = annex_everything }
			}
		}
	}
	else = {
		random_state = {
			limit = { is_core_of = ${tag} }
			OWNER = { release = ${tag} }
		}
		if = {
			limit = { country_exists = ${tag} }
			${tag} = { DEC_WHT_ns_conversion_setup = yes }
			random_state = {
				limit = { is_core_of = ${tag} NOT = { is_owned_by = ${tag} } }
				OWNER = { set_temp_variable = { DEC_wht_occ = THIS.id } }
			}
			if = {
				limit = { ROOT = { is_in_faction = yes } }
				ROOT = { add_to_faction = ${tag} }
			}
			${tag} = {
				if = {
					limit = { has_variable = DEC_wht_occ }
					declare_war_on = { target = var:DEC_wht_occ type = annex_everything }
				}
			}
		}
	}
}
`;
}

function genEffects(restoreSnippet) {
  let out = `############################################
# White Revival scripted effects
############################################

DEC_WHT_add_ns_amt = {
	if = {
		limit = { NOT = { has_variable = party_pop_array^21 } }
		set_variable = { party_pop_array^21 = 0 }
	}
	add_to_variable = { party_pop_array^21 = DEC_wht_ns_amt }
	clamp_variable = { var = party_pop_array^21 min = 0 max = 1 }
	add_popularity = { ideology = nationalist popularity = DEC_wht_ns_amt }
	recalculate_party = yes
}

DEC_WHT_ns_conversion_setup = {
	set_variable = { party_pop_array^21 = 0.55 }
	add_popularity = { ideology = nationalist popularity = 0.55 }
	set_variable = { ruling_party = 21 }
	recalculate_party = yes
	set_politics = { ruling_party = nationalist elections_allowed = no }
	set_country_flag = DEC_rebel_nation
}

DEC_WHT_boost_all = {
	every_country = {
		limit = { DEC_is_white_brotherhood_nation = yes exists = yes }
		set_temp_variable = { DEC_wht_ns_amt = ROOT.DEC_wht_ns_amt }
		DEC_WHT_add_ns_amt = yes
	}
}
`;
  for (const bid of Object.keys(BLOCKS)) {
    out += `DEC_WHT_boost_${bid} = {
	every_country = {
		limit = { DEC_WHT_is_${bid} = yes exists = yes }
		set_temp_variable = { DEC_wht_ns_amt = ROOT.DEC_wht_ns_amt }
		DEC_WHT_add_ns_amt = yes
	}
}
`;
    for (const rid of Object.keys(BLOCKS[bid].regions)) {
      out += `DEC_WHT_boost_${bid}_${rid} = {
	every_country = {
		limit = { DEC_WHT_is_${bid}_${rid} = yes exists = yes }
		set_temp_variable = { DEC_wht_ns_amt = ROOT.DEC_wht_ns_amt }
		DEC_WHT_add_ns_amt = yes
	}
}
`;
    }
  }
  for (const t of allTags()) {
    out += `DEC_WHT_boost_country_${t} = {
	if = {
		limit = { country_exists = ${t} }
		${t} = {
			set_temp_variable = { DEC_wht_ns_amt = ROOT.DEC_wht_ns_amt }
			DEC_WHT_add_ns_amt = yes
		}
	}
}
`;
    out += uprisingEffect(t);
  }
  out += `
DEC_create_white_brotherhood = {
	DEC_mark_named_alliance_member = yes
	if = { limit = { is_in_faction = yes } leave_faction = yes }
	set_rule = { can_create_factions = yes }
	create_faction_from_template = faction_template_dec_white_brotherhood
	set_global_flag = DEC_WHT_brotherhood_formed
}

DEC_invite_white_brotherhood_members = {
	every_other_country = {
		limit = {
			DEC_is_white_brotherhood_invitee = yes
			NOT = { is_in_faction_with = ROOT }
		}
		set_country_flag = DEC_joined_named_faction
		if = { limit = { is_in_faction = yes } leave_faction = yes }
		ROOT = { add_to_faction = PREV }
	}
}

DEC_WHT_oath_start = {
	set_country_flag = DEC_WHT_oath_caller
	save_global_event_target_as = DEC_wht_overlord
	every_other_country = {
		limit = {
			is_in_faction_with = ROOT
			is_subject = no
			NOT = { tag = ROOT }
		}
		country_event = { id = dec_wht.1 hours = 8 }
	}
}

DEC_WHT_unite_brotherhood = {
	every_other_country = {
		limit = {
			OR = {
				is_subject_of = ROOT
				has_country_flag = DEC_WHT_oath_accepted
			}
		}
		every_owned_state = { add_core_of = ROOT }
		ROOT = { annex_country = { target = PREV transfer_troops = yes } }
	}
	set_cosmetic_tag = WBR
	set_global_flag = DEC_WHT_united
	custom_effect_tooltip = DEC_WHT_unite_brotherhood_tt
}
`;
  for (const bid of Object.keys(BLOCKS)) {
    out += `DEC_WHT_wargoals_${bid} = {
	every_country = {
		limit = {
			exists = yes
			DEC_WHT_is_${bid} = yes
			NOT = { tag = ROOT }
			NOT = { is_in_faction_with = ROOT }
			NOT = { is_subject_of = ROOT }
		}
		ROOT = { create_wargoal = { type = annex_everything target = PREV } }
	}
	set_country_flag = DEC_WHT_${bid}_block_done
}
`;
  }
  out += `DEC_WHT_wargoals_world = {
	every_country = {
		limit = {
			exists = yes
			NOT = { tag = ROOT }
			NOT = { is_in_faction_with = ROOT }
			NOT = { is_subject_of = ROOT }
			NOT = { DEC_is_white_brotherhood_nation = yes }
		}
		ROOT = { create_wargoal = { type = annex_everything target = PREV } }
	}
	set_global_flag = DEC_WHT_world_crusade
}
`;
  if (restoreSnippet) out += "\n" + restoreSnippet;
  return out;
}

function focusBlock({ id, icon, x, y, cost, prereq, rewards, bypass, available, ai = 20 }) {
  let byp = "";
  if (bypass) byp = `\n\tbypass = {\n\t\t${bypass}\n\t}`;
  const pr = prereq.map(p => `\tprerequisite = { focus = ${p} }`).join("\n");
  const rew = rewards.map(l => `\t\t${l}`).join("\n");
  return `
shared_focus = {
	id = ${id}
	icon = ${icon}
	relative_position_id = DEC_WHT_white_revival
	x = ${x}
	y = ${y}
	cost = ${cost}
${pr}${byp}
	available = { ${available || "DEC_can_access_white_revival = yes"} }
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
# Shared: White Revival — full TZ tree
############################################

shared_focus = {
	id = DEC_WHT_white_revival
	icon = Ultranationalism
	x = 116
	y = 0
	cost = 5
	allow_branch = { DEC_can_access_white_revival = yes }
	search_filters = { FOCUS_FILTER_POLITICAL FOCUS_FILTER_DIPLOMACY }
	available = { DEC_can_access_white_revival = yes }
	completion_reward = {
		log = "[GetDateText]: [Root.GetName]: Focus DEC_WHT_white_revival"
		set_variable = { DEC_wht_ns_amt = 0.10 }
		DEC_WHT_boost_all = yes
		add_political_power = 50
		custom_effect_tooltip = DEC_WHT_boost_plus1_tt
	}
	ai_will_do = { base = 40 }
}
`;
  lines += focusBlock({
    id: "DEC_WHT_declare_brotherhood", icon: "alliance", x: -28, y: 1, cost: 8,
    prereq: ["DEC_WHT_white_revival"],
    rewards: ["DEC_create_white_brotherhood = yes", "custom_effect_tooltip = DEC_WHT_declare_brotherhood_tt"],
    available: "DEC_can_access_white_revival = yes\n\t\tis_subject = no\n\t\tis_in_faction = no", ai: 45,
  });
  lines += focusBlock({
    id: "DEC_WHT_call_unity", icon: "major_alliance", x: -28, y: 2, cost: 8,
    prereq: ["DEC_WHT_declare_brotherhood"],
    rewards: ["DEC_invite_white_brotherhood_members = yes", "custom_effect_tooltip = DEC_WHT_call_unity_tt"],
    available: "DEC_can_access_white_revival = yes\n\t\tis_faction_leader = yes", ai: 40,
  });
  lines += focusBlock({
    id: "DEC_WHT_call_oath", icon: "national_unity", x: -28, y: 3, cost: 10,
    prereq: ["DEC_WHT_call_unity"],
    rewards: ["DEC_WHT_oath_start = yes", "custom_effect_tooltip = DEC_WHT_call_oath_tt"],
    available: "DEC_can_access_white_revival = yes\n\t\tis_faction_leader = yes", ai: 35,
  });
  lines += focusBlock({
    id: "DEC_WHT_unite_brotherhood", icon: "annex_country", x: -28, y: 4, cost: 12,
    prereq: ["DEC_WHT_call_oath"],
    rewards: ["DEC_WHT_unite_brotherhood = yes"],
    available: "DEC_can_access_white_revival = yes\n\t\tis_faction_leader = yes\n\t\tany_subject_country = { always = yes }", ai: 30,
  });

  for (const [bid, b] of Object.entries(BLOCKS)) {
    lines += focusBlock({
      id: `DEC_WHT_${bid}`, icon: "national_unity", x: b.x, y: 1, cost: 7,
      prereq: ["DEC_WHT_white_revival"],
      rewards: ["set_variable = { DEC_wht_ns_amt = 0.15 }", `DEC_WHT_boost_${bid} = yes`, "custom_effect_tooltip = DEC_WHT_boost_plus2_tt"],
      ai: 30,
    });
    const regs = Object.entries(b.regions);
    let cursor = b.x - Math.floor(regs.reduce((a, [, r]) => a + r.tags.length, 0) / 2);
    for (const [rid, r] of regs) {
      const rx = cursor;
      lines += focusBlock({
        id: `DEC_WHT_reg_${bid}_${rid}`, icon: "national_unity", x: rx, y: 2, cost: 7,
        prereq: [`DEC_WHT_${bid}`],
        rewards: ["set_variable = { DEC_wht_ns_amt = 0.20 }", `DEC_WHT_boost_${bid}_${rid} = yes`, "custom_effect_tooltip = DEC_WHT_boost_plus3_tt"],
        ai: 25,
      });
      r.tags.forEach((tag, j) => {
        const cx = rx + j;
        lines += focusBlock({
          id: `DEC_WHT_country_${tag}`, icon: "nationalist_administration", x: cx, y: 3, cost: 6,
          prereq: [`DEC_WHT_reg_${bid}_${rid}`],
          rewards: ["set_variable = { DEC_wht_ns_amt = 0.25 }", `DEC_WHT_boost_country_${tag} = yes`, "custom_effect_tooltip = DEC_WHT_boost_plus4_tt"],
          ai: 15,
        });
        lines += focusBlock({
          id: `DEC_WHT_uprising_${tag}`, icon: "generic_fascist_uprising", x: cx, y: 4, cost: 8,
          prereq: [`DEC_WHT_country_${tag}`],
          rewards: [`DEC_WHT_uprising_${tag} = yes`],
          bypass: `country_exists = ${tag}\n\t\t${tag} = { DEC_has_ns = yes }`,
          ai: 12,
        });
      });
      cursor += r.tags.length + 1;
    }
    const ups = [];
    for (const r of Object.values(b.regions)) for (const t of r.tags) ups.push(`DEC_WHT_uprising_${t}`);
    const prereqLines = ups.map(u => `\tprerequisite = { focus = ${u} }`).join("\n");
    lines += `
shared_focus = {
	id = DEC_WHT_crusade_${bid}
	icon = war
	relative_position_id = DEC_WHT_white_revival
	x = ${b.x}
	y = 5
	cost = 10
${prereqLines}
	available = {
		DEC_can_access_white_revival = yes
	}
	search_filters = { FOCUS_FILTER_WAR_SUPPORT FOCUS_FILTER_ANNEXATION }
	completion_reward = {
		log = "[GetDateText]: [Root.GetName]: Focus DEC_WHT_crusade_${bid}"
		DEC_WHT_wargoals_${bid} = yes
		custom_effect_tooltip = DEC_WHT_crusade_${bid}_tt
	}
	ai_will_do = { base = 35 }
}
`;
  }
  const crusadePrereqs = Object.keys(BLOCKS).map(bid => `\tprerequisite = { focus = DEC_WHT_crusade_${bid} }`).join("\n");
  lines += `
shared_focus = {
	id = DEC_WHT_crusade_world
	icon = annex_country
	relative_position_id = DEC_WHT_white_revival
	x = 8
	y = 6
	cost = 15
${crusadePrereqs}
	available = { DEC_can_access_white_revival = yes }
	search_filters = { FOCUS_FILTER_WAR_SUPPORT FOCUS_FILTER_ANNEXATION }
	completion_reward = {
		log = "[GetDateText]: [Root.GetName]: Focus DEC_WHT_crusade_world"
		DEC_WHT_wargoals_world = yes
		custom_effect_tooltip = DEC_WHT_crusade_world_tt
	}
	ai_will_do = { base = 50 }
}
`;
  return lines;
}

function genLocRu() {
  let lines = [
    ' # --- Белое возрождение (full) ---',
    ' DEC_WHITE_BROTHERHOOD_FACTION: "Белое Братство"',
    ' DEC_WHT_white_revival: "Белое пробуждение"',
    ' DEC_WHT_white_revival_desc: "Правые и национал-социалисты белых стран поднимают программу возрождения. +1 к НС во всех странах списка."',
    ' DEC_WHT_boost_plus1_tt: "§Y+1 НС§! всем странам Белого Братства."',
    ' DEC_WHT_boost_plus2_tt: "§Y+2 НС§! странам этого макроблока."',
    ' DEC_WHT_boost_plus3_tt: "§Y+3 НС§! странам субрегиона."',
    ' DEC_WHT_boost_plus4_tt: "§Y+4 НС§! этой стране."',
    ' DEC_WHT_declare_brotherhood: "Объявить Белое Братство"',
    ' DEC_WHT_declare_brotherhood_desc: "Создать альянс Белое Братство."',
    ' DEC_WHT_declare_brotherhood_tt: "Создаёт фракцию §YБелое Братство§!."',
    ' DEC_WHT_call_unity: "Призвать к сплочению"',
    ' DEC_WHT_call_unity_desc: "Пригласить в альянс все страны списка с подходящей правой / НС идеологией."',
    ' DEC_WHT_call_unity_tt: "Приглашает подходящие страны в §YБелое Братство§!."',
    ' DEC_WHT_call_oath: "Призвать к присяге"',
    ' DEC_WHT_call_oath_desc: "Потребовать вассалитета от членов альянса. Отказ — война и восстание НС."',
    ' DEC_WHT_call_oath_tt: "Члены альянса получают ивент присяги."',
    ' DEC_WHT_unite_brotherhood: "Объединить Братство"',
    ' DEC_WHT_unite_brotherhood_desc: "Слить вассалов и присягнувших в единое государство Белое Братство."',
    ' DEC_WHT_unite_brotherhood_tt: "Аннексия вассалов/присягнувших; косметика §YБелое Братство§! (WBR)."',
    ' DEC_WHT_uprising_already_tt: "В стране уже у власти §Yнационал-социалисты§! — фокус пропускается."',
    ' DEC_WHT_crusade_world: "Крестовый поход по Миру"',
    ' DEC_WHT_crusade_world_desc: "Все блоковые крестовые походы объявлены. Мандат на захват остального мира."',
    ' DEC_WHT_crusade_world_tt: "Казус белли на все страны вне Белого Братства."',
    ' WBR: "Белое Братство"',
    ' WBR_DEF: "Белое Братство"',
    ' WBR_ADJ: "Белобратск"',
    ' dec_wht.1.t: "Присяга Белому Братству"',
    ' dec_wht.1.d: "Лидер Братства, владея Римом, требует вассальной присяги. Отказ будет объявлен отступничеством."',
    ' dec_wht.1.a: "Присягнуть"',
    ' dec_wht.1.b: "Отказать"',
    ' dec_wht.2.t: "Отказ от присяги"',
    ' dec_wht.2.d: "Член альянса отверг присягу. Война и восстание НС неизбежны."',
    ' dec_wht.2.a: "Так им и надо"',
  ];
  for (const [bid, b] of Object.entries(BLOCKS)) {
    lines.push(` DEC_WHT_${bid}: "${b.title_ru}"`);
    lines.push(` DEC_WHT_${bid}_desc: "Макроблок: ${b.title_ru}. +2 НС странам блока."`);
    lines.push(` DEC_WHT_crusade_${bid}: "Крестовый поход по: ${b.title_ru}"`);
    lines.push(` DEC_WHT_crusade_${bid}_desc: "После всех восстаний блока — казус белли на страны блока вне альянса."`);
    lines.push(` DEC_WHT_crusade_${bid}_tt: "Казус белли на страны макроблока §Y${b.title_ru}§!."`);
    for (const [rid, r] of Object.entries(b.regions)) {
      lines.push(` DEC_WHT_reg_${bid}_${rid}: "${r.title_ru}"`);
      lines.push(` DEC_WHT_reg_${bid}_${rid}_desc: "Субрегион: ${r.title_ru}. +3 НС."`);
      for (const t of r.tags) {
        const nr = NAMES_RU[t] || t;
        lines.push(` DEC_WHT_country_${t}: "${nr}"`);
        lines.push(` DEC_WHT_country_${t}_desc: "+4 НС стране (${t})."`);
        lines.push(` DEC_WHT_uprising_${t}: "Восстание белых националистов ${nr}"`);
        lines.push(` DEC_WHT_uprising_${t}_desc: "Если уже НС — пропуск. Если независима — гражданская война за НС. Если нет страны — восстание на ядрах у оккупанта. Восставшие вступают в Белое Братство."`);
      }
    }
  }
  return lines.join("\n") + "\n";
}

function genLocEn() {
  let lines = [
    ' # --- White Revival (full) ---',
    ' DEC_WHITE_BROTHERHOOD_FACTION: "White Brotherhood"',
    ' DEC_WHT_white_revival: "White Awakening"',
    ' DEC_WHT_white_revival_desc: "Rightists and National Socialists of white nations raise a revival programme. +1 NS across the list."',
    ' DEC_WHT_boost_plus1_tt: "§Y+1 NS§! to all White Brotherhood nations."',
    ' DEC_WHT_boost_plus2_tt: "§Y+2 NS§! to nations of this macro-block."',
    ' DEC_WHT_boost_plus3_tt: "§Y+3 NS§! to nations of this sub-region."',
    ' DEC_WHT_boost_plus4_tt: "§Y+4 NS§! to this nation."',
    ' DEC_WHT_declare_brotherhood: "Declare the White Brotherhood"',
    ' DEC_WHT_declare_brotherhood_desc: "Found the White Brotherhood alliance."',
    ' DEC_WHT_declare_brotherhood_tt: "Creates the §YWhite Brotherhood§! faction."',
    ' DEC_WHT_call_unity: "Call to Unity"',
    ' DEC_WHT_call_unity_desc: "Invite all list nations with qualifying right-wing / NS ideology."',
    ' DEC_WHT_call_unity_tt: "Invites eligible nations into the §YWhite Brotherhood§!."',
    ' DEC_WHT_call_oath: "Call to Oath"',
    ' DEC_WHT_call_oath_desc: "Demand vassalage from alliance members. Refusal means war and an NS uprising."',
    ' DEC_WHT_call_oath_tt: "Alliance members receive an oath event."',
    ' DEC_WHT_unite_brotherhood: "Unite the Brotherhood"',
    ' DEC_WHT_unite_brotherhood_desc: "Merge vassals and oath-takers into a single White Brotherhood state."',
    ' DEC_WHT_unite_brotherhood_tt: "Annexes vassals/oath-takers; applies §YWhite Brotherhood§! (WBR) cosmetic."',
    ' DEC_WHT_uprising_already_tt: "National Socialists already rule — focus is bypassed."',
    ' DEC_WHT_crusade_world: "Crusade for the World"',
    ' DEC_WHT_crusade_world_desc: "All block crusades are declared. Mandate to conquer the rest of the world."',
    ' DEC_WHT_crusade_world_tt: "Wargoals on all nations outside the White Brotherhood."',
    ' WBR: "White Brotherhood"',
    ' WBR_DEF: "the White Brotherhood"',
    ' WBR_ADJ: "White Brotherhood"',
    ' dec_wht.1.t: "Oath to the White Brotherhood"',
    ' dec_wht.1.d: "The Brotherhood leader, holding Rome, demands vassal oath. Refusal will be branded apostasy."',
    ' dec_wht.1.a: "Swear the oath"',
    ' dec_wht.1.b: "Refuse"',
    ' dec_wht.2.t: "Oath Refused"',
    ' dec_wht.2.d: "An alliance member rejected the oath. War and an NS uprising follow."',
    ' dec_wht.2.a: "So be it"',
  ];
  for (const [bid, b] of Object.entries(BLOCKS)) {
    lines.push(` DEC_WHT_${bid}: "${b.title_en}"`);
    lines.push(` DEC_WHT_${bid}_desc: "Macro-block: ${b.title_en}. +2 NS to block nations."`);
    lines.push(` DEC_WHT_crusade_${bid}: "Crusade for ${b.title_en}"`);
    lines.push(` DEC_WHT_crusade_${bid}_desc: "After all uprisings of the block — wargoals on block nations outside the alliance."`);
    lines.push(` DEC_WHT_crusade_${bid}_tt: "Wargoals on nations of the §Y${b.title_en}§! macro-block."`);
    for (const [rid, r] of Object.entries(b.regions)) {
      lines.push(` DEC_WHT_reg_${bid}_${rid}: "${r.title_en}"`);
      lines.push(` DEC_WHT_reg_${bid}_${rid}_desc: "Sub-region: ${r.title_en}. +3 NS."`);
      for (const t of r.tags) {
        const ne = NAMES_EN[t] || t;
        lines.push(` DEC_WHT_country_${t}: "${ne}"`);
        lines.push(` DEC_WHT_country_${t}_desc: "+4 NS to this nation (${t})."`);
        lines.push(` DEC_WHT_uprising_${t}: "White Nationalist Uprising in ${ne}"`);
        lines.push(` DEC_WHT_uprising_${t}_desc: "If NS already rules — bypass. If independent — civil war for NS. If missing — uprising on cores vs occupier. Rebels join the White Brotherhood."`);
      }
    }
  }
  return lines.join("\n") + "\n";
}

function patchLoc(file, markerCandidates, generated) {
  let text = fs.readFileSync(file, "utf8");
  let cut = -1;
  for (const m of markerCandidates) {
    const i = text.indexOf(m);
    if (i >= 0) { cut = i; break; }
  }
  if (cut >= 0) text = text.slice(0, cut).replace(/\s+$/, "") + "\n\n" + generated;
  else text = text.replace(/\s+$/, "") + "\n\n" + generated;
  fs.writeFileSync(file, text, "utf8");
}

function main() {
  const oldEffects = fs.readFileSync(path.join(ROOT, "common/scripted_effects/DEC_white_revival.txt"), "utf8");
  let restore = "";
  if (oldEffects.includes("DEC_restore_apartheid")) {
    restore = "DEC_restore_apartheid" + oldEffects.split("DEC_restore_apartheid").slice(1).join("DEC_restore_apartheid");
  }

  fs.writeFileSync(path.join(ROOT, "common/scripted_triggers/DEC_white_revival_triggers.txt"), genTriggers(), "utf8");
  fs.writeFileSync(path.join(ROOT, "common/scripted_effects/DEC_white_revival.txt"), genEffects(restore), "utf8");
  fs.writeFileSync(path.join(ROOT, "common/national_focus/DEC_white_revival_shared.txt"), genFocuses(), "utf8");

  patchLoc(path.join(ROOT, "localisation/russian/DEC_l_russian.yml"), [" # --- Белое возрождение", " # --- White Revival"], genLocRu());
  patchLoc(path.join(ROOT, "localisation/english/DEC_l_english.yml"), [" # --- White Revival", " # --- Белое возрождение"], genLocEn());

  console.log("tags", allTags().length);
  console.log("focus KB", Math.round(fs.statSync(path.join(ROOT, "common/national_focus/DEC_white_revival_shared.txt")).size / 1024));
  console.log("effects KB", Math.round(fs.statSync(path.join(ROOT, "common/scripted_effects/DEC_white_revival.txt")).size / 1024));
}

main();
