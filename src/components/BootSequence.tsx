import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Audio, ResizeMode, Video } from 'expo-av';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { getLocalizedText, type SupportedLanguage } from '../services/i18n';
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';

const primaryVideo = require('../../assets/aunch-introAUDIO.MP3.mp4');
const fallbackVideo = require('../../assets/onboarding-loop.mp4.mp4');
const fallbackAudio = require('../../assets/sounds/welcome-elite.wav');

type BootSequenceProps = {
  onComplete: () => void;
  language: SupportedLanguage;
};

export default function BootSequence({ onComplete, language }: BootSequenceProps) {
  const [phase, setPhase] = useState<'intro' | 'lock' | 'launch'>('intro');
  const [useFallbackVideo, setUseFallbackVideo] = useState(false);
  const [canSkip, setCanSkip] = useState(false);
  const videoRef = useRef<Video>(null);
  const soundRef = useRef<Audio.Sound | null>(null);

  const overlayOpacity = useSharedValue(0);
  const textOpacity = useSharedValue(0);
  const textTranslateY = useSharedValue(18);
  const pulseOpacity = useSharedValue(0);

  const videoSource = useMemo(
    () => (useFallbackVideo ? fallbackVideo : primaryVideo),
    [useFallbackVideo],
  );

  useEffect(() => {
    let active = true;

    overlayOpacity.value = withTiming(1, { duration: 700, easing: Easing.out(Easing.cubic) });
    textOpacity.value = withTiming(1, { duration: 680, easing: Easing.out(Easing.cubic) });
    textTranslateY.value = withTiming(0, { duration: 680, easing: Easing.out(Easing.cubic) });

    const startPlayback = async () => {
      try {
        await Audio.setAudioModeAsync({
          allowsRecordingIOS: false,
          staysActiveInBackground: false,
          interruptionModeIOS: 1,
          playsInSilentModeIOS: true,
          shouldDuckAndroid: true,
          interruptionModeAndroid: 1,
          playThroughEarpieceAndroid: false,
        });

        const sound = new Audio.Sound();
        soundRef.current = sound;
        await sound.loadAsync(fallbackAudio, {
          shouldPlay: true,
          isLooping: false,
          volume: 0.72,
          progressUpdateIntervalMillis: 250,
        });
      } catch {
        // Keep flow resilient if audio cannot load on a device/runtime.
      }

      try {
        await videoRef.current?.playAsync();
      } catch {
        if (active) {
          setUseFallbackVideo(true);
        }
      }
    };

    const beginTimer = setTimeout(() => {
      void startPlayback();
    }, 120);

    const skipTimer = setTimeout(() => {
      if (active) {
        setCanSkip(true);
      }
    }, 1200);

    const phaseTwo = setTimeout(() => {
      if (!active) return;
      setPhase('lock');
      textOpacity.value = withTiming(0, { duration: 280, easing: Easing.out(Easing.cubic) }, () => {
        textTranslateY.value = 16;
        textOpacity.value = withTiming(1, { duration: 300, easing: Easing.out(Easing.cubic) });
        textTranslateY.value = withTiming(0, { duration: 300, easing: Easing.out(Easing.cubic) });
      });
      pulseOpacity.value = withTiming(1, { duration: 520, easing: Easing.out(Easing.cubic) });
    }, 3600);

    const phaseThree = setTimeout(() => {
      if (!active) return;
      setPhase('launch');
      textOpacity.value = withTiming(0, { duration: 240, easing: Easing.out(Easing.cubic) }, () => {
        textTranslateY.value = 16;
        textOpacity.value = withTiming(1, { duration: 260, easing: Easing.out(Easing.cubic) });
        textTranslateY.value = withTiming(0, { duration: 260, easing: Easing.out(Easing.cubic) });
      });
    }, 7600);

    const doneTimer = setTimeout(() => {
      if (!active) return;
      overlayOpacity.value = withTiming(0, { duration: 420, easing: Easing.out(Easing.cubic) });
      onComplete();
    }, 10400);

    return () => {
      active = false;
      clearTimeout(beginTimer);
      clearTimeout(skipTimer);
      clearTimeout(phaseTwo);
      clearTimeout(phaseThree);
      clearTimeout(doneTimer);
      void videoRef.current?.stopAsync();
      void videoRef.current?.unloadAsync();
      if (soundRef.current) {
        void soundRef.current.stopAsync();
        void soundRef.current.unloadAsync();
      }
    };
  }, [onComplete, overlayOpacity, textOpacity, textTranslateY, pulseOpacity]);

  const containerStyle = useAnimatedStyle(() => ({
    opacity: overlayOpacity.value,
  }));

  const headlineStyle = useAnimatedStyle(() => ({
    opacity: textOpacity.value,
    transform: [{ translateY: textTranslateY.value }],
  }));

  const pulseStyle = useAnimatedStyle(() => ({
    opacity: pulseOpacity.value,
  }));

  const handleSkip = () => {
    void videoRef.current?.stopAsync();
    if (soundRef.current) {
      void soundRef.current.stopAsync();
    }
    onComplete();
  };

  const phaseText =
    phase === 'intro'
      ? getLocalizedText('welcomeIntro', language)
      : phase === 'lock'
        ? getLocalizedText('welcomeDirective', language)
        : getLocalizedText('welcomeContract', language);

  const phaseSubtext =
    phase === 'intro'
      ? getLocalizedText('introPactBody', language)
      : phase === 'lock'
        ? getLocalizedText('introSystemBody', language)
        : getLocalizedText('onboardingFirstStepLabel', language);

  return (
    <Animated.View style={[styles.container, containerStyle]}>
      <Video
        ref={videoRef}
        source={videoSource}
        style={styles.video}
        resizeMode={ResizeMode.COVER}
        isLooping={false}
        shouldPlay
        isMuted={false}
        useNativeControls={false}
        onError={() => {
          setUseFallbackVideo(true);
        }}
      />

      <View style={styles.scrim} />
      <Animated.View style={[styles.pulseHalo, pulseStyle]} />

      <Animated.View style={[styles.textContainer, headlineStyle]}>
        <Text style={styles.eyebrow}>PEAKPACT</Text>
        <Text style={styles.text}>{phaseText}</Text>
        <Text style={styles.subText}>{phaseSubtext}</Text>
      </Animated.View>

      {canSkip ? (
        <Pressable style={styles.skipButton} onPress={handleSkip}>
          <Text style={styles.skipText}>SKIP INTRO</Text>
        </Pressable>
      ) : null}
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000000',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 24,
  },
  video: {
    ...StyleSheet.absoluteFillObject,
  },
  scrim: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(2, 8, 8, 0.52)',
  },
  pulseHalo: {
    position: 'absolute',
    width: 280,
    height: 280,
    borderRadius: 999,
    backgroundColor: 'rgba(118,255,3,0.16)',
    shadowColor: '#76FF03',
    shadowOpacity: 0.42,
    shadowRadius: 34,
    shadowOffset: { width: 0, height: 6 },
  },
  textContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
    maxWidth: 560,
  },
  eyebrow: {
    color: '#9CE22A',
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 3.6,
    marginBottom: 12,
  },
  text: {
    color: '#F5F5F5',
    fontSize: 33,
    fontWeight: '900',
    letterSpacing: 2.4,
    textAlign: 'center',
    textTransform: 'uppercase',
  },
  subText: {
    color: '#D8DFDA',
    marginTop: 12,
    fontSize: 15,
    lineHeight: 22,
    letterSpacing: 0.9,
    textAlign: 'center',
  },
  skipButton: {
    position: 'absolute',
    bottom: 44,
    paddingVertical: 11,
    paddingHorizontal: 18,
    backgroundColor: 'rgba(8, 8, 8, 0.72)',
    borderRadius: 999,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.16)',
  },
  skipText: {
    color: '#D0D0D0',
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 1.8,
  },
});
