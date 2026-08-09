import i18n from "i18next";
import AsyncStorage from "@react-native-async-storage/async-storage";

const LANGUAGE_KEY = "@peakpact/stored-language";

export type SupportedLanguage = "en" | "es" | "fr" | "de" | "ja";

export function getSupportedLanguages() {
  return [
    { code: "en", label: "English" },
    { code: "es", label: "Español" },
    { code: "fr", label: "Français" },
    { code: "de", label: "Deutsch" },
    { code: "ja", label: "日本語" },
  ];
}

export async function initializeI18n(): Promise<void> {
  if (i18n.isInitialized) return;
  
  try {
    await i18n.init({
      compatibilityJSON: "v4",
      fallbackLng: "en",
      lng: "en",
      resources: {
        en: { 
          translation: {
            welcomeIntro: "System boot sequence initiated. Stand by.",
            tabPact: "PACT",
            tabSquad: "SQUAD",
            tabStore: "STORE",
            tabProfile: "PROFILE",
            tabSystem: "SYSTEM",
            introPactTitle: "MISSION COMMAND CENTER",
            introPactBody: "Define contracts, stake points, and execute high-leverage work blocks.",
            introSquadTitle: "SQUAD TELEMETRY",
            introSquadBody: "Coordinate with elite operator crews and track collective adherence.",
            introStoreTitle: "TERMINAL STORE",
            introStoreBody: "Upgrade visual themes, templates, and protocol privileges.",
            introProfileTitle: "OPERATOR DOSSIER",
            introProfileBody: "Review ascension progress, level stats, and narrative rewards.",
            introSystemTitle: "SYSTEM SETTINGS",
            introSystemBody: "Manage language preferences, security credentials, and sync queues.",
            macroFocusLabel: "DEEP WORK",
            macroFocusValue: "45m focused execution",
            macroRecoveryLabel: "RECOVERY",
            macroRecoveryValue: "30m stabilization sprint",
            macroExecuteLabel: "HEAVY LIFT",
            macroExecuteValue: "60m high-stakes output",
            macroResetLabel: "SYSTEM RESET",
            macroResetValue: "15m clarity block",
            tutorialStepLabel: "STEP",
            tutorialSkipLabel: "SKIP",
            tutorialBackLabel: "BACK",
            tutorialNextLabel: "NEXT",
            tutorialCompleteLabel: "FINISH",
            onboardingWelcomeLabel: "WELCOME OPERATOR",
            onboardingFirstStepLabel: "FIRST DIRECTIVE",
            onboardingButton: "INITIALIZE SYSTEM",
            proofPlaceholder: "Enter proof of completed contract execution...",
            buttonAbort: "ABORT MISSION",
            languageSaved: "LANGUAGE PREFERENCE SAVED"
          } 
        },
      },
      interpolation: { escapeValue: false },
    });
  } catch (e) {
    console.warn("i18n init warning:", e);
  }
}

export async function getStoredLanguage(): Promise<SupportedLanguage> {
  try {
    const stored = await AsyncStorage.getItem(LANGUAGE_KEY);
    if (stored && ["en", "es", "fr", "de", "ja"].includes(stored)) {
      return stored as SupportedLanguage;
    }
    return "en";
  } catch {
    return "en";
  }
}

export async function setStoredLanguage(lng: SupportedLanguage): Promise<void> {
  try {
    await AsyncStorage.setItem(LANGUAGE_KEY, lng);
    
    if (!i18n.isInitialized) {
      await initializeI18n();
    }

    if (i18n.language !== lng && typeof i18n.changeLanguage === "function") {
      await i18n.changeLanguage(lng);
    }
  } catch (error) {
    console.warn("Failed to set stored language:", error);
  }
}

export function getLocalizedText(key: string, lng?: SupportedLanguage): string {
  try {
    if (i18n.isInitialized && typeof i18n.t === "function") {
      return i18n.t(key, { lng: lng || i18n.language }) || key;
    }
    return key;
  } catch {
    return key;
  }
}