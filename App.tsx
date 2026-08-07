import Purchases, { LOG_LEVEL } from "react-native-purchases";

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
  AppState as NativeAppState,
  ImageBackground,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import AnimatedReanimated, {
  useAnimatedStyle,
  withTiming,
} from "react-native-reanimated";
import AccessGate from "./src/components/AccessGate";
import BootSequence from "./src/components/BootSequence";
import BrandMark from "./src/components/BrandMark";
import PactRing from "./src/components/PactRing";
import {
  buildStructuredVerification,
  submitToVerificationEngine,
  type PactContract,
} from "./src/services/aiService";
import {
  buildComplianceNotice,
  createDefaultComplianceConsent,
  getPrivacyPolicyText,
  getTermsOfUseText,
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
import { getLaunchMetadata } from "./src/services/launchConfig";
import { getLaunchCopyPack } from "./src/services/launchPack";
import {
  getActiveProductPlan,
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
  uploadVoicePayload,
} from "./src/services/voiceService";
import { formatMissionCountdown } from "./src/services/missionTimer";
import { evaluateDailySweep } from "./src/services/dailySweep";
import {
  applyStatusEffectToReward,
  deriveProtocolArchetype,
  evaluateFocusLockViolation,
  getProtocolStatusEffect,
  // getStabilizationUsageState,
} from "./src/services/protocolSystem";
import {
  generateMissionBriefing,
  getConsequencePacket,
  getDailyLoopGuide,
  getFirstSessionGuide,
  getHeroSummary,
  getHowToUseSystemSteps,
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
  getRecoveryVisualState,
  isRedFlashActive,
  shouldPulseRedFlash,
} from "./src/services/flashState";
import {
  assignCaptainTask,
  createSeedSquads,
  createSquad,
  joinSquad,
  leaveSquad,
  sendSquadMessage,
  type Squad,
} from "./src/services/squadSystem";
import { loadPersistedAppState, savePersistedAppState } from "./src/services/appStateStorage";
import {
  getDailyChallenge,
  getPremiumBoostSummary,
} from "./src/services/eliteLoop";
import {
  getDesignTemplateById,
  getDesignTemplates,
  purchaseDesignTemplate,
  type DesignTemplateId,
} from "./src/services/designTemplates";
import {
  initAudio,
  playTemplateSound,
  unloadAudio,
} from "./src/services/soundEngine";

type PactStatus = "ACTIVE" | "ALERT" | "SYNCING" | "REDSTATE";

const MATRIX_GREEN = "#25F9D5";
const AMBER = "#FFC95C";
const CRIMSON = "#FF4ED8";
const PEAK_CRIMSON = "#FF5DBD";
const BONE_WHITE = "#F7FCFF";
const LOCAL_ACCESS_SESSION_KEY = "@peakpact/local-access-session";
const terminalBackdrop = require("./assets/elite-backdrop.jpeg");
const peakpactIcon = require("./assets/icon.png");
const peakpactAdaptiveIcon = require("./assets/adaptive-icon.png");
const peakpactSplash = require("./assets/elite-splash.jpg");

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
    "> PEAKPACT MAINFRAME ONLINE.",
    "> ZERO TOLERANCE PROTOCOL ACTIVE.",
    "> CONTRACTS ARE BINDING. NO EMPTY MOTIVATION.",
  ],
  overseerLines: [
    "> CAPTAINS: OBJECTIVE OVERSIGHT ACTIVE.",
    "> HOSTILE MODE: STANDBY.",
  ],
  redState: false,
  levelFlash: false,
  protocolArchetypeName: "ADAPTIVE PILOT",
  protocolArchetypeDescription:
    "A flexible protocol runner whose behavior shifts with the current pressure.",
  protocolStatusEffect: "NONE" as const,
  stabilizationUsesToday: 0,
  stabilizationResetDate: todayKey(),
  flashSuppressed: false,
  missionTitle: "BASELINE NODE / STEADY OPERATION",
  missionDescription:
    "A clean mission designed to deepen the current contract without pushing the system too hard.",
  missionRisk: "LOW" as const,
  missionRewardBonus: 3,
  missionTimeWindowMinutes: 20,
  missionContractTemplate:
    "Complete a 30 minute focused execution block and produce a measurable result.",
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

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

// ── Navigation ───────────────────────────────────────────────────────────
type AppTab = "PACT" | "SQUAD" | "STORE" | "PROFILE" | "SYSTEM";

const _tabBarSS = StyleSheet.create({
  bar: {
    flexDirection: "row",
    borderBottomWidth: 1,
    borderBottomColor: "rgba(255,42,42,0.2)",
    backgroundColor: "rgba(0,0,0,0.97)",
  },
  item: { flex: 1, alignItems: "center", paddingVertical: 9 },
  dot: { height: 2, width: "55%", marginBottom: 5, borderRadius: 1 },
  lbl: {
    fontFamily: "monospace",
    fontSize: 9,
    fontWeight: "700",
    letterSpacing: 1.2,
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
          style={_tabBarSS.item}
          onPress={() => onPress(tab.id)}
        >
          <View
            style={[
              _tabBarSS.dot,
              { backgroundColor: active === tab.id ? accent : "transparent" },
            ]}
          />
          <Text
            style={[
              _tabBarSS.lbl,
              { color: active === tab.id ? accent : `${accent}55` },
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
    borderWidth: 1,
    borderRadius: 8,
    padding: 12,
    marginBottom: 10,
    backgroundColor: "rgba(0,0,0,0.62)",
  },
  title: {
    fontFamily: "monospace",
    fontSize: 10,
    fontWeight: "700",
    letterSpacing: 1.5,
    marginBottom: 5,
    textTransform: "uppercase",
  },
  body: {
    color: BONE_WHITE,
    fontFamily: "monospace",
    fontSize: 11,
    lineHeight: 17,
    opacity: 0.72,
  },
});

function SectionIntro({
  intro,
  accent,
}: {
  intro: { title: string; body: string };
  accent: string;
}) {
  return (
    <View style={[_sectionSS.box, { borderColor: `${accent}44` }]}>
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
    backgroundColor: "rgba(0,0,0,0.87)",
    justifyContent: "center",
    alignItems: "center",
    zIndex: 9999,
    padding: 20,
  },
  card: {
    width: "100%",
    maxWidth: 460,
    borderWidth: 1,
    borderRadius: 12,
    padding: 20,
    backgroundColor: "rgba(8,0,0,0.99)",
  },
  topRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 14,
  },
  stepCt: {
    color: "#F4F4F555",
    fontFamily: "monospace",
    fontSize: 9,
    letterSpacing: 1.5,
  },
  skip: { fontFamily: "monospace", fontSize: 9, letterSpacing: 1 },
  progRow: { flexDirection: "row", gap: 4, marginBottom: 16 },
  progDot: { flex: 1, height: 3, borderRadius: 2 },
  title: {
    fontFamily: "monospace",
    fontSize: 14,
    fontWeight: "700",
    letterSpacing: 1.5,
    marginBottom: 10,
  },
  body: {
    color: BONE_WHITE,
    fontFamily: "monospace",
    fontSize: 12,
    lineHeight: 20,
    marginBottom: 14,
    opacity: 0.88,
  },
  hint: { borderWidth: 1, borderRadius: 6, padding: 10, marginBottom: 18 },
  hintTxt: {
    fontFamily: "monospace",
    fontSize: 11,
    fontWeight: "700",
    letterSpacing: 0.5,
  },
  actions: { flexDirection: "row", gap: 8, alignItems: "center" },
  btnBack: {
    flex: 1,
    borderWidth: 1,
    borderRadius: 6,
    paddingVertical: 10,
    alignItems: "center",
    justifyContent: "center",
    minHeight: 38,
  },
  btnBkTxt: {
    fontFamily: "monospace",
    fontSize: 11,
    fontWeight: "700",
    letterSpacing: 1,
  },
  btnNext: {
    flex: 2,
    borderRadius: 6,
    paddingVertical: 10,
    alignItems: "center",
  },
  btnNxTxt: {
    color: "#000000",
    fontFamily: "monospace",
    fontSize: 11,
    fontWeight: "700",
    letterSpacing: 1,
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
      <View style={[_tutSS.card, { borderColor: accent }]}>
        <View style={_tutSS.topRow}>
          <Text style={_tutSS.stepCt}>
            {getLocalizedText("tutorialStepLabel", language)} {step + 1} / {steps.length}
          </Text>
          <Pressable onPress={onSkip}>
            <Text style={[_tutSS.skip, { color: `${accent}99` }]}>
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
                { backgroundColor: i <= step ? accent : `${accent}33` },
              ]}
            />
          ))}
        </View>
        <Text style={[_tutSS.title, { color: accent }]}>{current.title}</Text>
        <Text style={_tutSS.body}>{current.body}</Text>
        <View
          style={[
            _tutSS.hint,
            { borderColor: `${accent}55`, backgroundColor: `${accent}0D` },
          ]}
        >
          <Text style={[_tutSS.hintTxt, { color: accent }]}>
            ▶ {current.hint}
          </Text>
        </View>
        <View style={_tutSS.actions}>
          <Pressable
            style={[_tutSS.btnBack, { borderColor: `${accent}55` }]}
            onPress={step > 0 ? onPrev : undefined}
          >
            {step > 0 ? (
              <Text style={[_tutSS.btnBkTxt, { color: accent }]}>{getLocalizedText("tutorialBackLabel", language)}</Text>
            ) : null}
          </Pressable>
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

// Lightweight node-graph widget for the web right column
function NetworkMapWidget({
  accent,
  nodeCount,
}: {
  accent: string;
  nodeCount: number;
}) {
  const nodes: { x: number; y: number }[] = [
    { x: 90, y: 30 },
    { x: 30, y: 80 },
    { x: 150, y: 80 },
    { x: 55, y: 130 },
    { x: 125, y: 130 },
  ];
  const edges = [
    [0, 1],
    [0, 2],
    [1, 3],
    [2, 4],
    [1, 2],
    [3, 4],
  ];
  return (
    <View style={{ height: 160 }}>
      {edges.map(([a, b], i) => {
        const from = nodes[a];
        const to = nodes[b];
        const dx = to.x - from.x;
        const dy = to.y - from.y;
        const len = Math.sqrt(dx * dx + dy * dy);
        const angle = Math.atan2(dy, dx) * (180 / Math.PI);
        return (
          <View
            key={i}
            style={{
              position: "absolute",
              left: from.x,
              top: from.y,
              width: len,
              height: 1,
              backgroundColor: accent,
              opacity: 0.3,
              transformOrigin: "0 0",
              transform: [
                { translateX: 0 },
                { translateY: 0 },
                { rotate: `${angle}deg` },
              ],
            }}
          />
        );
      })}
      {nodes.slice(0, Math.min(nodeCount, nodes.length)).map((node, i) => (
        <View
          key={i}
          style={{
            position: "absolute",
            left: node.x - 10,
            top: node.y - 10,
            width: 20,
            height: 20,
            borderRadius: 10,
            borderWidth: 1.5,
            borderColor: accent,
            backgroundColor: i === 0 ? `${accent}33` : "rgba(0,0,0,0.7)",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <Text style={{ color: accent, fontFamily: "monospace", fontSize: 5 }}>
            {i === 0 ? "YOU" : `N${i}`}
          </Text>
        </View>
      ))}
    </View>
  );
}

const TEMPLATE_PRESS_CONFIGS: Record<
  DesignTemplateId,
  {
    scale: number;
    opacity: number;
    inMs: number;
    spring: { stiffness: number; damping: number; mass: number };
  }
> = {
  "terminal-cyber-dungeon": {
    scale: 0.91,
    opacity: 0.7,
    inMs: 50,
    spring: { stiffness: 440, damping: 8, mass: 0.65 },
  },
  "mecha-hud-pilot": {
    scale: 0.93,
    opacity: 0.76,
    inMs: 90,
    spring: { stiffness: 160, damping: 6, mass: 1.3 },
  },
  "litrpg-stat-sheet": {
    scale: 0.95,
    opacity: 0.82,
    inMs: 45,
    spring: { stiffness: 390, damping: 14, mass: 0.6 },
  },
  "apex-megacorp-os": {
    scale: 0.97,
    opacity: 0.88,
    inMs: 115,
    spring: { stiffness: 270, damping: 22, mass: 1.1 },
  },
  core: {
    scale: 0.98,
    opacity: 0.86,
    inMs: 75,
    spring: { stiffness: 300, damping: 12, mass: 1.0 },
  },
};

type TemplatedPressableProps = React.ComponentProps<typeof Pressable> & {
  templateId: DesignTemplateId;
};

function TemplatedPressable({
  templateId,
  onPressIn,
  onPressOut,
  children,
  style,
  ...rest
}: TemplatedPressableProps) {
  const pressAnim = useRef(new Animated.Value(1)).current;
  const cfg =
    TEMPLATE_PRESS_CONFIGS[templateId] ?? TEMPLATE_PRESS_CONFIGS["core"];

  const handlePressIn = useCallback(
    (
      e: Parameters<
        NonNullable<React.ComponentProps<typeof Pressable>["onPressIn"]>
      >[0],
    ) => {
      playTemplateSound(templateId);
      Animated.timing(pressAnim, {
        toValue: 0,
        duration: cfg.inMs,
        useNativeDriver: true,
      }).start();
      onPressIn?.(e);
    },
    [pressAnim, cfg.inMs, onPressIn, templateId],
  );

  const handlePressOut = useCallback(
    (
      e: Parameters<
        NonNullable<React.ComponentProps<typeof Pressable>["onPressOut"]>
      >[0],
    ) => {
      Animated.spring(pressAnim, {
        toValue: 1,
        useNativeDriver: true,
        ...cfg.spring,
      }).start();
      onPressOut?.(e);
    },
    [pressAnim, cfg.spring, onPressOut],
  );

  const scaleAnim = pressAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [cfg.scale, 1],
  });
  const opacityAnim = pressAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [cfg.opacity, 1],
  });

  return (
    <AnimatedPressable
      style={[
        style as object,
        { transform: [{ scale: scaleAnim }], opacity: opacityAnim },
      ]}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      {...rest}
    >
      {children}
    </AnimatedPressable>
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
  const [screenJitter, setScreenJitter] = useState(false);
  const [pulsePhase, setPulsePhase] = useState(0);
  const [scanOffset, setScanOffset] = useState(0);
  const [statusMessage, setStatusMessage] = useState("SYSTEM READY");
  const [, setShowMonetization] = useState(false);
  const [onboardingSeen, setOnboardingSeen] = useState(false);
  const [language, setLanguage] = useState<SupportedLanguage>("en");
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
      PACT: {
        title: translate("introPactTitle"),
        body: translate("introPactBody"),
      },
      SQUAD: {
        title: translate("introSquadTitle"),
        body: translate("introSquadBody"),
      },
      STORE: {
        title: translate("introStoreTitle"),
        body: translate("introStoreBody"),
      },
      PROFILE: {
        title: translate("introProfileTitle"),
        body: translate("introProfileBody"),
      },
      SYSTEM: {
        title: translate("introSystemTitle"),
        body: translate("introSystemBody"),
      },
    }),
    [translate],
  );
  const pactMacros = useMemo(
    () => [
      {
        label: translate("macroFocusLabel"),
        value: translate("macroFocusValue"),
        duration: 45,
        stake: 20,
      },
      {
        label: translate("macroRecoveryLabel"),
        value: translate("macroRecoveryValue"),
        duration: 30,
        stake: 12,
      },
      {
        label: translate("macroExecuteLabel"),
        value: translate("macroExecuteValue"),
        duration: 60,
        stake: 30,
      },
      {
        label: translate("macroResetLabel"),
        value: translate("macroResetValue"),
        duration: 15,
        stake: 10,
      },
    ],
    [translate],
  );
  
  const [hasHydratedPersistence, setHasHydratedPersistence] = useState(false);
  const [showComplianceScreen, setShowComplianceScreen] = useState(false);
  const [deviceTrialStartedAt, setDeviceTrialStartedAt] = useState<
    string | null
  >(null);
  const [ownedDesignTemplates, setOwnedDesignTemplates] = useState<
    DesignTemplateId[]
  >(["core"]);
  const [selectedDesignTemplateId, setSelectedDesignTemplateId] =
    useState<DesignTemplateId>("core");
  const [templateMessage, setTemplateMessage] = useState<string | null>(null);
  const [trialClockMs, setTrialClockMs] = useState(Date.now());
  const [contractTask, setContractTask] = useState(
    "Complete a focused 45-minute study sprint",
  );
  const [contractDuration, setContractDuration] = useState("45");
  const [contractStake, setContractStake] = useState("20");
  const [complianceConsent, setComplianceConsent] = useState<ComplianceConsent>(
    createDefaultComplianceConsent(),
  );
  const [missionCountdown, setMissionCountdown] = useState(
    formatMissionCountdown(createInitialState().activePactDeadline),
  );
  const [squads, setSquads] = useState<Squad[]>(() => createSeedSquads());
  const [squadName, setSquadName] = useState("");
  const [squadDescription, setSquadDescription] = useState("");
  const [squadFocus, setSquadFocus] = useState("Study and recovery");
  const [squadGoal, setSquadGoal] = useState(
    "Complete 5 shared missions this week",
  );
  const [squadVisibility, setSquadVisibility] = useState<"PUBLIC" | "PRIVATE">(
    "PUBLIC",
  );
  const [squadJoinCode, setSquadJoinCode] = useState("");
  const [squadMemberName, setSquadMemberName] = useState("Nova");
  const [squadChatText, setSquadChatText] = useState("");
  const [captainTaskTarget, setCaptainTaskTarget] = useState("");
  const [captainTaskText, setCaptainTaskText] = useState(
    "Complete a 30-minute recovery sprint",
  );
  const [activeSquadId, setActiveSquadId] = useState<string | null>(null);
  const [leaveSquadConfirmOpen, setLeaveSquadConfirmOpen] = useState(false);
  const [cliInput, setCliInput] = useState("");
  const [militaryTime, setMilitaryTime] = useState("00:00:00");
  const isWeb = Platform.OS === "web";
  // null = still checking AsyncStorage; false = show boot; true = skip boot
  const [bootReady, setBootReady] = useState<boolean | null>(null);
  const [activeTab, setActiveTab] = useState<AppTab>("PACT");
  const [pactFlowMode, setPactFlowMode] = useState<"planning" | "execution">(
    "planning",
  );
  const [executionCountdown, setExecutionCountdown] = useState(5);
  const [tutorialStep, setTutorialStep] = useState<number | null>(null);
  const [tutorialCompleted, setTutorialCompleted] = useState(false);
  const tutorialSteps = useMemo(() => getTutorialSteps(language), [language]);
  const mainScrollRef = useRef<ScrollView>(null);
  const [leaveSquadCountdown, setLeaveSquadCountdown] = useState(0);
  const leaveSquadPulse = useRef(new Animated.Value(1)).current;
  const eliteOverrideActive = isPeakPactEliteOverride(
    activeUserEmail,
    activeUserId,
  );
  const founderPrivilegesActive = useMemo(
    () =>
      canAccessFounderPrivileges({ level: state.level, pp: state.pp }) ||
      eliteOverrideActive,
    [state.level, state.pp, eliteOverrideActive],
  );
  const captainPrivilegesActive = state.level >= 99;
  
  
  const heroFloat = useRef(new Animated.Value(0)).current;
  const templatePulse = useRef(new Animated.Value(0)).current;
  const templateSweep = useRef(new Animated.Value(0)).current;
  const triggerPactFeedback = useCallback(
    (kind: "impact" | "notify") => {
      if (Platform.OS === "web") return;
      if (kind === "notify") {
        void Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      } else {
        void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      }
    },
    [],
  );
  const planningPanelStyle = useAnimatedStyle(() => ({
    opacity: withTiming(pactFlowMode === "planning" ? 1 : 0, {
      duration: 220,
    }),
    maxHeight: withTiming(pactFlowMode === "planning" ? 420 : 0, {
      duration: 220,
    }),
    overflow: "hidden",
    transform: [
      {
        scale: withTiming(pactFlowMode === "planning" ? 1 : 0.96, {
          duration: 220,
        }),
      },
    ],
  }));
  const executionPanelStyle = useAnimatedStyle(() => ({
    opacity: withTiming(pactFlowMode === "execution" ? 1 : 0, {
      duration: 240,
    }),
    maxHeight: withTiming(pactFlowMode === "execution" ? 320 : 0, {
      duration: 240,
    }),
    overflow: "hidden",
  }));
  const [, setProtocolArchetype] = useState(() =>
    deriveProtocolArchetype({
      pp: createInitialState().pp,
      streak: createInitialState().streak,
      redState: createInitialState().redState,
      overclockCount: 0,
      extensionsUsed: createInitialState().extensionsUsed,
    }),
  );

  useEffect(() => {
    const setupRevenueCat = async () => {
      try {
        Purchases.setLogLevel(LOG_LEVEL.DEBUG);
        if (Platform.OS === "android" || Platform.OS === "ios") {
          await Purchases.configure({
            apiKey: "test_EkRWwTbbsUcXStanIWZNYLGIowZ",
          });
        }
      } catch (error) {
        console.error("RevenueCat Init Error:", error);
      }
    };
    setupRevenueCat();
  }, []);

  useEffect(() => {
    const hydrateAccessSession = async () => {
      if (!isLiveAuthEnabled()) {
        try {
          const storedSession = await AsyncStorage.getItem(
            LOCAL_ACCESS_SESSION_KEY,
          );
          if (storedSession) {
            const parsedSession = JSON.parse(
              storedSession,
            ) as LocalAccessSession;
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
        setOperatorCodename(
          extractOperatorCodename(session.user, session.user.email),
        );
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
        setOperatorCodename(
          extractOperatorCodename(session.user, session.user.email),
        );
        setAccessForm((prev) => ({
          ...prev,
          email: session.user?.email ?? prev.email,
          password: "",
        }));
        return;
      }

      setAccessGranted(false);
    });

    const appStateSubscription = NativeAppState.addEventListener(
      "change",
      (nextState) => {
        if (!isLiveAuthEnabled()) {
          return;
        }

        if (nextState === "active") {
          void restoreOperatorSession();
          return;
        }

        if (
          nextState === "background" &&
          state.activePactDeadline &&
          Date.parse(state.activePactDeadline) > Date.now()
        ) {
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
              terminalLines: [
                ...prev.terminalLines,
                violation.terminalLine,
              ].slice(-14),
              overseerLines: [
                ...prev.overseerLines,
                "> CAPTAINS: DIGITAL OVERRIDE. FOCUS LOCK BREACH.",
              ].slice(-8),
            }));
            setStatusMessage("DIGITAL OVERRIDE / CONTRACT VOIDED");
          }
        }

        void Promise.resolve();
      },
    );

    return () => {
      subscription.unsubscribe();
      appStateSubscription.remove();
    };
  }, []);

  useEffect(() => {
    if (!accessGranted) {
      return;
    }

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
    if (!accessGranted) {
      return;
    }

    const interval = setInterval(() => {
      setTrialClockMs(Date.now());
    }, 60000);

    return () => clearInterval(interval);
  }, [accessGranted]);

  const deviceTrialStatus = useMemo(
    () => getDevicePremiumTrialStatus(deviceTrialStartedAt, trialClockMs),
    [deviceTrialStartedAt, trialClockMs],
  );
  const activePlan = useMemo(
    () => resolveEffectiveProductPlan(basePlan, deviceTrialStatus.active),
    [basePlan, deviceTrialStatus.active],
  );
  const effectivePlan = eliteOverrideActive ? "PREMIUM" : activePlan;
  
  

  useEffect(() => {
    if (!state.levelFlash) {
      return;
    }

    const timer = setTimeout(() => {
      setState((prev) => ({ ...prev, levelFlash: false }));
    }, 1200);

    return () => clearTimeout(timer);
  }, [state.levelFlash]);

  useEffect(() => {
    const active = isRedFlashActive({
      redState: state.redState,
      flashSuppressed: state.flashSuppressed,
      offline: state.offline,
      levelFlash: state.levelFlash,
    });

    if (!active) {
      setScreenJitter(false);
      return;
    }

    setScreenJitter(true);
    const interval = setInterval(() => {
      setScreenJitter((previous) => !previous);
    }, 120);

    return () => clearInterval(interval);
  }, [state.redState, state.flashSuppressed, state.offline, state.levelFlash]);

  useEffect(() => {
    if (
      !shouldPulseRedFlash({
        redState: state.redState,
        flashSuppressed: state.flashSuppressed,
      })
    ) {
      setPulsePhase(0);
      return;
    }

    const interval = setInterval(() => {
      setPulsePhase((previous) => (previous + 1) % 3);
    }, 180);

    return () => clearInterval(interval);
  }, [state.redState]);

  useEffect(() => {
    const interval = setInterval(() => {
      setScanOffset((previous) => (previous + 1) % 10);
    }, 55);

    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const animation = Animated.loop(
      Animated.sequence([
        Animated.timing(heroFloat, {
          toValue: -1.5,
          duration: 2200,
          useNativeDriver: true,
        }),
        Animated.timing(heroFloat, {
          toValue: 0,
          duration: 2200,
          useNativeDriver: true,
        }),
      ]),
    );

    animation.start();
    return () => animation.stop();
  }, [heroFloat]);

  useEffect(() => {
    templatePulse.setValue(0);
    templateSweep.setValue(0);

    const pulseDuration =
      selectedDesignTemplateId === "terminal-cyber-dungeon"
        ? 420
        : selectedDesignTemplateId === "mecha-hud-pilot"
          ? 920
          : selectedDesignTemplateId === "litrpg-stat-sheet"
            ? 720
            : selectedDesignTemplateId === "apex-megacorp-os"
              ? 2400
              : 1800;

    const sweepDuration =
      selectedDesignTemplateId === "mecha-hud-pilot"
        ? 1300
        : selectedDesignTemplateId === "litrpg-stat-sheet"
          ? 1500
          : 2000;

    const pulseAnimation = Animated.loop(
      Animated.sequence([
        Animated.timing(templatePulse, {
          toValue: 1,
          duration: pulseDuration,
          useNativeDriver: true,
        }),
        Animated.timing(templatePulse, {
          toValue: 0,
          duration: pulseDuration,
          useNativeDriver: true,
        }),
      ]),
    );

    const sweepAnimation = Animated.loop(
      Animated.sequence([
        Animated.timing(templateSweep, {
          toValue: 1,
          duration: sweepDuration,
          useNativeDriver: true,
        }),
        Animated.timing(templateSweep, {
          toValue: 0,
          duration: sweepDuration,
          useNativeDriver: true,
        }),
      ]),
    );

    pulseAnimation.start();
    sweepAnimation.start();

    return () => {
      pulseAnimation.stop();
      sweepAnimation.stop();
    };
  }, [selectedDesignTemplateId, templatePulse, templateSweep]);

  useEffect(() => {
    void initAudio();
    return () => unloadAudio();
  }, []);

  useEffect(() => {
    void AsyncStorage.getItem("@peakpact/boot-seen")
      .then((v) => {
        setBootReady(v === "true");
      })
      .catch(() => setBootReady(false));
  }, []);

  useEffect(() => {
    void AsyncStorage.getItem("@peakpact/tutorial-done").then((v) => {
      if (v === "true") setTutorialCompleted(true);
    });
  }, []);

  useEffect(() => {
    if (
      accessGranted &&
      onboardingSeen &&
      !tutorialCompleted &&
      tutorialStep === null
    ) {
      const timer = setTimeout(() => setTutorialStep(0), 900);
      return () => clearTimeout(timer);
    }
  }, [accessGranted, onboardingSeen, tutorialCompleted, tutorialStep]);

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
        Animated.timing(leaveSquadPulse, {
          toValue: 1.02,
          duration: 260,
          useNativeDriver: true,
        }),
        Animated.timing(leaveSquadPulse, {
          toValue: 0.98,
          duration: 260,
          useNativeDriver: true,
        }),
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
        if (prev.stabilizationResetDate === nextDayKey) {
          return prev;
        }

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
          terminalLines: [
            ...prev.terminalLines,
            consequence.terminalLine,
          ].slice(-14),
          overseerLines: [
            ...prev.overseerLines,
            consequence.overseerLine,
          ].slice(-8),
        }));
        setStatusMessage(consequence.statusLine);
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [state.activePactDeadline, state.offline, state.redState]);

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
  }, [state.pp, state.streak, state.redState, state.extensionsUsed]);

  useEffect(() => {
    const hydrateLanguage = async () => {
      const stored = await getStoredLanguage();
      const persisted = await loadPersistedAppState();
      const resolved = persisted?.language || stored;
      await initializeI18n();
      await setStoredLanguage(resolved);
      if (persisted) {
        setLanguage(resolved);
        setOnboardingSeen(persisted.onboardingSeen);
        setSquads(
          persisted.squads.length > 0 ? persisted.squads : createSeedSquads(),
        );
        setActiveSquadId(persisted.activeSquadId);
        setOwnedDesignTemplates(
          persisted.ownedDesignTemplates.length > 0
            ? persisted.ownedDesignTemplates
            : ["core"],
        );
        setSelectedDesignTemplateId(
          persisted.selectedDesignTemplateId ?? "core",
        );
      } else {
        setLanguage(stored);
      }
      setHasHydratedPersistence(true);
    };

    void hydrateLanguage();
  }, []);

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
      if (!profile) {
        return;
      }

      setState((prev) => ({
        ...prev,
        pp: profile.pp,
        level: profile.level,
        xp: profile.xp ?? 0,
        streak: profile.streak,
        lastPactDate: profile.last_pact_date || prev.lastPactDate,
        activePactDeadline:
          profile.active_pact_deadline || prev.activePactDeadline,
        extensionsUsed: profile.extensions_used ?? prev.extensionsUsed,
        redState: profile.red_state,
        status: profile.red_state ? ("REDSTATE" as PactStatus) : prev.status,
        terminalLines: [
          ...prev.terminalLines,
          "> PROFILE SYNC: REMOTE STATE RESTORED.",
        ].slice(-14),
      }));
    };

    hydrateProfile();
  }, []);

  useEffect(() => {
    const today = todayKey();
    if (state.lastPactDate === today) {
      return;
    }

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
        `> DAILY SWEEP: ${Math.max(1, Math.round((Date.parse(today) - Date.parse(state.lastPactDate)) / 86400000))} day(s) missed. -${sweep.penalty} PP.`,
        consequence.terminalLine,
      ].slice(-14),
      overseerLines: [...prev.overseerLines, consequence.overseerLine].slice(
        -8,
      ),
    }));
    setStatusMessage(consequence.statusLine);
  }, [state.lastPactDate]);

  useEffect(() => {
    if (!hasHydratedPersistence) {
      return;
    }

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
  ]);

  

  const appendLine = (line: string) => {
    setState((prev) => ({
      ...prev,
      terminalLines: [...prev.terminalLines, line].slice(-14),
    }));
  };

  const updateAccessField = (field: keyof AccessFormState, value: string) => {
    setAccessForm((prev) => ({ ...prev, [field]: value }));
    if (accessError) {
      setAccessError(null);
    }
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
        const normalizedEmail =
          validation.normalizedEmail || accessForm.email.trim().toLowerCase();
        const normalizedCodename =
          validation.normalizedCodename ||
          accessForm.email.trim().split("@")[0].toUpperCase() ||
          "OPERATOR";
        await AsyncStorage.setItem(
          LOCAL_ACCESS_SESSION_KEY,
          JSON.stringify({
            codename: normalizedCodename,
            email: normalizedEmail,
          }),
        );
        setOperatorCodename(normalizedCodename);
        setAccessError(null);
        setStatusMessage("LOCAL ACCESS GRANTED");
        setAccessGranted(true);
        setAccessForm((prev) => ({ ...prev, password: "" }));
        appendLine(`> OPERATOR ${normalizedCodename} AUTHORIZED.`);
      } catch {
        setAccessError("LOCAL ACCESS WRITE FAILED. RETRY ACCESS REQUEST.");
        setStatusMessage("LOCAL AUTH FAILURE");
      }
      return;
    }

    try {
      setAccessBusy(true);
      const normalizedEmail =
        validation.normalizedEmail || accessForm.email.trim().toLowerCase();
      const normalizedCodename =
        validation.normalizedCodename ||
        accessForm.email.trim().split("@")[0].toUpperCase() ||
        "OPERATOR";
      const result =
        accessMode === "SIGN_UP"
          ? await signUpOperator({
              email: normalizedEmail,
              password: accessForm.password.trim(),
              codename: normalizedCodename,
            })
          : await signInOperator({
              email: normalizedEmail,
              password: accessForm.password.trim(),
            });

      if (!result.ok) {
        setAccessError(result.message);
        setStatusMessage("ACCESS DENIED");
        return;
      }

      setOperatorCodename(
        extractOperatorCodename(result.user, normalizedEmail),
      );
      setActiveUserEmail(normalizedEmail);
      setActiveUserId(result.user?.id ?? null);
      setAccessError(null);
      setStatusMessage(result.message);
      setAccessGranted(!result.requiresEmailConfirmation);
      if (!result.requiresEmailConfirmation) {
        appendLine(
          `> OPERATOR ${extractOperatorCodename(result.user, normalizedEmail)} AUTHORIZED.`,
        );
      }
      setAccessForm((prev) => ({ ...prev, password: "" }));
    } catch {
      setAccessError("AUTH GATE FAILURE. RETRY ACCESS REQUEST.");
      setStatusMessage("AUTH FAILURE");
    } finally {
      setAccessBusy(false);
    }
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
    triggerPactFeedback("impact");
  }, [appendLine, complianceConsent, draft, triggerPactFeedback]);

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
          terminalLines: [
            ...prev.terminalLines,
            `> OFFLINE QUEUE LOCKED: ${trimmed}`,
          ].slice(-14),
          overseerLines: [
            ...prev.overseerLines,
            "> CAPTAINS: QUEUE LOCKED. LOCAL BUFFER ACTIVE.",
          ].slice(-8),
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
          ...newlyUnlockedEpisodes.map(
            (episode) => `> NARRATIVE UNLOCKED: ${episode.title}`,
          ),
        ].slice(-14),
        overseerLines: [
          ...prev.overseerLines,
          redState
            ? "> CAPTAINS: RED-STATE LOCK. HOSTILE MODE ACTIVE."
            : rejectionConsequence
              ? rejectionConsequence.overseerLine
              : "> CAPTAINS: OBJECTIVE REVIEW COMPLETE.",
          ...newlyUnlockedEpisodes.map(
            (episode) =>
              `> CAPTAINS: TRANSMISSION ${episode.episodeNumber} UNSEALED.`,
          ),
        ].slice(-8),
      }));
      await syncProgressToSupabase(
        {
          user_id: activeUserId ?? activeUserId ?? "local-user",
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
    } catch (error) {
      setState((prev) => ({
        ...prev,
        status: "ALERT" as PactStatus,
        terminalLines: [
          ...prev.terminalLines,
          "> AI GATE ERROR. LOCAL FAILURE PROTOCOL ENGAGED.",
        ].slice(-14),
      }));
      setStatusMessage("SYNC FAILED");
    }
  };

  

  

  

  const toggleComplianceScreen = () => {
    setShowComplianceScreen((previous) => !previous);
  };

  const handleOnboardingAdvance = () => {
    setOnboardingSeen(true);
    void savePersistedAppState({
      onboardingSeen: true,
      language,
      squads,
      activeSquadId,
      ownedDesignTemplates,
      selectedDesignTemplateId,
    });
  };

  

  

  const changeLanguage = async (nextLanguage: SupportedLanguage) => {
    setLanguage(nextLanguage);
    await setStoredLanguage(nextLanguage);
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

  const handleCLICommand = useCallback(() => {
    const cmd = cliInput.trim().toLowerCase();
    if (cmd === "/log pact") {
      setStatusMessage("SYSTEM LOG: PACT HISTORY LOADED");
    } else if (cmd.startsWith("/search ")) {
      setStatusMessage(`SEARCH: ${cliInput.trim().slice(8).toUpperCase()}`);
    } else if (
      cmd === "/override premium" ||
      cmd === "/override [premium_feature]"
    ) {
      setShowMonetization(true);
    } else if (cmd === "/uplink") {
      setStatusMessage("UPLINK: OVERSEER CHANNEL ACTIVE");
    } else if (cmd === "/log") {
      setStatusMessage("SYSTEM LOG: TERMINAL LOADED");
    } else if (cmd.startsWith("/lang ")) {
      void changeLanguage(cmd.slice(6).trim() as SupportedLanguage);
    } else if (cmd.length > 0) {
      setStatusMessage(`CMD UNKNOWN: ${cliInput.trim().toUpperCase()}`);
    }
    setCliInput("");
  }, [cliInput, changeLanguage]);

  const handleTabPress = useCallback((tab: AppTab) => {
    setActiveTab(tab);
    mainScrollRef.current?.scrollTo({ y: 0, animated: false });
  }, []);

  const handleTutorialNext = useCallback(() => {
    if (tutorialStep === null) return;
    const next = tutorialStep + 1;
    if (next >= tutorialSteps.length) {
      setTutorialStep(null);
      setTutorialCompleted(true);
      void AsyncStorage.setItem("@peakpact/tutorial-done", "true");
    } else {
      const nextTab = tutorialSteps[next]?.tab as AppTab | undefined;
      setTutorialStep(next);
      if (nextTab) handleTabPress(nextTab);
    }
  }, [tutorialStep, handleTabPress]);

  const handleTutorialPrev = useCallback(() => {
    if (!tutorialStep) return;
    const prev = tutorialStep - 1;
    const prevTab = tutorialSteps[prev]?.tab as AppTab | undefined;
    setTutorialStep(prev);
    if (prevTab) handleTabPress(prevTab);
  }, [tutorialStep, handleTabPress]);

  const handleTutorialSkip = useCallback(() => {
    setTutorialStep(null);
    setTutorialCompleted(true);
    void AsyncStorage.setItem("@peakpact/tutorial-done", "true");
  }, []);

  const handleCreateSquad = () => {
    if (!squadName.trim()) {
      setStatusMessage("SQUAD NAME REQUIRED");
      return;
    }

    const nextSquad = createSquad({
      name: squadName.trim(),
      description:
        squadDescription.trim() || "A focused crew for shared discipline.",
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
  };

  const handleJoinSquad = () => {
    if (!squadJoinCode.trim()) {
      setStatusMessage("JOIN CODE REQUIRED");
      return;
    }

    const result = joinSquad(
      squads,
      squadJoinCode.trim().toUpperCase(),
      squadMemberName.trim() || operatorCodename,
      effectivePlan,
    );
    if (result.error) {
      setStatusMessage(result.error.toUpperCase());
      return;
    }

    setSquads([...squads]);
    setActiveSquadId(result.squad?.id ?? null);
    setSquadJoinCode("");
    setStatusMessage(`JOINED SQUAD: ${result.squad?.name}`);
  };

  const handleSendSquadMessage = () => {
    if (!activeSquadId || !squadChatText.trim()) {
      return;
    }

    const result = sendSquadMessage(
      squads,
      activeSquadId,
      operatorCodename,
      squadChatText.trim(),
      language,
    );
    if (result.error || !result.squad) {
      return;
    }

    setSquads([...squads]);
    setSquadChatText("");
  };

  const handleCaptainAssignTask = () => {
    if (
      !activeSquadId ||
      !captainTaskTarget.trim() ||
      !captainTaskText.trim() ||
      !captainPrivilegesActive
    ) {
      setStatusMessage(
        captainPrivilegesActive
          ? "CAPTAIN TASK REQUIREMENTS MISSING"
          : "CAPTAIN RANK REQUIRED",
      );
      return;
    }

    const squad = squads.find((entry) => entry.id === activeSquadId);
    if (!squad) {
      setStatusMessage("ACTIVE SQUAD NOT FOUND");
      return;
    }

    const targetName = captainTaskTarget.trim();
    const memberExists = squad.members.some(
      (member) => member.name.toLowerCase() === targetName.toLowerCase(),
    );
    if (!memberExists) {
      setStatusMessage("TARGET MEMBER NOT IN ACTIVE SQUAD");
      return;
    }

    const result = assignCaptainTask(
      squads,
      activeSquadId,
      operatorCodename,
      targetName,
      captainTaskText.trim(),
      language,
    );
    if (result.error || !result.squad) {
      setStatusMessage(result.error?.toUpperCase() ?? "TASK ASSIGNMENT FAILED");
      return;
    }

    setSquads([...squads]);
    setCaptainTaskTarget("");
    setCaptainTaskText("Complete a 30-minute recovery sprint");
    setStatusMessage(`TASK ASSIGNED TO ${targetName}`);
  };

  const handleLeaveSquadPrompt = () => {
    if (!activeSquadId) {
      return;
    }

    setLeaveSquadConfirmOpen(true);
  };

  const confirmLeaveSquad = () => {
    if (!activeSquadId) {
      return;
    }

    const result = leaveSquad(
      squads,
      activeSquadId,
      operatorCodename,
      effectivePlan,
      state.pp,
    );
    if (result.error || !result.squad) {
      setStatusMessage(result.error?.toUpperCase() ?? "LEAVE FAILED");
      setLeaveSquadConfirmOpen(false);
      setLeaveSquadCountdown(0);
      return;
    }

    setSquads([...squads]);
    setActiveSquadId(null);
    setState((prev) => ({ ...prev, pp: result.remainingPP }));
    setLeaveSquadConfirmOpen(false);
    setStatusMessage(`CREW LEFT // ${result.feePP} PP FEE`);
  };

  const cancelLeaveSquad = () => {
    setLeaveSquadConfirmOpen(false);
    setLeaveSquadCountdown(0);
  };

  const toggleComplianceConsent = (
    field: keyof ComplianceConsent,
    value: boolean,
  ) => {
    setComplianceConsent((prev) => ({
      ...prev,
      [field]: value,
      consentedAt: value ? new Date().toISOString() : null,
    }));
  };

  

  const narrativeProgress = useMemo(
    () => getNarrativeProgress(state.level, language),
    [state.level, language],
  );
  
  
  const launchMetadata = useMemo(() => getLaunchMetadata(), []);
  const launchCopyPack = useMemo(() => getLaunchCopyPack(), []);
  const heroSummary = useMemo(
    () =>
      getHeroSummary(
        {
          pp: state.pp,
          streak: state.streak,
          redState: state.redState,
          overclockCount: state.extensionsUsed,
          protocolArchetypeName: state.protocolArchetypeName,
          protocolStatusEffect: state.protocolStatusEffect,
        },
        state.missionTitle,
        state.missionRisk,
        language,
      ),
    [
      state.pp,
      state.streak,
      state.redState,
      state.extensionsUsed,
      state.protocolArchetypeName,
      state.protocolStatusEffect,
      state.missionTitle,
      state.missionRisk,
      language,
    ],
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
  const firstSessionGuide = useMemo(
    () => getFirstSessionGuide(language),
    [language],
  );
  const dailyLoopGuide = useMemo(() => getDailyLoopGuide(language), [language]);
  const howToUseSteps = useMemo(
    () => getHowToUseSystemSteps(language),
    [language],
  );
  

  const pulseColors =
    state.redState && !state.flashSuppressed
      ? ["#000000", "#330000", CRIMSON]
      : [MATRIX_GREEN, MATRIX_GREEN, MATRIX_GREEN];
  const recoveryVisualState = useMemo(
    () =>
      getRecoveryVisualState({
        redState: state.redState,
        flashSuppressed: state.flashSuppressed,
        recoveryWindowActive: state.flashSuppressed && state.redState,
      }),
    [state.redState, state.flashSuppressed],
  );
  const accent = recoveryVisualState.isRecoveryVisualActive
    ? "#7FE7C9"
    : state.redState
      ? state.flashSuppressed
        ? CRIMSON
        : pulseColors[pulsePhase]
      : state.offline
        ? AMBER
        : MATRIX_GREEN;
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
  const premiumBoostSummary = useMemo(
    () =>
      getPremiumBoostSummary({
        isPremium: effectivePlan === "PREMIUM",
        pp: state.pp,
        streak: state.streak,
      }),
    [effectivePlan, state.pp, state.streak],
  );
  const getTemplateTierLabel = (costPP: number) => {
    if (costPP <= 0) {
      return "BASELINE PROTOCOL";
    }
    if (costPP <= 180) {
      return "ENTRY PREMIUM";
    }
    if (costPP <= 260) {
      return "ELITE UPGRADE";
    }
    return "SIGNATURE PRESTIGE";
  };
  const getTemplateValueCue = (costPP: number) => {
    if (costPP <= 0) {
      return "Core visuals included for all operators.";
    }
    if (costPP <= 180) {
      return "Fastest premium unlock for visual identity upgrades.";
    }
    if (costPP <= 260) {
      return "Executive-grade shell tuned for elite command presence.";
    }
    return "Top-tier visual signature for maximum prestige.";
  };
  const getTemplateStructureLabel = (templateId: DesignTemplateId) => {
    switch (templateId) {
      case "terminal-cyber-dungeon":
        return "ASCII GRID / RAW LOG FRAME";
      case "mecha-hud-pilot":
        return "TACTICAL RETICLE / HUD GEOMETRY";
      case "litrpg-stat-sheet":
        return "STAT BOARD / INVENTORY SLOTS";
      case "apex-megacorp-os":
        return "EXECUTIVE LATTICE / FINTECH CLEAN";
      default:
        return "BASELINE PROTOCOL SHELL";
    }
  };
  const getTemplateOrnamentPattern = (templateId: DesignTemplateId) => {
    switch (templateId) {
      case "terminal-cyber-dungeon":
        return [16, 12, 24, 14, 20];
      case "mecha-hud-pilot":
        return [8, 18, 26, 18, 8];
      case "litrpg-stat-sheet":
        return [12, 12, 12, 12, 12];
      case "apex-megacorp-os":
        return [28, 10, 28, 10, 28];
      default:
        return [10, 14, 10, 14, 10];
    }
  };
  const getTemplateCardVariantStyle = (templateId: DesignTemplateId) => {
    switch (templateId) {
      case "terminal-cyber-dungeon":
        return styles.templateCardTerminal;
      case "mecha-hud-pilot":
        return styles.templateCardMecha;
      case "litrpg-stat-sheet":
        return styles.templateCardLitrpg;
      case "apex-megacorp-os":
        return styles.templateCardApex;
      default:
        return styles.templateCardCore;
    }
  };
  const getTemplateSwatchVariantStyle = (templateId: DesignTemplateId) => {
    switch (templateId) {
      case "terminal-cyber-dungeon":
        return styles.templateSwatchTerminal;
      case "mecha-hud-pilot":
        return styles.templateSwatchMecha;
      case "litrpg-stat-sheet":
        return styles.templateSwatchLitrpg;
      case "apex-megacorp-os":
        return styles.templateSwatchApex;
      default:
        return styles.templateSwatchCore;
    }
  };
  const getTemplateActionVariantStyle = (templateId: DesignTemplateId) => {
    switch (templateId) {
      case "terminal-cyber-dungeon":
        return styles.templateActionTerminal;
      case "mecha-hud-pilot":
        return styles.templateActionMecha;
      case "litrpg-stat-sheet":
        return styles.templateActionLitrpg;
      case "apex-megacorp-os":
        return styles.templateActionApex;
      default:
        return styles.templateActionCore;
    }
  };
  const getHeroCardVariantStyle = (templateId: DesignTemplateId) => {
    switch (templateId) {
      case "terminal-cyber-dungeon":
        return styles.heroCardTerminal;
      case "mecha-hud-pilot":
        return styles.heroCardMecha;
      case "litrpg-stat-sheet":
        return styles.heroCardLitrpg;
      case "apex-megacorp-os":
        return styles.heroCardApex;
      default:
        return styles.heroCardCore;
    }
  };
  const getHeroPillVariantStyle = (templateId: DesignTemplateId) => {
    switch (templateId) {
      case "terminal-cyber-dungeon":
        return styles.heroPillTerminal;
      case "mecha-hud-pilot":
        return styles.heroPillMecha;
      case "litrpg-stat-sheet":
        return styles.heroPillLitrpg;
      case "apex-megacorp-os":
        return styles.heroPillApex;
      default:
        return styles.heroPillCore;
    }
  };
  const getHeroMissionRowVariantStyle = (templateId: DesignTemplateId) => {
    switch (templateId) {
      case "terminal-cyber-dungeon":
        return styles.heroMissionRowTerminal;
      case "mecha-hud-pilot":
        return styles.heroMissionRowMecha;
      case "litrpg-stat-sheet":
        return styles.heroMissionRowLitrpg;
      case "apex-megacorp-os":
        return styles.heroMissionRowApex;
      default:
        return styles.heroMissionRowCore;
    }
  };
  const getStatsRowVariantStyle = (templateId: DesignTemplateId) => {
    switch (templateId) {
      case "terminal-cyber-dungeon":
        return styles.statsRowTerminal;
      case "mecha-hud-pilot":
        return styles.statsRowMecha;
      case "litrpg-stat-sheet":
        return styles.statsRowLitrpg;
      case "apex-megacorp-os":
        return styles.statsRowApex;
      default:
        return styles.statsRowCore;
    }
  };
  const getStatBoxVariantStyle = (templateId: DesignTemplateId) => {
    switch (templateId) {
      case "terminal-cyber-dungeon":
        return styles.statBoxTerminal;
      case "mecha-hud-pilot":
        return styles.statBoxMecha;
      case "litrpg-stat-sheet":
        return styles.statBoxLitrpg;
      case "apex-megacorp-os":
        return styles.statBoxApex;
      default:
        return styles.statBoxCore;
    }
  };
  const activeDesignTemplate = useMemo(
    () =>
      getDesignTemplateById(selectedDesignTemplateId) ??
      getDesignTemplateById("core")!,
    [selectedDesignTemplateId],
  );
  const designTemplates = useMemo(() => getDesignTemplates(), []);
  const heroCardVariantStyle = useMemo(
    () => getHeroCardVariantStyle(selectedDesignTemplateId),
    [selectedDesignTemplateId],
  );
  const heroPillVariantStyle = useMemo(
    () => getHeroPillVariantStyle(selectedDesignTemplateId),
    [selectedDesignTemplateId],
  );
  const heroMissionRowVariantStyle = useMemo(
    () => getHeroMissionRowVariantStyle(selectedDesignTemplateId),
    [selectedDesignTemplateId],
  );
  const statsRowVariantStyle = useMemo(
    () => getStatsRowVariantStyle(selectedDesignTemplateId),
    [selectedDesignTemplateId],
  );
  const statBoxVariantStyle = useMemo(
    () => getStatBoxVariantStyle(selectedDesignTemplateId),
    [selectedDesignTemplateId],
  );
  const heroTemplateAnimatedStyle = useMemo(() => {
    switch (selectedDesignTemplateId) {
      case "terminal-cyber-dungeon":
        return {
          opacity: templatePulse.interpolate({
            inputRange: [0, 1],
            outputRange: [0.9, 1],
          }),
        };
      case "mecha-hud-pilot":
        return {
          transform: [
            {
              scale: templatePulse.interpolate({
                inputRange: [0, 1],
                outputRange: [1, 1.018],
              }),
            },
          ],
        };
      case "litrpg-stat-sheet":
        return {
          transform: [
            {
              translateX: templateSweep.interpolate({
                inputRange: [0, 1],
                outputRange: [0, 2],
              }),
            },
          ],
        };
      case "apex-megacorp-os":
        return {
          opacity: templatePulse.interpolate({
            inputRange: [0, 1],
            outputRange: [0.96, 1],
          }),
          transform: [
            {
              translateY: templatePulse.interpolate({
                inputRange: [0, 1],
                outputRange: [0, -1],
              }),
            },
          ],
        };
      default:
        return {
          opacity: templatePulse.interpolate({
            inputRange: [0, 1],
            outputRange: [0.97, 1],
          }),
        };
    }
  }, [selectedDesignTemplateId, templatePulse, templateSweep]);
  const statsTemplateAnimatedStyle = useMemo(() => {
    switch (selectedDesignTemplateId) {
      case "terminal-cyber-dungeon":
        return {
          opacity: templatePulse.interpolate({
            inputRange: [0, 1],
            outputRange: [1, 0.94],
          }),
        };
      case "mecha-hud-pilot":
        return {
          transform: [
            {
              translateY: templatePulse.interpolate({
                inputRange: [0, 1],
                outputRange: [0, -2],
              }),
            },
          ],
        };
      case "litrpg-stat-sheet":
        return {
          transform: [
            {
              translateX: templateSweep.interpolate({
                inputRange: [0, 1],
                outputRange: [0, -2],
              }),
            },
          ],
        };
      case "apex-megacorp-os":
        return {
          opacity: templatePulse.interpolate({
            inputRange: [0, 1],
            outputRange: [0.98, 1],
          }),
        };
      default:
        return {
          opacity: templatePulse.interpolate({
            inputRange: [0, 1],
            outputRange: [0.98, 1],
          }),
        };
    }
  }, [selectedDesignTemplateId, templatePulse, templateSweep]);
  const backdrop = recoveryVisualState.isRecoveryVisualActive
    ? "#7FE7C9"
    : state.redState
      ? state.flashSuppressed
        ? CRIMSON
        : pulseColors[pulsePhase]
      : activeDesignTemplate.background;
  

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
    setTemplateMessage(
      `THEME UNLOCKED: ${getDesignTemplateById(templateId)?.name ?? "THEME"}.`,
    );
  };

  const ScanlineOverlay = () => (
    <View style={styles.scanlineOverlay}>
      {Array.from({ length: 28 }).map((_, index) => (
        <View
          key={`scan-${index}`}
          style={[
            styles.scanlineBar,
            {
              top: index * 8 + scanOffset,
              backgroundColor: accent,
              opacity: 0.08 + (index % 3) * 0.02,
            },
          ]}
        />
      ))}
    </View>
  );

  // Boot sequence shown once on first launch — renders before auth, covers the full screen
  if (bootReady !== true) {
    return (
      <SafeAreaView style={[styles.safeArea, { backgroundColor: "#000000" }]}>
        <StatusBar style="light" hidden />
        <BootSequence
          onComplete={() => {
            setBootReady(true);
            void AsyncStorage.setItem("@peakpact/boot-seen", "true");
          }}
        />
      </SafeAreaView>
    );
  }

  if (authBooting) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <StatusBar style="light" />
        <ImageBackground
          source={terminalBackdrop}
          resizeMode="cover"
          style={styles.authBootShell}
        >
          <View style={styles.authBootOverlay}>
            <Text style={styles.authBootLabel}>PEAKPACT / ACCESS GATE</Text>
            <Text style={styles.authBootTitle}>RESTORING SESSION</Text>
          </View>
        </ImageBackground>
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
    <SafeAreaView
      style={[
        styles.safeArea,
        { backgroundColor: activeDesignTemplate.background },
      ]}
    >
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
            <View style={[styles.onboardingActionRow, { borderColor: accent }]}>
              <Text style={[styles.onboardingActionLabel, { color: accent }]}>
                {getLocalizedText("onboardingFirstStepLabel", language)}
              </Text>
              <Text style={styles.onboardingActionValue}>
                {firstSessionGuide.primaryAction}
              </Text>
            </View>
            <Pressable
              style={styles.onboardingButton}
              onPress={handleOnboardingAdvance}
            >
              <Text style={styles.onboardingButtonText}>
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
        <ImageBackground
          source={terminalBackdrop}
          resizeMode="cover"
          style={[
            styles.container,
            screenJitter && styles.screenJitter,
            { backgroundColor: backdrop },
          ]}
        >
          <View style={styles.terminalBackdropVeil} />
        </ImageBackground>
        <View
          style={[
            styles.holoLayer,
            { borderColor: accent, boxShadow: `0 0 18px ${accent}` },
          ]}
        />
        <View style={styles.fxGlow} />
        <ScanlineOverlay />
        {isWeb && (
          <View
            style={[styles.webGlobalHeader, { borderColor: `${accent}44` }]}
          >
            <Text style={[styles.webGlobalTitle, { color: PEAK_CRIMSON }]}>
              ▲ CRIMSON LEDGER WEBSYSTEM
            </Text>
            <View style={styles.webGlobalCenter}>
              <Text
                style={[
                  styles.webGlobalStatus,
                  { color: state.redState ? PEAK_CRIMSON : accent },
                ]}
              >
                {"SYS_STATUS: " +
                  (state.redState ? "\u26a0 REDSTATE" : "OPTIMAL")}
              </Text>
              <Text style={styles.webGlobalTime}>
                {"LOCAL TIME: " + militaryTime}
              </Text>
            </View>
            <Text style={[styles.webGlobalAuth, { color: accent }]}>
              SYS_AUTH: OVERSEER UPLINK
            </Text>
          </View>
        )}
        <TabBar active={activeTab} onPress={handleTabPress} accent={accent} tabs={appTabs} />
        <View style={isWeb ? styles.webColumnsRow : styles.mobileColumnWrapper}>
          {isWeb && (
            <ScrollView
              style={styles.webLeftCol}
              contentContainerStyle={styles.webColContent}
            >
              <View style={[styles.bentoWindow, { borderColor: accent }]}>
                <Text style={styles.bentoWindowTitle}>OPERATOR LEDGER</Text>
                <Text style={[styles.webLedgerPP, { color: accent }]}>
                  {displayPp}
                </Text>
                <Text style={styles.webLedgerPPLabel}>{translate("ledgerBalanceLabel")}</Text>
                <View style={styles.webLedgerSpacer} />
                <Text style={[styles.webLedgerDetail, { color: accent }]}>
                  MEDIATOR: {operatorCodename}
                </Text>
                <Text style={[styles.webLedgerDetail, { color: accent }]}>
                  LVL: {state.level}
                </Text>
                <Text style={[styles.webLedgerDetail, { color: accent }]}>
                  STREAK: {state.streak}
                </Text>
                <Text style={[styles.webLedgerDetail, { color: accent }]}>
                  XP: {displayXp}
                </Text>
                <View style={styles.progressBarShell}>
                  <View
                    style={[
                      styles.progressBarFill,
                      {
                        width: `${progressionView.nextLevelProgress.percent}%`,
                        backgroundColor: accent,
                      },
                    ]}
                  />
                </View>
                <Text style={styles.bentoDetailMini}>
                  LEVEL PROGRESS: {progressionView.nextLevelProgress.percent}%
                </Text>
              </View>
              <View style={[styles.bentoWindow, { borderColor: accent }]}>
                <Text style={styles.bentoWindowTitle}>{translate("logsTitle")}</Text>
                {state.terminalLines.slice(-6).map((line, i) => (
                  <Text key={i} style={[styles.logLine, { color: accent }]}>
                    {line}
                  </Text>
                ))}
                {state.terminalLines.length === 0 && (
                  <Text style={styles.bentoDetailMini}>
                    {translate("noLogsMessage")}
                  </Text>
                )}
              </View>
              <View style={[styles.bentoWindow, { borderColor: accent }]}>
                <Text style={styles.bentoWindowTitle}>{translate("searchResultsTitle")}</Text>
                <View style={styles.webSearchHeader}>
                  <Text style={[styles.webSearchCol, { flex: 2 }]}>
                    ORDERHANDLE
                  </Text>
                  <Text style={styles.webSearchCol}>LIVE PP</Text>
                  <Text style={styles.webSearchCol}>LIVE PP</Text>
                </View>
                {state.queue.slice(-5).map((entry) => (
                  <View key={entry.id} style={styles.webSearchRow}>
                    <Text style={[styles.webSearchCell, { flex: 2 }]}>
                      {entry.timestamp.slice(0, 10)}
                    </Text>
                    <Text style={styles.webSearchCell}>{state.pp}</Text>
                    <Text
                      style={[
                        styles.webSearchCell,
                        { color: entry.pp > 0 ? accent : PEAK_CRIMSON },
                      ]}
                    >
                      {entry.pp > 0 ? `+${entry.pp}` : entry.pp} PP
                    </Text>
                  </View>
                ))}
                {state.queue.length === 0 && (
                  <Text style={styles.bentoDetailMini}>
                    {translate("noHistoryMessage")}
                  </Text>
                )}
              </View>
              <View style={[styles.bentoWindow, { borderColor: accent }]}>
                <Text style={styles.bentoWindowTitle}>{translate("systemGalleryTitle")}</Text>
                {designTemplates.map((template) => {
                  const ownedTpl = ownedDesignTemplates.includes(template.id);
                  const selectedTpl = selectedDesignTemplateId === template.id;
                  return (
                    <View
                      key={template.id}
                      style={[
                        styles.webGalleryItem,
                        { borderColor: selectedTpl ? accent : `${accent}33` },
                      ]}
                    >
                      <View
                        style={[
                          styles.webGalleryColor,
                          { backgroundColor: template.accent },
                        ]}
                      />
                      <View style={{ flex: 1 }}>
                        <Text
                          style={[styles.webGalleryName, { color: accent }]}
                        >
                          {template.name}
                        </Text>
                        <Text style={styles.webGalleryPrice}>
                          {template.costPP > 0
                            ? `${template.costPP} PP`
                            : "UNLOCKED"}
                        </Text>
                      </View>
                      {selectedTpl ? (
                        <Text
                          style={[styles.webGalleryState, { color: accent }]}
                        >
                          ACTIVE
                        </Text>
                      ) : ownedTpl ? (
                        <Pressable
                          onPress={() =>
                            setSelectedDesignTemplateId(
                              template.id as DesignTemplateId,
                            )
                          }
                        >
                          <Text
                            style={[styles.webGalleryState, { color: accent }]}
                          >
                            APPLY
                          </Text>
                        </Pressable>
                      ) : (
                        <Pressable
                          onPress={() =>
                            handleTemplatePurchase(
                              template.id as DesignTemplateId,
                            )
                          }
                        >
                          <Text
                            style={[
                              styles.webGalleryState,
                              {
                                color:
                                  state.pp >= template.costPP
                                    ? accent
                                    : PEAK_CRIMSON,
                              },
                            ]}
                          >
                            BUY
                          </Text>
                        </Pressable>
                      )}
                    </View>
                  );
                })}
                {templateMessage ? (
                  <Text
                    style={[
                      styles.bentoDetailMini,
                      { color: accent, marginTop: 6 },
                    ]}
                  >
                    {templateMessage}
                  </Text>
                ) : null}
                <Pressable
                  style={[styles.webGalleryUpgradeBtn, { borderColor: accent }]}
                  onPress={() => setShowMonetization(true)}
                >
                  <Text
                    style={[styles.webGalleryUpgradeText, { color: accent }]}
                  >
                    PREMIUM UPGRADE
                  </Text>
                </Pressable>
              </View>
            </ScrollView>
          )}
          <ScrollView
            ref={mainScrollRef}
            style={[styles.shell, isWeb && styles.webCenterCol]}
            contentContainerStyle={styles.shellContent}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
            overScrollMode="always"
          >
            <View style={styles.appShell}>
              {/* SYS_STATUS micro strip */}
              <View style={styles.sysStatusStrip}>
                <Text
                  style={[
                    styles.sysStatusText,
                    { color: state.redState ? PEAK_CRIMSON : accent },
                  ]}
                >
                  {"SYS_STATUS: " +
                    (state.redState
                      ? "\u26a0 REDSTATE"
                      : state.offline
                        ? "OFFLINE"
                        : "OPTIMAL")}
                </Text>
                <Text style={styles.sysStatusText}>
                  {"LOCAL TIME: " + militaryTime}
                </Text>
                <Text style={styles.sysStatusText}>
                  {isWeb
                    ? "SYS_AUTH: OVERSEER UPLINK"
                    : "SYS_AUTH: FIELD UPLINK"}
                </Text>
              </View>

              {/* Bento header: Operator Ledger + Severance Timer */}
              <View
                style={[
                  styles.headerBentoRow,
                  state.levelFlash && styles.headerFlash,
                ]}
              >
                <View
                  style={[styles.operatorLedgerPane, { borderColor: accent }]}
                >
                  <Text style={styles.bentoWindowTitle}>{translate("ledgerTitle")}</Text>
                  <Text style={[styles.bentoOperatorId, { color: accent }]}>
                    MEDIATOR: {operatorCodename}
                  </Text>
                  <Text style={[styles.bentoLvlBadge, { color: accent }]}>
                    LVL: {state.level}
                  </Text>
                  <Text
                    style={[
                      styles.bentoPPHero,
                      { color: state.redState ? PEAK_CRIMSON : accent },
                    ]}
                  >
                    {displayPp} PP
                  </Text>
                  <Text style={styles.bentoProtocolLine}>
                    PROTOCOL: {state.protocolArchetypeName}
                  </Text>
                </View>
                <View
                  style={[
                    styles.severanceTimerPane,
                    { borderColor: state.redState ? PEAK_CRIMSON : accent },
                  ]}
                >
                  <Text style={styles.bentoWindowTitle}>{translate("severanceTimerTitle")}</Text>
                  <Text
                    style={[
                      styles.bentoCountdown,
                      { color: state.redState ? PEAK_CRIMSON : accent },
                    ]}
                  >
                    {missionCountdown}
                  </Text>
                  <Text style={[styles.bentoTimerLabel, { color: accent }]}>
                    {translate("dailyResetLabel")}
                  </Text>
                  <Text style={[styles.bentoStreakText, { color: accent }]}>
                    STREAK: {state.streak}
                  </Text>
                  <Text style={[styles.bentoXpText, { color: accent }]}>
                    XP: {displayXp}
                  </Text>
                </View>
              </View>

              {recoveryVisualState.isRecoveryVisualActive ? (
                <View style={[styles.recoveryBanner, { borderColor: accent }]}>
                  <Text style={[styles.recoveryBannerText, { color: accent }]}>
                    RECOVERY WINDOW STABLE / THREAT LEVEL CALMED
                  </Text>
                </View>
              ) : null}

              {/* Active Pact Ring — dual view (fractured + sealed) */}
              <View style={[styles.pactRingSection, { borderColor: accent }]}>
                <Text style={styles.pactRingSectionTitle}>{translate("activePactTitle")}</Text>
                <View style={styles.pactRingDualView}>
                  <View style={styles.pactRingHalf}>
                    <PactRing
                      accent={PEAK_CRIMSON}
                      pactComplete={false}
                      redActive={state.redState}
                      size={150}
                    />
                    <Text
                      style={[styles.pactRingLabel, { color: PEAK_CRIMSON }]}
                    >
                      Fractured Crimson
                    </Text>
                    <Text
                      style={[styles.pactRingSubLabel, { color: BONE_WHITE }]}
                    >
                      Pact Ring
                    </Text>
                  </View>
                  <View style={styles.pactRingHalf}>
                    <PactRing
                      accent={BONE_WHITE}
                      pactComplete={true}
                      redActive={false}
                      size={150}
                    />
                    <Text style={[styles.pactRingLabel, { color: BONE_WHITE }]}>
                      Perfect, Unbroken
                    </Text>
                    <Text
                      style={[styles.pactRingSubLabel, { color: BONE_WHITE }]}
                    >
                      Bone White Ring
                    </Text>
                  </View>
                </View>
                <Text
                  style={[styles.pactRingMissionText, { color: accent }]}
                >{`> MISSION: ${state.missionTitle.toUpperCase()} [${state.missionTimeWindowMinutes} MIN]`}</Text>
                <Text style={[styles.pactRingVerifyHint, { color: accent }]}>
                  {"[ " +
                    (state.redState
                      ? "RECOVERY REQUIRED"
                      : "HOLD TO SIGN / SEAL") +
                    " ]"}
                </Text>
              </View>

              {activeTab !== "PACT" && (
                <SectionIntro intro={tabIntros[activeTab]} accent={accent} />
              )}
              <View style={{ display: activeTab === "PACT" ? "flex" : "none" }}>
                <Animated.View
                  style={[
                    styles.heroCard,
                    heroCardVariantStyle,
                    heroTemplateAnimatedStyle,
                    { borderColor: accent },
                    { transform: [{ translateY: heroFloat }] },
                  ]}
                >
                  <View style={styles.heroTopRow}>
                    <View
                      style={[
                        styles.heroPill,
                        heroPillVariantStyle,
                        { borderColor: accent },
                      ]}
                    >
                      <Text style={[styles.heroPillText, { color: accent }]}>
                        COMMAND CORE
                      </Text>
                    </View>
                    <View
                      style={[
                        styles.heroPill,
                        heroPillVariantStyle,
                        { borderColor: accent },
                      ]}
                    >
                      <Text style={[styles.heroPillText, { color: accent }]}>
                        {heroSummary.statusLabel}
                      </Text>
                    </View>
                  </View>
                  <Text style={styles.heroTitle}>{heroSummary.title}</Text>
                  <Text style={styles.heroSubtitle}>
                    {heroSummary.subtitle}
                  </Text>
                  <Text style={[styles.heroEmphasis, { color: accent }]}>
                    {heroSummary.emphasis}
                  </Text>
                  <View
                    style={[
                      styles.heroMissionRow,
                      heroMissionRowVariantStyle,
                      { borderColor: accent },
                    ]}
                  >
                    <Text style={styles.heroMissionLabel}>ACTIVE MISSION</Text>
                    <Text style={styles.heroMissionText}>
                      {state.missionTitle}
                    </Text>
                  </View>
                </Animated.View>
              </View>

              <View
                style={{ display: activeTab === "PROFILE" ? "flex" : "none" }}
              >
                <View
                  style={[
                    styles.panel,
                    styles.launchShowcasePanel,
                    { borderColor: accent },
                  ]}
                >
                  <ImageBackground
                    source={terminalBackdrop}
                    resizeMode="cover"
                    style={styles.launchShowcaseArt}
                    imageStyle={styles.launchShowcaseArtImage}
                  >
                    <View style={styles.launchShowcaseVeil} />
                    <View style={styles.launchShowcaseContent}>
                      <View style={styles.launchShowcaseHeaderRow}>
                        <BrandMark accent={accent} size={86} />
                        <View style={styles.launchShowcaseHeaderCopy}>
                          <Text
                            style={[
                              styles.panelTitle,
                              { color: accent, marginBottom: 2 },
                            ]}
                          >
                            {launchCopyPack.appTitleOptions[0]}
                          </Text>
                          <Text style={styles.launchShowcaseSubtitle}>
                            Elite launch visuals curated from the current asset
                            set.
                          </Text>
                        </View>
                      </View>
                      <View style={styles.launchShowcaseMetaRow}>
                        <View
                          style={[
                            styles.launchShowcaseMetaChip,
                            { borderColor: accent },
                          ]}
                        >
                          <Text
                            style={[
                              styles.launchShowcaseMetaText,
                              { color: accent },
                            ]}
                          >
                            FOUNDER GRADE
                          </Text>
                        </View>
                        <View
                          style={[
                            styles.launchShowcaseMetaChip,
                            { borderColor: accent },
                          ]}
                        >
                          <Text
                            style={[
                              styles.launchShowcaseMetaText,
                              { color: accent },
                            ]}
                          >
                            VERIFIED ASSET DECK
                          </Text>
                        </View>
                        <View
                          style={[
                            styles.launchShowcaseMetaChip,
                            { borderColor: accent },
                          ]}
                        >
                          <Text
                            style={[
                              styles.launchShowcaseMetaText,
                              { color: accent },
                            ]}
                          >
                            PREMIUM READY
                          </Text>
                        </View>
                      </View>
                      <View style={styles.launchShowcaseCaptionRow}>
                        {launchCopyPack.screenshotCaptions
                          .slice(0, 3)
                          .map((caption) => (
                            <View
                              key={caption}
                              style={[
                                styles.launchShowcaseCaptionChip,
                                { borderColor: accent },
                              ]}
                            >
                              <Text
                                style={[
                                  styles.launchShowcaseCaptionText,
                                  { color: accent },
                                ]}
                              >
                                {caption}
                              </Text>
                            </View>
                          ))}
                      </View>
                      <Text style={styles.launchShowcaseBody}>
                        {launchCopyPack.shortDescription}
                      </Text>
                    </View>
                  </ImageBackground>
                </View>

                <View style={styles.launchMediaRail}>
                  <View
                    style={[styles.launchMediaCard, { borderColor: accent }]}
                  >
                    <ImageBackground
                      source={peakpactSplash}
                      resizeMode="cover"
                      style={styles.launchMediaArt}
                      imageStyle={styles.launchMediaArtImage}
                    >
                      <View style={styles.launchMediaVeil} />
                      <Text
                        style={[styles.launchMediaLabel, { color: accent }]}
                      >
                        SPLASH
                      </Text>
                    </ImageBackground>
                  </View>
                  <View
                    style={[styles.launchMediaCard, { borderColor: accent }]}
                  >
                    <ImageBackground
                      source={peakpactIcon}
                      resizeMode="contain"
                      style={styles.launchMediaArt}
                      imageStyle={styles.launchMediaIconImage}
                    >
                      <View style={styles.launchMediaVeil} />
                      <Text
                        style={[styles.launchMediaLabel, { color: accent }]}
                      >
                        ICON
                      </Text>
                    </ImageBackground>
                  </View>
                  <View
                    style={[styles.launchMediaCard, { borderColor: accent }]}
                  >
                    <ImageBackground
                      source={peakpactAdaptiveIcon}
                      resizeMode="contain"
                      style={styles.launchMediaArt}
                      imageStyle={styles.launchMediaIconImage}
                    >
                      <View style={styles.launchMediaVeil} />
                      <Text
                        style={[styles.launchMediaLabel, { color: accent }]}
                      >
                        ANDROID
                      </Text>
                    </ImageBackground>
                  </View>
                </View>
              </View>

              <View style={{ display: activeTab === "PACT" ? "flex" : "none" }}>
                <Animated.View
                  style={[
                    styles.statsRow,
                    statsRowVariantStyle,
                    statsTemplateAnimatedStyle,
                  ]}
                >
                  <View
                    style={[
                      styles.statBox,
                      statBoxVariantStyle,
                      { borderColor: accent },
                    ]}
                  >
                    <Text style={[styles.statLabel, { color: accent }]}>
                      PP BALANCE
                    </Text>
                    <Text
                      style={[
                        styles.statValue,
                        { color: state.redState ? PEAK_CRIMSON : accent },
                      ]}
                      numberOfLines={1}
                      adjustsFontSizeToFit
                    >
                      {state.pp}
                    </Text>
                    <Text style={styles.statSubLabel}>
                      {eliteOverrideActive ? "\u221e ELITE" : "POINTS"}
                    </Text>
                  </View>
                  <View
                    style={[
                      styles.statBox,
                      statBoxVariantStyle,
                      { borderColor: accent },
                    ]}
                  >
                    <Text style={[styles.statLabel, { color: accent }]}>
                      STREAK
                    </Text>
                    <Text style={[styles.statValue, { color: accent }]}>
                      {state.streak}
                    </Text>
                    <Text style={styles.statSubLabel}>{translate("daysLabel")}</Text>
                  </View>
                  <View
                    style={[
                      styles.statBox,
                      statBoxVariantStyle,
                      { borderColor: accent },
                    ]}
                  >
                    <Text style={[styles.statLabel, { color: accent }]}>
                      LEVEL
                    </Text>
                    <Text style={[styles.statValue, { color: accent }]}>
                      {state.level}
                    </Text>
                    <Text style={styles.statSubLabel}>
                      {founderPrivilegesActive ? translate("founderLabel") : `${state.xp} ${translate("xpLabel")}`}
                    </Text>
                  </View>
                </Animated.View>

                <View
                  style={[styles.dailyLoopCard, { borderColor: `${accent}55` }]}
                >
                  <View style={styles.dailyLoopHeaderRow}>
                    <Text style={[styles.dailyLoopTitle, { color: accent }]}>
                      {dailyLoopGuide.title}
                    </Text>
                    <View
                      style={[
                        styles.dailyLoopNextBadge,
                        { borderColor: `${accent}55` },
                      ]}
                    >
                      <Text
                        style={[
                          styles.dailyLoopNextBadgeText,
                          { color: accent },
                        ]}
                      >
                        UP NEXT
                      </Text>
                    </View>
                  </View>
                  <Text style={styles.dailyLoopBody}>
                    {dailyLoopGuide.body}
                  </Text>
                  <Text
                    style={[
                      styles.dailyLoopNextAction,
                      {
                        color: recoveryVisualState.isRecoveryVisualActive
                          ? "#7FE7C9"
                          : accent,
                      },
                    ]}
                  >
                    {dailyLoopGuide.nextAction}
                  </Text>
                  <View style={styles.dailyLoopSteps}>
                    {dailyLoopGuide.steps.map((step, index) => (
                      <View key={step.title} style={styles.dailyLoopStep}>
                        <Text
                          style={[styles.dailyLoopStepNum, { color: accent }]}
                        >
                          {index + 1}
                        </Text>
                        <View style={styles.dailyLoopStepContent}>
                          <Text style={styles.dailyLoopStepTitle}>
                            {step.title}
                          </Text>
                          <Text style={styles.dailyLoopStepBody}>
                            {step.body}
                          </Text>
                        </View>
                      </View>
                    ))}
                  </View>
                </View>

                {state.levelFlash ? (
                  <View style={styles.levelBanner}>
                    <Text style={styles.levelBannerText}>
                      LEVEL UP / GLITCH LOCK
                    </Text>
                  </View>
                ) : null}

                <View style={[styles.panel, { borderColor: accent }]}>
                  <Text style={[styles.panelTitle, { color: accent }]}>
                    [ ELITE DAILY CHALLENGE ]
                  </Text>
                  <View
                    style={[
                      styles.challengeCard,
                      { borderColor: dailyChallenge.accent },
                    ]}
                  >
                    <Text
                      style={[
                        styles.challengeTitle,
                        { color: dailyChallenge.accent },
                      ]}
                    >
                      {dailyChallenge.title}
                    </Text>
                    <Text style={styles.challengeBody}>
                      {dailyChallenge.body}
                    </Text>
                    <Text style={styles.challengeReward}>
                      REWARD:{" "}
                      {effectivePlan === "PREMIUM"
                        ? dailyChallenge.premiumRewardPP
                        : dailyChallenge.rewardPP}{" "}
                      PP
                    </Text>
                    <View style={styles.progressBarShell}>
                      <View
                        style={[
                          styles.progressBarFill,
                          {
                            width: `${Math.min(100, Math.round((dailyChallenge.progress.current / dailyChallenge.progress.target) * 100))}%`,
                            backgroundColor: dailyChallenge.accent,
                          },
                        ]}
                      />
                    </View>
                    <Text style={styles.progressionSummaryDetail}>
                      {dailyChallenge.progress.current}/
                      {dailyChallenge.progress.target} TO COMPLETE
                    </Text>
                  </View>
                  <View
                    style={[
                      styles.challengeCard,
                      { borderColor: accent, marginTop: 8 },
                    ]}
                  >
                    <Text style={[styles.challengeTitle, { color: accent }]}>
                      {premiumBoostSummary.label}
                    </Text>
                    <Text style={styles.challengeBody}>
                      {premiumBoostSummary.body}
                    </Text>
                    <Text style={styles.challengeReward}>
                      BONUS: {premiumBoostSummary.bonusPP} PP
                    </Text>
                  </View>
                </View>
              </View>

              <View
                style={{ display: activeTab === "STORE" ? "flex" : "none" }}
              >
                <View style={[styles.panel, { borderColor: accent }]}>
                  <Text style={[styles.panelTitle, { color: accent }]}>
                    [ DESIGN TEMPLATES // PREMIUM VISUALS ]
                  </Text>
                  {templateMessage ? (
                    <Text
                      style={[
                        styles.storeStatus,
                        { color: accent, marginBottom: 8 },
                      ]}
                    >
                      {templateMessage}
                    </Text>
                  ) : null}
                  {designTemplates.map((template) => {
                    const owned = ownedDesignTemplates.includes(template.id);
                    const selected = selectedDesignTemplateId === template.id;
                    const affordable = state.pp >= template.costPP;
                    const tierLabel = getTemplateTierLabel(template.costPP);
                    const valueCue = getTemplateValueCue(template.costPP);
                    const structureLabel = getTemplateStructureLabel(
                      template.id,
                    );
                    const ornamentPattern = getTemplateOrnamentPattern(
                      template.id,
                    );
                    const cardVariantStyle = getTemplateCardVariantStyle(
                      template.id,
                    );
                    const swatchVariantStyle = getTemplateSwatchVariantStyle(
                      template.id,
                    );
                    const actionVariantStyle = getTemplateActionVariantStyle(
                      template.id,
                    );
                    return (
                      <View
                        key={template.id}
                        style={[
                          styles.templateCard,
                          cardVariantStyle,
                          {
                            borderColor: selected
                              ? accent
                              : "rgba(0,255,0,0.18)",
                            backgroundColor: selected
                              ? "rgba(0,255,0,0.06)"
                              : "rgba(0,0,0,0.32)",
                          },
                        ]}
                      >
                        <View style={styles.templateHeaderRow}>
                          <View
                            style={[
                              styles.templateSwatch,
                              swatchVariantStyle,
                              {
                                backgroundColor: template.card,
                                borderColor: template.accent,
                              },
                            ]}
                          />
                          <View style={styles.templateMeta}>
                            <Text
                              style={[styles.templateTitle, { color: accent }]}
                            >
                              {template.name}
                            </Text>
                            <Text style={styles.templateBody}>
                              {template.description}
                            </Text>
                          </View>
                        </View>
                        <View style={styles.templateSignatureRow}>
                          <Text
                            style={[
                              styles.templateSignatureLabel,
                              { color: accent },
                            ]}
                          >
                            {structureLabel}
                          </Text>
                          <View style={styles.templateSignatureTrack}>
                            {ornamentPattern.map((size, index) => (
                              <View
                                key={`${template.id}-ornament-${index}`}
                                style={[
                                  styles.templateSignatureNode,
                                  {
                                    width: size,
                                    borderColor: selected
                                      ? accent
                                      : "rgba(0,255,0,0.28)",
                                    backgroundColor: selected
                                      ? "rgba(0,255,0,0.18)"
                                      : "rgba(0,0,0,0.34)",
                                  },
                                ]}
                              />
                            ))}
                          </View>
                        </View>
                        <View style={styles.templateMetaRow}>
                          <Text
                            style={[
                              styles.templateTierPill,
                              { borderColor: accent, color: accent },
                            ]}
                          >
                            {tierLabel}
                          </Text>
                          <Text style={styles.templateStateLabel}>
                            {selected ? "ACTIVE" : owned ? "OWNED" : "LOCKED"}
                          </Text>
                        </View>
                        <Text style={styles.templateValueCue}>{valueCue}</Text>
                        <View style={styles.templateFooterRow}>
                          <Text
                            style={[
                              styles.templatePrice,
                              { color: template.costPP > 0 ? AMBER : accent },
                            ]}
                          >
                            {" "}
                            {template.costPP > 0
                              ? `${template.costPP} PP`
                              : "BASE"}{" "}
                          </Text>
                          {selected ? (
                            <View
                              style={[
                                styles.templateAction,
                                actionVariantStyle,
                                { borderColor: accent },
                              ]}
                            >
                              <Text
                                style={[
                                  styles.templateActionText,
                                  { color: accent },
                                ]}
                              >
                                ACTIVE
                              </Text>
                            </View>
                          ) : owned ? (
                            <Pressable
                              style={[
                                styles.templateAction,
                                actionVariantStyle,
                                { borderColor: accent },
                              ]}
                              onPress={() =>
                                setSelectedDesignTemplateId(template.id)
                              }
                            >
                              <Text
                                style={[
                                  styles.templateActionText,
                                  { color: accent },
                                ]}
                              >
                                APPLY
                              </Text>
                            </Pressable>
                          ) : (
                            <Pressable
                              style={[
                                styles.templateAction,
                                actionVariantStyle,
                                { borderColor: affordable ? accent : CRIMSON },
                              ]}
                              onPress={() =>
                                handleTemplatePurchase(
                                  template.id as DesignTemplateId,
                                )
                              }
                              disabled={!affordable}
                            >
                              <Text
                                style={[
                                  styles.templateActionText,
                                  { color: affordable ? accent : CRIMSON },
                                ]}
                              >
                                BUY
                              </Text>
                            </Pressable>
                          )}
                        </View>
                      </View>
                    );
                  })}
                </View>
              </View>

              <View style={{ display: activeTab === "PACT" ? "flex" : "none" }}>
                <View style={[styles.panel, { borderColor: `${accent}33` }]}>
                  <View style={styles.panelHeaderRow}>
                    <Text style={[styles.panelTitle, { color: accent }]}>
                      [ TACTICAL UPLINK ]
                    </Text>
                    <View style={[styles.modePill, { borderColor: `${accent}55` }]}>
                      <Text
                        style={[
                          styles.modePillText,
                          {
                            color:
                              pactFlowMode === "planning" ? accent : AMBER,
                          },
                        ]}
                      >
                        {pactFlowMode === "planning" ? translate("modePlanning") : translate("modeExecution")}
                      </Text>
                    </View>
                  </View>

                  <AnimatedReanimated.View style={planningPanelStyle}>
                    <Text style={styles.storeTitle}>{translate("missionNodeLabel")}</Text>
                    <TextInput
                      style={[
                        styles.input,
                        { borderColor: accent, marginBottom: 8 },
                      ]}
                      value={contractTask}
                      onChangeText={setContractTask}
                      placeholder={translate("whatMustBeDonePlaceholder")}
                      placeholderTextColor="rgba(244,244,245,0.32)"
                    />
                    <Text style={styles.storeTitle}>{translate("durationLabel")}</Text>
                    <TextInput
                      style={[
                        styles.input,
                        { borderColor: accent, marginBottom: 8 },
                      ]}
                      value={contractDuration}
                      onChangeText={setContractDuration}
                      placeholder="45"
                      keyboardType="numeric"
                      placeholderTextColor="rgba(244,244,245,0.32)"
                    />
                    <Text style={styles.storeTitle}>{translate("riskStakeLabel")}</Text>
                    <TextInput
                      style={[styles.input, { borderColor: accent }]}
                      value={contractStake}
                      onChangeText={setContractStake}
                      placeholder="20"
                      keyboardType="numeric"
                      placeholderTextColor="rgba(244,244,245,0.32)"
                    />
                    <View style={styles.macroRow}>
                      {pactMacros.map((macro) => (
                        <Pressable
                          key={macro.label}
                          style={[
                            styles.macroChip,
                            { borderColor: accent },
                          ]}
                          onPress={() => {
                            setContractTask(macro.value);
                            setContractDuration(String(macro.duration));
                            setContractStake(String(macro.stake));
                          }}
                        >
                          <Text
                            style={[styles.macroChipText, { color: accent }]}
                          >
                            [{macro.label}]
                          </Text>
                        </Pressable>
                      ))}
                    </View>
                    <TextInput
                      style={[styles.input, { borderColor: accent, marginTop: 2 }]}
                      value={draft}
                      onChangeText={setDraft}
                      placeholder={translate("proofPlaceholder")}
                      placeholderTextColor="rgba(244,244,245,0.32)"
                      multiline
                    />
                    <TemplatedPressable
                      templateId={selectedDesignTemplateId}
                      style={[styles.buttonPrimary, { backgroundColor: accent, marginTop: 10 }]}
                      onPress={launchPactExecution}
                    >
                      <Text style={styles.buttonText}>{translate("buttonSubmitPact")}</Text>
                    </TemplatedPressable>
                  </AnimatedReanimated.View>

                  <AnimatedReanimated.View style={executionPanelStyle}>
                    <Text style={styles.executionLabel}>{translate("timeToLockLabel")}</Text>
                    <Text style={[styles.executionDial, { color: accent }]}>
                      {executionCountdown}
                    </Text>
                    <Text style={styles.executionHint}>
                      The system is preparing your contract for the verification gate.
                    </Text>
                    <Pressable
                      style={[styles.buttonSecondary, { borderColor: accent, marginTop: 12 }]}
                      onPress={() => {
                        setPactFlowMode("planning");
                        setExecutionCountdown(5);
                      }}
                    >
                      <Text style={[styles.buttonText, { color: accent }]}>{translate("buttonAbort")}</Text>
                    </Pressable>
                  </AnimatedReanimated.View>
                </View>

                <View style={[styles.panel, { borderColor: `${accent}33` }]}> 
                  <Text style={[styles.panelTitle, { color: accent }]}>
                    [ FIELD BRIEFING ]
                  </Text>
                  <View style={styles.briefingRow}>
                    <View style={[styles.briefingMetric, { borderColor: `${accent}33` }]}> 
                      <Text style={styles.briefingMetricLabel}>{translate("activeMissionLabel")}</Text>
                      <Text style={styles.briefingMetricValue}>{state.missionTitle}</Text>
                    </View>
                    <View style={[styles.briefingMetric, { borderColor: `${accent}33` }]}> 
                      <Text style={styles.briefingMetricLabel}>{translate("missionClockLabel")}</Text>
                      <Text style={styles.briefingMetricValue}>{missionCountdown}</Text>
                    </View>
                  </View>
                  <View style={styles.briefingRow}>
                    <View style={[styles.briefingMetric, { borderColor: `${accent}33` }]}> 
                      <Text style={styles.briefingMetricLabel}>{translate("riskLabel")}</Text>
                      <Text style={styles.briefingMetricValue}>{state.missionRisk}</Text>
                    </View>
                    <View style={[styles.briefingMetric, { borderColor: `${accent}33` }]}> 
                      <Text style={styles.briefingMetricLabel}>{translate("rewardLabel")}</Text>
                      <Text style={styles.briefingMetricValue}>+{state.missionRewardBonus} PP</Text>
                    </View>
                  </View>
                </View>
              </View>

              <View
                style={{ display: activeTab === "PROFILE" ? "flex" : "none" }}
              >
                <View style={[styles.panel, { borderColor: accent }]}>
                  <View
                    style={[
                      styles.ascensionBanner,
                      state.levelFlash && styles.ascensionBannerFlash,
                    ]}
                  >
                    <Text
                      style={[
                        styles.panelTitle,
                        { color: accent, marginBottom: 4 },
                      ]}
                    >
                      [ ASCENSION PATH ]
                    </Text>
                    <Text style={styles.ascensionBannerTitle}>
                      {progressionView.ascension.title}
                    </Text>
                    <Text style={styles.ascensionBannerSubtitle}>
                      {progressionView.ascension.subtitle}
                    </Text>
                    <Text
                      style={[
                        styles.progressionSummaryDetail,
                        { color: accent, marginTop: 4 },
                      ]}
                    >
                      REWARD: {progressionView.ascension.rewardLabel}
                    </Text>
                  </View>
                  <Text
                    style={[
                      styles.panelTitle,
                      { color: accent, marginTop: 10 },
                    ]}
                  >
                    [ HALL OF FAME ]
                  </Text>
                  <View style={styles.progressionSummaryRow}>
                    {progressionView.hallOfFame.map((item) => (
                      <View
                        key={item.title}
                        style={styles.progressionSummaryCard}
                      >
                        <Text style={styles.progressionSummaryTitle}>
                          {item.title}
                        </Text>
                        <Text
                          style={[
                            styles.progressionSummaryValue,
                            { color: accent },
                          ]}
                        >
                          {item.value}
                        </Text>
                        <Text style={styles.progressionSummaryDetail}>
                          {item.detail}
                        </Text>
                      </View>
                    ))}
                  </View>
                  <Text
                    style={[
                      styles.panelTitle,
                      { color: accent, marginTop: 10 },
                    ]}
                  >
                    [ TOWER OF LEVELS ]
                  </Text>
                  <View style={styles.towerRow}>
                    {progressionView.towerFloors.map((floor) => (
                      <View
                        key={floor.floor}
                        style={[
                          styles.towerFloor,
                          {
                            borderColor: floor.active ? accent : "#2f4a3b",
                            backgroundColor: floor.active
                              ? "rgba(0, 255, 0, 0.12)"
                              : floor.unlocked
                                ? "rgba(255, 176, 0, 0.08)"
                                : "rgba(0, 0, 0, 0.44)",
                          },
                        ]}
                      >
                        <Text style={styles.towerFloorLabel}>
                          {floor.label}
                        </Text>
                        <Text
                          style={[
                            styles.towerFloorValue,
                            { color: floor.active ? accent : "#96b89c" },
                          ]}
                        >
                          {floor.floor}
                        </Text>
                      </View>
                    ))}
                  </View>
                  <View style={styles.progressBarShell}>
                    <View
                      style={[
                        styles.progressBarFill,
                        {
                          width: `${progressionView.nextLevelProgress.percent}%`,
                          backgroundColor: accent,
                        },
                      ]}
                    />
                  </View>
                  <Text style={styles.progressionSummaryDetail}>
                    LEVEL PROGRESS: {progressionView.nextLevelProgress.percent}%
                    TO THE NEXT FLOOR
                  </Text>
                  <Text
                    style={[
                      styles.panelTitle,
                      { color: accent, marginTop: 10 },
                    ]}
                  >
                    [ SKILLS ]
                  </Text>
                  <View style={styles.skillGrid}>
                    {progressionView.skills.map((skill) => (
                      <View key={skill.title} style={styles.skillCard}>
                        <Text style={styles.skillTitle}>{skill.title}</Text>
                        <Text style={[styles.skillValue, { color: accent }]}>
                          {skill.value}
                        </Text>
                        <Text style={styles.progressionSummaryDetail}>
                          {skill.description}
                        </Text>
                      </View>
                    ))}
                  </View>
                </View>
              </View>

              <View
                style={{ display: activeTab === "SQUAD" ? "flex" : "none" }}
              >
                <View style={[styles.panel, { borderColor: accent }]}>
                  <Text style={[styles.panelTitle, { color: accent }]}>
                    [ SQUAD NETWORK ]
                  </Text>
                  <Text style={styles.storeTitle}>
                    Create a small crew, join a public squad, and keep the loop
                    shared across languages.
                  </Text>
                  <Text
                    style={[
                      styles.storeStatus,
                      { color: accent, marginBottom: 8 },
                    ]}
                  >
                    BASIC CREWS: MAX 2 MEMBERS • ONE CREW ONLY • LEAVE FEE 12
                    PP. PREMIUM CREWS: FLEXIBLE ROSTER • LEAVE FEE 8 PP.
                  </Text>
                  <View style={styles.inputRow}>
                    <Text style={styles.storeTitle}>Squad name</Text>
                    <TextInput
                      style={[
                        styles.input,
                        { borderColor: accent, marginTop: 6 },
                      ]}
                      value={squadName}
                      onChangeText={setSquadName}
                      placeholder="North Star Crew"
                      placeholderTextColor="rgba(244,244,245,0.32)"
                    />
                    <Text style={styles.storeTitle}>Mission focus</Text>
                    <TextInput
                      style={[
                        styles.input,
                        { borderColor: accent, marginTop: 6 },
                      ]}
                      value={squadFocus}
                      onChangeText={setSquadFocus}
                      placeholder="Study and recovery"
                      placeholderTextColor="rgba(244,244,245,0.32)"
                    />
                    <Text style={styles.storeTitle}>Goal</Text>
                    <TextInput
                      style={[
                        styles.input,
                        { borderColor: accent, marginTop: 6 },
                      ]}
                      value={squadGoal}
                      onChangeText={setSquadGoal}
                      placeholder="Complete 5 shared missions this week"
                      placeholderTextColor="rgba(244,244,245,0.32)"
                    />
                    <Text style={styles.storeTitle}>Visibility</Text>
                    <View style={styles.squadVisibilityRow}>
                      <Pressable
                        style={[
                          styles.visibilityChip,
                          squadVisibility === "PUBLIC" &&
                            styles.visibilityChipActive,
                          { borderColor: accent },
                        ]}
                        onPress={() => setSquadVisibility("PUBLIC")}
                      >
                        <Text
                          style={[
                            styles.visibilityChipText,
                            {
                              color:
                                squadVisibility === "PUBLIC"
                                  ? "#000000"
                                  : accent,
                            },
                          ]}
                        >
                          PUBLIC
                        </Text>
                      </Pressable>
                      <Pressable
                        style={[
                          styles.visibilityChip,
                          squadVisibility === "PRIVATE" &&
                            styles.visibilityChipActive,
                          { borderColor: accent },
                        ]}
                        onPress={() => setSquadVisibility("PRIVATE")}
                      >
                        <Text
                          style={[
                            styles.visibilityChipText,
                            {
                              color:
                                squadVisibility === "PRIVATE"
                                  ? "#000000"
                                  : accent,
                            },
                          ]}
                        >
                          PRIVATE
                        </Text>
                      </Pressable>
                    </View>
                    <Text style={styles.storeTitle}>Description</Text>
                    <TextInput
                      style={[
                        styles.input,
                        { borderColor: accent, marginTop: 6 },
                      ]}
                      value={squadDescription}
                      onChangeText={setSquadDescription}
                      placeholder="Shared discipline for a few operators"
                      placeholderTextColor="rgba(244,244,245,0.32)"
                    />
                    <Pressable
                      style={[
                        styles.buttonSecondary,
                        { borderColor: accent, marginTop: 8 },
                      ]}
                      onPress={handleCreateSquad}
                    >
                      <Text style={[styles.buttonText, { color: accent }]}>
                        CREATE SQUAD
                      </Text>
                    </Pressable>
                  </View>
                  <View style={styles.inputRow}>
                    <Text style={styles.storeTitle}>Join code</Text>
                    <TextInput
                      style={[
                        styles.input,
                        { borderColor: accent, marginTop: 6 },
                      ]}
                      value={squadJoinCode}
                      onChangeText={setSquadJoinCode}
                      placeholder="AB12CD"
                      placeholderTextColor="rgba(244,244,245,0.32)"
                    />
                    <Text style={styles.storeTitle}>Member name</Text>
                    <TextInput
                      style={[
                        styles.input,
                        { borderColor: accent, marginTop: 6 },
                      ]}
                      value={squadMemberName}
                      onChangeText={setSquadMemberName}
                      placeholder="Nova"
                      placeholderTextColor="rgba(244,244,245,0.32)"
                    />
                    <Pressable
                      style={[
                        styles.buttonSecondary,
                        { borderColor: accent, marginTop: 8 },
                      ]}
                      onPress={handleJoinSquad}
                    >
                      <Text style={[styles.buttonText, { color: accent }]}>
                        JOIN SQUAD
                      </Text>
                    </Pressable>
                  </View>
                  <View style={styles.squadList}>
                    {squads.map((squad) => (
                      <Pressable
                        key={squad.id}
                        onPress={() => setActiveSquadId(squad.id)}
                        style={[
                          styles.squadCard,
                          activeSquadId === squad.id && styles.squadCardActive,
                          { borderColor: accent },
                        ]}
                      >
                        <Text style={styles.squadTitle}>{squad.name}</Text>
                        <Text style={styles.storeStatus}>
                          {squad.description}
                        </Text>
                        <Text style={[styles.storeStatus, { color: accent }]}>
                          GOAL: {squad.goal}
                        </Text>
                        <Text style={[styles.storeStatus, { color: accent }]}>
                          CODE: {squad.code} • {squad.members.length} MEMBERS •{" "}
                          {squad.visibility}
                        </Text>
                        <View style={styles.progressBarShell}>
                          <View
                            style={[
                              styles.progressBarFill,
                              {
                                width: `${Math.min(100, Math.round((squad.progress.current / squad.progress.target) * 100))}%`,
                                backgroundColor: accent,
                              },
                            ]}
                          />
                        </View>
                        <Text style={styles.progressionSummaryDetail}>
                          {squad.progress.current}/{squad.progress.target}{" "}
                          {squad.progress.label}
                        </Text>
                      </Pressable>
                    ))}
                  </View>
                  {activeSquadId ? (
                    <View style={styles.squadChatBox}>
                      <Text style={styles.storeTitle}>ACTIVE SQUAD CHAT</Text>
                      {captainPrivilegesActive ? (
                        <View style={styles.inputRow}>
                          <Text style={styles.storeTitle}>
                            Captain task assignment
                          </Text>
                          <TextInput
                            style={[
                              styles.input,
                              { borderColor: accent, marginTop: 6 },
                            ]}
                            value={captainTaskTarget}
                            onChangeText={setCaptainTaskTarget}
                            placeholder="Member name"
                            placeholderTextColor="rgba(244,244,245,0.32)"
                          />
                          <TextInput
                            style={[
                              styles.input,
                              { borderColor: accent, marginTop: 6 },
                            ]}
                            value={captainTaskText}
                            onChangeText={setCaptainTaskText}
                            placeholder="Assign a discipline task"
                            placeholderTextColor="rgba(244,244,245,0.32)"
                          />
                          <Pressable
                            style={[
                              styles.buttonSecondary,
                              { borderColor: accent, marginTop: 8 },
                            ]}
                            onPress={handleCaptainAssignTask}
                          >
                            <Text
                              style={[styles.buttonText, { color: accent }]}
                            >
                              ASSIGN TASK
                            </Text>
                          </Pressable>
                        </View>
                      ) : null}
                      <Pressable
                        style={[
                          styles.buttonSecondary,
                          { borderColor: accent, marginTop: 8 },
                        ]}
                        onPress={handleLeaveSquadPrompt}
                      >
                        <Text style={[styles.buttonText, { color: accent }]}>
                          LEAVE CREW ({effectivePlan === "PREMIUM" ? "8" : "12"}{" "}
                          PP)
                        </Text>
                      </Pressable>
                      {leaveSquadConfirmOpen ? (
                        <Animated.View
                          style={[
                            styles.leaveConfirmCard,
                            {
                              borderColor: CRIMSON,
                              transform: [{ scale: leaveSquadPulse }],
                            },
                          ]}
                        >
                          <View style={styles.leaveConfirmHeader}>
                            <Text style={styles.leaveConfirmTitle}>
                              CREW EXIT WARNING
                            </Text>
                            <Text style={styles.leaveConfirmCountdown}>
                              EXIT COST //{" "}
                              {effectivePlan === "PREMIUM" ? "8" : "12"} PP //{" "}
                              {leaveSquadCountdown > 0
                                ? `T-${leaveSquadCountdown}`
                                : "READY"}
                            </Text>
                          </View>
                          <Text style={styles.leaveConfirmBody}>
                            Leaving will cost{" "}
                            {effectivePlan === "PREMIUM" ? "8" : "12"} PP and
                            remove you from{" "}
                            {squads.find((squad) => squad.id === activeSquadId)
                              ?.name ?? "the active crew"}
                            .
                          </Text>
                          {state.pp < (effectivePlan === "PREMIUM" ? 8 : 12) ? (
                            <Text style={styles.leaveConfirmWarning}>
                              INSUFFICIENT PP. YOU NEED{" "}
                              {effectivePlan === "PREMIUM" ? 8 : 12} PP TO EXIT.
                            </Text>
                          ) : null}
                          <View style={styles.leaveConfirmActions}>
                            <Pressable
                              style={[
                                styles.buttonSecondary,
                                { borderColor: CRIMSON, marginRight: 8 },
                              ]}
                              onPress={confirmLeaveSquad}
                              disabled={
                                state.pp <
                                (effectivePlan === "PREMIUM" ? 8 : 12)
                              }
                            >
                              <Text
                                style={[styles.buttonText, { color: CRIMSON }]}
                              >
                                CONFIRM EXIT
                              </Text>
                            </Pressable>
                            <Pressable
                              style={[
                                styles.buttonSecondary,
                                { borderColor: accent },
                              ]}
                              onPress={cancelLeaveSquad}
                            >
                              <Text
                                style={[styles.buttonText, { color: accent }]}
                              >
                                CANCEL
                              </Text>
                            </Pressable>
                          </View>
                        </Animated.View>
                      ) : null}
                      {squads
                        .find((squad) => squad.id === activeSquadId)
                        ?.messages.map((message) => (
                          <View key={message.id} style={styles.squadMessageRow}>
                            <Text style={styles.squadMessageAuthor}>
                              {message.author}
                            </Text>
                            <Text style={styles.squadMessageText}>
                              {message.text}
                            </Text>
                            {message.translatedText ? (
                              <Text style={styles.squadMessageTranslated}>
                                {message.translatedText}
                              </Text>
                            ) : null}
                          </View>
                        ))}
                      <TextInput
                        style={[
                          styles.input,
                          { borderColor: accent, marginTop: 6 },
                        ]}
                        value={squadChatText}
                        onChangeText={setSquadChatText}
                        placeholder="Share a mission update"
                        placeholderTextColor="rgba(244,244,245,0.32)"
                      />
                      <Pressable
                        style={[
                          styles.buttonSecondary,
                          { borderColor: accent, marginTop: 8 },
                        ]}
                        onPress={handleSendSquadMessage}
                      >
                        <Text style={[styles.buttonText, { color: accent }]}>
                          SEND UPDATE
                        </Text>
                      </Pressable>
                    </View>
                  ) : null}
                </View>
              </View>

              <View
                style={{ display: activeTab === "SYSTEM" ? "flex" : "none" }}
              >
                <View style={[styles.panel, { borderColor: accent }]}>
                  <View style={styles.languageRow}>
                    <View style={{ flex: 1 }}>
                      <Text style={[styles.panelTitle, { color: accent }]}>
                        [ {getLocalizedText("languagePickerTitle", language)} ]
                      </Text>
                      <Text style={[styles.storeStatus, { marginTop: 6 }]}>
                        {getLocalizedText("profileLanguageNote", language)}
                      </Text>
                    </View>
                    <View
                      style={[styles.languagePicker, { borderColor: accent }]}
                    >
                      {getSupportedLanguages().map((option) => (
                        <Pressable
                          key={option.code}
                          style={[
                            styles.languageChip,
                            language === option.code &&
                              styles.languageChipActive,
                            { borderColor: accent },
                          ]}
                          onPress={() => void changeLanguage(option.code)}
                        >
                          <Text
                            style={[
                              styles.languageChipText,
                              {
                                color:
                                  language === option.code ? "#000000" : accent,
                              },
                            ]}
                          >
                            {option.label}
                          </Text>
                        </Pressable>
                      ))}
                    </View>
                  </View>
                  <View style={styles.guideCard}>
                    {howToUseSteps.map((step) => (
                      <View key={step.title} style={styles.guideRow}>
                        <Text style={styles.guideTitle}>{step.title}</Text>
                        <Text style={styles.guideBody}>{step.body}</Text>
                      </View>
                    ))}
                  </View>
                </View>

                <View style={[styles.panel, { borderColor: accent }]}>
                  <Text style={[styles.panelTitle, { color: accent }]}>
                    [ EU / ROMANIA COMPLIANCE ]
                  </Text>
                  <Text style={styles.storeTitle}>
                    {buildComplianceNotice(complianceConsent)}
                  </Text>
                  <View style={styles.complianceRow}>
                    <Pressable
                      style={[styles.checkbox, styles.checkboxActive]}
                      onPress={toggleComplianceScreen}
                    >
                      <Text style={styles.checkboxText}>
                        {showComplianceScreen ? "▼" : "►"} OPEN LEGAL SCREEN
                      </Text>
                    </Pressable>
                  </View>
                  {showComplianceScreen ? (
                    <View style={styles.complianceScreen}>
                      <View style={styles.complianceCard}>
                        <Text style={styles.complianceHeading}>
                          PRIVACY POLICY
                        </Text>
                        {getPrivacyPolicyText().map((entry) => (
                          <Text key={entry} style={styles.complianceBody}>
                            {entry}
                          </Text>
                        ))}
                      </View>
                      <View style={styles.complianceCard}>
                        <Text style={styles.complianceHeading}>
                          TERMS OF USE
                        </Text>
                        {getTermsOfUseText().map((entry) => (
                          <Text key={entry} style={styles.complianceBody}>
                            {entry}
                          </Text>
                        ))}
                      </View>
                    </View>
                  ) : null}
                  <View style={styles.complianceRow}>
                    <Pressable
                      style={[
                        styles.checkbox,
                        complianceConsent.privacyAccepted &&
                          styles.checkboxActive,
                      ]}
                      onPress={() =>
                        toggleComplianceConsent(
                          "privacyAccepted",
                          !complianceConsent.privacyAccepted,
                        )
                      }
                    >
                      <Text style={styles.checkboxText}>
                        {complianceConsent.privacyAccepted ? "✓" : "○"} PRIVACY
                        NOTICE ACCEPTED
                      </Text>
                    </Pressable>
                  </View>
                  <View style={styles.complianceRow}>
                    <Pressable
                      style={[
                        styles.checkbox,
                        complianceConsent.termsAccepted &&
                          styles.checkboxActive,
                      ]}
                      onPress={() =>
                        toggleComplianceConsent(
                          "termsAccepted",
                          !complianceConsent.termsAccepted,
                        )
                      }
                    >
                      <Text style={styles.checkboxText}>
                        {complianceConsent.termsAccepted ? "✓" : "○"} TERMS
                        ACCEPTED
                      </Text>
                    </Pressable>
                  </View>
                  <View style={styles.complianceRow}>
                    <Pressable
                      style={[
                        styles.checkbox,
                        complianceConsent.ageConfirmed && styles.checkboxActive,
                      ]}
                      onPress={() =>
                        toggleComplianceConsent(
                          "ageConfirmed",
                          !complianceConsent.ageConfirmed,
                        )
                      }
                    >
                      <Text style={styles.checkboxText}>
                        {complianceConsent.ageConfirmed ? "✓" : "○"} AGE 16+
                        CONFIRMED
                      </Text>
                    </Pressable>
                  </View>
                  <Text
                    style={[
                      styles.storeStatus,
                      { color: accent, marginTop: 6 },
                    ]}
                  >
                    This is a launch-ready EU-style compliance scaffold. A final
                    privacy policy, terms, retention schedule, and data deletion
                    path should be reviewed by local counsel before public
                    release.
                  </Text>
                  <View style={styles.launchMetadataBox}>
                    <Text
                      style={[
                        styles.panelTitle,
                        { color: accent, marginBottom: 4 },
                      ]}
                    >
                      [ LAUNCH CONTACTS ]
                    </Text>
                    <Text style={styles.storeTitle}>
                      Support: {launchMetadata.supportEmail}
                    </Text>
                    <Text style={styles.storeStatus}>
                      Privacy: {launchMetadata.privacyUrl}
                    </Text>
                    <Text style={styles.storeStatus}>
                      Terms: {launchMetadata.termsUrl}
                    </Text>
                    <Text style={styles.storeStatus}>
                      Android: {launchMetadata.playStoreUrl}
                    </Text>
                    <Text style={styles.storeStatus}>
                      iOS: {launchMetadata.appStoreUrl}
                    </Text>
                  </View>
                  <View style={styles.launchMetadataBox}>
                    <Text
                      style={[
                        styles.panelTitle,
                        { color: accent, marginBottom: 4 },
                      ]}
                    >
                      [ STORE COPY READY ]
                    </Text>
                    <Text style={styles.storeTitle}>
                      Title options:{" "}
                      {launchCopyPack.appTitleOptions.join(" • ")}
                    </Text>
                    <Text style={styles.storeStatus}>
                      Short: {launchCopyPack.shortDescription}
                    </Text>
                    <Text style={styles.storeStatus}>
                      Captions:{" "}
                      {launchCopyPack.screenshotCaptions
                        .slice(0, 3)
                        .join(" / ")}
                    </Text>
                    <Text style={styles.storeStatus}>
                      Hooks:{" "}
                      {launchCopyPack.marketingHooks.slice(0, 4).join(" / ")}
                    </Text>
                  </View>
                </View>
              </View>

              <View
                style={{ display: activeTab === "PROFILE" ? "flex" : "none" }}
              >
                <View style={[styles.panel, { borderColor: accent }]}>
                  <Text style={[styles.panelTitle, { color: accent }]}>
                    [ PROGRESSION REWARDS ]
                  </Text>
                  <Text
                    style={[
                      styles.storeTitle,
                      { color: accent, marginBottom: 8 },
                    ]}
                  >
                    REWARDS UNLOCKED: {narrativeProgress.unlockedCount}/
                    {narrativeProgress.totalCount}
                  </Text>
                  <View style={styles.rewardGrid}>
                    {narrativeProgress.episodes.slice(0, 6).map((episode) => {
                      const rewardLabel =
                        episode.requiredLevel <= 2
                          ? "OPERATOR TITLE"
                          : episode.requiredLevel <= 4
                            ? "TERMINAL THEME"
                            : episode.requiredLevel <= 6
                              ? "RECOVERY BOOST"
                              : episode.requiredLevel <= 8
                                ? "ADVANCED PROTOCOL"
                                : episode.requiredLevel <= 10
                                  ? "PRESTIGE BADGE"
                                  : "HIDDEN TRANSMISSION";

                      return (
                        <View
                          key={episode.title}
                          style={[
                            styles.rewardCard,
                            episode.unlocked
                              ? styles.rewardCardUnlocked
                              : styles.rewardCardLocked,
                          ]}
                        >
                          <Text style={styles.rewardCardTitle}>
                            {episode.title}
                          </Text>
                          <Text
                            style={[styles.rewardCardLabel, { color: accent }]}
                          >
                            {rewardLabel}
                          </Text>
                          <Text style={styles.rewardCardStatus}>
                            {episode.unlocked
                              ? `UNLOCKED // LV ${episode.requiredLevel}`
                              : `LOCKED // LV ${episode.requiredLevel}`}
                          </Text>
                        </View>
                      );
                    })}
                  </View>
                </View>
              </View>

              <View
                style={{ display: activeTab === "SYSTEM" ? "flex" : "none" }}
              >
                <View style={[styles.panel, { borderColor: accent }]}>
                  <Text style={[styles.panelTitle, { color: accent }]}>
                    [ {getLocalizedText("commandAccess", language)} ]
                  </Text>
                  <Text style={[styles.storeTitle, { color: accent }]}>
                    Core progression remains free. Premium access is limited to
                    terminal conveniences, recovery tools, and voice-assisted
                    tactical support.
                  </Text>
                </View>
              </View>
            </View>
          </ScrollView>
          {isWeb && (
            <ScrollView
              style={styles.webRightCol}
              contentContainerStyle={styles.webColContent}
            >
              <View style={[styles.bentoWindow, { borderColor: accent }]}>
                <Text style={styles.bentoWindowTitle}>
                  SQUAD COMMAND CENTER
                </Text>
                {squads.map((squad) => (
                  <View
                    key={squad.id}
                    style={[
                      styles.webSquadEntry,
                      { borderColor: `${accent}44` },
                    ]}
                  >
                    <View style={styles.webSquadEntryHeader}>
                      <Text
                        style={[styles.webSquadEntryName, { color: accent }]}
                      >
                        {squad.name}
                      </Text>
                      <View
                        style={[
                          styles.webSquadStatusDot,
                          { backgroundColor: "#00CC66" },
                        ]}
                      />
                    </View>
                    <Text style={styles.bentoDetailMini}>
                      {squad.members.length} MEMBERS • {squad.visibility}
                    </Text>
                    <View style={styles.progressBarShell}>
                      <View
                        style={[
                          styles.progressBarFill,
                          {
                            width: `${Math.min(100, Math.round((squad.progress.current / squad.progress.target) * 100))}%`,
                            backgroundColor: accent,
                          },
                        ]}
                      />
                    </View>
                  </View>
                ))}
              </View>
              <View style={[styles.bentoWindow, { borderColor: accent }]}>
                <Text style={styles.bentoWindowTitle}>
                  SQUAD ADHERENCE METRICS
                </Text>
                {squads
                  .flatMap((squad) => squad.members)
                  .slice(0, 4)
                  .map((member) => (
                    <View key={member.id} style={styles.webMemberRow}>
                      <View
                        style={[
                          styles.webMemberAvatar,
                          { borderColor: accent },
                        ]}
                      >
                        <Text
                          style={[styles.webMemberInitial, { color: accent }]}
                        >
                          {member.name.charAt(0)}
                        </Text>
                      </View>
                      <View style={{ flex: 1 }}>
                        <Text style={[styles.webMemberName, { color: accent }]}>
                          {member.name}
                        </Text>
                        <Text style={styles.bentoDetailMini}>
                          LIVE: ACTIVE • ROLE: {member.role}
                        </Text>
                      </View>
                      <View
                        style={[
                          styles.webMemberStatusDot,
                          { backgroundColor: "#00CC66" },
                        ]}
                      />
                    </View>
                  ))}
              </View>
              <View style={[styles.bentoWindow, { borderColor: accent }]}>
                <Text style={styles.bentoWindowTitle}>NETWORK MAP WINDOW</Text>
                <NetworkMapWidget
                  accent={accent}
                  nodeCount={Math.min(
                    5,
                    squads.reduce((sum, sq) => sum + sq.members.length, 0) + 1,
                  )}
                />
                <Text style={[styles.bentoDetailMini, { marginTop: 8 }]}>
                  STRUCTURAL INTEGRITY:{" "}
                  {squads.length > 0 ? "STABLE" : "ISOLATED"}
                </Text>
              </View>
              <View style={[styles.bentoWindow, { borderColor: accent }]}>
                <Text style={styles.bentoWindowTitle}>
                  PACT VERIFICATION CENTER
                </Text>
                <Text style={[styles.bentoDetailMini, { color: accent }]}>
                  ACTIVE PACT: {state.missionTitle}
                </Text>
                <Text style={styles.bentoDetailMini}>
                  STAKE: {contractStake} PP • DURATION: {contractDuration} MIN
                </Text>
                <Text
                  style={[
                    styles.bentoDetailMini,
                    {
                      color: state.redState ? PEAK_CRIMSON : accent,
                      marginTop: 6,
                    },
                  ]}
                >
                  {"STATUS: " +
                    (state.redState
                      ? "REDSTATE / BREACH"
                      : state.offline
                        ? "OFFLINE MODE"
                        : "OPERATIONAL")}
                </Text>
              </View>
            </ScrollView>
          )}
        </View>
        {tutorialStep !== null && (
          <TutorialOverlay
            step={tutorialStep}
            accent={accent}
            onNext={handleTutorialNext}
            onPrev={handleTutorialPrev}
            onSkip={handleTutorialSkip}
            steps={tutorialSteps}
            language={language}
          />
        )}
        {isWeb ? (
          <View style={[styles.webCLIBar, { borderColor: accent }]}>
            <Text style={[styles.webCLIPrompt, { color: accent }]}>{">"}</Text>
            <TextInput
              style={[styles.webCLIInput, { color: accent }]}
              value={cliInput}
              onChangeText={setCliInput}
              onSubmitEditing={handleCLICommand}
              placeholder="AWAITING COMMAND OR QUERY..."
              placeholderTextColor={`${accent}55`}
              returnKeyType="send"
            />
            <View style={[styles.webCLICursor, { backgroundColor: accent }]} />
          </View>
        ) : (
          <View style={[styles.mobileCLIBar, { borderColor: accent }]}>
            <Text style={[styles.mobileCLIPrompt, { color: accent }]}>
              {">"}
            </Text>
            <TextInput
              style={[styles.mobileCLIInput, { color: accent }]}
              value={cliInput}
              onChangeText={setCliInput}
              onSubmitEditing={handleCLICommand}
              placeholder="AWAITING COMMAND OR QUERY..."
              placeholderTextColor={`${accent}55`}
              returnKeyType="send"
            />
          </View>
        )}
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#030711",
  },
  keyboardShell: {
    flex: 1,
    backgroundColor: "#030711",
  },
  panelHeaderRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  modePill: {
    borderWidth: 1,
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  modePillText: {
    fontFamily: "monospace",
    fontSize: 10,
    fontWeight: "700",
    letterSpacing: 1.6,
  },
  macroRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    marginTop: 10,
    marginBottom: 8,
  },
  macroChip: {
    borderWidth: 1,
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  macroChipText: {
    fontFamily: "monospace",
    fontSize: 10,
    fontWeight: "700",
    letterSpacing: 1.2,
  },
  executionLabel: {
    color: "rgba(244,244,245,0.68)",
    fontFamily: "monospace",
    fontSize: 11,
    letterSpacing: 2.4,
  },
  executionDial: {
    fontFamily: "monospace",
    fontSize: 72,
    fontWeight: "700",
    letterSpacing: 2,
    marginVertical: 8,
  },
  executionHint: {
    color: "rgba(244,244,245,0.72)",
    fontFamily: "monospace",
    fontSize: 12,
    textAlign: "center",
  },
  briefingRow: {
    flexDirection: "row",
    gap: 8,
    marginTop: 8,
  },
  briefingMetric: {
    flex: 1,
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 10,
    paddingVertical: 10,
  },
  briefingMetricLabel: {
    color: "rgba(244,244,245,0.62)",
    fontFamily: "monospace",
    fontSize: 9,
    letterSpacing: 1.4,
    marginBottom: 4,
  },
  briefingMetricValue: {
    color: "#F4F4F5",
    fontFamily: "monospace",
    fontSize: 12,
    fontWeight: "700",
  },
  authBootShell: {
    flex: 1,
  },
  authBootOverlay: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(2, 7, 16, 0.90)",
    paddingHorizontal: 24,
    borderWidth: 1,
    borderColor: "rgba(37, 249, 213, 0.32)",
  },
  authBootLabel: {
    color: "rgba(37, 249, 213, 0.95)",
    fontFamily: "monospace",
    fontSize: 12,
    letterSpacing: 3,
  },
  authBootTitle: {
    color: "#F7FCFF",
    fontFamily: "monospace",
    fontSize: 24,
    fontWeight: "700",
    marginTop: 10,
    textShadowColor: "rgba(37, 249, 213, 0.45)",
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 14,
  },
  container: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "#030711",
  },
  terminalBackdropVeil: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(2, 7, 16, 0.76)",
  },
  screenJitter: {
    transform: [{ translateX: 0.6 }, { translateY: 0.4 }],
    opacity: 0.96,
  },
  holoLayer: {
    ...StyleSheet.absoluteFillObject,
    borderWidth: 1,
    borderColor: "rgba(37, 249, 213, 0.30)",
    backgroundColor: "rgba(37, 249, 213, 0.04)",
    pointerEvents: "none",
  },
  fxGlow: {
    ...StyleSheet.absoluteFillObject,
    top: 22,
    left: 22,
    right: 22,
    height: 140,
    borderRadius: 36,
    backgroundColor: "rgba(37, 249, 213, 0.10)",
    pointerEvents: "none",
    zIndex: 0,
  },
  scanlineOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "transparent",
    borderWidth: 1,
    borderColor: "rgba(79, 163, 255, 0.16)",
    opacity: 0.16,
    pointerEvents: "none",
  },
  scanlineBar: {
    position: "absolute",
    left: 0,
    right: 0,
    height: 2,
    backgroundColor: "rgba(37, 249, 213, 0.16)",
  },
  shell: {
    flex: 1,
    backgroundColor: "transparent",
    zIndex: 2,
  },
  shellContent: {
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 40,
  },
  appShell: {
    borderRadius: 24,
    borderWidth: 1,
    borderColor: "rgba(37, 249, 213, 0.24)",
    backgroundColor: "rgba(5, 10, 18, 0.96)",
    padding: 14,
    shadowColor: "#25F9D5",
    shadowOpacity: 0.34,
    shadowRadius: 36,
    shadowOffset: { width: 0, height: 14 },
    elevation: 12,
  },
  brandHeaderRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    flexWrap: "wrap",
  },
  headerLogo: {
    width: 46,
    height: 46,
  },
  headerCopy: {
    flexShrink: 1,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
    paddingVertical: 12,
    paddingHorizontal: 12,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: "rgba(0, 255, 0, 0.2)",
    backgroundColor: "rgba(2, 10, 7, 0.94)",
  },
  headerContent: {
    flex: 1,
    paddingRight: 8,
  },
  headerFlash: {
    backgroundColor: "rgba(0, 24, 8, 0.98)",
    borderColor: MATRIX_GREEN,
  },
  levelBanner: {
    borderColor: MATRIX_GREEN,
    borderWidth: 1,
    paddingVertical: 8,
    paddingHorizontal: 10,
    marginBottom: 10,
    alignItems: "center",
  },
  recoveryBanner: {
    borderWidth: 1,
    paddingVertical: 8,
    paddingHorizontal: 10,
    marginBottom: 10,
    alignItems: "center",
    backgroundColor: "rgba(127, 231, 201, 0.08)",
  },
  recoveryBannerText: {
    fontFamily: "monospace",
    fontSize: 11,
    letterSpacing: 1.5,
    textTransform: "uppercase",
  },
  levelBannerText: {
    color: MATRIX_GREEN,
    fontFamily: "monospace",
    fontSize: 12,
    letterSpacing: 2,
  },
  label: {
    color: MATRIX_GREEN,
    fontFamily: "monospace",
    fontSize: 12,
    letterSpacing: 2,
  },
  title: {
    color: "#E8FFFF",
    fontFamily: "monospace",
    fontSize: 24,
    fontWeight: "700",
  },
  operatorText: {
    color: "#A6FEFF",
    fontFamily: "monospace",
    fontSize: 11,
    letterSpacing: 2,
    marginTop: 6,
  },
  badge: {
    borderColor: MATRIX_GREEN,
    borderWidth: 1,
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  badgeText: {
    color: MATRIX_GREEN,
    fontFamily: "monospace",
    fontSize: 16,
  },
  heroCard: {
    borderColor: "rgba(37, 249, 213, 0.34)",
    borderWidth: 1,
    padding: 14,
    marginBottom: 12,
    borderRadius: 20,
    backgroundColor: "rgba(7, 12, 24, 0.98)",
    shadowColor: "#4FA3FF",
    shadowOpacity: 0.24,
    shadowRadius: 34,
    shadowOffset: { width: 0, height: 14 },
    elevation: 12,
  },
  heroCardCore: {
    borderRadius: 20,
  },
  heroCardTerminal: {
    borderRadius: 4,
    shadowOpacity: 0,
    elevation: 0,
  },
  heroCardMecha: {
    borderRadius: 24,
    shadowOpacity: 0.24,
  },
  heroCardLitrpg: {
    borderRadius: 10,
    borderWidth: 2,
  },
  heroCardApex: {
    borderRadius: 2,
    shadowOpacity: 0.08,
  },
  heroTopRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  heroPill: {
    borderColor: "rgba(76, 255, 243, 0.35)",
    borderWidth: 1,
    paddingHorizontal: 8,
    paddingVertical: 4,
    backgroundColor: "rgba(76, 255, 243, 0.12)",
  },
  heroPillCore: {
    borderRadius: 8,
  },
  heroPillTerminal: {
    borderRadius: 2,
  },
  heroPillMecha: {
    borderRadius: 14,
    paddingHorizontal: 10,
  },
  heroPillLitrpg: {
    borderRadius: 6,
    borderWidth: 2,
  },
  heroPillApex: {
    borderRadius: 0,
    paddingHorizontal: 9,
  },
  heroPillText: {
    color: MATRIX_GREEN,
    fontFamily: "monospace",
    fontSize: 9,
    letterSpacing: 1,
  },
  heroTitle: {
    color: "#F4F4F5",
    fontFamily: "monospace",
    fontSize: 17,
    fontWeight: "700",
    letterSpacing: 0.8,
    marginBottom: 4,
  },
  heroSubtitle: {
    color: "#C0C0C8",
    fontFamily: "monospace",
    fontSize: 12,
    lineHeight: 19,
    marginBottom: 6,
  },
  heroEmphasis: {
    color: "#C0C0C8",
    fontFamily: "monospace",
    fontSize: 11,
    marginBottom: 8,
  },
  heroMissionRow: {
    borderColor: "rgba(255,255,255,0.14)",
    borderWidth: 1,
    padding: 10,
    backgroundColor: "rgba(255,255,255,0.03)",
  },
  heroMissionRowCore: {
    borderRadius: 10,
  },
  heroMissionRowTerminal: {
    borderRadius: 2,
  },
  heroMissionRowMecha: {
    borderRadius: 16,
    borderWidth: 2,
  },
  heroMissionRowLitrpg: {
    borderRadius: 6,
    borderWidth: 2,
  },
  heroMissionRowApex: {
    borderRadius: 0,
    backgroundColor: "rgba(255, 255, 255, 0.05)",
  },
  heroMissionLabel: {
    color: "#888892",
    fontFamily: "monospace",
    fontSize: 10,
    letterSpacing: 1,
    marginBottom: 3,
  },
  heroMissionText: {
    color: "#F4F4F5",
    fontFamily: "monospace",
    fontSize: 13,
  },
  statsRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 12,
    gap: 8,
  },
  statsRowCore: {
    gap: 8,
  },
  statsRowTerminal: {
    gap: 6,
  },
  statsRowMecha: {
    gap: 10,
  },
  statsRowLitrpg: {
    gap: 7,
  },
  statsRowApex: {
    gap: 12,
  },
  statBox: {
    borderColor: MATRIX_GREEN,
    borderWidth: 1,
    padding: 12,
    flex: 1,
    borderRadius: 16,
    backgroundColor: "rgba(10,4,4,0.90)",
  },
  statBoxCore: {
    borderRadius: 16,
  },
  statBoxTerminal: {
    borderRadius: 2,
  },
  statBoxMecha: {
    borderRadius: 18,
    borderWidth: 2,
  },
  statBoxLitrpg: {
    borderRadius: 8,
    borderWidth: 2,
  },
  statBoxApex: {
    borderRadius: 0,
    paddingVertical: 12,
  },
  statLabel: {
    color: "#909098",
    fontFamily: "monospace",
    fontSize: 9,
    letterSpacing: 1.2,
    marginBottom: 2,
    textTransform: "uppercase",
  },
  statValue: {
    color: "#F4F4F5",
    fontFamily: "monospace",
    fontSize: 22,
    fontWeight: "700",
    marginTop: 2,
    lineHeight: 26,
  },
  statSubLabel: {
    color: "#888892",
    fontFamily: "monospace",
    fontSize: 9,
    letterSpacing: 0.5,
    marginTop: 3,
  },
  onboardingOverlay: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 10,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.9)",
    padding: 24,
  },
  onboardingCard: {
    borderColor: MATRIX_GREEN,
    borderWidth: 1,
    padding: 18,
    borderRadius: 22,
    backgroundColor: "rgba(3, 10, 7, 0.96)",
    maxWidth: 420,
    width: "100%",
    shadowColor: "#00ff00",
    shadowOpacity: 0.16,
    shadowRadius: 20,
    shadowOffset: { width: 0, height: 10 },
  },
  onboardingLabel: {
    color: MATRIX_GREEN,
    fontFamily: "monospace",
    fontSize: 12,
    letterSpacing: 2,
    marginBottom: 8,
  },
  onboardingTitle: {
    color: "#f5fff8",
    fontFamily: "monospace",
    fontSize: 24,
    fontWeight: "700",
    marginBottom: 10,
  },
  onboardingBody: {
    color: MATRIX_GREEN,
    fontFamily: "monospace",
    fontSize: 13,
    lineHeight: 20,
    marginBottom: 12,
  },
  onboardingSteps: {
    marginBottom: 12,
    gap: 4,
  },
  onboardingStep: {
    color: "#f5fff8",
    fontFamily: "monospace",
    fontSize: 12,
    letterSpacing: 1,
  },
  onboardingActionRow: {
    borderWidth: 1,
    marginBottom: 14,
    padding: 10,
    backgroundColor: "rgba(0, 255, 0, 0.05)",
  },
  onboardingActionLabel: {
    fontFamily: "monospace",
    fontSize: 10,
    letterSpacing: 1.5,
    marginBottom: 4,
  },
  onboardingActionValue: {
    color: "#f5fff8",
    fontFamily: "monospace",
    fontSize: 12,
    letterSpacing: 1,
  },
  onboardingButton: {
    backgroundColor: MATRIX_GREEN,
    paddingVertical: 10,
    alignItems: "center",
    borderRadius: 12,
  },
  onboardingButtonText: {
    color: "#000000",
    fontFamily: "monospace",
    fontWeight: "700",
    letterSpacing: 1,
  },
  panel: {
    borderColor: "rgba(79, 163, 255, 0.22)",
    borderWidth: 1,
    padding: 16,
    marginBottom: 12,
    borderRadius: 18,
    backgroundColor: "rgba(6, 10, 18, 0.96)",
    shadowColor: "#25F9D5",
    shadowOpacity: 0.12,
    shadowRadius: 18,
    shadowOffset: { width: 0, height: 6 },
    elevation: 4,
  },
  guideCard: {
    borderColor: MATRIX_GREEN,
    borderWidth: 1,
    padding: 8,
    backgroundColor: "rgba(0, 255, 0, 0.05)",
  },
  squadList: {
    marginTop: 10,
    gap: 8,
  },
  squadCard: {
    borderWidth: 1,
    borderColor: MATRIX_GREEN,
    padding: 10,
    backgroundColor: "rgba(0, 0, 0, 0.32)",
  },
  squadCardActive: {
    backgroundColor: "rgba(0, 255, 0, 0.1)",
  },
  squadTitle: {
    color: "#f5fff8",
    fontFamily: "monospace",
    fontSize: 12,
    fontWeight: "700",
    marginBottom: 4,
  },
  squadVisibilityRow: {
    flexDirection: "row",
    gap: 8,
    marginTop: 6,
    marginBottom: 8,
  },
  visibilityChip: {
    borderWidth: 1,
    paddingHorizontal: 8,
    paddingVertical: 4,
    backgroundColor: "rgba(0, 0, 0, 0.36)",
  },
  visibilityChipActive: {
    backgroundColor: MATRIX_GREEN,
  },
  visibilityChipText: {
    fontFamily: "monospace",
    fontSize: 10,
    letterSpacing: 1,
  },
  squadChatBox: {
    marginTop: 10,
    borderWidth: 1,
    borderColor: MATRIX_GREEN,
    padding: 10,
    backgroundColor: "rgba(0, 0, 0, 0.24)",
  },
  leaveConfirmCard: {
    marginTop: 10,
    borderWidth: 1,
    padding: 10,
    backgroundColor: "rgba(24, 6, 6, 0.92)",
    shadowColor: CRIMSON,
    shadowOpacity: 0.42,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 0 },
  },
  leaveConfirmHeader: {
    marginBottom: 6,
  },
  leaveConfirmTitle: {
    color: "#ffffff",
    fontFamily: "monospace",
    fontSize: 12,
    fontWeight: "700",
    letterSpacing: 1,
  },
  leaveConfirmCountdown: {
    color: CRIMSON,
    fontFamily: "monospace",
    fontSize: 10,
    letterSpacing: 1.2,
    marginTop: 4,
  },
  leaveConfirmBody: {
    color: "#C0C0C8",
    fontFamily: "monospace",
    fontSize: 12,
    lineHeight: 19,
  },
  leaveConfirmWarning: {
    color: CRIMSON,
    fontFamily: "monospace",
    fontSize: 10,
    letterSpacing: 1,
    marginTop: 8,
  },
  leaveConfirmActions: {
    flexDirection: "row",
    marginTop: 10,
    alignItems: "center",
  },
  squadMessageRow: {
    marginTop: 8,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: "rgba(255,255,255,0.1)",
  },
  squadMessageAuthor: {
    color: "#888892",
    fontFamily: "monospace",
    fontSize: 10,
    letterSpacing: 1,
    marginBottom: 2,
  },
  squadMessageText: {
    color: "#F4F4F5",
    fontFamily: "monospace",
    fontSize: 12,
    lineHeight: 18,
  },
  squadMessageTranslated: {
    color: "#7FE7C9",
    fontFamily: "monospace",
    fontSize: 10,
    marginTop: 2,
  },
  guideRow: {
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(255,255,255,0.08)",
  },
  guideTitle: {
    color: "#F4F4F5",
    fontFamily: "monospace",
    fontSize: 13,
    fontWeight: "700",
    marginBottom: 3,
  },
  guideBody: {
    color: "#C0C0C8",
    fontFamily: "monospace",
    fontSize: 12,
    lineHeight: 19,
  },
  ascensionBanner: {
    borderColor: "rgba(255,255,255,0.14)",
    borderWidth: 1,
    padding: 12,
    borderRadius: 10,
    backgroundColor: "rgba(255,42,42,0.05)",
  },
  ascensionBannerFlash: {
    borderColor: AMBER,
    backgroundColor: "rgba(255, 176, 0, 0.12)",
  },
  ascensionBannerTitle: {
    color: "#F4F4F5",
    fontFamily: "monospace",
    fontSize: 14,
    fontWeight: "700",
    letterSpacing: 0.8,
  },
  ascensionBannerSubtitle: {
    color: "#C0C0C8",
    fontFamily: "monospace",
    fontSize: 12,
    lineHeight: 18,
    marginTop: 4,
  },
  progressionSummaryRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    marginTop: 6,
  },
  progressionSummaryCard: {
    borderColor: "rgba(255,255,255,0.12)",
    borderWidth: 1,
    padding: 10,
    flexBasis: "31%",
    minWidth: 100,
    backgroundColor: "rgba(255,255,255,0.03)",
  },
  progressionSummaryTitle: {
    color: "#909098",
    fontFamily: "monospace",
    fontSize: 10,
    letterSpacing: 0.8,
    marginBottom: 4,
  },
  progressionSummaryValue: {
    color: "#F4F4F5",
    fontFamily: "monospace",
    fontSize: 14,
    fontWeight: "700",
    marginBottom: 2,
  },
  progressionSummaryDetail: {
    color: "#888892",
    fontFamily: "monospace",
    fontSize: 11,
    lineHeight: 16,
  },
  towerRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 6,
    marginTop: 6,
  },
  towerFloor: {
    borderWidth: 1,
    paddingVertical: 8,
    paddingHorizontal: 10,
    minWidth: 44,
    alignItems: "center",
  },
  towerFloorLabel: {
    color: "#dceee0",
    fontFamily: "monospace",
    fontSize: 9,
    letterSpacing: 1,
  },
  towerFloorValue: {
    fontFamily: "monospace",
    fontSize: 13,
    fontWeight: "700",
    marginTop: 2,
  },
  progressBarShell: {
    height: 8,
    backgroundColor: "rgba(255, 255, 255, 0.08)",
    marginTop: 10,
    overflow: "hidden",
  },
  progressBarFill: {
    height: 8,
  },
  challengeCard: {
    borderWidth: 1,
    padding: 10,
    backgroundColor: "rgba(0, 0, 0, 0.32)",
  },
  challengeTitle: {
    color: "#F4F4F5",
    fontFamily: "monospace",
    fontSize: 12,
    fontWeight: "700",
    letterSpacing: 0.6,
    marginBottom: 6,
  },
  challengeBody: {
    color: "#C0C0C8",
    fontFamily: "monospace",
    fontSize: 12,
    lineHeight: 19,
  },
  challengeReward: {
    color: AMBER,
    fontFamily: "monospace",
    fontSize: 10,
    letterSpacing: 1,
    marginTop: 8,
  },
  skillGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    marginTop: 6,
  },
  skillCard: {
    borderColor: "rgba(255,255,255,0.12)",
    borderWidth: 1,
    padding: 10,
    flexBasis: "48%",
    minWidth: 120,
    backgroundColor: "rgba(255,255,255,0.03)",
  },
  skillTitle: {
    color: "#888892",
    fontFamily: "monospace",
    fontSize: 10,
    letterSpacing: 0.8,
    marginBottom: 4,
  },
  skillValue: {
    fontFamily: "monospace",
    fontSize: 14,
    fontWeight: "700",
    marginBottom: 2,
  },
  complianceScreen: {
    marginTop: 8,
  },
  complianceCard: {
    marginTop: 10,
    padding: 12,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.1)",
    borderRadius: 8,
    backgroundColor: "rgba(0,0,0,0.34)",
  },
  complianceHeading: {
    color: "#F4F4F5",
    fontFamily: "monospace",
    fontSize: 11,
    fontWeight: "700",
    textTransform: "uppercase",
    marginBottom: 6,
    letterSpacing: 1,
  },
  complianceBody: {
    color: "#C0C0C8",
    fontFamily: "monospace",
    fontSize: 11,
    lineHeight: 18,
  },
  complianceRow: {
    marginTop: 8,
  },
  checkbox: {
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.16)",
    paddingVertical: 9,
    paddingHorizontal: 12,
    borderRadius: 6,
    backgroundColor: "rgba(0,0,0,0.35)",
  },
  checkboxActive: {
    borderColor: PEAK_CRIMSON,
    backgroundColor: "rgba(255,42,42,0.10)",
  },
  checkboxText: {
    color: "#C0C0C8",
    fontFamily: "monospace",
    fontSize: 12,
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  statusPanel: {
    backgroundColor: "rgba(0, 8, 6, 0.8)",
  },
  panelTitle: {
    color: "#F4F4F5",
    fontFamily: "monospace",
    fontSize: 12,
    fontWeight: "700",
    marginBottom: 10,
    letterSpacing: 0.8,
  },
  languageRow: {
    marginBottom: 8,
  },
  languagePicker: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 6,
    marginTop: 4,
  },
  languageChip: {
    borderWidth: 1,
    paddingHorizontal: 8,
    paddingVertical: 4,
    backgroundColor: "rgba(0, 0, 0, 0.4)",
  },
  languageChipActive: {
    backgroundColor: MATRIX_GREEN,
  },
  languageChipText: {
    fontFamily: "monospace",
    fontSize: 10,
    letterSpacing: 1,
  },
  logBox: {
    maxHeight: 220,
  },
  logContent: {
    gap: 4,
  },
  logLine: {
    color: "#C0C0C8",
    fontFamily: "monospace",
    fontSize: 12,
    lineHeight: 18,
  },
  inputRow: {
    marginBottom: 8,
  },
  inputHelperRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 6,
    gap: 8,
  },
  inputHint: {
    color: "#888892",
    fontFamily: "monospace",
    fontSize: 10,
    flex: 1,
    lineHeight: 16,
  },
  inputHelperButton: {
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.2)",
    paddingHorizontal: 8,
    paddingVertical: 4,
    backgroundColor: "rgba(255,255,255,0.04)",
  },
  inputHelperButtonText: {
    fontFamily: "monospace",
    fontSize: 10,
    letterSpacing: 1,
  },
  input: {
    borderColor: "rgba(79, 163, 255, 0.38)",
    borderWidth: 1,
    minHeight: 70,
    color: "#F4F4F5",
    fontFamily: "monospace",
    padding: 12,
    fontSize: 13,
    lineHeight: 20,
    borderRadius: 12,
    backgroundColor: "rgba(3, 8, 18, 0.90)",
  },
  dailyLoopCard: {
    borderWidth: 1,
    padding: 16,
    marginBottom: 12,
    borderRadius: 16,
    backgroundColor: "rgba(10,4,4,0.92)",
  },
  recoveryLoopCard: {
    borderColor: "#7FE7C9",
    backgroundColor: "rgba(127, 231, 201, 0.08)",
  },
  dailyLoopHeaderRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 10,
  },
  dailyLoopTitle: {
    color: "#F4F4F5",
    fontFamily: "monospace",
    fontSize: 13,
    fontWeight: "700",
    letterSpacing: 0.6,
  },
  dailyLoopNextBadge: {
    borderWidth: 1,
    paddingHorizontal: 7,
    paddingVertical: 3,
    borderRadius: 4,
  },
  dailyLoopNextBadgeText: {
    fontFamily: "monospace",
    fontSize: 9,
    fontWeight: "700",
    letterSpacing: 1.2,
  },
  dailyLoopBody: {
    color: "#C0C0C8",
    fontFamily: "monospace",
    fontSize: 12,
    lineHeight: 19,
    marginBottom: 8,
  },
  dailyLoopNextAction: {
    fontFamily: "monospace",
    fontSize: 12,
    lineHeight: 18,
    marginBottom: 12,
    letterSpacing: 0.3,
  },
  dailyLoopSteps: {
    gap: 8,
  },
  dailyLoopStep: {
    flexDirection: "row",
    gap: 10,
    alignItems: "flex-start",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.10)",
    padding: 10,
    borderRadius: 8,
    backgroundColor: "rgba(255,255,255,0.03)",
  },
  dailyLoopStepNum: {
    fontFamily: "monospace",
    fontSize: 16,
    fontWeight: "700",
    width: 22,
    flexShrink: 0,
    marginTop: 1,
  },
  dailyLoopStepContent: {
    flex: 1,
  },
  dailyLoopStepTitle: {
    color: "#F4F4F5",
    fontFamily: "monospace",
    fontSize: 12,
    fontWeight: "700",
    marginBottom: 3,
  },
  dailyLoopStepBody: {
    color: "#C0C0C8",
    fontFamily: "monospace",
    fontSize: 11,
    lineHeight: 17,
  },
  buttonRow: {
    flexDirection: "row",
    gap: 8,
    marginBottom: 8,
  },
  buttonPrimary: {
    flex: 1,
    backgroundColor: "rgba(37, 249, 213, 0.16)",
    paddingVertical: 10,
    alignItems: "center",
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "rgba(37, 249, 213, 0.48)",
    shadowColor: "#4FA3FF",
    shadowOpacity: 0.28,
    shadowRadius: 18,
    shadowOffset: { width: 0, height: 8 },
    elevation: 6,
  },
  buttonPressed: {
    opacity: 0.86,
    transform: [{ scale: 0.98 }],
  },
  buttonSecondary: {
    flex: 1,
    borderColor: "rgba(79, 163, 255, 0.36)",
    borderWidth: 1,
    paddingVertical: 10,
    alignItems: "center",
    borderRadius: 14,
    backgroundColor: "rgba(8, 13, 22, 0.84)",
  },
  buttonText: {
    color: "#F7FCFF",
    fontFamily: "monospace",
    fontWeight: "700",
  },
  statusTagRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    marginTop: 8,
    gap: 6,
  },
  statusTag: {
    borderColor: CRIMSON,
    borderWidth: 1,
    paddingHorizontal: 8,
    paddingVertical: 4,
    backgroundColor: "rgba(255, 0, 51, 0.12)",
  },
  statusTagText: {
    color: CRIMSON,
    fontFamily: "monospace",
    fontSize: 10,
    letterSpacing: 1,
  },
  manualEntry: {
    marginBottom: 8,
  },
  insightBox: {
    borderColor: MATRIX_GREEN,
    borderWidth: 1,
    padding: 8,
    marginTop: 8,
    backgroundColor: "rgba(255, 176, 0, 0.08)",
  },
  guidanceBox: {
    borderColor: MATRIX_GREEN,
    borderWidth: 1,
    padding: 8,
    marginTop: 8,
    backgroundColor: "rgba(0, 255, 0, 0.05)",
  },
  launchMetadataBox: {
    borderColor: MATRIX_GREEN,
    borderWidth: 1,
    padding: 10,
    marginTop: 8,
    backgroundColor: "rgba(8, 20, 14, 0.72)",
  },
  launchShowcasePanel: {
    padding: 0,
    overflow: "hidden",
    backgroundColor: "rgba(0, 0, 0, 0.5)",
  },
  launchShowcaseArt: {
    minHeight: 220,
    justifyContent: "flex-end",
  },
  launchShowcaseArtImage: {
    opacity: 0.82,
  },
  launchShowcaseVeil: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0, 0, 0, 0.54)",
  },
  launchShowcaseContent: {
    position: "relative",
    padding: 14,
  },
  launchShowcaseHeaderRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  launchShowcaseLogo: {
    width: 86,
    height: 86,
  },
  launchShowcaseHeaderCopy: {
    flex: 1,
  },
  launchShowcaseSubtitle: {
    color: "#C0C0C8",
    fontFamily: "monospace",
    fontSize: 11,
    lineHeight: 18,
  },
  launchShowcaseCaptionRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    marginTop: 12,
  },
  launchShowcaseMetaRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    marginTop: 12,
  },
  launchShowcaseMetaChip: {
    borderWidth: 1,
    paddingHorizontal: 8,
    paddingVertical: 5,
    backgroundColor: "rgba(0, 0, 0, 0.58)",
  },
  launchShowcaseMetaText: {
    fontFamily: "monospace",
    fontSize: 9,
    fontWeight: "700",
    letterSpacing: 1.3,
  },
  launchShowcaseCaptionChip: {
    borderWidth: 1,
    paddingHorizontal: 8,
    paddingVertical: 6,
    backgroundColor: "rgba(0, 0, 0, 0.42)",
    maxWidth: "100%",
  },
  launchShowcaseCaptionText: {
    fontFamily: "monospace",
    fontSize: 10,
    letterSpacing: 0.6,
  },
  launchShowcaseBody: {
    color: "#f5fff8",
    fontFamily: "monospace",
    fontSize: 11,
    lineHeight: 16,
    marginTop: 12,
  },
  launchMediaRail: {
    flexDirection: "row",
    gap: 8,
    marginTop: 10,
  },
  launchMediaCard: {
    flex: 1,
    minHeight: 120,
    borderWidth: 1,
    overflow: "hidden",
    backgroundColor: "rgba(0, 0, 0, 0.56)",
  },
  launchMediaArt: {
    flex: 1,
    justifyContent: "flex-end",
    alignItems: "flex-start",
    padding: 10,
  },
  launchMediaArtImage: {
    opacity: 0.88,
  },
  launchMediaIconImage: {
    opacity: 0.95,
  },
  launchMediaVeil: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0, 0, 0, 0.38)",
  },
  launchMediaLabel: {
    position: "relative",
    fontFamily: "monospace",
    fontSize: 10,
    fontWeight: "700",
    letterSpacing: 1.4,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderWidth: 1,
    borderColor: "rgba(0, 255, 0, 0.4)",
    backgroundColor: "rgba(0, 0, 0, 0.52)",
  },
  storeItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 4,
  },
  rewardGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  rewardCard: {
    width: "48%",
    borderWidth: 1,
    padding: 10,
    marginBottom: 8,
    minHeight: 90,
  },
  rewardCardUnlocked: {
    borderColor: "rgba(255,42,42,0.4)",
    backgroundColor: "rgba(255,42,42,0.06)",
  },
  rewardCardLocked: {
    borderColor: "rgba(255,255,255,0.1)",
    backgroundColor: "rgba(0,0,0,0.3)",
  },
  rewardCardTitle: {
    color: "#F4F4F5",
    fontFamily: "monospace",
    fontSize: 11,
    fontWeight: "700",
    marginBottom: 4,
  },
  rewardCardLabel: {
    fontFamily: "monospace",
    fontSize: 10,
    marginBottom: 4,
    textTransform: "uppercase",
    letterSpacing: 0.8,
  },
  rewardCardStatus: {
    color: "#888892",
    fontFamily: "monospace",
    fontSize: 10,
    lineHeight: 15,
  },
  storeTitle: {
    color: "#F4F4F5",
    fontFamily: "monospace",
    fontSize: 13,
    lineHeight: 19,
    marginBottom: 2,
  },
  storeStatus: {
    color: "#C0C0C8",
    fontFamily: "monospace",
    fontSize: 12,
    lineHeight: 18,
  },
  templateCard: {
    borderWidth: 1,
    padding: 10,
    marginBottom: 8,
    borderRadius: 14,
  },
  templateCardCore: {
    borderRadius: 14,
  },
  templateCardTerminal: {
    borderRadius: 4,
  },
  templateCardMecha: {
    borderRadius: 20,
  },
  templateCardLitrpg: {
    borderRadius: 10,
    borderWidth: 2,
  },
  templateCardApex: {
    borderRadius: 2,
    paddingVertical: 12,
  },
  templateHeaderRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  templateSwatch: {
    width: 40,
    height: 40,
    borderWidth: 1,
    borderRadius: 10,
  },
  templateSwatchCore: {
    borderRadius: 10,
  },
  templateSwatchTerminal: {
    borderRadius: 2,
  },
  templateSwatchMecha: {
    borderRadius: 18,
  },
  templateSwatchLitrpg: {
    borderRadius: 6,
    borderWidth: 2,
  },
  templateSwatchApex: {
    borderRadius: 0,
  },
  templateMeta: {
    flex: 1,
  },
  templateTitle: {
    fontFamily: "monospace",
    fontSize: 12,
    fontWeight: "700",
    marginBottom: 4,
  },
  templateBody: {
    color: "#cfeeda",
    fontFamily: "monospace",
    fontSize: 10,
    lineHeight: 14,
  },
  templateSignatureRow: {
    marginTop: 8,
    marginBottom: 4,
  },
  templateSignatureLabel: {
    fontFamily: "monospace",
    fontSize: 9,
    letterSpacing: 0.8,
    marginBottom: 4,
  },
  templateSignatureTrack: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
  },
  templateSignatureNode: {
    height: 6,
    borderWidth: 1,
    borderRadius: 2,
  },
  templateMetaRow: {
    marginTop: 8,
    marginBottom: 6,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    gap: 10,
  },
  templateTierPill: {
    borderWidth: 1,
    borderRadius: 999,
    paddingHorizontal: 8,
    paddingVertical: 3,
    fontFamily: "monospace",
    fontSize: 9,
    letterSpacing: 0.8,
    overflow: "hidden",
  },
  templateStateLabel: {
    color: "#888892",
    fontFamily: "monospace",
    fontSize: 10,
    letterSpacing: 0.8,
  },
  templateValueCue: {
    color: "#888892",
    fontFamily: "monospace",
    fontSize: 10,
    lineHeight: 15,
    marginBottom: 2,
  },
  templateFooterRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 8,
  },
  templatePrice: {
    fontFamily: "monospace",
    fontSize: 10,
    fontWeight: "700",
  },
  templateAction: {
    borderWidth: 1,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 10,
    backgroundColor: "rgba(0, 0, 0, 0.2)",
  },
  templateActionCore: {
    borderRadius: 10,
  },
  templateActionTerminal: {
    borderRadius: 2,
  },
  templateActionMecha: {
    borderRadius: 14,
    paddingHorizontal: 12,
  },
  templateActionLitrpg: {
    borderRadius: 6,
    borderWidth: 2,
  },
  templateActionApex: {
    borderRadius: 1,
  },
  templateActionText: {
    fontFamily: "monospace",
    fontSize: 10,
    letterSpacing: 1,
    fontWeight: "700",
  },

  // ── Crimson Ledger: SYS_STATUS strip ──────────────────────────────────────
  sysStatusStrip: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 10,
    paddingVertical: 4,
    backgroundColor: "rgba(0,0,0,0.88)",
    borderBottomWidth: 1,
    borderBottomColor: "rgba(255,42,42,0.28)",
    marginBottom: 6,
  },
  sysStatusText: {
    color: "#C0C0C8",
    fontFamily: "monospace",
    fontSize: 10,
    letterSpacing: 0.5,
  },

  // ── Bento header ──────────────────────────────────────────────────────────
  headerBentoRow: {
    flexDirection: "row",
    gap: 8,
    marginBottom: 10,
  },
  operatorLedgerPane: {
    flex: 1,
    borderWidth: 1,
    borderRadius: 8,
    padding: 10,
    backgroundColor: "rgba(13,0,0,0.92)",
  },
  severanceTimerPane: {
    flex: 1,
    borderWidth: 1,
    borderRadius: 8,
    padding: 10,
    backgroundColor: "rgba(13,0,0,0.92)",
    alignItems: "flex-end",
  },
  bentoWindowTitle: {
    color: "#909098",
    fontFamily: "monospace",
    fontSize: 10,
    letterSpacing: 1.2,
    marginBottom: 6,
    textTransform: "uppercase",
  },
  bentoOperatorId: {
    fontFamily: "monospace",
    fontSize: 10,
    letterSpacing: 0.8,
    marginBottom: 2,
  },
  bentoLvlBadge: {
    fontFamily: "monospace",
    fontSize: 11,
    fontWeight: "700",
    letterSpacing: 1,
    marginBottom: 2,
  },
  bentoPPHero: {
    fontFamily: "monospace",
    fontSize: 26,
    fontWeight: "700",
    letterSpacing: 1,
    marginBottom: 4,
  },
  bentoProtocolLine: {
    color: "#888892",
    fontFamily: "monospace",
    fontSize: 10,
    letterSpacing: 0.4,
  },
  bentoCountdown: {
    fontFamily: "monospace",
    fontSize: 22,
    fontWeight: "700",
    letterSpacing: 2,
    marginBottom: 4,
  },
  bentoTimerLabel: {
    color: "#909098",
    fontFamily: "monospace",
    fontSize: 10,
    letterSpacing: 0.8,
    marginBottom: 4,
  },
  bentoStreakText: {
    fontFamily: "monospace",
    fontSize: 10,
    letterSpacing: 0.8,
    marginBottom: 2,
  },
  bentoXpText: {
    fontFamily: "monospace",
    fontSize: 10,
    letterSpacing: 0.8,
  },

  // ── Active Pact Ring section ───────────────────────────────────────────────
  pactRingSection: {
    borderWidth: 1,
    borderRadius: 12,
    padding: 14,
    marginBottom: 10,
    backgroundColor: "rgba(13,0,0,0.88)",
    alignItems: "center",
  },
  pactRingSectionTitle: {
    color: "#F4F4F5",
    fontFamily: "monospace",
    fontSize: 9,
    letterSpacing: 2,
    opacity: 0.55,
    marginBottom: 10,
    textTransform: "uppercase",
  },
  pactRingDualView: {
    flexDirection: "row",
    justifyContent: "center",
    gap: 16,
    marginBottom: 10,
  },
  pactRingHalf: {
    alignItems: "center",
  },
  pactRingLabel: {
    fontFamily: "monospace",
    fontSize: 10,
    fontWeight: "700",
    letterSpacing: 0.5,
    marginTop: 6,
  },
  pactRingSubLabel: {
    fontFamily: "monospace",
    fontSize: 9,
    letterSpacing: 0.5,
    opacity: 0.75,
    marginTop: 2,
  },
  pactRingMissionText: {
    fontFamily: "monospace",
    fontSize: 11,
    letterSpacing: 0.8,
    marginBottom: 6,
    textAlign: "center",
  },
  pactRingVerifyHint: {
    fontFamily: "monospace",
    fontSize: 11,
    fontWeight: "700",
    letterSpacing: 1.5,
    borderWidth: 1,
    borderColor: "rgba(244,244,245,0.3)",
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 4,
  },

  // ── Mobile CLI bar ─────────────────────────────────────────────────────────
  mobileCLIBar: {
    flexDirection: "row",
    alignItems: "center",
    borderTopWidth: 1,
    paddingHorizontal: 14,
    paddingVertical: 10,
    backgroundColor: "rgba(0,0,0,0.96)",
    gap: 8,
  },
  mobileCLIPrompt: {
    fontFamily: "monospace",
    fontSize: 14,
    fontWeight: "700",
  },
  mobileCLIInput: {
    flex: 1,
    fontFamily: "monospace",
    fontSize: 12,
    letterSpacing: 0.5,
    paddingVertical: 0,
  },

  // ── Web layout ─────────────────────────────────────────────────────────────
  mobileColumnWrapper: {
    flex: 1,
  },
  webColumnsRow: {
    flex: 1,
    flexDirection: "row",
  },
  webGlobalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 18,
    paddingVertical: 8,
    borderBottomWidth: 1,
    backgroundColor: "rgba(0,0,0,0.95)",
  },
  webGlobalTitle: {
    fontFamily: "monospace",
    fontSize: 11,
    fontWeight: "700",
    letterSpacing: 1.5,
  },
  webGlobalCenter: {
    flexDirection: "row",
    gap: 20,
    alignItems: "center",
  },
  webGlobalStatus: {
    fontFamily: "monospace",
    fontSize: 10,
    letterSpacing: 1,
  },
  webGlobalTime: {
    color: "#F4F4F5",
    fontFamily: "monospace",
    fontSize: 10,
    letterSpacing: 1,
  },
  webGlobalAuth: {
    fontFamily: "monospace",
    fontSize: 10,
    letterSpacing: 1,
    opacity: 0.7,
  },
  webLeftCol: {
    width: 280,
    borderRightWidth: 1,
    borderRightColor: "rgba(255,42,42,0.2)",
  },
  webCenterCol: {
    flex: 1,
  },
  webRightCol: {
    width: 280,
    borderLeftWidth: 1,
    borderLeftColor: "rgba(255,42,42,0.2)",
  },
  webColContent: {
    padding: 12,
    gap: 10,
  },
  bentoWindow: {
    borderWidth: 1,
    borderRadius: 6,
    padding: 12,
    backgroundColor: "rgba(13,0,0,0.88)",
    marginBottom: 8,
  },
  bentoDetailMini: {
    color: "#F4F4F580",
    fontFamily: "monospace",
    fontSize: 9,
    letterSpacing: 0.6,
    marginTop: 2,
  },
  webLedgerPP: {
    fontFamily: "monospace",
    fontSize: 32,
    fontWeight: "700",
    letterSpacing: 1,
  },
  webLedgerPPLabel: {
    color: "#F4F4F560",
    fontFamily: "monospace",
    fontSize: 9,
    letterSpacing: 1.5,
    textTransform: "uppercase",
  },
  webLedgerSpacer: {
    height: 8,
  },
  webLedgerDetail: {
    fontFamily: "monospace",
    fontSize: 10,
    letterSpacing: 0.5,
    marginBottom: 2,
  },
  webSearchHeader: {
    flexDirection: "row",
    borderBottomWidth: 1,
    borderBottomColor: "rgba(255,42,42,0.2)",
    paddingBottom: 4,
    marginBottom: 4,
  },
  webSearchCol: {
    flex: 1,
    color: "#F4F4F555",
    fontFamily: "monospace",
    fontSize: 8,
    letterSpacing: 0.8,
  },
  webSearchRow: {
    flexDirection: "row",
    paddingVertical: 3,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(255,42,42,0.08)",
  },
  webSearchCell: {
    flex: 1,
    color: "#F4F4F5",
    fontFamily: "monospace",
    fontSize: 9,
  },
  webGalleryItem: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderRadius: 4,
    padding: 8,
    marginBottom: 6,
    gap: 8,
    backgroundColor: "rgba(0,0,0,0.5)",
  },
  webGalleryColor: {
    width: 24,
    height: 24,
    borderRadius: 3,
    flexShrink: 0,
  },
  webGalleryName: {
    fontFamily: "monospace",
    fontSize: 9,
    fontWeight: "700",
    letterSpacing: 0.5,
    marginBottom: 2,
  },
  webGalleryPrice: {
    color: "#F4F4F555",
    fontFamily: "monospace",
    fontSize: 8,
    letterSpacing: 0.5,
  },
  webGalleryState: {
    fontFamily: "monospace",
    fontSize: 9,
    fontWeight: "700",
    letterSpacing: 1,
    flexShrink: 0,
  },
  webGalleryUpgradeBtn: {
    borderWidth: 1,
    borderRadius: 4,
    paddingVertical: 8,
    alignItems: "center",
    marginTop: 8,
    backgroundColor: "rgba(255,42,42,0.08)",
  },
  webGalleryUpgradeText: {
    fontFamily: "monospace",
    fontSize: 10,
    fontWeight: "700",
    letterSpacing: 1.5,
  },
  webSquadEntry: {
    borderWidth: 1,
    borderRadius: 4,
    padding: 8,
    marginBottom: 8,
    backgroundColor: "rgba(0,0,0,0.5)",
  },
  webSquadEntryHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 4,
  },
  webSquadEntryName: {
    fontFamily: "monospace",
    fontSize: 10,
    fontWeight: "700",
    letterSpacing: 0.8,
  },
  webSquadStatusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  webMemberRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 6,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(255,42,42,0.1)",
    gap: 8,
  },
  webMemberAvatar: {
    width: 28,
    height: 28,
    borderRadius: 14,
    borderWidth: 1.5,
    backgroundColor: "rgba(255,42,42,0.12)",
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
  },
  webMemberInitial: {
    fontFamily: "monospace",
    fontSize: 10,
    fontWeight: "700",
  },
  webMemberName: {
    fontFamily: "monospace",
    fontSize: 10,
    fontWeight: "700",
    letterSpacing: 0.5,
  },
  webMemberStatusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    flexShrink: 0,
  },

  // ── CLI bars ───────────────────────────────────────────────────────────────
  webCLIBar: {
    flexDirection: "row",
    alignItems: "center",
    borderTopWidth: 1,
    paddingHorizontal: 18,
    paddingVertical: 12,
    backgroundColor: "rgba(0,0,0,0.98)",
    gap: 10,
  },
  webCLIPrompt: {
    fontFamily: "monospace",
    fontSize: 14,
    fontWeight: "700",
    flexShrink: 0,
  },
  webCLIInput: {
    flex: 1,
    fontFamily: "monospace",
    fontSize: 13,
    letterSpacing: 0.5,
    paddingVertical: 0,
  },
  webCLICursor: {
    width: 9,
    height: 16,
    opacity: 0.8,
    flexShrink: 0,
  },
});