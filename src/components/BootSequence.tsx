import React, { useEffect } from "react";
import { View, Text, Pressable, StyleSheet } from "react-native";

export default function BootSequence({
  onComplete,
}: {
  onComplete: () => void;
}) {
  useEffect(() => {
    const timer = setTimeout(onComplete, 1000);
    return () => clearTimeout(timer);
  }, [onComplete]);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>PEAKPACT MAINFRAME</Text>
      <Text style={styles.subtitle}>BOOT SEQUENCE INITIATED</Text>
      <Pressable style={styles.button} onPress={onComplete}>
        <Text style={styles.buttonText}>SKIP</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 20,
    backgroundColor: "#000",
  },
  title: {
    color: "#00FF00",
    fontFamily: "monospace",
    fontSize: 24,
    fontWeight: "700",
    marginBottom: 12,
  },
  subtitle: {
    color: "#C0C0C8",
    fontFamily: "monospace",
    fontSize: 14,
    marginBottom: 22,
    textAlign: "center",
  },
  button: {
    borderWidth: 1,
    borderColor: "#00FF00",
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 10,
  },
  buttonText: {
    color: "#F4F4F5",
    fontFamily: "monospace",
    fontWeight: "700",
  },
});
