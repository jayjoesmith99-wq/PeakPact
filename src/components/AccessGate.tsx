import React from "react";
import { View, Text, TextInput, Pressable, StyleSheet } from "react-native";
import { type AccessFormState, type AccessMode } from "../services/accessGate";

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
  return (
    <View style={styles.container}>
      <Text style={styles.title}>PEAKPACT / ACCESS GATE</Text>
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
        <TextInput
          style={styles.input}
          value={form.email}
          onChangeText={(value) => onFieldChange("email", value)}
          placeholder="email@peakpact.local"
          keyboardType="email-address"
          placeholderTextColor="#999"
          autoCapitalize="none"
        />
        <TextInput
          style={styles.input}
          value={form.codename}
          onChangeText={(value) => onFieldChange("codename", value)}
          placeholder="CODENAME"
          placeholderTextColor="#999"
        />
        <TextInput
          style={styles.input}
          value={form.password}
          onChangeText={(value) => onFieldChange("password", value)}
          placeholder="PASSWORD"
          placeholderTextColor="#999"
          secureTextEntry
        />
      </View>
      {errorMessage ? <Text style={styles.error}>{errorMessage}</Text> : null}
      <Text style={styles.status}>{statusMessage}</Text>
      <Pressable style={styles.submit} onPress={onSubmit} disabled={busy}>
        <Text style={styles.submitText}>{busy ? "PROCESSING..." : "GRANT ACCESS"}</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 24,
    justifyContent: "center",
    backgroundColor: "#000",
  },
  title: {
    color: "#00FF00",
    fontSize: 22,
    fontFamily: "monospace",
    fontWeight: "700",
    marginBottom: 24,
    textAlign: "center",
  },
  modeRow: {
    flexDirection: "row",
    justifyContent: "center",
    gap: 8,
    marginBottom: 18,
  },
  modeButton: {
    borderWidth: 1,
    borderColor: "#00FF00",
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 10,
  },
  modeButtonActive: {
    backgroundColor: "#00FF00",
  },
  modeText: {
    color: "#F4F4F5",
    fontFamily: "monospace",
    fontSize: 12,
    fontWeight: "700",
  },
  form: {
    gap: 10,
  },
  input: {
    borderWidth: 1,
    borderColor: "#00FF00",
    padding: 12,
    borderRadius: 10,
    color: "#F4F4F5",
    marginBottom: 10,
    fontFamily: "monospace",
  },
  error: {
    color: "#FF0033",
    fontFamily: "monospace",
    marginBottom: 8,
  },
  status: {
    color: "#C0C0C8",
    fontFamily: "monospace",
    marginBottom: 14,
  },
  submit: {
    backgroundColor: "#00FF00",
    padding: 14,
    borderRadius: 12,
    alignItems: "center",
  },
  submitText: {
    color: "#000",
    fontFamily: "monospace",
    fontWeight: "700",
  },
});
