import React, { useEffect, useState } from 'react';
import {
  SafeAreaView,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import i18n from 'i18next';
import { getLocalizedText, resolveLanguage, type SupportedLanguage } from '../../i18n';

export default function ProfileScreen() {
  const [language, setLanguage] = useState<SupportedLanguage>(() => resolveLanguage(i18n.language));

  useEffect(() => {
    const handleLanguageChange = (nextLanguage: string) => {
      setLanguage(resolveLanguage(nextLanguage));
    };

    i18n.on('languageChanged', handleLanguageChange);

    return () => {
      i18n.off('languageChanged', handleLanguageChange);
    };
  }, []);

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="light-content" backgroundColor="#080808" />
      <ScrollView contentContainerStyle={styles.content} bounces={false} showsVerticalScrollIndicator={false}>
        <Text style={styles.title}>{getLocalizedText('profileTitle', language)}</Text>
        <Text style={styles.subtitle}>{getLocalizedText('profileSubtitle', language)}</Text>

        <View style={styles.card}>
          <Text style={styles.cardLabel}>{getLocalizedText('profileCodenameLabel', language)}</Text>
          <Text style={styles.cardValue}>{getLocalizedText('profileCodenameValue', language)}</Text>
          <Text style={styles.cardNote}>{getLocalizedText('profileCodenameNote', language)}</Text>
        </View>

        <View style={styles.card}>
          <Text style={styles.cardLabel}>{getLocalizedText('profileMembershipLabel', language)}</Text>
          <Text style={styles.cardValue}>{getLocalizedText('profileMembershipValue', language)}</Text>
          <Text style={styles.cardNote}>{getLocalizedText('profileMembershipNote', language)}</Text>
        </View>

        <View style={styles.card}>
          <Text style={styles.cardLabel}>{getLocalizedText('profileDossierTitle', language)}</Text>
          <Text style={styles.cardNote}>{getLocalizedText('profileDossierNote', language)}</Text>
          <View style={styles.statsRow}>
            <View style={styles.statBox}>
              <Text style={styles.statLabel}>{getLocalizedText('profileStatLevel', language)}</Text>
              <Text style={styles.statValue}>3</Text>
            </View>
            <View style={styles.statBox}>
              <Text style={styles.statLabel}>{getLocalizedText('profileStatStreak', language)}</Text>
              <Text style={styles.statValue}>6</Text>
            </View>
            <View style={styles.statBox}>
              <Text style={styles.statLabel}>{getLocalizedText('profileStatXp', language)}</Text>
              <Text style={styles.statValue}>1500</Text>
            </View>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#080808',
  },
  content: {
    paddingTop: 28,
    paddingBottom: 32,
    paddingHorizontal: 20,
    gap: 20,
  },
  title: {
    color: '#F5F5F5',
    fontSize: 28,
    fontWeight: '800',
    marginBottom: 6,
  },
  subtitle: {
    color: '#A0A0A0',
    fontSize: 14,
    marginBottom: 22,
    lineHeight: 22,
  },
  card: {
    backgroundColor: '#111111',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
    borderRadius: 24,
    padding: 22,
    gap: 10,
  },
  cardLabel: {
    color: '#A0A0A0',
    fontSize: 11,
    letterSpacing: 1.4,
    textTransform: 'uppercase',
  },
  cardValue: {
    color: '#F5F5F5',
    fontSize: 18,
    fontWeight: '800',
    lineHeight: 26,
  },
  cardNote: {
    color: '#6F6F6F',
    fontSize: 13,
    lineHeight: 20,
  },
  statsRow: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 6,
  },
  statBox: {
    flex: 1,
    backgroundColor: '#181818',
    borderRadius: 14,
    paddingVertical: 12,
    paddingHorizontal: 8,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.05)',
  },
  statLabel: {
    color: '#808080',
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 1.2,
    marginBottom: 4,
  },
  statValue: {
    color: '#76FF03',
    fontSize: 18,
    fontWeight: '900',
  },
});