import React from "react";
import { View, Text, Pressable, StyleSheet } from "react-native";

export default function MonetizationPanel({
  visible,
  accent,
  plan,
}: {
  visible: boolean;
  accent: string;
  plan: string;
}) {
  if (!visible) {
    return null;
  }
  return (
    <View style={[styles.panel, { borderColor: accent }]}> 
      <Text style={[styles.title, { color: accent }]}>PREMIUM PAYWALL</Text>
      <Text style={styles.body}>Upgrade to Premium for voice recording, mission autoload, and time dilation.</Text>
      <Pressable style={[styles.action, { borderColor: accent }]}> 
        <Text style={[styles.actionText, { color: accent }]}>OPEN PAYWALL</Text>
      </Pressable>
      <Text style={styles.note}>Current plan: {plan}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  panel: {
    borderWidth: 1,
    borderRadius: 14,
    padding: 12,
    marginTop: 12,
    backgroundColor: "rgba(0,0,0,0.36)",
  },
  title: {
    fontFamily: "monospace",
    fontSize: 12,
    fontWeight: "700",
    marginBottom: 6,
  },
  body: {
    fontFamily: "monospace",
    fontSize: 11,
    color: "#C0C0C8",
    marginBottom: 10,
  },
  action: {
    borderWidth: 1,
    padding: 10,
    borderRadius: 10,
    alignItems: "center",
    marginBottom: 10,
  },
  actionText: {
    fontFamily: "monospace",
    fontSize: 11,
    fontWeight: "700",
  },
  note: {
    fontFamily: "monospace",
    fontSize: 10,
    color: "#888",
  },
});
