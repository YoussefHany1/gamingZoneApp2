import axios from "axios";
import { useEffect, useState, useCallback } from "react";

// Use local server instead of Firebase Cloud Functions
// For React Native, use the computer's IP address instead of localhost
const BASE_URL = "http://192.168.1.100:4000"; // Replace with your computer's IP address

export default function useFeed(feedUrl) {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [refreshing, setRefreshing] = useState(false);

  const fetchFeed = useCallback(async (url) => {
    if (!url) return;
    try {
      console.log(`Fetching feed from: ${url}`);
      const requestUrl = `${BASE_URL}/feed`;
      const params = { url };
      const res = await axios.get(requestUrl, { params });

      // Parse the RSS feed response
      const rssData = res.data;
      let dataItems = [];

      if (
        rssData &&
        rssData.rss &&
        rssData.rss.channel &&
        rssData.rss.channel[0] &&
        rssData.rss.channel[0].item
      ) {
        dataItems = rssData.rss.channel[0].item;
        console.log(
          `Successfully loaded ${dataItems.length} items from ${url}`
        );
      } else {
        console.warn("No items found in RSS feed response");
      }

      setItems(dataItems);
      setError(null); // Clear any previous errors
    } catch (err) {
      console.error("Error fetching feed:", err);
      setError(err);
      throw err;
    }
  }, []);

  useEffect(() => {
    if (!feedUrl) {
      return;
    }
    setLoading(true);
    fetchFeed(feedUrl)
      .catch((err) => setError(err))
      .finally(() => setLoading(false));
  }, [feedUrl, fetchFeed]);

  const onRefresh = useCallback(async () => {
    if (!feedUrl) return;
    try {
      setRefreshing(true);
      await fetchFeed(feedUrl);
    } catch (err) {
      setError(err);
    } finally {
      setRefreshing(false);
    }
  }, [feedUrl, fetchFeed]);

  return { items, loading, error, refreshing, onRefresh };
}
