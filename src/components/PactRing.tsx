<<<<<<< HEAD
import React, { useEffect, useRef } from 'react';
import { Animated } from 'react-native';
import Svg, { Circle, Path } from 'react-native-svg';

// Deterministic waveform amplitude multipliers — 48 points around the ring
const SPIKE_DATA = [
  1.0, 1.3, 0.8, 1.5, 1.1, 0.7, 1.4, 1.2,
  1.6, 0.9, 1.3, 0.8, 1.7, 1.1, 0.7, 1.4,
  1.2, 1.5, 0.9, 1.3, 1.1, 1.6, 0.8, 1.4,
  1.0, 1.2, 1.5, 0.9, 1.3, 1.1, 1.7, 0.8,
  1.4, 1.2, 1.6, 0.9, 1.3, 1.1, 0.8, 1.5,
  1.2, 1.4, 0.9, 1.6, 1.1, 0.8, 1.3, 0.95,
];

function generateWaveformRing(cx: number, cy: number, baseR: number, amplitude: number): string {
  const count = SPIKE_DATA.length;
  let d = '';
  for (let i = 0; i <= count; i++) {
    const idx = i % count;
    const angle = (idx / count) * 2 * Math.PI - Math.PI / 2;
    const r = baseR + SPIKE_DATA[idx] * amplitude;
    const x = (cx + r * Math.cos(angle)).toFixed(2);
    const y = (cy + r * Math.sin(angle)).toFixed(2);
    d += (i === 0 ? 'M' : 'L') + `${x},${y}`;
  }
  return d + 'Z';
}

type PactRingProps = {
  accent: string;
  pactComplete: boolean;
  redActive: boolean;
  size?: number;
};

export default function PactRing({ accent, pactComplete, redActive, size = 200 }: PactRingProps) {
  const rotateAnim = useRef(new Animated.Value(0)).current;
  const pulseAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (pactComplete) {
      rotateAnim.stopAnimation();
      pulseAnim.stopAnimation();
      return;
    }

    const rotation = Animated.loop(
      Animated.timing(rotateAnim, { toValue: 1, duration: 12000, useNativeDriver: true }),
    );
    const pulse = Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, { toValue: 1, duration: 1400, useNativeDriver: true }),
        Animated.timing(pulseAnim, { toValue: 0, duration: 1400, useNativeDriver: true }),
      ]),
    );

    rotation.start();
    pulse.start();

    return () => {
      rotation.stop();
      pulse.stop();
    };
  }, [pactComplete, rotateAnim, pulseAnim]);

  const cx = 100;
  const cy = 100;
  const ringColor = redActive ? '#FF0033' : accent;
  const outerRingPath = generateWaveformRing(cx, cy, 60, 22);
  const innerRingPath = generateWaveformRing(cx, cy, 50, 11);

  if (pactComplete) {
    return (
      <Svg width={size} height={size} viewBox="0 0 200 200">
        <Circle cx={cx} cy={cy} r={70} fill="none" stroke="#F4F4F5" strokeWidth="3.5" />
        <Circle cx={cx} cy={cy} r={60} fill="none" stroke="#F4F4F5" strokeWidth="1" opacity="0.3" />
        <Circle cx={cx} cy={cy} r={14} fill="none" stroke="#F4F4F5" strokeWidth="1.5" opacity="0.5" />
      </Svg>
    );
  }

  return (
    <Animated.View style={{
      transform: [{ rotate: rotateAnim.interpolate({ inputRange: [0, 1], outputRange: ['0deg', '360deg'] }) }],
      opacity: pulseAnim.interpolate({ inputRange: [0, 1], outputRange: [0.8, 1] }),
    }}>
      <Svg width={size} height={size} viewBox="0 0 200 200">
        {/* Diffuse outer glow rings */}
        <Circle cx={cx} cy={cy} r={86} fill="none" stroke={ringColor} strokeWidth="1" opacity="0.12" />
        <Circle cx={cx} cy={cy} r={78} fill="none" stroke={ringColor} strokeWidth="1.5" opacity="0.22" />
        {/* Outer waveform corona */}
        <Path d={outerRingPath} fill="none" stroke={ringColor} strokeWidth="2" opacity="0.52" strokeLinejoin="round" />
        {/* Inner waveform fill */}
        <Path d={innerRingPath} fill={`${ringColor}1A`} stroke={ringColor} strokeWidth="1.5" opacity="0.85" strokeLinejoin="round" />
        {/* Solid core ring */}
        <Circle cx={cx} cy={cy} r={38} fill="none" stroke={ringColor} strokeWidth="4.5" />
        {/* Core fill */}
        <Circle cx={cx} cy={cy} r={34} fill={`${ringColor}12`} />
        {/* Center dot */}
        <Circle cx={cx} cy={cy} r={7} fill={ringColor} opacity="0.88" />
      </Svg>
    </Animated.View>
  );
}
=======
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
>>>>>>> 2f1cd419750ef14ad65a62a00c79510454ca7b37
