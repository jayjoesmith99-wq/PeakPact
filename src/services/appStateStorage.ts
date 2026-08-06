<<<<<<< HEAD
import AsyncStorage from '@react-native-async-storage/async-storage';
import type { DesignTemplateId } from './designTemplates';
import type { SupportedLanguage } from './i18n';
import type { Squad } from './squadSystem';
=======
import AsyncStorage from "@react-native-async-storage/async-storage";
import { type Squad } from "./squadSystem";
import { type DesignTemplateId } from "./designTemplates";
import { type SupportedLanguage } from "./i18n";
>>>>>>> 2f1cd419750ef14ad65a62a00c79510454ca7b37

export type PersistedAppState = {
  onboardingSeen: boolean;
  language: SupportedLanguage;
  squads: Squad[];
  activeSquadId: string | null;
  ownedDesignTemplates: DesignTemplateId[];
  selectedDesignTemplateId: DesignTemplateId;
};

<<<<<<< HEAD
const STORAGE_KEY = '@peakpact/app-state';

type StorageLike = Pick<typeof AsyncStorage, 'getItem' | 'setItem' | 'removeItem'>;

export const savePersistedAppState = async (state: PersistedAppState, storage: StorageLike = AsyncStorage) => {
  await storage.setItem(STORAGE_KEY, JSON.stringify(state));
};

export const loadPersistedAppState = async (storage: StorageLike = AsyncStorage): Promise<PersistedAppState | null> => {
  const raw = await storage.getItem(STORAGE_KEY);
  if (!raw) {
    return null;
  }

  try {
    const parsed = JSON.parse(raw) as Partial<PersistedAppState>;
    return {
      onboardingSeen: Boolean(parsed.onboardingSeen),
      language: (parsed.language as SupportedLanguage | undefined) ?? 'en',
      squads: Array.isArray(parsed.squads) ? (parsed.squads as Squad[]) : [],
      activeSquadId: typeof parsed.activeSquadId === 'string' ? parsed.activeSquadId : null,
      ownedDesignTemplates: Array.isArray(parsed.ownedDesignTemplates) ? (parsed.ownedDesignTemplates as DesignTemplateId[]) : ['core'],
      selectedDesignTemplateId: (parsed.selectedDesignTemplateId as DesignTemplateId | undefined) ?? 'core',
    };
  } catch {
    return null;
  }
};

export const clearPersistedAppState = async (storage: StorageLike = AsyncStorage) => {
  await storage.removeItem(STORAGE_KEY);
};
=======
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
>>>>>>> 2f1cd419750ef14ad65a62a00c79510454ca7b37
