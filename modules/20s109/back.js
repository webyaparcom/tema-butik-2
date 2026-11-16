/* galeri-dergi-sayfa — Galeri Dergi Sayfası — iki sayfalık yayınlar ve sayfa çevirme (16 Kas 2026 · mcp:webmaker/20261116-181132-t332 · D17).
   Görseller ikişer ikişer açık bir dergi yayınına dizilir: iki kâğıt sayfa, ortada cilt gölgesi, her sayfada görsel + kategori + serifli ad + iki sütunlu açıklama ve köşede sayfa numarası. Önceki/sonraki, ok tuşları ya da kaydırmayla sayfa çevrilir (sayaç «03–04 / 07»); tek kalan son sayfa ortalanır. JS yokken yayınlar alt alta; mobilde sayfalar üst üste. En çok 20 görsel.
   Üretici: scripts/modul-fabrika (aile galeri) — elle düzenleme yerine tanımı değiştirip yeniden üret.
   Veri: data: [{ img, baslik?, alt?, metin?, kat?, url?, w?, h?, kucuk? }] — metinler dil sözlüğü; kategori adları desing `cats: [{ id, name }]`; görseli de adı da olmayan satır atlanır. */
const P = "modulex-galeri-dergi-sayfa";
const IMG_KOK = "/img/";
/* --- ortak ön ek (scripts/modul-fabrika/on-ek.js) — dil · güvenlik · sayı yardımcıları --- */
const pick = (v) => {
  if (v == null) return "";
  if (typeof v !== "object") return String(v);
  if (typeof wmPickLang === "function") { try { return wmPickLang(v, json.lang) || ""; } catch (e) { /* alt satır */ } }
  return String(v[json.lang] ?? Object.values(v)[0] ?? "");
};
const esc = (s) => String(s ?? "").replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
const medyaUrl = (v) => {
  const s = String(v ?? "").trim();
  if (!s || /^\s*(javascript|vbscript|file):/i.test(s)) return "";
  if (/^data:/i.test(s)) return /^data:(image|video|audio)\//i.test(s) ? s : "";
  if (s.startsWith("/") || /^https?:\/\//i.test(s)) return s;
  return `${IMG_KOK}${s}`;
};
const href = (v) => {
  const s = String(v ?? "").trim();
  if (!s || /^\s*(javascript|vbscript|data):/i.test(s)) return "";
  if (/^(https?:)?\/\//i.test(s) || /^(mailto:|tel:|#)/i.test(s)) return s;
  return wxLangInternalHref(s);
};
const dogru = (v, d) => (v === undefined || v === null || v === "") ? d : !(v === false || v === "false" || v === 0 || v === "0");
const ikonAd = (v) => String(v ?? "").trim().replace(/[^a-z0-9_]/gi, "");
const satirlar = (s) => esc(s).replace(/\r?\n/g, "<br />");
/* ilk dolu alan: yeni ad önce, eski kuşak şablonun adı yedek (G6 yalnız path değiştirerek takas eder) */
const ilk = (o, ks) => {
  for (const k of ks) {
    const v = o == null ? undefined : o[k];
    if (v == null || v === "") continue;
    if (typeof v === "object" && !Array.isArray(v) && !Object.keys(v).length) continue;
    return v;
  }
  return "";
};
const metinAl = (o, ks) => pick(ilk(o, ks)).trim();
const { desing: des = {} } = json;
const setting = webmakerdata?.setting ?? {};
const veri = Array.isArray(json.data) ? json.data : [];
const dil = String(json.lang || "");
const sayiBicim = (v, ondalik) => {
  try { return new Intl.NumberFormat(dil || undefined, { minimumFractionDigits: ondalik, maximumFractionDigits: ondalik }).format(v); } catch (e) { return String(v); }
};
const ikonH = (ad, sinif) => (ad ? `<span class="${sinif} material-symbols-outlined" aria-hidden="true">${ad}</span>` : "");
const no = (i) => String(i + 1).padStart(2, "0");
const ctaHtml = () => {
  const a1 = metinAl(des, ["cta_ad", "button"]); const u1 = href(ilk(des, ["cta_url", "buttonurl", "url"]));
  const a2 = metinAl(des, ["cta2_ad"]); const u2 = href(ilk(des, ["cta2_url"]));
  const d = (a, u, ek) => (a && u ? `<a class="${P}-dugme${ek}" href="${esc(u)}">${esc(a)}<span class="material-symbols-outlined mx-flip" aria-hidden="true">arrow_forward</span></a>` : "");
  const ic = d(a1, u1, "") + d(a2, u2, ` ${P}-dugme--ikincil`);
  return ic ? `<div class="${P}-cta">${ic}</div>` : "";
};
const basHtml = (B, ek) => {
  if (!B.ust && !B.baslik && !B.metin && !ek) return "";
  return `<header class="${P}-bas">`
    + (B.ust ? `<p class="${P}-ust">${esc(B.ust)}</p>` : "")
    + (B.baslik ? `<h2 class="${P}-baslik" id="${P}-{{id}}-b">${esc(B.baslik)}</h2>` : "")
    + (B.metin ? `<p class="${P}-metin">${satirlar(B.metin)}</p>` : "")
    + (ek || "")
    + "</header>";
};
/* --- aile: galeri --- */
const boyut = (v, d) => { const n = parseInt(v, 10); return Number.isFinite(n) && n > 0 && n < 20000 ? n : d; };
const katAdlari = {};
(Array.isArray(des.cats) ? des.cats : []).forEach((c) => { if (c && c.id != null && c.id !== "") katAdlari[String(c.id)] = pick(c.name ?? c.ad).trim(); });
const kaynak = veri.length ? veri : (Array.isArray(des.items) ? des.items : []);
const kayitlar = kaynak.map((o) => {
  o = o || {};
  const baslik = metinAl(o, ["baslik", "title", "name"]);
  const katHam = ilk(o, ["kat", "cat", "category"]);
  const kat = typeof katHam === "object" ? pick(katHam).trim() : String(katHam).trim();
  return {
    img: medyaUrl(ilk(o, ["img", "image", "src"])), kucuk: medyaUrl(ilk(o, ["kucuk", "thumb"])), baslik, alt: metinAl(o, ["alt"]) || baslik,
    metin: metinAl(o, ["metin", "description", "text", "aciklama", "note"]), kat,
    katAd: metinAl(o, ["katAd"]) || katAdlari[kat] || (typeof katHam === "object" ? kat : ""),
    url: href(ilk(o, ["url", "link"])), w: boyut(o.w, 1200), h: boyut(o.h, 900),
  };
}).filter((k) => k.img || k.alt);
/* süzgeç/sekme: en çok 8 kategori (eski modülün cats sırası değil, verideki ilk görünüş sırası) */
const katlar = [...new Set(kayitlar.map((k) => k.kat).filter(Boolean))].slice(0, 8);
const katEt = (c) => (kayitlar.find((k) => k.kat === c && k.katAd) || {}).katAd || c;
const tumu = metinAl(des, ["tumu", "allLabel"]) || "@all@";
/* görsel: yoksa yer tutucu (role=img + alt) — tam=true büyük görünüm için asıl dosya */
const gH = (k, s, tam) => (k.img ? `<img class="${P}-${s || "g"}" src="${esc(tam ? k.img : (k.kucuk || k.img))}" alt="${esc(k.alt)}" width="${k.w}" height="${k.h}" loading="lazy" decoding="async" />` : `<span class="${P}-${s || "g"} ${P}-yer" role="img" aria-label="${esc(k.alt)}"><span class="material-symbols-outlined" aria-hidden="true">image</span></span>`);
const bH = (k, s, t) => (k.baslik ? `<${t || "h3"} class="${P}-${s || "kbaslik"}">${k.url ? `<a class="${P}-bag" href="${esc(k.url)}">${esc(k.baslik)}</a>` : esc(k.baslik)}</${t || "h3"}>` : "");
const mH = (k, s) => (k.metin ? `<p class="${P}-${s || "kmetin"}">${satirlar(k.metin)}</p>` : "");
const kH = (k, s) => (k.katAd ? `<p class="${P}-${s || "kat"}">${esc(k.katAd)}</p>` : "");
const okH = () => `<div class="${P}-kontrol"><button type="button" class="${P}-ok" data-ray="geri" aria-label="@previous@"><span class="material-symbols-outlined mx-flip" aria-hidden="true">arrow_back</span></button><button type="button" class="${P}-ok" data-ray="ileri" aria-label="@next@"><span class="material-symbols-outlined mx-flip" aria-hidden="true">arrow_forward</span></button></div>`;
/* --- modül: galeri-dergi-sayfa --- */
const kart = () => "";
const sar = (ic, A) => {
    const L = A.slice(0, 20);
    const C = [];
    for (let i = 0; i < L.length; i += 2) C.push(L.slice(i, i + 2));
    const etk = (i) => `${no(i * 2)}${C[i].length > 1 ? `–${no(i * 2 + 1)}` : ""} / ${no(L.length - 1)}`;
    const sayfa = (k, j) => `<article class="${P}-sayfa"><div class="${P}-kap">${gH(k, "g", true)}</div><div class="${P}-yazi">${kH(k)}${bH(k)}${mH(k)}</div><span class="${P}-sno" aria-hidden="true">${no(j)}</span></article>`;
    const yayin = C.map((c, i) => `<div class="${P}-yayin${c.length < 2 ? ` ${P}-yayin--tek` : ""}" data-kt="${i}" data-kt-etiket="${etk(i)}">${c.map((k, j) => sayfa(k, i * 2 + j)).join("")}</div>`).join("");
    const ok = (d, y) => `<button type="button" class="${P}-ok" data-kt-git="${d}" aria-label="${d < 0 ? "@previous@" : "@next@"}"><span class="material-symbols-outlined mx-flip" aria-hidden="true">${y}</span></button>`;
    const arac = C.length > 1 ? `<div class="${P}-arac">${ok(-1, "arrow_back")}<p class="${P}-sayac" aria-live="polite"><bdi dir="ltr" data-kt-say>${etk(0)}</bdi></p>${ok(1, "arrow_forward")}</div>` : "";
    return `<div class="${P}-kitap">${yayin}</div>${arac}`;
  };
const B = { ust: metinAl(des, ["ust","badge","kicker"]), baslik: metinAl(des, ["baslik","title"]), metin: metinAl(des, ["metin","description"]) };
/* veri yoksa gövde hiç kurulmaz (sarmalayıcı boş listeye dokunmaz) */
const BOS = !kayitlar.length;
const govde = BOS ? "" : sar(kayitlar.map((k, i) => kart(k, i, kayitlar.length, kayitlar)).join(""), kayitlar, B);
const bas = basHtml(B, "");
const sinif = (bas || B.ust || B.baslik || B.metin ? "" : ` ${P}--bassiz`);
html = html
  .replaceAll("{{fbsinif}}", () => sinif)
  .replaceAll("{{fbetiket}}", () => (B.baslik ? `aria-labelledby="${P}-{{id}}-b"` : ""))
  .replaceAll("{{fbbas}}", () => bas)
  .replaceAll("{{fbgovde}}", () => govde);
if (BOS) html = "";
