import Purchases, { LOG_LEVEL } from "react-native-purchases";
import RevenueCatUI from "react-native-purchases-ui";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { StatusBar } from "expo-status-bar";
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
  Image,
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
import AccessGate from "./src/components/AccessGate";
import BootSequence from "./src/components/BootSequence";
import BrandMark from "./src/components/BrandMark";
import PactRing from "./src/components/PactRing";
import MonetizationPanel from "./src/components/MonetizationPanel";
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
import { getLaunchMetadata } from "./src/services/launchConfig";
import { getLaunchCopyPack } from "./src/services/launchPack";
import {
  getActiveProductPlan,
  getFeatureLockMessage,
  getPlanFeatures,
  resolveEffectiveProductPlan,
} from "./src/services/productPlan";
import {
  appendPactHistory,
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
  consumeStabilization,
  DAILY_STABILIZATION_COST_PP,
  DAILY_STABILIZATION_LIMIT,
  deriveProtocolArchetype,
  evaluateFocusLockViolation,
  getProtocolStatusEffect,
  getStabilizationUsageState,
} from "./src/services/protocolSystem";
import {
  generateMissionBriefing,
  getConsequencePacket,
  getDailyLoopGuide,
  getDisciplineBanner,
  getFirstSessionGuide,
  getHeroSummary,
  getHowToUseSystemSteps,
  getMissionGuidance,
  getOperatorInsight,
  getOperatorManualEntries,
  getProgressionSnapshot,
  getStatusEffectTags,
  getTerminalGlitchEvent,
} from "./src/services/missionSystem";
import {
  getLocalizedText,
  getStoredLanguage,
  getSupportedLanguages,
  setStoredLanguage,
  type SupportedLanguage,
} from "./src/services/i18n";
import { TUTORIAL_STEPS } from "./src/services/tutorialService";
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
import {
  clearPersistedAppState,
  loadPersistedAppState,
  savePersistedAppState,
} from "./src/services/appStateStorage";
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

const MATRIX_GREEN = "#00FF00";
const AMBER = "#FFB000";
const CRIMSON = "#FF0033";
const PEAK_CRIMSON = "#FF2A2A";
const BONE_WHITE = "#F4F4F5";
const LOCAL_ACCESS_SESSION_KEY = "@peakpact/local-access-session";
const terminalBackdrop = require("./assets/background.peakpact.png");
const peakpactIcon = require("./assets/icon.png");
const peakpactAdaptiveIcon = require("./assets/adaptive-icon.png");
const peakpactSplash = require("./assets/splash-icon.png");

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

const APP_TABS: { id: AppTab; label: string }[] = [
  { id: "PACT", label: "PACT" },
  { id: "SQUAD", label: "SQUAD" },
  { id: "STORE", label: "STORE" },
  { id: "PROFILE", label: "PROFILE" },
  { id: "SYSTEM", label: "SYSTEM" },
];

const TAB_INTROS: Record<AppTab, { title: string; body: string }> = {
  PACT: {
    title: "PACT OPERATIONS",
    body: "Write a contract, stake PP, and submit proof of completion. The AI verifies your report and awards or deducts points.",
  },
  SQUAD: {
    title: "SQUAD NETWORK",
    body: "Build or join accountability crews. Members see each other's live adherence and PP status in real time. Leaving costs PP.",
  },
  STORE: {
    title: "SYSTEM GALLERY",
    body: "Spend earned PP to unlock premium visual themes. Each template has unique colors, animations, and press sounds.",
  },
  PROFILE: {
    title: "OPERATOR PROFILE",
    body: "Track your full progression path, unlock narrative rewards, and review your complete discipline history.",
  },
  SYSTEM: {
    title: "SYSTEM SETTINGS",
    body: "Language selection, legal compliance, operator manual, and system configuration.",
  },
};

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
}: {
  active: AppTab;
  onPress: (t: AppTab) => void;
  accent: string;
}) {
  return (
    <View style={_tabBarSS.bar}>
      {APP_TABS.map((tab) => (
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

function SectionIntro({ tab, accent }: { tab: AppTab; accent: string }) {
  const intro = TAB_INTROS[tab];
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
}: {
  step: number;
  accent: string;
  onNext: () => void;
  onPrev: () => void;
  onSkip: () => void;
}) {
  const current = TUTORIAL_STEPS[step];
  if (!current) return null;
  return (
    <View style={_tutSS.overlay}>
      <View style={[_tutSS.card, { borderColor: accent }]}>
        <View style={_tutSS.topRow}>
          <Text style={_tutSS.stepCt}>
            STEP {step + 1} / {TUTORIAL_STEPS.length}
          </Text>
          <Pressable onPress={onSkip}>
            <Text style={[_tutSS.skip, { color: `${accent}99` }]}>
              SKIP TUTORIAL
            </Text>
          </Pressable>
        </View>
        <View style={_tutSS.progRow}>
          {TUTORIAL_STEPS.map((_, i) => (
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
          <Text style={[_tutSS.hintTxt, { color: accent }]}>▶ {current.hint}</Text>
        </View>
        <View style={_tutSS.actions}>
          <Pressable
            style={[_tutSS.btnBack, { borderColor: `${accent}55` }]}
            onPress={step > 0 ? onPrev : undefined}
          >
            {step > 0 ? (
              <Text style={[_tutSS.btnBkTxt, { color: accent }]}>← BACK</Text>
            ) : null}
          </Pressable>
          <Pressable
            style={[_tutSS.btnNext, { backgroundColor: accent }]}
            onPress={onNext}
          >
            <Text style={_tutSS.btnNxTxt}>
              {step === TUTORIAL_STEPS.length - 1 ? "ENTER SYSTEM →" : "NEXT →"}
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
  const [isRecording, setIsRecording] = useState(false);
  const [statusMessage, setStatusMessage] = useState("SYSTEM READY");
  const [showMonetization, setShowMonetization] = useState(false);
  const [onboardingSeen, setOnboardingSeen] = useState(false);
  const [language, setLanguage] = useState<SupportedLanguage>("en");
  const [showOperatorManual, setShowOperatorManual] = useState(false);
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
  const [tutorialStep, setTutorialStep] = useState<number | null>(null);
  const [tutorialCompleted, setTutorialCompleted] = useState(false);
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
  const stabilizationUsage = useMemo(
    () =>
      getStabilizationUsageState({
        usedToday: state.stabilizationUsesToday,
        resetDate: state.stabilizationResetDate,
        now: new Date(),
      }),
    [state.stabilizationUsesToday, state.stabilizationResetDate],
  );
  const stabilizationCost = eliteOverrideActive
    ? 0
    : DAILY_STABILIZATION_COST_PP;
  const recoveryButtonLabel = useMemo(() => {
    if (!state.redState) {
      return "RECOVER";
    }
    if (!stabilizationUsage.canUse) {
      return "RECOVERY LOCKED";
    }
    if (!eliteOverrideActive && state.pp < stabilizationCost) {
      return "INSUFFICIENT PP";
    }
    return `RECOVER (${stabilizationCost === 0 ? "FREE" : `${stabilizationCost} PP`})`;
  }, [
    state.redState,
    stabilizationUsage.canUse,
    eliteOverrideActive,
    state.pp,
    stabilizationCost,
  ]);
  const heroFloat = useRef(new Animated.Value(0)).current;
  const templatePulse = useRef(new Animated.Value(0)).current;
  const templateSweep = useRef(new Animated.Value(0)).current;
  const [protocolArchetype, setProtocolArchetype] = useState(() =>
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
  const planFeatures = useMemo(
    () => getPlanFeatures(effectivePlan),
    [effectivePlan],
  );
  const planStatusLabel = useMemo(() => {
    if (eliteOverrideActive) {
      return "PREMIUM // ELITE OVERRIDE";
    }
    if (basePlan !== "PREMIUM" && deviceTrialStatus.active) {
      return `PREMIUM // DEVICE TRIAL (${deviceTrialStatus.remainingDays}D LEFT)`;
    }
    return effectivePlan;
  }, [
    effectivePlan,
    basePlan,
    deviceTrialStatus.active,
    deviceTrialStatus.remainingDays,
    eliteOverrideActive,
  ]);

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
      if (persisted) {
        setLanguage(persisted.language || stored);
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

  const queueCount = useMemo(() => state.queue.length, [state.queue.length]);

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
        `> SYNC COMPLETE. +${totalPp} PP across ${prev.queue.length} entries.`,
        ...newlyUnlockedEpisodes.map(
          (episode) => `> NARRATIVE UNLOCKED: ${episode.title}`,
        ),
      ].slice(-14),
      overseerLines: [
        ...prev.overseerLines,
        "> CAPTAINS: QUEUE CLEARED. HOSTILE MODE RELEASED.",
        ...newlyUnlockedEpisodes.map(
          (episode) =>
            `> CAPTAINS: TRANSMISSION ${episode.episodeNumber} UNSEALED.`,
        ),
      ].slice(-8),
    }));

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
        active_pact_deadline:
          item.activePactDeadline || state.activePactDeadline,
        extensions_used: item.extensionsUsed ?? state.extensionsUsed,
      })),
    );
    setStatusMessage("QUEUE SYNCED");
  };

  const toggleRecording = async () => {
    if (!planFeatures.voiceCapture) {
      appendLine("> PREMIUM LOCK: VOICE CAPTURE UNAVAILABLE ON BASIC.");
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
        setDraft((current) =>
          current ? `${current}\n${transcript}` : transcript,
        );
        appendLine(
          "> VOICE TRANSCRIPT CAPTURED. REVIEW AND SUBMIT WITH CONTRACT.",
        );
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
    } catch (error) {
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
        prev.offline
          ? "> OFFLINE MODE DISENGAGED."
          : "> OFFLINE MODE ENGAGED. LOGS WILL QUEUE.",
      ].slice(-14),
      overseerLines: [
        ...prev.overseerLines,
        prev.offline
          ? "> CAPTAINS: LOCAL AUTONOMY DISABLED."
          : "> CAPTAINS: LOCAL AUTONOMY ENABLED.",
      ].slice(-8),
    }));
  };

  const toggleMonetization = async () => {
    try {
      await RevenueCatUI.presentPaywall();
    } catch (error) {
      console.error("Paywall Error:", error);
      setShowMonetization((previous) => !previous);
    }
  };

  const toggleOperatorManual = () => {
    setShowOperatorManual((previous) => !previous);
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

  const overclockMission = () => {
    if (!planFeatures.timeDilation) {
      appendLine("> PREMIUM LOCK: TIME DILATION UNAVAILABLE ON BASIC.");
      setStatusMessage(getFeatureLockMessage("timeDilation"));
      return;
    }

    if (!eliteOverrideActive && state.pp < 15) {
      appendLine("> INSUFFICIENT PP FOR TIME DILATION.");
      return;
    }

    setState((prev) => {
      const nextDeadline = new Date(
        Date.parse(prev.activePactDeadline) + 3600000,
      ).toISOString();
      const consequence = getConsequencePacket(
        "OVERCLOCKED",
        {
          pp: prev.pp,
          streak: prev.streak,
          redState: prev.redState,
          overclockCount: prev.extensionsUsed,
          protocolArchetypeName: prev.protocolArchetypeName,
          protocolStatusEffect: prev.protocolStatusEffect,
        },
        language,
      );
      setMissionCountdown(formatMissionCountdown(nextDeadline));
      return {
        ...prev,
        pp: eliteOverrideActive ? prev.pp : prev.pp - 15,
        activePactDeadline: nextDeadline,
        extensionsUsed: prev.extensionsUsed + 1,
        terminalLines: [
          ...prev.terminalLines,
          consequence.terminalLine,
          "> WINDOW EXTENDED BY +1:00:00.",
          "> COST: -15 PP.",
        ].slice(-14),
        overseerLines: [...prev.overseerLines, consequence.overseerLine].slice(
          -8,
        ),
      };
    });
    setStatusMessage("OVERCLOCKED");
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
      appendLine("> RECOVERY WINDOW LOCKED. DAILY RESET AT 00:00.");
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
      appendLine("> RECOVERY FAILED. CHECK AVAILABLE PP AND DAILY WINDOW.");
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
        `> COMMAND: RECOVER // COST ${stabilizationCost} PP // REMAINING ${recoveryOutcome.remaining}`,
      ].slice(-14),
      overseerLines: [
        ...prev.overseerLines,
        "> CAPTAINS: RECOVERY PROTOCOL ENGAGED. REDLINE TEMPORARILY STABLE.",
      ].slice(-8),
    }));
    setScreenJitter(false);
    setPulsePhase(0);
    appendLine(
      `> RECOVERY COMPLETE. ${recoveryOutcome.remaining} RECOVERY WINDOWS REMAINING TODAY.`,
    );
    setStatusMessage("RECOVERY COMPLETE");
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
    setStatusMessage(`LANGUAGE SET: ${nextLanguage.toUpperCase()}`);
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
    if (next >= TUTORIAL_STEPS.length) {
      setTutorialStep(null);
      setTutorialCompleted(true);
      void AsyncStorage.setItem("@peakpact/tutorial-done", "true");
    } else {
      const nextTab = TUTORIAL_STEPS[next]?.tab as AppTab | undefined;
      setTutorialStep(next);
      if (nextTab) handleTabPress(nextTab);
    }
  }, [tutorialStep, handleTabPress]);

  const handleTutorialPrev = useCallback(() => {
    if (!tutorialStep) return;
    const prev = tutorialStep - 1;
    const prevTab = TUTORIAL_STEPS[prev]?.tab as AppTab | undefined;
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

  const loadMissionIntoContract = () => {
    if (!planFeatures.missionAutoload) {
      appendLine("> PREMIUM LOCK: MISSION AUTOLOAD UNAVAILABLE ON BASIC.");
      setStatusMessage(getFeatureLockMessage("missionAutoload"));
      return;
    }

    setContractTask(state.missionContractTemplate);
    setContractDuration(String(state.missionTimeWindowMinutes));
    setContractStake(String(state.missionRecommendedStake));
    appendLine("> MISSION CONTRACT LOADED INTO PACT FRAME.");
    setStatusMessage("MISSION CONTRACT LOADED");
  };

  const loadSampleDraft = () => {
    const taskSummary = contractTask.trim() || state.missionContractTemplate;
    const durationSummary =
      contractDuration.trim() || String(state.missionTimeWindowMinutes);
    const stakeSummary =
      contractStake.trim() || String(state.missionRecommendedStake);
    const sample = `I completed ${taskSummary.toLowerCase()} in ${durationSummary} minutes with ${stakeSummary} PP at stake and measurable progress.`;
    setDraft(sample);
    appendLine("> SAMPLE DRAFT LOADED INTO THE PACT TERMINAL.");
    setStatusMessage("SAMPLE DRAFT LOADED");
  };

  const narrativeProgress = useMemo(
    () => getNarrativeProgress(state.level, language),
    [state.level, language],
  );
  const statusEffectTags = useMemo(
    () =>
      getStatusEffectTags(
        {
          pp: state.pp,
          streak: state.streak,
          redState: state.redState,
          overclockCount: state.extensionsUsed,
          protocolArchetypeName: state.protocolArchetypeName,
          protocolStatusEffect: state.protocolStatusEffect,
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
      language,
    ],
  );
  const missionGuidance = useMemo(
    () =>
      getMissionGuidance(
        {
          pp: state.pp,
          streak: state.streak,
          redState: state.redState,
          overclockCount: state.extensionsUsed,
          protocolArchetypeName: state.protocolArchetypeName,
          protocolStatusEffect: state.protocolStatusEffect,
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
      language,
    ],
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
  const operatorInsight = useMemo(
    () =>
      getOperatorInsight(
        {
          pp: state.pp,
          streak: state.streak,
          redState: state.redState,
          overclockCount: state.extensionsUsed,
          protocolArchetypeName: state.protocolArchetypeName,
          protocolStatusEffect: state.protocolStatusEffect,
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
      language,
    ],
  );
  const operatorManualEntries = useMemo(
    () => getOperatorManualEntries(language),
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
  const disciplineBanner = useMemo(
    () =>
      getDisciplineBanner(
        {
          pp: state.pp,
          streak: state.streak,
          redState: state.redState,
          overclockCount: state.extensionsUsed,
          protocolArchetypeName: state.protocolArchetypeName,
          protocolStatusEffect: state.protocolStatusEffect,
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
      language,
    ],
  );

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
          source={require("./assets/background.peakpact.png")}
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
            <Text style={styles.onboardingLabel}>[ GHOST IN THE MACHINE ]</Text>
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
                NEXT ACTION
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
        <ScanlineOverlay />
        {isWeb && (
          <View
            style={[styles.webGlobalHeader, { borderColor: `${accent}44` }]}
          >
            <Text style={[styles.webGlobalTitle, { color: PEAK_CRIMSON }]}>▲ CRIMSON LEDGER WEBSYSTEM</Text>
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
            <Text style={[styles.webGlobalAuth, { color: accent }]}>SYS_AUTH: OVERSEER UPLINK</Text>
          </View>
        )}
        <TabBar active={activeTab} onPress={handleTabPress} accent={accent} />
        <View style={isWeb ? styles.webColumnsRow : styles.mobileColumnWrapper}>
          {isWeb && (
            <ScrollView
              style={styles.webLeftCol}
              contentContainerStyle={styles.webColContent}
            >
              <View style={[styles.bentoWindow, { borderColor: accent }]}>...
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
            <View style={styles.appShell}>...
            </View>
          </ScrollView>
          {isWeb && (
            <ScrollView
              style={styles.webRightCol}
              contentContainerStyle={styles.webColContent}
            >
              <View style={[styles.bentoWindow, { borderColor: accent }]}>...</n              </View>
            </ScrollView>
          )}
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#000000",
  },
  keyboardShell: {
    flex: 1,
    backgroundColor: "#000000",
  },
  authBootShell: {
    flex: 1,
  },
  authBootOverlay: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(0, 0, 0, 0.74)",
    paddingHorizontal: 24,
  },
  authBootLabel: {
    color: MATRIX_GREEN,
    fontFamily: "monospace",
    fontSize: 12,
    letterSpacing: 3,
  },
  authBootTitle: {
    color: "#f5fff8",
    fontFamily: "monospace",
    fontSize: 24,
    fontWeight: "700",
    marginTop: 10,
  },
  container: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "#000000",
  },
  terminalBackdropVeil: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0, 4, 3, 0.82)",
  },
  screenJitter: {
    transform: [{ translateX: 0.6 }, { translateY: 0.4 }],
    opacity: 0.96,
  },
  holoLayer: {
    ...StyleSheet.absoluteFillObject,
    borderWidth: 1,
    borderColor: MATRIX_GREEN,
    pointerEvents: "none",
  },
  scanlineOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "transparent",
    borderWidth: 1,
    borderColor: MATRIX_GREEN,
    opacity: 0.08,
    pointerEvents: "none",
  },
  scanlineBar: {
    position: "absolute",
    left: 0,
    right: 0,
    height: 2,
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
    borderColor: "rgba(255,42,42,0.16)",
    backgroundColor: "rgba(6,2,2,0.95)",
    padding: 14,
    shadowColor: "#FF2A2A",
    shadowOpacity: 0.1,
    shadowRadius: 22,
    shadowOffset: { width: 0, height: 10 },
    elevation: 8,
  },
  // ... rest of styles truncated for brevity in this snapshot
});
