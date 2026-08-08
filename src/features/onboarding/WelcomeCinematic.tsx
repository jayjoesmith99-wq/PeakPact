import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { getLocalizedText, type SupportedLanguage } from '../../i18n';

type WelcomeCinematicProps = {
  language: SupportedLanguage;
  onComplete: () => void;
};

export const WelcomeCinematic = React.memo(function WelcomeCinematic({
  language,
  onComplete,
}: WelcomeCinematicProps) {
  const [phase, setPhase] = useState<'intro' | 'pulse' | 'done'>('intro');

  useEffect(() => {
    const timer = setTimeout(() => setPhase('pulse'), 1800);
    const finishTimer = setTimeout(() => {
      setPhase('done');
      onComplete();
    }, 4200);

    return () => {
      clearTimeout(timer);
      clearTimeout(finishTimer);
    };
  }, [onComplete]);

  return (
    <View style={styles.shell}>
      <View style={styles.logoWrap}>
        <Text style={styles.logo}>PEAKPACT</Text>
        {phase !== 'done' ? <Text style={styles.tagline}>{getLocalizedText('welcomeIntro', language)}</Text> : null}
      </View>
      <View style={styles.captionWrap}>
        <Text style={styles.caption}>{phase === 'pulse' ? 'Protocol locked.' : 'We do not default to comfort.'}</Text>
      </View>
    </View>
  );
});

const styles = StyleSheet.create({
  shell: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#020202',
  },
  logoWrap: {
    alignItems: 'center',
  },
  logo: {
    color: '#00FF88',
    fontSize: 34,
    fontWeight: '700',
    letterSpacing: 2,
  },
  tagline: {
    color: '#F5F5F5',
    marginTop: 12,
    fontSize: 15,
    opacity: 0.9,
  },
  captionWrap: {
    position: 'absolute',
    bottom: 56,
  },
  caption: {
    color: '#8D8D8D',
    fontSize: 14,
    letterSpacing: 1.2,
  },
});
