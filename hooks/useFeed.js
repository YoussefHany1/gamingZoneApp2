import { useEffect, useState } from "react";
import { collection, onSnapshot } from "firebase/firestore";
import { db } from "../firebase.js";

export default function useFeed(category, siteName) {
  const [articles, setArticles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const colRef = collection(db, "articles", category, siteName);
    const unsub = onSnapshot(
      colRef,
      (snapshot) => {
        const data = snapshot.docs.map((d) => ({ id: d.id, ...d.data() }));
        setArticles(data);
        setLoading(false);
      },
      (err) => {
        console.error("Realtime error:", err);
        setError(err);
        setLoading(false);
      }
    );

    return () => unsub();
  }, [category, siteName]);

  return { articles, loading, error };
}
