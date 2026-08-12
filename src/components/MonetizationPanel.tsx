import React from 'react';
import { Platform, Pressable, StyleSheet, Text, View } from 'react-native';
import type { ProductPlan } from '../services/productPlan';

type MonetizationPanelProps = {
  visible: boolean;
  accent: string;
  plan: ProductPlan | string;
  isDeviceTrialActive?: boolean;
  trialDaysRemaining?: number;
};

const tiers = [
  {
    title: 'Core Discipline',
    detail: 'Mission contracts, verification loops, progression, squads, and offline safety.',
    price: 'Included',
    badge: 'FREE',
  },
  {
    title: 'Premium Monthly',
    detail: 'Voice capture, reduced friction, and premium execution intelligence.',
    price: 'EUR 6.99 / month',
    badge: 'MOST FLEXIBLE',
  },
  {
    title: 'Premium Yearly',
    detail: 'Full premium stack with the strongest annual value profile.',
    price: 'EUR 59.99 / year',
    badge: 'BEST VALUE',
  },
  {
    title: 'Lifetime Premium',
    detail: 'Permanent premium unlock for users building long-term identity systems.',
    price: 'One-time lifetime purchase',
    badge: 'ONE-TIME',
  },
  {
    title: 'Design Prestige Tiers',
    detail: 'Permanent visual themes and premium interface packs purchased once.',
    price: '180 / 260 / 320 PP',
    badge: 'STYLE',
  },
];

export default function MonetizationPanel({ visible, accent, plan, isDeviceTrialActive = false, trialDaysRemaining = 0 }: MonetizationPanelProps) {
  if (!visible) {
    return null;
  }

  const isWeb = Platform.OS === 'web';

  return (
    <View style={[styles.panel, isWeb && styles.panelWeb]}>
      <Text style={styles.eyebrow}>Premium Access</Text>
      <Text style={styles.header}>Apple-grade calm. WHOOP-grade insight.</Text>
      <Text style={styles.body}>PeakPact Core remains complete and free. Premium adds speed, intelligence, and sustained consistency under pressure.</Text>
      
      <View style={styles.statusCard}>
        <Text style={styles.statusLabel}>Current Plan</Text>
        <Text style={styles.statusValue}>{plan}</Text>
        {isDeviceTrialActive ? (
          <Text style={styles.statusTrail}>Device trial active. Premium access remains live for {trialDaysRemaining} more day(s).</Text>
        ) : null}
      </View>
      
      <Text style={styles.body}>Premium includes a 7-day free trial per new device and accelerated execution workflows across mission capture, coaching, and report intelligence.</Text>
      
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
        <Text style={styles.ctaText}>Upgrade To Premium</Text>
      </Pressable>
      <Text style={styles.footer}>Discipline stays free. Friction removal is premium.</Text>
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