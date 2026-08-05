export type SupportedLanguage = "en" | "ro";

export function getLocalizedText(key: string, language: SupportedLanguage) {
  const dictionary: Record<string, Record<SupportedLanguage, string>> = {
    submitPact: { en: "SUBMIT PACT", ro: "TRIMITE PACT" },
    manual: { en: "MANUAL", ro: "MANUAL" },
    syncQueue: { en: "SYNC QUEUE", ro: "SINCRONIZEAZA" },
    terminalUpgrades: { en: "TERMINAL UPGRADES", ro: "UPGRADARI TERMINAL" },
    loadSample: { en: "LOAD SAMPLE", ro: "INCARCA EXEMPLU" },
    lockTerminal: { en: "LOCK TERMINAL", ro: "BLOCHETI TERMINAL" },
    statusLabel: { en: "STATUS", ro: "STATUS" },
    languageLabel: { en: "LANGUAGE", ro: "LIMBA" },
    onboardingButton: { en: "BEGIN", ro: "INCEPE" },
    operatorInsight: { en: "OPERATOR INSIGHT", ro: "INFORMATII OPERATOR" },
    guidance: { en: "GUIDANCE", ro: "GHID" },
    howToUse: { en: "HOW TO USE", ro: "CUM SE FOLOSESTE" },
    commandAccess: { en: "COMMAND ACCESS", ro: "ACCES COMANDA" },
    sampleHint: { en: "Hint: describe your completed task clearly.", ro: "Indiciu: descrie sarcina finalizata clar." },
  };
  return dictionary[key]?.[language] ?? key;
}

export async function getStoredLanguage() {
  return "en" as SupportedLanguage;
}

export function getSupportedLanguages() {
  return [
    { code: "en" as SupportedLanguage, label: "EN" },
    { code: "ro" as SupportedLanguage, label: "RO" },
  ];
}

export async function setStoredLanguage(language: SupportedLanguage) {
  return;
}
