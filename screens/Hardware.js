import React from "react";
import { View, Text, StyleSheet } from "react-native";

function Hardware() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Hardware</Text>
      <Text style={styles.subtitle}>
        Latest hardware news and reviews here.
      </Text>
    </View>
  );
}

export default Hardware;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#0c1a33",
    alignItems: "center",
    justifyContent: "center",
    padding: 16,
  },
  title: {
    color: "#ffffff",
    fontSize: 24,
    fontWeight: "700",
    marginBottom: 8,
  },
  subtitle: {
    color: "#a9b7d0",
    fontSize: 14,
  },
});
