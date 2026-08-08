import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

type ProfilePanelProps = {
  accent: string;
  operatorCodename: string;
  activeUserEmail: string | null;
  pp: number;
  level: number;
  streak: number;
};

export const ProfilePanel = React.memo(function ProfilePanel({
  accent,
  operatorCodename,
  activeUserEmail,
  pp,
  level,
  streak,
}: ProfilePanelProps) {
  return (
    <View style={[styles.panel, { borderColor: accent }]}> 
      <Text style={[styles.title, { color: accent }]}>PROFILE</Text>
      <Text style={styles.codename}>{operatorCodename}</Text>
      <Text style={styles.email}>{activeUserEmail || 'LOCAL OPERATOR'}</Text>
      <View style={styles.metaRow}>
        <Text style={styles.metaChip}>PP {pp}</Text>
        <Text style={styles.metaChip}>LVL {level}</Text>
        <Text style={styles.metaChip}>STREAK {streak}</Text>
      </View>
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
  codename: {
    color: '#F5F5F5',
    fontSize: 20,
    fontWeight: '700',
    marginBottom: 6,
  },
  email: {
    color: '#8D8D8D',
    fontSize: 13,
    marginBottom: 12,
  },
  metaRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
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
});
