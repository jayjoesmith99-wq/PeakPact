import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
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
    title: 'BASIC // DISCIPLINE CORE',
    detail: 'Manual pact logging, contract verification, narrative unlocks, mission viewing, offline safety, and the full strict core loop.',
    price: 'Included // In-app economy uses PP',
    badge: 'FREE',
  },
  {
    title: 'PREMIUM // CONVENIENCE OVERRIDES',
    detail: 'Mission autoload, voice capture, time dilation, and +100 free PP each monthly billing cycle for operators who want less friction.',
    price: '699 PP monthly (EUR 6.99 at checkout)',
    badge: 'BEST FOR BUILDERS',
  },
  {
    title: 'PREMIUM // YEARLY COMMAND PASS',
    detail: 'All premium conveniences at the best value for committed operators, plus +1800 free PP yearly and lower friction at scale.',
    price: '5999 PP yearly (EUR 59.99 at checkout)',
    badge: 'BEST VALUE',
  },
  {
    title: 'PP PACKS // OPTIONAL TOP-UP',
    detail: 'Optional PP top-up packs for users who want to pre-fund the in-app PP economy and extend their command window.',
    price: 'EUR checkout with exact 1 PP = EUR 0.01 conversion',
    badge: 'TOP-UP',
  },
  {
    title: 'DESIGN TEMPLATES // VISUAL PRESTIGE TIERS',
    detail: 'Terminal/Cyber-Dungeon at 180 PP, Mecha/HUD Pilot at 260 PP, LitRPG Stat Sheet at 260 PP, and Apex Megacorp Executive OS at 320 PP. Buy once, keep permanently.',
    price: '180 / 260 / 320 PP',
    badge: 'STYLE ECONOMY',
  },
];

export default function MonetizationPanel({ visible, accent, plan, isDeviceTrialActive = false, trialDaysRemaining = 0 }: MonetizationPanelProps) {
  if (!visible) {
    return null;
  }

  return (
    <View style={[styles.panel, { borderColor: accent }]}>
      <Text style={[styles.header, { color: accent }]}>[ SYSTEM OVERRIDES // PREMIUM ASCENSION ]</Text>
      <Text style={[styles.body, { color: accent }]}>PeakPact is built for operators who want discipline without friction. The core loop stays free; premium removes the drag so your focus stays on execution.</Text>
      
      <View style={styles.statusCard}>
        <Text style={[styles.statusLabel, { color: accent }]}>CURRENT STATUS</Text>
        <Text style={styles.statusValue}>{plan}</Text>
        {isDeviceTrialActive ? (
          <Text style={styles.statusTrail}>DEVICE TRIAL ACTIVE • PREMIUM ACCESS REMAINS LIVE FOR {trialDaysRemaining} MORE DAY(S)</Text>
        ) : null}
      </View>
      
      <Text style={[styles.body, { color: accent }]}>Premium includes a 7-day free trial per new device, free PP bonuses of +100 PP/month or +1800 PP/year, and a four-template visual ladder mapped to 180/260/320 PP prestige economics.</Text>
      
      {tiers.map((tier) => (
        <View key={tier.title} style={styles.tierCard}>
          <View style={styles.tierHeaderRow}>
            <Text style={[styles.tierTitle, { color: accent }]}>{tier.title}</Text>
            <View style={styles.badge}><Text style={styles.badgeText}>{tier.badge}</Text></View>
          </View>
          <Text style={styles.tierDetail}>{tier.detail}</Text>
          <Text style={styles.tierPrice}>{tier.price}</Text>
        </View>
      ))}

      <Pressable style={[styles.cta, { borderColor: accent }]}>
        <Text style={[styles.ctaText, { color: accent }]}>UPGRADE TO PREMIUM ASCENSION</Text>
      </Pressable>
      <Text style={styles.footer}>Discipline stays free. Friction is premium.</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  panel: {
    borderWidth: 1,
    padding: 12,
    marginBottom: 12,
    backgroundColor: '#050b08',
    borderRadius: 16,
  },
  header: {
    fontFamily: 'Courier New',
    fontSize: 12,
    letterSpacing: 1,
    marginBottom: 8,
  },
  statusCard: {
    borderWidth: 1,
    borderColor: 'rgba(0, 255, 102, 0.3)',
    padding: 10,
    marginBottom: 10,
    backgroundColor: 'rgba(0, 255, 102, 0.05)',
    borderRadius: 12,
  },
  statusLabel: {
    fontFamily: 'Courier New',
    fontSize: 10,
    letterSpacing: 1.2,
    marginBottom: 4,
  },
  statusValue: {
    color: '#f5fff8',
    fontFamily: 'Courier New',
    fontSize: 13,
    fontWeight: '700',
    marginBottom: 4,
  },
  statusTrail: {
    color: '#8fe7b9',
    fontFamily: 'Courier New',
    fontSize: 10,
    lineHeight: 14,
  },
  body: {
    fontFamily: 'Courier New',
    fontSize: 11,
    marginBottom: 10,
    lineHeight: 16,
  },
  tierCard: {
    borderWidth: 1,
    borderColor: '#00FF66',
    padding: 10,
    marginBottom: 8,
    backgroundColor: '#001100',
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
    fontFamily: 'Courier New',
    fontSize: 12,
    marginBottom: 4,
  },
  tierDetail: {
    fontFamily: 'Courier New',
    fontSize: 10,
    color: '#00FF66',
    marginBottom: 4,
  },
  tierPrice: {
    fontFamily: 'Courier New',
    fontSize: 10,
    color: '#FF0033',
  },
  badge: {
    borderWidth: 1,
    borderColor: '#00FF66',
    paddingHorizontal: 6,
    paddingVertical: 3,
    backgroundColor: 'rgba(0, 255, 102, 0.08)',
  },
  badgeText: {
    color: '#00FF66',
    fontFamily: 'Courier New',
    fontSize: 8,
    letterSpacing: 1,
  },
  cta: {
    borderWidth: 1,
    paddingVertical: 10,
    alignItems: 'center',
    marginTop: 6,
    marginBottom: 8,
    borderRadius: 12,
    backgroundColor: 'rgba(0, 255, 102, 0.06)',
  },
  ctaText: {
    fontFamily: 'Courier New',
    fontSize: 11,
    letterSpacing: 1.2,
    fontWeight: '700',
  },
  footer: {
    fontFamily: 'Courier New',
    fontSize: 10,
    color: '#00FF66',
  },
});