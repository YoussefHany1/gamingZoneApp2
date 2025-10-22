// fetchRss.mjs  (Node 18+)
import { parseStringPromise } from "xml2js";
import he from "he";
import striptags from "striptags";
const RSS_URL = "https://feeds.feedburner.com/ign/news";

async function fetchRss(url) {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`HTTP error ${res.status}`);
  const xml = await res.text();

  // تحويل XML إلى كائن JS
  const parsed = await parseStringPromise(xml, {
    explicitArray: false,
    trim: true,
  });
  // المسار الشائع في RSS: rss.channel.item
  const items = parsed?.rss?.channel?.item ?? [];

  const list = Array.isArray(items) ? items : [items];

  function extractThumbnail(it) {
    if (!it) return null;

    // لو في تاق img داخل الـ description
    const descriptionImage = String(it.description).match(
      /<img[^>]+src=(?:'|"|)([^"' >]+)(?:'|"|)[^>]*>/i
    )?.[1];
    const contentImage = he
      .decode(String(it["content:encoded"]))
      .match(/<img[^>]+src=(?:'|"|)([^"' >]+)(?:'|"|)[^>]*>/i)?.[1];
    // نجرب أكثر من احتمال حسب أنواع RSS

    return (
      it.thumbnail ||
      it.thumbnail?.[0] ||
      it.image ||
      it.enclosure?.url ||
      it.enclosure?.[0]?.url ||
      it.enclosure?.[0]?.["url"]?.[0] ||
      it.enclosure?.link ||
      it.enclosure?.[0]?.link ||
      it["media:thumbnail"] ||
      it["media:thumbnail"]?.url ||
      it["media:thumbnail"]?.[0] ||
      it["media:thumbnail"]?.[0]?.url ||
      it["media:content"]?.["$"]?.url ||
      it["media:content"]?.url ||
      it["media:content"]?.[0]?.url ||
      it["media:content"]?.[0]?.["url"]?.[0] ||
      descriptionImage ||
      contentImage ||
      null
    );
  }

  // اطبع العناصر في الكونسل بصيغة منظمة
  list.forEach((it, idx) => {
    console.log(`--- Item ${idx + 1} ---`);
    // console.log("title:", it.title ?? "");
    // console.log("link :", it.link ?? "");
    // console.log("pubDate :", it.pubDate ?? "");
    // // description أحيانًا يحتوي على HTML — اطبع مقتطف
    // console.log("description (snippet):", (it.description ?? "").slice(0, 200));
    let content = he
      .decode(String(it["content:encoded"]))
      .match(/<img[^>]+src=(?:'|"|)([^"' >]+)(?:'|"|)[^>]*>/i)?.[1];
    console.log(extractThumbnail(it));
  });

  // لو حبيت ترجع البيانات ككائن:
  return list.map((it) => ({
    title: it.title ?? "",
    link: it.link ?? "",
    pubDate: it.pubDate ?? "",
    description: it.description ?? "",
  }));
}

// تشغيل
fetchRss(RSS_URL)
  .then(() => console.log("Done."))
  .catch((err) => {
    console.error("Error fetching/parsing RSS:", err.message);
    process.exit(1);
  });
