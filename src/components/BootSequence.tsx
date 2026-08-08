import React, { useEffect, useState } from 'react';
import { StyleSheet, View, Pressable, Text } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  Easing,
  runOnJS,
} from 'react-native-reanimated';
import { SupportedLanguage } from '../services/i18n';

export default function BootSequence({
  onComplete,
  language,
}: {
  onComplete: () => void;
  language: SupportedLanguage;
}) {
  const [phase, setPhase] = useState(0);

  const opacity1 = useSharedValue(0);
  const opacity2 = useSharedValue(0);
  const scale = useSharedValue(0.95);

  useEffect(() => {
    // Sequence timing
    scale.value = withTiming(1, { duration: 1500, easing: Easing.out(Easing.cubic) });
    
    opacity1.value = withTiming(1, { duration: 600 }, () => {
      runOnJS(setPhase)(1);
    });

    const timer1 = setTimeout(() => {
      opacity1.value = withTiming(0, { duration: 400 }, () => {
        opacity2.value = withTiming(1, { duration: 600 }, () => {
          runOnJS(setPhase)(2);
        });
      });
    }, 2500);

    const timer2 = setTimeout(() => {
      opacity2.value = withTiming(0, { duration: 500 }, () => {
        runOnJS(onComplete)();
      });
    }, 5500);

    return () => {
      clearTimeout(timer1);
      clearTimeout(timer2);
    };
  }, [onComplete, opacity1, opacity2, scale]);

  const style1 = useAnimatedStyle(() => ({
    opacity: opacity1.value,
    transform: [{ scale: scale.value }],
  }));

  const style2 = useAnimatedStyle(() => ({
    opacity: opacity2.value,
  }));

  return (
    <View style={styles.container}>
      {phase === 1 && (
        <Animated.View style={[styles.textContainer, style1]}>
          <View style={styles.greenLine} />
          <Text style={styles.text}>WE DO NOT DEFAULT TO COMFORT.</Text>
        </Animated.View>
      )}

      {phase >= 2 && (
        <Animated.View style={[styles.textContainer, style2]}>
          <Text style={styles.greenText}>PROTOCOL LOCKED.</Text>
        </Animated.View>
      )}

      <Pressable style={styles.skipButton} onPress={onComplete}>
        <Text style={styles.skipText}>SKIP SEQUENCE</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#080808',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 24,
  },
  textContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  greenLine: {
    width: 120,
    height: 3,
    backgroundColor: '#76FF03',
    marginBottom: 24,
    shadowColor: '#76FF03',
    shadowOpacity: 0.8,
    shadowRadius: 10,
  },
  text: {
    color: '#F5F5F5',
    fontSize: 20,
    fontWeight: '800',
    letterSpacing: 2,
    textAlign: 'center',
  },
  greenText: {
    color: '#76FF03',
    fontSize: 28,
    fontWeight: '900',
    letterSpacing: 3,
    textAlign: 'center',
    textShadowColor: '#76FF03',
    textShadowRadius: 15,
  },
  skipButton: {
    position: 'absolute',
    bottom: 50,
    paddingVertical: 10,
    paddingHorizontal: 20,
    backgroundColor: '#111111',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
  },
  skipText: {
    color: '#A0A0A0',
    fontSize: 11,
    fontWeight: '600',
    letterSpacing: 1.5,
  },
});
