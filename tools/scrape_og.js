const https = require("https");
const http = require("http");
const UA = "DecolonizaciyaMod/1.0 (portrait; contact local)";

function get(url, n = 0) {
  return new Promise((res, rej) => {
    const L = url.startsWith("https") ? https : http;
    L.get(url, { headers: { "User-Agent": UA }, timeout: 20000 }, (r) => {
      if ([301, 302, 307, 308].includes(r.statusCode) && r.headers.location) {
        r.resume();
        return res(get(new URL(r.headers.location, url).toString(), n + 1));
      }
      const c = [];
      r.on("data", (d) => c.push(d));
      r.on("end", () =>
        res({ code: r.statusCode, buf: Buffer.concat(c), type: r.headers["content-type"] })
      );
    }).on("error", rej);
  });
}

(async () => {
  const pages = [
    "https://cyclowiki.org/wiki/%D0%A0%D1%83%D1%81%D0%BB%D0%B0%D0%BD_%D0%93%D0%B0%D0%B1%D0%B1%D0%B0%D1%81%D0%BE%D0%B2",
    "https://en.wikipedia.org/wiki/Rafis_Kashapov",
    "https://ru.wikipedia.org/wiki/%D0%9A%D0%B0%D1%88%D0%B0%D0%BF%D0%BE%D0%B2,_%D0%A0%D0%B0%D1%84%D0%B8%D1%81_%D0%A0%D0%B0%D1%84%D0%B0%D0%B8%D0%BB%D0%BE%D0%B2%D0%B8%D1%87",
    "https://focus.ua/world/585380-prekrasno-obhodilas-bez-moskvy-deputat-rf-sozdal-dvizhenie-za-nezavisimost-smolenskoy-oblasti",
    "https://www.currenttime.tv/a/varshava-zhivitsa-smolenskaya-oblast-nezavisimost/32547011.html",
    "https://novayagazeta.eu/articles/2024/01/26/demontazh-rossiiskoi-federatsii",
    "https://euromaidanpress.com/2022/05/24/indigenous-activists-of-russia-create-the-league-of-free-nations/",
    "https://www.idelreal.org/a/32194576.html",
  ];
  for (const u of pages) {
    try {
      const { code, buf } = await get(u);
      const html = buf.toString("utf8");
      let og = null;
      const m1 = html.match(/property=["']og:image["'][^>]*content=["']([^"']+)/i);
      const m2 = html.match(/content=["']([^"']+)["'][^>]*property=["']og:image["']/i);
      og = (m1 && m1[1]) || (m2 && m2[1]);
      const imgs = [...html.matchAll(/<img[^>]+src=["']([^"']+)["']/gi)].map((m) => m[1]).slice(0, 8);
      console.log("\n" + u + "\n code " + code + " og " + og);
      console.log("imgs", imgs);
    } catch (e) {
      console.log(u, e.message);
    }
  }
})();
