// notificationService.js
import * as Notifications from "expo-notifications";
import AsyncStorage from "@react-native-async-storage/async-storage";

// Configure notification behavior
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

class NotificationService {
  constructor() {
    this.lastCheckedItems = new Map(); // Store last checked items for each RSS feed
    this.ws = null;
    this.isConnected = false;
    this.reconnectAttempts = 0;
    this.maxReconnectAttempts = 5;
    this.reconnectDelay = 3000; // 3 seconds
    this.notificationSettings = {
      enabled: true,
      categories: {
        news: true,
        reviews: true,
        hardware: true,
      },
      sources: {}, // Will be populated from static sources or API
    };
  }

  // Initialize notifications and request permissions
  async initialize() {
    try {
      const { status } = await Notifications.requestPermissionsAsync();
      if (status !== "granted") {
        console.log("Notification permission denied");
        return false;
      }

      // Load notification settings
      await this.loadNotificationSettings();

      // Set up notification listeners
      this.setupNotificationListeners();

      // Connect to WebSocket
      await this.connectWebSocket();

      return true;
    } catch (error) {
      console.error("Error initializing notifications:", error);
      return false;
    }
  }

  // Update sources from static data or API
  async updateSources() {
    try {
      // For now, use static sources or you can fetch from an API
      const staticSources = {
        news: [{ url: "https://example-news.com/rss", name: "Example News" }],
        reviews: [
          { url: "https://example-reviews.com/rss", name: "Example Reviews" },
        ],
        hardware: [
          { url: "https://example-hardware.com/rss", name: "Example Hardware" },
        ],
      };

      const sources = {};
      Object.keys(staticSources).forEach((category) => {
        staticSources[category].forEach((source) => {
          sources[source.url] = true;
        });
      });

      this.notificationSettings.sources = sources;
      await this.saveNotificationSettings();
    } catch (error) {
      console.error("Error updating sources:", error);
    }
  }

  // Set up notification listeners
  setupNotificationListeners() {
    // Handle notification received while app is in foreground
    Notifications.addNotificationReceivedListener((notification) => {
      console.log("Notification received:", notification);
    });

    // Handle notification response (when user taps on notification)
    Notifications.addNotificationResponseReceivedListener((response) => {
      console.log("Notification response:", response);
      const data = response.notification.request.content.data;

      if (data && data.url) {
        // Import Linking dynamically to avoid issues
        import("expo-linking").then(({ default: Linking }) => {
          Linking.openURL(data.url);
        });
      }
    });
  }

  // Load notification settings from storage
  async loadNotificationSettings() {
    try {
      const settings = await AsyncStorage.getItem("notificationSettings");
      if (settings) {
        this.notificationSettings = JSON.parse(settings);
      }
    } catch (error) {
      console.error("Error loading notification settings:", error);
    }
  }

  // Save notification settings to storage
  async saveNotificationSettings() {
    try {
      await AsyncStorage.setItem(
        "notificationSettings",
        JSON.stringify(this.notificationSettings)
      );
    } catch (error) {
      console.error("Error saving notification settings:", error);
    }
  }

  // Update notification settings
  async updateNotificationSettings(newSettings) {
    this.notificationSettings = {
      ...this.notificationSettings,
      ...newSettings,
    };
    await this.saveNotificationSettings();
  }

  // Connect to WebSocket server
  async connectWebSocket() {
    try {
      // For React Native, we'll use a different approach since WebSocket is built-in
      const wsUrl = "ws://192.168.1.100:4000"; // Update this to match your server IP

      this.ws = /* WEBSOCKET REMOVED: use Firestore realtime listeners or FCM */
/* original code removed */
this.ws.onopen = () => {
        console.log("WebSocket connected");
        this.isConnected = true;
        this.reconnectAttempts = 0;
      };

      this.ws.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          if (data.type === "new_rss_item") {
            this.handleNewRSSItem(data);
          }
        } catch (error) {
          console.error("Error parsing WebSocket message:", error);
        }
      };

      this.ws.onclose = () => {
        console.log("WebSocket disconnected");
        this.isConnected = false;
        this.attemptReconnect();
      };

      this.ws.onerror = (error) => {
        console.error("WebSocket error:", error);
        this.isConnected = false;
      };
    } catch (error) {
      console.error("Error connecting to WebSocket:", error);
      this.attemptReconnect();
    }
  }

  // Attempt to reconnect to WebSocket
  attemptReconnect() {
    if (this.reconnectAttempts < this.maxReconnectAttempts) {
      this.reconnectAttempts++;
      console.log(
        `Attempting to reconnect... (${this.reconnectAttempts}/${this.maxReconnectAttempts})`
      );

      setTimeout(() => {
        this.connectWebSocket();
      }, this.reconnectDelay * this.reconnectAttempts);
    } else {
      console.log("Max reconnection attempts reached");
    }
  }

  // Handle new RSS item from WebSocket
  async handleNewRSSItem(data) {
    try {
      // Check if notifications are enabled
      if (!this.notificationSettings.enabled) {
        return;
      }

      // Check if category is enabled
      if (!this.notificationSettings.categories[data.category]) {
        return;
      }

      // Check if specific source is enabled
      if (!this.notificationSettings.sources[data.sourceUrl]) {
        return;
      }

      await this.sendNotification({
        title: data.title,
        description: data.description,
        link: data.link,
        category: data.category,
        source: data.source,
      });
    } catch (error) {
      console.error("Error handling new RSS item:", error);
    }
  }

  // Check for new items and send notifications
  async checkForNewItems(feedUrl, items, category) {
    try {
      const storageKey = `lastItems_${feedUrl}`;
      const lastItems = await AsyncStorage.getItem(storageKey);

      if (!lastItems) {
        // First time checking this feed, store current items
        await AsyncStorage.setItem(
          storageKey,
          JSON.stringify(items.slice(0, 3))
        );
        return;
      }

      const lastItemsArray = JSON.parse(lastItems);
      const newItems = items.filter(
        (item) =>
          !lastItemsArray.some(
            (lastItem) => lastItem.title?.[0] === item.title?.[0]
          )
      );

      if (newItems.length > 0) {
        // Send notification for new items
        for (const item of newItems.slice(0, 3)) {
          // Limit to 3 notifications
          await this.sendNotification(item, category);
        }

        // Update stored items
        await AsyncStorage.setItem(
          storageKey,
          JSON.stringify(items.slice(0, 3))
        );
      }
    } catch (error) {
      console.error("Error checking for new items:", error);
    }
  }

  // Send notification for a specific item
  async sendNotification(item) {
    try {
      const title = item.title?.substring(0, 50) + "..." || "New Article";
      const body = `${item.source}: ${item.description?.substring(0, 80)}...`;

      await Notifications.scheduleNotificationAsync({
        content: {
          title: title,
          body: body,
          data: {
            url: item.link,
            category: item.category,
            source: item.source,
          },
        },
        trigger: null, // Send immediately
      });

      console.log(`Notification sent: ${title}`);
    } catch (error) {
      console.error("Error sending notification:", error);
    }
  }

  // Disconnect WebSocket
  disconnect() {
    if (this.ws) {
      this.ws.close();
      this.ws = null;
      this.isConnected = false;
    }
  }

  // Get connection status
  getConnectionStatus() {
    return {
      isConnected: this.isConnected,
      reconnectAttempts: this.reconnectAttempts,
    };
  }

  // Get notification settings
  getNotificationSettings() {
    return this.notificationSettings;
  }

  // Get RSS sources by category
  getRSSSources() {
    // Return static sources for now
    return {
      news: [{ url: "https://example-news.com/rss", name: "Example News" }],
      reviews: [
        { url: "https://example-reviews.com/rss", name: "Example Reviews" },
      ],
      hardware: [
        { url: "https://example-hardware.com/rss", name: "Example Hardware" },
      ],
    };
  }

  // Clear all notifications
  async clearAllNotifications() {
    await Notifications.dismissAllNotificationsAsync();
  }
}

export default new NotificationService();
