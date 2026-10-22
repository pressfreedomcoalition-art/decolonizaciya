const fs = require("fs");
const path = require("path");

function append(file, block, marker) {
  let buf = fs.readFileSync(file);
  const bom = buf.length >= 3 && buf[0] === 0xef && buf[1] === 0xbb && buf[2] === 0xbf;
  let text = bom ? buf.slice(3).toString("utf8") : buf.toString("utf8");
  if (text.includes(marker)) {
    console.log("skip", path.basename(file));
    return;
  }
  if (!text.endsWith("\n")) text += "\n";
  text += block;
  const out = Buffer.from(text, "utf8");
  fs.writeFileSync(file, bom ? Buffer.concat([Buffer.from([0xef, 0xbb, 0xbf]), out]) : out);
  console.log("+", path.basename(file));
}

const EN = `
 DEC_CHU_pol_g_ummah: "Ummah Camp"
 DEC_CHU_pol_g_ummah_desc: "Propaganda for radical Islam in Chuvashia — ARGADU."
 DEC_CHU_pol_boost_ummah_tt: "§G+ fascism / Caliphate support§!"
 DEC_CHU_pol_p_argadu: "ARGADU"
 DEC_CHU_pol_p_argadu_desc: "Propaganda for Sergey Andreev's ARGADU. Prepares radical Muslims to take power."
 DEC_CHU_pol_slot_argadu_tt: "§G+ ARGADU popularity§!"
 DEC_CHU_pol_pwr_argadu: "ARGADU in Power"
 DEC_CHU_pol_pwr_argadu_desc: "Andreev's ARGADU forms the government."
 DEC_CHU_pol_pwr_argadu_tt: "§YARGADU becomes the ruling party.§!"
 DEC_CHU_tene_tur: "Tene Tur"
 DEC_CHU_tene_tur_desc: "Chuvash native faith restored as a living public tradition."
 DEC_CHU_keremet: "Keremet Groves"
 DEC_CHU_keremet_desc: "Sacred groves protected and ritualised across the republic."
 DEC_CHU_secular_civic: "Civic Secularism"
 DEC_CHU_secular_civic_desc: "Schools and civic ritual without clerical politics."
 DEC_CHU_islamic_bulgar: "Islamic Bulgar Path"
 DEC_CHU_islamic_bulgar_desc: "Chuvashia presented as heir to Muslim Volga Bulgaria."
 DEC_CHU_ind_drive: "Industrial Drive"
 DEC_CHU_ind_drive_desc: "State push for factories and logistics."
 DEC_CHU_heavy_industry: "Heavy Industry"
 DEC_CHU_heavy_industry_desc: "Expanded dual-use industrial capacity."
 DEC_CHU_army_reform: "Army Reform"
 DEC_CHU_army_reform_desc: "Building a national Chuvash army."
 DEC_CHU_officer_school: "Officer School"
 DEC_CHU_officer_school_desc: "Independent officer training."
 DEC_CHU_defense_doctrine: "Defence Doctrine"
 DEC_CHU_defense_doctrine_desc: "Doctrine suited to a small Volga state."
 DEC_CHU_west_program: "Western Civic Agenda"
 DEC_CHU_west_program_desc: "Liberal-democratic programme of the civic parties."
 DEC_CHU_est_continuity: "Continuity Government"
 DEC_CHU_est_continuity_desc: "Administrative continuity under the conservatives."
 DEC_CHU_left_program: "Left Programme"
 DEC_CHU_left_program_desc: "Social and industrial agenda of the left."
 DEC_CHU_nat_program: "National Programme"
 DEC_CHU_nat_program_desc: "Language, memory and Bulgar heritage."
 DEC_CHU_language_law: "Chuvash Language Law"
 DEC_CHU_language_law_desc: "Official status and schooling in Chuvash."
 DEC_CHU_argadu_program: "ARGADU Programme"
 DEC_CHU_argadu_program_desc: "Radical Islamic programme of ARGADU."
 DEC_CHU_argadu_law: "Sharia Courts"
 DEC_CHU_argadu_law_desc: "Parallel religious courts under ARGADU."
`;

const RU = `
 DEC_CHU_pol_g_ummah: "Лагерь уммы"
 DEC_CHU_pol_g_ummah_desc: "Пропаганда радикального ислама в Чувашии — ARGADU."
 DEC_CHU_pol_boost_ummah_tt: "§G+ поддержка фашизма / Халифата§!"
 DEC_CHU_pol_p_argadu: "ARGADU"
 DEC_CHU_pol_p_argadu_desc: "Пропаганда ARGADU Сергея Андреева. Готовит радикальных мусульман к власти."
 DEC_CHU_pol_slot_argadu_tt: "§G+ популярность ARGADU§!"
 DEC_CHU_pol_pwr_argadu: "ARGADU у власти"
 DEC_CHU_pol_pwr_argadu_desc: "ARGADU Андреева формирует правительство."
 DEC_CHU_pol_pwr_argadu_tt: "§YARGADU становится правящей партией.§!"
 DEC_CHU_tene_tur: "Тене Тур"
 DEC_CHU_tene_tur_desc: "Чувашская народная вера как живая публичная традиция."
 DEC_CHU_keremet: "Керемети"
 DEC_CHU_keremet_desc: "Священные рощи под охраной республики."
 DEC_CHU_secular_civic: "Гражданский секуляризм"
 DEC_CHU_secular_civic_desc: "Школа и гражданский ритуал без клерикальной политики."
 DEC_CHU_islamic_bulgar: "Исламский булгарский путь"
 DEC_CHU_islamic_bulgar_desc: "Чувашия как наследница мусульманской Волжской Булгарии."
 DEC_CHU_ind_drive: "Индустриальный рывок"
 DEC_CHU_ind_drive_desc: "Государственный толчок заводам и логистике."
 DEC_CHU_heavy_industry: "Тяжёлая промышленность"
 DEC_CHU_heavy_industry_desc: "Расширенные мощности двойного назначения."
 DEC_CHU_army_reform: "Армейская реформа"
 DEC_CHU_army_reform_desc: "Строительство национальной чувашской армии."
 DEC_CHU_officer_school: "Офицерская школа"
 DEC_CHU_officer_school_desc: "Независимое обучение офицеров."
 DEC_CHU_defense_doctrine: "Оборонная доктрина"
 DEC_CHU_defense_doctrine_desc: "Доктрина для малого государства Поволжья."
 DEC_CHU_west_program: "Западная гражданская повестка"
 DEC_CHU_west_program_desc: "Либерально-демократическая программа гражданских партий."
 DEC_CHU_est_continuity: "Правительство преемственности"
 DEC_CHU_est_continuity_desc: "Административная преемственность консерваторов."
 DEC_CHU_left_program: "Левая программа"
 DEC_CHU_left_program_desc: "Социальная и индустриальная повестка левых."
 DEC_CHU_nat_program: "Национальная программа"
 DEC_CHU_nat_program_desc: "Язык, память и булгарское наследие."
 DEC_CHU_language_law: "Закон о чувашском языке"
 DEC_CHU_language_law_desc: "Официальный статус и школа на чувашском."
 DEC_CHU_argadu_program: "Программа ARGADU"
 DEC_CHU_argadu_program_desc: "Радикальная исламская программа ARGADU."
 DEC_CHU_argadu_law: "Шариатские суды"
 DEC_CHU_argadu_law_desc: "Параллельные религиозные суды при ARGADU."
`;

append("c:/git/decolonizaciya/localisation/english/DEC_l_english.yml", EN, "DEC_CHU_pol_g_ummah:");
append("c:/git/decolonizaciya/localisation/russian/DEC_l_russian.yml", RU, "DEC_CHU_pol_g_ummah:");
