// @ts-nocheck
// ────────────────────────────────────────────────────────────────────────────
// PEAKPACT OS — PRODUCTION SYSTEM ARCHITECTURE (APPLE / LINEAR DESIGN SYSTEM)
// ────────────────────────────────────────────────────────────────────────────

import Purchases, { LOG_LEVEL } from "react-native-purchases";
import RevenueCatUI from "react-native-purchases-ui";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { StatusBar } from "expo-status-bar";
import * as Haptics from "expo-haptics";
import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import {
  Animated,
  ActivityIndicator,
  AppState as NativeAppState,
  Easing,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  RefreshControl,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
  Share,
} from "react-native";
import AccessGate from "./src/components/AccessGate";
import BootSequence from "./src/components/BootSequence";
import LanguageSelectionScreen from "./src/components/LanguageSelectionScreen";
import MonetizationPanel from "./src/components/MonetizationPanel";
import {
  buildStructuredVerification,
  submitToVerificationEngine,
  type PactContract,
} from "./src/services/aiService";
import {
  buildComplianceNotice,
  createDefaultComplianceConsent,
  hasRequiredComplianceConsent,
  type ComplianceConsent,
} from "./src/services/complianceService";
import {
  type AccessFormState,
  type AccessMode,
  validateAccessSubmission,
} from "./src/services/accessGate";
import {
  extractOperatorCodename,
  isLiveAuthEnabled,
  isPeakPactEliteOverride,
  restoreOperatorSession,
  signInOperator,
  signOutOperator,
  signUpOperator,
  subscribeToAuthState,
} from "./src/services/authService";
import {
  ensureDevicePremiumTrialStarted,
  getDevicePremiumTrialStatus,
} from "./src/services/deviceTrial";
import {
  getNarrativeProgress,
  getNewlyUnlockedEpisodes,
} from "./src/services/narrativeEngine";
import {
  getActiveProductPlan,
  getFeatureLockMessage,
  getPlanFeatures,
  resolveEffectiveProductPlan,
} from "./src/services/productPlan";
import {
  canAccessFounderPrivileges,
  createClientPayloadSignature,
  getLevelFromXP,
  getXpForPactStake,
  loadUserProfile,
  saveUserProfile,
  syncProgressToSupabase,
} from "./src/services/progressService";
import {
  createVoicePayload,
  startVoiceRecording,
  stopVoiceRecording,
  transcribeAudio,
  uploadVoicePayload,
} from "./src/services/voiceService";
import { formatMissionCountdown } from "./src/services/missionTimer";
import { evaluateDailySweep } from "./src/services/dailySweep";
import {
  applyRecoveryAction,
  applyStatusEffectToReward,
  DAILY_STABILIZATION_COST_PP,
  deriveProtocolArchetype,
  evaluateFocusLockViolation,
  getProtocolStatusEffect,
  getStabilizationUsageState,
} from "./src/services/protocolSystem";
import {
  generateMissionBriefing,
  getConsequencePacket,
  getFirstSessionGuide,
  getProgressionSnapshot,
  getTerminalGlitchEvent,
} from "./src/services/missionSystem";
import {
  getLocalizedText,
  getStoredLanguage,
  getSupportedLanguages,
  setStoredLanguage,
  type SupportedLanguage,
} from "./src/services/i18n";
import { initializeI18n } from "./src/i18n";
import { getTutorialSteps } from "./src/services/tutorialService";
import {
  createSeedSquads,
  createSquad,
  joinSquad,
  leaveSquad,
  sendSquadMessage,
  type Squad,
} from "./src/services/squadSystem";
import {
  loadPersistedAppState,
  savePersistedAppState,
} from "./src/services/appStateStorage";
import {
  getDailyChallenge,
} from "./src/services/eliteLoop";
import {
  getDesignTemplateById,
  getDesignTemplates,
  purchaseDesignTemplate,
  type DesignTemplateId,
} from "./src/services/designTemplates";
import {
  getEntitlementStatus,
  restorePurchases,
} from "./src/services/purchasesService";
import ExecutiveDashboard from "./src/components/ExecutiveDashboard";
import {
  buildExecutionCoachSnapshot,
} from "./src/services/aiExecutionCoach";
import { buildFutureSelfSnapshot } from "./src/services/futureSelfEngine";
import {
  buildAnnualTransformationReport,
  buildMonthlyTransformationReport,
  type TransformationReport,
} from "./src/services/transformationReports";
import {
  recordCrash,
  trackEvent,
  trackRetentionMetrics,
} from "./src/services/telemetryService";

type PactStatus = "ACTIVE" | "ALERT" | "SYNCING" | "REDSTATE";

// DESIGN TOKENS (90% Dark Neutrals, 8% Text, 2% Accent Green)
const BG_COLOR = "#080808";
const SURFACE = "#111111";
const SECONDARY_SURFACE = "#161616";
const BORDER_COLOR = "rgba(255,255,255,0.08)";
const PRIMARY_TEXT = "#F5F5F5";
const SECONDARY_TEXT = "#A0A0A0";
const ACCENT_GREEN = "#9CE22A";
const WARNING_COLOR = "#FFC857";
const DANGER_COLOR = "#FF5252";

const LOCAL_ACCESS_SESSION_KEY = "@peakpact/local-access-session";
const REVENUECAT_API_KEY = process.env.EXPO_PUBLIC_REVENUECAT_API_KEY || "";

type PactLogEntry = {
  id: string;
  text: string;
  result: string;
  pp: number;
  timestamp: string;
  synced: boolean;
  deviceTimestamp?: string;
  signature?: string;
  activePactDeadline?: string;
  extensionsUsed?: number;
};

type AppState = {
  pp: number;
  level: number;
  streak: number;
  xp: number;
  lastPactDate: string;
  activePactDeadline: string;
  extensionsUsed: number;
  status: PactStatus;
  offline: boolean;
  queue: PactLogEntry[];
  terminalLines: string[];
  overseerLines: string[];
  redState: boolean;
  levelFlash: boolean;
  protocolArchetypeName: string;
  protocolArchetypeDescription: string;
  protocolStatusEffect: "NONE" | "DRIFT" | "FRACTURE" | "OVERCLOCK";
  stabilizationUsesToday: number;
  stabilizationResetDate: string;
  flashSuppressed: boolean;
  missionTitle: string;
  missionDescription: string;
  missionRisk: "LOW" | "MEDIUM" | "HIGH";
  missionRewardBonus: number;
  missionTimeWindowMinutes: number;
  missionContractTemplate: string;
  missionRecommendedStake: number;
  activeGlitch: string | null;
  activeContractTask: string | null;
  activeContractStake: number | null;
};

type LocalAccessSession = {
  codename: string;
  email: string;
};

const todayKey = () => new Date().toISOString().slice(0, 10);

const formatTime = () => {
  const now = new Date();
  return now.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
};

const createInitialState = (): AppState => ({
  pp: 120,
  level: 3,
  streak: 6,
  xp: 1500,
  lastPactDate: todayKey(),
  activePactDeadline: new Date(Date.now() + 60 * 60 * 1000).toISOString(),
  extensionsUsed: 0,
  status: "ACTIVE" as PactStatus,
  offline: false,
  queue: [],
  terminalLines: [
    "> PEAKPACT OS INITIALIZED.",
    "> DISCIPLINE PROTOCOL ACTIVE.",
  ],
  overseerLines: [
    "> OVERSIGHT ACTIVE.",
  ],
  redState: false,
  levelFlash: false,
  protocolArchetypeName: "ADAPTIVE PILOT",
  protocolArchetypeDescription: "A flexible protocol runner whose behavior shifts with the current pressure.",
  protocolStatusEffect: "NONE" as const,
  stabilizationUsesToday: 0,
  stabilizationResetDate: todayKey(),
  flashSuppressed: false,
  missionTitle: "DEEP WORK SESSION",
  missionDescription: "A clean mission designed to deepen the current contract.",
  missionRisk: "LOW" as const,
  missionRewardBonus: 3,
  missionTimeWindowMinutes: 20,
  missionContractTemplate: "Complete a 30 minute focused execution block and produce a measurable result.",
  missionRecommendedStake: 12,
  activeGlitch: null,
  activeContractTask: null,
  activeContractStake: null,
});

const evaluatePact = (text: string, contract?: PactContract) => {
  const result = buildStructuredVerification(text, contract);
  return {
    verified: result.verified,
    pp: result.pp_awarded,
    response: result.terminal_response,
    severity: result.severity,
    attributeScale: result.attribute_scale,
  };
};

type AppTab = "PACT" | "SQUAD" | "STORE" | "PROFILE" | "SYSTEM";

const _tabBarSS = StyleSheet.create({
  bar: {
    flexDirection: "row",
    backgroundColor: SURFACE,
    borderTopWidth: 1,
    borderTopColor: BORDER_COLOR,
  },
  item: { flex: 1, alignItems: "center", paddingVertical: 14 },
  lbl: {
    fontFamily: "-apple-system, system-ui, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
    fontSize: 11,
    fontWeight: "600",
    letterSpacing: 0.8,
  },
});

function TabBar({
  active,
  onPress,
  accent,
  tabs,
}: {
  active: AppTab;
  onPress: (t: AppTab) => void;
  accent: string;
  tabs: { id: AppTab; label: string }[];
}) {
  return (
    <View style={_tabBarSS.bar}>
      {tabs.map((tab) => (
        <Pressable
          key={tab.id}
          style={({ pressed }) => [
            _tabBarSS.item,
            pressed ? { opacity: 0.8, transform: [{ scale: 0.98 }] } : null,
          ]}
          onPress={() => onPress(tab.id)}
        >
          <Text
            style={[
              _tabBarSS.lbl,
              { color: active === tab.id ? accent : SECONDARY_TEXT },
            ]}
          >
            {tab.label}
          </Text>
        </Pressable>
      ))}
    </View>
  );
}

const _sectionSS = StyleSheet.create({
  box: {
    padding: 20,
    marginBottom: 16,
    backgroundColor: SURFACE,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: BORDER_COLOR,
  },
  title: {
    fontSize: 18,
    fontWeight: "600",
    color: PRIMARY_TEXT,
    marginBottom: 6,
  },
  body: {
    color: SECONDARY_TEXT,
    fontSize: 14,
    lineHeight: 20,
  },
});

function SectionIntro({ intro, accent }: { intro: { title: string; body: string }; accent: string }) {
  return (
    <View style={_sectionSS.box}>
      <Text style={[_sectionSS.title, { color: accent }]}>{intro.title}</Text>
      <Text style={_sectionSS.body}>{intro.body}</Text>
    </View>
  );
}

const _tutSS = StyleSheet.create({
  overlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(0,0,0,0.85)",
    justifyContent: "center",
    alignItems: "center",
    zIndex: 9999,
    padding: 24,
  },
  card: {
    width: "100%",
    maxWidth: 400,
    borderRadius: 24,
    padding: 24,
    backgroundColor: SURFACE,
    borderWidth: 1,
    borderColor: BORDER_COLOR,
  },
  topRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  stepCt: {
    color: SECONDARY_TEXT,
    fontSize: 12,
    fontWeight: "500",
  },
  skip: { fontSize: 12, fontWeight: "500", color: SECONDARY_TEXT },
  progRow: { flexDirection: "row", marginBottom: 20 },
  progDot: { flex: 1, height: 4, borderRadius: 2, marginRight: 6 },
  title: {
    fontSize: 20,
    fontWeight: "700",
    color: PRIMARY_TEXT,
    marginBottom: 12,
  },
  body: {
    color: SECONDARY_TEXT,
    fontSize: 14,
    lineHeight: 22,
    marginBottom: 20,
  },
  hint: { backgroundColor: SECONDARY_SURFACE, borderRadius: 12, padding: 14, marginBottom: 24 },
  hintTxt: {
    fontSize: 12,
    fontWeight: "500",
    color: PRIMARY_TEXT,
  },
  actions: { flexDirection: "row" },
  btnBack: {
    flex: 1,
    backgroundColor: SECONDARY_SURFACE,
    borderRadius: 16,
    paddingVertical: 14,
    alignItems: "center",
    marginRight: 12,
  },
  btnBkTxt: {
    color: PRIMARY_TEXT,
    fontSize: 14,
    fontWeight: "600",
  },
  btnNext: {
    flex: 2,
    borderRadius: 16,
    paddingVertical: 14,
    alignItems: "center",
  },
  btnNxTxt: {
    color: "#000000",
    fontSize: 14,
    fontWeight: "700",
  },
});

function TutorialOverlay({
  step,
  accent,
  onNext,
  onPrev,
  onSkip,
  steps,
  language,
}: {
  step: number;
  accent: string;
  onNext: () => void;
  onPrev: () => void;
  onSkip: () => void;
  steps: Array<{ title: string; body: string; hint: string; tab: string }>;
  language: string;
}) {
  const current = steps[step];
  if (!current) return null;
  return (
    <View style={_tutSS.overlay}>
      <View style={_tutSS.card}>
        <View style={_tutSS.topRow}>
          <Text style={_tutSS.stepCt}>
            {getLocalizedText("tutorialStepLabel", language)} {step + 1} / {steps.length}
          </Text>
          <Pressable onPress={onSkip}>
            <Text style={_tutSS.skip}>
              {getLocalizedText("tutorialSkipLabel", language)}
            </Text>
          </Pressable>
        </View>
        <View style={_tutSS.progRow}>
          {steps.map((_, i) => (
            <View
              key={i}
              style={[
                _tutSS.progDot,
                { backgroundColor: i <= step ? accent : SECONDARY_SURFACE },
              ]}
            />
          ))}
        </View>
        <Text style={_tutSS.title}>{current.title}</Text>
        <Text style={_tutSS.body}>{current.body}</Text>
        <View style={_tutSS.hint}>
          <Text style={_tutSS.hintTxt}>{current.hint}</Text>
        </View>
        <View style={_tutSS.actions}>
          {step > 0 ? (
            <Pressable style={_tutSS.btnBack} onPress={onPrev}>
               <Text style={_tutSS.btnBkTxt}>{getLocalizedText("tutorialBackLabel", language)}</Text>
            </Pressable>
          ) : <View style={{flex: 1}} />}
          <Pressable
            style={[_tutSS.btnNext, { backgroundColor: accent }]}
            onPress={onNext}
          >
            <Text style={_tutSS.btnNxTxt}>
              {step === steps.length - 1 ? getLocalizedText("tutorialCompleteLabel", language) : getLocalizedText("tutorialNextLabel", language)}
            </Text>
          </Pressable>
        </View>
      </View>
    </View>
  );
}

export default function App() {
  const basePlan = getActiveProductPlan();
  const [state, setState] = useState<AppState>(createInitialState);
  const [authBooting, setAuthBooting] = useState(true);
  const [accessGranted, setAccessGranted] = useState(false);
  const [accessMode, setAccessMode] = useState<AccessMode>("SIGN_IN");
  const [accessForm, setAccessForm] = useState<AccessFormState>({
    codename: "",
    email: "",
    password: "",
  });
  const [operatorCodename, setOperatorCodename] = useState("OPERATOR");
  const [activeUserEmail, setActiveUserEmail] = useState<string | null>(null);
  const [activeUserId, setActiveUserId] = useState<string | null>(null);
  const [accessError, setAccessError] = useState<string | null>(null);
  const [accessBusy, setAccessBusy] = useState(false);
  const [draft, setDraft] = useState(
    "System, I completed a 45-minute heavy lifting session.",
  );
  const [isRecording, setIsRecording] = useState(false);
  const [statusMessage, setStatusMessage] = useState("SYSTEM READY");
  const [showMonetization, setShowMonetization] = useState(false);
  const [onboardingSeen, setOnboardingSeen] = useState(false);
  const [language, setLanguage] = useState<SupportedLanguage>("en");
  const [languageGateVisible, setLanguageGateVisible] = useState(true);
  const [languageBootstrapped, setLanguageBootstrapped] = useState(false);
  
  const translate = useCallback(
    (key: string) => getLocalizedText(key, language),
    [language],
  );

  const appTabs = useMemo(
    () => [
      { id: "PACT" as const, label: translate("tabPact") },
      { id: "SQUAD" as const, label: translate("tabSquad") },
      { id: "STORE" as const, label: translate("tabStore") },
      { id: "PROFILE" as const, label: translate("tabProfile") },
      { id: "SYSTEM" as const, label: translate("tabSystem") },
    ],
    [translate],
  );

  const tabIntros = useMemo(
    () => ({
      PACT: { title: translate("introPactTitle"), body: translate("introPactBody") },
      SQUAD: { title: translate("introSquadTitle"), body: translate("introSquadBody") },
      STORE: { title: translate("introStoreTitle"), body: translate("introStoreBody") },
      PROFILE: { title: translate("introProfileTitle"), body: translate("introProfileBody") },
      SYSTEM: { title: translate("introSystemTitle"), body: translate("introSystemBody") },
    }),
    [translate],
  );

  const [hasHydratedPersistence, setHasHydratedPersistence] = useState(false);
  const [deviceTrialStartedAt, setDeviceTrialStartedAt] = useState<string | null>(null);
  const [ownedDesignTemplates, setOwnedDesignTemplates] = useState<DesignTemplateId[]>(["core"]);
  const [selectedDesignTemplateId, setSelectedDesignTemplateId] = useState<DesignTemplateId>("core");
  const [templateMessage, setTemplateMessage] = useState<string | null>(null);
  const [trialClockMs, setTrialClockMs] = useState(Date.now());
  const [contractTask, setContractTask] = useState("Complete a focused 45-minute study sprint");
  const [contractDuration, setContractDuration] = useState("45");
  const [contractStake, setContractStake] = useState("20");
  const [complianceConsent, setComplianceConsent] = useState<ComplianceConsent>(createDefaultComplianceConsent());
  const [missionCountdown, setMissionCountdown] = useState(formatMissionCountdown(createInitialState().activePactDeadline));
  const [squads, setSquads] = useState<Squad[]>(() => createSeedSquads());
  const [squadName, setSquadName] = useState("");
  const [squadDescription, setSquadDescription] = useState("");
  const [squadFocus, setSquadFocus] = useState("Study and recovery");
  const [squadGoal, setSquadGoal] = useState("Complete 5 shared missions this week");
  const [squadVisibility, setSquadVisibility] = useState<"PUBLIC" | "PRIVATE">("PUBLIC");
  const [squadJoinCode, setSquadJoinCode] = useState("");
  const [squadChatText, setSquadChatText] = useState("");
  const [activeSquadId, setActiveSquadId] = useState<string | null>(null);
  const [leaveSquadConfirmOpen, setLeaveSquadConfirmOpen] = useState(false);
  const [militaryTime, setMilitaryTime] = useState("00:00:00");
  const [missionsCreatedToday, setMissionsCreatedToday] = useState(0);
  const [missionsCompletedToday, setMissionsCompletedToday] = useState(0);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [successToastLabel, setSuccessToastLabel] = useState<string | null>(null);
  const [hasPremiumEntitlement, setHasPremiumEntitlement] = useState(false);
  
  const isWeb = Platform.OS === "web";
  const [bootReady, setBootReady] = useState<boolean | null>(null);
  const [activeTab, setActiveTab] = useState<AppTab>("PACT");
  const [pactFlowMode, setPactFlowMode] = useState<"planning" | "execution">("planning");
  const [executionCountdown, setExecutionCountdown] = useState(5);
  const [tutorialStep, setTutorialStep] = useState<number | null>(null);
  const [tutorialCompleted, setTutorialCompleted] = useState(false);
  const tutorialSteps = useMemo(() => getTutorialSteps(language), [language]);
  const mainScrollRef = useRef<ScrollView>(null);
  const [leaveSquadCountdown, setLeaveSquadCountdown] = useState(0);
  const leaveSquadPulse = useRef(new Animated.Value(1)).current;
  const tabTransition = useRef(new Animated.Value(1)).current;
  const successToastAnim = useRef(new Animated.Value(0)).current;

  const eliteOverrideActive = isPeakPactEliteOverride(activeUserEmail, activeUserId);
  const founderPrivilegesActive = useMemo(
    () => canAccessFounderPrivileges({ level: state.level, pp: state.pp }) || eliteOverrideActive,
    [state.level, state.pp, eliteOverrideActive],
  );

  const deviceTrialStatus = useMemo(
    () => getDevicePremiumTrialStatus(deviceTrialStartedAt, trialClockMs),
    [deviceTrialStartedAt, trialClockMs],
  );

  const activePlan = useMemo(
    () => resolveEffectiveProductPlan(basePlan, deviceTrialStatus.active || hasPremiumEntitlement),
    [basePlan, deviceTrialStatus.active, hasPremiumEntitlement],
  );

  const effectivePlan = eliteOverrideActive ? "PREMIUM" : activePlan;
  const planFeatures = useMemo(() => getPlanFeatures(effectivePlan), [effectivePlan]);

  const coachSnapshot = useMemo(
    () =>
      buildExecutionCoachSnapshot({
        streak: state.streak,
        level: state.level,
        xp: state.xp,
        missionsCreatedToday,
        missionsCompletedToday,
        squadsCount: squads.length,
        redState: state.redState,
      }),
    [
      state.streak,
      state.level,
      state.xp,
      missionsCreatedToday,
      missionsCompletedToday,
      squads.length,
      state.redState,
    ],
  );

  const futureSelfSnapshot = useMemo(
    () =>
      buildFutureSelfSnapshot({
        currentIdentity: coachSnapshot.currentIdentity,
        level: state.level,
        streak: state.streak,
        disciplineScore: coachSnapshot.disciplineScore,
      }),
    [coachSnapshot.currentIdentity, coachSnapshot.disciplineScore, state.level, state.streak],
  );

  const monthlyReport = useMemo(
    () =>
      buildMonthlyTransformationReport({
        codename: operatorCodename,
        coach: coachSnapshot,
        future: futureSelfSnapshot,
      }),
    [operatorCodename, coachSnapshot, futureSelfSnapshot],
  );

  const annualReport = useMemo(
    () =>
      buildAnnualTransformationReport({
        codename: operatorCodename,
        coach: coachSnapshot,
        future: futureSelfSnapshot,
      }),
    [operatorCodename, coachSnapshot, futureSelfSnapshot],
  );

  const firstSessionGuide = useMemo(() => getFirstSessionGuide(language), [language]);

  const [protocolArchetype, setProtocolArchetype] = useState(() =>
    deriveProtocolArchetype({
      pp: createInitialState().pp,
      streak: createInitialState().streak,
      redState: createInitialState().redState,
      overclockCount: 0,
      extensionsUsed: createInitialState().extensionsUsed,
    }),
  );

  const progressionView = useMemo(
    () =>
      getProgressionSnapshot(
        {
          pp: state.pp,
          streak: state.streak,
          redState: state.redState,
          overclockCount: state.extensionsUsed,
          protocolArchetypeName: state.protocolArchetypeName,
          protocolStatusEffect: state.protocolStatusEffect,
          level: state.level,
          xp: state.xp,
        },
        language,
      ),
    [
      state.pp,
      state.streak,
      state.redState,
      state.extensionsUsed,
      state.protocolArchetypeName,
      state.protocolStatusEffect,
      state.level,
      state.xp,
      language,
    ],
  );

  const stabilizationUsage = useMemo(
    () => getStabilizationUsageState({
      usedToday: state.stabilizationUsesToday,
      resetDate: state.stabilizationResetDate,
      now: new Date(),
    }),
    [state.stabilizationUsesToday, state.stabilizationResetDate],
  );

  const stabilizationCost = eliteOverrideActive ? 0 : DAILY_STABILIZATION_COST_PP;
  const recoveryButtonLabel = useMemo(() => {
    if (!state.redState) return "RECOVER";
    if (!stabilizationUsage.canUse) return "RECOVERY LOCKED";
    if (!eliteOverrideActive && state.pp < stabilizationCost) return "INSUFFICIENT PP";
    return `RECOVER (${stabilizationCost === 0 ? "FREE" : `${stabilizationCost} PP`})`;
  }, [state.redState, stabilizationUsage.canUse, eliteOverrideActive, state.pp, stabilizationCost]);

  const triggerPactFeedback = useCallback((kind: "impact" | "notify") => {
    if (Platform.OS === "web") return;
    if (kind === "notify") {
      void Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    } else {
      void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    }
  }, []);

  const animateSuccessToast = useCallback((label: string) => {
    setSuccessToastLabel(label);
    successToastAnim.setValue(0);
    Animated.sequence([
      Animated.timing(successToastAnim, {
        toValue: 1,
        duration: 220,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),
      Animated.delay(1000),
      Animated.timing(successToastAnim, {
        toValue: 0,
        duration: 220,
        easing: Easing.in(Easing.cubic),
        useNativeDriver: true,
      }),
    ]).start(() => setSuccessToastLabel(null));
  }, [successToastAnim]);

  const handlePullRefresh = useCallback(async () => {
    setIsRefreshing(true);
    setTrialClockMs(Date.now());
    setMissionCountdown(formatMissionCountdown(state.activePactDeadline));
    setStatusMessage("SYSTEM REFRESHED");
    triggerPactFeedback("impact");
    await new Promise((resolve) => setTimeout(resolve, 380));
    setIsRefreshing(false);
  }, [state.activePactDeadline, triggerPactFeedback]);

  useEffect(() => {
    tabTransition.setValue(0.92);
    Animated.timing(tabTransition, {
      toValue: 1,
      duration: 220,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: true,
    }).start();
  }, [activeTab, tabTransition]);

  useEffect(() => {
    const successStates = [
      "PERSISTED TO SUPABASE",
      "QUEUE SYNCED",
      "PREMIUM RESTORED",
      "RECOVERY COMPLETE",
      "VOICE TRANSCRIBED",
    ];
    if (successStates.includes(statusMessage)) {
      animateSuccessToast(statusMessage);
      triggerPactFeedback("notify");
    }
  }, [statusMessage, animateSuccessToast, triggerPactFeedback]);

  const toggleMonetization = async () => {
    void trackEvent("premium_viewed", { tab: activeTab, plan: effectivePlan });
    try {
      await RevenueCatUI.presentPaywall();
      void trackEvent("premium_started", { plan: effectivePlan });
    } catch (error) {
      console.error("Paywall Error:", error);
      void recordCrash("purchase_failure", {
        location: "toggleMonetization",
        message: error instanceof Error ? error.message : String(error),
      });
      setShowMonetization((previous) => !previous);
    }
  };

  const handleRestorePremium = async () => {
    try {
      const result = await restorePurchases();
      if (result.isEntitled) {
        setHasPremiumEntitlement(true);
        void trackEvent("premium_restored", {
          activeProductCount: result.activeProductIds.length,
        });
        setStatusMessage("PREMIUM RESTORED");
        triggerPactFeedback("notify");
      } else {
        setStatusMessage(result.message.toUpperCase());
      }
    } catch (error) {
      void recordCrash("purchase_failure", {
        location: "handleRestorePremium",
        message: error instanceof Error ? error.message : String(error),
      });
      setStatusMessage("RESTORE FAILED");
      triggerPactFeedback("impact");
    }
  };

  useEffect(() => {
    const setupRevenueCat = async () => {
      try {
        Purchases.setLogLevel(LOG_LEVEL.DEBUG);
        if (Platform.OS === "android" || Platform.OS === "ios") {
          if (!REVENUECAT_API_KEY) {
            console.warn("RevenueCat API key is missing. Set EXPO_PUBLIC_REVENUECAT_API_KEY.");
            return;
          }
          await Purchases.configure({ apiKey: REVENUECAT_API_KEY });

          const entitlementStatus = await getEntitlementStatus();
          if (entitlementStatus.isEntitled) {
            setHasPremiumEntitlement(true);
          }
        }
      } catch (error) {
        console.error("RevenueCat Init Error:", error);
        void recordCrash("purchase_failure", {
          location: "setupRevenueCat",
          message: error instanceof Error ? error.message : String(error),
        });
      }
    };
    setupRevenueCat();
  }, []);

  useEffect(() => {
    void trackRetentionMetrics({
      dayCount: state.streak,
      streak: state.streak,
      level: state.level,
    });
  }, [state.streak, state.level]);

  useEffect(() => {
    const hydrateAccessSession = async () => {
      if (!isLiveAuthEnabled()) {
        try {
          const storedSession = await AsyncStorage.getItem(LOCAL_ACCESS_SESSION_KEY);
          if (storedSession) {
            const parsedSession = JSON.parse(storedSession) as LocalAccessSession;
            setOperatorCodename(parsedSession.codename || "OPERATOR");
            setActiveUserEmail(parsedSession.email || null);
            setActiveUserId(null);
            setAccessForm((prev) => ({
              ...prev,
              email: parsedSession.email || prev.email,
              password: "",
            }));
            setAccessGranted(true);
            setStatusMessage("LOCAL ACCESS RESTORED");
          } else {
            setStatusMessage("LOCAL AUTHORITY MODE");
          }
        } catch {
          setStatusMessage("LOCAL AUTHORITY MODE");
        }
        setAuthBooting(false);
        return;
      }

      const session = await restoreOperatorSession();
      if (session?.user) {
        setOperatorCodename(extractOperatorCodename(session.user, session.user.email));
        setAccessForm((prev) => ({
          ...prev,
          email: session.user?.email ?? prev.email,
          password: "",
        }));
        setAccessGranted(true);
        setStatusMessage("ACCESS RESTORED");
      }
      setAuthBooting(false);
    };

    hydrateAccessSession();

    const subscription = subscribeToAuthState((_event, session) => {
      if (session?.user) {
        setAccessGranted(true);
        setOperatorCodename(extractOperatorCodename(session.user, session.user.email));
        setAccessForm((prev) => ({
          ...prev,
          email: session.user?.email ?? prev.email,
          password: "",
        }));
        return;
      }
      setAccessGranted(false);
    });

    const appStateSubscription = NativeAppState.addEventListener("change", (nextState) => {
      if (!isLiveAuthEnabled()) return;
      if (nextState === "active") {
        void restoreOperatorSession();
        return;
      }
      if (nextState === "background" && state.activePactDeadline && Date.parse(state.activePactDeadline) > Date.now()) {
        const violation = evaluateFocusLockViolation({
          appState: "background",
          activeContract: true,
          hasRedState: state.redState,
        });

        if (violation.penaltyPP > 0) {
          setState((prev) => ({
            ...prev,
            pp: Math.max(0, prev.pp - violation.penaltyPP),
            streak: 0,
            status: "REDSTATE" as PactStatus,
            redState: true,
            levelFlash: true,
            terminalLines: [...prev.terminalLines, violation.terminalLine].slice(-14),
            overseerLines: [...prev.overseerLines, "> DIGITAL OVERRIDE. FOCUS LOCK BREACH."].slice(-8),
          }));
          setStatusMessage("DIGITAL OVERRIDE / CONTRACT VOIDED");
        }
      }
    });

    return () => {
      subscription.unsubscribe();
      appStateSubscription.remove();
    };
  }, [state.activePactDeadline, state.redState]);

  useEffect(() => {
    if (!accessGranted) return;
    let isActive = true;
    const bootstrapDeviceTrial = async () => {
      const startedAt = await ensureDevicePremiumTrialStarted(AsyncStorage);
      if (isActive) {
        setDeviceTrialStartedAt(startedAt);
        setTrialClockMs(Date.now());
      }
    };
    void bootstrapDeviceTrial();
    return () => {
      isActive = false;
    };
  }, [accessGranted]);

  useEffect(() => {
    if (!accessGranted) return;
    const interval = setInterval(() => {
      setTrialClockMs(Date.now());
    }, 60000);
    return () => clearInterval(interval);
  }, [accessGranted]);

  useEffect(() => {
    if (!state.levelFlash) return;
    const timer = setTimeout(() => {
      setState((prev) => ({ ...prev, levelFlash: false }));
    }, 1200);
    return () => clearTimeout(timer);
  }, [state.levelFlash]);

  useEffect(() => {
    const updateClock = () => {
      const now = new Date();
      const h = String(now.getHours()).padStart(2, "0");
      const m = String(now.getMinutes()).padStart(2, "0");
      const s = String(now.getSeconds()).padStart(2, "0");
      setMilitaryTime(`${h}:${m}:${s}`);
    };
    updateClock();
    const id = setInterval(updateClock, 1000);
    return () => clearInterval(id);
  }, []);

  useEffect(() => {
    if (!leaveSquadConfirmOpen) {
      setLeaveSquadCountdown(0);
      return;
    }
    setLeaveSquadCountdown(3);
    const countdown = setInterval(() => {
      setLeaveSquadCountdown((previous) => (previous > 0 ? previous - 1 : 0));
    }, 1000);

    const pulseAnimation = Animated.loop(
      Animated.sequence([
        Animated.timing(leaveSquadPulse, { toValue: 1.02, duration: 260, useNativeDriver: true }),
        Animated.timing(leaveSquadPulse, { toValue: 0.98, duration: 260, useNativeDriver: true }),
      ]),
    );
    pulseAnimation.start();

    return () => {
      clearInterval(countdown);
      pulseAnimation.stop();
    };
  }, [leaveSquadConfirmOpen, leaveSquadPulse]);

  useEffect(() => {
    const interval = setInterval(() => {
      const nextDayKey = todayKey();
      setState((prev) => {
        if (prev.stabilizationResetDate === nextDayKey) return prev;
        return {
          ...prev,
          stabilizationUsesToday: 0,
          stabilizationResetDate: nextDayKey,
          flashSuppressed: false,
        };
      });

      const nextCountdown = formatMissionCountdown(state.activePactDeadline);
      setMissionCountdown(nextCountdown);

      if (nextCountdown === "00:00:00" && !state.redState && !state.offline) {
        const consequence = getConsequencePacket(
          "TIMER_EXPIRED",
          {
            pp: state.pp,
            streak: state.streak,
            redState: state.redState,
            overclockCount: state.extensionsUsed,
            protocolArchetypeName: state.protocolArchetypeName,
            protocolStatusEffect: state.protocolStatusEffect,
          },
          language,
        );
        setState((prev) => ({
          ...prev,
          pp: eliteOverrideActive ? prev.pp : Math.max(0, prev.pp - 25),
          streak: 0,
          status: "REDSTATE" as PactStatus,
          redState: true,
          levelFlash: true,
          activeContractTask: null,
          activeContractStake: null,
          terminalLines: [...prev.terminalLines, consequence.terminalLine].slice(-14),
          overseerLines: [...prev.overseerLines, consequence.overseerLine].slice(-8),
        }));
        setStatusMessage(consequence.statusLine);
      }
    }, 1000);
    return () => clearInterval(interval);
  }, [state.activePactDeadline, state.offline, state.redState, eliteOverrideActive, language]);

  useEffect(() => {
    const nextArchetype = deriveProtocolArchetype({
      pp: state.pp,
      streak: state.streak,
      redState: state.redState,
      overclockCount: state.extensionsUsed,
      extensionsUsed: state.extensionsUsed,
    });
    const nextEffect = getProtocolStatusEffect({
      pp: state.pp,
      streak: state.streak,
      redState: state.redState,
      overclockCount: state.extensionsUsed,
      extensionsUsed: state.extensionsUsed,
    });
    const nextBriefing = generateMissionBriefing(
      {
        pp: state.pp,
        streak: state.streak,
        redState: state.redState,
        overclockCount: state.extensionsUsed,
        protocolArchetypeName: nextArchetype.name,
        protocolStatusEffect: nextEffect,
      },
      language,
    );
    const nextGlitch = getTerminalGlitchEvent(
      {
        pp: state.pp,
        streak: state.streak,
        redState: state.redState,
        overclockCount: state.extensionsUsed,
        protocolArchetypeName: nextArchetype.name,
        protocolStatusEffect: nextEffect,
      },
      language,
    );

    setProtocolArchetype(nextArchetype);
    setState((prev) => ({
      ...prev,
      protocolArchetypeName: nextArchetype.name,
      protocolArchetypeDescription: nextArchetype.description,
      protocolStatusEffect: nextEffect,
      missionTitle: nextBriefing.title,
      missionDescription: nextBriefing.description,
      missionRisk: nextBriefing.risk,
      missionRewardBonus: nextBriefing.rewardBonus,
      missionTimeWindowMinutes: nextBriefing.timeWindowMinutes,
      missionContractTemplate: nextBriefing.contractTemplate,
      missionRecommendedStake: nextBriefing.recommendedStake,
      activeGlitch: nextGlitch ? nextGlitch.title : null,
    }));
  }, [state.pp, state.streak, state.redState, state.extensionsUsed, language]);

  useEffect(() => {
    const hydrateLanguage = async () => {
      const stored = await getStoredLanguage();
      const persisted = await loadPersistedAppState();
      const resolved = persisted?.language || stored;
      setLanguage(resolved);

      if (persisted) {
        setOnboardingSeen(persisted.onboardingSeen);
        setSquads(persisted.squads.length > 0 ? persisted.squads : createSeedSquads());
        setActiveSquadId(persisted.activeSquadId);
        setOwnedDesignTemplates(
          persisted.ownedDesignTemplates.length > 0 ? persisted.ownedDesignTemplates : ["core"],
        );
        setSelectedDesignTemplateId(persisted.selectedDesignTemplateId ?? "core");
      }

      setLanguageBootstrapped(true);
      setHasHydratedPersistence(true);
    };
    void hydrateLanguage();
  }, []);

  const finalizeLanguageSelection = useCallback(async () => {
    await initializeI18n();
    await setStoredLanguage(language);
    setLanguageGateVisible(false);
    setStatusMessage(getLocalizedText("languageSaved", language));
  }, [language]);

  useEffect(() => {
    if (!hasHydratedPersistence) return;
    void savePersistedAppState({
      onboardingSeen,
      language,
      squads,
      activeSquadId,
      ownedDesignTemplates,
      selectedDesignTemplateId,
    });
  }, [
    hasHydratedPersistence,
    onboardingSeen,
    language,
    squads,
    activeSquadId,
    ownedDesignTemplates,
    selectedDesignTemplateId,
  ]);

  useEffect(() => {
    const hydrateProfile = async () => {
      const profile = await loadUserProfile();
      if (!profile) return;

      setState((prev) => ({
        ...prev,
        pp: profile.pp,
        level: profile.level,
        xp: profile.xp ?? 0,
        streak: profile.streak,
        lastPactDate: profile.last_pact_date || prev.lastPactDate,
        activePactDeadline: profile.active_pact_deadline || prev.activePactDeadline,
        extensionsUsed: profile.extensions_used ?? prev.extensionsUsed,
        redState: profile.red_state,
        status: profile.red_state ? ("REDSTATE" as PactStatus) : prev.status,
        terminalLines: [...prev.terminalLines, "> PROFILE SYNCED."].slice(-14),
      }));
    };
    hydrateProfile();
  }, []);

  useEffect(() => {
    const today = todayKey();
    if (state.lastPactDate === today) return;

    const sweep = evaluateDailySweep({
      lastPactDate: state.lastPactDate,
      today,
      currentRedState: state.redState,
    });
    const consequence = getConsequencePacket(
      sweep.redState ? "DAILY_SWEEP_LOCK" : "DAILY_SWEEP_WARNING",
      {
        pp: state.pp,
        streak: state.streak,
        redState: state.redState,
        overclockCount: state.extensionsUsed,
        protocolArchetypeName: state.protocolArchetypeName,
        protocolStatusEffect: state.protocolStatusEffect,
      },
      language,
    );

    setState((prev) => ({
      ...prev,
      pp: eliteOverrideActive ? prev.pp : Math.max(0, prev.pp - sweep.penalty),
      streak: sweep.penalty > 0 ? Math.max(0, prev.streak - 1) : prev.streak,
      lastPactDate: sweep.lastPactDate,
      status: sweep.status as PactStatus,
      redState: sweep.redState,
      levelFlash: false,
      activeContractTask: null,
      activeContractStake: null,
      terminalLines: [
        ...prev.terminalLines,
        `> DAILY SWEEP: -${sweep.penalty} PP.`,
        consequence.terminalLine,
      ].slice(-14),
      overseerLines: [...prev.overseerLines, consequence.overseerLine].slice(-8),
    }));
    setStatusMessage(consequence.statusLine);
  }, [state.lastPactDate, eliteOverrideActive, language, state.pp, state.streak, state.redState, state.extensionsUsed, state.protocolArchetypeName, state.protocolStatusEffect]);

  useEffect(() => {
    const persist = async () => {
      const profile = {
        user_id: activeUserId ?? "local-user",
        level: state.level,
        pp: state.pp,
        streak: state.streak,
        xp: state.xp,
        red_state: state.redState,
        last_pact_date: state.lastPactDate,
        active_pact_deadline: state.activePactDeadline,
        extensions_used: state.extensionsUsed,
        updated_at: new Date().toISOString(),
      };
      await saveUserProfile(profile);
    };
    persist();
  }, [
    state.level,
    state.pp,
    state.streak,
    state.xp,
    state.redState,
    state.lastPactDate,
    state.activePactDeadline,
    state.extensionsUsed,
    activeUserId,
  ]);

  const queueCount = useMemo(() => state.queue.length, [state.queue.length]);

  const appendLine = (line: string) => {
    setState((prev) => ({
      ...prev,
      terminalLines: [...prev.terminalLines, line].slice(-14),
    }));
  };

  const updateAccessField = (field: keyof AccessFormState, value: string) => {
    setAccessForm((prev) => ({ ...prev, [field]: value }));
    if (accessError) setAccessError(null);
  };

  const submitAccessRequest = async () => {
    const validation = validateAccessSubmission(accessMode, accessForm);
    if (!validation.ok) {
      setAccessError(validation.message);
      setStatusMessage("ACCESS DENIED");
      return;
    }

    if (!isLiveAuthEnabled()) {
      try {
        const normalizedEmail = validation.normalizedEmail || accessForm.email.trim().toLowerCase();
        const normalizedCodename = validation.normalizedCodename || accessForm.email.trim().split("@")[0].toUpperCase() || "OPERATOR";
        await AsyncStorage.setItem(
          LOCAL_ACCESS_SESSION_KEY,
          JSON.stringify({ codename: normalizedCodename, email: normalizedEmail }),
        );
        setOperatorCodename(normalizedCodename);
        setAccessError(null);
        setStatusMessage("LOCAL ACCESS GRANTED");
        setAccessGranted(true);
        setAccessForm((prev) => ({ ...prev, password: "" }));
        appendLine(`> OPERATOR ${normalizedCodename} AUTHORIZED.`);
      } catch {
        setAccessError("LOCAL ACCESS WRITE FAILED.");
        setStatusMessage("LOCAL AUTH FAILURE");
      }
      return;
    }

    try {
      setAccessBusy(true);
      const normalizedEmail = validation.normalizedEmail || accessForm.email.trim().toLowerCase();
      const normalizedCodename = validation.normalizedCodename || accessForm.email.trim().split("@")[0].toUpperCase() || "OPERATOR";
      const result = accessMode === "SIGN_UP"
        ? await signUpOperator({ email: normalizedEmail, password: accessForm.password.trim(), codename: normalizedCodename })
        : await signInOperator({ email: normalizedEmail, password: accessForm.password.trim() });

      if (!result.ok) {
        setAccessError(result.message);
        setStatusMessage("ACCESS DENIED");
        return;
      }

      setOperatorCodename(extractOperatorCodename(result.user, normalizedEmail));
      setActiveUserEmail(normalizedEmail);
      setActiveUserId(result.user?.id ?? null);
      setAccessError(null);
      setStatusMessage(result.message);
      setAccessGranted(!result.requiresEmailConfirmation);
      if (!result.requiresEmailConfirmation) {
        appendLine(`> OPERATOR ${extractOperatorCodename(result.user, normalizedEmail)} AUTHORIZED.`);
      }
      setAccessForm((prev) => ({ ...prev, password: "" }));
    } catch {
      setAccessError("AUTH GATE FAILURE.");
      setStatusMessage("AUTH FAILURE");
    } finally {
      setAccessBusy(false);
    }
  };

  const lockTerminal = async () => {
    if (!isLiveAuthEnabled()) {
      await AsyncStorage.removeItem(LOCAL_ACCESS_SESSION_KEY);
      setAccessGranted(false);
      setAccessMode("SIGN_IN");
      setAccessError(null);
      setStatusMessage("TERMINAL LOCKED");
      return;
    }
    const result = await signOutOperator();
    setAccessGranted(false);
    setAccessMode("SIGN_IN");
    setAccessError(result.ok ? null : result.message);
    setStatusMessage(result.message);
  };

  const launchPactExecution = useCallback(() => {
    if (!hasRequiredComplianceConsent(complianceConsent)) {
      appendLine(buildComplianceNotice(complianceConsent));
      setStatusMessage("CONSENT REQUIRED");
      return;
    }
    const trimmed = draft.trim();
    if (!trimmed) {
      appendLine("> NO PACT INPUT DETECTED.");
      return;
    }
    setExecutionCountdown(5);
    setPactFlowMode("execution");
    setMissionsCreatedToday((prev) => prev + 1);
    void trackEvent("mission_created", {
      duration: Number(contractDuration) || 0,
      stake: Number(contractStake) || 0,
      mode: "planning_to_execution",
    });
    triggerPactFeedback("impact");
  }, [appendLine, complianceConsent, draft, triggerPactFeedback, contractDuration, contractStake]);

  const finalizePactExecution = useCallback(async () => {
    setPactFlowMode("planning");
    setExecutionCountdown(5);
    await submitPact();
    triggerPactFeedback("notify");
  }, [triggerPactFeedback]);

  useEffect(() => {
    if (pactFlowMode !== "execution") return;
    if (executionCountdown <= 0) {
      void finalizePactExecution();
      return;
    }
    const timeout = setTimeout(() => {
      setExecutionCountdown((prev) => prev - 1);
    }, 1000);
    return () => clearTimeout(timeout);
  }, [executionCountdown, finalizePactExecution, pactFlowMode]);

  const submitPact = async () => {
    if (!hasRequiredComplianceConsent(complianceConsent)) {
      appendLine(buildComplianceNotice(complianceConsent));
      setStatusMessage("CONSENT REQUIRED");
      return;
    }
    const trimmed = draft.trim();
    if (!trimmed) {
      appendLine("> NO PACT INPUT DETECTED.");
      return;
    }

    const contract: PactContract = {
      task: contractTask.trim(),
      durationMinutes: Number(contractDuration) || 0,
      stakePP: Number(contractStake) || 0,
      acceptedAt: new Date().toISOString(),
    };
    const verdict = evaluatePact(trimmed, contract);
    const deviceTimestamp = new Date().toISOString();
    const entry: PactLogEntry = {
      id: `${Date.now()}`,
      text: trimmed,
      result: verdict.response,
      pp: verdict.pp,
      timestamp: formatTime(),
      synced: false,
    };

    try {
      setStatusMessage("SUBMITTING PACT");
      const payload = createVoicePayload(trimmed, "text");
      await uploadVoicePayload(payload);
      const remoteVerdict = await submitToVerificationEngine(
        trimmed,
        activeUserId ?? "local-user",
        new Date().toISOString(),
        contract,
      );
      const mergedVerdict = {
        verified: remoteVerdict.verified,
        pp: remoteVerdict.pp_awarded,
        response: remoteVerdict.terminal_response,
        severity: remoteVerdict.severity,
        attributeScale: remoteVerdict.attribute_scale,
      };
      const protocolEffect = getProtocolStatusEffect({
        pp: state.pp,
        streak: state.streak,
        redState: state.redState,
        overclockCount: state.extensionsUsed,
        extensionsUsed: state.extensionsUsed,
      });
      const adjustedReward = mergedVerdict.verified
        ? applyStatusEffectToReward({
            baseReward: mergedVerdict.pp,
            effect: protocolEffect,
          })
        : -10;
      const rejectionConsequence = !mergedVerdict.verified
        ? getConsequencePacket(
            "PACT_REJECTED",
            {
              pp: state.pp,
              streak: state.streak,
              redState: state.redState,
              overclockCount: state.extensionsUsed,
              protocolArchetypeName: state.protocolArchetypeName,
              protocolStatusEffect: state.protocolStatusEffect,
            },
            language,
          )
        : null;

      if (state.offline) {
        const signature = await createClientPayloadSignature(
          activeUserId ?? "local-user",
          trimmed,
          deviceTimestamp,
        );
        setState((prev) => ({
          ...prev,
          queue: [
            ...prev.queue,
            {
              ...entry,
              result: mergedVerdict.response,
              pp: adjustedReward,
              deviceTimestamp,
              signature,
              activePactDeadline: prev.activePactDeadline,
              extensionsUsed: prev.extensionsUsed,
            },
          ],
          status: "SYNCING" as PactStatus,
          terminalLines: [...prev.terminalLines, `> OFFLINE QUEUE LOCKED: ${trimmed}`].slice(-14),
          overseerLines: [...prev.overseerLines, "> QUEUE LOCKED."].slice(-8),
        }));
        setDraft("");
        setStatusMessage("QUEUED FOR SYNC");
        return;
      }

      const today = todayKey();
      const sameDay = state.lastPactDate === today;
      const nextStreak = mergedVerdict.verified
        ? sameDay
          ? state.streak
          : state.streak + 1
        : Math.max(0, state.streak - 1);
      const xpEarned = getXpForPactStake(contract.stakePP);
      const nextPp = eliteOverrideActive
        ? Number.MAX_SAFE_INTEGER
        : Math.max(0, state.pp + adjustedReward);
      const nextXp = Math.max(
        0,
        state.xp + (mergedVerdict.verified ? xpEarned : 0),
      );
      const nextLevel = getLevelFromXP(nextXp);
      const redState =
        mergedVerdict.severity === "HIGH" || state.status === "REDSTATE";

      const nextState = {
        pp: nextPp,
        level: nextLevel,
        streak: nextStreak,
        xp: nextXp,
        lastPactDate: today,
        activePactDeadline: new Date(Date.now() + 60 * 60 * 1000).toISOString(),
        extensionsUsed: 0,
        activeContractTask: contract.task,
        activeContractStake: contract.stakePP,
        status: redState
          ? ("REDSTATE" as PactStatus)
          : ((mergedVerdict.verified ? "ACTIVE" : "ALERT") as PactStatus),
        redState,
        levelFlash: nextLevel > state.level,
        flashSuppressed: false,
      };
      const newlyUnlockedEpisodes = getNewlyUnlockedEpisodes(
        state.level,
        nextLevel,
        language,
      );

      setState((prev) => ({
        ...prev,
        ...nextState,
        terminalLines: [
          ...prev.terminalLines,
          mergedVerdict.response,
          ...(rejectionConsequence ? [rejectionConsequence.terminalLine] : []),
          ...newlyUnlockedEpisodes.map((episode) => `> NARRATIVE UNLOCKED: ${episode.title}`),
        ].slice(-14),
        overseerLines: [
          ...prev.overseerLines,
          redState
            ? "> RED-STATE LOCK."
            : rejectionConsequence
              ? rejectionConsequence.overseerLine
              : "> OBJECTIVE REVIEW COMPLETE.",
          ...newlyUnlockedEpisodes.map((episode) => `> TRANSMISSION ${episode.episodeNumber} UNSEALED.`),
        ].slice(-8),
      }));
      await syncProgressToSupabase(
        {
          user_id: activeUserId ?? "local-user",
          level: nextState.level,
          pp: nextState.pp,
          streak: nextState.streak,
          red_state: nextState.redState,
          last_pact_date: nextState.lastPactDate,
          active_pact_deadline: nextState.activePactDeadline,
          extensions_used: nextState.extensionsUsed,
          updated_at: new Date().toISOString(),
        },
        [
          {
            user_id: activeUserId ?? "local-user",
            content: trimmed,
            result: mergedVerdict.response,
            pp_awarded: adjustedReward,
            created_at: new Date().toISOString(),
            synced: true,
            active_pact_deadline: nextState.activePactDeadline,
            extensions_used: nextState.extensionsUsed,
          },
        ],
      );
      setDraft("");
      setStatusMessage("PERSISTED TO SUPABASE");
      setMissionsCompletedToday((prev) => prev + 1);
      void trackEvent("mission_completed", {
        verified: mergedVerdict.verified,
        reward: adjustedReward,
        severity: mergedVerdict.severity,
      });
    } catch {
      setState((prev) => ({
        ...prev,
        status: "ALERT" as PactStatus,
        terminalLines: [...prev.terminalLines, "> AI GATE ERROR."].slice(-14),
      }));
      setStatusMessage("SYNC FAILED");
      void recordCrash("sync_failure", {
        location: "submitPact",
        queueSize: state.queue.length,
      });
    }
  };

  const syncQueue = async () => {
    if (state.queue.length === 0) {
      appendLine("> SYNC QUEUE EMPTY.");
      return;
    }

    const totalPp = state.queue.reduce((sum, item) => sum + item.pp, 0);
    const nextXp = state.xp + totalPp * 100;
    const nextLevel = getLevelFromXP(nextXp);
    const newlyUnlockedEpisodes = getNewlyUnlockedEpisodes(
      state.level,
      nextLevel,
      language,
    );

    setState((prev) => ({
      ...prev,
      pp: prev.pp + totalPp,
      level: nextLevel,
      xp: nextXp,
      streak: prev.streak + prev.queue.length,
      queue: [],
      status: "ACTIVE" as PactStatus,
      redState: false,
      terminalLines: [
        ...prev.terminalLines,
        `> SYNC COMPLETE. +${totalPp} PP.`,
        ...newlyUnlockedEpisodes.map((episode) => `> NARRATIVE UNLOCKED: ${episode.title}`),
      ].slice(-14),
      overseerLines: [
        ...prev.overseerLines,
        "> QUEUE CLEARED.",
      ].slice(-8),
    }));

    try {
      await syncProgressToSupabase(
        {
          user_id: activeUserId ?? "local-user",
          level: nextLevel,
          pp: state.pp + totalPp,
          streak: state.streak + state.queue.length,
          red_state: false,
          last_pact_date: state.lastPactDate,
          active_pact_deadline: state.activePactDeadline,
          extensions_used: state.extensionsUsed,
          updated_at: new Date().toISOString(),
        },
        state.queue.map((item) => ({
          user_id: activeUserId ?? "local-user",
          content: item.text,
          result: item.result,
          pp_awarded: item.pp,
          created_at: new Date().toISOString(),
          synced: true,
          device_timestamp: item.deviceTimestamp,
          signature: item.signature,
          active_pact_deadline: item.activePactDeadline || state.activePactDeadline,
          extensions_used: item.extensionsUsed ?? state.extensionsUsed,
        })),
      );
      setStatusMessage("QUEUE SYNCED");
      triggerPactFeedback("notify");
    } catch {
      setStatusMessage("QUEUE SYNC FAILED");
      triggerPactFeedback("impact");
      void recordCrash("sync_failure", {
        location: "syncQueue",
        queueSize: state.queue.length,
      });
    }
  };

  const toggleRecording = async () => {
    if (!planFeatures.voiceCapture) {
      appendLine("> PREMIUM LOCK: VOICE CAPTURE UNAVAILABLE.");
      setStatusMessage(getFeatureLockMessage("voiceCapture"));
      return;
    }
    if (!hasRequiredComplianceConsent(complianceConsent)) {
      appendLine(buildComplianceNotice(complianceConsent));
      setStatusMessage("CONSENT REQUIRED");
      return;
    }
    if (isRecording) {
      const uri = await stopVoiceRecording();
      setIsRecording(false);
      if (uri) {
        const transcript = await transcribeAudio(uri);
        setDraft((current) => (current ? `${current}\n${transcript}` : transcript));
        appendLine("> VOICE CAPTURED.");
        setStatusMessage("VOICE TRANSCRIBED");
      } else {
        setStatusMessage("RECORDING STOPPED");
      }
      return;
    }
    try {
      await startVoiceRecording();
      setIsRecording(true);
      setStatusMessage("LISTENING...");
    } catch {
      setStatusMessage("MICROPHONE UNAVAILABLE");
    }
  };

  const toggleOffline = () => {
    setState((prev) => ({
      ...prev,
      offline: !prev.offline,
      status: prev.offline ? "ACTIVE" : "SYNCING",
      terminalLines: [
        ...prev.terminalLines,
        prev.offline ? "> OFFLINE MODE DISENGAGED." : "> OFFLINE MODE ENGAGED.",
      ].slice(-14),
    }));
  };

  const handleOnboardingAdvance = () => {
    setOnboardingSeen(true);
    void trackEvent("tutorial_completed", { step: "onboarding_advance" });
    void savePersistedAppState({
      onboardingSeen: true,
      language,
      squads,
      activeSquadId,
      ownedDesignTemplates,
      selectedDesignTemplateId,
    });
  };

  const stabilizeRedFlash = () => {
    if (!state.redState) {
      appendLine("> RECOVERY PROTOCOL NOT REQUIRED.");
      setStatusMessage("NO REDSTATE");
      return;
    }

    const currentState = getStabilizationUsageState({
      usedToday: state.stabilizationUsesToday,
      resetDate: state.stabilizationResetDate,
      now: new Date(),
    });

    if (!currentState.canUse) {
      appendLine("> RECOVERY WINDOW LOCKED.");
      setStatusMessage("RECOVERY LOCKED");
      return;
    }

    if (!eliteOverrideActive && state.pp < stabilizationCost) {
      appendLine("> INSUFFICIENT PP FOR RECOVERY.");
      setStatusMessage("INSUFFICIENT PP");
      return;
    }

    const recoveryOutcome = applyRecoveryAction({
      pp: state.pp,
      redState: state.redState,
      stabilizationUsesToday: state.stabilizationUsesToday,
      resetDate: state.stabilizationResetDate,
      now: new Date(),
      costPP: stabilizationCost,
    });

    if (!recoveryOutcome.applied) {
      appendLine("> RECOVERY FAILED.");
      setStatusMessage("RECOVERY FAILED");
      return;
    }

    setState((prev) => ({
      ...prev,
      pp: eliteOverrideActive ? prev.pp : recoveryOutcome.nextPP,
      stabilizationUsesToday: recoveryOutcome.nextStabilizationUsesToday,
      stabilizationResetDate: recoveryOutcome.resetDate,
      flashSuppressed: recoveryOutcome.nextFlashSuppressed,
      redState: recoveryOutcome.nextRedState,
      levelFlash: false,
      terminalLines: [
        ...prev.terminalLines,
        `> RECOVER // COST ${stabilizationCost} PP`,
      ].slice(-14),
    }));
    appendLine(`> RECOVERY COMPLETE.`);
    setStatusMessage("RECOVERY COMPLETE");
  };

  const changeLanguage = async (nextLanguage: SupportedLanguage) => {
    setLanguage(nextLanguage);
    await setStoredLanguage(nextLanguage);
    void trackEvent("language_selected", { language: nextLanguage, platform: Platform.OS });
    await savePersistedAppState({
      onboardingSeen,
      language: nextLanguage,
      squads,
      activeSquadId,
      ownedDesignTemplates,
      selectedDesignTemplateId,
    });
    setStatusMessage(getLocalizedText("languageSaved", nextLanguage));
  };

  const handleTabPress = useCallback((tab: AppTab) => {
    triggerPactFeedback("impact");
    setActiveTab(tab);
    mainScrollRef.current?.scrollTo({ y: 0, animated: true });
  }, [triggerPactFeedback]);

  const handleTutorialNext = useCallback(() => {
    if (tutorialStep === null) return;
    const next = tutorialStep + 1;
    if (next >= tutorialSteps.length) {
      setTutorialStep(null);
      setTutorialCompleted(true);
      void trackEvent("tutorial_completed", { step: "tutorial_overlay" });
      void AsyncStorage.setItem("@peakpact/tutorial-done", "true");
    } else {
      const nextTab = tutorialSteps[next]?.tab as AppTab | undefined;
      setTutorialStep(next);
      if (nextTab) handleTabPress(nextTab);
    }
  }, [tutorialStep, tutorialSteps.length, tutorialSteps, handleTabPress]);

  const handleTutorialPrev = useCallback(() => {
    if (!tutorialStep) return;
    const prev = tutorialStep - 1;
    const prevTab = tutorialSteps[prev]?.tab as AppTab | undefined;
    setTutorialStep(prev);
    if (prevTab) handleTabPress(prevTab);
  }, [tutorialStep, tutorialSteps, handleTabPress]);

  const handleTutorialSkip = useCallback(() => {
    setTutorialStep(null);
    setTutorialCompleted(true);
    void AsyncStorage.setItem("@peakpact/tutorial-done", "true");
  }, []);

  const handleCreateSquad = () => {
    if (!squadName.trim()) {
      setStatusMessage("SQUAD NAME REQUIRED");
      void recordCrash("squad_failure", { location: "handleCreateSquad", reason: "name_required" });
      return;
    }
    const nextSquad = createSquad({
      name: squadName.trim(),
      description: squadDescription.trim() || "A focused crew for shared discipline.",
      visibility: squadVisibility,
      ownerName: operatorCodename,
      focus: squadFocus.trim() || "Study and recovery",
      goal: squadGoal.trim() || "Complete 5 shared missions this week",
      plan: effectivePlan,
    });
    setSquads((prev) => [nextSquad, ...prev]);
    setActiveSquadId(nextSquad.id);
    setSquadName("");
    setSquadDescription("");
    setSquadFocus("Study and recovery");
    setSquadGoal("Complete 5 shared missions this week");
    setSquadVisibility("PUBLIC");
    setStatusMessage(`SQUAD READY: ${nextSquad.name}`);
    triggerPactFeedback("notify");
    void trackEvent("squad_created", { visibility: squadVisibility, squadsCount: squads.length + 1 });
  };

  const handleJoinSquad = () => {
    if (!squadJoinCode.trim()) {
      setStatusMessage("JOIN CODE REQUIRED");
      void recordCrash("squad_failure", { location: "handleJoinSquad", reason: "join_code_required" });
      return;
    }
    const result = joinSquad(
      squads,
      squadJoinCode.trim().toUpperCase(),
      operatorCodename,
      effectivePlan,
    );
    if (result.error) {
      setStatusMessage(result.error.toUpperCase());
      void recordCrash("squad_failure", { location: "handleJoinSquad", reason: result.error });
      return;
    }
    setSquads([...squads]);
    setActiveSquadId(result.squad?.id ?? null);
    setSquadJoinCode("");
    setStatusMessage(`JOINED SQUAD: ${result.squad?.name}`);
    triggerPactFeedback("notify");
    void trackEvent("squad_joined", { squadName: result.squad?.name });
  };

  const handleShareReport = useCallback(async (report: TransformationReport) => {
    try {
      await Share.share({
        title: report.headline,
        message: `${report.headline}\n\n${report.summary}\n\n${report.shareText}`,
      });
      triggerPactFeedback("notify");
    } catch {
      setStatusMessage("SHARE UNAVAILABLE");
      triggerPactFeedback("impact");
    }
  }, [triggerPactFeedback]);

  const narrativeProgress = useMemo(
    () => getNarrativeProgress(state.level, language),
    [state.level, language],
  );

  const displayPp = eliteOverrideActive ? "UNLIMITED" : String(state.pp);
  const displayXp = founderPrivilegesActive ? "FOUNDERSHIP" : `${state.xp} XP`;
  
  const dailyChallenge = useMemo(
    () =>
      getDailyChallenge({
        dailyPactsToday: Math.max(
          0,
          state.streak > 0 ? Math.min(3, Math.floor(state.streak / 2)) : 0,
        ),
        pp: state.pp,
        streak: state.streak,
        redState: state.redState,
        isPremium: effectivePlan === "PREMIUM",
      }),
    [state.streak, state.redState, state.pp, effectivePlan],
  );

  const designTemplates = useMemo(() => getDesignTemplates(), []);

  const handleTemplatePurchase = (templateId: DesignTemplateId) => {
    const result = purchaseDesignTemplate({
      pp: state.pp,
      ownedTemplateIds: ownedDesignTemplates,
      selectedTemplateId: selectedDesignTemplateId,
      templateId,
    });

    if (!result.ok) {
      setTemplateMessage(
        result.reason === "insufficient_pp"
          ? "INSUFFICIENT PP FOR THIS THEME."
          : result.reason === "already_owned"
            ? "THEME ALREADY UNLOCKED."
            : "THEME UNAVAILABLE.",
      );
      return;
    }

    setOwnedDesignTemplates(result.ownedTemplateIds);
    setSelectedDesignTemplateId(result.selectedTemplateId as DesignTemplateId);
    setState((prev) => ({ ...prev, pp: result.nextPP }));
    setTemplateMessage(`THEME UNLOCKED: ${getDesignTemplateById(templateId)?.name ?? "THEME"}.`);
    triggerPactFeedback("notify");
  };

  if (!languageBootstrapped || languageGateVisible) {
    return (
      <LanguageSelectionScreen
        selectedLanguage={language}
        onSelectLanguage={setLanguage}
        onContinue={() => {
          void finalizeLanguageSelection();
        }}
      />
    );
  }

  if (bootReady !== true) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: BG_COLOR }}>
        <StatusBar style="light" hidden />
        <BootSequence
          language={language}
          onComplete={() => {
            setBootReady(true);
          }}
        />
      </SafeAreaView>
    );
  }

  if (authBooting) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: BG_COLOR, justifyContent: "center", alignItems: "center" }}>
        <StatusBar style="light" />
        <ActivityIndicator size="small" color={ACCENT_GREEN} />
        <Text style={{ color: SECONDARY_TEXT, fontSize: 12, letterSpacing: 2 }}>PEAKPACT</Text>
        <Text style={{ color: PRIMARY_TEXT, fontSize: 24, fontWeight: "700", marginTop: 8 }}>RESTORING SESSION</Text>
      </SafeAreaView>
    );
  }

  if (!accessGranted) {
    return (
      <AccessGate
        mode={accessMode}
        form={accessForm}
        busy={accessBusy}
        errorMessage={accessError}
        statusMessage={statusMessage}
        onModeChange={setAccessMode}
        onFieldChange={updateAccessField}
        onSubmit={submitAccessRequest}
      />
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      {!onboardingSeen ? (
        <View style={styles.onboardingOverlay}>
          <View style={styles.onboardingCard}>
            <Text style={styles.onboardingLabel}>{getLocalizedText("onboardingWelcomeLabel", language)}</Text>
            <Text style={styles.onboardingTitle}>
              {firstSessionGuide.title}
            </Text>
            <Text style={styles.onboardingBody}>{firstSessionGuide.body}</Text>
            <View style={styles.onboardingSteps}>
              {firstSessionGuide.steps.map((step) => (
                <Text key={step.title} style={styles.onboardingStep}>
                  • {step.title}: {step.body}
                </Text>
              ))}
            </View>
            <View style={styles.onboardingActionRow}>
              <Text style={styles.onboardingActionLabel}>
                {getLocalizedText("onboardingFirstStepLabel", language)}
              </Text>
              <Text style={styles.onboardingActionValue}>
                {firstSessionGuide.primaryAction}
              </Text>
            </View>
            <Pressable
              style={({ pressed }) => [styles.buttonPrimary, pressed && styles.buttonPrimaryPressed]}
              onPress={handleOnboardingAdvance}
            >
              <Text style={styles.buttonPrimaryText}>
                {getLocalizedText("onboardingButton", language)}
              </Text>
            </Pressable>
          </View>
        </View>
      ) : null}

      <KeyboardAvoidingView
        style={styles.keyboardShell}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        <StatusBar style="light" />
        
        {isWeb && (
          <View style={styles.webGlobalHeader}>
            <Text style={styles.webGlobalTitle}>PEAKPACT OS</Text>
            <View style={styles.webGlobalCenter}>
              <Text style={styles.webGlobalTime}>
                {"TIME: " + militaryTime}
              </Text>
            </View>
            <Text style={styles.webGlobalAuth}>
              {operatorCodename} // {effectivePlan}
            </Text>
          </View>
        )}

        <TabBar active={activeTab} onPress={handleTabPress} accent={ACCENT_GREEN} tabs={appTabs} />

        {successToastLabel ? (
          <Animated.View
            pointerEvents="none"
            style={[
              styles.successToast,
              {
                opacity: successToastAnim,
                transform: [
                  {
                    translateY: successToastAnim.interpolate({
                      inputRange: [0, 1],
                      outputRange: [-8, 0],
                    }),
                  },
                ],
              },
            ]}
          >
            <Text style={styles.successToastText}>{successToastLabel}</Text>
          </Animated.View>
        ) : null}

        <View style={isWeb ? styles.webColumnsRow : styles.mobileColumnWrapper}>
          
          {/* WEB LEFT COLUMN */}
          {isWeb && (
            <ScrollView
              style={styles.webLeftCol}
              contentContainerStyle={styles.webColContent}
              showsVerticalScrollIndicator={false}
            >
              <View style={styles.card}>
                <Text style={styles.cardHeaderLabel}>OPERATOR</Text>
                <Text style={[styles.cardTitle, { marginTop: 4 }]}>{operatorCodename}</Text>
                <Text style={styles.cardSubtitle}>LVL {state.level} • {effectivePlan}</Text>
                
                <View style={[styles.separator, { marginVertical: 16 }]} />
                
                <View style={styles.stackGap}>
                  <View style={styles.statRowFlex}>
                    <Text style={styles.statLabelMuted}>PP BALANCE</Text>
                    <Text style={[styles.statValueBold, { color: ACCENT_GREEN }]}>{displayPp}</Text>
                  </View>
                  <View style={styles.statRowFlex}>
                    <Text style={styles.statLabelMuted}>STREAK</Text>
                    <Text style={styles.statValueBold}>{state.streak} DAYS</Text>
                  </View>
                  <View style={styles.statRowFlex}>
                    <Text style={styles.statLabelMuted}>XP PROGRESS</Text>
                    <Text style={styles.statValueBold}>{displayXp}</Text>
                  </View>
                </View>

                <View style={styles.progressBarShell}>
                  <View
                    style={[
                      styles.progressBarFill,
                      { width: `${progressionView.nextLevelProgress.percent}%` },
                    ]}
                  />
                </View>
                <Text style={styles.cardSubtitleFooter}>
                  {progressionView.nextLevelProgress.percent}% to Level {state.level + 1}
                </Text>
              </View>

              <View style={styles.card}>
                <Text style={styles.cardHeaderLabel}>SYSTEM STATUS</Text>
                <Text style={[styles.cardTitle, { marginTop: 6, color: state.redState ? DANGER_COLOR : ACCENT_GREEN }]}>
                  {state.redState ? "REDSTATE / BREACH" : state.offline ? "OFFLINE BUFFER" : "SYSTEM OPTIMAL"}
                </Text>
                <Text style={[styles.cardSubtitle, { marginTop: 4 }]}>
                  {protocolArchetype.name}
                </Text>
              </View>
            </ScrollView>
          )}

          {/* MAIN COLUMN */}
          <ScrollView
            ref={mainScrollRef}
            style={[styles.shell, isWeb && styles.webCenterCol]}
            contentContainerStyle={styles.shellContent}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
            refreshControl={
              !isWeb ? (
                <RefreshControl
                  refreshing={isRefreshing}
                  onRefresh={() => {
                    void handlePullRefresh();
                  }}
                  tintColor={ACCENT_GREEN}
                  colors={[ACCENT_GREEN]}
                  progressBackgroundColor={SURFACE}
                />
              ) : undefined
            }
          >
            <Animated.View
              style={[
                styles.appShell,
                {
                  opacity: tabTransition,
                  transform: [
                    {
                      translateY: tabTransition.interpolate({
                        inputRange: [0.92, 1],
                        outputRange: [8, 0],
                      }),
                    },
                  ],
                },
              ]}
            >
              
              {!isWeb && (
                <View style={styles.mobileTopGreetingRow}>
                  <View>
                    <Text style={styles.greetingText}>Good Evening,</Text>
                    <Text style={styles.operatorNameHeading}>{operatorCodename}.</Text>
                  </View>
                  <View style={styles.streakBadgeMini}>
                    <Text style={styles.streakBadgeMiniText}>🔥 {state.streak} DAYS</Text>
                  </View>
                </View>
              )}

              {activeTab !== "PACT" && (
                <SectionIntro intro={tabIntros[activeTab]} accent={ACCENT_GREEN} />
              )}
              
              {/* TAB: PACT */}
              <View style={[styles.tabContentContainer, { display: activeTab === "PACT" ? "flex" : "none" }]}>
                
                <View style={styles.heroCard}>
                  <View style={styles.heroTopRow}>
                     <Text style={styles.cardHeaderLabel}>ACTIVE MISSION</Text>
                     <Text style={[styles.cardHeaderLabel, { color: ACCENT_GREEN }]}>{missionCountdown}</Text>
                  </View>
                  <Text style={styles.heroTitle}>{state.missionTitle}</Text>
                  <Text style={styles.heroSubtitle}>
                    {state.missionDescription}
                  </Text>
                </View>

                {pactFlowMode === "planning" ? (
                  <View style={styles.card}>
                    <Text style={styles.cardTitle}>MISSION COMMAND CENTER</Text>
                    <Text style={styles.cardSubtitle}>Define. Commit. Execute.</Text>
                    
                    <View style={styles.stackGapMarginTop}>
                      <TextInput
                        style={styles.input}
                        value={contractTask}
                        onChangeText={setContractTask}
                        placeholder="Deep Work Session"
                        placeholderTextColor={SECONDARY_TEXT}
                      />
                      
                      <View style={styles.rowFlexGap}>
                         <TextInput
                            style={[styles.input, { flex: 1, marginBottom: 0 }]}
                            value={contractDuration}
                            onChangeText={setContractDuration}
                            placeholder="45 min"
                            keyboardType="numeric"
                            placeholderTextColor={SECONDARY_TEXT}
                          />
                           <TextInput
                            style={[styles.input, { flex: 1, marginBottom: 0 }]}
                            value={contractStake}
                            onChangeText={setContractStake}
                            placeholder="20 PP"
                            keyboardType="numeric"
                            placeholderTextColor={SECONDARY_TEXT}
                          />
                      </View>
                    </View>

                    <Text style={[styles.cardHeaderLabel, { marginTop: 24, marginBottom: 12 }]}>QUICK DEPLOY</Text>
                    <View style={styles.quickDeployGrid}>
                      {[
                        { label: "45m", title: "Deep Work", duration: "45", stake: "20" },
                        { label: "30m", title: "Code Sprint", duration: "30", stake: "15" },
                        { label: "60m", title: "Heavy Lift", duration: "60", stake: "30" },
                      ].map((macro) => (
                        <Pressable
                          key={macro.label}
                          style={({ pressed }) => [styles.quickDeployCard, pressed && styles.quickDeployCardPressed]}
                          onPress={() => {
                            setContractDuration(macro.duration);
                            setContractStake(macro.stake);
                            setContractTask(macro.title);
                          }}
                        >
                          <Text style={styles.quickDeployNumber}>{macro.label}</Text>
                          <Text style={styles.quickDeploySub}>{macro.title}</Text>
                        </Pressable>
                      ))}
                    </View>

                    <TextInput
                      style={[styles.input, { minHeight: 90, marginTop: 16 }]}
                      value={draft}
                      onChangeText={setDraft}
                      placeholder={translate("proofPlaceholder")}
                      placeholderTextColor={SECONDARY_TEXT}
                      multiline
                    />

                    <View style={styles.rowFlexGapMarginTop}>
                       <Pressable style={styles.buttonVoice} onPress={toggleRecording}>
                          <Text style={{ fontSize: 18 }}>🎤</Text>
                       </Pressable>
                       <Pressable
                         style={({ pressed }) => [styles.buttonPrimary, { flex: 1, marginTop: 0 }, pressed && styles.buttonPrimaryPressed]}
                         onPress={launchPactExecution}
                       >
                         <Text style={styles.buttonPrimaryText}>LOCK IN</Text>
                       </Pressable>
                    </View>
                  </View>
                ) : (
                  <View style={[styles.card, { alignItems: "center", paddingVertical: 40 }]}>
                    <Text style={styles.cardHeaderLabel}>ACTIVE EXECUTION PROTOCOL</Text>
                    <Text style={styles.heroTitle} numberOfLines={1}>{contractTask}</Text>
                    
                    <Text style={[styles.timerDialLarge, { color: ACCENT_GREEN }]}>
                      {executionCountdown}s
                    </Text>
                    <Text style={styles.cardSubtitle}>Preparing contract verification gate...</Text>

                    <Pressable
                      style={({ pressed }) => [styles.buttonSecondary, { width: "100%", marginTop: 32 }, pressed && styles.buttonSecondaryPressed]}
                      onPress={() => {
                        setPactFlowMode("planning");
                        setExecutionCountdown(5);
                      }}
                    >
                      <Text style={styles.buttonSecondaryText}>{translate("buttonAbort")}</Text>
                    </Pressable>
                  </View>
                )}

                {state.redState && (
                  <View style={[styles.card, { borderColor: DANGER_COLOR, backgroundColor: "rgba(255,82,82,0.04)" }]}>
                     <Text style={[styles.cardTitle, { color: DANGER_COLOR }]}>REDSTATE BREACH</Text>
                     <Text style={[styles.heroSubtitle, { marginVertical: 8 }]}>
                        Contract constraints violated. Stabilize immediately to restore system privileges.
                     </Text>
                    <Pressable style={({ pressed }) => [styles.buttonPrimary, { backgroundColor: DANGER_COLOR, marginTop: 12 }, pressed && styles.buttonPrimaryPressed]} onPress={stabilizeRedFlash}>
                        <Text style={[styles.buttonPrimaryText, { color: PRIMARY_TEXT }]}>{recoveryButtonLabel}</Text>
                     </Pressable>
                  </View>
                )}

                <View style={styles.statsRowGrid}>
                  <View style={styles.statCardItem}>
                    <Text style={styles.statLabelMuted}>STREAK</Text>
                    <Text style={styles.statValueLarge}>{state.streak}</Text>
                    <Text style={styles.statSubLabel}>Days Active</Text>
                  </View>
                  <View style={styles.statCardItem}>
                    <Text style={styles.statLabelMuted}>SUCCESS RATE</Text>
                    <Text style={styles.statValueLarge}>92%</Text>
                    <Text style={styles.statSubLabel}>Adherence</Text>
                  </View>
                  <View style={styles.statCardItem}>
                    <Text style={styles.statLabelMuted}>PP BALANCE</Text>
                    <Text style={[styles.statValueLarge, { color: ACCENT_GREEN }]}>{state.pp}</Text>
                    <Text style={styles.statSubLabel}>Points</Text>
                  </View>
                </View>

              </View>

              {/* TAB: SQUAD */}
              <View style={[styles.tabContentContainer, { display: activeTab === "SQUAD" ? "flex" : "none" }]}>
                <View style={styles.card}>
                  <Text style={styles.cardTitle}>SQUAD ACTIVITY FEED</Text>
                  <Text style={styles.cardSubtitle}>Real-time telemetry across connected operator crews.</Text>

                  <View style={styles.stackGapMarginTop}>
                     <View style={styles.activityFeedRow}>
                        <View style={{ flex: 1 }}>
                          <Text style={styles.activityFeedName}>Alex completed 45m Deep Work</Text>
                          <Text style={styles.activityFeedTime}>2m ago • +15 PP Earned</Text>
                        </View>
                        <View style={styles.successPill}><Text style={styles.successPillText}>SUCCESS</Text></View>
                     </View>
                     <View style={styles.activityFeedRow}>
                        <View style={{ flex: 1 }}>
                          <Text style={styles.activityFeedName}>Marcus started 60m Heavy Lift</Text>
                          <Text style={styles.activityFeedTime}>5m ago • Stake: 20 PP</Text>
                        </View>
                        <View style={styles.warningPill}><Text style={styles.warningPillText}>IN PROGRESS</Text></View>
                     </View>
                     <View style={styles.activityFeedRow}>
                        <View style={{ flex: 1 }}>
                          <Text style={styles.activityFeedName}>Jordan completed 30m Code Sprint</Text>
                          <Text style={styles.activityFeedTime}>10m ago • +18 PP Earned</Text>
                        </View>
                        <View style={styles.successPill}><Text style={styles.successPillText}>SUCCESS</Text></View>
                     </View>
                  </View>
                </View>

                <View style={styles.card}>
                  <Text style={styles.cardTitle}>CREW ADMINISTRATION</Text>
                  
                  <View style={styles.stackGapMarginTop}>
                     <TextInput style={styles.input} value={squadName} onChangeText={setSquadName} placeholder="Squad Name" placeholderTextColor={SECONDARY_TEXT} />
                     <TextInput style={styles.input} value={squadFocus} onChangeText={setSquadFocus} placeholder="Mission Focus" placeholderTextColor={SECONDARY_TEXT} />
                    <Pressable style={({ pressed }) => [styles.buttonSecondary, pressed && styles.buttonSecondaryPressed]} onPress={handleCreateSquad}>
                        <Text style={styles.buttonSecondaryText}>INITIALIZE SQUAD</Text>
                     </Pressable>
                  </View>

                  <View style={[styles.separator, { marginVertical: 20 }]} />

                  <TextInput style={styles.input} value={squadJoinCode} onChangeText={setSquadJoinCode} placeholder="Join Code (e.g., AB12CD)" placeholderTextColor={SECONDARY_TEXT} />
                  <Pressable style={({ pressed }) => [styles.buttonSecondary, pressed && styles.buttonSecondaryPressed]} onPress={handleJoinSquad}>
                     <Text style={styles.buttonSecondaryText}>JOIN EXISTING CREW</Text>
                  </Pressable>

                  {activeSquadId && (
                     <Pressable style={[styles.buttonSecondary, { borderColor: DANGER_COLOR, marginTop: 16 }]} onPress={() => console.log("Leave squad tapped")}>
                        <Text style={[styles.buttonSecondaryText, { color: DANGER_COLOR }]}>LEAVE CURRENT CREW</Text>
                     </Pressable>
                  )}
                </View>
              </View>

              {/* TAB: STORE */}
              <View style={[styles.tabContentContainer, { display: activeTab === "STORE" ? "flex" : "none" }]}>
                <View style={styles.card}>
                  <Text style={styles.cardTitle}>DESIGN TEMPLATES & THEMES</Text>
                  <Text style={styles.cardSubtitle}>Upgrade your terminal identity and workspace shell.</Text>

                  <View style={styles.premiumHeroCard}>
                    <Text style={styles.premiumHeroEyebrow}>Premium</Text>
                    <Text style={styles.premiumHeroTitle}>Frictionless Execution Stack</Text>
                    <Text style={styles.premiumHeroSubtitle}>
                      Unified coaching intelligence, faster mission capture, and premium recovery flow for operators who optimize consistency.
                    </Text>
                    <View style={styles.premiumPillarsRow}>
                      <View style={styles.premiumPillarChip}><Text style={styles.premiumPillarText}>AI Coach</Text></View>
                      <View style={styles.premiumPillarChip}><Text style={styles.premiumPillarText}>Future Self</Text></View>
                      <View style={styles.premiumPillarChip}><Text style={styles.premiumPillarText}>Reports</Text></View>
                    </View>
                  </View>

                  <MonetizationPanel
                    visible
                    accent={ACCENT_GREEN}
                    plan={effectivePlan}
                    isDeviceTrialActive={deviceTrialStatus.active}
                    trialDaysRemaining={deviceTrialStatus.daysRemaining}
                  />
                  
                  {templateMessage && (
                     <Text style={[styles.cardSubtitle, { color: ACCENT_GREEN, marginTop: 10 }]}>{templateMessage}</Text>
                  )}

                  <View style={styles.stackGapMarginTop}>
                    {designTemplates.map((template) => {
                      const owned = ownedDesignTemplates.includes(template.id);
                      const selected = selectedDesignTemplateId === template.id;
                      return (
                        <View key={template.id} style={styles.storeThemeCard}>
                           <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center" }}>
                              <Text style={styles.cardTitle}>{template.name}</Text>
                              <View style={[
                                styles.statusBadgeChip,
                                selected ? { backgroundColor: "rgba(156,226,42,0.15)", borderColor: ACCENT_GREEN } : {}
                              ]}>
                                <Text style={[
                                  styles.statusBadgeChipText,
                                  selected ? { color: ACCENT_GREEN } : {}
                                ]}>
                                  {selected ? "ACTIVE" : owned ? "OWNED" : `${template.costPP} PP`}
                                </Text>
                              </View>
                           </View>
                           <Text style={[styles.heroSubtitle, { marginVertical: 8 }]}>{template.description}</Text>
                           
                           {!selected && (
                             owned ? (
                               <Pressable style={({ pressed }) => [styles.buttonSecondary, { marginTop: 8 }, pressed && styles.buttonSecondaryPressed]} onPress={() => setSelectedDesignTemplateId(template.id as DesignTemplateId)}>
                                  <Text style={styles.buttonSecondaryText}>APPLY THEME</Text>
                               </Pressable>
                             ) : (
                               <Pressable style={({ pressed }) => [styles.buttonSecondary, { marginTop: 8 }, pressed && styles.buttonSecondaryPressed]} onPress={() => handleTemplatePurchase(template.id as DesignTemplateId)}>
                                  <Text style={styles.buttonSecondaryText}>UNLOCK THEME</Text>
                               </Pressable>
                             )
                           )}
                        </View>
                      );
                    })}
                  </View>

                  <Pressable style={({ pressed }) => [styles.buttonPrimary, styles.paywallPrimaryButton, { marginTop: 24 }, pressed && styles.buttonPrimaryPressed]} onPress={toggleMonetization}>
                     <Text style={[styles.buttonPrimaryText, styles.paywallPrimaryButtonText]}>OPEN PREMIUM PAYWALL</Text>
                  </Pressable>
                  <Pressable style={({ pressed }) => [styles.buttonSecondary, styles.paywallSecondaryButton, { marginTop: 10 }, pressed && styles.buttonSecondaryPressed]} onPress={handleRestorePremium}>
                    <Text style={[styles.buttonSecondaryText, styles.paywallSecondaryButtonText]}>RESTORE PURCHASES</Text>
                  </Pressable>
                </View>
              </View>

              {/* TAB: PROFILE */}
              <View style={[styles.tabContentContainer, { display: activeTab === "PROFILE" ? "flex" : "none" }]}>
                <View style={styles.card}>
                  <Text style={styles.cardTitle}>OPERATOR DOSSIER</Text>
                  <Text style={styles.cardSubtitle}>Comprehensive discipline telemetry and career stats.</Text>
                  
                  <View style={styles.statsRowGrid}>
                     <View style={styles.statCardItem}>
                        <Text style={styles.statLabelMuted}>LEVEL</Text>
                        <Text style={styles.statValueLarge}>{state.level}</Text>
                     </View>
                     <View style={styles.statCardItem}>
                        <Text style={styles.statLabelMuted}>STREAK</Text>
                        <Text style={styles.statValueLarge}>{state.streak}</Text>
                     </View>
                     <View style={styles.statCardItem}>
                        <Text style={styles.statLabelMuted}>XP</Text>
                        <Text style={styles.statValueLarge}>{state.xp}</Text>
                     </View>
                  </View>

                  <View style={[styles.separator, { marginVertical: 20 }]} />

                  <Text style={[styles.cardHeaderLabel, { marginBottom: 12 }]}>NARRATIVE REWARDS UNLOCKED ({narrativeProgress.unlockedCount}/{narrativeProgress.totalCount})</Text>
                  <View style={{ gap: 10 }}>
                     {narrativeProgress.episodes.slice(0, 3).map((ep) => (
                        <View key={ep.title} style={styles.narrativeRewardRow}>
                           <Text style={[styles.cardSubtitle, { color: PRIMARY_TEXT }]}>{ep.title}</Text>
                           <Text style={[styles.cardHeaderLabel, { color: ep.unlocked ? ACCENT_GREEN : SECONDARY_TEXT }]}>
                              {ep.unlocked ? "UNLOCKED" : `LOCKED (LVL ${ep.requiredLevel})`}
                           </Text>
                        </View>
                     ))}
                  </View>
                </View>

                <ExecutiveDashboard
                  coach={coachSnapshot}
                  future={futureSelfSnapshot}
                  transformationDayCount={state.streak}
                  todaysMission={state.missionTitle}
                  squadRank={activeSquadId ? "ACTIVE MEMBER" : "UNASSIGNED"}
                  monthlyReport={monthlyReport}
                  annualReport={annualReport}
                  onShareReport={handleShareReport}
                />
              </View>

              {/* TAB: SYSTEM */}
              <View style={[styles.tabContentContainer, { display: activeTab === "SYSTEM" ? "flex" : "none" }]}>
                <View style={styles.card}>
                  <Text style={styles.cardTitle}>SYSTEM PREFERENCES</Text>
                  
                  <Text style={[styles.cardHeaderLabel, { marginTop: 16, marginBottom: 8 }]}>INTERFACE LANGUAGE</Text>
                  <View style={styles.languagePickerRow}>
                    {getSupportedLanguages().map((opt) => (
                      <Pressable
                        key={opt.code}
                        style={[
                          styles.languageChip,
                          language === opt.code && styles.languageChipActive,
                        ]}
                        onPress={() => void changeLanguage(opt.code)}
                      >
                        <Text style={[
                          styles.languageChipText,
                          language === opt.code ? { color: "#000000" } : {}
                        ]}>
                          {opt.label}
                        </Text>
                      </Pressable>
                    ))}
                  </View>
                </View>

                <View style={styles.card}>
                  <Text style={styles.cardTitle}>MAINTENANCE & SECURITY</Text>
                  
                  <View style={styles.stackGapMarginTop}>
                      <Pressable style={({ pressed }) => [styles.buttonSecondary, pressed && styles.buttonSecondaryPressed]} onPress={syncQueue}>
                       <Text style={styles.buttonSecondaryText}>SYNC OFFLINE QUEUE ({queueCount})</Text>
                    </Pressable>
                      <Pressable style={({ pressed }) => [styles.buttonSecondary, pressed && styles.buttonSecondaryPressed]} onPress={toggleOffline}>
                       <Text style={styles.buttonSecondaryText}>{state.offline ? "DISENGAGE OFFLINE MODE" : "ENGAGE OFFLINE MODE"}</Text>
                    </Pressable>
                      <Pressable style={({ pressed }) => [styles.buttonSecondary, { borderColor: DANGER_COLOR }, pressed && styles.buttonSecondaryPressed]} onPress={lockTerminal}>
                       <Text style={[styles.buttonSecondaryText, { color: DANGER_COLOR }]}>SIGN OUT / LOCK TERMINAL</Text>
                    </Pressable>
                  </View>
                </View>
              </View>

            </Animated.View>
          </ScrollView>

          {/* WEB RIGHT COLUMN */}
          {isWeb && (
            <ScrollView
              style={styles.webRightCol}
              contentContainerStyle={styles.webColContent}
              showsVerticalScrollIndicator={false}
            >
              <View style={styles.card}>
                <Text style={styles.cardHeaderLabel}>SQUAD ACTIVITY</Text>
                <Text style={[styles.cardTitle, { marginTop: 6 }]}>PeakPact Elite 100</Text>
                <Text style={styles.cardSubtitle}>Consistency Rate: 92%</Text>

                <View style={[styles.separator, { marginVertical: 16 }]} />

                <View style={styles.stackGap}>
                  <View style={styles.activityFeedItemCompact}>
                     <Text style={styles.activityFeedName}>Alex completed 45m Deep Work</Text>
                     <Text style={[styles.activityFeedTime, { color: ACCENT_GREEN }]}>+15 PP</Text>
                  </View>
                  <View style={styles.activityFeedItemCompact}>
                     <Text style={styles.activityFeedName}>Marcus started Heavy Lift</Text>
                     <Text style={styles.activityFeedTime}>In Progress</Text>
                  </View>
                  <View style={styles.activityFeedItemCompact}>
                     <Text style={styles.activityFeedName}>Jordan completed Code Sprint</Text>
                     <Text style={[styles.activityFeedTime, { color: ACCENT_GREEN }]}>+18 PP</Text>
                  </View>
                </View>
              </View>

              <View style={styles.card}>
                <Text style={styles.cardHeaderLabel}>DAILY CHALLENGE</Text>
                <Text style={[styles.cardTitle, { marginTop: 6, fontSize: 16 }]}>{dailyChallenge.title}</Text>
                <Text style={[styles.heroSubtitle, { marginTop: 6 }]}>{dailyChallenge.body}</Text>
              </View>
            </ScrollView>
          )}

        </View>

        {tutorialStep !== null && (
          <TutorialOverlay
            step={tutorialStep}
            accent={ACCENT_GREEN}
            onNext={handleTutorialNext}
            onPrev={handleTutorialPrev}
            onSkip={handleTutorialSkip}
            steps={tutorialSteps}
            language={language}
          />
        )}
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

// ────────────────────────────────────────────────────────────────────────────
// APPLICATION STYLES (APPLE / LINEAR / NOTION OS DESIGN SYSTEM SPECIFICATION)
// ────────────────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: BG_COLOR,
  },
  keyboardShell: {
    flex: 1,
    backgroundColor: BG_COLOR,
  },
  appShell: {
    padding: 20,
    backgroundColor: BG_COLOR,
  },
  shell: {
    flex: 1,
    backgroundColor: BG_COLOR,
  },
  shellContent: {
    paddingBottom: 48,
  },
  tabContentContainer: {
    marginBottom: 16,
  },
  successToast: {
    position: "absolute",
    top: 56,
    left: 24,
    right: 24,
    zIndex: 500,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "rgba(0,255,136,0.4)",
    backgroundColor: "rgba(8,28,20,0.95)",
    paddingVertical: 10,
    paddingHorizontal: 14,
    alignItems: "center",
  },
  successToastText: {
    color: "#A8FFD6",
    fontSize: 12,
    fontWeight: "700",
    letterSpacing: 0.6,
  },

  // CARDS & SYSTEM SHELLS
  card: {
    backgroundColor: SURFACE,
    borderRadius: Platform.OS === "web" ? 26 : 22,
    padding: Platform.OS === "web" ? 26 : 22,
    borderWidth: 1,
    borderColor: BORDER_COLOR,
    shadowColor: "#000000",
    shadowOpacity: Platform.OS === "web" ? 0.18 : 0.1,
    shadowRadius: Platform.OS === "web" ? 22 : 12,
    shadowOffset: { width: 0, height: Platform.OS === "web" ? 10 : 6 },
    elevation: Platform.OS === "android" ? 2 : 0,
  },
  heroCard: {
    backgroundColor: SURFACE,
    borderRadius: Platform.OS === "web" ? 30 : 24,
    padding: Platform.OS === "web" ? 30 : 24,
    borderWidth: 1,
    borderColor: BORDER_COLOR,
    shadowColor: "#000000",
    shadowOpacity: Platform.OS === "web" ? 0.22 : 0.12,
    shadowRadius: Platform.OS === "web" ? 26 : 14,
    shadowOffset: { width: 0, height: Platform.OS === "web" ? 12 : 7 },
    elevation: Platform.OS === "android" ? 3 : 0,
  },
  heroTopRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 10,
  },
  cardHeaderLabel: {
    color: SECONDARY_TEXT,
    fontSize: 11,
    fontWeight: "700",
    letterSpacing: 1.2,
    textTransform: "uppercase",
  },
  cardTitle: {
    color: PRIMARY_TEXT,
    fontSize: 20,
    fontWeight: "600",
    letterSpacing: -0.3,
  },
  cardSubtitle: {
    color: SECONDARY_TEXT,
    fontSize: 14,
    lineHeight: 20,
  },
  cardSubtitleFooter: {
    color: SECONDARY_TEXT,
    fontSize: 12,
    marginTop: 8,
  },
  heroTitle: {
    color: PRIMARY_TEXT,
    fontSize: 28,
    fontWeight: "700",
    letterSpacing: -0.5,
    marginBottom: 6,
  },
  heroSubtitle: {
    color: SECONDARY_TEXT,
    fontSize: 14,
    lineHeight: 22,
  },

  // INPUTS
  input: {
    backgroundColor: "#0D0F12",
    borderRadius: 16,
    borderWidth: 1,
    borderColor: BORDER_COLOR,
    padding: 18,
    color: PRIMARY_TEXT,
    fontSize: 15,
  },

  // BUTTONS
  buttonPrimary: {
    backgroundColor: ACCENT_GREEN,
    height: Platform.OS === "web" ? 60 : 64,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 8,
    shadowColor: "#000000",
    shadowOpacity: Platform.OS === "web" ? 0.14 : 0.12,
    shadowRadius: Platform.OS === "web" ? 12 : 8,
    shadowOffset: { width: 0, height: 6 },
    elevation: Platform.OS === "android" ? 3 : 0,
  },
  buttonPrimaryText: {
    color: "#000000",
    fontSize: 16,
    fontWeight: "700",
    letterSpacing: 0.5,
  },
  buttonPrimaryPressed: {
    transform: [{ scale: 0.985 }],
    opacity: 0.94,
  },
  buttonSecondary: {
    backgroundColor: SECONDARY_SURFACE,
    borderRadius: 16,
    height: Platform.OS === "web" ? 52 : 54,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: BORDER_COLOR,
  },
  buttonSecondaryText: {
    color: PRIMARY_TEXT,
    fontSize: 14,
    fontWeight: "600",
  },
  buttonSecondaryPressed: {
    transform: [{ scale: 0.985 }],
    opacity: 0.92,
  },
  buttonVoice: {
    backgroundColor: SECONDARY_SURFACE,
    borderRadius: 16,
    width: 64,
    height: 64,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: BORDER_COLOR,
  },

  // QUICK DEPLOY GRID
  quickDeployGrid: {
    flexDirection: "row",
  },
  quickDeployCard: {
    flex: 1,
    backgroundColor: SECONDARY_SURFACE,
    borderRadius: 20,
    padding: 16,
    borderWidth: 1,
    borderColor: BORDER_COLOR,
    alignItems: "center",
    marginRight: 12,
  },
  quickDeployCardPressed: {
    transform: [{ scale: 0.98 }],
    opacity: 0.9,
  },
  quickDeployNumber: {
    color: ACCENT_GREEN,
    fontSize: 20,
    fontWeight: "700",
  },
  quickDeploySub: {
    color: SECONDARY_TEXT,
    fontSize: 11,
    fontWeight: "600",
    marginTop: 4,
    textTransform: "uppercase",
  },

  // STATS & METRICS GRID
  statsRowGrid: {
    flexDirection: "row",
  },
  statCardItem: {
    flex: 1,
    backgroundColor: SURFACE,
    borderRadius: 20,
    padding: 18,
    borderWidth: 1,
    borderColor: BORDER_COLOR,
    marginRight: 12,
  },
  statLabelMuted: {
    color: SECONDARY_TEXT,
    fontSize: 11,
    fontWeight: "700",
    letterSpacing: 1,
    marginBottom: 6,
  },
  statValueLarge: {
    color: PRIMARY_TEXT,
    fontSize: 28,
    fontWeight: "700",
    letterSpacing: -0.5,
  },
  statValueBold: {
    color: PRIMARY_TEXT,
    fontSize: 16,
    fontWeight: "700",
  },
  statSubLabel: {
    color: SECONDARY_TEXT,
    fontSize: 11,
    marginTop: 4,
  },
  statRowFlex: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },

  // LAYOUT HELPERS REPLACING GAP
  stackGap: {
    marginBottom: 12,
  },
  stackGapMarginTop: {
    marginTop: 16,
  },
  rowFlexGap: {
    flexDirection: "row",
  },
  rowFlexGapMarginTop: {
    flexDirection: "row",
    marginTop: 16,
  },

  // MOBILE GREETING
  mobileTopGreetingRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
  },
  greetingText: {
    color: SECONDARY_TEXT,
    fontSize: 14,
  },
  operatorNameHeading: {
    color: PRIMARY_TEXT,
    fontSize: 24,
    fontWeight: "700",
    letterSpacing: -0.5,
  },
  streakBadgeMini: {
    backgroundColor: SECONDARY_SURFACE,
    borderRadius: 14,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderWidth: 1,
    borderColor: BORDER_COLOR,
  },
  streakBadgeMiniText: {
    color: PRIMARY_TEXT,
    fontSize: 12,
    fontWeight: "600",
  },

  // EXECUTION TIMER
  timerDialLarge: {
    fontSize: 64,
    fontWeight: "700",
    marginVertical: 18,
    fontVariant: ["tabular-nums"],
  },

  // SQUAD & ACTIVITY FEED
  activityFeedRow: {
    backgroundColor: SECONDARY_SURFACE,
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: BORDER_COLOR,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 8,
  },
  activityFeedItemCompact: {
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: BORDER_COLOR,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  activityFeedName: {
    color: PRIMARY_TEXT,
    fontSize: 13,
    fontWeight: "600",
  },
  activityFeedTime: {
    color: SECONDARY_TEXT,
    fontSize: 11,
    marginTop: 2,
  },
  successPill: {
    backgroundColor: "rgba(156,226,42,0.1)",
    borderRadius: 12,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  successPillText: {
    color: ACCENT_GREEN,
    fontSize: 10,
    fontWeight: "700",
  },
  warningPill: {
    backgroundColor: "rgba(255,200,87,0.1)",
    borderRadius: 12,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  warningPillText: {
    color: WARNING_COLOR,
    fontSize: 10,
    fontWeight: "700",
  },

  // STORE THEME CARDS
  storeThemeCard: {
    backgroundColor: SECONDARY_SURFACE,
    borderRadius: 20,
    padding: 18,
    borderWidth: 1,
    borderColor: BORDER_COLOR,
    marginBottom: 12,
  },
  premiumHeroCard: {
    borderRadius: 18,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.14)",
    backgroundColor: "#121925",
    padding: 14,
    marginTop: 16,
    marginBottom: 14,
  },
  premiumHeroEyebrow: {
    color: "#94A7BE",
    fontSize: 11,
    fontWeight: "700",
    letterSpacing: 1.1,
    textTransform: "uppercase",
    marginBottom: 6,
  },
  premiumHeroTitle: {
    color: "#F5F5F5",
    fontSize: 20,
    fontWeight: "700",
    letterSpacing: -0.2,
    marginBottom: 6,
  },
  premiumHeroSubtitle: {
    color: "#AFC0D2",
    fontSize: 13,
    lineHeight: 19,
  },
  premiumPillarsRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    marginTop: 10,
  },
  premiumPillarChip: {
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.14)",
    backgroundColor: "rgba(255,255,255,0.04)",
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 6,
    marginRight: 8,
    marginBottom: 8,
  },
  premiumPillarText: {
    color: "#DCE6F2",
    fontSize: 11,
    fontWeight: "600",
  },
  paywallPrimaryButton: {
    backgroundColor: "#EAF1F8",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.3)",
  },
  paywallPrimaryButtonText: {
    color: "#0E141D",
    letterSpacing: 0.4,
  },
  paywallSecondaryButton: {
    backgroundColor: "#141C26",
    borderColor: "rgba(255,255,255,0.14)",
  },
  paywallSecondaryButtonText: {
    color: "#DDE7F3",
  },
  statusBadgeChip: {
    borderRadius: 12,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderWidth: 1,
    borderColor: BORDER_COLOR,
    backgroundColor: SURFACE,
  },
  statusBadgeChipText: {
    color: SECONDARY_TEXT,
    fontSize: 10,
    fontWeight: "700",
  },

  // PROFILE / NARRATIVE
  narrativeRewardRow: {
    backgroundColor: SECONDARY_SURFACE,
    borderRadius: 14,
    padding: 14,
    borderWidth: 1,
    borderColor: BORDER_COLOR,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },

  // SYSTEM / LANGUAGE
  languagePickerRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    marginTop: 8,
  },
  languageChip: {
    backgroundColor: SECONDARY_SURFACE,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: BORDER_COLOR,
    marginRight: 10,
    marginBottom: 10,
  },
  languageChipActive: {
    backgroundColor: ACCENT_GREEN,
    borderColor: ACCENT_GREEN,
  },
  languageChipText: {
    color: PRIMARY_TEXT,
    fontSize: 12,
    fontWeight: "600",
  },

  // MISC UTILS
  separator: {
    height: 1,
    backgroundColor: BORDER_COLOR,
  },
  progressBarShell: {
    height: 6,
    backgroundColor: SECONDARY_SURFACE,
    borderRadius: 3,
    marginTop: 16,
    overflow: "hidden",
  },
  progressBarFill: {
    height: 6,
    backgroundColor: ACCENT_GREEN,
  },

  // ONBOARDING MODAL STYLES
  onboardingOverlay: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 100,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0,0,0,0.85)",
    padding: 24,
  },
  onboardingCard: {
    backgroundColor: SURFACE,
    borderRadius: 24,
    padding: 28,
    width: "100%",
    maxWidth: 420,
    borderWidth: 1,
    borderColor: BORDER_COLOR,
  },
  onboardingLabel: {
    color: ACCENT_GREEN,
    fontSize: 12,
    fontWeight: "700",
    marginBottom: 8,
    letterSpacing: 1,
    textTransform: "uppercase",
  },
  onboardingTitle: {
    color: PRIMARY_TEXT,
    fontSize: 22,
    fontWeight: "700",
    marginBottom: 12,
    letterSpacing: -0.5,
  },
  onboardingBody: {
    color: SECONDARY_TEXT,
    fontSize: 15,
    lineHeight: 24,
    marginBottom: 20,
  },
  onboardingSteps: {
    marginBottom: 24,
  },
  onboardingStep: {
    color: PRIMARY_TEXT,
    fontSize: 14,
    marginBottom: 8,
    fontWeight: "500",
  },
  onboardingActionRow: {
    marginBottom: 28,
  },
  onboardingActionLabel: {
    color: SECONDARY_TEXT,
    fontSize: 11,
    marginBottom: 4,
    fontWeight: "700",
    textTransform: "uppercase",
    letterSpacing: 1,
  },
  onboardingActionValue: {
    color: PRIMARY_TEXT,
    fontSize: 15,
    fontWeight: "600",
  },

  // WEB LAYOUT SPECIFICATIONS
  mobileColumnWrapper: { flex: 1 },
  webColumnsRow: { flex: 1, flexDirection: "row" },
  webGlobalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 26,
    paddingVertical: 16,
    backgroundColor: SURFACE,
    borderBottomWidth: 1,
    borderBottomColor: BORDER_COLOR,
  },
  webGlobalTitle: { color: PRIMARY_TEXT, fontSize: 15, fontWeight: "700", letterSpacing: 0.5 },
  webGlobalCenter: { flexDirection: "row" },
  webGlobalTime: { color: SECONDARY_TEXT, fontSize: 13, fontWeight: "500" },
  webGlobalAuth: { color: SECONDARY_TEXT, fontSize: 13, fontWeight: "500" },
  webLeftCol: { width: 336, borderRightWidth: 1, borderRightColor: BORDER_COLOR, backgroundColor: BG_COLOR },
  webCenterCol: { flex: 1 },
  webRightCol: { width: 336, borderLeftWidth: 1, borderLeftColor: BORDER_COLOR, backgroundColor: BG_COLOR },
  webColContent: { padding: 22 },
});
