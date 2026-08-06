<<<<<<< HEAD
import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import Svg, { Circle, Defs, LinearGradient, Path, Stop } from 'react-native-svg';

const MATRIX_GREEN = '#00FF00';

type BrandMarkProps = {
  accent?: string;
  size?: number;
  showWordmark?: boolean;
};

export default function BrandMark({ accent = MATRIX_GREEN, size = 56, showWordmark = true }: BrandMarkProps) {
  const gradientId = `peakpact-gradient-${size}`;
  const accentSoft = accent === MATRIX_GREEN ? '#9DFFD2' : accent;

  return (
    <View style={styles.shell}>
      <Svg width={size} height={size} viewBox="0 0 120 120">
        <Defs>
          <LinearGradient id={gradientId} x1="12%" y1="12%" x2="88%" y2="88%">
            <Stop offset="0%" stopColor={accentSoft} />
            <Stop offset="100%" stopColor={accent} />
          </LinearGradient>
        </Defs>
        <Circle cx="60" cy="60" r="50" fill="rgba(0, 0, 0, 0.22)" stroke={accentSoft} strokeWidth="2" />
        <Circle cx="60" cy="60" r="42" fill="none" stroke={`url(#${gradientId})`} strokeWidth="3.2" />
        <Path d="M60 18L82 38L60 56L38 38Z" fill={`url(#${gradientId})`} />
        <Path d="M36 46L60 78L84 46H72L60 60L48 46Z" fill={accentSoft} opacity="0.94" />
        <Path d="M37 86L60 65L83 86" stroke={accent} strokeWidth="4.5" strokeLinecap="round" />
      </Svg>
      {showWordmark ? (
        <View style={styles.wordmark}>
          <Text style={styles.wordmarkTitle}>PEAKPACT</Text>
          <Text style={[styles.wordmarkSubtitle, { color: accentSoft }]}>ZERO TOLERANCE</Text>
        </View>
      ) : null}
=======
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
>>>>>>> 2f1cd419750ef14ad65a62a00c79510454ca7b37
    </View>
  );
}

const styles = StyleSheet.create({
<<<<<<< HEAD
  shell: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    flexShrink: 1,
  },
  wordmark: {
    flexShrink: 1,
  },
  wordmarkTitle: {
    color: '#f5fff8',
    fontFamily: 'monospace',
    fontSize: 16,
    fontWeight: '700',
    letterSpacing: 1.8,
  },
  wordmarkSubtitle: {
    fontFamily: 'monospace',
    fontSize: 10,
    letterSpacing: 2,
    marginTop: 2,
=======
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
>>>>>>> 2f1cd419750ef14ad65a62a00c79510454ca7b37
  },
});
