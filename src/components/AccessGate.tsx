import React from "react";
import { Image, Platform, Pressable, StyleSheet, Text, TextInput, View } from "react-native";
import type { AccessFormState, AccessMode } from "../services/accessGate";

const accessLogo = require("../../assets/logo.peakpact.png");

export default function AccessGate({
  mode,
  form,
  busy,
  errorMessage,
  statusMessage,
  onModeChange,
  onFieldChange,
  onSubmit,
}: {
  mode: AccessMode;
  form: AccessFormState;
  busy: boolean;
  errorMessage: string | null;
  statusMessage: string;
  onModeChange: (mode: AccessMode) => void;
  onFieldChange: (field: keyof AccessFormState, value: string) => void;
  onSubmit: () => void;
}) {
  const isWeb = Platform.OS === "web";

  return (
    <View style={styles.container}>
      <View style={styles.backgroundGlow} />
      <View style={styles.backgroundGlowSecondary} />
      <View style={[styles.card, isWeb && styles.cardWeb]}>
        <View style={styles.headerRow}>
          <View style={styles.badge}>
            <Text style={styles.badgeText}>OPERATOR ACCESS</Text>
          </View>
          <Image source={accessLogo} style={styles.logo} resizeMode="contain" />
        </View>

        <Text style={styles.title}>PEAKPACT</Text>
        <Text style={styles.subtitle}>Secure your command center and continue your pact.</Text>

        <View style={styles.modeRow}>
          <Pressable
            style={[styles.modeButton, mode === "SIGN_IN" && styles.modeButtonActive]}
            onPress={() => onModeChange("SIGN_IN")}
          >
            <Text style={styles.modeText}>SIGN IN</Text>
          </Pressable>
          <Pressable
            style={[styles.modeButton, mode === "SIGN_UP" && styles.modeButtonActive]}
            onPress={() => onModeChange("SIGN_UP")}
          >
            <Text style={styles.modeText}>SIGN UP</Text>
          </Pressable>
        </View>

        <View style={styles.form}>
          <Text style={styles.fieldLabel}>EMAIL</Text>
          <TextInput
            style={styles.input}
            value={form.email}
            onChangeText={(value) => onFieldChange("email", value)}
            placeholder="email@peakpact.local"
            keyboardType="email-address"
            placeholderTextColor="#7a8ba0"
            autoCapitalize="none"
            autoCorrect={false}
            selectionColor="#25F9D5"
          />
          <Text style={styles.fieldLabel}>PASSWORD</Text>
          <TextInput
            style={styles.input}
            value={form.password}
            onChangeText={(value) => onFieldChange("password", value)}
            placeholder="PASSWORD"
            placeholderTextColor="#7a8ba0"
            secureTextEntry
            autoCorrect={false}
            selectionColor="#25F9D5"
          />
        </View>

        {errorMessage ? <Text style={styles.error}>{errorMessage}</Text> : null}
        <Text style={styles.status}>{statusMessage}</Text>

        <Pressable style={styles.submit} onPress={onSubmit} disabled={busy}>
          <Text style={styles.submitText}>{busy ? "PROCESSING..." : "GRANT ACCESS"}</Text>
        </Pressable>
        <Text style={styles.footerHint}>No codename required. Just secure access.</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    padding: 20,
    backgroundColor: "#040812",
  },
  backgroundGlow: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(37, 249, 213, 0.06)",
    top: -80,
    left: -80,
    right: "40%",
    bottom: "45%",
    borderRadius: 999,
    transform: [{ rotate: "12deg" }],
  },
  backgroundGlowSecondary: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(79, 163, 255, 0.08)",
    top: "45%",
    left: "35%",
    right: -80,
    bottom: -80,
    borderRadius: 999,
    transform: [{ rotate: "-10deg" }],
  },
  card: {
    position: "relative",
    borderWidth: 1,
    borderColor: "rgba(37, 249, 213, 0.28)",
    backgroundColor: "rgba(5, 10, 22, 0.9)",
    borderRadius: 28,
    padding: 24,
    shadowColor: "#25F9D5",
    shadowOpacity: Platform.OS === "web" ? 0.2 : 0.14,
    shadowRadius: Platform.OS === "web" ? 24 : 14,
    shadowOffset: { width: 0, height: Platform.OS === "web" ? 10 : 6 },
    elevation: Platform.OS === "android" ? 4 : 0,
  },
  cardWeb: {
    width: "100%",
    maxWidth: 560,
    alignSelf: "center",
    borderRadius: 30,
    padding: 28,
    backgroundColor: "rgba(13, 18, 28, 0.88)",
  },
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 10,
  },
  badge: {
    borderWidth: 1,
    borderColor: "rgba(79, 163, 255, 0.34)",
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 6,
    backgroundColor: "rgba(79, 163, 255, 0.12)",
  },
  badgeText: {
    color: "#8eb2ff",
    fontFamily: "monospace",
    fontSize: 10,
    letterSpacing: 1.2,
  },
  title: {
    color: "#F7FCFF",
    fontSize: 24,
    fontFamily: "monospace",
    fontWeight: "700",
    marginBottom: 6,
    textAlign: "center",
  },
  subtitle: {
    color: "#94aac0",
    fontSize: 12,
    fontFamily: "monospace",
    textAlign: "center",
    marginBottom: 18,
    lineHeight: 18,
  },
  modeRow: {
    flexDirection: "row",
    justifyContent: "center",
    gap: 8,
    marginBottom: 18,
  },
  modeButton: {
    borderWidth: 1,
    borderColor: "rgba(79, 163, 255, 0.3)",
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 999,
    minWidth: 96,
    alignItems: "center",
    backgroundColor: "rgba(255, 255, 255, 0.03)",
  },
  modeButtonActive: {
    backgroundColor: "rgba(37, 249, 213, 0.16)",
    borderColor: "rgba(37, 249, 213, 0.6)",
  },
  modeText: {
    color: "#F4F4F5",
    fontFamily: "monospace",
    fontSize: 12,
    fontWeight: "700",
  },
  form: {
    gap: 8,
  },
  fieldLabel: {
    color: "#87d8ff",
    fontFamily: "monospace",
    fontSize: 10,
    letterSpacing: 1.2,
    marginTop: 4,
  },
  input: {
    borderWidth: 1,
    borderColor: "rgba(79, 163, 255, 0.34)",
    paddingHorizontal: 12,
    paddingVertical: 12,
    borderRadius: 12,
    color: "#F4F4F5",
    marginBottom: 6,
    fontFamily: "monospace",
    backgroundColor: "rgba(3, 8, 18, 0.84)",
  },
  error: {
    color: "#FF5DBD",
    fontFamily: "monospace",
    marginBottom: 8,
    marginTop: 6,
  },
  status: {
    color: "#C0C0C8",
    fontFamily: "monospace",
    marginBottom: 14,
  },
  submit: {
    backgroundColor: "rgba(37, 249, 213, 0.18)",
    borderWidth: 1,
    borderColor: "rgba(37, 249, 213, 0.54)",
    padding: 14,
    borderRadius: 14,
    alignItems: "center",
    shadowColor: "#4FA3FF",
    shadowOpacity: Platform.OS === "web" ? 0.16 : 0.1,
    shadowRadius: Platform.OS === "web" ? 12 : 8,
    shadowOffset: { width: 0, height: 8 },
    elevation: Platform.OS === "android" ? 3 : 0,
  },
  submitText: {
    color: "#F7FCFF",
    fontFamily: "monospace",
    fontWeight: "700",
  },
  footerHint: {
    color: "#7a8ba0",
    fontFamily: "monospace",
    fontSize: 10,
    letterSpacing: 0.8,
    marginTop: 12,
    textAlign: "center",
  },
  logo: {
    width: 86,
    height: 86,
    alignSelf: "center",
  },
});