import React from 'react';
import {
  SafeAreaView,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  View,
} from 'react-native';

export default function HabitTrackerScreen() {
  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="light-content" backgroundColor="#080808" />
      <ScrollView contentContainerStyle={styles.content} bounces={false} showsVerticalScrollIndicator={false}>
        <Text style={styles.title}>Habit Tracker</Text>
        <Text style={styles.subtitle}>Stay aligned with your daily discipline loop.</Text>

        <View style={styles.card}>
          <Text style={styles.cardLabel}>Daily progress</Text>
          <Text style={styles.cardValue}>3 of 4 streak tasks completed</Text>
          <Text style={styles.cardNote}>The system is watching your operator consistency.</Text>
        </View>

        <View style={styles.card}> 
          <Text style={styles.cardLabel}>Next checkpoint</Text>
          <Text style={styles.cardValue}>Submit your report before 21:00</Text>
          <Text style={styles.cardNote}>Keep the cycle moving to maintain reward momentum.</Text>
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