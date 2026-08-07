import React, { useState } from 'react';
import {
  Image,
  Pressable,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  useWindowDimensions,
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

type QuickAction = {
  label: string;
  route: keyof RootStackParamList;
  accent: string;
};

const QUICK_ACTIONS: QuickAction[] = [
  { label: 'ENGAGE PACT', route: 'Habits', accent: '#6fff8a' },
  { label: 'AUDIO BRIEF', route: 'Audio', accent: '#89b4ff' },
  { label: 'VIEW PROFILE', route: 'Profile', accent: '#ffd36b' },
];

const METRIC_CARDS = [
  { label: 'STREAK', value: '8 DAYS', detail: 'Continuous focus', accent: '#6fff8a' },
  { label: 'PP BALANCE', value: '198', detail: 'Ready to deploy', accent: '#89b4ff' },
  { label: 'LEVEL', value: '11', detail: 'Rising operator', accent: '#ffd36b' },
];

export default function HomeScreen() {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const { width } = useWindowDimensions();
  const isWide = width >= 900;
  const [missionGoal, setMissionGoal] = useState(
    'Complete a focused 45-minute study sprint',
  );
  const [missionDuration, setMissionDuration] = useState('45');
  const [missionStake, setMissionStake] = useState('20');

  const handleLockIn = () => {
    navigation.navigate('Habits');
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <Image source={backdrop} style={styles.backdrop} resizeMode="cover" />
      <View style={styles.backdropOverlay} />

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        bounces={false}
        showsVerticalScrollIndicator={false}
      >
        <View style={[styles.grid, isWide && styles.gridWide]}>
          <View style={[styles.column, styles.leftColumn]}>
            <View style={styles.profilePanel}>
              <View style={styles.brandRow}>
                <View style={styles.logoShell}>
                  <Image source={logo} style={styles.logo} resizeMode="contain" />
                </View>
                <View style={styles.brandTextWrap}>
                  <Text style={styles.eyebrow}>OPERATOR COMMAND CENTER</Text>
                  <Text style={styles.title}>PEAKPACT</Text>
                </View>
              </View>

              <View style={styles.greetingBlock}>
                <Text style={styles.greetingHeadline}>Welcome back, Operator.</Text>
                <Text style={styles.greetingSubhead}>
                  Your streak is holding. Lock in the next mission and keep the system aligned.
                </Text>
              </View>

              <View style={styles.statusPanel}>
                <Text style={styles.statusLabel}>SYSTEM STATUS</Text>
                <Text style={styles.statusValue}>READY FOR ALIGNMENT</Text>
              </View>

              <View style={styles.metricStack}>
                {METRIC_CARDS.map((card) => (
                  <View key={card.label} style={styles.metricCard}>
                    <View style={[styles.metricAccent, { backgroundColor: card.accent }]} />
                    <View style={styles.metricCopy}>
                      <Text style={styles.metricLabel}>{card.label}</Text>
                      <Text style={styles.metricValue}>{card.value}</Text>
                      <Text style={styles.metricDetail}>{card.detail}</Text>
                    </View>
                  </View>
                ))}
              </View>
            </View>
          </View>

          <View style={[styles.column, styles.centerColumn]}>
            <View style={styles.commandPanel}>
              <Text style={styles.panelLabel}>MISSION DIRECTIVE</Text>
              <Text style={styles.panelTitle}>Create your next focused contract</Text>
              <Text style={styles.panelDescription}>
                Build a short, sharp objective that keeps you on track and aligned with the system.
              </Text>

              <View style={styles.fieldStack}>
                <View style={styles.fieldBlock}>
                  <Text style={styles.fieldLabel}>MISSION GOAL</Text>
                  <TextInput
                    value={missionGoal}
                    onChangeText={setMissionGoal}
                    placeholder="Enter your next mission"
                    placeholderTextColor="#6a7a8d"
                    style={styles.textInput}
                  />
                </View>

                <View style={styles.miniFieldRow}>
                  <View style={styles.miniField}>
                    <Text style={styles.fieldLabel}>DURATION</Text>
                    <TextInput
                      value={missionDuration}
                      onChangeText={setMissionDuration}
                      keyboardType="numeric"
                      placeholder="45"
                      placeholderTextColor="#6a7a8d"
                      style={styles.textInput}
                    />
                  </View>
                  <View style={styles.miniField}>
                    <Text style={styles.fieldLabel}>STAKE</Text>
                    <TextInput
                      value={missionStake}
                      onChangeText={setMissionStake}
                      keyboardType="numeric"
                      placeholder="20"
                      placeholderTextColor="#6a7a8d"
                      style={styles.textInput}
                    />
                  </View>
                </View>
              </View>

              <Pressable
                accessibilityRole="button"
                onPress={handleLockIn}
                style={({ pressed }) => [styles.lockButton, pressed && styles.pressed]}
              >
                <Text style={styles.lockButtonText}>LOCK IT IN</Text>
                <Text style={styles.lockButtonAux}>{`${missionDuration} min · ${missionStake} PP stake`}</Text>
              </Pressable>
            </View>

            <View style={styles.quickActionsPanel}>
              <Text style={styles.panelLabel}>QUICK DEPLOY</Text>
              <View style={styles.quickActionRow}>
                {QUICK_ACTIONS.map((action) => (
                  <Pressable
                    key={action.label}
                    accessibilityRole="button"
                    onPress={() => navigation.navigate(action.route)}
                    style={({ pressed }) => [styles.quickAction, pressed && styles.pressed]}
                  >
                    <Text style={styles.quickActionText}>{action.label}</Text>
                    <View
                      style={[styles.quickAccent, { backgroundColor: action.accent }]}
                    />
                  </Pressable>
                ))}
              </View>
            </View>
          </View>

          <View style={[styles.column, styles.rightColumn]}>
            <View style={styles.snapshotPanel}>
              <Text style={styles.panelLabel}>DAILY SNAPSHOT</Text>
              <Text style={styles.panelTitle}>Current progress and readiness</Text>
              <View style={styles.snapshotList}>
                <View style={styles.snapshotRow}>
                  <Text style={styles.snapshotLabel}>Mission cadence</Text>
                  <Text style={styles.snapshotValue}>Balanced</Text>
                </View>
                <View style={styles.snapshotRow}>
                  <Text style={styles.snapshotLabel}>Today planned</Text>
                  <Text style={styles.snapshotValue}>1 mission</Text>
                </View>
                <View style={styles.snapshotRow}>
                  <Text style={styles.snapshotLabel}>Recovery reserve</Text>
                  <Text style={styles.snapshotValue}>2 stabilizations</Text>
                </View>
              </View>
            </View>

            <View style={styles.bottomNavCard}>
              <Text style={styles.panelLabel}>COMMAND SHORTCUTS</Text>
              <View style={styles.navRow}>
                <Pressable
                  accessibilityRole="button"
                  onPress={() => navigation.navigate('Habits')}
                  style={({ pressed }) => [styles.navButton, pressed && styles.pressed]}
                >
                  <Text style={styles.navLabel}>PROTOCOL</Text>
                </Pressable>
                <Pressable
                  accessibilityRole="button"
                  onPress={() => navigation.navigate('Audio')}
                  style={({ pressed }) => [styles.navButton, pressed && styles.pressed]}
                >
                  <Text style={styles.navLabel}>AUDIO</Text>
                </Pressable>
                <Pressable
                  accessibilityRole="button"
                  onPress={() => navigation.navigate('Profile')}
                  style={({ pressed }) => [styles.navButton, pressed && styles.pressed]}
                >
                  <Text style={styles.navLabel}>PROFILE</Text>
                </Pressable>
              </View>
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
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    opacity: 0.48,
  },
  backdropOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(8, 8, 8, 0.92)',
  },
  scrollContent: {
    paddingTop: 28,
    paddingBottom: 32,
    paddingHorizontal: 20,
  },
  grid: {
    gap: 20,
  },
  gridWide: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  column: {
    gap: 20,
  },
  leftColumn: {
    flex: 0.95,
  },
  centerColumn: {
    flex: 1.2,
  },
  rightColumn: {
    flex: 0.95,
  },
  profilePanel: {
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
    backgroundColor: '#111111',
    borderRadius: 28,
    padding: 24,
    gap: 20,
  },
  brandRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  logoShell: {
    width: 56,
    height: 56,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#161616',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
  },
  logo: {
    width: 36,
    height: 36,
  },
  brandTextWrap: {
    flex: 1,
  },
  eyebrow: {
    color: '#A0A0A0',
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 1.6,
    textTransform: 'uppercase',
  },
  title: {
    color: '#F5F5F5',
    fontSize: 26,
    fontWeight: '800',
    letterSpacing: 1.2,
  },
  greetingBlock: {
    gap: 10,
  },
  greetingHeadline: {
    color: '#F5F5F5',
    fontSize: 24,
    fontWeight: '800',
    lineHeight: 32,
  },
  greetingSubhead: {
    color: '#A0A0A0',
    fontSize: 14,
    lineHeight: 22,
  },
  statusPanel: {
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
    backgroundColor: '#161616',
    borderRadius: 20,
    padding: 18,
  },
  statusLabel: {
    color: '#A0A0A0',
    fontSize: 10,
    letterSpacing: 1.6,
    textTransform: 'uppercase',
  },
  statusValue: {
    marginTop: 6,
    color: '#76FF03',
    fontSize: 15,
    fontWeight: '800',
  },
  metricStack: {
    gap: 12,
  },
  metricCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
    backgroundColor: '#161616',
    borderRadius: 20,
    padding: 16,
  },
  metricAccent: {
    width: 10,
    height: 54,
    borderRadius: 999,
    backgroundColor: '#3A3A3A',
  },
  metricCopy: {
    flex: 1,
  },
  metricLabel: {
    color: '#A0A0A0',
    fontSize: 10,
    letterSpacing: 1.6,
    textTransform: 'uppercase',
  },
  metricValue: {
    color: '#F5F5F5',
    fontSize: 18,
    fontWeight: '800',
    marginTop: 4,
  },
  metricDetail: {
    marginTop: 2,
    color: '#6F6F6F',
    fontSize: 12,
  },
  commandPanel: {
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
    backgroundColor: '#111111',
    borderRadius: 28,
    padding: 26,
    gap: 20,
  },
  panelLabel: {
    color: '#A0A0A0',
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 1.6,
    textTransform: 'uppercase',
  },
  panelTitle: {
    color: '#F5F5F5',
    fontSize: 22,
    fontWeight: '800',
    lineHeight: 30,
  },
  panelDescription: {
    color: '#A0A0A0',
    fontSize: 14,
    lineHeight: 22,
  },
  fieldStack: {
    gap: 16,
  },
  fieldBlock: {
    gap: 10,
  },
  fieldLabel: {
    color: '#A0A0A0',
    fontSize: 11,
    letterSpacing: 1.4,
    textTransform: 'uppercase',
  },
  textInput: {
    color: '#F5F5F5',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
    borderRadius: 18,
    paddingVertical: 16,
    paddingHorizontal: 18,
    fontSize: 14,
    backgroundColor: '#161616',
  },
  miniFieldRow: {
    flexDirection: 'row',
    gap: 14,
  },
  miniField: {
    flex: 1,
    gap: 10,
  },
  lockButton: {
    marginTop: 6,
    paddingVertical: 18,
    borderRadius: 18,
    backgroundColor: '#76FF03',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#76FF03',
    shadowOpacity: 0.18,
    shadowRadius: 18,
    shadowOffset: { width: 0, height: 8 },
    gap: 4,
  },
  lockButtonText: {
    color: '#080808',
    fontSize: 15,
    fontWeight: '900',
    letterSpacing: 1.2,
    textTransform: 'uppercase',
  },
  lockButtonAux: {
    color: '#080808',
    fontSize: 12,
    fontWeight: '700',
  },
  quickActionsPanel: {
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
    backgroundColor: '#111111',
    borderRadius: 28,
    padding: 24,
    gap: 18,
  },
  quickActionRow: {
    flexDirection: 'row',
    gap: 12,
  },
  quickAction: {
    flex: 1,
    minHeight: 100,
    borderRadius: 20,
    padding: 18,
    justifyContent: 'space-between',
    backgroundColor: '#161616',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
  },
  quickActionText: {
    color: '#F5F5F5',
    fontSize: 13,
    fontWeight: '700',
    letterSpacing: 1.2,
  },
  quickAccent: {
    width: 36,
    height: 4,
    borderRadius: 999,
    marginTop: 14,
    backgroundColor: '#3A3A3A',
  },
  snapshotPanel: {
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
    backgroundColor: '#111111',
    borderRadius: 28,
    padding: 24,
    gap: 18,
  },
  snapshotList: {
    gap: 14,
  },
  snapshotRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.06)',
    paddingBottom: 12,
  },
  snapshotLabel: {
    color: '#A0A0A0',
    fontSize: 13,
  },
  snapshotValue: {
    color: '#F5F5F5',
    fontSize: 13,
    fontWeight: '700',
  },
  bottomNavCard: {
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
    backgroundColor: '#111111',
    borderRadius: 28,
    padding: 24,
    gap: 18,
  },
  navRow: {
    flexDirection: 'row',
    gap: 12,
  },
  navButton: {
    flex: 1,
    borderRadius: 18,
    backgroundColor: '#161616',
    paddingVertical: 18,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
  },
  navLabel: {
    color: '#F5F5F5',
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 1.5,
    textTransform: 'uppercase',
  },
  pressed: {
    opacity: 0.92,
    transform: [{ scale: 0.99 }],
  },
});
