import React from "react";
import { View, Text, StyleSheet } from "react-native";

export default function BrandMark({
  accent,
  size,
}: {
  accent: string;
  size: number;
}) {
  return (
    <View style={[styles.container, { borderColor: accent, width: size, height: size }]}> 
      <Text style={[styles.text, { color: accent, fontSize: Math.max(10, size / 6) }]}>PK</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    borderWidth: 1,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(0,0,0,0.2)",
  },
  text: {
    fontFamily: "monospace",
    fontWeight: "700",
  },
});
