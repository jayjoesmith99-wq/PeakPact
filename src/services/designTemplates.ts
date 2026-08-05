export type DesignTemplateId =
  | 'core'
  | 'terminal-cyber-dungeon'
  | 'mecha-hud-pilot'
  | 'litrpg-stat-sheet'
  | 'apex-megacorp-os';

export type DesignTemplate = {
  id: DesignTemplateId;
  name: string;
  accent: string;
  accentSoft: string;
  background: string;
  card: string;
  costPP: number;
  description: string;
};

export type PurchaseDesignTemplateInput = {
  pp: number;
  ownedTemplateIds: DesignTemplateId[];
  selectedTemplateId: DesignTemplateId;
  templateId: DesignTemplateId;
};

export type PurchaseDesignTemplateResult = {
  ok: boolean;
  reason?: 'already_owned' | 'insufficient_pp' | 'not_found';
  nextPP: number;
  ownedTemplateIds: DesignTemplateId[];
  selectedTemplateId: DesignTemplateId;
};

const templates: DesignTemplate[] = [
  {
    id: 'core',
    name: 'BASE PROTOCOL',
    accent: '#FF2A2A',
    accentSoft: '#FF8B8B',
    background: '#000000',
    card: '#0D0000',
    costPP: 0,
    description: 'The Crimson Ledger — Peak Crimson on Vantablack. The original pact seal for discipline-first operators.',
  },
  {
    id: 'terminal-cyber-dungeon',
    name: 'TERMINAL // CYBER-DUNGEON',
    accent: '#2DFF76',
    accentSoft: '#B5FFCB',
    background: '#010505',
    card: '#07110d',
    costPP: 180,
    description: 'Green-on-black command shell with strict log frames, blinking cursor energy, and corporate dystopia terminal pressure.',
  },
  {
    id: 'mecha-hud-pilot',
    name: 'MECHA // HUD PILOT',
    accent: '#55E7FF',
    accentSoft: '#D8F8FF',
    background: '#020814',
    card: '#0A1A2D',
    costPP: 260,
    description: 'Cockpit-grade telemetry vibe with tactical cyan targeting energy and overclock-ready command instrumentation.',
  },
  {
    id: 'litrpg-stat-sheet',
    name: 'LITRPG // STAT SHEET',
    accent: '#D4B36A',
    accentSoft: '#F5EBD2',
    background: '#0C0D10',
    card: '#1A1C24',
    costPP: 260,
    description: 'Dark steel inventory aesthetic with character-sheet hierarchy, rarity-driven progression framing, and stat-board intensity.',
  },
  {
    id: 'apex-megacorp-os',
    name: 'APEX MEGACORP // EXECUTIVE OS',
    accent: '#C7D0D9',
    accentSoft: '#EFF3F7',
    background: '#090B0D',
    card: '#15191D',
    costPP: 320,
    description: 'Obsidian and titanium command center aesthetic with sterile luxury spacing for maximum rank-status presence.',
  },
];

export const getDesignTemplates = (): DesignTemplate[] => templates;

export const getDesignTemplateById = (id: DesignTemplateId | string): DesignTemplate | undefined => templates.find((template) => template.id === id);

export const canPurchaseDesignTemplate = ({ pp, templateId }: { pp: number; templateId: DesignTemplateId | string }) => {
  const template = getDesignTemplateById(templateId);
  if (!template) {
    return false;
  }

  return pp >= template.costPP;
};

export const purchaseDesignTemplate = ({ pp, ownedTemplateIds, selectedTemplateId, templateId }: PurchaseDesignTemplateInput): PurchaseDesignTemplateResult => {
  const template = getDesignTemplateById(templateId);
  if (!template) {
    return {
      ok: false,
      reason: 'not_found',
      nextPP: pp,
      ownedTemplateIds,
      selectedTemplateId,
    };
  }

  if (ownedTemplateIds.includes(template.id)) {
    return {
      ok: false,
      reason: 'already_owned',
      nextPP: pp,
      ownedTemplateIds,
      selectedTemplateId,
    };
  }

  if (pp < template.costPP) {
    return {
      ok: false,
      reason: 'insufficient_pp',
      nextPP: pp,
      ownedTemplateIds,
      selectedTemplateId,
    };
  }

  const nextOwned = [...ownedTemplateIds, template.id];
  return {
    ok: true,
    nextPP: pp - template.costPP,
    ownedTemplateIds: nextOwned,
    selectedTemplateId: template.id,
  };
};
