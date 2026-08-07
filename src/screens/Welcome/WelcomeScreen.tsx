import React, { useEffect, useRef, useState } from 'react';
import {
  Image,
  Pressable,
  SafeAreaView,
  StatusBar,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { ResizeMode, Video } from 'expo-av';
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';
import { useNavigation, type NavigationProp } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';

const welcomeVideo = require('../../../assets/9e977029180a9977b941d4d9561753b0.mp4');
const logo = require('../../../assets/logo.peakpact.png');

type RootStackParamList = {
  Welcome: undefined;
  Home: undefined;
  Habits: undefined;
  Audio: undefined;
  Profile: undefined;
};

type WelcomeScreenProps = {
  onInitializeProtocol?: () => void;
  onLogin?: () => void;
};

type SequencePhase = 'intro' | 'directive' | 'contract' | 'outro';

const messages: Record<Exclude<SequencePhase, 'outro'>, string> = {
  intro: 'Comfort is a liability.',
  directive: 'You are here because the old way failed. This system does not care about your motivation.',
  contract: 'This is a binding contract. You lock the terminal. You execute. Or the system takes its cut.',
};

export default function WelcomeScreen({
  onInitializeProtocol,
  onLogin,
}: WelcomeScreenProps) {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const [phase, setPhase] = useState<SequencePhase>('intro');
  const [videoReady, setVideoReady] = useState(false);
  const [videoError, setVideoError] = useState(false);
  const videoRef = useRef<Video>(null);

  const textOpacity = useSharedValue(0);
  const textTranslateY = useSharedValue(24);
  const logoOpacity = useSharedValue(0);
  const logoTranslateY = useSharedValue(18);
  const buttonsOpacity = useSharedValue(0);
  const buttonsTranslateY = useSharedValue(24);

  const textAnimatedStyle = useAnimatedStyle(() => ({
    opacity: textOpacity.value,
    transform: [{ translateY: textTranslateY.value }],
  }));

  const logoAnimatedStyle = useAnimatedStyle(() => ({
    opacity: logoOpacity.value,
    transform: [{ translateY: logoTranslateY.value }],
  }));

  const buttonsAnimatedStyle = useAnimatedStyle(() => ({
    opacity: buttonsOpacity.value,
    transform: [{ translateY: buttonsTranslateY.value }],
  }));

  useEffect(() => {
    const timers = [
      setTimeout(() => setPhase('directive'), 3000),
      setTimeout(() => setPhase('contract'), 8000),
      setTimeout(() => setPhase('outro'), 12000),
    ];

    return () => {
      timers.forEach((timer) => clearTimeout(timer));
    };
  }, []);

  useEffect(() => {
    const isVisibleText = phase !== 'outro';

    textOpacity.value = withTiming(isVisibleText ? 1 : 0, {
      duration: 240,
      easing: Easing.out(Easing.cubic),
    });
    textTranslateY.value = withTiming(isVisibleText ? 0 : 24, {
      duration: 240,
      easing: Easing.out(Easing.cubic),
    });

    logoOpacity.value = withTiming(phase === 'outro' ? 1 : 0, {
      duration: 320,
      easing: Easing.out(Easing.cubic),
    });
    logoTranslateY.value = withTiming(phase === 'outro' ? 0 : 18, {
      duration: 320,
      easing: Easing.out(Easing.cubic),
    });

    buttonsOpacity.value = withTiming(phase === 'outro' ? 1 : 0, {
      duration: 320,
      easing: Easing.out(Easing.cubic),
    });
    buttonsTranslateY.value = withTiming(phase === 'outro' ? 0 : 24, {
      duration: 320,
      easing: Easing.out(Easing.cubic),
    });
  }, [phase, buttonsOpacity, buttonsTranslateY, logoOpacity, logoTranslateY, textOpacity, textTranslateY]);

  useEffect(() => {
    let mounted = true;

    const startPlayback = async () => {
      try {
        if (!videoRef.current) {
          return;
        }

        await videoRef.current.playAsync();
        if (mounted) {
          setVideoReady(true);
        }
      } catch {
        if (mounted) {
          setVideoError(true);
          setVideoReady(false);
        }
      }
    };

    const delayedStart = setTimeout(() => {
      void startPlayback();
    }, 120);

    return () => {
      mounted = false;
      clearTimeout(delayedStart);
      void videoRef.current?.stopAsync();
      void videoRef.current?.unloadAsync();
    };
  }, []);

  const currentMessage = phase !== 'outro' ? messages[phase] : null;

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar translucent backgroundColor="transparent" barStyle="light-content" />
      <View style={styles.container}>
        <View style={styles.backgroundLayer}>
          <Video
            ref={videoRef}
            source={welcomeVideo}
            style={styles.video}
            resizeMode={ResizeMode.COVER}
            shouldPlay={false}
            isLooping={false}
            useNativeControls={false}
            isMuted={false}
            onError={() => setVideoError(true)}
            onReadyForDisplay={() => {
              setVideoReady(true);
              setVideoError(false);
            }}
            onPlaybackStatusUpdate={(status) => {
              if (status.isLoaded && !status.isBuffering && status.positionMillis > 0) {
                setVideoReady(true);
              }
            }}
          />
          <View style={styles.videoOverlay} />
          {!videoReady && !videoError ? <View style={styles.posterLayer} /> : null}
          {!videoError ? null : <View style={styles.blackoutLayer} />}
        </View>

        <View style={styles.content} pointerEvents="box-none">
          <Animated.View style={[styles.logoShell, logoAnimatedStyle]}>
            <Image source={logo} style={styles.logo} resizeMode="contain" />
          </Animated.View>

          <Animated.View style={[styles.textContainer, textAnimatedStyle]}>
            <Text style={styles.titleText}>PEAKPACT</Text>
            {currentMessage ? <Text style={styles.messageText}>{currentMessage}</Text> : null}
          </Animated.View>

          <Animated.View style={[styles.buttonRow, buttonsAnimatedStyle]}>
            <Pressable
              accessibilityRole="button"
              onPress={onInitializeProtocol ?? (() => navigation.navigate('Home'))}
              style={({ pressed }) => [
                styles.primaryButton,
                pressed && styles.primaryButtonPressed,
              ]}
            >
              <Text style={styles.primaryButtonText}>INITIALIZE PROTOCOL</Text>
            </Pressable>
            <Pressable
              accessibilityRole="button"
              onPress={onLogin ?? (() => navigation.navigate('Home'))}
              style={({ pressed }) => [
                styles.secondaryButton,
                pressed && styles.secondaryButtonPressed,
              ]}
            >
              <Text style={styles.secondaryButtonText}>LOGIN</Text>
            </Pressable>
          </Animated.View>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#000000',
  },
  container: {
    flex: 1,
    backgroundColor: '#000000',
  },
  backgroundLayer: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: '#000000',
  },
  video: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: '#000000',
  },
  videoOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.46)',
  },
  blackoutLayer: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: '#000000',
  },
  posterLayer: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: '#000000',
  },
  content: {
    flex: 1,
    paddingHorizontal: 24,
    paddingTop: 28,
    paddingBottom: 36,
    justifyContent: 'space-between',
  },
  logoShell: {
    alignSelf: 'center',
    marginTop: 8,
  },
  logo: {
    width: 104,
    height: 104,
  },
  textContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 12,
  },
  titleText: {
    color: '#9eff9e',
    fontSize: 18,
    fontWeight: '700',
    letterSpacing: 2.6,
    textTransform: 'uppercase',
    marginBottom: 12,
    textShadowColor: 'rgba(158, 255, 158, 0.75)',
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 16,
  },
  messageText: {
    color: '#f3fff1',
    fontSize: 26,
    fontWeight: '700',
    lineHeight: 34,
    textAlign: 'center',
    textShadowColor: 'rgba(158, 255, 158, 0.42)',
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 18,
  },
  buttonRow: {
    alignItems: 'center',
    gap: 12,
    marginBottom: 12,
  },
  primaryButton: {
    width: '100%',
    maxWidth: 360,
    borderRadius: 999,
    paddingVertical: 15,
    paddingHorizontal: 24,
    backgroundColor: 'rgba(0, 255, 102, 0.16)',
    borderWidth: 1.2,
    borderColor: '#6fff8a',
    shadowColor: '#6fff8a',
    shadowOpacity: 0.55,
    shadowRadius: 20,
    shadowOffset: { width: 0, height: 0 },
    alignItems: 'center',
  },
  primaryButtonPressed: {
    transform: [{ scale: 0.98 }],
  },
  primaryButtonText: {
    color: '#f3fff1',
    fontSize: 14,
    fontWeight: '800',
    letterSpacing: 1.8,
    textTransform: 'uppercase',
  },
  secondaryButton: {
    width: '100%',
    maxWidth: 220,
    borderRadius: 999,
    paddingVertical: 12,
    paddingHorizontal: 22,
    backgroundColor: 'rgba(0, 0, 0, 0.44)',
    borderWidth: 1,
    borderColor: '#6fff8a',
    shadowColor: '#6fff8a',
    shadowOpacity: 0.3,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 0 },
    alignItems: 'center',
  },
  secondaryButtonPressed: {
    transform: [{ scale: 0.97 }],
  },
  secondaryButtonText: {
    color: '#6fff8a',
    fontSize: 13,
    fontWeight: '700',
    letterSpacing: 1.6,
    textTransform: 'uppercase',
  },
});
