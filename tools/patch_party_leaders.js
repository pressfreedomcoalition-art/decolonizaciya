/**
 * Patch DEC history/countries with multi-ideology party leaders.
 *
 * MD slot mapping (no new ideology indices — keeps MD politics GUI):
 *   libertarianism     -> Neutral_Libertarian
 *   national socialism -> Nat_Fascism
 *   transhumanism      -> Western_Autocracy  (DEC party localisation renames)
 */
const fs = require("fs");
const path = require("path");

const DIR = "c:/git/decolonizaciya/history/countries";

const L = (name, ideology, desc) => ({ name, ideology, desc });
const mk = (rulingGroup, rulingIndex, pops, leaders) => ({
  rulingGroup,
  rulingIndex,
  pops,
  leaders,
});

const FINAL = {
  "BCF - Bulgar Confederation.txt": mk(
    "neutrality",
    16,
    { 2: 0.15, 16: 0.3, 21: 0.1, 0: 0.15, 20: 0.2, 4: 0.1 },
    [
      L("Mishshi Oreshnikov", "Neutral_Libertarian", "POLITICS_ORESHNIKOV_DESC"),
      L("Rodion Evdokimov", "liberalism", "POLITICS_EVDOKIMOV_DESC"),
      L("Nikolai Fyodorov", "Nat_Populism"),
      L("Dmitry Semenov", "Nat_Fascism"),
      L("Aleksei Kudryashov", "Western_Autocracy"),
      L("Valentin Shurchanov", "Communist-State"),
    ]
  ),
  "VBG - Volga Bulgaria.txt": mk(
    "democratic",
    2,
    { 2: 0.25, 16: 0.15, 21: 0.1, 0: 0.1, 20: 0.25, 4: 0.15 },
    [
      L("Farit Zakiev", "liberalism"),
      L("Mishshi Oreshnikov", "Neutral_Libertarian", "POLITICS_ORESHNIKOV_DESC"),
      L("Rafis Kashapov", "Nat_Populism"),
      L("Ilnar Garifullin", "Nat_Fascism"),
      L("Nafis Kashapov", "Western_Autocracy"),
      L("Ivan Grigoryev", "Communist-State"),
    ]
  ),
  "IGR - Ingria.txt": mk(
    "democratic",
    2,
    { 2: 0.25, 16: 0.2, 21: 0.1, 0: 0.1, 20: 0.25, 3: 0.1 },
    [
      L("Pavel Mezerin", "liberalism"),
      L("Olaf Lappalainen", "Neutral_Libertarian"),
      L("Maxim Kuzakhmetov", "Nat_Populism"),
      L("Artur Ankkalainen", "Nat_Fascism"),
      L("Pavel Ivlev", "Western_Autocracy"),
      L("Denis Ugryumov", "socialism"),
    ]
  ),
  "ERZ - Erzya Mastor.txt": mk(
    "nationalist",
    20,
    { 2: 0.15, 16: 0.1, 21: 0.1, 0: 0.1, 20: 0.4, 3: 0.15 },
    [
      L("Syres Bolyaen", "Nat_Populism", "POLITICS_BOLYAEN_DESC"),
      L("Vitaliy Romashkin", "liberalism"),
      L("Nuyat Vidyay", "Neutral_Libertarian"),
      L("Kshumantsyan Pirguzh", "Nat_Fascism"),
      L("Mariz Kemal", "Western_Autocracy"),
      L("Grigory Musalyov", "socialism"),
    ]
  ),
  "MOK - Moksha Mastor.txt": mk(
    "nationalist",
    20,
    { 2: 0.2, 16: 0.1, 21: 0.1, 0: 0.1, 20: 0.35, 3: 0.15 },
    [
      L("Donisi Chovganon", "Nat_Populism"),
      L("Vitaliy Romashkin", "liberalism"),
      L("Aleksandr Adamov", "Neutral_Libertarian"),
      L("Vladimir Kemaikin", "Nat_Fascism"),
      L("Nina Aleshina", "Western_Autocracy"),
      L("Pavel Grishin", "socialism"),
    ]
  ),
  "NOG - Nogai El.txt": mk(
    "nationalist",
    20,
    { 2: 0.2, 16: 0.1, 21: 0.1, 0: 0.1, 20: 0.35, 14: 0.15 },
    [
      L("Anvar Kurmanakaev", "Nat_Populism"),
      L("Rizvan Kubakaev", "liberalism"),
      L("Murat Auezov", "Neutral_Libertarian"),
      L("Ismail Kerimov", "Nat_Fascism"),
      L("Aslanbek Naimanov", "Western_Autocracy"),
      L("Magomed Yarlykapov", "Neutral_conservatism"),
    ]
  ),
  "BLK - Alans Balkaria.txt": mk(
    "nationalist",
    20,
    { 2: 0.15, 16: 0.1, 21: 0.15, 0: 0.1, 20: 0.35, 14: 0.15 },
    [
      L("Taulan Salpagarov", "Nat_Populism"),
      L("Oleg Zurabov", "liberalism"),
      L("Ibragim Guchigov", "Neutral_Libertarian"),
      L("Islam Atabiyev", "Nat_Fascism"),
      L("Murat Zalikhanov", "Western_Autocracy"),
      L("Boris Ebzeyev", "Neutral_conservatism"),
    ]
  ),
  "CIR - Circassia.txt": mk(
    "nationalist",
    20,
    { 2: 0.2, 16: 0.1, 21: 0.15, 0: 0.1, 20: 0.35, 3: 0.1 },
    [
      L("Ibrahim Yaganov", "Nat_Populism"),
      L("Kase Kik", "liberalism"),
      L("Beslan Kmuzov", "Neutral_Libertarian"),
      L("Ruslan Keshev", "Nat_Fascism"),
      L("Murat Berzegov", "Western_Autocracy"),
      L("Asker Sokht", "socialism"),
    ]
  ),
  "KBC - Kuban Circassia.txt": mk(
    "nationalist",
    20,
    { 2: 0.2, 16: 0.1, 21: 0.15, 0: 0.1, 20: 0.35, 3: 0.1 },
    [
      L("Yevgeny Bursanidis", "Nat_Populism"),
      L("Vladimir Miroshnichenko", "liberalism"),
      L("Dmitry Dorovskikh", "Neutral_Libertarian"),
      L("Beslan Kmuzov", "Western_Autocracy"),
      L("Mikhail Kalyamin", "Nat_Fascism"),
      L("Andriy Illienko", "socialism"),
    ]
  ),
  "OSA - Ossetia Alania.txt": mk(
    "democratic",
    1,
    { 1: 0.25, 2: 0.15, 16: 0.1, 21: 0.1, 0: 0.1, 20: 0.2, 4: 0.1 },
    [
      L("Alan Gagloyev", "conservatism"),
      L("David Sanakoyev", "liberalism"),
      L("Ruslan Kuchity", "Neutral_Libertarian"),
      L("Vyacheslav Dzhabiev", "Nat_Fascism"),
      L("Inal Pliev", "Western_Autocracy"),
      L("Anatoly Bibilov", "Nat_Populism"),
      L("Eduard Kokoity", "Communist-State"),
    ]
  ),
  "CAU - Caucasian Union.txt": mk(
    "nationalist",
    20,
    { 2: 0.25, 16: 0.1, 21: 0.1, 0: 0.1, 20: 0.3, 11: 0.15 },
    [
      L("Akhmed Zakayev", "Nat_Populism", "POLITICS_ZAKAYEV_DESC"),
      L("Deni Teps", "liberalism", "POLITICS_DENI_TEPS_DESC"),
      L("Ansar Garkho", "Neutral_Libertarian"),
      L("Dzhabrail Mirzoyev", "Nat_Fascism"),
      L("Muslim Tsebiev", "Western_Autocracy"),
      L("Ilyas Akhmadov", "Caliphate"),
    ]
  ),
  "IDL - Idel Ural.txt": mk(
    "democratic",
    2,
    { 2: 0.25, 16: 0.15, 21: 0.1, 0: 0.1, 20: 0.25, 3: 0.15 },
    [
      L("Rafis Kashapov", "liberalism"),
      L("Aida Abdrakhmanova", "Neutral_Libertarian"),
      L("Syres Bolyaen", "Nat_Populism"),
      L("Ruslan Gabbasov", "Western_Autocracy"),
      L("Fauzia Bayramova", "Nat_Fascism"),
      L("Ilya Ignatov", "socialism"),
    ]
  ),
  "SMO - Smolensk Republic.txt": mk(
    "nationalist",
    20,
    { 2: 0.25, 16: 0.1, 21: 0.1, 0: 0.1, 20: 0.3, 3: 0.15 },
    [
      L("Vladislav Zhivitsa", "Nat_Populism"),
      L("Sergei Revenko", "liberalism"),
      L("Andrei Lugovoy", "Neutral_Libertarian"),
      L("Aleksei Kazakov", "Nat_Fascism"),
      L("Dmitry Gudkov", "Western_Autocracy"),
      L("Andrei Kuznetsov", "socialism"),
    ]
  ),
  "BGR - Belgorod Peoples Republic.txt": mk(
    "democratic",
    2,
    { 2: 0.3, 16: 0.1, 21: 0.1, 0: 0.1, 20: 0.2, 3: 0.2 },
    [
      L("Ilya Kostyukov", "liberalism"),
      L("Yevgeny Mozgovskoy", "Neutral_Libertarian"),
      L("Aleksandr Kharybin", "Western_Autocracy"),
      L("Yevgeny Dremov", "Nat_Populism"),
      L("Konstantin Klimashevsky", "Nat_Fascism"),
      L("Valery Shevlyakov", "socialism"),
    ]
  ),
  "VOR - Voronezh Republic.txt": mk(
    "democratic",
    2,
    { 2: 0.25, 16: 0.1, 21: 0.1, 0: 0.1, 20: 0.2, 4: 0.25 },
    [
      L("Sergei Rudakov", "liberalism"),
      L("Roman Khudyakov", "Neutral_Libertarian"),
      L("Andrei Klychkov", "Communist-State"),
      L("Igor Kazakov", "Nat_Fascism"),
      L("Pavel Konkov", "Western_Autocracy"),
      L("Vladimir Netesov", "Nat_Populism"),
    ]
  ),
  "SEV - Severia.txt": mk(
    "democratic",
    2,
    { 2: 0.25, 16: 0.1, 21: 0.1, 0: 0.1, 20: 0.25, 3: 0.2 },
    [
      L("Ilya Kostyukov", "liberalism"),
      L("Vladislav Zhivitsa", "Nat_Populism"),
      L("Sergei Ivanov", "Neutral_Libertarian"),
      L("Roman Yuneman", "Nat_Fascism"),
      L("Ivan Zhdanov", "Western_Autocracy"),
      L("Olga Alimova", "socialism"),
    ]
  ),
  "LAP - Lapland.txt": mk(
    "democratic",
    2,
    { 2: 0.25, 16: 0.15, 21: 0.1, 0: 0.1, 20: 0.25, 17: 0.15 },
    [
      L("Andrei Danilov", "liberalism"),
      L("Linus Linsen", "Neutral_Libertarian"),
      L("Vladislav Nobel-Oleynik", "Nat_Populism"),
      L("Artur Ankkalainen", "Nat_Fascism"),
      L("Yelena Kaminskaya", "Western_Autocracy"),
      L("Irina Shafrannik", "Neutral_green"),
    ]
  ),
  "BJA - Bjarmia.txt": mk(
    "nationalist",
    20,
    { 2: 0.2, 16: 0.1, 21: 0.1, 0: 0.1, 20: 0.35, 17: 0.15 },
    [
      L("Yuriy Shcherbachev", "Nat_Populism"),
      L("Nikita Goldin", "liberalism"),
      L("Pavel Sulyandziga", "Neutral_Libertarian"),
      L("Vladislav Nobel-Oleynik", "Western_Autocracy"),
      L("Dmitry Kuznetsov", "Nat_Fascism"),
      L("Tjan Zaotschnaja", "Neutral_green"),
    ]
  ),
  "VYK - Verkhneyayitskoe Host.txt": mk(
    "nationalist",
    20,
    { 2: 0.15, 16: 0.15, 21: 0.15, 0: 0.1, 20: 0.3, 23: 0.15 },
    [
      L("Ivan Kulenko", "Nat_Populism"),
      L("Aleksei Manannikov", "liberalism"),
      L("Yevgeny Roizman", "Neutral_Libertarian"),
      L("Aleksandr Barkashov", "Nat_Fascism"),
      L("Anton Bakov", "Monarchist"),
      L("Sergei Kapchuk", "Western_Autocracy"),
    ]
  ),
  "ZKL - Zeleny Klin.txt": mk(
    "nationalist",
    20,
    { 2: 0.2, 16: 0.1, 21: 0.15, 0: 0.15, 20: 0.3, 3: 0.1 },
    [
      L("Pavlo Vyshebaba", "Nat_Populism"),
      L("Sergei Furgal", "liberalism"),
      L("Dmitry Berezhkov", "Neutral_Libertarian"),
      L("Yana Tannagasheva", "Western_Autocracy"),
      L("Pavel Sulyandziga", "Neutral_green"),
      L("Oleksiy Goncharenko", "socialism"),
      L("Artur Ankkalainen", "Nat_Fascism"),
    ]
  ),
};

function leadersBlock(leaders) {
  return leaders
    .map((l) => {
      const desc = l.desc ? `\n\t\tdesc = "${l.desc}"` : "";
      return `\tcreate_country_leader = {
\t\tname = "${l.name}"${desc}
\t\tpicture = "gfx/leaders/Europe/Portrait_Europe_Generic_2.dds"
\t\tideology = ${l.ideology}
\t\ttraits = { }
\t}`;
    })
    .join("\n\n");
}

function politicsBlock(cfg) {
  const dem =
    (cfg.pops[0] || 0) + (cfg.pops[1] || 0) + (cfg.pops[2] || 0) + (cfg.pops[3] || 0);
  const com =
    (cfg.pops[4] || 0) +
    (cfg.pops[5] || 0) +
    (cfg.pops[6] || 0) +
    (cfg.pops[7] || 0) +
    (cfg.pops[8] || 0) +
    (cfg.pops[9] || 0);
  const fas = (cfg.pops[10] || 0) + (cfg.pops[11] || 0);
  const neu =
    (cfg.pops[12] || 0) +
    (cfg.pops[13] || 0) +
    (cfg.pops[14] || 0) +
    (cfg.pops[15] || 0) +
    (cfg.pops[16] || 0) +
    (cfg.pops[17] || 0) +
    (cfg.pops[18] || 0) +
    (cfg.pops[19] || 0);
  const nat =
    (cfg.pops[20] || 0) +
    (cfg.pops[21] || 0) +
    (cfg.pops[22] || 0) +
    (cfg.pops[23] || 0);

  const total = dem + com + fas + neu + nat || 1;
  const pct = (x) => ((x / total) * 100).toFixed(1);

  const popLines = Object.entries(cfg.pops)
    .map(([i, v]) => `\tset_variable = { party_pop_array^${i} = ${v} }`)
    .join("\n");

  return `\tset_popularities = {
\t\tdemocratic = ${pct(dem)}
\t\tcommunism = ${pct(com)}
\t\tfascism = ${pct(fas)}
\t\tneutrality = ${pct(neu)}
\t\tnationalist = ${pct(nat)}
\t}
\tset_politics = {
\t\truling_party = ${cfg.rulingGroup}
\t\tlast_election = "2000.1.1"
\t\telection_frequency = 48
\t\telections_allowed = yes
\t}

\tstart_politics_input = yes
${popLines}
\tset_variable = { ruling_party = ${cfg.rulingIndex} }
\tstartup_politics = yes

${leadersBlock(cfg.leaders)}`;
}

const re =
  /\tset_popularities = \{[\s\S]*?create_country_leader = \{[\s\S]*?\n\t\}/;

let patched = 0;
for (const [file, cfg] of Object.entries(FINAL)) {
  const fp = path.join(DIR, file);
  if (!fs.existsSync(fp)) {
    console.error("MISSING", file);
    continue;
  }
  let text = fs.readFileSync(fp, "utf8");
  // Replace from set_popularities through the LAST create_country_leader block
  const start = text.indexOf("\tset_popularities = {");
  if (start < 0) {
    console.error("NO START", file);
    continue;
  }
  // Find end: last create_country_leader before overall_productivity / closing
  const after = text.slice(start);
  const marker = "\n\n\tset_variable = { overall_productivity";
  const marker2 = "\n\tset_variable = { overall_productivity";
  let endRel = after.indexOf(marker);
  if (endRel < 0) endRel = after.indexOf(marker2);
  if (endRel < 0) {
    console.error("NO END", file);
    continue;
  }
  text = text.slice(0, start) + politicsBlock(cfg) + after.slice(endRel);
  fs.writeFileSync(fp, text);
  patched++;
  console.log("patched", file);
}
console.log("done", patched);
