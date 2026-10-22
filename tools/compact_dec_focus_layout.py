# Compact DEC shared-focus x/y and assign vanilla icons. UTF-8 no BOM.
import pathlib
import re

ROOT = pathlib.Path(__file__).resolve().parents[1] / "common" / "national_focus"

MEGA = [
    "DEC_white_revival_shared.txt",
    "DEC_black_awakening_shared.txt",
    "DEC_indigenous_awakening_shared.txt",
    "DEC_asian_awakening_shared.txt",
    "DEC_hindu_awakening_shared.txt",
    "DEC_caliphate_shared.txt",
]

ROOT_X = {
    "DEC_WHT_white_revival": 32,
    "DEC_BAW_black_awakening": 36,
    "DEC_IND_indigenous_awakening": 36,
    "DEC_ASI_asian_awakening": 36,
    "DEC_HND_hindu_awakening": 36,
    "DEC_CAL_world_caliphate": 28,
    "DEC_VOL_tatar_uprising": 12,
    "DEC_VOL_erzya_uprising": 20,
    "DEC_CSK_kuban_uprising": 28,
    "DEC_NOR_bjarmia_uprising": 36,
    "DEC_COA_machine_uprising": 44,
    "DEC_TUR_call_of_turan": 54,
    "DEC_MON_kalmyk_uprising": 62,
    "DEC_RST_state_restoration": 70,
    "DEC_URA_komi_uprising": 78,
    "DEC_SIB_central_uprising": 86,
    "DEC_FE_chukotka_uprising": 94,
}

ICONS = [
    "GFX_goal_generic_national_unity",
    "GFX_goal_generic_major_alliance",
    "GFX_goal_generic_territory_or_war",
    "GFX_goal_generic_political_pressure",
    "GFX_goal_generic_construct_civ_factory",
    "GFX_goal_generic_construct_mil_factory",
    "GFX_goal_generic_construct_infrastructure",
    "GFX_goal_generic_position_armies",
    "GFX_goal_generic_allies_build_infantry",
    "GFX_goal_generic_scientific_exchange",
    "GFX_goal_generic_forceful_treaty",
    "GFX_goal_generic_demand_territory",
    "GFX_goal_generic_more_territorial_claims",
    "GFX_goal_generic_dangerous_deal",
    "GFX_goal_generic_improve_relations",
    "GFX_goal_generic_propaganda",
    "GFX_goal_generic_secret_weapon",
    "GFX_goal_generic_alliance",
    "GFX_goal_generic_occupy_states_ongoing_war",
    "GFX_goal_generic_major_war",
]

DLC_ICON = {
    "GFX_focus_generic_support_the_left_right": "GFX_goal_generic_national_unity",
    "GFX_focus_generic_self_management": "GFX_goal_generic_construct_civ_factory",
    "GFX_focus_generic_diplomatic_treaty": "GFX_goal_generic_major_alliance",
    "GFX_focus_generic_treaty": "GFX_goal_generic_major_alliance",
    "GFX_goal_tripartite_pact": "GFX_goal_generic_major_alliance",
}

FOCUS_RE = re.compile(r"(shared_focus|focus)\s*=\s*\{", re.M)


def split_blocks(text):
    starts = [m.start() for m in FOCUS_RE.finditer(text)]
    if not starts:
        return [text], []
    parts = []
    chunks = []
    parts.append(text[: starts[0]])
    for i, s in enumerate(starts):
        e = starts[i + 1] if i + 1 < len(starts) else len(text)
        chunks.append(text[s:e])
    return parts, chunks


def field(block, name):
    m = re.search(rf"^\t{name}\s*=\s*(\S+)", block, re.M)
    return m.group(1) if m else None


def set_field(block, name, value):
    if re.search(rf"^\t{name}\s*=", block, re.M):
        return re.sub(rf"(^\t{name}\s*=\s*)\S+", rf"\g<1>{value}", block, count=1, flags=re.M)
    # insert after id
    return re.sub(r"(^\tid\s*=\s*\S+\n)", rf"\g<1>\t{name} = {value}\n", block, count=1, flags=re.M)


def icon_for(fid, idx):
    fl = fid.lower()
    if "crusade" in fl or "jihad" in fl or "wargoal" in fl:
        return "GFX_goal_generic_major_war"
    if "unite" in fl or "occupy" in fl:
        return "GFX_goal_generic_occupy_states_ongoing_war"
    if "declare" in fl or "call_unity" in fl:
        return "GFX_goal_generic_major_alliance"
    if "oath" in fl or "bayah" in fl:
        return "GFX_goal_generic_forceful_treaty"
    if "industry" in fl or "plant" in fl or "civilian" in fl:
        return "GFX_goal_generic_construct_civ_factory"
    if "arms" in fl or "defense" in fl or "materiel" in fl:
        return "GFX_goal_generic_construct_mil_factory"
    if "rail" in fl or "infra" in fl:
        return "GFX_goal_generic_construct_infrastructure"
    if "army" in fl or "officer" in fl or "mobil" in fl or "volunteer" in fl:
        return "GFX_goal_generic_allies_build_infantry"
    if "university" in fl or "survey" in fl:
        return "GFX_goal_generic_scientific_exchange"
    if "drone" in fl or "blockchain" in fl:
        return "GFX_goal_generic_secret_weapon"
    if "uprising" in fl or "attack" in fl:
        return "GFX_goal_generic_territory_or_war"
    if "reg_" in fl:
        return ICONS[idx % (len(ICONS) - 2)]
    return ICONS[idx % len(ICONS)]


def compact_mega(text):
    prefix, chunks = split_blocks(text)
    rel_xs = []
    for ch in chunks:
        if field(ch, "relative_position_id"):
            x = field(ch, "x")
            if x and re.fullmatch(r"-?\d+", x):
                rel_xs.append(int(x))
    uniq = sorted(set(rel_xs))
    if not uniq:
        return text
    mid = (len(uniq) - 1) / 2
    mapping = {v: int(round((i - mid) * 2)) for i, v in enumerate(uniq)}
    out = prefix[0]
    for i, ch in enumerate(chunks):
        fid = field(ch, "id")
        if fid in ROOT_X and not field(ch, "relative_position_id"):
            ch = set_field(ch, "x", str(ROOT_X[fid]))
        if field(ch, "relative_position_id"):
            x = field(ch, "x")
            if x and re.fullmatch(r"-?\d+", x):
                ch = set_field(ch, "x", str(mapping[int(x)]))
            y = field(ch, "y")
            if y == "5":
                ch = set_field(ch, "y", "3")
            elif y == "6":
                ch = set_field(ch, "y", "4")
        if fid:
            ch = set_field(ch, "icon", icon_for(fid, i))
        out += ch
    return out


def patch_icons_and_roots(text, idx_base=0):
    prefix, chunks = split_blocks(text)
    if not chunks:
        for a, b in DLC_ICON.items():
            text = text.replace(a, b)
        return text
    out = prefix[0]
    for i, ch in enumerate(chunks):
        fid = field(ch, "id")
        if fid in ROOT_X and not field(ch, "relative_position_id"):
            ch = set_field(ch, "x", str(ROOT_X[fid]))
        ic = field(ch, "icon")
        if ic in DLC_ICON:
            ch = set_field(ch, "icon", DLC_ICON[ic])
        elif not ic and fid:
            ch = set_field(ch, "icon", icon_for(fid, idx_base + i))
        elif ic and fid:
            ch = set_field(ch, "icon", icon_for(fid, idx_base + i))
        out += ch
    return out


def main():
    for name in MEGA:
        p = ROOT / name
        raw = p.read_text(encoding="utf-8")
        p.write_text(compact_mega(raw), encoding="utf-8", newline="\n")
        print("compacted", name)
    for p in sorted(ROOT.glob("DEC_*.txt")):
        if p.name in MEGA:
            continue
        raw = p.read_text(encoding="utf-8")
        p.write_text(patch_icons_and_roots(raw), encoding="utf-8", newline="\n")
        print("icons/roots", p.name)


if __name__ == "__main__":
    main()
