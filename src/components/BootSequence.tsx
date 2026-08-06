<<<<<<< HEAD
/**
 * BootSequence — 7-second cinematic intro played once on first launch.
 *
 * Phase 1  (0.0 – 1.5s): Void. At 1.0s a CRT static tear slashes the screen.
 * Phase 2  (1.5 – 3.5s): Pact ring reveals from centre. Sub-bass thud hits.
 *                         Typewriter caption: "THE LEDGER IS OPEN."
 * Phase 3  (3.5 – 5.5s): Ring flares out. Terminal code scrolls behind it.
 *                         Caption swaps: "PROVE YOUR WORTH."
 * Phase 4  (5.5 – 7.0s): Code and caption fade. Ring settles. Fade-to-black.
 */

import React, { useEffect, useRef, useState } from 'react';
import { Animated, Dimensions, Platform, StyleSheet, Text, View } from 'react-native';
import PactRing from './PactRing';
import { playBootCrack, playBootThud } from '../services/soundEngine';

const { width: SW, height: SH } = Dimensions.get('window');
const PEAK_CRIMSON = '#FF2A2A';
const BONE_WHITE = '#F4F4F5';

const TERMINAL_LINES = [
  '> SYS_INIT: PROTOCOL_7.3.1',
  '> AUTH_MATRIX: LOADING............',
  '> CONTRACT_ENGINE: ONLINE',
  '> LEDGER_NODE: CONNECTED',
  '> OPERATOR_ID: GENERATING',
  '> PACT_RING: CALIBRATING..........',
  '> SEVERANCE_PROTOCOL: ARMED',
  '> OVERSEER_LINK: ACTIVE',
  '> SQUAD_NET: SCANNING..........',
  '> TIMELINE_SYNC: OK',
  '> UPLINK_ESTABLISHED',
  '> CRIMSON_LEDGER: BOOT_OK',
  '> AWAITING_OPERATOR...........',
];

// ── CRT static tear ────────────────────────────────────────────────────────

function StaticTear() {
  const [segs, setSegs] = useState<{ w: number; c: string }[]>([]);

  useEffect(() => {
    const update = () => {
      const next: { w: number; c: string }[] = [];
      let rem = SW + 20;
      while (rem > 0) {
        const w = 2 + Math.random() * 14;
        const r = Math.random();
        const c =
          r < 0.40 ? BONE_WHITE :
          r < 0.60 ? '#DDDDDD' :
          r < 0.76 ? PEAK_CRIMSON :
          r < 0.88 ? '#00FF00' : '#000000';
        next.push({ w: Math.min(w, rem), c });
        rem -= w;
      }
      setSegs(next);
    };
    update();
    const id = setInterval(update, 30);
    return () => clearInterval(id);
  }, []);

  // Multiple rows with varying opacity to simulate a wide tear band
  const rows = [
    { yOff: -20, h: 3, op: 0.45 },
    { yOff: -10, h: 4, op: 0.65 },
    { yOff:   0, h: 7, op: 1.00 },  // primary tear
    { yOff:  10, h: 4, op: 0.65 },
    { yOff:  20, h: 3, op: 0.45 },
    { yOff:  -5, h: 2, op: 0.30 },
    { yOff:   5, h: 2, op: 0.30 },
  ];

  return (
    <View style={StyleSheet.absoluteFill} pointerEvents="none">
      {rows.map(({ yOff, h, op }, ri) => (
        <View
          key={ri}
          style={{ position: 'absolute', top: SH * 0.5 + yOff, left: -10, right: 0, height: h, flexDirection: 'row', overflow: 'hidden', opacity: op }}
        >
          {segs.map((seg, si) => (
            <View key={si} style={{ width: seg.w, height: h, backgroundColor: seg.c }} />
          ))}
        </View>
      ))}
=======
import React, { useEffect } from "react";
import { Image, Pressable, StyleSheet, Text, View } from "react-native";
import { ResizeMode, Video } from "expo-av";

const welcomeVideo = require("../../assets/9e977029180a9977b941d4d9561753b0.mp4");
const logo = require("../../assets/logo.peakpact.png");
const backdrop = require("../../assets/elite-backdrop.jpeg");

export default function BootSequence({
  onComplete,
}: {
  onComplete: () => void;
}) {
  useEffect(() => {
    const timer = setTimeout(onComplete, 6500);
    return () => clearTimeout(timer);
  }, [onComplete]);

  return (
    <View style={styles.container}>
      <Image source={backdrop} style={styles.backdrop} resizeMode="cover" />
      <View style={styles.backdropOverlay} />
      <View style={styles.content}>
        <Image source={logo} style={styles.logo} resizeMode="contain" />
        <Text style={styles.eyebrow}>WELCOME TRANSMISSION</Text>
        <Text style={styles.title}>PEAKPACT</Text>
        <Text style={styles.subtitle}>
          System synchronized. Your daily command center is online.
        </Text>

        <View style={styles.videoShell}>
          <Video
            source={welcomeVideo}
            style={styles.video}
            shouldPlay
            isLooping={false}
            resizeMode={ResizeMode.COVER}
            useNativeControls={false}
            isMuted={false}
          />
          <View style={styles.videoGlow} />
        </View>

        <View style={styles.copyPanel}>
          <Text style={styles.copyText}>
            Pick your target, seal your pact, and turn today's grind into real progress.
          </Text>
        </View>

        <Pressable style={styles.button} onPress={onComplete}>
          <Text style={styles.buttonText}>ENTER THE PACT</Text>
        </Pressable>
      </View>
>>>>>>> 2f1cd419750ef14ad65a62a00c79510454ca7b37
    </View>
  );
}

<<<<<<< HEAD
// ── Terminal code background ───────────────────────────────────────────────

const LINE_H = 17;

function TerminalCodeScroll({ opacity }: { opacity: Animated.Value }) {
  const scrollAnim = useRef(new Animated.Value(0)).current;
  const totalH = TERMINAL_LINES.length * LINE_H;

  useEffect(() => {
    Animated.loop(
      Animated.timing(scrollAnim, { toValue: -totalH, duration: 2000, useNativeDriver: true }),
    ).start();
  }, [scrollAnim, totalH]);

  const tripled = [...TERMINAL_LINES, ...TERMINAL_LINES, ...TERMINAL_LINES];

  return (
    <Animated.View style={[StyleSheet.absoluteFill, { opacity }]} pointerEvents="none">
      <Animated.View style={{ transform: [{ translateY: scrollAnim }] }}>
        {tripled.map((line, i) => (
          <Text key={i} style={styles.codeLine}>{line}</Text>
        ))}
      </Animated.View>
    </Animated.View>
  );
}

// ── Typewriter caption ─────────────────────────────────────────────────────

function TypewriterCaption({ text }: { text: string }) {
  const [shown, setShown] = useState('');
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    setShown('');
    let i = 0;
    timerRef.current = setInterval(() => {
      if (i < text.length) {
        setShown(text.slice(0, ++i));
      } else {
        if (timerRef.current) clearInterval(timerRef.current);
      }
    }, 50);
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, [text]);

  return (
    <Text style={styles.caption}>
      {shown}
      {shown.length < text.length && <Text style={styles.cursor}>_</Text>}
    </Text>
  );
}

// ── Main component ─────────────────────────────────────────────────────────

type Props = { onComplete: () => void };

export default function BootSequence({ onComplete }: Props) {
  const [showStatic, setShowStatic] = useState(false);
  const [showRing,   setShowRing]   = useState(false);
  const [showCode,   setShowCode]   = useState(false);
  const [caption,    setCaption]    = useState('');

  const ringOpacity     = useRef(new Animated.Value(0)).current;
  const ringReveal      = useRef(new Animated.Value(0.45)).current;
  const flare           = useRef(new Animated.Value(1)).current;
  const captionOpacity  = useRef(new Animated.Value(0)).current;
  const codeOpacity     = useRef(new Animated.Value(0)).current;
  const exitOpacity     = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    const delay = (ms: number) => new Promise<void>((r) => setTimeout(r, ms));

    const run = async () => {
      // ── Phase 1: The Void ───────────────────────────────────────────────
      await delay(1000);
      setShowStatic(true);
      playBootCrack();
      await delay(500);
      setShowStatic(false);

      // ── Phase 2: The Uplink ─────────────────────────────────────────────
      setShowRing(true);
      playBootThud();
      Animated.parallel([
        Animated.timing(ringOpacity, { toValue: 1, duration: 420, useNativeDriver: true }),
        Animated.timing(ringReveal,  { toValue: 1, duration: 600, useNativeDriver: true }),
      ]).start();
      await delay(480);
      setCaption('THE LEDGER IS OPEN.');
      Animated.timing(captionOpacity, { toValue: 1, duration: 300, useNativeDriver: true }).start();

      // ── Phase 3: The Challenge ──────────────────────────────────────────
      await delay(1850);
      setShowCode(true);
      Animated.timing(codeOpacity, { toValue: 0.28, duration: 360, useNativeDriver: true }).start();
      // Ring flares out then springs back
      Animated.sequence([
        Animated.timing(flare, { toValue: 1.44, duration: 260, useNativeDriver: true }),
        Animated.spring(flare,  { toValue: 1.00, friction: 4, tension: 36, useNativeDriver: true }),
      ]).start();
      // Cross-fade captions
      await delay(260);
      Animated.timing(captionOpacity, { toValue: 0, duration: 180, useNativeDriver: true }).start(() => {
        setCaption('PROVE YOUR WORTH.');
        Animated.timing(captionOpacity, { toValue: 1, duration: 260, useNativeDriver: true }).start();
      });

      // ── Phase 4: The Drop ───────────────────────────────────────────────
      await delay(2050);
      Animated.parallel([
        Animated.timing(codeOpacity,    { toValue: 0, duration: 700, useNativeDriver: true }),
        Animated.timing(captionOpacity, { toValue: 0, duration: 700, useNativeDriver: true }),
      ]).start();

      await delay(1100);
      // Metallic fade-to-black — reverb tail bleeds into live app
      Animated.timing(exitOpacity, { toValue: 0, duration: 600, useNativeDriver: true }).start(() => {
        onComplete();
      });
    };

    void run();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <Animated.View style={[styles.container, { opacity: exitOpacity }]}>
      {showCode && <TerminalCodeScroll opacity={codeOpacity} />}
      {showStatic && <StaticTear />}

      {showRing && (
        // outer: flare scale — inner: reveal opacity + scale
        <Animated.View style={{ transform: [{ scale: flare }] }}>
          <Animated.View style={{ opacity: ringOpacity, transform: [{ scale: ringReveal }] }}>
            <PactRing accent={PEAK_CRIMSON} pactComplete={false} redActive={false} size={220} />
          </Animated.View>
        </Animated.View>
      )}

      {caption ? (
        <Animated.View style={[styles.captionContainer, { opacity: captionOpacity }]}>
          <TypewriterCaption text={caption} />
        </Animated.View>
      ) : null}

      {/* Subtle scanline overlay for CRT texture on web */}
      {Platform.OS === 'web' && (
        <View
          pointerEvents="none"
          style={[
            StyleSheet.absoluteFill,
            {
              backgroundImage: 'repeating-linear-gradient(0deg, transparent, transparent 3px, rgba(0,0,0,0.07) 3px, rgba(0,0,0,0.07) 4px)',
            } as object,
          ]}
        />
      )}
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: '#000000',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 99999,
  },
  codeLine: {
    color: BONE_WHITE,
    fontFamily: 'monospace',
    fontSize: 11,
    lineHeight: LINE_H,
    letterSpacing: 0.4,
  },
  caption: {
    color: PEAK_CRIMSON,
    fontFamily: 'monospace',
    fontSize: Platform.OS === 'web' ? 26 : 20,
    fontWeight: '700',
    letterSpacing: 3.5,
    textAlign: 'center',
    textShadowColor: PEAK_CRIMSON,
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 14,
  },
  cursor: {
    opacity: 0.75,
  },
  captionContainer: {
    position: 'absolute',
    bottom: '26%',
    left: 28,
    right: 28,
    alignItems: 'center',
=======
const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#02060c",
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    opacity: 0.88,
  },
  backdropOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(2, 6, 14, 0.76)",
  },
  content: {
    width: "100%",
    maxWidth: 560,
    paddingHorizontal: 24,
    paddingVertical: 24,
    alignItems: "center",
    zIndex: 1,
  },
  logo: {
    width: 108,
    height: 108,
    marginBottom: 14,
  },
  eyebrow: {
    color: "#25F9D5",
    fontFamily: "monospace",
    fontSize: 11,
    letterSpacing: 2.4,
    marginBottom: 6,
    textTransform: "uppercase",
  },
  title: {
    color: "#F7FCFF",
    fontFamily: "monospace",
    fontSize: 30,
    fontWeight: "700",
    marginBottom: 8,
    letterSpacing: 1.6,
  },
  subtitle: {
    color: "#C2D5E3",
    fontFamily: "monospace",
    fontSize: 13,
    marginBottom: 18,
    textAlign: "center",
    lineHeight: 20,
  },
  videoShell: {
    width: "100%",
    aspectRatio: 16 / 9,
    borderRadius: 24,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: "rgba(37, 249, 213, 0.42)",
    backgroundColor: "rgba(3, 8, 18, 0.88)",
    marginBottom: 14,
    shadowColor: "#25F9D5",
    shadowOpacity: 0.24,
    shadowRadius: 20,
    shadowOffset: { width: 0, height: 8 },
  },
  video: {
    flex: 1,
    backgroundColor: "#000",
  },
  videoGlow: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(37, 249, 213, 0.09)",
    pointerEvents: "none",
  },
  copyPanel: {
    width: "100%",
    borderWidth: 1,
    borderColor: "rgba(79, 163, 255, 0.28)",
    backgroundColor: "rgba(4, 10, 20, 0.78)",
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderRadius: 16,
    marginBottom: 16,
  },
  copyText: {
    color: "#F7FCFF",
    fontFamily: "monospace",
    fontSize: 12,
    lineHeight: 18,
    textAlign: "center",
  },
  button: {
    borderWidth: 1,
    borderColor: "rgba(37, 249, 213, 0.54)",
    backgroundColor: "rgba(37, 249, 213, 0.16)",
    paddingHorizontal: 18,
    paddingVertical: 12,
    borderRadius: 999,
    shadowColor: "#4FA3FF",
    shadowOpacity: 0.22,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 8 },
  },
  buttonText: {
    color: "#F7FCFF",
    fontFamily: "monospace",
    fontWeight: "700",
    letterSpacing: 1.2,
>>>>>>> 2f1cd419750ef14ad65a62a00c79510454ca7b37
  },
});
