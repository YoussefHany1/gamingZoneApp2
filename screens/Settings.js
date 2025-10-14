import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  Switch,
  ScrollView,
  TouchableOpacity,
  Alert,
  StatusBar,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import notificationService from "../notificationService";

const SettingsScreen = () => {
  const [settings, setSettings] = useState({
    enabled: true,
    categories: {
      news: true,
      reviews: true,
      hardware: true,
    },
    sources: {},
  });
  const [connectionStatus, setConnectionStatus] = useState({
    isConnected: false,
    reconnectAttempts: 0,
  });
  const [expandedCategory, setExpandedCategory] = useState(null);

  useEffect(() => {
    // Load current settings
    const currentSettings = notificationService.getNotificationSettings();
    setSettings(currentSettings);

    // Get connection status
    const status = notificationService.getConnectionStatus();
    setConnectionStatus(status);

    // Update connection status every 5 seconds
    const interval = setInterval(() => {
      const status = notificationService.getConnectionStatus();
      setConnectionStatus(status);
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  const handleSettingChange = async (key, value) => {
    const newSettings = { ...settings, [key]: value };
    setSettings(newSettings);
    await notificationService.updateNotificationSettings(newSettings);
  };

  const handleCategoryChange = async (category, value) => {
    const newSettings = {
      ...settings,
      categories: {
        ...settings.categories,
        [category]: value,
      },
    };
    setSettings(newSettings);
    await notificationService.updateNotificationSettings(newSettings);
  };

  const handleSourceChange = async (sourceUrl, value) => {
    const newSettings = {
      ...settings,
      sources: {
        ...settings.sources,
        [sourceUrl]: value,
      },
    };
    setSettings(newSettings);
    await notificationService.updateNotificationSettings(newSettings);
  };

  const toggleCategory = (category) => {
    setExpandedCategory(expandedCategory === category ? null : category);
  };

  const handleClearNotifications = () => {
    Alert.alert("مسح الإشعارات", "هل تريد مسح جميع الإشعارات؟", [
      { text: "إلغاء", style: "cancel" },
      {
        text: "مسح",
        style: "destructive",
        onPress: async () => {
          await notificationService.clearAllNotifications();
          Alert.alert("تم", "تم مسح جميع الإشعارات");
        },
      },
    ]);
  };

  const handleReconnect = () => {
    notificationService.disconnect();
    setTimeout(() => {
      notificationService.connectWebSocket();
    }, 1000);
  };

  const getConnectionStatusText = () => {
    if (connectionStatus.isConnected) {
      return "متصل";
    } else if (connectionStatus.reconnectAttempts > 0) {
      return `محاولة إعادة الاتصال (${connectionStatus.reconnectAttempts})`;
    } else {
      return "غير متصل";
    }
  };

  const getConnectionStatusColor = () => {
    if (connectionStatus.isConnected) {
      return "#4CAF50";
    } else {
      return "#F44336";
    }
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#0c1a33" />

      <View style={styles.header}>
        <Text style={styles.headerTitle}>الإعدادات</Text>
      </View>

      <ScrollView style={styles.content}>
        {/* Connection Status */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>حالة الاتصال</Text>
          <View style={styles.connectionStatus}>
            <View style={styles.connectionInfo}>
              <View
                style={[
                  styles.statusDot,
                  { backgroundColor: getConnectionStatusColor() },
                ]}
              />
              <Text style={styles.statusText}>{getConnectionStatusText()}</Text>
            </View>
            <TouchableOpacity
              style={styles.reconnectButton}
              onPress={handleReconnect}
              disabled={connectionStatus.isConnected}
            >
              <Ionicons
                name="refresh"
                size={20}
                color={connectionStatus.isConnected ? "#666" : "#779bdd"}
              />
            </TouchableOpacity>
          </View>
        </View>

        {/* Notification Settings */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>إعدادات الإشعارات</Text>

          <View style={styles.settingRow}>
            <Text style={styles.settingLabel}>تفعيل الإشعارات</Text>
            <Switch
              value={settings.enabled}
              onValueChange={(value) => handleSettingChange("enabled", value)}
              trackColor={{ false: "#767577", true: "#779bdd" }}
              thumbColor={settings.enabled ? "#fff" : "#f4f3f4"}
            />
          </View>
        </View>

        {/* Category Settings */}
        {settings.enabled && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>الفئات</Text>
            {Object.entries(settings.categories || {}).map(
              ([category, enabled]) => {
                const categoryNames = {
                  news: "أخبار الألعاب",
                  reviews: "مراجعات الألعاب",
                  hardware: "أخبار الهاردوير",
                };

                return (
                  <View key={category}>
                    <TouchableOpacity
                      style={styles.categoryHeader}
                      onPress={() => toggleCategory(category)}
                    >
                      <Text style={styles.categoryLabel}>
                        {categoryNames[category]}
                      </Text>
                      <View style={styles.categoryHeaderRight}>
                        <Switch
                          value={enabled}
                          onValueChange={(value) =>
                            handleCategoryChange(category, value)
                          }
                          trackColor={{ false: "#767577", true: "#779bdd" }}
                          thumbColor={enabled ? "#fff" : "#f4f3f4"}
                        />
                        <Ionicons
                          name={
                            expandedCategory === category
                              ? "chevron-up"
                              : "chevron-down"
                          }
                          size={20}
                          color="#779bdd"
                          style={{ marginLeft: 10 }}
                        />
                      </View>
                    </TouchableOpacity>

                    {expandedCategory === category && enabled && (
                      <View style={styles.sourcesList}>
                        {notificationService
                          .getRSSSources()
                          [category]?.map((source) => (
                            <View key={source.url} style={styles.sourceRow}>
                              <Text style={styles.sourceLabel}>
                                {source.name}
                              </Text>
                              <Switch
                                value={settings.sources[source.url] !== false}
                                onValueChange={(value) =>
                                  handleSourceChange(source.url, value)
                                }
                                trackColor={{
                                  false: "#767577",
                                  true: "#779bdd",
                                }}
                                thumbColor={
                                  settings.sources[source.url] !== false
                                    ? "#fff"
                                    : "#f4f3f4"
                                }
                              />
                            </View>
                          ))}
                      </View>
                    )}
                  </View>
                );
              }
            )}
          </View>
        )}

        {/* Actions */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>الإجراءات</Text>

          <TouchableOpacity
            style={styles.actionButton}
            onPress={handleClearNotifications}
          >
            <Ionicons name="trash-outline" size={24} color="#F44336" />
            <Text style={styles.actionButtonText}>مسح جميع الإشعارات</Text>
          </TouchableOpacity>
        </View>

        {/* Information */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>معلومات</Text>
          <View style={styles.infoCard}>
            <Text style={styles.infoText}>
              • يتم فحص مصادر الأخبار كل 5 دقائق
            </Text>
            <Text style={styles.infoText}>
              • الإشعارات تصل فورياً عند نشر خبر جديد
            </Text>
            <Text style={styles.infoText}>
              • يمكنك التحكم في الفئات والمصادر بشكل منفصل
            </Text>
            <Text style={styles.infoText}>
              • اضغط على أيقونة السهم لتوسيع قائمة المصادر
            </Text>
          </View>
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#0c1a33",
  },
  header: {
    paddingTop: 50,
    paddingBottom: 20,
    paddingHorizontal: 20,
    backgroundColor: "#0a0f1c",
    borderBottomWidth: 1,
    borderBottomColor: "#4a5565",
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#fff",
    textAlign: "center",
  },
  content: {
    flex: 1,
    padding: 20,
  },
  section: {
    marginBottom: 30,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#779bdd",
    marginBottom: 15,
  },
  connectionStatus: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: "#1a2332",
    padding: 15,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#4a5565",
  },
  connectionInfo: {
    flexDirection: "row",
    alignItems: "center",
  },
  statusDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: 10,
  },
  statusText: {
    color: "#fff",
    fontSize: 16,
  },
  reconnectButton: {
    padding: 10,
    borderRadius: 5,
  },
  settingRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: "#1a2332",
    padding: 15,
    borderRadius: 10,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: "#4a5565",
  },
  settingLabel: {
    color: "#fff",
    fontSize: 16,
    flex: 1,
  },
  categoryHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: "#1a2332",
    padding: 15,
    borderRadius: 10,
    marginBottom: 5,
    borderWidth: 1,
    borderColor: "#4a5565",
  },
  categoryHeaderRight: {
    flexDirection: "row",
    alignItems: "center",
  },
  categoryLabel: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
    flex: 1,
  },
  sourcesList: {
    backgroundColor: "#0f1419",
    borderRadius: 10,
    marginBottom: 10,
    padding: 10,
    borderWidth: 1,
    borderColor: "#2a3441",
  },
  sourceRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 12,
    paddingHorizontal: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#2a3441",
  },
  sourceLabel: {
    color: "#b7becb",
    fontSize: 14,
    flex: 1,
    marginLeft: 10,
  },
  actionButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#1a2332",
    padding: 15,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#4a5565",
  },
  actionButtonText: {
    color: "#F44336",
    fontSize: 16,
    marginLeft: 15,
    fontWeight: "500",
  },
  infoCard: {
    backgroundColor: "#1a2332",
    padding: 15,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#4a5565",
  },
  infoText: {
    color: "#b7becb",
    fontSize: 14,
    marginBottom: 8,
    lineHeight: 20,
  },
});

export default SettingsScreen;
