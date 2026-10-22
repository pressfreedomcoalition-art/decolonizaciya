/* Patch generators + regenerate; fix white/cal access & white effects */
const fs = require("fs");
const path = require("path");
const { execSync } = require("child_process");
const TOOLS = __dirname;
const ROOT = path.resolve(__dirname, "..");

const ALL_ROOTS = [
  "DEC_WHT_white_revival",
  "DEC_BAW_black_awakening",
  "DEC_IND_indigenous_awakening",
  "DEC_ASI_asian_awakening",
  "DEC_HND_hindu_awakening",
  "DEC_CAL_world_caliphate",
];

function exclusivityBlock(own) {
  const others = ALL_ROOTS.filter((x) => x !== own);
  return (
    "\tNOT = {\n\t\tOR = {\n" +
    others.map((f) => `\t\t\thas_completed_focus = ${f}`).join("\n") +
    "\n\t\t}\n\t}"
  );
}

function makeUprisingFn(pfx, vp) {
  return `function uprisingEffect(tag) {
  return \`DEC_${pfx}_uprising_\${tag} = {
	log = "DEC_${pfx}: NS uprising \${tag}"
	if = {
		limit = { country_exists = \${tag} \${tag} = { DEC_has_ns = yes } }
		custom_effect_tooltip = DEC_${pfx}_uprising_already_tt
	}
	else_if = {
		limit = { OR = { tag = \${tag} original_tag = \${tag} } }
		DEC_${pfx}_ns_conversion_setup = yes
		custom_effect_tooltip = DEC_${pfx}_self_convert_tt
	}
	else_if = {
		limit = { country_exists = \${tag} \${tag} = { is_subject = no } }
		\${tag} = {
			set_variable = { party_pop_array^21 = 0.45 }
			add_popularity = { ideology = nationalist popularity = 0.45 }
			recalculate_party = yes
			start_civil_war = { ideology = nationalist size = 0.45 }
		}
		random_country = {
			limit = { original_tag = \${tag} has_government = nationalist has_war_with = \${tag} }
			DEC_${pfx}_ns_conversion_setup = yes
			if = { limit = { ROOT = { is_in_faction = yes } } ROOT = { add_to_faction = PREV } set_country_flag = DEC_joined_named_faction }
		}
	}
	else_if = {
		limit = { country_exists = \${tag} }
		\${tag} = {
			if = {
				limit = { is_subject = yes }
				OVERLORD = { save_event_target_as = DEC_${vp}_former_overlord }
				OVERLORD = { set_autonomy = { target = PREV autonomy_state = autonomy_free } }
			}
			DEC_${pfx}_ns_conversion_setup = yes
		}
		if = { limit = { ROOT = { is_in_faction = yes } } ROOT = { add_to_faction = \${tag} } }
		\${tag} = {
			if = {
				limit = { has_event_target = DEC_${vp}_former_overlord }
				declare_war_on = { target = event_target:DEC_${vp}_former_overlord type = annex_everything }
			}
		}
	}
	else = {
		random_state = {
			limit = { is_core_of = \${tag} }
			OWNER = { save_event_target_as = DEC_${vp}_occ }
			OWNER = { release = \${tag} }
		}
		if = {
			limit = { country_exists = \${tag} }
			\${tag} = { DEC_${pfx}_ns_conversion_setup = yes }
			if = { limit = { ROOT = { is_in_faction = yes } } ROOT = { add_to_faction = \${tag} } }
			\${tag} = {
				if = {
					limit = { has_event_target = DEC_${vp}_occ }
					declare_war_on = { target = event_target:DEC_${vp}_occ type = annex_everything }
				}
			}
		}
	}
}
\`;
}
`;
}

const gens = [
  { file: "gen_black_awakening.cjs", pfx: "BAW", vp: "baw", own: "DEC_BAW_black_awakening",
    acc: "DEC_can_access_black_awakening", isTrig: "DEC_is_black_brotherhood_nation", hasTrig: "DEC_has_black_right_ideology" },
  { file: "gen_indigenous_awakening.cjs", pfx: "IND", vp: "ind", own: "DEC_IND_indigenous_awakening",
    acc: "DEC_can_access_indigenous_awakening", isTrig: "DEC_is_indigenous_nation", hasTrig: "DEC_has_indigenous_right_ideology" },
  { file: "gen_asian_awakening.cjs", pfx: "ASI", vp: "asi", own: "DEC_ASI_asian_awakening",
    acc: "DEC_can_access_asian_awakening", isTrig: "DEC_is_asian_nation", hasTrig: "DEC_has_asian_right_ideology" },
  { file: "gen_hindu_awakening.cjs", pfx: "HND", vp: "hnd", own: "DEC_HND_hindu_awakening",
    acc: "DEC_can_access_hindu_awakening", isTrig: "DEC_is_hindu_nation", hasTrig: "DEC_has_hindu_right_ideology" },
];

function spliceByMarkers(src, startMarker, endMarker, replacement) {
  const a = src.indexOf(startMarker);
  const b = src.indexOf(endMarker, a);
  if (a < 0 || b < 0) throw new Error("markers not found: " + startMarker + " / " + endMarker);
  return src.slice(0, a) + replacement + src.slice(b);
}

for (const g of gens) {
  const fp = path.join(TOOLS, g.file);
  let src = fs.readFileSync(fp, "utf8");

  src = spliceByMarkers(
    src,
    "function uprisingEffect(tag) {",
    "function genEffects()",
    makeUprisingFn(g.pfx, g.vp) + "\n\n"
  );

  const oldAcc =
    `${g.acc} = {\r\n\t${g.isTrig} = yes\r\n\t${g.hasTrig} = yes\r\n}`;
  const oldAccN =
    `${g.acc} = {\n\t${g.isTrig} = yes\n\t${g.hasTrig} = yes\n}`;
  const newAcc =
    `${g.acc} = {\n\t${g.isTrig} = yes\n\t${g.hasTrig} = yes\n${exclusivityBlock(g.own)}\n}`;
  if (src.includes(oldAcc)) src = src.replace(oldAcc, newAcc);
  else if (src.includes(oldAccN)) src = src.replace(oldAccN, newAcc);
  else if (!src.includes("has_completed_focus = DEC_WHT_white_revival") || !src.includes(g.acc)) {
    throw new Error("access block missing in " + g.file);
  }

  if (!src.includes(`DEC_${g.pfx}_self_convert_tt`)) {
    src = src.replace(
      `' DEC_${g.pfx}_uprising_already_tt:`,
      `' DEC_${g.pfx}_self_convert_tt: "§YМирная конверсия§! собственной страны в НС (без гражданской войны).",\n    ' DEC_${g.pfx}_uprising_already_tt:`
    );
    src = src.replace(
      `' DEC_${g.pfx}_uprising_already_tt: "National Socialists already rule`,
      `' DEC_${g.pfx}_self_convert_tt: "§YPeaceful conversion§! of your own country to NS (no civil war).",\n    ' DEC_${g.pfx}_uprising_already_tt: "National Socialists already rule`
    );
  }

  fs.writeFileSync(fp, src, "utf8");
  console.log("patched", g.file);
  execSync(`node "${fp}"`, { stdio: "inherit" });
}

function patchAccessTxt(file, acc, isName, hasName, own) {
  let t = fs.readFileSync(file, "utf8");
  if (t.includes("has_completed_focus = DEC_WHT_white_revival") && t.includes(acc) &&
      t.indexOf(acc) < t.indexOf("has_completed_focus = DEC_BAW_black_awakening") + 500) {
    // may already be patched for white - check specifically
  }
  const variants = [
    `${acc} = {\r\n\t${isName} = yes\r\n\t${hasName} = yes\r\n}`,
    `${acc} = {\n\t${isName} = yes\n\t${hasName} = yes\n}`,
  ];
  const neu = `${acc} = {\n\t${isName} = yes\n\t${hasName} = yes\n${exclusivityBlock(own)}\n}`;
  let ok = false;
  for (const v of variants) {
    if (t.includes(v)) { t = t.replace(v, neu); ok = true; break; }
  }
  if (!ok) {
    if (t.includes(exclusivityBlock(own).split("\n")[2])) {
      console.log("already exclusive", path.basename(file));
      return;
    }
    throw new Error("cannot patch access " + file);
  }
  fs.writeFileSync(file, t, "utf8");
  console.log("patched access", path.basename(file));
}

patchAccessTxt(
  path.join(ROOT, "common/scripted_triggers/DEC_white_revival_triggers.txt"),
  "DEC_can_access_white_revival", "DEC_is_white_brotherhood_nation", "DEC_has_white_right_ideology", "DEC_WHT_white_revival"
);
patchAccessTxt(
  path.join(ROOT, "common/scripted_triggers/DEC_caliphate_triggers.txt"),
  "DEC_can_access_caliphate_branch", "DEC_is_ummah_nation", "DEC_has_radical_islam", "DEC_CAL_world_caliphate"
);

// White effects overlord/occ
{
  const file = path.join(ROOT, "common/scripted_effects/DEC_white_revival.txt");
  let t = fs.readFileSync(file, "utf8");
  const n1 = (t.match(/set_temp_variable = \{ DEC_wht_overlord/g) || []).length;
  t = t.replace(
    /OVERLORD = \{ set_temp_variable = \{ DEC_wht_overlord = THIS\.id \} \}\r?\n\t\t\tDEC_WHT_ns_conversion_setup = yes\r?\n\t\t\tif = \{ limit = \{ is_subject = yes \} OVERLORD = \{ set_autonomy = \{ target = PREV autonomy_state = autonomy_free \} \} \}/g,
    "if = {\n\t\t\t\tlimit = { is_subject = yes }\n\t\t\t\tOVERLORD = { save_event_target_as = DEC_wht_former_overlord }\n\t\t\t\tOVERLORD = { set_autonomy = { target = PREV autonomy_state = autonomy_free } }\n\t\t\t}\n\t\t\tDEC_WHT_ns_conversion_setup = yes"
  );
  t = t.replace(/has_variable = DEC_wht_overlord/g, "has_event_target = DEC_wht_former_overlord");
  t = t.replace(/target = var:DEC_wht_overlord/g, "target = event_target:DEC_wht_former_overlord");
  t = t.replace(/OWNER = \{ set_temp_variable = \{ DEC_wht_occ = THIS\.id \} \}/g, "OWNER = { save_event_target_as = DEC_wht_occ }");
  t = t.replace(/has_variable = DEC_wht_occ/g, "has_event_target = DEC_wht_occ");
  t = t.replace(/target = var:DEC_wht_occ/g, "target = event_target:DEC_wht_occ");
  fs.writeFileSync(file, t, "utf8");
  const n2 = (t.match(/DEC_wht_former_overlord/g) || []).length;
  console.log("white effects: old overlord refs", n1, "new former_overlord", n2);
}

console.log("DONE");
