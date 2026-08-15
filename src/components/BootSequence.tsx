import React, { useEffect, useRef, useState } from 'react';
import { Image, Platform, Pressable, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { VideoView, useVideoPlayer } from 'expo-video';
import { getLocalizedText, type SupportedLanguage } from '../services/i18n';

const primaryVideo = require('../../assets/A_hyper_realistic_cinematic_.mp4');
const peakPactLogo = require('../../assets/logo.peakpact.png');
const SKIP_DELAY_MS = 1_200;

type BootSequenceProps = {
  onComplete: () => void;
  language: SupportedLanguage;
};

export default function BootSequence({ onComplete, language }: BootSequenceProps) {
  const insets = useSafeAreaInsets();
  const [canSkip, setCanSkip] = useState(false);
  const [videoFailed, setVideoFailed] = useState(false);
  const [isMuted, setIsMuted] = useState(Platform.OS === 'web');
  const hasCompletedRef = useRef(false);
  const retryCountRef = useRef(0);

  const completeSequence = () => {
    if (hasCompletedRef.current) {
      return;
    }

    hasCompletedRef.current = true;
    onComplete();
  };

  const player = useVideoPlayer(primaryVideo, (videoPlayer) => {
    videoPlayer.loop = false;
    videoPlayer.muted = Platform.OS === 'web';
  });

  useEffect(() => {
    const skipTimer = setTimeout(() => {
      setCanSkip(true);
    }, SKIP_DELAY_MS);
    const endSubscription = player.addListener('playToEnd', completeSequence);
    const statusSubscription = player.addListener('statusChange', ({ status }) => {
      if (status === 'readyToPlay') {
        setVideoFailed(false);
        player.play();
      } else if (status === 'error') {
        setVideoFailed(true);
      }
    });

    return () => {
      clearTimeout(skipTimer);
      endSubscription.remove();
      statusSubscription.remove();
      player.pause();
    };
  }, [player]);

  useEffect(() => {
    if (!videoFailed || retryCountRef.current >= 1 || hasCompletedRef.current) {
      return;
    }

    retryCountRef.current += 1;
    const retryTimer = setTimeout(() => {
      setVideoFailed(false);
      player.replace(primaryVideo);
      player.play();
    }, 500);

    return () => clearTimeout(retryTimer);
  }, [player, videoFailed]);

  const handleSkip = () => {
    if (!canSkip || hasCompletedRef.current) {
      return;
    }

    player.pause();
    completeSequence();
  };

  const handleToggleMute = () => {
    const next = !isMuted;
    player.muted = next;
    setIsMuted(next);
  };

  return (
    <View style={styles.container}>
      <View style={styles.videoStage}>
        <VideoView
          player={player}
          style={styles.video}
          contentFit="contain"
          nativeControls={false}
        />
      </View>
      <View pointerEvents="none" style={styles.readabilityScrim} />

      {videoFailed ? (
        <Pressable accessibilityRole="button" onPress={completeSequence} style={styles.fallbackButton}>
          <Text style={styles.skipText}>{getLocalizedText('tutorialSkipLabel', language)}</Text>
        </Pressable>
      ) : null}

      <View
        pointerEvents="none"
        style={[
          styles.brandLockup,
          {
            top: Math.max(insets.top, 12) + 10,
            left: Math.max(insets.left, 16) + 10,
          },
        ]}
      >
        <Image source={peakPactLogo} style={styles.brandLogo} resizeMode="contain" />
        <Text style={styles.brandText}>PEAKPACT</Text>
      </View>

      {canSkip ? (
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={getLocalizedText('tutorialSkipLabel', language)}
          onPress={handleSkip}
          style={({ pressed }) => [
            styles.skipButton,
            {
              top: Math.max(insets.top, 12) + 8,
              right: Math.max(insets.right, 12) + 8,
            },
            pressed && styles.skipButtonPressed,
          ]}
        >
          <Text style={styles.skipText}>{getLocalizedText('tutorialSkipLabel', language)}</Text>
        </Pressable>
      ) : null}

      {Platform.OS === 'web' && !videoFailed ? (
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={isMuted ? 'Unmute video' : 'Mute video'}
          onPress={handleToggleMute}
          style={({ pressed }) => [
            styles.muteButton,
            {
              bottom: Math.max(insets.bottom, 12) + 8,
              right: Math.max(insets.right, 12) + 8,
            },
            pressed && styles.skipButtonPressed,
          ]}
        >
          <Text style={styles.skipText}>{isMuted ? '🔇' : '🔊'}</Text>
        </Pressable>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000000',
  },
  videoStage: {
    flex: 1,
    width: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
  },
  video: {
    width: '100%',
    height: '100%',
    maxWidth: 900,
    alignSelf: 'center',
  },
  readabilityScrim: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.16)',
    zIndex: 1,
  },
  skipButton: {
    position: 'absolute',
    zIndex: 3,
    minHeight: 44,
    minWidth: 76,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(0,0,0,0.68)',
    borderColor: 'rgba(255,255,255,0.2)',
    borderRadius: 8,
    borderWidth: StyleSheet.hairlineWidth,
    paddingHorizontal: 16,
    paddingVertical: 10,
  },
  muteButton: {
    position: 'absolute',
    zIndex: 3,
    minHeight: 44,
    minWidth: 44,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(0,0,0,0.68)',
    borderColor: 'rgba(255,255,255,0.2)',
    borderRadius: 22,
    borderWidth: StyleSheet.hairlineWidth,
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  brandLockup: {
    position: 'absolute',
    zIndex: 2,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.58)',
    borderColor: 'rgba(156,226,42,0.28)',
    borderRadius: 10,
    borderWidth: StyleSheet.hairlineWidth,
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  brandLogo: {
    width: 32,
    height: 32,
    marginRight: 8,
  },
  brandText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '800',
    letterSpacing: 2.4,
  },
  skipButtonPressed: {
    backgroundColor: 'rgba(255,255,255,0.16)',
  },
  skipText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
    letterSpacing: 0,
  },
  fallbackButton: {
    position: 'absolute',
    zIndex: 3,
    alignSelf: 'center',
    bottom: 32,
    minHeight: 44,
    justifyContent: 'center',
    backgroundColor: 'rgba(0,0,0,0.72)',
    borderRadius: 8,
    paddingHorizontal: 18,
  },
});
