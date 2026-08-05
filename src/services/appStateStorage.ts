import AsyncStorage from '@react-native-async-storage/async-storage';
import type { DesignTemplateId } from './designTemplates';
import type { SupportedLanguage } from './i18n';
import type { Squad } from './squadSystem';

export type PersistedAppState = {
  onboardingSeen: boolean;
  language: SupportedLanguage;
  squads: Squad[];
  activeSquadId: string | null;
  ownedDesignTemplates: DesignTemplateId[];
  selectedDesignTemplateId: DesignTemplateId;
};

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
