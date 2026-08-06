<<<<<<< HEAD
import React, { useEffect, useState } from 'react';
import {
  ImageBackground,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { useVideoPlayer, VideoView } from 'expo-video';
import type { AccessFormState, AccessMode } from '../services/accessGate';
import { resolveAuthVideoMuted } from '../services/mediaConfig';
import BrandMark from './BrandMark';

const backgroundSource = require('../../assets/background.peakpact.png');
const authVideoSource = process.env.EXPO_PUBLIC_AUTH_GATE_VIDEO_URL ?? null;

type AccessGateProps = {
  mode: AccessMode;
  form: AccessFormState;
  busy: boolean;
  errorMessage: string | null;
  statusMessage: string;
  onModeChange: (mode: AccessMode) => void;
  onFieldChange: (field: keyof AccessFormState, value: string) => void;
  onSubmit: () => void;
};
=======
import React from "react";
import { Image, Pressable, StyleSheet, Text, TextInput, View } from "react-native";
import { type AccessFormState, type AccessMode } from "../services/accessGate";

const accessLogo = require("../../assets/logo.peakpact.png");
>>>>>>> 2f1cd419750ef14ad65a62a00c79510454ca7b37

export default function AccessGate({
  mode,
  form,
  busy,
  errorMessage,
  statusMessage,
  onModeChange,
  onFieldChange,
  onSubmit,
<<<<<<< HEAD
}: AccessGateProps) {
  const [audioUnlocked, setAudioUnlocked] = useState(false);

  const player = useVideoPlayer(authVideoSource, (videoPlayer) => {
    videoPlayer.loop = true;
    videoPlayer.volume = 1;
    videoPlayer.muted = resolveAuthVideoMuted();
    if (!resolveAuthVideoMuted()) {
      videoPlayer.play();
    }
  });

  useEffect(() => {
    if (!authVideoSource || resolveAuthVideoMuted() || !audioUnlocked) {
      return;
    }

    if (player) {
      player.volume = 1;
      player.muted = false;
      player.play();
    }
  }, [audioUnlocked, player]);

  const handleAudioUnlock = () => {
    if (!authVideoSource || resolveAuthVideoMuted()) {
      return;
    }

    setAudioUnlocked(true);
    if (player) {
      player.volume = 1;
      player.muted = false;
      player.play();
    }
  };

  return (
    <ImageBackground source={backgroundSource} resizeMode="cover" style={styles.background}>
      {authVideoSource ? (
        <>
          <VideoView
            style={styles.videoLayer}
            player={player}
            nativeControls={false}
            contentFit="cover"
            playsInline
            surfaceType="textureView"
          />
          {!resolveAuthVideoMuted() && !audioUnlocked ? (
            <Pressable style={styles.audioUnlockOverlay} onPress={handleAudioUnlock}>
              <Text style={styles.audioUnlockText}>TAP TO ENABLE AUDIO</Text>
            </Pressable>
          ) : null}
        </>
      ) : null}
      <SafeAreaView style={styles.safeArea}>
        <KeyboardAvoidingView style={styles.keyboardShell} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
          <View style={styles.backdrop} />
          <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
            <View style={styles.brandRow}>
              <BrandMark accent="#2ef0aa" size={64} showWordmark={false} />
              <View style={styles.brandCopy}>
                <Text style={styles.brandLabel}>PEAKPACT / ELITE ASCENSION</Text>
                <Text style={styles.brandTitle}>STRICT CONTRACT SYSTEM</Text>
                <Text style={styles.brandTagline}>QUANTIFY DISCIPLINE. STACK PROGRESSION. NO SOFT MODE.</Text>
              </View>
            </View>

            <View style={styles.card}>
              <Text style={styles.cardTitle}>ZERO TOLERANCE ENTRY GATE</Text>
              <Text style={styles.cardBody}>
                Built for operators who treat habits like a LitRPG grind: verified contracts, real stakes, and rank that only moves when you earn it.
              </Text>

              <View style={styles.modeRow}>
                <Pressable
                  onPress={() => onModeChange('SIGN_IN')}
                  style={[styles.modeButton, mode === 'SIGN_IN' && styles.modeButtonActive]}
                >
                  <Text style={[styles.modeText, mode === 'SIGN_IN' && styles.modeTextActive]}>SIGN IN</Text>
                </Pressable>
                <Pressable
                  onPress={() => onModeChange('SIGN_UP')}
                  style={[styles.modeButton, mode === 'SIGN_UP' && styles.modeButtonActive]}
                >
                  <Text style={[styles.modeText, mode === 'SIGN_UP' && styles.modeTextActive]}>SIGN UP</Text>
                </Pressable>
              </View>

              {mode === 'SIGN_UP' ? (
                <TextInput
                  value={form.codename}
                  onChangeText={(value) => onFieldChange('codename', value)}
                  placeholder="Operator codename"
                  placeholderTextColor="#5d8977"
                  style={styles.input}
                  autoCapitalize="characters"
                />
              ) : null}

              <TextInput
                value={form.email}
                onChangeText={(value) => onFieldChange('email', value)}
                placeholder="Email authorization"
                placeholderTextColor="#5d8977"
                style={styles.input}
                autoCapitalize="none"
                keyboardType="email-address"
              />

              <TextInput
                value={form.password}
                onChangeText={(value) => onFieldChange('password', value)}
                placeholder="Access phrase"
                placeholderTextColor="#5d8977"
                style={styles.input}
                secureTextEntry
              />

              <Pressable onPress={onSubmit} disabled={busy} style={[styles.submitButton, busy && styles.submitButtonDisabled]}>
                <Text style={styles.submitText}>{busy ? 'PROCESSING...' : mode === 'SIGN_UP' ? 'REGISTER CONTRACT' : 'REQUEST ACCESS'}</Text>
              </Pressable>

              <Text style={styles.statusText}>{statusMessage}</Text>
              {errorMessage ? <Text style={styles.errorText}>{errorMessage}</Text> : null}
              <Text style={styles.footnote}>{authVideoSource ? (resolveAuthVideoMuted() ? 'BACKGROUND LOOP ACTIVE. MUTED VIDEO FEED ENGAGED.' : 'BACKGROUND LOOP ACTIVE. AUDIO-ENABLED VIDEO FEED ENGAGED.') : 'VIDEO GATEWAY IS READY. SET EXPO_PUBLIC_AUTH_GATE_VIDEO_URL TO SWITCH FROM IMAGE TO LOOP.'}</Text>
            </View>
          </ScrollView>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </ImageBackground>
=======
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
      <View style={styles.backgroundGlow} />
      <View style={styles.backgroundGlowSecondary} />
      <View style={styles.card}>
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
>>>>>>> 2f1cd419750ef14ad65a62a00c79510454ca7b37
  );
}

const styles = StyleSheet.create({
<<<<<<< HEAD
  background: {
    flex: 1,
    backgroundColor: '#020706',
  },
  videoLayer: {
    ...StyleSheet.absoluteFillObject,
  },
  audioUnlockOverlay: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'flex-end',
    alignItems: 'center',
    paddingBottom: 20,
    backgroundColor: 'rgba(0, 0, 0, 0.12)',
  },
  audioUnlockText: {
    color: '#f6fff9',
    fontFamily: 'monospace',
    fontSize: 12,
    letterSpacing: 2,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  safeArea: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
  },
  keyboardShell: {
    flex: 1,
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 8, 6, 0.74)',
  },
  content: {
    flexGrow: 1,
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 28,
  },
  brandRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    marginTop: 12,
  },
  brandCopy: {
    flex: 1,
  },
  brandLabel: {
    color: '#2ef0aa',
    fontFamily: 'monospace',
    fontSize: 11,
    letterSpacing: 2,
  },
  brandTitle: {
    color: '#f6fff9',
    fontFamily: 'monospace',
    fontSize: 30,
    fontWeight: '700',
    marginTop: 6,
  },
  brandTagline: {
    color: '#2ef0aa',
    fontFamily: 'monospace',
    fontSize: 12,
    letterSpacing: 3,
    marginTop: 6,
  },
  card: {
    marginTop: 28,
    borderWidth: 1,
    borderColor: 'rgba(46, 240, 170, 0.65)',
    backgroundColor: 'rgba(1, 10, 8, 0.78)',
    padding: 18,
    shadowColor: '#2ef0aa',
    shadowOpacity: 0.28,
    shadowRadius: 18,
    shadowOffset: { width: 0, height: 12 },
  },
  cardTitle: {
    color: '#2ef0aa',
    fontFamily: 'monospace',
    fontSize: 14,
    letterSpacing: 2,
  },
  cardBody: {
    color: '#c8f7e3',
    fontFamily: 'monospace',
    fontSize: 13,
    lineHeight: 20,
    marginTop: 10,
    marginBottom: 18,
  },
  modeRow: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 14,
  },
  modeButton: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#1e6b52',
    paddingVertical: 10,
    alignItems: 'center',
    backgroundColor: 'rgba(3, 16, 12, 0.82)',
  },
  modeButtonActive: {
    backgroundColor: '#2ef0aa',
    borderColor: '#2ef0aa',
  },
  modeText: {
    color: '#2ef0aa',
    fontFamily: 'monospace',
    fontWeight: '700',
    letterSpacing: 1,
  },
  modeTextActive: {
    color: '#03110d',
  },
  input: {
    minHeight: 56,
    borderWidth: 1,
    borderColor: '#1e6b52',
    backgroundColor: 'rgba(0, 0, 0, 0.55)',
    color: '#f6fff9',
    fontFamily: 'monospace',
    paddingHorizontal: 14,
    paddingVertical: 12,
    marginBottom: 10,
  },
  submitButton: {
    backgroundColor: '#2ef0aa',
    paddingVertical: 14,
    alignItems: 'center',
    marginTop: 4,
  },
  submitButtonDisabled: {
    opacity: 0.55,
  },
  submitText: {
    color: '#04100d',
    fontFamily: 'monospace',
    fontWeight: '700',
    letterSpacing: 1.2,
  },
  statusText: {
    color: '#2ef0aa',
    fontFamily: 'monospace',
    fontSize: 12,
    marginTop: 14,
  },
  errorText: {
    color: '#ff5c73',
    fontFamily: 'monospace',
    fontSize: 12,
    marginTop: 8,
  },
  footnote: {
    color: '#7ebda6',
    fontFamily: 'monospace',
    fontSize: 11,
    lineHeight: 17,
    marginTop: 14,
  },
});
=======
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
    shadowOpacity: 0.2,
    shadowRadius: 24,
    shadowOffset: { width: 0, height: 10 },
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
    shadowOpacity: 0.16,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 8 },
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
>>>>>>> 2f1cd419750ef14ad65a62a00c79510454ca7b37
