import React from 'react';
import {
  Image,
  Pressable,
  SafeAreaView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';

const backdrop = require('../../../assets/elite-backdrop.jpeg');
const logo = require('../../../assets/logo.peakpact.png');

type RootStackParamList = {
  Home: undefined;
  Habits: undefined;
  Audio: undefined;
  Profile: undefined;
  Welcome: undefined;
};

type ActionCard = {
  title: string;
  subtitle: string;
  route: keyof RootStackParamList;
  accent: string;
};

const actionCards: ActionCard[] = [
  {
    title: 'START YOUR PACT',
    subtitle: 'Enter the daily loop and begin with clarity.',
    route: 'Habits',
    accent: '#6fff8a',
  },
  {
    title: 'LISTEN TO THE SYSTEM',
    subtitle: 'Use the audio channel for focus and guidance.',
    route: 'Audio',
    accent: '#89b4ff',
  },
  {
    title: 'VIEW YOUR PROFILE',
    subtitle: 'Review progress, status, and operator history.',
    route: 'Profile',
    accent: '#ffd36b',
  },
];

export default function HomeScreen() {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <Image source={backdrop} style={styles.backdrop} resizeMode="cover" />
        <View style={styles.backdropOverlay} />

        <View style={styles.content}>
          <View style={styles.header}>
            <View style={styles.brandRow}>
              <View style={styles.logoShell}>
                <Image source={logo} style={styles.logo} resizeMode="contain" />
              </View>
              <View style={styles.brandTextWrap}>
                <Text style={styles.eyebrow}>OPERATOR COMMAND CENTER</Text>
                <Text style={styles.title}>PEAKPACT</Text>
              </View>
            </View>

            <View style={styles.statusCard}>
              <Text style={styles.statusLabel}>SYSTEM STATUS</Text>
              <Text style={styles.statusValue}>READY FOR ALIGNMENT</Text>
            </View>
          </View>

          <View style={styles.heroCard}>
            <View style={styles.heroTopRow}>
              <View style={styles.heroBadge} />
              <Text style={styles.heroTitle}>QUICK START</Text>
            </View>
            <Text style={styles.heroBody}>
              Your first mission is simple: begin the protocol, listen to guidance, and review your operator status.
            </Text>
          </View>

          <View style={styles.cardStack}>
            <Pressable
              accessibilityRole="button"
              onPress={() => navigation.navigate('Habits')}
              style={({ pressed }) => [styles.primaryAction, pressed && styles.pressed]}
            >
              <Text style={styles.primaryActionText}>BEGIN TODAY'S PROTOCOL</Text>
            </Pressable>

            {actionCards.map((card) => (
              <Pressable
                key={card.title}
                accessibilityRole="button"
                onPress={() => navigation.navigate(card.route)}
                style={({ pressed }) => [styles.secondaryAction, pressed && styles.pressed]}
              >
                <View style={[styles.accentLine, { backgroundColor: card.accent }]} />
                <View style={styles.secondaryCopy}>
                  <Text style={styles.secondaryTitle}>{card.title}</Text>
                  <Text style={styles.secondarySubtitle}>{card.subtitle}</Text>
                </View>
              </Pressable>
            ))}
          </View>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#02060c',
  },
  container: {
    flex: 1,
    backgroundColor: '#02060c',
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    opacity: 0.72,
  },
  backdropOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(2, 6, 14, 0.82)',
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 28,
    justifyContent: 'space-between',
  },
  header: {
    gap: 14,
  },
  brandRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  logoShell: {
    width: 58,
    height: 58,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(111, 255, 138, 0.12)',
    borderWidth: 1,
    borderColor: 'rgba(111, 255, 138, 0.26)',
  },
  logo: {
    width: 42,
    height: 42,
  },
  brandTextWrap: {
    flex: 1,
  },
  eyebrow: {
    color: '#6fff8a',
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 1.6,
    textTransform: 'uppercase',
  },
  title: {
    color: '#f3fff1',
    fontSize: 24,
    fontWeight: '700',
    letterSpacing: 1.4,
  },
  statusCard: {
    alignSelf: 'flex-start',
    borderWidth: 1,
    borderColor: 'rgba(111, 255, 138, 0.32)',
    backgroundColor: 'rgba(5, 12, 20, 0.84)',
    borderRadius: 14,
    paddingHorizontal: 14,
    paddingVertical: 10,
    shadowColor: '#6fff8a',
    shadowOpacity: 0.16,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 0 },
  },
  statusLabel: {
    color: '#9eff9e',
    fontSize: 10,
    letterSpacing: 1.4,
    textTransform: 'uppercase',
  },
  statusValue: {
    color: '#f3fff1',
    fontSize: 13,
    marginTop: 2,
    fontWeight: '700',
  },
  heroCard: {
    borderWidth: 1,
    borderColor: 'rgba(111, 255, 138, 0.24)',
    backgroundColor: 'rgba(5, 12, 20, 0.84)',
    borderRadius: 22,
    padding: 16,
    gap: 8,
    shadowColor: '#6fff8a',
    shadowOpacity: 0.12,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 6 },
  },
  heroTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  heroBadge: {
    width: 10,
    height: 10,
    borderRadius: 999,
    backgroundColor: '#6fff8a',
    shadowColor: '#6fff8a',
    shadowOpacity: 0.6,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 0 },
  },
  heroTitle: {
    color: '#f3fff1',
    fontSize: 16,
    fontWeight: '700',
    letterSpacing: 1.2,
    textTransform: 'uppercase',
  },
  heroBody: {
    color: '#c7d6e4',
    fontSize: 13,
    lineHeight: 20,
  },
  cardStack: {
    gap: 10,
  },
  primaryAction: {
    paddingVertical: 16,
    paddingHorizontal: 16,
    borderRadius: 18,
    borderWidth: 1.2,
    borderColor: '#6fff8a',
    backgroundColor: 'rgba(111, 255, 138, 0.16)',
    shadowColor: '#6fff8a',
    shadowOpacity: 0.28,
    shadowRadius: 18,
    shadowOffset: { width: 0, height: 0 },
  },
  primaryActionText: {
    color: '#f3fff1',
    fontSize: 15,
    fontWeight: '800',
    letterSpacing: 1.3,
    textTransform: 'uppercase',
  },
  secondaryAction: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: 14,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(111, 255, 138, 0.3)',
    backgroundColor: 'rgba(5, 12, 20, 0.76)',
    gap: 10,
  },
  accentLine: {
    width: 4,
    height: 38,
    borderRadius: 999,
  },
  secondaryCopy: {
    flex: 1,
  },
  secondaryTitle: {
    color: '#f3fff1',
    fontSize: 14,
    fontWeight: '700',
    letterSpacing: 0.8,
    marginBottom: 4,
  },
  secondarySubtitle: {
    color: '#98a8b8',
    fontSize: 12,
    lineHeight: 18,
  },
  pressed: {
    opacity: 0.95,
    transform: [{ scale: 0.985 }],
  },
});
