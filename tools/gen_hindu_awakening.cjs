/* Generate Hindu Awakening (Индусское пробуждение) — South Asia + Indic diaspora */
const fs = require("fs");
const path = require("path");
const ROOT = path.resolve(__dirname, "..");

const BLOCKS = {
  india: {
    title_ru: "Бхарат", title_en: "Bharat", x: -12,
    regions: {
      core: { title_ru: "Срединная Индия", title_en: "Core India", tags: ["RAJ"] },
      bengal: { title_ru: "Бенгалия", title_en: "Bengal", tags: ["BAN"] },
    },
  },
  himalaya: {
    title_ru: "Гималаи", title_en: "Himalayas", x: 4,
    regions: {
      kingdoms: { title_ru: "Горные царства", title_en: "Mountain Kingdoms", tags: ["NEP", "BHU", "SIK"] },
    },
  },
  island: {
    title_ru: "Островной пояс", title_en: "Island Belt", x: 14,
    regions: {
      lanka: { title_ru: "Ланка", title_en: "Lanka", tags: ["SRI", "TML"] },
      maldives: { title_ru: "Мальдивы", title_en: "Maldives", tags: ["MLD"] },
    },
  },
  northwest: {
    title_ru: "Северо-Запад", title_en: "Northwest", x: 24,
    regions: {
      punjab_kashmir: { title_ru: "Пенджаб и Кашмир", title_en: "Punjab and Kashmir", tags: ["KHA", "KAS"] },
    },
  },
  diaspora: {
    title_ru: "Индийская диаспора", title_en: "Indic Diaspora", x: 36,
    regions: {
      caribbean: { title_ru: "Карибы и Гвиана", title_en: "Caribbean and Guiana", tags: ["TRI", "GUY", "SUR"] },
      pacific: { title_ru: "Тихий океан", title_en: "Pacific", tags: ["FIJ"] },
      mauritius: { title_ru: "Маврикий", title_en: "Mauritius", tags: ["MRT"] },
    },
  },
};

const NAMES_RU = {
  RAJ: "Индии", BAN: "Бангладеш", NEP: "Непала", BHU: "Бутана", SIK: "Сиккима",
  SRI: "Шри-Ланки", TML: "Тамил-Илама", MLD: "Мальдив", KHA: "Халистана", KAS: "Кашмира",
  TRI: "Тринидада", GUY: "Гайаны", SUR: "Суринама", FIJ: "Фиджи", MRT: "Маврикия",
};
const NAMES_EN = {
  RAJ: "India", BAN: "Bangladesh", NEP: "Nepal", BHU: "Bhutan", SIK: "Sikkim",
  SRI: "Sri Lanka", TML: "Tamil Eelam", MLD: "the Maldives", KHA: "Khalistan", KAS: "Kashmir",
  TRI: "Trinidad", GUY: "Guyana", SUR: "Suriname", FIJ: "Fiji", MRT: "Mauritius",
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
# Hindu Awakening / Индусское пробуждение
############################################

DEC_has_hindu_right_ideology = {
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

DEC_is_hindu_nation = {
	OR = {
`;
  for (const t of allTags()) p += `\t\toriginal_tag = ${t}\n\t\ttag = ${t}\n`;
  p += `\t\thas_cosmetic_tag = BHA
\t\thas_cosmetic_tag = DEC_SAN
\t\thas_cosmetic_tag = DEC_INDIA_DIASPORA
\t}
}

`;
  for (const [bid, b] of Object.entries(BLOCKS)) {
    const tagsB = [];
    for (const r of Object.values(b.regions)) tagsB.push(...r.tags);
    p += `DEC_HND_is_${bid} = {\n${triggerOrTags(tagsB)}\n}\n\n`;
    for (const [rid, r] of Object.entries(b.regions)) {
      p += `DEC_HND_is_${bid}_${rid} = {\n${triggerOrTags(r.tags)}\n}\n\n`;
    }
    const ups = [];
    for (const r of Object.values(b.regions)) for (const t of r.tags) ups.push(`has_completed_focus = DEC_HND_uprising_${t}`);
    p += `DEC_HND_${bid}_block_complete = {
	OR = {
		has_country_flag = DEC_HND_${bid}_block_done
		AND = {
${ups.map(u => `\t\t\t${u}`).join("\n")}
		}
	}
}

`;
  }
  p += `DEC_can_access_hindu_awakening = {
	DEC_is_hindu_nation = yes
	DEC_has_hindu_right_ideology = yes
	NOT = {
		OR = {
			has_completed_focus = DEC_WHT_white_revival
			has_completed_focus = DEC_BAW_black_awakening
			has_completed_focus = DEC_IND_indigenous_awakening
			has_completed_focus = DEC_ASI_asian_awakening
			has_completed_focus = DEC_CAL_world_caliphate
		}
	}
}

DEC_is_hindu_invitee = {
	DEC_is_hindu_nation = yes
	OR = {
		DEC_has_ns = yes
		DEC_has_hindu_right_ideology = yes
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
  return `DEC_HND_uprising_${tag} = {
	log = "DEC_HND: NS uprising ${tag}"
	if = {
		limit = { country_exists = ${tag} ${tag} = { DEC_has_ns = yes } }
		custom_effect_tooltip = DEC_HND_uprising_already_tt
	}
	else_if = {
		limit = { OR = { tag = ${tag} original_tag = ${tag} } }
		DEC_HND_ns_conversion_setup = yes
		custom_effect_tooltip = DEC_HND_self_convert_tt
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
			DEC_HND_ns_conversion_setup = yes
			if = { limit = { ROOT = { is_in_faction = yes } } ROOT = { add_to_faction = PREV } set_country_flag = DEC_joined_named_faction }
		}
	}
	else_if = {
		limit = { country_exists = ${tag} }
		${tag} = {
			if = {
				limit = { is_subject = yes }
				OVERLORD = { save_event_target_as = DEC_hnd_former_overlord }
				OVERLORD = { set_autonomy = { target = PREV autonomy_state = autonomy_free } }
			}
			DEC_HND_ns_conversion_setup = yes
		}
		if = { limit = { ROOT = { is_in_faction = yes } } ROOT = { add_to_faction = ${tag} } }
		${tag} = {
			if = {
				limit = { has_event_target = DEC_hnd_former_overlord }
				declare_war_on = { target = event_target:DEC_hnd_former_overlord type = annex_everything }
			}
		}
	}
	else = {
		random_state = {
			limit = { is_core_of = ${tag} }
			OWNER = { save_event_target_as = DEC_hnd_occ }
			OWNER = { release = ${tag} }
		}
		if = {
			limit = { country_exists = ${tag} }
			${tag} = { DEC_HND_ns_conversion_setup = yes }
			if = { limit = { ROOT = { is_in_faction = yes } } ROOT = { add_to_faction = ${tag} } }
			${tag} = {
				if = {
					limit = { has_event_target = DEC_hnd_occ }
					declare_war_on = { target = event_target:DEC_hnd_occ type = annex_everything }
				}
			}
		}
	}
}
`;
}


function genEffects() {
  let out = `############################################
# Hindu Awakening scripted effects
############################################

DEC_HND_add_ns_amt = {
	if = { limit = { NOT = { has_variable = party_pop_array^21 } } set_variable = { party_pop_array^21 = 0 } }
	add_to_variable = { party_pop_array^21 = DEC_hnd_ns_amt }
	clamp_variable = { var = party_pop_array^21 min = 0 max = 1 }
	add_popularity = { ideology = nationalist popularity = DEC_hnd_ns_amt }
	recalculate_party = yes
}

DEC_HND_ns_conversion_setup = {
	set_variable = { party_pop_array^21 = 0.55 }
	add_popularity = { ideology = nationalist popularity = 0.55 }
	set_variable = { ruling_party = 21 }
	recalculate_party = yes
	set_politics = { ruling_party = nationalist elections_allowed = no }
	set_country_flag = DEC_rebel_nation
}

DEC_HND_boost_all = {
	every_country = {
		limit = { DEC_is_hindu_nation = yes exists = yes }
		set_temp_variable = { DEC_hnd_ns_amt = ROOT.DEC_hnd_ns_amt }
		DEC_HND_add_ns_amt = yes
	}
}
`;
  for (const bid of Object.keys(BLOCKS)) {
    out += `DEC_HND_boost_${bid} = {
	every_country = { limit = { DEC_HND_is_${bid} = yes exists = yes }
		set_temp_variable = { DEC_hnd_ns_amt = ROOT.DEC_hnd_ns_amt }
		DEC_HND_add_ns_amt = yes
	}
}
`;
    for (const rid of Object.keys(BLOCKS[bid].regions)) {
      out += `DEC_HND_boost_${bid}_${rid} = {
	every_country = { limit = { DEC_HND_is_${bid}_${rid} = yes exists = yes }
		set_temp_variable = { DEC_hnd_ns_amt = ROOT.DEC_hnd_ns_amt }
		DEC_HND_add_ns_amt = yes
	}
}
`;
    }
  }
  for (const t of allTags()) {
    out += `DEC_HND_boost_country_${t} = {
	if = { limit = { country_exists = ${t} }
		${t} = { set_temp_variable = { DEC_hnd_ns_amt = ROOT.DEC_hnd_ns_amt } DEC_HND_add_ns_amt = yes }
	}
}
`;
    out += uprisingEffect(t);
  }
  out += `
DEC_create_hindu_rashtra = {
	DEC_mark_named_alliance_member = yes
	if = { limit = { is_in_faction = yes } leave_faction = yes }
	set_rule = { can_create_factions = yes }
	create_faction_from_template = faction_template_dec_hindu_rashtra
	set_global_flag = DEC_HND_rashtra_formed
}

DEC_invite_hindu_rashtra_members = {
	every_other_country = {
		limit = { DEC_is_hindu_invitee = yes NOT = { is_in_faction_with = ROOT } }
		set_country_flag = DEC_joined_named_faction
		if = { limit = { is_in_faction = yes } leave_faction = yes }
		ROOT = { add_to_faction = PREV }
	}
}

DEC_HND_create_sangh = {
	DEC_mark_named_alliance_member = yes
	if = { limit = { is_in_faction = yes } leave_faction = yes }
	set_rule = { can_create_factions = yes }
	create_faction_from_template = faction_template_dec_sangh_parivar
	set_cosmetic_tag = DEC_SAN
	set_global_flag = DEC_HND_sangh
	every_other_country = {
		limit = {
			OR = { DEC_HND_is_india = yes DEC_HND_is_himalaya = yes DEC_HND_is_northwest = yes }
			DEC_is_hindu_invitee = yes
			NOT = { tag = ROOT }
		}
		set_country_flag = DEC_joined_named_faction
		if = { limit = { is_in_faction = yes } leave_faction = yes }
		ROOT = { add_to_faction = PREV }
	}
}

DEC_HND_create_diaspora = {
	DEC_mark_named_alliance_member = yes
	if = { limit = { is_in_faction = yes } leave_faction = yes }
	set_rule = { can_create_factions = yes }
	create_faction_from_template = faction_template_dec_indic_diaspora
	set_cosmetic_tag = DEC_INDIA_DIASPORA
	set_global_flag = DEC_HND_diaspora
	every_other_country = {
		limit = { DEC_HND_is_diaspora = yes DEC_is_hindu_invitee = yes NOT = { tag = ROOT } }
		set_country_flag = DEC_joined_named_faction
		if = { limit = { is_in_faction = yes } leave_faction = yes }
		ROOT = { add_to_faction = PREV }
	}
}

DEC_HND_oath_start = {
	set_country_flag = DEC_HND_oath_caller
	save_global_event_target_as = DEC_hnd_overlord
	every_other_country = {
		limit = { is_in_faction_with = ROOT is_subject = no NOT = { tag = ROOT } }
		country_event = { id = dec_hnd.1 hours = 8 }
	}
}

DEC_HND_unite_rashtra = {
	every_other_country = {
		limit = { OR = { is_subject_of = ROOT has_country_flag = DEC_HND_oath_accepted } }
		every_owned_state = { add_core_of = ROOT }
		ROOT = { annex_country = { target = PREV transfer_troops = yes } }
	}
	set_cosmetic_tag = BHA
	set_global_flag = DEC_HND_united
	custom_effect_tooltip = DEC_HND_unite_rashtra_tt
}
`;
  for (const bid of Object.keys(BLOCKS)) {
    out += `DEC_HND_wargoals_${bid} = {
	every_country = {
		limit = {
			exists = yes DEC_HND_is_${bid} = yes
			NOT = { tag = ROOT } NOT = { is_in_faction_with = ROOT } NOT = { is_subject_of = ROOT }
		}
		ROOT = { create_wargoal = { type = annex_everything target = PREV } }
	}
	set_country_flag = DEC_HND_${bid}_block_done
}
`;
  }
  out += `DEC_HND_wargoals_world = {
	every_country = {
		limit = {
			exists = yes NOT = { tag = ROOT } NOT = { is_in_faction_with = ROOT }
			NOT = { is_subject_of = ROOT } NOT = { DEC_is_hindu_nation = yes }
		}
		ROOT = { create_wargoal = { type = annex_everything target = PREV } }
	}
	set_global_flag = DEC_HND_world_crusade
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
	relative_position_id = DEC_HND_hindu_awakening
	x = ${x}
	y = ${y}
	cost = ${cost}
${pr}${byp}
	available = { ${available || "DEC_can_access_hindu_awakening = yes"} }
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
# Shared: Hindu Awakening — Индусское пробуждение
############################################

shared_focus = {
	id = DEC_HND_hindu_awakening
	icon = Ultranationalism
	x = 320
	y = 0
	cost = 5
	allow_branch = { DEC_can_access_hindu_awakening = yes }
	search_filters = { FOCUS_FILTER_POLITICAL FOCUS_FILTER_DIPLOMACY }
	available = { DEC_can_access_hindu_awakening = yes }
	completion_reward = {
		log = "[GetDateText]: [Root.GetName]: Focus DEC_HND_hindu_awakening"
		set_variable = { DEC_hnd_ns_amt = 0.10 }
		DEC_HND_boost_all = yes
		add_political_power = 50
		custom_effect_tooltip = DEC_HND_boost_plus1_tt
	}
	ai_will_do = { base = 40 }
}
`;
  lines += focusBlock({
    id: "DEC_HND_declare_rashtra", icon: "alliance", x: -24, y: 1, cost: 8,
    prereq: ["DEC_HND_hindu_awakening"],
    rewards: ["DEC_create_hindu_rashtra = yes", "custom_effect_tooltip = DEC_HND_declare_rashtra_tt"],
    available: "DEC_can_access_hindu_awakening = yes\n\t\tis_subject = no\n\t\tis_in_faction = no", ai: 45,
  });
  lines += focusBlock({
    id: "DEC_HND_call_unity", icon: "major_alliance", x: -24, y: 2, cost: 8,
    prereq: ["DEC_HND_declare_rashtra"],
    rewards: ["DEC_invite_hindu_rashtra_members = yes", "custom_effect_tooltip = DEC_HND_call_unity_tt"],
    available: "DEC_can_access_hindu_awakening = yes\n\t\tis_faction_leader = yes", ai: 40,
  });
  lines += focusBlock({
    id: "DEC_HND_call_oath", icon: "national_unity", x: -24, y: 3, cost: 10,
    prereq: ["DEC_HND_call_unity"],
    rewards: ["DEC_HND_oath_start = yes", "custom_effect_tooltip = DEC_HND_call_oath_tt"],
    available: "DEC_can_access_hindu_awakening = yes\n\t\tis_faction_leader = yes", ai: 35,
  });
  lines += focusBlock({
    id: "DEC_HND_unite_rashtra", icon: "annex_country", x: -24, y: 4, cost: 12,
    prereq: ["DEC_HND_call_oath"],
    rewards: ["DEC_HND_unite_rashtra = yes"],
    available: "DEC_can_access_hindu_awakening = yes\n\t\tis_faction_leader = yes\n\t\tany_subject_country = { always = yes }", ai: 30,
  });

  lines += focusBlock({
    id: "DEC_HND_sangh", icon: "major_alliance", x: -6, y: 1, cost: 8,
    prereq: ["DEC_HND_india"],
    rewards: ["DEC_HND_create_sangh = yes", "custom_effect_tooltip = DEC_HND_sangh_tt"],
    available: "DEC_can_access_hindu_awakening = yes\n\t\tis_subject = no", ai: 40,
  });
  lines += focusBlock({
    id: "DEC_HND_diaspora_league", icon: "major_alliance", x: 42, y: 1, cost: 8,
    prereq: ["DEC_HND_diaspora"],
    rewards: ["DEC_HND_create_diaspora = yes", "custom_effect_tooltip = DEC_HND_diaspora_tt"],
    available: "DEC_can_access_hindu_awakening = yes\n\t\tis_subject = no", ai: 40,
  });

  for (const [bid, b] of Object.entries(BLOCKS)) {
    lines += focusBlock({
      id: `DEC_HND_${bid}`, icon: "national_unity", x: b.x, y: 1, cost: 7,
      prereq: ["DEC_HND_hindu_awakening"],
      rewards: ["set_variable = { DEC_hnd_ns_amt = 0.15 }", `DEC_HND_boost_${bid} = yes`, "custom_effect_tooltip = DEC_HND_boost_plus2_tt"],
      ai: 30,
    });
    const regs = Object.entries(b.regions);
    let cursor = b.x - Math.floor(regs.reduce((a, [, r]) => a + r.tags.length, 0) / 2);
    for (const [rid, r] of regs) {
      const rx = cursor;
      lines += focusBlock({
        id: `DEC_HND_reg_${bid}_${rid}`, icon: "national_unity", x: rx, y: 2, cost: 7,
        prereq: [`DEC_HND_${bid}`],
        rewards: ["set_variable = { DEC_hnd_ns_amt = 0.20 }", `DEC_HND_boost_${bid}_${rid} = yes`, "custom_effect_tooltip = DEC_HND_boost_plus3_tt"],
        ai: 25,
      });
      r.tags.forEach((tag, j) => {
        const cx = rx + j;
        lines += focusBlock({
          id: `DEC_HND_country_${tag}`, icon: "nationalist_administration", x: cx, y: 3, cost: 6,
          prereq: [`DEC_HND_reg_${bid}_${rid}`],
          rewards: ["set_variable = { DEC_hnd_ns_amt = 0.25 }", `DEC_HND_boost_country_${tag} = yes`, "custom_effect_tooltip = DEC_HND_boost_plus4_tt"],
          ai: 15,
        });
        lines += focusBlock({
          id: `DEC_HND_uprising_${tag}`, icon: "generic_fascist_uprising", x: cx, y: 4, cost: 8,
          prereq: [`DEC_HND_country_${tag}`],
          rewards: [`DEC_HND_uprising_${tag} = yes`],
          bypass: `country_exists = ${tag}\n\t\t${tag} = { DEC_has_ns = yes }`,
          ai: 12,
        });
      });
      cursor += r.tags.length + 1;
    }
    const ups = [];
    for (const r of Object.values(b.regions)) for (const t of r.tags) ups.push(`DEC_HND_uprising_${t}`);
    const prereqLines = ups.map(u => `\tprerequisite = { focus = ${u} }`).join("\n");
    lines += `
shared_focus = {
	id = DEC_HND_crusade_${bid}
	icon = war
	relative_position_id = DEC_HND_hindu_awakening
	x = ${b.x}
	y = 5
	cost = 10
${prereqLines}
	available = { DEC_can_access_hindu_awakening = yes }
	search_filters = { FOCUS_FILTER_WAR_SUPPORT FOCUS_FILTER_ANNEXATION }
	completion_reward = {
		log = "[GetDateText]: [Root.GetName]: Focus DEC_HND_crusade_${bid}"
		DEC_HND_wargoals_${bid} = yes
		custom_effect_tooltip = DEC_HND_crusade_${bid}_tt
	}
	ai_will_do = { base = 35 }
}
`;
  }
  const crusadePrereqs = Object.keys(BLOCKS).map(bid => `\tprerequisite = { focus = DEC_HND_crusade_${bid} }`).join("\n");
  lines += `
shared_focus = {
	id = DEC_HND_crusade_world
	icon = annex_country
	relative_position_id = DEC_HND_hindu_awakening
	x = 10
	y = 6
	cost = 15
${crusadePrereqs}
	available = { DEC_can_access_hindu_awakening = yes }
	search_filters = { FOCUS_FILTER_WAR_SUPPORT FOCUS_FILTER_ANNEXATION }
	completion_reward = {
		log = "[GetDateText]: [Root.GetName]: Focus DEC_HND_crusade_world"
		DEC_HND_wargoals_world = yes
		custom_effect_tooltip = DEC_HND_crusade_world_tt
	}
	ai_will_do = { base = 50 }
}
`;
  return lines;
}

function genLocRu() {
  let lines = [
    ' # --- Индусское пробуждение ---',
    ' DEC_HINDU_RASHTRA_FACTION: "Хинду Раштра"',
    ' DEC_SANGH_PARIVAR_FACTION: "Сангх Паривар"',
    ' DEC_INDIC_DIASPORA_FACTION: "Индийская диаспора"',
    ' DEC_HND_hindu_awakening: "Индусское пробуждение"',
    ' DEC_HND_hindu_awakening_desc: "Дхармические нации Южной Азии и диаспора поднимают программу пробуждения. +1 НС всем странам списка."',
    ' DEC_HND_boost_plus1_tt: "§Y+1 НС§! всем странам Индусского пробуждения."',
    ' DEC_HND_boost_plus2_tt: "§Y+2 НС§! странам этого макроблока."',
    ' DEC_HND_boost_plus3_tt: "§Y+3 НС§! странам субрегиона."',
    ' DEC_HND_boost_plus4_tt: "§Y+4 НС§! этой стране."',
    ' DEC_HND_declare_rashtra: "Объявить Хинду Раштра"',
    ' DEC_HND_declare_rashtra_desc: "Создать альянс дхармических наций."',
    ' DEC_HND_declare_rashtra_tt: "Создаёт фракцию §YХинду Раштра§!."',
    ' DEC_HND_call_unity: "Призвать к сплочению"',
    ' DEC_HND_call_unity_desc: "Пригласить в альянс все страны списка с подходящей правой / НС идеологией."',
    ' DEC_HND_call_unity_tt: "Приглашает подходящие страны в §YХинду Раштра§!."',
    ' DEC_HND_call_oath: "Призвать к присяге"',
    ' DEC_HND_call_oath_desc: "Потребовать вассалитета от членов альянса. Отказ — война и восстание НС."',
    ' DEC_HND_call_oath_tt: "Члены альянса получают ивент присяги."',
    ' DEC_HND_unite_rashtra: "Объединить Бхарат"',
    ' DEC_HND_unite_rashtra_desc: "Слить вассалов и присягнувших в единый Бхарат."',
    ' DEC_HND_unite_rashtra_tt: "Аннексия вассалов; косметика §YБхарат§! (BHA)."',
    ' DEC_HND_sangh: "Основать Сангх Паривар"',
    ' DEC_HND_sangh_desc: "Региональная фракция материковой Южной Азии."',
    ' DEC_HND_sangh_tt: "Создаёт §YСангх Паривар§! и приглашает материковый блок."',
    ' DEC_HND_diaspora_league: "Основать Лигу диаспоры"',
    ' DEC_HND_diaspora_league_desc: "Региональная фракция индийской диаспоры."',
    ' DEC_HND_diaspora_tt: "Создаёт §YИндийскую диаспору§! и приглашает заморский блок."',
    ' DEC_HND_uprising_already_tt: "В стране уже у власти §Yнационал-социалисты§! — фокус пропускается."',
    ' DEC_HND_crusade_world: "Освободительный поход по Миру"',
    ' DEC_HND_crusade_world_desc: "Все блоковые походы объявлены. Мандат на захват остального мира."',
    ' DEC_HND_crusade_world_tt: "Казус белли на все страны вне Индусского пробуждения."',
    ' BHA: "Бхарат"',
    ' BHA_DEF: "Бхарат"',
    ' BHA_ADJ: "Бхаратск"',
    ' DEC_SAN: "Сангх Паривар"',
    ' DEC_SAN_DEF: "Сангх Паривар"',
    ' DEC_SAN_ADJ: "Сангховск"',
    ' DEC_INDIA_DIASPORA: "Индийская диаспора"',
    ' DEC_INDIA_DIASPORA_DEF: "Индийская диаспора"',
    ' DEC_INDIA_DIASPORA_ADJ: "Диаспорск"',
    ' DEC_HND_local_council: "Местный совет"',
    ' DEC_HND_local_council_desc: "Укрепить местную власть индусского пробуждения."',
    ' dec_hnd.1.t: "Присяга Хинду Раштра"',
    ' dec_hnd.1.d: "Лидер Раштры требует вассальной присяги. Отказ будет объявлен отступничеством."',
    ' dec_hnd.1.a: "Присягнуть"',
    ' dec_hnd.1.b: "Отказать"',
    ' dec_hnd.2.t: "Отказ от присяги"',
    ' dec_hnd.2.d: "Член альянса отверг присягу. Война и восстание НС неизбежны."',
    ' dec_hnd.2.a: "Так им и надо"',
  ];
  for (const [bid, b] of Object.entries(BLOCKS)) {
    lines.push(` DEC_HND_${bid}: "${b.title_ru}"`);
    lines.push(` DEC_HND_${bid}_desc: "Макроблок: ${b.title_ru}. +2 НС странам блока."`);
    lines.push(` DEC_HND_crusade_${bid}: "Освободительный поход по: ${b.title_ru}"`);
    lines.push(` DEC_HND_crusade_${bid}_desc: "После всех восстаний блока — казус белли на страны блока вне альянса."`);
    lines.push(` DEC_HND_crusade_${bid}_tt: "Казус белли на страны макроблока §Y${b.title_ru}§!."`);
    for (const [rid, r] of Object.entries(b.regions)) {
      lines.push(` DEC_HND_reg_${bid}_${rid}: "${r.title_ru}"`);
      lines.push(` DEC_HND_reg_${bid}_${rid}_desc: "Субрегион: ${r.title_ru}. +3 НС."`);
      for (const t of r.tags) {
        const nr = NAMES_RU[t] || t;
        lines.push(` DEC_HND_country_${t}: "${nr}"`);
        lines.push(` DEC_HND_country_${t}_desc: "+4 НС стране (${t})."`);
        lines.push(` DEC_HND_uprising_${t}: "Восстание индусских националистов ${nr}"`);
        lines.push(` DEC_HND_uprising_${t}_desc: "Если уже НС — пропуск. Если независима — гражданская война за НС. Если нет страны — восстание на ядрах у оккупанта. Восставшие вступают в Хинду Раштра."`);
      }
    }
  }
  return lines.join("\n") + "\n";
}

function genLocEn() {
  let lines = [
    ' # --- Hindu Awakening ---',
    ' DEC_HINDU_RASHTRA_FACTION: "Hindu Rashtra"',
    ' DEC_SANGH_PARIVAR_FACTION: "Sangh Parivar"',
    ' DEC_INDIC_DIASPORA_FACTION: "Indic Diaspora"',
    ' DEC_HND_hindu_awakening: "Hindu Awakening"',
    ' DEC_HND_hindu_awakening_desc: "Dharmic nations of South Asia and the diaspora raise an awakening programme. +1 NS across the list."',
    ' DEC_HND_boost_plus1_tt: "§Y+1 NS§! to all Hindu Awakening nations."',
    ' DEC_HND_boost_plus2_tt: "§Y+2 NS§! to nations of this macro-block."',
    ' DEC_HND_boost_plus3_tt: "§Y+3 NS§! to nations of this sub-region."',
    ' DEC_HND_boost_plus4_tt: "§Y+4 NS§! to this nation."',
    ' DEC_HND_declare_rashtra: "Declare Hindu Rashtra"',
    ' DEC_HND_declare_rashtra_desc: "Found the alliance of dharmic nations."',
    ' DEC_HND_declare_rashtra_tt: "Creates the §YHindu Rashtra§! faction."',
    ' DEC_HND_call_unity: "Call to Unity"',
    ' DEC_HND_call_unity_desc: "Invite all list nations with qualifying right-wing / NS ideology."',
    ' DEC_HND_call_unity_tt: "Invites eligible nations into §YHindu Rashtra§!."',
    ' DEC_HND_call_oath: "Call to Oath"',
    ' DEC_HND_call_oath_desc: "Demand vassalage from alliance members. Refusal means war and an NS uprising."',
    ' DEC_HND_call_oath_tt: "Alliance members receive an oath event."',
    ' DEC_HND_unite_rashtra: "Unite Bharat"',
    ' DEC_HND_unite_rashtra_desc: "Merge vassals and oath-takers into a single Bharat."',
    ' DEC_HND_unite_rashtra_tt: "Annexes vassals; applies §YBharat§! (BHA) cosmetic."',
    ' DEC_HND_sangh: "Found Sangh Parivar"',
    ' DEC_HND_sangh_desc: "Regional faction for mainland South Asia."',
    ' DEC_HND_sangh_tt: "Creates §YSangh Parivar§! and invites the mainland block."',
    ' DEC_HND_diaspora_league: "Found the Diaspora League"',
    ' DEC_HND_diaspora_league_desc: "Regional faction for the Indic diaspora."',
    ' DEC_HND_diaspora_tt: "Creates §YIndic Diaspora§! and invites the overseas block."',
    ' DEC_HND_uprising_already_tt: "National Socialists already rule — focus is bypassed."',
    ' DEC_HND_crusade_world: "Liberation Crusade for the World"',
    ' DEC_HND_crusade_world_desc: "All block crusades are declared. Mandate to conquer the rest of the world."',
    ' DEC_HND_crusade_world_tt: "Wargoals on all nations outside Hindu Awakening."',
    ' BHA: "Bharat"',
    ' BHA_DEF: "Bharat"',
    ' BHA_ADJ: "Bharatiya"',
    ' DEC_SAN: "Sangh Parivar"',
    ' DEC_SAN_DEF: "Sangh Parivar"',
    ' DEC_SAN_ADJ: "Sangh"',
    ' DEC_INDIA_DIASPORA: "Indic Diaspora"',
    ' DEC_INDIA_DIASPORA_DEF: "the Indic Diaspora"',
    ' DEC_INDIA_DIASPORA_ADJ: "Diaspora"',
    ' DEC_HND_local_council: "Local Council"',
    ' DEC_HND_local_council_desc: "Strengthen local Hindu Awakening authority."',
    ' dec_hnd.1.t: "Oath to Hindu Rashtra"',
    ' dec_hnd.1.d: "The Rashtra leader demands vassal oath. Refusal will be branded apostasy."',
    ' dec_hnd.1.a: "Swear the oath"',
    ' dec_hnd.1.b: "Refuse"',
    ' dec_hnd.2.t: "Oath Refused"',
    ' dec_hnd.2.d: "An alliance member rejected the oath. War and an NS uprising follow."',
    ' dec_hnd.2.a: "So be it"',
  ];
  for (const [bid, b] of Object.entries(BLOCKS)) {
    lines.push(` DEC_HND_${bid}: "${b.title_en}"`);
    lines.push(` DEC_HND_${bid}_desc: "Macro-block: ${b.title_en}. +2 NS to block nations."`);
    lines.push(` DEC_HND_crusade_${bid}: "Liberation Crusade for ${b.title_en}"`);
    lines.push(` DEC_HND_crusade_${bid}_desc: "After all uprisings of the block — wargoals on block nations outside the alliance."`);
    lines.push(` DEC_HND_crusade_${bid}_tt: "Wargoals on nations of the §Y${b.title_en}§! macro-block."`);
    for (const [rid, r] of Object.entries(b.regions)) {
      lines.push(` DEC_HND_reg_${bid}_${rid}: "${r.title_en}"`);
      lines.push(` DEC_HND_reg_${bid}_${rid}_desc: "Sub-region: ${r.title_en}. +3 NS."`);
      for (const t of r.tags) {
        const ne = NAMES_EN[t] || t;
        lines.push(` DEC_HND_country_${t}: "${ne}"`);
        lines.push(` DEC_HND_country_${t}_desc: "+4 NS to this nation (${t})."`);
        lines.push(` DEC_HND_uprising_${t}: "Hindu Nationalist Uprising in ${ne}"`);
        lines.push(` DEC_HND_uprising_${t}_desc: "If NS already rules — bypass. If independent — civil war for NS. If missing — uprising on cores vs occupier. Rebels join Hindu Rashtra."`);
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
  fs.writeFileSync(path.join(ROOT, "common/scripted_triggers/DEC_hindu_awakening_triggers.txt"), genTriggers(), "utf8");
  fs.writeFileSync(path.join(ROOT, "common/scripted_effects/DEC_hindu_awakening.txt"), genEffects(), "utf8");
  fs.writeFileSync(path.join(ROOT, "common/national_focus/DEC_hindu_awakening_shared.txt"), genFocuses(), "utf8");
  patchLoc(path.join(ROOT, "localisation/russian/DEC_l_russian.yml"), [" # --- Индусское пробуждение"], genLocRu());
  let ru = fs.readFileSync(path.join(ROOT, "localisation/russian/DEC_l_russian.yml"), "utf8");
  if (!ru.includes("DEC_HND_hindu_awakening")) {
    fs.writeFileSync(path.join(ROOT, "localisation/russian/DEC_l_russian.yml"), ru.replace(/\s+$/, "") + "\n\n" + genLocRu(), "utf8");
  }
  let en = fs.readFileSync(path.join(ROOT, "localisation/english/DEC_l_english.yml"), "utf8");
  if (en.includes(" # --- Hindu Awakening")) {
    patchLoc(path.join(ROOT, "localisation/english/DEC_l_english.yml"), [" # --- Hindu Awakening"], genLocEn());
  } else {
    fs.writeFileSync(path.join(ROOT, "localisation/english/DEC_l_english.yml"), en.replace(/\s+$/, "") + "\n\n" + genLocEn(), "utf8");
  }
  console.log("tags", allTags().length);
  console.log("focus KB", Math.round(fs.statSync(path.join(ROOT, "common/national_focus/DEC_hindu_awakening_shared.txt")).size / 1024));
}

main();
