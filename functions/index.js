// functions/index.js
const functions = require("firebase-functions");
const admin = require("firebase-admin");
const axios = require("axios");
const xml2js = require("xml2js");
const crypto = require("crypto");

admin.initializeApp();
const db = admin.firestore();
const parser = new xml2js.Parser({
  explicitArray: false,
  mergeAttrs: true,
  trim: true,
});

function sha1(input) {
  return crypto
    .createHash("sha1")
    .update(String(input || ""))
    .digest("hex");
}

async function fetchRss(url) {
  const res = await axios.get(url, {
    timeout: 20000,
    headers: { "User-Agent": "RSS-Fetcher/1.0 (+your-email-or-site)" },
  });
  return parser.parseStringPromise(res.data);
}

function normalizeItems(parsed) {
  const items = [];
  if (parsed.rss && parsed.rss.channel) {
    let it = parsed.rss.channel.item || [];
    it = Array.isArray(it) ? it : [it];
    for (const i of it) {
      const link =
        (i.link &&
          (typeof i.link === "string" ? i.link : i.link._ || i.link.href)) ||
        (i.guid && (i.guid._ || i.guid)) ||
        null;
      const title =
        (i.title &&
          (typeof i.title === "object" ? i.title._ || i.title : i.title)) ||
        "";
      const description = i.description || i.summary || i.content || "";
      const pubDate = i.pubDate || i.pubdate || i["dc:date"] || null;
      const guid =
        (i.guid &&
          (typeof i.guid === "string" ? i.guid : i.guid._ || i.guid)) ||
        link;
      items.push({
        title,
        link,
        description:
          typeof description === "object"
            ? description._ || ""
            : description || "",
        pubDate: pubDate ? new Date(pubDate) : null,
        guid,
        raw: i,
      });
    }
  } else if (parsed.feed && parsed.feed.entry) {
    let it = parsed.feed.entry;
    it = Array.isArray(it) ? it : [it];
    for (const i of it) {
      let link = null;
      if (i.link) {
        if (Array.isArray(i.link)) {
          const alt = i.link.find((l) => l.rel === "alternate") || i.link[0];
          link = (alt && (alt.href || alt._)) || null;
        } else {
          link =
            i.link.href ||
            i.link._ ||
            (typeof i.link === "string" ? i.link : null);
        }
      }
      const title =
        (i.title &&
          (typeof i.title === "object" ? i.title._ || i.title : i.title)) ||
        "";
      const description = i.summary || i.content || "";
      const pubDate = i.published || i.updated || null;
      const guid = i.id || link;
      items.push({
        title,
        link,
        description:
          typeof description === "object"
            ? description._ || ""
            : description || "",
        pubDate: pubDate ? new Date(pubDate) : null,
        guid,
        raw: i,
      });
    }
  }
  return items.filter((it) => it.link || it.guid);
}

// يدعم أشكال متعددة لبيانات المصادر: array of groups, object with arrays, or array of sources
function extractSourcesFromDocData(data) {
  const result = [];
  if (Array.isArray(data)) {
    for (const entry of data) {
      if (
        entry &&
        typeof entry === "object" &&
        !Array.isArray(entry) &&
        Object.keys(entry).length === 1 &&
        Array.isArray(Object.values(entry)[0])
      ) {
        const arr = Object.values(entry)[0];
        for (const s of arr) result.push(s);
      } else {
        result.push(entry);
      }
    }
    return result;
  }

  if (data && typeof data === "object") {
    if (Array.isArray(data.sources)) return data.sources.slice();
    if (Array.isArray(data.sites)) return data.sites.slice();
    for (const key of Object.keys(data)) {
      const val = data[key];
      if (Array.isArray(val)) {
        for (const s of val) result.push(s);
      } else if (
        val &&
        typeof val === "object" &&
        (val.name || val.url || val.rssUrl)
      ) {
        result.push(val);
      }
    }
    if (result.length === 0 && (data.name || data.url || data.rssUrl))
      result.push(data);
    return result;
  }
  return result;
}

// ===================== runFetchAll =====================
async function runFetchAll({ concurrency = 4, batchSize = 400 } = {}) {
  const summary = {
    sourcesProcessed: 0,
    sourcesSkipped: 0,
    articlesUpserted: 0,
    errors: [],
  };

  const sources = [];
  try {
    const snap = await db.collection("rss").get();
    if (!snap.empty) {
      snap.forEach((doc) => {
        const data = doc.data();
        const extracted = extractSourcesFromDocData(data);
        for (const s of extracted) {
          const rssUrl = s.rssUrl || s.url || s.feed || s.link || null;
          if (!rssUrl) continue;
          sources.push({
            docId: doc.id, // keep doc id to allow updates
            id: s.id ? String(s.id) : sha1(rssUrl + (s.name || "")),
            name: s.name || s.title || null,
            rssUrl,
            language: s.language || null,
            image: s.image || null,
            raw: s,
          });
        }
      });
    }
  } catch (err) {
    summary.errors.push({ type: "read_rss_collection", message: String(err) });
    return summary;
  }

  if (sources.length === 0) {
    return summary; // nothing to do
  }

  summary.sourcesProcessed = sources.length;

  let idx = 0;
  async function worker() {
    while (true) {
      const i = idx++;
      if (i >= sources.length) break;
      const site = sources[i];
      try {
        const parsed = await fetchRss(site.rssUrl);
        const items = normalizeItems(parsed);
        if (!items.length) {
          continue;
        }
        for (let sindex = 0; sindex < items.length; sindex += batchSize) {
          const chunk = items.slice(sindex, sindex + batchSize);
          const batch = db.batch();
          for (const it of chunk) {
            const docId = sha1(it.guid || it.link || it.title);
            const docRef = db
              .collection("sites")
              .doc(site.id)
              .collection("articles")
              .doc(docId);
            batch.set(
              docRef,
              {
                title: it.title || "",
                link: it.link || null,
                description: it.description || "",
                pubDate: it.pubDate
                  ? admin.firestore.Timestamp.fromDate(it.pubDate)
                  : null,
                guid: it.guid || null,
                fetchedAt: admin.firestore.FieldValue.serverTimestamp(),
                siteName: site.name || null,
                siteImage: site.image || null,
                language: site.language || null,
              },
              { merge: true }
            );
          }
          await batch.commit();
          summary.articlesUpserted += chunk.length;
        }
        // update rss doc lastFetchedAt if possible
        if (site.docId) {
          try {
            await db.collection("rss").doc(site.docId).update({
              lastFetchedAt: admin.firestore.FieldValue.serverTimestamp(),
            });
          } catch (e) {
            /* ignore if docId mismatch */
          }
        }
      } catch (err) {
        summary.errors.push({
          site: site.rssUrl,
          message: String(err).slice(0, 1000),
        });
      }
    }
  }

  const runners = Array.from(
    { length: Math.min(concurrency, sources.length) },
    () => worker()
  );
  await Promise.all(runners);

  return summary;
}

// ===================== HTTP trigger =====================
// Security: use functions.config().rss.secret or process.env.RSS_SECRET
const SECRET =
  process.env.RSS_SECRET ||
  (functions.config &&
    functions.config().rss &&
    functions.config().rss.secret) ||
  "change_me_local";

exports.fetchNow = functions.https.onRequest(async (req, res) => {
  try {
    const token =
      req.get("x-rss-secret") || req.query.secret || req.body?.secret;
    if (!token || token !== SECRET) return res.status(401).send("Unauthorized");
    const result = await runFetchAll();
    return res.status(200).json({ ok: true, result });
  } catch (e) {
    console.error("fetchNow error:", e);
    return res.status(500).json({ ok: false, error: String(e) });
  }
});

// ===================== Scheduled (optional, works only if project on Blaze with scheduler enabled) =====================
exports.scheduledFetchGroupedRss = functions.pubsub
  .schedule("every 5 minutes")
  .timeZone("Africa/Cairo")
  .onRun(async (context) => {
    await runFetchAll();
    return null;
  });

// Export runFetchAll for local invocation/tests if needed
exports._runFetchAll = runFetchAll;
