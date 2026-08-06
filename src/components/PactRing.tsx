import React from "react";
import { View, Text, StyleSheet } from "react-native";

export default function PactRing({
  accent,
  pactComplete,
  redActive,
  size,
}: {
  accent: string;
  pactComplete: boolean;
  redActive: boolean;
  size: number;
}) {
  return (
    <View
      style={[
        styles.container,
        {
          width: size,
          height: size,
          borderColor: accent,
          backgroundColor: redActive ? "rgba(255,0,51,0.12)" : "rgba(0,255,0,0.08)",
        },
      ]}
    >
      <View
        style={[
          styles.inner,
          {
            borderColor: accent,
            backgroundColor: pactComplete ? "rgba(244,244,245,0.16)" : "transparent",
          },
        ]}
      />
      <Text style={[styles.label, { color: accent }]}>P</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    borderWidth: 3,
    borderRadius: 999,
    alignItems: "center",
    justifyContent: "center",
  },
  inner: {
    width: "70%",
    height: "70%",
    borderWidth: 1,
    borderRadius: 999,
  },
  label: {
    position: "absolute",
    fontFamily: "monospace",
    fontSize: 12,
    fontWeight: "700",
  },
});