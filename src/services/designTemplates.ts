export type DesignTemplateId =
  | "terminal-cyber-dungeon"
  | "mecha-hud-pilot"
  | "litrpg-stat-sheet"
  | "apex-megacorp-os"
  | "core";

export function getDesignTemplateById(templateId: DesignTemplateId) {
  return getDesignTemplates().find((template) => template.id === templateId);
}

export function getDesignTemplates() {
  return [
    {
      id: "terminal-cyber-dungeon" as DesignTemplateId,
      name: "Terminal Cyber Dungeon",
      description: "A grungy green-on-black command shell.",
      costPP: 180,
      accent: "#00FF00",
      card: "#081212",
      background: "#040404",
    },
    {
      id: "mecha-hud-pilot" as DesignTemplateId,
      name: "Mecha HUD Pilot",
      description: "Angular HUD elements and neon highlights.",
      costPP: 220,
      accent: "#7FE7C9",
      card: "#061016",
      background: "#030406",
    },
    {
      id: "litrpg-stat-sheet" as DesignTemplateId,
      name: "LITRPG Stat Sheet",
      description: "Classic RPG status grid with digitized flourishes.",
      costPP: 260,
      accent: "#FFB000",
      card: "#08100E",
      background: "#020202",
    },
    {
      id: "apex-megacorp-os" as DesignTemplateId,
      name: "Apex Megacorp OS",
      description: "Minimal enterprise terminal aesthetics.",
      costPP: 320,
      accent: "#FF2A2A",
      card: "#101010",
      background: "#050505",
    },
    {
      id: "core" as DesignTemplateId,
      name: "Core",
      description: "Default system theme.",
      costPP: 0,
      accent: "#00FF00",
      card: "#081210",
      background: "#020202",
    },
  ];
}

export function purchaseDesignTemplate({
  pp,
  ownedTemplateIds,
  selectedTemplateId,
  templateId,
}: {
  pp: number;
  ownedTemplateIds: DesignTemplateId[];
  selectedTemplateId: DesignTemplateId;
  templateId: DesignTemplateId;
}) {
  const template = getDesignTemplateById(templateId);
  if (!template) {
    return { ok: false, reason: "unavailable", ownedTemplateIds, selectedTemplateId, nextPP: pp };
  }
  if (ownedTemplateIds.includes(templateId)) {
    return { ok: false, reason: "already_owned", ownedTemplateIds, selectedTemplateId, nextPP: pp };
  }
  if (pp < template.costPP) {
    return { ok: false, reason: "insufficient_pp", ownedTemplateIds, selectedTemplateId, nextPP: pp };
  }
  return {
    ok: true,
    reason: "purchased",
    ownedTemplateIds: [...ownedTemplateIds, templateId],
    selectedTemplateId: templateId,
    nextPP: pp - template.costPP,
  };
}
