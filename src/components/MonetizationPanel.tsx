import React, { useEffect, useMemo, useState } from 'react';
import i18n from 'i18next';
import { Platform, Pressable, StyleSheet, Text, View } from 'react-native';
import type { ProductPlan } from '../services/productPlan';
import { getLocalizedText, resolveLanguage, type SupportedLanguage } from '../services/i18n';

type MonetizationPanelProps = {
  visible: boolean;
  accent: string;
  plan: ProductPlan | string;
  isDeviceTrialActive?: boolean;
  trialDaysRemaining?: number;
  canStartDeviceTrial?: boolean;
  onStartDeviceTrial?: () => void;
};

export default function MonetizationPanel({
  visible,
  accent,
  plan,
  isDeviceTrialActive = false,
  trialDaysRemaining = 0,
  canStartDeviceTrial = false,
  onStartDeviceTrial,
}: MonetizationPanelProps) {
  if (!visible) {
    return null;
  }

  const [language, setLanguage] = useState<SupportedLanguage>(() => resolveLanguage(i18n.language));
  const isWeb = Platform.OS === 'web';
  const tiers = useMemo(
    () => [
      {
        title: getLocalizedText('premiumCoreDiscipline', language),
        detail: getLocalizedText('premiumCoreDisciplineDetail', language),
        price: getLocalizedText('premiumIncluded', language),
        badge: getLocalizedText('premiumBadgeFree', language),
      },
      {
        title: getLocalizedText('premiumMonthlyTitle', language),
        detail: getLocalizedText('premiumMonthlyDetail', language),
        price: '€9.99 / month',
        badge: getLocalizedText('premiumBadgeMostFlexible', language),
      },
      {
        title: getLocalizedText('premiumYearlyTitle', language),
        detail: getLocalizedText('premiumYearlyDetail', language),
        price: '€79.99 / year',
        badge: getLocalizedText('premiumBadgeBestValue', language),
      },
      {
        title: getLocalizedText('premiumLifetimeTitle', language),
        detail: getLocalizedText('premiumLifetimeDetail', language),
        price: '€199 one-time',
        badge: getLocalizedText('premiumBadgeOneTime', language),
      },
      {
        title: getLocalizedText('premiumDesignPrestigeTitle', language),
        detail: getLocalizedText('premiumDesignPrestigeDetail', language),
        price: '180 / 260 / 320 PP',
        badge: getLocalizedText('premiumBadgeStyle', language),
      },
    ],
    [language],
  );

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
    <View style={[styles.panel, isWeb && styles.panelWeb]}>
      <Text style={styles.eyebrow}>{getLocalizedText('premiumAccess', language)}</Text>
      <Text style={styles.header}>{getLocalizedText('premiumHeader', language)}</Text>
      <Text style={styles.body}>{getLocalizedText('premiumBody', language)}</Text>

      {canStartDeviceTrial ? (
        <View style={styles.trialDisclosure}>
          <Text style={styles.trialTitle}>START 7-DAY PREMIUM TRIAL</Text>
          <Text style={styles.trialBody}>No payment method is required. The trial ends automatically after 7 days and does not auto-renew or charge you.</Text>
          <Text style={styles.trialBody}>After the trial, choose Premium Monthly for €9.99/month, Premium Yearly for €79.99/year, or Lifetime Premium for €199 through your app store. You can cancel store subscriptions in your Apple or Google account settings.</Text>
          <Pressable style={[styles.trialButton, { borderColor: accent }]} onPress={onStartDeviceTrial}>
            <Text style={[styles.trialButtonText, { color: accent }]}>START FREE TRIAL</Text>
          </Pressable>
        </View>
      ) : null}
      
      <View style={styles.statusCard}>
        <Text style={styles.statusLabel}>{getLocalizedText('premiumCurrentPlan', language)}</Text>
        <Text style={styles.statusValue}>{plan}</Text>
        {isDeviceTrialActive ? (
          <Text style={styles.statusTrail}>{`${getLocalizedText('premiumTrialActive', language)} ${trialDaysRemaining}`}</Text>
        ) : null}
      </View>
      
      <Text style={styles.body}>{getLocalizedText('premiumBody2', language)}</Text>
      
      {tiers.map((tier) => (
        <View key={tier.title} style={styles.tierCard}>
          <View style={styles.tierHeaderRow}>
            <Text style={styles.tierTitle}>{tier.title}</Text>
            <View style={styles.badge}><Text style={styles.badgeText}>{tier.badge}</Text></View>
          </View>
          <Text style={styles.tierDetail}>{tier.detail}</Text>
          <Text style={styles.tierPrice}>{tier.price}</Text>
        </View>
      ))}

      <Pressable style={styles.cta}>
        <Text style={styles.ctaText}>{getLocalizedText('premiumUpgradeCta', language)}</Text>
      </Pressable>
      <Text style={styles.footer}>{getLocalizedText('premiumFooter', language)}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  panel: {
    borderWidth: 1,
    padding: 16,
    marginBottom: 12,
    backgroundColor: '#10161F',
    borderColor: 'rgba(255,255,255,0.12)',
    borderRadius: 20,
  },
  panelWeb: {
    borderRadius: 24,
    padding: 20,
  },
  eyebrow: {
    color: '#95A6BA',
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 1.2,
    textTransform: 'uppercase',
    marginBottom: 8,
  },
  header: {
    color: '#F4F8FC',
    fontSize: 21,
    fontWeight: '800',
    letterSpacing: -0.3,
    marginBottom: 8,
  },
  statusCard: {
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.16)',
    padding: 12,
    marginBottom: 10,
    backgroundColor: 'rgba(255,255,255,0.04)',
    borderRadius: 14,
  },
  statusLabel: {
    color: '#9EAFC2',
    fontSize: 10,
    letterSpacing: 1,
    textTransform: 'uppercase',
    marginBottom: 4,
  },
  statusValue: {
    color: '#F4F8FC',
    fontSize: 15,
    fontWeight: '700',
    marginBottom: 4,
  },
  statusTrail: {
    color: '#B4D0C2',
    fontSize: 11,
    lineHeight: 14,
  },
  body: {
    color: '#BAC7D6',
    fontSize: 13,
    marginBottom: 10,
    lineHeight: 20,
  },
  trialDisclosure: {
    borderWidth: 1,
    borderColor: 'rgba(156,226,42,0.45)',
    padding: 14,
    marginBottom: 12,
    backgroundColor: 'rgba(156,226,42,0.08)',
    borderRadius: 12,
  },
  trialTitle: {
    color: '#F4F8FC',
    fontSize: 12,
    fontWeight: '800',
    letterSpacing: 0.8,
    marginBottom: 8,
  },
  trialBody: {
    color: '#C8D4E1',
    fontSize: 12,
    lineHeight: 18,
    marginBottom: 8,
  },
  trialButton: {
    borderWidth: 1,
    alignItems: 'center',
    paddingVertical: 11,
    borderRadius: 10,
    marginTop: 2,
  },
  trialButtonText: {
    fontSize: 12,
    fontWeight: '800',
    letterSpacing: 0.8,
  },
  tierCard: {
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
    padding: 12,
    marginBottom: 8,
    backgroundColor: '#141C26',
    borderRadius: 12,
  },
  tierHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
    gap: 8,
  },
  tierTitle: {
    color: '#EAF1F8',
    fontSize: 12,
    marginBottom: 4,
    fontWeight: '700',
  },
  tierDetail: {
    fontSize: 12,
    color: '#B6C2D1',
    marginBottom: 6,
    lineHeight: 18,
  },
  tierPrice: {
    fontSize: 12,
    color: '#83E7B4',
    fontWeight: '700',
  },
  badge: {
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.2)',
    paddingHorizontal: 6,
    paddingVertical: 3,
    borderRadius: 999,
    backgroundColor: 'rgba(255,255,255,0.06)',
  },
  badgeText: {
    color: '#DBE4EF',
    fontSize: 8,
    letterSpacing: 1,
    fontWeight: '700',
  },
  cta: {
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.18)',
    paddingVertical: 12,
    alignItems: 'center',
    marginTop: 6,
    marginBottom: 8,
    borderRadius: 14,
    backgroundColor: '#EFF5FB',
  },
  ctaText: {
    color: '#10161F',
    fontSize: 12,
    letterSpacing: 0.4,
    fontWeight: '700',
  },
  footer: {
    fontSize: 11,
    color: '#93A6BC',
  },
});