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
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { getLocalizedText } from '../../i18n';
import { getWelcomePromptHighlights } from '../../services/welcomePrompt';

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
  intro: 'welcomeIntro',
  directive: 'welcomeDirective',
  contract: 'welcomeContract',
};

export default function WelcomeScreen({
  onInitializeProtocol,
  onLogin,
}: WelcomeScreenProps) {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const [phase, setPhase] = useState<SequencePhase>('intro');
  const [videoReady, setVideoReady] = useState(false);
  const [videoError, setVideoError] = useState(false);
  const [videoMuted, setVideoMuted] = useState(true);
  const videoRef = useRef<Video>(null);
  const highlights = getWelcomePromptHighlights();

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

        await videoRef.current.setIsMutedAsync(true);
        await videoRef.current.playAsync();
        if (mounted) {
          setVideoReady(true);
          setVideoMuted(true);
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

  const currentMessage = phase !== 'outro' ? getLocalizedText(messages[phase]) : null;

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
            shouldPlay
            isLooping={false}
            useNativeControls={false}
            isMuted={videoMuted}
            onError={() => setVideoError(true)}
            onReadyForDisplay={() => {
              setVideoReady(true);
              setVideoError(false);
              setVideoMuted(true);
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
            <Text style={styles.titleText}>{getLocalizedText('appTitle')}</Text>
            {currentMessage ? <Text style={styles.messageText}>{currentMessage}</Text> : null}
            {phase !== 'outro' ? (
              <View style={styles.highlightsShell}>
                {highlights.map((highlight) => (
                  <View key={highlight.title} style={styles.highlightCard}>
                    <Text style={styles.highlightTitle}>{highlight.title}</Text>
                    <Text style={styles.highlightBody}>{highlight.body}</Text>
                  </View>
                ))}
              </View>
            ) : null}
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
              <Text style={styles.primaryButtonText}>{getLocalizedText('welcomeInitializeProtocol')}</Text>
            </Pressable>
            <Pressable
              accessibilityRole="button"
              onPress={onLogin ?? (() => navigation.navigate('Home'))}
              style={({ pressed }) => [
                styles.secondaryButton,
                pressed && styles.secondaryButtonPressed,
              ]}
            >
              <Text style={styles.secondaryButtonText}>{getLocalizedText('welcomeLogin')}</Text>
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
    width: 90,
    height: 90,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#111111',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
  },
  logo: {
    width: 48,
    height: 48,
  },
  textContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 12,
    width: '100%',
  },
  titleText: {
    color: '#F5F5F5',
    fontSize: 34,
    fontWeight: '800',
    letterSpacing: 1.8,
    marginBottom: 14,
  },
  messageText: {
    color: '#A0A0A0',
    fontSize: 16,
    fontWeight: '600',
    lineHeight: 26,
    textAlign: 'center',
    marginBottom: 16,
  },
  highlightsShell: {
    width: '100%',
    maxWidth: 560,
    gap: 10,
  },
  highlightCard: {
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
    backgroundColor: 'rgba(8, 8, 8, 0.82)',
    borderRadius: 16,
    paddingHorizontal: 14,
    paddingVertical: 12,
  },
  highlightTitle: {
    color: '#76FF03',
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 1.4,
    marginBottom: 4,
    textTransform: 'uppercase',
  },
  highlightBody: {
    color: '#F5F5F5',
    fontSize: 13,
    lineHeight: 19,
    opacity: 0.9,
  },
  buttonRow: {
    alignItems: 'center',
    gap: 14,
    marginBottom: 12,
  },
  primaryButton: {
    width: '100%',
    maxWidth: 360,
    borderRadius: 18,
    paddingVertical: 16,
    paddingHorizontal: 24,
    backgroundColor: '#76FF03',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#76FF03',
    shadowOpacity: 0.22,
    shadowRadius: 18,
    shadowOffset: { width: 0, height: 10 },
  },
  primaryButtonPressed: {
    opacity: 0.92,
  },
  primaryButtonText: {
    color: '#080808',
    fontSize: 14,
    fontWeight: '800',
    letterSpacing: 1.4,
    textTransform: 'uppercase',
  },
  secondaryButton: {
    width: '100%',
    maxWidth: 220,
    borderRadius: 18,
    paddingVertical: 16,
    paddingHorizontal: 22,
    backgroundColor: '#111111',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  secondaryButtonPressed: {
    opacity: 0.92,
  },
  secondaryButtonText: {
    color: '#F5F5F5',
    fontSize: 14,
    fontWeight: '700',
    letterSpacing: 1.4,
    textTransform: 'uppercase',
  },
});
