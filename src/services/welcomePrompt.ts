export type WelcomePromptHighlight = {
  title: string;
  body: string;
};

const welcomePromptHighlightsByLanguage: Record<string, WelcomePromptHighlight[]> = {
  en: [
    { title: 'WRITE THE CONTRACT', body: 'Define the mission, stake your PP, and prove the outcome.' },
    { title: 'AI VERIFICATION', body: 'The system checks the evidence and settles the ledger.' },
    { title: 'SQUAD ACCOUNTABILITY', body: 'Build crews that can see your live adherence and PP status.' },
    { title: 'SYSTEM GALLERY', body: 'Spend earned PP to unlock premium visual themes and audio.' },
    { title: 'OPERATOR PROFILE', body: 'Track your path, rewards, and discipline history in one place.' },
    { title: 'SYSTEM SETTINGS', body: 'Tune language, compliance, the operator manual, and system preferences.' },
  ],
  es: [
    { title: 'ESCRIBE EL CONTRATO', body: 'Define la misión, apuesta tu PP y demuestra el resultado.' },
    { title: 'VERIFICACIÓN POR IA', body: 'El sistema revisa la prueba y ajusta el registro.' },
    { title: 'RESPONSABILIDAD DE ESCUADRÓN', body: 'Forma equipos que vean tu adherencia y estado de PP en vivo.' },
    { title: 'GALERÍA DEL SISTEMA', body: 'Gasta los PP ganados para desbloquear temas visuales premium y audio.' },
    { title: 'PERFIL DEL OPERADOR', body: 'Sigue tu camino, recompensas e historial de disciplina en un solo lugar.' },
    { title: 'AJUSTES DEL SISTEMA', body: 'Ajusta idioma, cumplimiento, el manual del operador y preferencias del sistema.' },
  ],
  fr: [
    { title: 'RÉDIGER LE CONTRAT', body: 'Définis la mission, engage ton PP et prouve le résultat.' },
    { title: 'VÉRIFICATION IA', body: 'Le système vérifie la preuve et règle le registre.' },
    { title: 'RESPONSABILITÉ D’ÉQUIPE', body: 'Crée des groupes qui voient ton adhésion et ton statut PP en direct.' },
    { title: 'GALERIE DU SYSTÈME', body: 'Déploie les PP gagnés pour débloquer des thèmes visuels premium et des sons.' },
    { title: 'PROFIL D’OPÉRATEUR', body: 'Suit ton parcours, tes récompenses et ton historique de discipline.' },
    { title: 'PARAMÈTRES DU SYSTÈME', body: 'Ajuste la langue, la conformité, le manuel d’opérateur et les préférences système.' },
  ],
};

export function getWelcomePromptHighlights(language?: string): WelcomePromptHighlight[] {
  const code = (language ?? 'en').toLowerCase();
  const normalized = code.startsWith('es') ? 'es' : code.startsWith('fr') ? 'fr' : 'en';
  return welcomePromptHighlightsByLanguage[normalized] ?? welcomePromptHighlightsByLanguage.en;
}
