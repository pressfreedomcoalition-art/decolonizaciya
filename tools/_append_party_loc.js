const fs = require("fs");
const path = require("path");
function appendLoc(file, block) {
  let buf = fs.readFileSync(file);
  const bom = buf.length >= 3 && buf[0] === 0xef && buf[1] === 0xbb && buf[2] === 0xbf;
  let text = bom ? buf.slice(3).toString("utf8") : buf.toString("utf8");
  if (!text.endsWith("\n")) text += "\n";
  if (text.includes("POLITICS_BAYRAMOVA_DESC:")) return;
  const out = Buffer.from(text + block, "utf8");
  fs.writeFileSync(file, bom ? Buffer.concat([Buffer.from([0xef, 0xbb, 0xbf]), out]) : out);
}
appendLoc(
  "c:/git/decolonizaciya/localisation/russian/DEC_parties_l_russian.yml",
  `
 TAT.Nat_Populism: "Иттифак"
 TAT.Nat_Populism_desc: "Татарская партия национальной независимости; Фаузия Байрамова."
 TAT.Neutral_conservatism: "Всетатарский общественный центр"
 TAT.Neutral_conservatism_desc: "ВТОЦ; Фарит Закиев."
 TAT.Neutral_Libertarian: "Свободный Идель-Урал"
 TAT.Neutral_Libertarian_desc: "Рафис Кашапов; независимость Татарстана в Идель-Урале."
 TAT.socialism: "ВТОЦ — основатели"
 TAT.socialism_desc: "Умеренное крыло татарского движения; Марат Мулюков."

 BSH.Nat_Populism: "Башкорт"
 BSH.Nat_Populism_desc: "Башкирская общественная организация; Фаиль Алсынов."
 BSH.Neutral_Libertarian: "Комитет башкирского национального движения"
 BSH.Neutral_Libertarian_desc: "Эмиграция; Руслан Габбасов."
 BSH.liberalism: "Башкирский национальный политический центр"
 BSH.liberalism_desc: "Айгуль Гимранова-Лион."
 BSH.Neutral_conservatism: "Башкорт — президиум"
 BSH.Neutral_conservatism_desc: "Ильнар Галин."

 MEL.Nat_Populism: "Он Каҥаш / Марий Ушем"
 MEL.Nat_Populism_desc: "Совет старейшин; Виталий Танаков."
 MEL.Neutral_conservatism: "Марий Ушем"
 MEL.Neutral_conservatism_desc: "Общероссийское движение; Анатолий Радыгин."
 MEL.Neutral_Libertarian: "Тукым Каҥаш"
 MEL.Neutral_Libertarian_desc: "Совет родов; Виталий Головин."

 UDM.Nat_Populism: "Удмурт Кенеш — радикальное крыло"
 UDM.Nat_Populism_desc: "Языковое и национальное движение; Альберт Разин."
 UDM.liberalism: "Свободная Удмуртия"
 UDM.liberalism_desc: "Освободительное движение; Сергей Антонов."
 UDM.Neutral_Libertarian: "Свободная Удмуртия — сопредседатели"
 UDM.Neutral_Libertarian_desc: "Николай Суворов."

 KAE.Nat_Populism: "Карельское движение"
 KAE.Nat_Populism_desc: "Радикальное крыло карельского самоопределения; Александр Григорьев."
 KAE.liberalism: "Яблоко Карелии"
 KAE.liberalism_desc: "Василий Попов."

 KOM.socialism: "КПРФ Коми — антиколониальное крыло"
 KOM.socialism_desc: "Олег Михайлов; критика колониальной политики центра."
 KOM.Nat_Populism: "Коми войтыр"
 KOM.Nat_Populism_desc: "Коми национальное движение; Валерий Марков."

 POLITICS_BAYRAMOVA_DESC: "Бессменный лидер партии татарской национальной независимости «Иттифак»."
 POLITICS_ZAKIEV_DESC: "Председатель президиума Всетатарского общественного центра (ВТОЦ)."
 POLITICS_KASHAPOV_DESC: "Сооснователь «Свободного Идель-Урала»; набережночелнинское крыло ВТОЦ."
 POLITICS_MULYUKOV_DESC: "Первый председатель ТОЦ / ВТОЦ; умеренное крыло татарского движения."
 POLITICS_ALSYNOV_DESC: "Председатель организации «Башкорт»; экологические и национальные протесты Башкортостана."
 POLITICS_GABBASOV_DESC: "Комитет башкирского национального движения за рубежом; бывший зампред «Башкорт»."
 POLITICS_GIMRANOVA_DESC: "Активистка башкирского национального движения в эмиграции."
 POLITICS_GALIN_DESC: "Председатель «Башкорт» (до 2020)."
 POLITICS_TANAKOV_DESC: "Председатель Совета старейшин мари; жрец и активист «Марий Ушем»."
 POLITICS_RADYGIN_DESC: "Руководитель общероссийского «Марий Ушем»."
 POLITICS_GOLOVIN_MEL_DESC: "Кандидат в Онъыжа по Татарстану и Башкортостану (Тукым Каҥаш)."
 POLITICS_RAZIN_DESC: "Создатель «Удмурт Кенеш»; социолог и защитник удмуртского языка."
 POLITICS_ANTONOV_UDM_DESC: "Сопредседатель «Свободной Удмуртии»; бывший депутат Госсовета Удмуртии."
 POLITICS_SUVOROV_UDM_DESC: "Сопредседатель «Свободной Удмуртии»."
 POLITICS_GRIGORYEV_KAE_DESC: "Лидер «Карельского движения»; курс на карельскую государственность."
 POLITICS_POPOV_KAE_DESC: "Глава карельского «Яблока»; эмиграция в Финляндию."
 POLITICS_MIKHAILOV_KOM_DESC: "Депутат Госсовета Коми; публичная критика колониальной политики центра."
 POLITICS_MARKOV_KOM_DESC: "Деятель коми национального движения («Коми войтыр»)."
`
);
appendLoc(
  "c:/git/decolonizaciya/localisation/english/DEC_parties_l_english.yml",
  `
 TAT.Nat_Populism: "Ittifaq"
 TAT.Nat_Populism_desc: "Tatar Party of National Independence; Fauzia Bayramova."
 TAT.Neutral_conservatism: "All-Tatar Public Centre"
 TAT.Neutral_conservatism_desc: "VTOC; Farit Zakiev."
 TAT.Neutral_Libertarian: "Free Idel-Ural"
 TAT.Neutral_Libertarian_desc: "Rafis Kashapov; Tatar independence inside Idel-Ural."
 TAT.socialism: "VTOC founders"
 TAT.socialism_desc: "Moderate Tatar movement; Marat Mulyukov."

 BSH.Nat_Populism: "Bashkort"
 BSH.Nat_Populism_desc: "Bashkir civic organisation; Fail Alsynov."
 BSH.Neutral_Libertarian: "Committee of the Bashkir National Movement"
 BSH.Neutral_Libertarian_desc: "Exile; Ruslan Gabbasov."
 BSH.liberalism: "Bashkir National Political Centre"
 BSH.liberalism_desc: "Aigul Gimranova-Lion."
 BSH.Neutral_conservatism: "Bashkort presidium"
 BSH.Neutral_conservatism_desc: "Ilnar Galin."

 MEL.Nat_Populism: "On Kangash / Mari Ushem"
 MEL.Nat_Populism_desc: "Council of elders; Vitaly Tanakov."
 MEL.Neutral_conservatism: "Mari Ushem"
 MEL.Neutral_conservatism_desc: "All-Russian movement; Anatoly Radygin."
 MEL.Neutral_Libertarian: "Tukym Kangash"
 MEL.Neutral_Libertarian_desc: "Clan council; Vitaly Golovin."

 UDM.Nat_Populism: "Udmurt Kenesh — radical wing"
 UDM.Nat_Populism_desc: "Language and national movement; Albert Razin."
 UDM.liberalism: "Free Udmurtia"
 UDM.liberalism_desc: "Liberation movement; Sergei Antonov."
 UDM.Neutral_Libertarian: "Free Udmurtia — co-chairs"
 UDM.Neutral_Libertarian_desc: "Nikolai Suvorov."

 KAE.Nat_Populism: "Karelian Movement"
 KAE.Nat_Populism_desc: "Radical self-determination wing; Alexander Grigoryev."
 KAE.liberalism: "Yabloko of Karelia"
 KAE.liberalism_desc: "Vasiliy Popov."

 KOM.socialism: "CPRF of Komi — anti-colonial wing"
 KOM.socialism_desc: "Oleg Mikhailov; critic of the centre's colonial policy."
 KOM.Nat_Populism: "Komi Voityr"
 KOM.Nat_Populism_desc: "Komi national movement; Valery Markov."

 POLITICS_BAYRAMOVA_DESC: "Long-time leader of the Tatar Party of National Independence Ittifaq."
 POLITICS_ZAKIEV_DESC: "Chair of the All-Tatar Public Centre (VTOC) presidium."
 POLITICS_KASHAPOV_DESC: "Co-founder of Free Idel-Ural; Naberezhnye Chelny VTOC wing."
 POLITICS_MULYUKOV_DESC: "First chair of TOC / VTOC; moderate Tatar movement."
 POLITICS_ALSYNOV_DESC: "Chair of Bashkort; ecological and national protests in Bashkortostan."
 POLITICS_GABBASOV_DESC: "Committee of the Bashkir National Movement abroad; former Bashkort deputy chair."
 POLITICS_GIMRANOVA_DESC: "Bashkir national movement activist in exile."
 POLITICS_GALIN_DESC: "Chair of Bashkort (until 2020)."
 POLITICS_TANAKOV_DESC: "Chair of the Mari council of elders; priest and Mari Ushem activist."
 POLITICS_RADYGIN_DESC: "Head of all-Russian Mari Ushem."
 POLITICS_GOLOVIN_MEL_DESC: "Onyzha candidate for Tatarstan and Bashkortostan (Tukym Kangash)."
 POLITICS_RAZIN_DESC: "Co-founder of Udmurt Kenesh; sociologist and Udmurt-language defender."
 POLITICS_ANTONOV_UDM_DESC: "Co-chair of Free Udmurtia; former State Council deputy of Udmurtia."
 POLITICS_SUVOROV_UDM_DESC: "Co-chair of Free Udmurtia."
 POLITICS_GRIGORYEV_KAE_DESC: "Leader of the Karelian Movement; Karelian statehood current."
 POLITICS_POPOV_KAE_DESC: "Head of Yabloko in Karelia; exile in Finland."
 POLITICS_MIKHAILOV_KOM_DESC: "Komi State Council deputy; public critic of the centre's colonial policy."
 POLITICS_MARKOV_KOM_DESC: "Komi national movement figure (Komi Voityr)."
`
);
console.log("loc ok");
