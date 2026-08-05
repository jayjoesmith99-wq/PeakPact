import AsyncStorage from "@react-native-async-storage/async-storage";
import { type Squad } from "./squadSystem";
import { type DesignTemplateId } from "./designTemplates";
import { type SupportedLanguage } from "./i18n";

export type PersistedAppState = {
  onboardingSeen: boolean;
  language: SupportedLanguage;
  squads: Squad[];
  activeSquadId: string | null;
  ownedDesignTemplates: DesignTemplateId[];
  selectedDesignTemplateId: DesignTemplateId;
};

const DEFAULT_PERSISTED_STATE: PersistedAppState = {
  onboardingSeen: false,
  language: "en",
  squads: [],
  activeSquadId: null,
  ownedDesignTemplates: ["core"],
  selectedDesignTemplateId: "core",
};

export async function clearPersistedAppState() {
  await AsyncStorage.removeItem("@peakpact/persisted-state");
}

export async function loadPersistedAppState(): Promise<PersistedAppState | null> {
  try {
    const stored = await AsyncStorage.getItem("@peakpact/persisted-state");
    if (!stored) {
      return DEFAULT_PERSISTED_STATE;
    }
    const parsed = JSON.parse(stored);
    return {
      onboardingSeen:
        typeof parsed.onboardingSeen === "boolean"
          ? parsed.onboardingSeen
          : DEFAULT_PERSISTED_STATE.onboardingSeen,
      language:
        parsed.language === "ro" ? "ro" : DEFAULT_PERSISTED_STATE.language,
      squads: Array.isArray(parsed.squads) ? parsed.squads : DEFAULT_PERSISTED_STATE.squads,
      activeSquadId:
        parsed.activeSquadId === null || typeof parsed.activeSquadId === "string"
          ? parsed.activeSquadId
          : DEFAULT_PERSISTED_STATE.activeSquadId,
      ownedDesignTemplates: Array.isArray(parsed.ownedDesignTemplates)
        ? parsed.ownedDesignTemplates
        : DEFAULT_PERSISTED_STATE.ownedDesignTemplates,
      selectedDesignTemplateId:
        typeof parsed.selectedDesignTemplateId === "string"
          ? (parsed.selectedDesignTemplateId as DesignTemplateId)
          : DEFAULT_PERSISTED_STATE.selectedDesignTemplateId,
    };
  } catch {
    return DEFAULT_PERSISTED_STATE;
  }
}

export async function savePersistedAppState(state: PersistedAppState) {
  await AsyncStorage.setItem("@peakpact/persisted-state", JSON.stringify(state));
}
