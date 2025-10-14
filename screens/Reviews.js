import React from "react";
import { View, Text, StyleSheet } from "react-native";

function Reviews() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Reviews</Text>
      <Text style={styles.subtitle}>Latest game reviews will appear here.</Text>
    </View>
  );
}

export default Reviews;

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
