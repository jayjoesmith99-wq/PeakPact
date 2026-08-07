import React from 'react';
import {
  SafeAreaView,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  View,
} from 'react-native';

export default function ProfileScreen() {
  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="light-content" backgroundColor="#080808" />
      <ScrollView contentContainerStyle={styles.content} bounces={false} showsVerticalScrollIndicator={false}>
        <Text style={styles.title}>Profile</Text>
        <Text style={styles.subtitle}>Review your operator status and identity details.</Text>

        <View style={styles.card}>
          <Text style={styles.cardLabel}>Codename</Text>
          <Text style={styles.cardValue}>OPERATOR</Text>
          <Text style={styles.cardNote}>Your system alias and active access credential.</Text>
        </View>

        <View style={styles.card}> 
          <Text style={styles.cardLabel}>Membership</Text>
          <Text style={styles.cardValue}>Core Protocol Operator</Text>
          <Text style={styles.cardNote}>Status reflects your current discipline tier and trust level.</Text>
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
});