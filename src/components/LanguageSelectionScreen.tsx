import React, { useMemo } from 'react';
import {
  Platform,
  Pressable,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import type { SupportedLanguage } from '../i18n';

type LanguageOption = {
  code: SupportedLanguage;
  label: string;
  nativeLabel: string;
};

type LanguageSelectionScreenProps = {
  selectedLanguage: SupportedLanguage;
  onSelectLanguage: (language: SupportedLanguage) => void;
  onContinue: () => void;
};

const options: LanguageOption[] = [
  { code: 'en', label: 'English', nativeLabel: 'English' },
  { code: 'ro', label: 'Romanian', nativeLabel: 'Romana' },
  { code: 'it', label: 'Italian', nativeLabel: 'Italiano' },
  { code: 'es', label: 'Spanish', nativeLabel: 'Espanol' },
  { code: 'fr', label: 'French', nativeLabel: 'Francais' },
  { code: 'de', label: 'German', nativeLabel: 'Deutsch' },
  { code: 'pt', label: 'Portuguese', nativeLabel: 'Portugues' },
  { code: 'ja', label: 'Japanese', nativeLabel: 'Nihongo' },
  { code: 'zh', label: 'Chinese', nativeLabel: 'Zhongwen' },
];

export default function LanguageSelectionScreen({
  selectedLanguage,
  onSelectLanguage,
  onContinue,
}: LanguageSelectionScreenProps) {
  const isWeb = Platform.OS === 'web';

  const selected = useMemo(
    () => options.find((option) => option.code === selectedLanguage) ?? options[0],
    [selectedLanguage],
  );

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.backgroundGlowTop} />
      <View style={styles.backgroundGlowBottom} />
      <View style={[styles.shell, isWeb && styles.shellWeb]}>
        <Text style={styles.eyebrow}>PEAKPACT</Text>
        <Text style={styles.title}>Choose your language</Text>
        <Text style={styles.subtitle}>
          Language is applied before onboarding, welcome cinematic, and mission system.
        </Text>

        <ScrollView
          contentContainerStyle={styles.grid}
          showsVerticalScrollIndicator={false}
        >
          {options.map((option) => {
            const active = option.code === selectedLanguage;
            return (
              <Pressable
                key={option.code}
                style={[styles.card, active && styles.cardActive]}
                onPress={() => onSelectLanguage(option.code)}
              >
                <Text style={[styles.cardLabel, active && styles.cardLabelActive]}>{option.label}</Text>
                <Text style={[styles.cardNative, active && styles.cardNativeActive]}>{option.nativeLabel}</Text>
              </Pressable>
            );
          })}
        </ScrollView>

        <View style={styles.footerRow}>
          <Text style={styles.footerHint}>Selected: {selected.label}</Text>
          <Pressable style={styles.button} onPress={onContinue}>
            <Text style={styles.buttonText}>Continue</Text>
          </Pressable>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#0B0E11',
  },
  backgroundGlowTop: {
    position: 'absolute',
    top: -140,
    right: -80,
    width: 360,
    height: 360,
    borderRadius: 300,
    backgroundColor: 'rgba(0,255,136,0.14)',
  },
  backgroundGlowBottom: {
    position: 'absolute',
    bottom: -180,
    left: -100,
    width: 340,
    height: 340,
    borderRadius: 300,
    backgroundColor: 'rgba(0,255,136,0.09)',
  },
  shell: {
    flex: 1,
    paddingHorizontal: 20,
    paddingVertical: 20,
  },
  shellWeb: {
    width: '100%',
    maxWidth: 860,
    alignSelf: 'center',
    marginTop: 24,
    marginBottom: 24,
    borderRadius: 28,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.12)',
    backgroundColor: 'rgba(21,26,32,0.72)',
  },
  eyebrow: {
    color: '#00FF88',
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 2,
    marginBottom: 12,
    textTransform: 'uppercase',
  },
  title: {
    color: '#F5F7FA',
    fontSize: 32,
    fontWeight: '800',
    lineHeight: 36,
  },
  subtitle: {
    color: '#A7B1BC',
    fontSize: 14,
    lineHeight: 21,
    marginTop: 10,
    marginBottom: 18,
  },
  grid: {
    paddingBottom: 20,
    gap: 10,
  },
  card: {
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.12)',
    backgroundColor: 'rgba(21,26,32,0.82)',
    borderRadius: 16,
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  cardActive: {
    borderColor: '#00FF88',
    backgroundColor: 'rgba(0,255,136,0.12)',
  },
  cardLabel: {
    color: '#F5F7FA',
    fontSize: 16,
    fontWeight: '700',
  },
  cardLabelActive: {
    color: '#00FF88',
  },
  cardNative: {
    color: '#A7B1BC',
    fontSize: 13,
    marginTop: 4,
  },
  cardNativeActive: {
    color: '#D6FFE9',
  },
  footerRow: {
    marginTop: 8,
    paddingTop: 14,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.12)',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
  },
  footerHint: {
    color: '#A7B1BC',
    fontSize: 13,
    flexShrink: 1,
  },
  button: {
    borderRadius: 999,
    backgroundColor: '#00FF88',
    paddingHorizontal: 20,
    paddingVertical: 12,
  },
  buttonText: {
    color: '#0B0E11',
    fontWeight: '800',
    fontSize: 13,
    letterSpacing: 1,
    textTransform: 'uppercase',
  },
});
