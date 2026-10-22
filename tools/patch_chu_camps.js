const fs = require("fs");
const p = "c:/git/decolonizaciya/common/national_focus/DEC_chuvash_politics.txt";
let t = fs.readFileSync(p, "utf8");

const camps = {
  pwr_lib: "DEC_CHU_set_camp_west",
  pwr_cons: "DEC_CHU_set_camp_west",
  pwr_soc: "DEC_CHU_set_camp_west",
  pwr_wa: "DEC_CHU_set_camp_west",
  pwr_est: "DEC_CHU_set_camp_est",
  pwr_kprf: "DEC_CHU_set_camp_left",
  pwr_olen: "DEC_CHU_set_camp_left",
  pwr_oresh: "DEC_CHU_set_camp_lib",
  pwr_luk: "DEC_CHU_set_camp_nat",
  pwr_khuz: "DEC_CHU_set_camp_nat",
  pwr_evd: "DEC_CHU_set_camp_nat",
  pwr_yukh: "DEC_CHU_set_camp_nat",
};

for (const [key, eff] of Object.entries(camps)) {
  const id = "DEC_CHU_pol_" + key;
  const start = t.indexOf("id = " + id);
  if (start < 0) {
    console.log("missing", id);
    continue;
  }
  const next = t.indexOf("shared_focus = {", start + 1);
  const end = next < 0 ? t.length : next;
  let block = t.slice(start, end);
  if (block.includes(eff + " = yes")) {
    console.log("ok", key);
    continue;
  }
  if (!block.includes("DEC_CHU_after_take_power = yes")) {
    console.log("no after", key);
    continue;
  }
  block = block.replace(
    "DEC_CHU_after_take_power = yes\n",
    "DEC_CHU_after_take_power = yes\n\t\t" + eff + " = yes\n"
  );
  t = t.slice(0, start) + block + t.slice(end);
  console.log("patched", key);
}

if (!t.includes("DEC_CHU_pol_pwr_argadu")) {
  t += `
shared_focus = {
	id = DEC_CHU_pol_pwr_argadu
	icon = GFX_DEC_CHU_pol_pwr_argadu
	allow_branch = { OR = { original_tag = CHU original_tag = BCF } }
	relative_position_id = DEC_CHU_pol_p_argadu
	x = 0
	y = 1
	cost = 7
	prerequisite = { focus = DEC_CHU_pol_p_argadu }
	search_filters = { FOCUS_FILTER_POLITICAL }
	available = {
		check_variable = { party_pop_array^11 > 0.08 }
	}
	completion_reward = {
		log = "[GetDateText]: [Root.GetName]: Focus DEC_CHU_pol_pwr_argadu"
		add_to_variable = { party_pop_array^11 = 0.18 }
		clamp_variable = { var = party_pop_array^11 min = 0 max = 1 }
		add_popularity = { ideology = fascism popularity = 0.12 }
		set_variable = { ruling_party = 11 }
		recalculate_party = yes
		set_politics = { ruling_party = fascism elections_allowed = no }
		add_political_power = 100
		add_stability = 0.02
		add_war_support = 0.05
		DEC_CHU_after_take_power = yes
		DEC_CHU_set_camp_argadu = yes
		custom_effect_tooltip = DEC_CHU_pol_pwr_argadu_tt
	}
	ai_will_do = { base = 7 }
}
`;
  console.log("appended pwr_argadu");
}

fs.writeFileSync(p, t);
console.log("done");
