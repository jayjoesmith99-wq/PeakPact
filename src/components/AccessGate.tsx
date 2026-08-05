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

export default function AccessGate({
  mode,
  form,
  busy,
  errorMessage,
  statusMessage,
  onModeChange,
  onFieldChange,
  onSubmit,
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
  );
}

const styles = StyleSheet.create({
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