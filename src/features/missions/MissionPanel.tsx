import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

type MissionPanelProps = {
  accent: string;
  missionTitle: string;
  missionDescription: string;
  missionRisk: number | string;
  missionRewardBonus: number | string;
  missionTimeWindowMinutes: number;
  missionContractTemplate: string;
  pp: number;
  streak: number;
  level: number;
};

export const MissionPanel = React.memo(function MissionPanel({
  accent,
  missionTitle,
  missionDescription,
  missionRisk,
  missionRewardBonus,
  missionTimeWindowMinutes,
  missionContractTemplate,
  pp,
  streak,
  level,
}: MissionPanelProps) {
  return (
    <View style={[styles.panel, { borderColor: accent }]}> 
      <Text style={[styles.title, { color: accent }]}>MISSION CORE</Text>
      <Text style={styles.subtitle}>{missionTitle}</Text>
      <Text style={styles.body}>{missionDescription}</Text>
      <View style={styles.metaRow}>
        <Text style={styles.metaChip}>RISK {missionRisk}</Text>
        <Text style={styles.metaChip}>BONUS {missionRewardBonus}</Text>
        <Text style={styles.metaChip}>{missionTimeWindowMinutes} MIN</Text>
      </View>
      <View style={styles.metaRow}>
        <Text style={styles.metaChip}>PP {pp}</Text>
        <Text style={styles.metaChip}>STREAK {streak}</Text>
        <Text style={styles.metaChip}>LVL {level}</Text>
      </View>
      <Text style={styles.template}>Template: {missionContractTemplate}</Text>
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
  subtitle: {
    color: '#F5F5F5',
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 8,
  },
  body: {
    color: '#C7C7C7',
    fontSize: 13,
    lineHeight: 20,
    marginBottom: 12,
  },
  metaRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 8,
  },
  metaChip: {
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.12)',
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 6,
    color: '#F5F5F5',
    fontSize: 11,
  },
  template: {
    color: '#8D8D8D',
    fontSize: 12,
    marginTop: 4,
  },
});
