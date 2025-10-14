import { collection, onSnapshot } from "firebase/firestore";
import { db } from "./firebase.js";

// fetch rss urls from firestore
const docRef = collection(db, "rss");
console.log("Listening to Firestore document...");
let rssFeeds = [];

onSnapshot(
  docRef,
  (snap) => {
    if (snap) {
      rssFeeds.push(...snap.docs.map((d) => ({ ...d.data() })));
      console.log("✅ Current data: ", rssFeeds);
      // rssFeeds.find((item) => console.log(item.news));
    } else {
      console.log("❌ Document does not exist.");
    }
  },
  (err) => {
    console.error("🚨 Error while fetching Firestore document:", err);
  }
);
