import React from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import { getLocalizedText, getSupportedLanguages, type SupportedLanguage } from '../../i18n';

type PreLoginExperienceProps = {
  language: SupportedLanguage;
  onLanguageChange: (language: SupportedLanguage) => void;
  onContinue: () => void;
  title: string;
  subtitle: string;
};

export const PreLoginExperience = React.memo(function PreLoginExperience({
  language,
  onLanguageChange,
  onContinue,
  title,
  subtitle,
}: PreLoginExperienceProps) {
  return (
    <View style={styles.shell}>
      <View style={styles.langBar}>
        {getSupportedLanguages().map((option) => (
          <Pressable
            key={option.code}
            style={[styles.langChip, language === option.code && styles.langChipActive]}
            onPress={() => onLanguageChange(option.code)}
          >
            <Text style={[styles.langText, language === option.code && styles.langTextActive]}>
              {option.label}
            </Text>
          </Pressable>
        ))}
      </View>
      <View style={styles.card}>
        <Text style={styles.eyebrow}>{getLocalizedText('appTitle', language)}</Text>
        <Text style={styles.title}>{title}</Text>
        <Text style={styles.subtitle}>{subtitle}</Text>
        <Pressable style={styles.button} onPress={onContinue}>
          <Text style={styles.buttonText}>{getLocalizedText('welcomeLogin', language)}</Text>
        </Pressable>
      </View>
    </View>
  );
});

const styles = StyleSheet.create({
  shell: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: 24,
    paddingVertical: 24,
    backgroundColor: '#040404',
  },
  langBar: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 8,
    marginBottom: 16,
    flexWrap: 'wrap',
  },
  langChip: {
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.16)',
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  langChipActive: {
    backgroundColor: '#00FF88',
    borderColor: '#00FF88',
  },
  langText: {
    color: '#F5F5F5',
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 1.2,
  },
  langTextActive: {
    color: '#040404',
  },
  card: {
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.14)',
    borderRadius: 24,
    padding: 24,
    backgroundColor: 'rgba(255,255,255,0.04)',
  },
  eyebrow: {
    color: '#00FF88',
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 2,
    marginBottom: 12,
  },
  title: {
    color: '#F5F5F5',
    fontSize: 24,
    fontWeight: '700',
    marginBottom: 8,
  },
  subtitle: {
    color: '#C7C7C7',
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 20,
  },
  button: {
    alignSelf: 'flex-start',
    backgroundColor: '#00FF88',
    borderRadius: 999,
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  buttonText: {
    color: '#040404',
    fontSize: 13,
    fontWeight: '700',
  },
});
