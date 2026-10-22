/* Generate Black Awakening (Чёрное пробуждение) shared tree */
const fs = require("fs");
const path = require("path");
const ROOT = path.resolve(__dirname, "..");
const PFX = "DEC_BAW";

const BLOCKS = {
  west: {
    title_ru: "Западная Африка", title_en: "West Africa", x: -18,
    regions: {
      sahel: { title_ru: "Сахель", title_en: "Sahel", tags: ["SEN","GAM","MAL","BFA","NGR","CHA"] },
      guinea: { title_ru: "Гвинейское побережье", title_en: "Guinea Coast", tags: ["GUI","GUB","SIE","LIB","CDI","GAH","TOG","BEN","VER"] },
      nigeria: { title_ru: "Нигерия", title_en: "Nigeria", tags: ["NIG"] },
    },
  },
  central: {
    title_ru: "Центральная Африка", title_en: "Central Africa", x: -2,
    regions: {
      congo: { title_ru: "Конголезский бассейн", title_en: "Congo Basin", tags: ["DRC","CNG","CAR","SSU"] },
      equatorial: { title_ru: "Экваториальный пояс", title_en: "Equatorial Belt", tags: ["CAM","GAB","EGU","SAO"] },
    },
  },
  east: {
    title_ru: "Восточная Африка", title_en: "East Africa", x: 12,
    regions: {
      horn: { title_ru: "Рог Африки", title_en: "Horn of Africa", tags: ["ETH","ERI","DJI","SOM","SML"] },
      lakes: { title_ru: "Великие озёра", title_en: "Great Lakes", tags: ["KEN","UGA","TNZ","RWA","BUR"] },
      sudan: { title_ru: "Суданский пояс", title_en: "Sudanese Belt", tags: ["SUD"] },
      islands: { title_ru: "Острова", title_en: "Islands", tags: ["MAD","COM","SEY","MRT"] },
    },
  },
  south: {
    title_ru: "Южная Африка", title_en: "Southern Africa", x: 26,
    regions: {
      cape: { title_ru: "Кап", title_en: "Cape", tags: ["SAF","LES","SWA","NAM","BOT"] },
      miombo: { title_ru: "Миомбо", title_en: "Miombo", tags: ["ZIM","ZAM","MLW","MOZ","AGL"] },
    },
  },
  america: {
    title_ru: "Диаспора Америки", title_en: "Americas Diaspora", x: 40,
    regions: {
      usa: { title_ru: "США", title_en: "United States", tags: ["USA"] },
      caribbean: { title_ru: "Карибы", title_en: "Caribbean", tags: ["HAI","JAM","TRI","BAH","BAR","DOM","CUB"] },
      south_am: { title_ru: "Южная Америка", title_en: "South America", tags: ["BRA","COL","VEN","GUY","SUR","FGU"] },
      central_am: { title_ru: "Центральная Америка", title_en: "Central America", tags: ["PAN","BLZ","NIC","HON"] },
    },
  },
  europe: {
    title_ru: "Диаспора Европы", title_en: "Europe Diaspora", x: 54,
    regions: {
      fra: { title_ru: "Чёрные Пантеры Франции", title_en: "Black Panthers of France", tags: ["FRA"] },
      eng: { title_ru: "Чёрные Пантеры Британии", title_en: "Black Panthers of Britain", tags: ["ENG"] },
      bel: { title_ru: "Чёрные Пантеры Бельгии", title_en: "Black Panthers of Belgium", tags: ["BEL"] },
      hol: { title_ru: "Чёрные Пантеры Нидерландов", title_en: "Black Panthers of the Netherlands", tags: ["HOL"] },
      por: { title_ru: "Чёрные Пантеры Португалии", title_en: "Black Panthers of Portugal", tags: ["POR"] },
    },
  },
};

const NAMES_RU = {
  SEN:"Сенегала",GAM:"Гамбии",MAL:"Мали",BFA:"Буркина-Фасо",NGR:"Нигера",CHA:"Чада",
  GUI:"Гвинеи",GUB:"Гвинеи-Бисау",SIE:"Сьерра-Леоне",LIB:"Либерии",CDI:"Кот-д'Ивуара",GAH:"Ганы",TOG:"Того",BEN:"Бенина",VER:"Кабо-Верде",
  NIG:"Нигерии",DRC:"ДР Конго",CNG:"Конго",CAR:"ЦАР",SSU:"Южного Судана",CAM:"Камеруна",GAB:"Габона",EGU:"Экваториальной Гвинеи",SAO:"Сан-Томе",
  ETH:"Эфиопии",ERI:"Эритреи",DJI:"Джибути",SOM:"Сомали",SML:"Сомалиленда",KEN:"Кении",UGA:"Уганды",TNZ:"Танзании",RWA:"Руанды",BUR:"Бурунди",SUD:"Судана",
  MAD:"Мадагаскара",COM:"Комор",SEY:"Сейшел",MRT:"Маврикия",SAF:"ЮАР",LES:"Лесото",SWA:"Эсватини",NAM:"Намибии",BOT:"Ботсваны",
  ZIM:"Зимбабве",ZAM:"Замбии",MLW:"Малави",MOZ:"Мозамбика",AGL:"Анголы",
  USA:"США",HAI:"Гаити",JAM:"Ямайки",TRI:"Тринидада",BAH:"Багам",BAR:"Барбадоса",DOM:"Доминиканы",CUB:"Кубы",
  BRA:"Бразилии",COL:"Колумбии",VEN:"Венесуэлы",GUY:"Гайаны",SUR:"Суринама",FGU:"Французской Гвианы",PAN:"Панамы",BLZ:"Белиза",NIC:"Никарагуа",HON:"Гондураса",
  FRA:"Франции",ENG:"Британии",BEL:"Бельгии",HOL:"Нидерландов",POR:"Португалии",
};
const NAMES_EN = {
  SEN:"Senegal",GAM:"Gambia",MAL:"Mali",BFA:"Burkina Faso",NGR:"Niger",CHA:"Chad",
  GUI:"Guinea",GUB:"Guinea-Bissau",SIE:"Sierra Leone",LIB:"Liberia",CDI:"Côte d'Ivoire",GAH:"Ghana",TOG:"Togo",BEN:"Benin",VER:"Cape Verde",
  NIG:"Nigeria",DRC:"DR Congo",CNG:"Congo",CAR:"CAR",SSU:"South Sudan",CAM:"Cameroon",GAB:"Gabon",EGU:"Equatorial Guinea",SAO:"São Tomé",
  ETH:"Ethiopia",ERI:"Eritrea",DJI:"Djibouti",SOM:"Somalia",SML:"Somaliland",KEN:"Kenya",UGA:"Uganda",TNZ:"Tanzania",RWA:"Rwanda",BUR:"Burundi",SUD:"Sudan",
  MAD:"Madagascar",COM:"Comoros",SEY:"Seychelles",MRT:"Mauritius",SAF:"South Africa",LES:"Lesotho",SWA:"Eswatini",NAM:"Namibia",BOT:"Botswana",
  ZIM:"Zimbabwe",ZAM:"Zambia",MLW:"Malawi",MOZ:"Mozambique",AGL:"Angola",
  USA:"the United States",HAI:"Haiti",JAM:"Jamaica",TRI:"Trinidad",BAH:"the Bahamas",BAR:"Barbados",DOM:"the Dominican Republic",CUB:"Cuba",
  BRA:"Brazil",COL:"Colombia",VEN:"Venezuela",GUY:"Guyana",SUR:"Suriname",FGU:"French Guiana",PAN:"Panama",BLZ:"Belize",NIC:"Nicaragua",HON:"Honduras",
  FRA:"France",ENG:"Britain",BEL:"Belgium",HOL:"the Netherlands",POR:"Portugal",
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
# Black Awakening / Чёрное пробуждение
############################################

DEC_has_black_right_ideology = {
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

DEC_is_black_brotherhood_nation = {
	OR = {
`;
  for (const t of allTags()) p += `\t\toriginal_tag = ${t}\n\t\ttag = ${t}\n`;
  p += `\t\thas_cosmetic_tag = CBN
\t\thas_cosmetic_tag = DEC_BP_AMERICA
\t\thas_cosmetic_tag = DEC_BP_EUROPE
\t}
}

`;
  for (const [bid, b] of Object.entries(BLOCKS)) {
    const tagsB = [];
    for (const r of Object.values(b.regions)) tagsB.push(...r.tags);
    p += `DEC_BAW_is_${bid} = {\n${triggerOrTags(tagsB)}\n}\n\n`;
    for (const [rid, r] of Object.entries(b.regions)) {
      p += `DEC_BAW_is_${bid}_${rid} = {\n${triggerOrTags(r.tags)}\n}\n\n`;
    }
    const ups = [];
    for (const r of Object.values(b.regions)) for (const t of r.tags) ups.push(`has_completed_focus = DEC_BAW_uprising_${t}`);
    p += `DEC_BAW_${bid}_block_complete = {
	OR = {
		has_country_flag = DEC_BAW_${bid}_block_done
		AND = {
${ups.map(u => `\t\t\t${u}`).join("\n")}
		}
	}
}

`;
  }
  p += `DEC_can_access_black_awakening = {
	DEC_is_black_brotherhood_nation = yes
	DEC_has_black_right_ideology = yes
	NOT = {
		OR = {
			has_completed_focus = DEC_WHT_white_revival
			has_completed_focus = DEC_IND_indigenous_awakening
			has_completed_focus = DEC_ASI_asian_awakening
			has_completed_focus = DEC_HND_hindu_awakening
			has_completed_focus = DEC_CAL_world_caliphate
		}
	}
}

DEC_is_black_brotherhood_invitee = {
	DEC_is_black_brotherhood_nation = yes
	OR = {
		DEC_has_ns = yes
		DEC_has_black_right_ideology = yes
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
  return `DEC_BAW_uprising_${tag} = {
	log = "DEC_BAW: NS uprising ${tag}"
	if = {
		limit = { country_exists = ${tag} ${tag} = { DEC_has_ns = yes } }
		custom_effect_tooltip = DEC_BAW_uprising_already_tt
	}
	else_if = {
		limit = { OR = { tag = ${tag} original_tag = ${tag} } }
		DEC_BAW_ns_conversion_setup = yes
		custom_effect_tooltip = DEC_BAW_self_convert_tt
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
			DEC_BAW_ns_conversion_setup = yes
			if = { limit = { ROOT = { is_in_faction = yes } } ROOT = { add_to_faction = PREV } set_country_flag = DEC_joined_named_faction }
		}
	}
	else_if = {
		limit = { country_exists = ${tag} }
		${tag} = {
			if = {
				limit = { is_subject = yes }
				OVERLORD = { save_event_target_as = DEC_baw_former_overlord }
				OVERLORD = { set_autonomy = { target = PREV autonomy_state = autonomy_free } }
			}
			DEC_BAW_ns_conversion_setup = yes
		}
		if = { limit = { ROOT = { is_in_faction = yes } } ROOT = { add_to_faction = ${tag} } }
		${tag} = {
			if = {
				limit = { has_event_target = DEC_baw_former_overlord }
				declare_war_on = { target = event_target:DEC_baw_former_overlord type = annex_everything }
			}
		}
	}
	else = {
		random_state = {
			limit = { is_core_of = ${tag} }
			OWNER = { save_event_target_as = DEC_baw_occ }
			OWNER = { release = ${tag} }
		}
		if = {
			limit = { country_exists = ${tag} }
			${tag} = { DEC_BAW_ns_conversion_setup = yes }
			if = { limit = { ROOT = { is_in_faction = yes } } ROOT = { add_to_faction = ${tag} } }
			${tag} = {
				if = {
					limit = { has_event_target = DEC_baw_occ }
					declare_war_on = { target = event_target:DEC_baw_occ type = annex_everything }
				}
			}
		}
	}
}
`;
}


function genEffects() {
  let out = `############################################
# Black Awakening scripted effects
############################################

DEC_BAW_add_ns_amt = {
	if = { limit = { NOT = { has_variable = party_pop_array^21 } } set_variable = { party_pop_array^21 = 0 } }
	add_to_variable = { party_pop_array^21 = DEC_baw_ns_amt }
	clamp_variable = { var = party_pop_array^21 min = 0 max = 1 }
	add_popularity = { ideology = nationalist popularity = DEC_baw_ns_amt }
	recalculate_party = yes
}

DEC_BAW_ns_conversion_setup = {
	set_variable = { party_pop_array^21 = 0.55 }
	add_popularity = { ideology = nationalist popularity = 0.55 }
	set_variable = { ruling_party = 21 }
	recalculate_party = yes
	set_politics = { ruling_party = nationalist elections_allowed = no }
	set_country_flag = DEC_rebel_nation
}

DEC_BAW_boost_all = {
	every_country = {
		limit = { DEC_is_black_brotherhood_nation = yes exists = yes }
		set_temp_variable = { DEC_baw_ns_amt = ROOT.DEC_baw_ns_amt }
		DEC_BAW_add_ns_amt = yes
	}
}
`;
  for (const bid of Object.keys(BLOCKS)) {
    out += `DEC_BAW_boost_${bid} = {
	every_country = { limit = { DEC_BAW_is_${bid} = yes exists = yes }
		set_temp_variable = { DEC_baw_ns_amt = ROOT.DEC_baw_ns_amt }
		DEC_BAW_add_ns_amt = yes
	}
}
`;
    for (const rid of Object.keys(BLOCKS[bid].regions)) {
      out += `DEC_BAW_boost_${bid}_${rid} = {
	every_country = { limit = { DEC_BAW_is_${bid}_${rid} = yes exists = yes }
		set_temp_variable = { DEC_baw_ns_amt = ROOT.DEC_baw_ns_amt }
		DEC_BAW_add_ns_amt = yes
	}
}
`;
    }
  }
  for (const t of allTags()) {
    out += `DEC_BAW_boost_country_${t} = {
	if = { limit = { country_exists = ${t} }
		${t} = { set_temp_variable = { DEC_baw_ns_amt = ROOT.DEC_baw_ns_amt } DEC_BAW_add_ns_amt = yes }
	}
}
`;
    out += uprisingEffect(t);
  }
  out += `
DEC_create_black_brotherhood = {
	DEC_mark_named_alliance_member = yes
	if = { limit = { is_in_faction = yes } leave_faction = yes }
	set_rule = { can_create_factions = yes }
	create_faction_from_template = faction_template_dec_black_brotherhood
	set_global_flag = DEC_BAW_brotherhood_formed
}

DEC_invite_black_brotherhood_members = {
	every_other_country = {
		limit = { DEC_is_black_brotherhood_invitee = yes NOT = { is_in_faction_with = ROOT } }
		set_country_flag = DEC_joined_named_faction
		if = { limit = { is_in_faction = yes } leave_faction = yes }
		ROOT = { add_to_faction = PREV }
	}
}

DEC_BAW_create_panthers_america = {
	DEC_mark_named_alliance_member = yes
	if = { limit = { is_in_faction = yes } leave_faction = yes }
	set_rule = { can_create_factions = yes }
	create_faction_from_template = faction_template_dec_black_panthers_america
	set_cosmetic_tag = DEC_BP_AMERICA
	set_global_flag = DEC_BAW_panthers_america
	every_other_country = {
		limit = { DEC_BAW_is_america = yes DEC_is_black_brotherhood_invitee = yes NOT = { tag = ROOT } }
		set_country_flag = DEC_joined_named_faction
		if = { limit = { is_in_faction = yes } leave_faction = yes }
		ROOT = { add_to_faction = PREV }
	}
}

DEC_BAW_create_panthers_europe = {
	DEC_mark_named_alliance_member = yes
	if = { limit = { is_in_faction = yes } leave_faction = yes }
	set_rule = { can_create_factions = yes }
	create_faction_from_template = faction_template_dec_black_panthers_europe
	set_cosmetic_tag = DEC_BP_EUROPE
	set_global_flag = DEC_BAW_panthers_europe
	every_other_country = {
		limit = { DEC_BAW_is_europe = yes DEC_is_black_brotherhood_invitee = yes NOT = { tag = ROOT } }
		set_country_flag = DEC_joined_named_faction
		if = { limit = { is_in_faction = yes } leave_faction = yes }
		ROOT = { add_to_faction = PREV }
	}
}

DEC_BAW_oath_start = {
	set_country_flag = DEC_BAW_oath_caller
	save_global_event_target_as = DEC_baw_overlord
	every_other_country = {
		limit = { is_in_faction_with = ROOT is_subject = no NOT = { tag = ROOT } }
		country_event = { id = dec_baw.1 hours = 8 }
	}
}

DEC_BAW_unite_brotherhood = {
	every_other_country = {
		limit = { OR = { is_subject_of = ROOT has_country_flag = DEC_BAW_oath_accepted } }
		every_owned_state = { add_core_of = ROOT }
		ROOT = { annex_country = { target = PREV transfer_troops = yes } }
	}
	set_cosmetic_tag = CBN
	set_global_flag = DEC_BAW_united
	custom_effect_tooltip = DEC_BAW_unite_brotherhood_tt
}
`;
  for (const bid of Object.keys(BLOCKS)) {
    out += `DEC_BAW_wargoals_${bid} = {
	every_country = {
		limit = {
			exists = yes DEC_BAW_is_${bid} = yes
			NOT = { tag = ROOT } NOT = { is_in_faction_with = ROOT } NOT = { is_subject_of = ROOT }
		}
		ROOT = { create_wargoal = { type = annex_everything target = PREV } }
	}
	set_country_flag = DEC_BAW_${bid}_block_done
}
`;
  }
  out += `DEC_BAW_wargoals_world = {
	every_country = {
		limit = {
			exists = yes NOT = { tag = ROOT } NOT = { is_in_faction_with = ROOT }
			NOT = { is_subject_of = ROOT } NOT = { DEC_is_black_brotherhood_nation = yes }
		}
		ROOT = { create_wargoal = { type = annex_everything target = PREV } }
	}
	set_global_flag = DEC_BAW_world_crusade
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
	relative_position_id = DEC_BAW_black_awakening
	x = ${x}
	y = ${y}
	cost = ${cost}
${pr}${byp}
	available = { ${available || "DEC_can_access_black_awakening = yes"} }
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
# Shared: Black Awakening — Чёрное пробуждение
############################################

shared_focus = {
	id = DEC_BAW_black_awakening
	icon = Ultranationalism
	x = 200
	y = 0
	cost = 5
	allow_branch = { DEC_can_access_black_awakening = yes }
	search_filters = { FOCUS_FILTER_POLITICAL FOCUS_FILTER_DIPLOMACY }
	available = { DEC_can_access_black_awakening = yes }
	completion_reward = {
		log = "[GetDateText]: [Root.GetName]: Focus DEC_BAW_black_awakening"
		set_variable = { DEC_baw_ns_amt = 0.10 }
		DEC_BAW_boost_all = yes
		add_political_power = 50
		custom_effect_tooltip = DEC_BAW_boost_plus1_tt
	}
	ai_will_do = { base = 40 }
}
`;
  lines += focusBlock({
    id: "DEC_BAW_declare_brotherhood", icon: "alliance", x: -32, y: 1, cost: 8,
    prereq: ["DEC_BAW_black_awakening"],
    rewards: ["DEC_create_black_brotherhood = yes", "custom_effect_tooltip = DEC_BAW_declare_brotherhood_tt"],
    available: "DEC_can_access_black_awakening = yes\n\t\tis_subject = no\n\t\tis_in_faction = no", ai: 45,
  });
  lines += focusBlock({
    id: "DEC_BAW_call_unity", icon: "major_alliance", x: -32, y: 2, cost: 8,
    prereq: ["DEC_BAW_declare_brotherhood"],
    rewards: ["DEC_invite_black_brotherhood_members = yes", "custom_effect_tooltip = DEC_BAW_call_unity_tt"],
    available: "DEC_can_access_black_awakening = yes\n\t\tis_faction_leader = yes", ai: 40,
  });
  lines += focusBlock({
    id: "DEC_BAW_call_oath", icon: "national_unity", x: -32, y: 3, cost: 10,
    prereq: ["DEC_BAW_call_unity"],
    rewards: ["DEC_BAW_oath_start = yes", "custom_effect_tooltip = DEC_BAW_call_oath_tt"],
    available: "DEC_can_access_black_awakening = yes\n\t\tis_faction_leader = yes", ai: 35,
  });
  lines += focusBlock({
    id: "DEC_BAW_unite_brotherhood", icon: "annex_country", x: -32, y: 4, cost: 12,
    prereq: ["DEC_BAW_call_oath"],
    rewards: ["DEC_BAW_unite_brotherhood = yes"],
    available: "DEC_can_access_black_awakening = yes\n\t\tis_faction_leader = yes\n\t\tany_subject_country = { always = yes }", ai: 30,
  });

  // Diaspora faction founders from america/europe macros
  lines += focusBlock({
    id: "DEC_BAW_panthers_america", icon: "major_alliance", x: 46, y: 1, cost: 8,
    prereq: ["DEC_BAW_america"],
    rewards: ["DEC_BAW_create_panthers_america = yes", "custom_effect_tooltip = DEC_BAW_panthers_america_tt"],
    available: "DEC_can_access_black_awakening = yes\n\t\tis_subject = no", ai: 40,
  });
  lines += focusBlock({
    id: "DEC_BAW_panthers_europe", icon: "major_alliance", x: 60, y: 1, cost: 8,
    prereq: ["DEC_BAW_europe"],
    rewards: ["DEC_BAW_create_panthers_europe = yes", "custom_effect_tooltip = DEC_BAW_panthers_europe_tt"],
    available: "DEC_can_access_black_awakening = yes\n\t\tis_subject = no", ai: 40,
  });

  for (const [bid, b] of Object.entries(BLOCKS)) {
    lines += focusBlock({
      id: `DEC_BAW_${bid}`, icon: "national_unity", x: b.x, y: 1, cost: 7,
      prereq: ["DEC_BAW_black_awakening"],
      rewards: ["set_variable = { DEC_baw_ns_amt = 0.15 }", `DEC_BAW_boost_${bid} = yes`, "custom_effect_tooltip = DEC_BAW_boost_plus2_tt"],
      ai: 30,
    });
    const regs = Object.entries(b.regions);
    let cursor = b.x - Math.floor(regs.reduce((a, [, r]) => a + r.tags.length, 0) / 2);
    for (const [rid, r] of regs) {
      const rx = cursor;
      lines += focusBlock({
        id: `DEC_BAW_reg_${bid}_${rid}`, icon: "national_unity", x: rx, y: 2, cost: 7,
        prereq: [`DEC_BAW_${bid}`],
        rewards: ["set_variable = { DEC_baw_ns_amt = 0.20 }", `DEC_BAW_boost_${bid}_${rid} = yes`, "custom_effect_tooltip = DEC_BAW_boost_plus3_tt"],
        ai: 25,
      });
      r.tags.forEach((tag, j) => {
        const cx = rx + j;
        lines += focusBlock({
          id: `DEC_BAW_country_${tag}`, icon: "nationalist_administration", x: cx, y: 3, cost: 6,
          prereq: [`DEC_BAW_reg_${bid}_${rid}`],
          rewards: ["set_variable = { DEC_baw_ns_amt = 0.25 }", `DEC_BAW_boost_country_${tag} = yes`, "custom_effect_tooltip = DEC_BAW_boost_plus4_tt"],
          ai: 15,
        });
        lines += focusBlock({
          id: `DEC_BAW_uprising_${tag}`, icon: "generic_fascist_uprising", x: cx, y: 4, cost: 8,
          prereq: [`DEC_BAW_country_${tag}`],
          rewards: [`DEC_BAW_uprising_${tag} = yes`],
          bypass: `country_exists = ${tag}\n\t\t${tag} = { DEC_has_ns = yes }`,
          ai: 12,
        });
      });
      cursor += r.tags.length + 1;
    }
    const ups = [];
    for (const r of Object.values(b.regions)) for (const t of r.tags) ups.push(`DEC_BAW_uprising_${t}`);
    const prereqLines = ups.map(u => `\tprerequisite = { focus = ${u} }`).join("\n");
    lines += `
shared_focus = {
	id = DEC_BAW_crusade_${bid}
	icon = war
	relative_position_id = DEC_BAW_black_awakening
	x = ${b.x}
	y = 5
	cost = 10
${prereqLines}
	available = { DEC_can_access_black_awakening = yes }
	search_filters = { FOCUS_FILTER_WAR_SUPPORT FOCUS_FILTER_ANNEXATION }
	completion_reward = {
		log = "[GetDateText]: [Root.GetName]: Focus DEC_BAW_crusade_${bid}"
		DEC_BAW_wargoals_${bid} = yes
		custom_effect_tooltip = DEC_BAW_crusade_${bid}_tt
	}
	ai_will_do = { base = 35 }
}
`;
  }
  const crusadePrereqs = Object.keys(BLOCKS).map(bid => `\tprerequisite = { focus = DEC_BAW_crusade_${bid} }`).join("\n");
  lines += `
shared_focus = {
	id = DEC_BAW_crusade_world
	icon = annex_country
	relative_position_id = DEC_BAW_black_awakening
	x = 12
	y = 6
	cost = 15
${crusadePrereqs}
	available = { DEC_can_access_black_awakening = yes }
	search_filters = { FOCUS_FILTER_WAR_SUPPORT FOCUS_FILTER_ANNEXATION }
	completion_reward = {
		log = "[GetDateText]: [Root.GetName]: Focus DEC_BAW_crusade_world"
		DEC_BAW_wargoals_world = yes
		custom_effect_tooltip = DEC_BAW_crusade_world_tt
	}
	ai_will_do = { base = 50 }
}
`;
  return lines;
}

function genLocRu() {
  let lines = [
    ' # --- Чёрное пробуждение ---',
    ' DEC_BLACK_BROTHERHOOD_FACTION: "Чёрное Братство"',
    ' DEC_BLACK_PANTHERS_AMERICA_FACTION: "Чёрные Пантеры Америки"',
    ' DEC_BLACK_PANTHERS_EUROPE_FACTION: "Чёрные Пантеры Европы"',
    ' DEC_BAW_black_awakening: "Чёрное пробуждение"',
    ' DEC_BAW_black_awakening_desc: "Чёрные нации и диаспора поднимают программу пробуждения. +1 НС всем странам списка."',
    ' DEC_BAW_boost_plus1_tt: "§Y+1 НС§! всем странам Чёрного Братства."',
    ' DEC_BAW_boost_plus2_tt: "§Y+2 НС§! странам этого макроблока."',
    ' DEC_BAW_boost_plus3_tt: "§Y+3 НС§! странам субрегиона."',
    ' DEC_BAW_boost_plus4_tt: "§Y+4 НС§! этой стране."',
    ' DEC_BAW_declare_brotherhood: "Объявить Чёрное Братство"',
    ' DEC_BAW_declare_brotherhood_desc: "Создать альянс Чёрное Братство."',
    ' DEC_BAW_declare_brotherhood_tt: "Создаёт фракцию §YЧёрное Братство§!."',
    ' DEC_BAW_call_unity: "Призвать к сплочению"',
    ' DEC_BAW_call_unity_desc: "Пригласить в альянс все страны списка с подходящей правой / НС идеологией."',
    ' DEC_BAW_call_unity_tt: "Приглашает подходящие страны в §YЧёрное Братство§!."',
    ' DEC_BAW_call_oath: "Призвать к присяге"',
    ' DEC_BAW_call_oath_desc: "Потребовать вассалитета от членов альянса. Отказ — война и восстание НС."',
    ' DEC_BAW_call_oath_tt: "Члены альянса получают ивент присяги."',
    ' DEC_BAW_unite_brotherhood: "Объединить Братство"',
    ' DEC_BAW_unite_brotherhood_desc: "Слить вассалов и присягнувших в единое Чёрное Братство."',
    ' DEC_BAW_unite_brotherhood_tt: "Аннексия вассалов; косметика §YЧёрное Братство§! (CBN)."',
    ' DEC_BAW_panthers_america: "Основать Чёрных Пантер Америки"',
    ' DEC_BAW_panthers_america_desc: "Создать региональную фракцию диаспоры Америки."',
    ' DEC_BAW_panthers_america_tt: "Создаёт §YЧёрных Пантер Америки§! и приглашает американскую диаспору."',
    ' DEC_BAW_panthers_europe: "Основать Чёрных Пантер Европы"',
    ' DEC_BAW_panthers_europe_desc: "Создать региональную фракцию европейской диаспоры."',
    ' DEC_BAW_panthers_europe_tt: "Создаёт §YЧёрных Пантер Европы§! и приглашает европейскую диаспору."',
    ' DEC_BAW_uprising_already_tt: "В стране уже у власти §Yнационал-социалисты§! — фокус пропускается."',
    ' DEC_BAW_crusade_world: "Освободительный поход по Миру"',
    ' DEC_BAW_crusade_world_desc: "Все блоковые походы объявлены. Мандат на захват остального мира."',
    ' DEC_BAW_crusade_world_tt: "Казус белли на все страны вне Чёрного Братства."',
    ' CBN: "Чёрное Братство"',
    ' CBN_DEF: "Чёрное Братство"',
    ' CBN_ADJ: "Чернобратск"',
    ' DEC_BP_AMERICA: "Чёрные Пантеры Америки"',
    ' DEC_BP_AMERICA_DEF: "Чёрные Пантеры Америки"',
    ' DEC_BP_AMERICA_ADJ: "Пантерск"',
    ' DEC_BP_EUROPE: "Чёрные Пантеры Европы"',
    ' DEC_BP_EUROPE_DEF: "Чёрные Пантеры Европы"',
    ' DEC_BP_EUROPE_ADJ: "Пантерск"',
    ' dec_baw.1.t: "Присяга Чёрному Братству"',
    ' dec_baw.1.d: "Лидер Братства требует вассальной присяги. Отказ будет объявлен отступничеством."',
    ' dec_baw.1.a: "Присягнуть"',
    ' dec_baw.1.b: "Отказать"',
    ' dec_baw.2.t: "Отказ от присяги"',
    ' dec_baw.2.d: "Член альянса отверг присягу. Война и восстание НС неизбежны."',
    ' dec_baw.2.a: "Так им и надо"',
  ];
  for (const [bid, b] of Object.entries(BLOCKS)) {
    lines.push(` DEC_BAW_${bid}: "${b.title_ru}"`);
    lines.push(` DEC_BAW_${bid}_desc: "Макроблок: ${b.title_ru}. +2 НС странам блока."`);
    lines.push(` DEC_BAW_crusade_${bid}: "Освободительный поход по: ${b.title_ru}"`);
    lines.push(` DEC_BAW_crusade_${bid}_desc: "После всех восстаний блока — казус белли на страны блока вне альянса."`);
    lines.push(` DEC_BAW_crusade_${bid}_tt: "Казус белли на страны макроблока §Y${b.title_ru}§!."`);
    for (const [rid, r] of Object.entries(b.regions)) {
      lines.push(` DEC_BAW_reg_${bid}_${rid}: "${r.title_ru}"`);
      lines.push(` DEC_BAW_reg_${bid}_${rid}_desc: "Субрегион: ${r.title_ru}. +3 НС."`);
      for (const t of r.tags) {
        const nr = NAMES_RU[t] || t;
        lines.push(` DEC_BAW_country_${t}: "${nr}"`);
        lines.push(` DEC_BAW_country_${t}_desc: "+4 НС стране (${t})."`);
        lines.push(` DEC_BAW_uprising_${t}: "Восстание чёрных националистов ${nr}"`);
        lines.push(` DEC_BAW_uprising_${t}_desc: "Если уже НС — пропуск. Если независима — гражданская война за НС. Если нет страны — восстание на ядрах у оккупанта. Восставшие вступают в Чёрное Братство."`);
      }
    }
  }
  return lines.join("\n") + "\n";
}

function genLocEn() {
  let lines = [
    ' # --- Black Awakening ---',
    ' DEC_BLACK_BROTHERHOOD_FACTION: "Black Brotherhood"',
    ' DEC_BLACK_PANTHERS_AMERICA_FACTION: "Black Panthers of America"',
    ' DEC_BLACK_PANTHERS_EUROPE_FACTION: "Black Panthers of Europe"',
    ' DEC_BAW_black_awakening: "Black Awakening"',
    ' DEC_BAW_black_awakening_desc: "Black nations and diaspora raise an awakening programme. +1 NS across the list."',
    ' DEC_BAW_boost_plus1_tt: "§Y+1 NS§! to all Black Brotherhood nations."',
    ' DEC_BAW_boost_plus2_tt: "§Y+2 NS§! to nations of this macro-block."',
    ' DEC_BAW_boost_plus3_tt: "§Y+3 NS§! to nations of this sub-region."',
    ' DEC_BAW_boost_plus4_tt: "§Y+4 NS§! to this nation."',
    ' DEC_BAW_declare_brotherhood: "Declare the Black Brotherhood"',
    ' DEC_BAW_declare_brotherhood_desc: "Found the Black Brotherhood alliance."',
    ' DEC_BAW_declare_brotherhood_tt: "Creates the §YBlack Brotherhood§! faction."',
    ' DEC_BAW_call_unity: "Call to Unity"',
    ' DEC_BAW_call_unity_desc: "Invite all list nations with qualifying right-wing / NS ideology."',
    ' DEC_BAW_call_unity_tt: "Invites eligible nations into the §YBlack Brotherhood§!."',
    ' DEC_BAW_call_oath: "Call to Oath"',
    ' DEC_BAW_call_oath_desc: "Demand vassalage from alliance members. Refusal means war and an NS uprising."',
    ' DEC_BAW_call_oath_tt: "Alliance members receive an oath event."',
    ' DEC_BAW_unite_brotherhood: "Unite the Brotherhood"',
    ' DEC_BAW_unite_brotherhood_desc: "Merge vassals and oath-takers into a single Black Brotherhood state."',
    ' DEC_BAW_unite_brotherhood_tt: "Annexes vassals; applies §YBlack Brotherhood§! (CBN) cosmetic."',
    ' DEC_BAW_panthers_america: "Found the Black Panthers of America"',
    ' DEC_BAW_panthers_america_desc: "Create the Americas diaspora regional faction."',
    ' DEC_BAW_panthers_america_tt: "Creates §YBlack Panthers of America§! and invites the American diaspora."',
    ' DEC_BAW_panthers_europe: "Found the Black Panthers of Europe"',
    ' DEC_BAW_panthers_europe_desc: "Create the European diaspora regional faction."',
    ' DEC_BAW_panthers_europe_tt: "Creates §YBlack Panthers of Europe§! and invites the European diaspora."',
    ' DEC_BAW_uprising_already_tt: "National Socialists already rule — focus is bypassed."',
    ' DEC_BAW_crusade_world: "Liberation Crusade for the World"',
    ' DEC_BAW_crusade_world_desc: "All block crusades are declared. Mandate to conquer the rest of the world."',
    ' DEC_BAW_crusade_world_tt: "Wargoals on all nations outside the Black Brotherhood."',
    ' CBN: "Black Brotherhood"',
    ' CBN_DEF: "the Black Brotherhood"',
    ' CBN_ADJ: "Black Brotherhood"',
    ' DEC_BP_AMERICA: "Black Panthers of America"',
    ' DEC_BP_AMERICA_DEF: "the Black Panthers of America"',
    ' DEC_BP_AMERICA_ADJ: "Panther"',
    ' DEC_BP_EUROPE: "Black Panthers of Europe"',
    ' DEC_BP_EUROPE_DEF: "the Black Panthers of Europe"',
    ' DEC_BP_EUROPE_ADJ: "Panther"',
    ' dec_baw.1.t: "Oath to the Black Brotherhood"',
    ' dec_baw.1.d: "The Brotherhood leader demands vassal oath. Refusal will be branded apostasy."',
    ' dec_baw.1.a: "Swear the oath"',
    ' dec_baw.1.b: "Refuse"',
    ' dec_baw.2.t: "Oath Refused"',
    ' dec_baw.2.d: "An alliance member rejected the oath. War and an NS uprising follow."',
    ' dec_baw.2.a: "So be it"',
  ];
  for (const [bid, b] of Object.entries(BLOCKS)) {
    lines.push(` DEC_BAW_${bid}: "${b.title_en}"`);
    lines.push(` DEC_BAW_${bid}_desc: "Macro-block: ${b.title_en}. +2 NS to block nations."`);
    lines.push(` DEC_BAW_crusade_${bid}: "Liberation Crusade for ${b.title_en}"`);
    lines.push(` DEC_BAW_crusade_${bid}_desc: "After all uprisings of the block — wargoals on block nations outside the alliance."`);
    lines.push(` DEC_BAW_crusade_${bid}_tt: "Wargoals on nations of the §Y${b.title_en}§! macro-block."`);
    for (const [rid, r] of Object.entries(b.regions)) {
      lines.push(` DEC_BAW_reg_${bid}_${rid}: "${r.title_en}"`);
      lines.push(` DEC_BAW_reg_${bid}_${rid}_desc: "Sub-region: ${r.title_en}. +3 NS."`);
      for (const t of r.tags) {
        const ne = NAMES_EN[t] || t;
        lines.push(` DEC_BAW_country_${t}: "${ne}"`);
        lines.push(` DEC_BAW_country_${t}_desc: "+4 NS to this nation (${t})."`);
        lines.push(` DEC_BAW_uprising_${t}: "Black Nationalist Uprising in ${ne}"`);
        lines.push(` DEC_BAW_uprising_${t}_desc: "If NS already rules — bypass. If independent — civil war for NS. If missing — uprising on cores vs occupier. Rebels join the Black Brotherhood."`);
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
  fs.writeFileSync(path.join(ROOT, "common/scripted_triggers/DEC_black_awakening_triggers.txt"), genTriggers(), "utf8");
  fs.writeFileSync(path.join(ROOT, "common/scripted_effects/DEC_black_awakening.txt"), genEffects(), "utf8");
  fs.writeFileSync(path.join(ROOT, "common/national_focus/DEC_black_awakening_shared.txt"), genFocuses(), "utf8");
  patchLoc(path.join(ROOT, "localisation/russian/DEC_l_russian.yml"), [" # --- Чёрное пробуждение"], genLocRu());
  // if marker missing, append
  let ru = fs.readFileSync(path.join(ROOT, "localisation/russian/DEC_l_russian.yml"), "utf8");
  if (!ru.includes("DEC_BAW_black_awakening")) {
    fs.writeFileSync(path.join(ROOT, "localisation/russian/DEC_l_russian.yml"), ru.replace(/\s+$/, "") + "\n\n" + genLocRu(), "utf8");
  }
  let en = fs.readFileSync(path.join(ROOT, "localisation/english/DEC_l_english.yml"), "utf8");
  if (en.includes(" # --- Black Awakening")) {
    patchLoc(path.join(ROOT, "localisation/english/DEC_l_english.yml"), [" # --- Black Awakening"], genLocEn());
  } else {
    fs.writeFileSync(path.join(ROOT, "localisation/english/DEC_l_english.yml"), en.replace(/\s+$/, "") + "\n\n" + genLocEn(), "utf8");
  }
  console.log("tags", allTags().length);
  console.log("focus KB", Math.round(fs.statSync(path.join(ROOT, "common/national_focus/DEC_black_awakening_shared.txt")).size / 1024));
}

main();
