# Focus spine matrix — late starts 2013.10.1 / 2022.2.22

Method: AI historical path (`is_historical_focus_on` / `*_ai_historical_path`) limited by real history to the bookmark date.

| Class | Effect | When |
|-------|--------|------|
| COMPLETE | `complete_national_focus` | Safe rewards (ideas/PP/tech/opinion) |
| UNLOCK | `unlock_national_focus` | Leader swap / war / annex / event already handled by DEC_map/diplomacy/leaders |
| SKIP | omit | Alt-history, after date, DEC mega |

Implementation: `common/scripted_effects/DEC_start_dates.txt` → `DEC_focus_spine_2013` / `DEC_focus_spine_2022`.
Leaders are re-applied after spines so COMPLETE/UNLOCK cannot leave the wrong cabinet.

**2013 vs 2022:** full historical path is defined for 2022.2.22; **2013 = that same path truncated to 2013.10.1** (drop Maidan/Crimea/Brexit/Macron/PiS/Poroshenko/Trump/Xi Thought/JCPOA/Vision 2030/Taliban/…). `setup_2022` = `setup_2013` + post-2013 delta only.

---

## Majors

### SOV
- **2013 COMPLETE:** grand bargain → putinism → state corporatism → Medvedev modernization → may decrees → gay propaganda → ONF (see spine)
- **2013 UNLOCK:** yeltsin, putin [L], rokirovka [L], go_russia [E], siloviki prereqs, groznyy
- **2022 EXTRA COMPLETE:** aggressive FP, rein_in_gov, information_war, support LNR/DNR, blr union, condemn ukr, exercises belarus
- **2022 UNLOCK:** annexation_of_crimea [A/W], novorossiyan_uprising [W], counter_euromaidan, recognize_novorossiya
- **SKIP:** invasion wargoals, tandemokratia, 2021 coup, referendums Sep 2022+

### UKR
- **2013 COMPLETE:** kuchma→yanuk cabinet; our_ukraine hist; party_regions through dual_language / cancel_decommunization
- **2013 UNLOCK:** lyvochkin [L], ukraine_elections, party_regions_start [L]
- **2022 EXTRA COMPLETE:** poroshenko decentr/decommun/anti_corr/nabu/no_rus_mil/anti_rus_doctrine (+ army/EU markers)
- **2022 UNLOCK:** poroshenko_start [L] (DEC leader = Zelenskyy)
- **SKIP:** red path; Zelensky focuses (none exist)

### USA
- **2013 COMPLETE:** ending_clintonomics → 43rd → 2000_republicans → 2004_republicans → 2008_democrats → 2012_democrats
- **2022 EXTRA COMPLETE:** `USA_focus_2016_republican_victory` (NOT democrat)
- **SKIP:** democrat 2016; Gore/McCain/Romney alts; Biden focus (none — leaders only)

### CHI
- **2013/2022:** era markers as **UNLOCK** (BoP/traits; Xi already in leaders): three_represents → hu_jintao → chinese_dream; 2022 + xi_jinping_thought_enshrined
- **SKIP:** two_establishments, alt succession

---

## EU / NATO

| Tag | 2013 era | 2022 extra | Notes |
|-----|----------|------------|-------|
| ENG | Cameron Big Society | Brussels fight / flexible Europe | Election roots UNLOCK |
| FRA | PS/Hollande (override game LR hist) | UDF_LREM/Macron | Skip FRA_LR |
| GER | CDU_rises + industry | Agenda/Hartz continuity under Scholz | Past era UNLOCK |
| ITA | centre_left → Letta | technocratic | Meloni SKIP (Sep 2022) |
| POL | Platforma | PiS/judicial | Pre-2005 SKIP |
| EST | Reform liberal | e-gov deepen | Skip Center |
| DEN | welfare + reaffirm_nato | public sector / digital | Skip leave NATO |
| NRY | economy/armed (Solberg) | Labour if Støre | Hist Labour ≠ 2013 |
| SWE | Moderaterna | Socialdemokraterna | NATO join SKIP |
| FIN | sweden + EU defensive | partnership deepen | join_nato SKIP |

---

## Post-Soviet / Caucasus / CA

| Tag | 2013 | 2022 | Notes |
|-----|------|------|-------|
| BLR | Lukashenko hist | thin security | Skip revolution |
| GEO | Rose→Saak→2008 loss→peace | Dream consolidation | elections2013 date>10.27 |
| ARM | Sargsyan | Velvet/Pashinyan | Skip forever-Kocharyan |
| AZE | Aliyev cult | Karabakh victory gates | |
| CHE | Ahmat→Kadyrov loyal | thin | Puppet via diplomacy |
| KAZ/UZB/KYR | CES autocrat/CIS/CSTO | leaders-only swaps | |
| TAJ | Rahmon `TAJ_his_excellency` (root UNLOCK) | same | |
| TAT/BSH/URA/SUB | UNLOCK root if exists | — | Almost no hist AI |
| ABK/SOO | RF client thin | RF partnership | Skip anti-RF |

---

## MENA

| Tag | 2013 | 2022 | Notes |
|-----|------|------|-------|
| PER | vilayet hist | JCPOA then hardline | Skip reformist |
| IRQ | Maliki/Dawa | after-ISIS thin | |
| SYR | Bashar loyalty | RF ties; war ongoing | Skip civil_war_victory |
| EGY | junta/Sisi transition | al_sisi_rise (date>2014.6) | |
| SAU | Abdullah/house | Vision 2030 | |
| AFG | Karzai/pro-west | declare_emirate UNLOCK | Taliban via leaders |
| LBA | end_gaddafi/free_libya | Haftar UNLOCK no unity | |
| HEZ | status quo thin | — | Almost no hist AI |
| TUR | AKP/islamist_victory | erdonomics | Skip Gülen/coup |
| QAT/UAE/BHR/KUW/OMA | GCC monarchy/oil | diversify | Skip republic |

---

## Rest (05_*)

SPR PP→PSOE; SWI continuity; GRE ND austerity→ND; ROM PSD→PNL; BUL liberal; SER SNS; BOS Dayton; MNT West; KOS independence; CZE Necas→Fiala; HOL Rutte; CAN Eng/NATO; AST Howard→Abbott→Turnbull; BRA Lula→Bolsonaro; JAP right/Abe; IND Democrat→PDI-P; NIG PDP→ANPP; ALG FLN/Bouteflika→Tebboune.

---

## Known gaps (leader-only, no focus ID)
USA Biden 2020; CAN Harper/Trudeau; AST Morrison; JAP Abe/Kishida by name; GRE Samaras/Mitsotakis by name; SPR Rajoy/Sánchez by name.
