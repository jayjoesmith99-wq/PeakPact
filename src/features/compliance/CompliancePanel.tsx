import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

type CompliancePanelProps = {
  accent: string;
  consented: boolean;
  termsText: string | string[];
  privacyText: string | string[];
};

export const CompliancePanel = React.memo(function CompliancePanel({
  accent,
  consented,
  termsText,
  privacyText,
}: CompliancePanelProps) {
  return (
    <View style={[styles.panel, { borderColor: accent }]}> 
      <Text style={[styles.title, { color: accent }]}>COMPLIANCE</Text>
      <Text style={styles.status}>{consented ? 'Consent active' : 'Consent pending'}</Text>
      <Text style={styles.body}>{Array.isArray(termsText) ? termsText.join(' ') : termsText}</Text>
      <Text style={styles.body}>{Array.isArray(privacyText) ? privacyText.join(' ') : privacyText}</Text>
    </View>
  );
});

const styles = StyleSheet.create({
  panel: {
    borderWidth: 1,
    borderRadius: 20,
    padding: 18,
    backgroundColor: 'rgba(255,255,255,0.03)',
  },
  title: {
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 2,
    marginBottom: 10,
  },
  status: {
    color: '#F5F5F5',
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 8,
  },
  body: {
    color: '#C7C7C7',
    fontSize: 13,
    lineHeight: 20,
    marginBottom: 8,
  },
});
