# -*- coding: utf-8 -*-
"""Generate White Revival shared focus / effects / loc from TZ."""
from pathlib import Path

ROOT = Path(r"c:\git\decolonizaciya")

# Macro → region → tags
BLOCKS = {
    "europe": {
        "title_ru": "Европа",
        "title_en": "Europe",
        "x": -20,
        "regions": {
            "west": {
                "title_ru": "Западная Европа",
                "title_en": "Western Europe",
                "tags": ["ENG", "FRA", "BEL", "HOL", "LUX", "IRE"],
            },
            "north": {
                "title_ru": "Северная Европа",
                "title_en": "Northern Europe",
                "tags": ["SWE", "NRY", "DEN", "ICE"],
            },
            "central": {
                "title_ru": "Центральная Европа",
                "title_en": "Central Europe",
                "tags": ["GER", "AUS", "SWI", "LIC", "POL", "CZE", "SLO", "HUN"],
            },
            "east": {
                "title_ru": "Восточная Европа и Балканы",
                "title_en": "Eastern Europe and Balkans",
                "tags": [
                    "ITA", "SPR", "POR", "GRE", "CYP", "MLT",
                    "UKR", "BLR", "MLV", "LAT", "LIT",
                    "ROM", "BUL", "SER", "CRO", "SLV", "BOS", "ALB", "MNT", "KOS", "FYR",
                    "ADO", "SMA", "HLS",
                ],
            },
            "russian": {
                "title_ru": "Русский блок",
                "title_en": "Russian Block",
                "tags": ["BGR", "SMO", "VOR", "SEV", "SOV", "RUS", "VYK", "DON", "KUB"],
            },
        },
    },
    "na": {
        "title_ru": "Северная Америка",
        "title_en": "North America",
        "x": 8,
        "regions": {
            "usa": {"title_ru": "США", "title_en": "United States", "tags": ["USA"]},
            "canada": {"title_ru": "Канада", "title_en": "Canada", "tags": ["CAN"]},
        },
    },
    "colonies": {
        "title_ru": "Белые колонии",
        "title_en": "White Colonies",
        "x": 18,
        "regions": {
            "saf": {"title_ru": "Южная Африка", "title_en": "Southern Africa", "tags": ["APT"]},
            "rho": {"title_ru": "Родезия", "title_en": "Rhodesia", "tags": ["RHO"]},
            "cone": {
                "title_ru": "Южный конус",
                "title_en": "Southern Cone",
                "tags": ["ARG", "URG", "CHL", "BRA"],
            },
        },
    },
    "finno": {
        "title_ru": "Финно-угры",
        "title_en": "Finno-Ugrics",
        "x": 30,
        "regions": {
            "fin": {"title_ru": "Финляндия", "title_en": "Finland", "tags": ["FIN"]},
            "est": {"title_ru": "Эстония", "title_en": "Estonia", "tags": ["EST"]},
            "north_finno": {
                "title_ru": "Северные финно-угры",
                "title_en": "Northern Finno-Ugrics",
                "tags": ["IGR", "KAE", "LAP", "BJA"],
            },
        },
    },
    "oceania": {
        "title_ru": "Океания",
        "title_en": "Oceania",
        "x": 42,
        "regions": {
            "ast": {"title_ru": "Австралия", "title_en": "Australia", "tags": ["AST"]},
            "nzl": {"title_ru": "Новая Зеландия", "title_en": "New Zealand", "tags": ["NZL"]},
        },
    },
}

NAMES_RU = {
    "ENG": "Великобритании", "FRA": "Франции", "BEL": "Бельгии", "HOL": "Нидерландов",
    "LUX": "Люксембурга", "IRE": "Ирландии", "SWE": "Швеции", "NRY": "Норвегии",
    "DEN": "Дании", "ICE": "Исландии", "GER": "Германии", "AUS": "Австрии",
    "SWI": "Швейцарии", "LIC": "Лихтенштейна", "POL": "Польши", "CZE": "Чехии",
    "SLO": "Словакии", "HUN": "Венгрии", "ITA": "Италии", "SPR": "Испании",
    "POR": "Португалии", "GRE": "Греции", "CYP": "Кипра", "MLT": "Мальты",
    "UKR": "Украины", "BLR": "Беларуси", "MLV": "Молдовы", "LAT": "Латвии",
    "LIT": "Литвы", "ROM": "Румынии", "BUL": "Болгарии", "SER": "Сербии",
    "CRO": "Хорватии", "SLV": "Словении", "BOS": "Боснии", "ALB": "Албании",
    "MNT": "Черногории", "KOS": "Косово", "FYR": "Северной Македонии",
    "ADO": "Андорры", "SMA": "Сан-Марино", "HLS": "Ватикана",
    "BGR": "Белгорода", "SMO": "Смоленска", "VOR": "Воронежа", "SEV": "Северии",
    "SOV": "России", "RUS": "Локотской республики", "VYK": "Верхнеяицкого Войска",
    "DON": "Дона", "KUB": "Кубани", "USA": "США", "CAN": "Канады",
    "APT": "Апартеида", "RHO": "Родезии", "ARG": "Аргентины", "URG": "Уругвая",
    "CHL": "Чили", "BRA": "Бразилии", "FIN": "Финляндии", "EST": "Эстонии",
    "IGR": "Ингрии", "KAE": "Карелии", "LAP": "Лапландии", "BJA": "Бьярмии",
    "AST": "Австралии", "NZL": "Новой Зеландии",
}
NAMES_EN = {
    "ENG": "Britain", "FRA": "France", "BEL": "Belgium", "HOL": "the Netherlands",
    "LUX": "Luxembourg", "IRE": "Ireland", "SWE": "Sweden", "NRY": "Norway",
    "DEN": "Denmark", "ICE": "Iceland", "GER": "Germany", "AUS": "Austria",
    "SWI": "Switzerland", "LIC": "Liechtenstein", "POL": "Poland", "CZE": "Czechia",
    "SLO": "Slovakia", "HUN": "Hungary", "ITA": "Italy", "SPR": "Spain",
    "POR": "Portugal", "GRE": "Greece", "CYP": "Cyprus", "MLT": "Malta",
    "UKR": "Ukraine", "BLR": "Belarus", "MLV": "Moldova", "LAT": "Latvia",
    "LIT": "Lithuania", "ROM": "Romania", "BUL": "Bulgaria", "SER": "Serbia",
    "CRO": "Croatia", "SLV": "Slovenia", "BOS": "Bosnia", "ALB": "Albania",
    "MNT": "Montenegro", "KOS": "Kosovo", "FYR": "North Macedonia",
    "ADO": "Andorra", "SMA": "San Marino", "HLS": "the Holy See",
    "BGR": "Belgorod", "SMO": "Smolensk", "VOR": "Voronezh", "SEV": "Severia",
    "SOV": "Russia", "RUS": "Lokot", "VYK": "the Yaik Host",
    "DON": "the Don", "KUB": "Kuban", "USA": "the United States", "CAN": "Canada",
    "APT": "Apartheid", "RHO": "Rhodesia", "ARG": "Argentina", "URG": "Uruguay",
    "CHL": "Chile", "BRA": "Brazil", "FIN": "Finland", "EST": "Estonia",
    "IGR": "Ingria", "KAE": "Karelia", "LAP": "Lapland", "BJA": "Bjarmia",
    "AST": "Australia", "NZL": "New Zealand",
}


def all_tags():
    tags = []
    for b in BLOCKS.values():
        for r in b["regions"].values():
            tags.extend(r["tags"])
    return tags


def trigger_or_tags(tags, indent="\t\t"):
    lines = [f"{indent}OR = {{"]
    for t in tags:
        lines.append(f"{indent}\toriginal_tag = {t}")
        lines.append(f"{indent}\ttag = {t}")
    lines.append(f"{indent}}}")
    return "\n".join(lines)


def gen_triggers():
    parts = []
    parts.append("""############################################
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

DEC_owns_rome = {
	owns_state = 81 # Lazio / Rome
}
""")
    # Membership = all tags in blocks
    tags = all_tags()
    parts.append("DEC_is_white_brotherhood_nation = {\n\tOR = {")
    for t in tags:
        parts.append(f"\t\toriginal_tag = {t}")
        parts.append(f"\t\ttag = {t}")
    parts.append("""\t\thas_cosmetic_tag = DEC_RNS
\t\thas_cosmetic_tag = DEC_RNS_imperial
\t\thas_cosmetic_tag = DEC_RNS_rdk
\t\thas_cosmetic_tag = DEC_RNS_tricolor
\t\thas_cosmetic_tag = DEC_RNS_wbw
\t\thas_cosmetic_tag = WBR
\t}
}
""")
    for bid, b in BLOCKS.items():
        tags_b = []
        for r in b["regions"].values():
            tags_b.extend(r["tags"])
        parts.append(f"DEC_WHT_is_{bid} = {{\n{trigger_or_tags(tags_b)}\n}}")
        for rid, r in b["regions"].items():
            parts.append(
                f"DEC_WHT_is_{bid}_{rid} = {{\n{trigger_or_tags(r['tags'])}\n}}"
            )

    # Block complete flags / uprising focus lists
    for bid, b in BLOCKS.items():
        ups = []
        for r in b["regions"].values():
            for t in r["tags"]:
                ups.append(f"has_completed_focus = DEC_WHT_uprising_{t}")
        parts.append(
            f"""DEC_WHT_{bid}_block_complete = {{
\tOR = {{
\t\thas_country_flag = DEC_WHT_{bid}_block_done
\t\tAND = {{
"""
            + "\n".join(f"\t\t\t{u}" for u in ups)
            + """
\t\t}
\t}
}
"""
        )

    parts.append("""DEC_can_access_white_revival = {
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
""")
    return "\n".join(parts)


def uprising_effect(tag: str) -> str:
    return f"""DEC_WHT_uprising_{tag} = {{
	log = "DEC_WHT: NS uprising {tag}"
	if = {{
		limit = {{
			country_exists = {tag}
			{tag} = {{ DEC_has_ns = yes }}
		}}
		custom_effect_tooltip = DEC_WHT_uprising_already_tt
	}}
	else_if = {{
		limit = {{
			country_exists = {tag}
			{tag} = {{ is_subject = no }}
		}}
		{tag} = {{
			set_variable = {{ party_pop_array^21 = 0.45 }}
			add_popularity = {{ ideology = nationalist popularity = 0.45 }}
			recalculate_party = yes
			start_civil_war = {{
				ideology = nationalist
				size = 0.45
			}}
		}}
		random_country = {{
			limit = {{
				original_tag = {tag}
				has_government = nationalist
				has_war_with = {tag}
			}}
			DEC_WHT_ns_conversion_setup = yes
			if = {{
				limit = {{ ROOT = {{ is_in_faction = yes }} }}
				ROOT = {{ add_to_faction = PREV }}
				set_country_flag = DEC_joined_named_faction
			}}
		}}
	}}
	else_if = {{
		limit = {{ country_exists = {tag} }}
		{tag} = {{
			OVERLORD = {{ set_temp_variable = {{ DEC_wht_overlord = THIS.id }} }}
			DEC_WHT_ns_conversion_setup = yes
			if = {{ limit = {{ is_subject = yes }} OVERLORD = {{ set_autonomy = {{ target = PREV autonomy_state = autonomy_free }} }} }}
		}}
		if = {{
			limit = {{ ROOT = {{ is_in_faction = yes }} }}
			ROOT = {{ add_to_faction = {tag} }}
		}}
		{tag} = {{
			if = {{
				limit = {{ has_variable = DEC_wht_overlord }}
				declare_war_on = {{ target = var:DEC_wht_overlord type = annex_everything }}
			}}
		}}
	}}
	else = {{
		random_state = {{
			limit = {{ is_core_of = {tag} }}
			OWNER = {{ release = {tag} }}
		}}
		if = {{
			limit = {{ country_exists = {tag} }}
			{tag} = {{ DEC_WHT_ns_conversion_setup = yes }}
			random_state = {{
				limit = {{ is_core_of = {tag} NOT = {{ is_owned_by = {tag} }} }}
				OWNER = {{ set_temp_variable = {{ DEC_wht_occ = THIS.id }} }}
			}}
			if = {{
				limit = {{ ROOT = {{ is_in_faction = yes }} }}
				ROOT = {{ add_to_faction = {tag} }}
			}}
			{tag} = {{
				if = {{
					limit = {{ has_variable = DEC_wht_occ }}
					declare_war_on = {{ target = var:DEC_wht_occ type = annex_everything }}
				}}
			}}
		}}
	}}
}}
"""


def boost_country(tag: str) -> str:
    return f"""DEC_WHT_boost_country_{tag} = {{
	if = {{
		limit = {{ country_exists = {tag} }}
		{tag} = {{
			set_temp_variable = {{ DEC_wht_ns_amt = ROOT.DEC_wht_ns_amt }}
			DEC_WHT_add_ns_amt = yes
		}}
	}}
}}
"""


def gen_effects():
    out = []
    out.append("""############################################
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
""")
    for bid in BLOCKS:
        out.append(
            f"""DEC_WHT_boost_{bid} = {{
	every_country = {{
		limit = {{ DEC_WHT_is_{bid} = yes exists = yes }}
		set_temp_variable = {{ DEC_wht_ns_amt = ROOT.DEC_wht_ns_amt }}
		DEC_WHT_add_ns_amt = yes
	}}
}}
"""
        )
        for rid in BLOCKS[bid]["regions"]:
            out.append(
                f"""DEC_WHT_boost_{bid}_{rid} = {{
	every_country = {{
		limit = {{ DEC_WHT_is_{bid}_{rid} = yes exists = yes }}
		set_temp_variable = {{ DEC_wht_ns_amt = ROOT.DEC_wht_ns_amt }}
		DEC_WHT_add_ns_amt = yes
	}}
}}
"""
            )

    for t in all_tags():
        out.append(boost_country(t))
        out.append(uprising_effect(t))

    out.append("""
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
""")

    for bid in BLOCKS:
        out.append(
            f"""DEC_WHT_wargoals_{bid} = {{
	every_country = {{
		limit = {{
			exists = yes
			DEC_WHT_is_{bid} = yes
			NOT = {{ tag = ROOT }}
			NOT = {{ is_in_faction_with = ROOT }}
			NOT = {{ is_subject_of = ROOT }}
		}}
		ROOT = {{ create_wargoal = {{ type = annex_everything target = PREV }} }}
	}}
	set_country_flag = DEC_WHT_{bid}_block_done
}}
"""
        )

    out.append("""DEC_WHT_wargoals_world = {
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
""")

    # keep APT/RHO restore helpers from before
    out.append(Path(ROOT / "common/scripted_effects/DEC_white_revival.txt").read_text(encoding="utf-8").split("DEC_restore_apartheid")[0] if False else "")
    # Always append restore effects
    out.append(Path(r"c:\git\decolonizaciya\tools\_wht_restore_snippet.txt").read_text(encoding="utf-8") if Path(r"c:\git\decolonizaciya\tools\_wht_restore_snippet.txt").exists() else "")

    return "\n".join(out)


def focus_block(fid, icon, x, y, cost, prereq, reward_lines, bypass=None, available="DEC_can_access_white_revival = yes", ai=20):
    byp = ""
    if bypass:
        byp = f"\n\tbypass = {{\n\t\t{bypass}\n\t}}"
    pr = "\n".join(f"\tprerequisite = {{ focus = {p} }}" for p in prereq)
    rew = "\n".join("\t\t" + l for l in reward_lines)
    return f"""
shared_focus = {{
	id = {fid}
	icon = {icon}
	relative_position_id = DEC_WHT_white_revival
	x = {x}
	y = {y}
	cost = {cost}
{pr}{byp}
	available = {{ {available} }}
	search_filters = {{ FOCUS_FILTER_POLITICAL FOCUS_FILTER_DIPLOMACY }}
	completion_reward = {{
		log = "[GetDateText]: [Root.GetName]: Focus {fid}"
{rew}
	}}
	ai_will_do = {{ base = {ai} }}
}}
"""


def gen_focuses():
    lines = []
    lines.append("""############################################
# Shared: White Revival — full TZ tree
# Generated — do not hand-edit large sections
############################################

shared_focus = {
	id = DEC_WHT_white_revival
	icon = GFX_focus_generic_support_the_left_right
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
""")
    # Parallel alliance
    lines.append(focus_block(
        "DEC_WHT_declare_brotherhood", "GFX_goal_tripartite_pact", -28, 1, 8,
        ["DEC_WHT_white_revival"],
        ["DEC_create_white_brotherhood = yes", "custom_effect_tooltip = DEC_WHT_declare_brotherhood_tt"],
        available="DEC_can_access_white_revival = yes\n\t\tis_subject = no\n\t\tis_in_faction = no",
        ai=45,
    ))
    lines.append(focus_block(
        "DEC_WHT_call_unity", "GFX_goal_generic_major_alliance", -28, 2, 8,
        ["DEC_WHT_declare_brotherhood"],
        ["DEC_invite_white_brotherhood_members = yes", "custom_effect_tooltip = DEC_WHT_call_unity_tt"],
        available="DEC_can_access_white_revival = yes\n\t\tis_faction_leader = yes",
        ai=40,
    ))
    lines.append(focus_block(
        "DEC_WHT_call_oath", "GFX_goal_generic_national_unity", -28, 3, 10,
        ["DEC_WHT_call_unity"],
        ["DEC_WHT_oath_start = yes", "custom_effect_tooltip = DEC_WHT_call_oath_tt"],
        available="DEC_can_access_white_revival = yes\n\t\tis_faction_leader = yes\n\t\tDEC_owns_rome = yes",
        ai=35,
    ))
    lines.append(focus_block(
        "DEC_WHT_unite_brotherhood", "GFX_goal_generic_occupy_states_ongoing_war", -28, 4, 12,
        ["DEC_WHT_call_oath"],
        ["DEC_WHT_unite_brotherhood = yes"],
        available="DEC_can_access_white_revival = yes\n\t\tis_faction_leader = yes\n\t\tDEC_owns_rome = yes\n\t\tany_subject_country = { always = yes }",
        ai=30,
    ))

    # Macros
    for bid, b in BLOCKS.items():
        lines.append(focus_block(
            f"DEC_WHT_{bid}", "GFX_goal_generic_national_unity", b["x"], 1, 7,
            ["DEC_WHT_white_revival"],
            [
                "set_variable = { DEC_wht_ns_amt = 0.15 }",
                f"DEC_WHT_boost_{bid} = yes",
                "custom_effect_tooltip = DEC_WHT_boost_plus2_tt",
            ],
            ai=30,
        ))

        # regions
        regs = list(b["regions"].items())
        # center regions under macro
        span = max(len(regs) * 4, 4)
        start_x = b["x"] - span // 2
        for i, (rid, r) in enumerate(regs):
            rx = start_x + i * max(3, len(r["tags"]))
            lines.append(focus_block(
                f"DEC_WHT_reg_{bid}_{rid}", "GFX_goal_generic_national_unity", rx, 2, 7,
                [f"DEC_WHT_{bid}"],
                [
                    "set_variable = { DEC_wht_ns_amt = 0.20 }",
                    f"DEC_WHT_boost_{bid}_{rid} = yes",
                    "custom_effect_tooltip = DEC_WHT_boost_plus3_tt",
                ],
                ai=25,
            ))
            for j, tag in enumerate(r["tags"]):
                cx = rx + j
                lines.append(focus_block(
                    f"DEC_WHT_country_{tag}", "GFX_focus_generic_self_management", cx, 3, 6,
                    [f"DEC_WHT_reg_{bid}_{rid}"],
                    [
                        "set_variable = { DEC_wht_ns_amt = 0.25 }",
                        f"DEC_WHT_boost_country_{tag} = yes",
                        "custom_effect_tooltip = DEC_WHT_boost_plus4_tt",
                    ],
                    ai=15,
                ))
                lines.append(focus_block(
                    f"DEC_WHT_uprising_{tag}", "GFX_goal_generic_territory_or_war", cx, 4, 8,
                    [f"DEC_WHT_country_{tag}"],
                    [f"DEC_WHT_uprising_{tag} = yes"],
                    bypass=f"country_exists = {tag}\n\t\t{tag} = {{ DEC_has_ns = yes }}",
                    ai=12,
                ))

        # crusade for block — prerequisites all uprising focuses
        ups = [f"DEC_WHT_uprising_{t}" for r in b["regions"].values() for t in r["tags"]]
        # HOI4 allows multiple prerequisite blocks as AND of ORs; for "all" we need each as separate prerequisite
        prereq_lines = "\n".join(f"\tprerequisite = {{ focus = {u} }}" for u in ups)
        lines.append(f"""
shared_focus = {{
	id = DEC_WHT_crusade_{bid}
	icon = GFX_goal_generic_major_war
	relative_position_id = DEC_WHT_white_revival
	x = {b['x']}
	y = 5
	cost = 10
{prereq_lines}
	available = {{
		DEC_can_access_white_revival = yes
		DEC_WHT_{bid}_block_complete = yes
	}}
	search_filters = {{ FOCUS_FILTER_WAR_SUPPORT FOCUS_FILTER_ANNEXATION }}
	completion_reward = {{
		log = "[GetDateText]: [Root.GetName]: Focus DEC_WHT_crusade_{bid}"
		DEC_WHT_wargoals_{bid} = yes
		custom_effect_tooltip = DEC_WHT_crusade_{bid}_tt
	}}
	ai_will_do = {{ base = 35 }}
}}
""")

    # World crusade
    crusade_prereqs = "\n".join(f"\tprerequisite = {{ focus = DEC_WHT_crusade_{bid} }}" for bid in BLOCKS)
    lines.append(f"""
shared_focus = {{
	id = DEC_WHT_crusade_world
	icon = GFX_goal_generic_occupy_states_ongoing_war
	relative_position_id = DEC_WHT_white_revival
	x = 8
	y = 6
	cost = 15
{crusade_prereqs}
	available = {{ DEC_can_access_white_revival = yes }}
	search_filters = {{ FOCUS_FILTER_WAR_SUPPORT FOCUS_FILTER_ANNEXATION }}
	completion_reward = {{
		log = "[GetDateText]: [Root.GetName]: Focus DEC_WHT_crusade_world"
		DEC_WHT_wargoals_world = yes
		custom_effect_tooltip = DEC_WHT_crusade_world_tt
	}}
	ai_will_do = {{ base = 50 }}
}}
""")
    return "".join(lines)


def gen_loc_ru():
    lines = [
        " # --- Белое возрождение (full) ---",
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
        ' DEC_WHT_call_oath_desc: "Владея Римом (Лацио), потребовать вассалитета от членов альянса. Отказ — война и восстание НС."',
        ' DEC_WHT_call_oath_tt: "Члены альянса получают ивент присяги. Нужен контроль §YРима (штат 81)§!."',
        ' DEC_WHT_unite_brotherhood: "Объединить Братство"',
        ' DEC_WHT_unite_brotherhood_desc: "Слить вассалов и присягнувших в единое государство Белое Братство."',
        ' DEC_WHT_unite_brotherhood_tt: "Аннексия вассалов/присягнувших; косметика §YБелое Братство§! (WBR)."',
        ' DEC_WHT_uprising_already_tt: "В стране уже у власти §Yнационал-социалисты§! — фокус пропускается."',
        ' DEC_WHT_crusade_world: "Крестовый поход по Миру"',
        ' DEC_WHT_crusade_world_desc: "Все блоковые крестовые походы объявлены. Мандат на захват остального мира."',
        ' DEC_WHT_crusade_world_tt: "Казус белли на все страны вне Белого Братства."',
        ' WBR_fascism: "Белое Братство"',
        ' WBR_democratic: "Белое Братство"',
        ' WBR_neutrality: "Белое Братство"',
        ' WBR_communism: "Белое Братство"',
        ' WBR_nationalist: "Белое Братство"',
        ' WBR_fascism_DEF: "Белое Братство"',
        ' WBR_democratic_DEF: "Белое Братство"',
        ' WBR_neutrality_DEF: "Белое Братство"',
        ' WBR_communism_DEF: "Белое Братство"',
        ' WBR_nationalist_DEF: "Белое Братство"',
        ' WBR_fascism_ADJ: "Белобратск"',
        ' WBR_democratic_ADJ: "Белобратск"',
        ' WBR_neutrality_ADJ: "Белобратск"',
        ' WBR_communism_ADJ: "Белобратск"',
        ' WBR_nationalist_ADJ: "Белобратск"',
        ' dec_wht.1.t: "Присяга Белому Братству"',
        ' dec_wht.1.d: "Лидер Братства, владея Римом, требует вассальной присяги. Отказ будет объявлен отступничеством."',
        ' dec_wht.1.a: "Присягнуть"',
        ' dec_wht.1.b: "Отказать"',
        ' dec_wht.2.t: "Отказ от присяги"',
        ' dec_wht.2.d: "Член альянса отверг присягу. Война и восстание НС неизбежны."',
        ' dec_wht.2.a: "Так им и надо"',
    ]
    for bid, b in BLOCKS.items():
        lines.append(f' DEC_WHT_{bid}: "{b["title_ru"]}"')
        lines.append(f' DEC_WHT_{bid}_desc: "Макроблок: {b["title_ru"]}. +2 НС странам блока."')
        lines.append(f' DEC_WHT_crusade_{bid}: "Крестовый поход по: {b["title_ru"]}"')
        lines.append(f' DEC_WHT_crusade_{bid}_desc: "После всех восстаний блока — казус белли на страны блока вне альянса."')
        lines.append(f' DEC_WHT_crusade_{bid}_tt: "Казус белли на страны макроблока §Y{b["title_ru"]}§!."')
        for rid, r in b["regions"].items():
            lines.append(f' DEC_WHT_reg_{bid}_{rid}: "{r["title_ru"]}"')
            lines.append(f' DEC_WHT_reg_{bid}_{rid}_desc: "Субрегион: {r["title_ru"]}. +3 НС."')
            for t in r["tags"]:
                nr = NAMES_RU.get(t, t)
                lines.append(f' DEC_WHT_country_{t}: "{nr}"')
                lines.append(f' DEC_WHT_country_{t}_desc: "+4 НС стране ({t})."')
                lines.append(f' DEC_WHT_uprising_{t}: "Восстание белых националистов {nr}"')
                lines.append(
                    f' DEC_WHT_uprising_{t}_desc: "Если уже НС — пропуск. Если независима — гражданская война за НС. Если нет страны — восстание на ядрах у оккупанта. Восставшие вступают в Белое Братство."'
                )
    return "\n".join(lines) + "\n"


def gen_loc_en():
    lines = [
        " # --- White Revival (full) ---",
        ' DEC_WHITE_BROTHERHOOD_FACTION: "White Brotherhood"',
        ' DEC_WHT_white_revival: "White Awakening"',
        ' DEC_WHT_white_revival_desc: "Rightists and National Socialists of white nations raise a revival programme. +1 NS drift across the list."',
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
        ' DEC_WHT_call_oath_desc: "Controlling Rome (Lazio), demand vassalage from alliance members. Refusal means war and an NS uprising."',
        ' DEC_WHT_call_oath_tt: "Alliance members receive an oath event. Requires control of §YRome (state 81)§!."',
        ' DEC_WHT_unite_brotherhood: "Unite the Brotherhood"',
        ' DEC_WHT_unite_brotherhood_desc: "Merge vassals and oath-takers into a single White Brotherhood state."',
        ' DEC_WHT_unite_brotherhood_tt: "Annexes vassals/oath-takers; applies §YWhite Brotherhood§! (WBR) cosmetic."',
        ' DEC_WHT_uprising_already_tt: "National Socialists already rule — focus is bypassed."',
        ' DEC_WHT_crusade_world: "Crusade for the World"',
        ' DEC_WHT_crusade_world_desc: "All block crusades are declared. Mandate to conquer the rest of the world."',
        ' DEC_WHT_crusade_world_tt: "Wargoals on all nations outside the White Brotherhood."',
        ' WBR_fascism: "White Brotherhood"',
        ' WBR_democratic: "White Brotherhood"',
        ' WBR_neutrality: "White Brotherhood"',
        ' WBR_communism: "White Brotherhood"',
        ' WBR_nationalist: "White Brotherhood"',
        ' WBR_fascism_DEF: "the White Brotherhood"',
        ' WBR_democratic_DEF: "the White Brotherhood"',
        ' WBR_neutrality_DEF: "the White Brotherhood"',
        ' WBR_communism_DEF: "the White Brotherhood"',
        ' WBR_nationalist_DEF: "the White Brotherhood"',
        ' WBR_fascism_ADJ: "White Brotherhood"',
        ' WBR_democratic_ADJ: "White Brotherhood"',
        ' WBR_neutrality_ADJ: "White Brotherhood"',
        ' WBR_communism_ADJ: "White Brotherhood"',
        ' WBR_nationalist_ADJ: "White Brotherhood"',
        ' dec_wht.1.t: "Oath to the White Brotherhood"',
        ' dec_wht.1.d: "The Brotherhood leader, holding Rome, demands vassal oath. Refusal will be branded apostasy."',
        ' dec_wht.1.a: "Swear the oath"',
        ' dec_wht.1.b: "Refuse"',
        ' dec_wht.2.t: "Oath Refused"',
        ' dec_wht.2.d: "An alliance member rejected the oath. War and an NS uprising follow."',
        ' dec_wht.2.a: "So be it"',
    ]
    for bid, b in BLOCKS.items():
        lines.append(f' DEC_WHT_{bid}: "{b["title_en"]}"')
        lines.append(f' DEC_WHT_{bid}_desc: "Macro-block: {b["title_en"]}. +2 NS to block nations."')
        lines.append(f' DEC_WHT_crusade_{bid}: "Crusade for {b["title_en"]}"')
        lines.append(f' DEC_WHT_crusade_{bid}_desc: "After all uprisings of the block — wargoals on block nations outside the alliance."')
        lines.append(f' DEC_WHT_crusade_{bid}_tt: "Wargoals on nations of the §Y{b["title_en"]}§! macro-block."')
        for rid, r in b["regions"].items():
            lines.append(f' DEC_WHT_reg_{bid}_{rid}: "{r["title_en"]}"')
            lines.append(f' DEC_WHT_reg_{bid}_{rid}_desc: "Sub-region: {r["title_en"]}. +3 NS."')
            for t in r["tags"]:
                ne = NAMES_EN.get(t, t)
                lines.append(f' DEC_WHT_country_{t}: "{ne}"')
                lines.append(f' DEC_WHT_country_{t}_desc: "+4 NS to this nation ({t})."')
                lines.append(f' DEC_WHT_uprising_{t}: "White Nationalist Uprising in {ne}"')
                lines.append(
                    f' DEC_WHT_uprising_{t}_desc: "If NS already rules — bypass. If independent — civil war for NS. If missing — uprising on cores vs occupier. Rebels join the White Brotherhood."'
                )
    return "\n".join(lines) + "\n"


def main():
    # Write restore snippet from existing file
    old = (ROOT / "common/scripted_effects/DEC_white_revival.txt").read_text(encoding="utf-8")
    if "DEC_restore_apartheid" in old:
        snippet = "DEC_restore_apartheid" + old.split("DEC_restore_apartheid", 1)[1]
        (ROOT / "tools/_wht_restore_snippet.txt").write_text(snippet, encoding="utf-8")

    triggers = gen_triggers()
    (ROOT / "common/scripted_triggers/DEC_white_revival_triggers.txt").write_text(triggers, encoding="utf-8")

    effects = gen_effects()
    # Append restore
    snip_path = ROOT / "tools/_wht_restore_snippet.txt"
    if snip_path.exists():
        effects += "\n" + snip_path.read_text(encoding="utf-8")
    (ROOT / "common/scripted_effects/DEC_white_revival.txt").write_text(effects, encoding="utf-8")

    focuses = gen_focuses()
    (ROOT / "common/national_focus/DEC_white_revival_shared.txt").write_text(focuses, encoding="utf-8")

    # Patch localisation: replace old WHT section markers
    for loc_path, gen in [
        (ROOT / "localisation/russian/DEC_l_russian.yml", gen_loc_ru),
        (ROOT / "localisation/english/DEC_l_english.yml", gen_loc_en),
    ]:
        text = loc_path.read_text(encoding="utf-8")
        marker = " # --- Белое возрождение" if "russian" in str(loc_path) else " # --- White Revival"
        # Also handle previous markers
        for m in [" # --- Белое возрождение", " # --- White Revival"]:
            if m in text:
                text = text.split(m)[0].rstrip() + "\n\n" + gen()
                break
        else:
            text = text.rstrip() + "\n\n" + gen()
        loc_path.write_text(text, encoding="utf-8")

    print("tags:", len(all_tags()))
    print("focus file KB:", round((ROOT / "common/national_focus/DEC_white_revival_shared.txt").stat().st_size / 1024))
    print("effects KB:", round((ROOT / "common/scripted_effects/DEC_white_revival.txt").stat().st_size / 1024))


if __name__ == "__main__":
    main()
