import { type SupportedLanguage } from './i18n';

export type MissionRisk = 'LOW' | 'MEDIUM' | 'HIGH';

export type MissionBriefing = {
  title: string;
  description: string;
  risk: MissionRisk;
  rewardBonus: number;
  timeWindowMinutes: number;
  contractTemplate: string;
  recommendedStake: number;
};

export type ConsequenceKind = 'TIMER_EXPIRED' | 'DAILY_SWEEP_WARNING' | 'DAILY_SWEEP_LOCK' | 'PACT_REJECTED' | 'OVERCLOCKED';

export type ConsequencePacket = {
  terminalLine: string;
  overseerLine: string;
  statusLine: string;
};

export type GlitchEvent = {
  title: string;
  description: string;
  severity: 'LOW' | 'MEDIUM' | 'HIGH';
  penaltyPP: number;
};

export type StatusEffectTag = {
  label: string;
  description: string;
};

export type OperatorManualEntry = {
  title: string;
  body: string;
};

export type ProgressionSkill = {
  title: string;
  value: string;
  description: string;
};

export type ProgressionSnapshot = {
  hallOfFame: Array<{ title: string; value: string; detail: string }>;
  towerFloors: Array<{ floor: number; label: string; unlocked: boolean; active: boolean }>;
  skills: ProgressionSkill[];
  nextLevelProgress: {
    current: number;
    next: number;
    percent: number;
  };
  ascension: {
    title: string;
    subtitle: string;
    rewardLabel: string;
  };
};

export type MissionGuidance = {
  title: string;
  body: string;
  nextAction: string;
};

export type HeroSummary = {
  title: string;
  subtitle: string;
  statusLabel: string;
  emphasis: string;
};

export type OperatorInsight = {
  title: string;
  body: string;
};

export type HowToUseStep = {
  title: string;
  body: string;
};

export type DailyLoopGuide = {
  title: string;
  body: string;
  nextAction: string;
  steps: HowToUseStep[];
};

export type FirstSessionGuide = {
  title: string;
  body: string;
  steps: HowToUseStep[];
  primaryAction: string;
};

const translations: Record<string, any> = {
  en: {
    howToUseSteps: [
      { title: '1. Log your pact', body: 'Describe what you completed, then submit the pact to earn PP and build your streak.' },
      { title: '2. Read the mission state', body: 'Use the mission banner and guidance panel to understand the current pressure, risk, and next move.' },
      { title: '3. Climb the tower', body: 'Every clean contract strengthens your rank, unlocks better progression, and keeps you moving upward.' },
      { title: '4. Recover or overclock carefully', body: 'Use recovery tools when pressure is high, and overclock only when the reward is worth the risk.' },
    ],
    firstSessionTitle: 'FIRST CONTACT',
    firstSessionBody: 'Your first mission is simple: log a clear pact, read the guidance, and let the tower respond.',
    firstSessionStepOneTitle: '1. Write your pact',
    firstSessionStepOneBody: 'Describe the completed task in plain language so the system can verify it.',
    firstSessionStepTwoTitle: '2. Review the guidance',
    firstSessionStepTwoBody: 'Use the mission state to see risk, pressure, and your next move.',
    firstSessionStepThreeTitle: '3. Claim your reward',
    firstSessionStepThreeBody: 'Submit the pact to earn PP and advance your operator profile.',
    firstSessionPrimaryAction: 'SUBMIT YOUR FIRST PACT',
    dailyLoopTitle: 'DAILY LOOP',
    dailyLoopBody: 'One clear mission, one clear action, one clear reward.',
    dailyLoopNextAction: 'Submit a pact to earn PP and advance your rank.',
    dailyLoopStepOneTitle: '1. Start with a clear pact',
    dailyLoopStepOneBody: 'Write what you completed in simple language.',
    dailyLoopStepTwoTitle: '2. Read the guidance',
    dailyLoopStepTwoBody: 'Check the mission state before you push further.',
    dailyLoopStepThreeTitle: '3. Claim the reward',
    dailyLoopStepThreeBody: 'Turn progress into PP, streak, and movement up the tower.',
    highRiskRedlineTitle: 'RISK NODE / REDLINE RECOVERY',
    highRiskCriticalTitle: 'RISK NODE / CRITICAL TARGET',
    getHighRiskDescription: (archetype: string, statusEffect: string) => `The overseer is pushing ${archetype} into a volatile window with ${statusEffect} pressure. Failure will escalate consequences immediately.`,
    overflowTitle: 'STABILITY NODE / REWARD SURGE',
    overflowDescription: 'The terminal detects a reward surge and proposes an optimized mission for sustained focus and clean progression.',
    baselineTitle: 'BASELINE NODE / STEADY OPERATION',
    baselineDescription: 'A clean mission designed to deepen the current contract without pushing the system too hard while preserving streak stability.',
    timerExpiredTerminal: '> DEADLINE EXPIRED. PENALTY EXECUTED. CONTRACT WINDOW CLOSED.',
    timerExpiredOverseer: '> CAPTAINS: MISSION FAILURE CONFIRMED. RED-STATE LOCK.',
    timerExpiredStatus: 'CONSEQUENCE APPLIED',
    dailySweepLockTerminal: '> DAILY SWEEP COMPLETE. MISSED WINDOWS DETECTED. RED-STATE ENGAGED.',
    dailySweepLockOverseer: '> CAPTAINS: DISCIPLINE DECAY CONFIRMED. HOSTILE MODE AUTHORIZED.',
    dailySweepLockStatus: 'RED-STATE ENGAGED',
    dailySweepWarningTerminal: '> DAILY SWEEP COMPLETE. WARNING ISSUED. NEXT FAILURE WILL ESCALATE.',
    dailySweepWarningOverseer: '> CAPTAINS: WARNING ONLY. CONDUCT UNDER REVIEW.',
    dailySweepWarningStatus: 'WARNING ISSUED',
    pactRejectedTerminal: '> CONTRACT BREACH LOGGED. NO CREDIT ISSUED.',
    pactRejectedTerminalFracture: '> CONTRACT BREACH LOGGED. FRACTURE STATE INTENSIFIED.',
    pactRejectedOverseer: '> CAPTAINS: SUBMISSION REJECTED. DISCIPLINE REVIEW FILED.',
    pactRejectedStatus: 'PACT REJECTED',
    overclockTerminal: '> TIME DILATION PROTOCOL ENGAGED. SYSTEM STRAIN ACCEPTED.',
    overclockOverseer: '> CAPTAINS: OVERCLOCK WINDOW EXTENDED. RISK PROFILE ELEVATED.',
    overclockStatus: 'OVERCLOCKED',
    defaultTerminal: '> SYSTEM NOTICE LOGGED.',
    defaultOverseer: '> CAPTAINS: STATE CHANGE LOGGED.',
    defaultStatus: 'STATE UPDATED',
    glitchRedlineTitle: 'REDLINE GLITCH',
    glitchRedlineDescription: 'The terminal flickers and momentarily distorts the mission log.',
    glitchClockTitle: 'CLOCK DRIFT',
    glitchClockDescription: 'The countdown drifts out of sync for a moment, introducing a small hazard.',
    bannerRedline: 'ZERO TOLERANCE. RED ALERT ACTIVE.',
    bannerOverclock: 'ANTI-CHEAT PROTOCOL ACTIVE. WINDOW DRIFT DETECTED.',
    bannerBaseline: 'CONTRACTS ONLY. NO EMPTY MOTIVATION.',
    tagRedlineLabel: 'REDLINE',
    tagRedlineDescription: 'System integrity is collapsing under pressure.',
    tagDriftLabel: 'DRIFT',
    tagDriftDescription: 'Attention is slipping. Recovery becomes harder.',
    tagFractureLabel: 'FRACTURE',
    tagFractureDescription: 'Discipline is unstable. Every failure becomes more costly.',
    tagOverclockLabel: 'OVERCLOCK',
    tagOverclockDescription: 'The terminal is straining under borrowed time.',
    tagStrainLabel: 'STRAIN',
    tagStrainDescription: 'Repeated overclock usage is increasing risk.',
    hallOfFamePeakStreakTitle: 'PEAK STREAK',
    hallOfFamePeakStreakDetail: 'Consistency score',
    hallOfFameCurrentFloorTitle: 'CURRENT FLOOR',
    hallOfFameCurrentFloorDetail: 'Progression tier',
    hallOfFameSystemPressureTitle: 'SYSTEM PRESSURE',
    hallOfFameSystemPressureDetail: 'Current stability',
    hallOfFameRankTitle: 'RANK',
    hallOfFameRankDetail: 'Current standing',
    towerFloorLabelTop: 'TOP',
    towerFloorLabelPrefix: 'F',
    skillDisciplineTitle: 'DISCIPLINE',
    skillDisciplineDescription: 'Execution quality under pressure.',
    skillRecoveryTitle: 'RECOVERY',
    skillRecoveryDescription: 'Ability to recover after strain.',
    skillMomentumTitle: 'MOMENTUM',
    skillMomentumDescription: 'Speed and tempo under stress.',
    skillIntegrityTitle: 'INTEGRITY',
    skillIntegrityDescription: 'Resistance to system decay.',
    ascensionRedlineTitle: 'REDLINE ASCENSION',
    ascensionRedlineSubtitle: 'The tower is testing your discipline. Recover quickly and hold the line.',
    ascensionRedlineRewardLabel: 'Recovery access / lower strain',
    ascensionTowerTitle: 'TOWER ASCENDER',
    ascensionTowerSubtitle: 'The upper galleries are opening. Every clean contract sharpens your rank.',
    ascensionTowerRewardLabel: 'New floor access / stronger rewards',
    ascensionBaselineTitle: 'ASCENSION PATH',
    ascensionBaselineSubtitle: 'Every contract advances the climb. Stay consistent and the tower will answer.',
    ascensionBaselineRewardLabel: 'Progression momentum',
    heroRecoveryTitle: 'RECOVERY PROTOCOL',
    heroRecoverySubtitle: 'The tower is under strain. Secure a compact win and stabilize the climb.',
    heroRecoveryStatus: 'CRITICAL',
    heroRecoveryEmphasis: 'Protect your streak before pushing further.',
    heroDisciplineTitle: 'DISCIPLINE RESET',
    getHeroDisciplineSubtitle: (missionTitle: string) => `The current node asks for control over intensity. ${missionTitle} is your best next move.`,
    heroDisciplineStatus: 'ADJUST',
    heroDisciplineEmphasis: 'Choose clarity over pressure.',
    heroClockTitle: 'CLOCK CONTROL',
    heroClockSubtitle: 'Momentum is real, but precision matters more than speed right now.',
    heroClockStatus: 'FOCUSED',
    getHeroClockEmphasis: (missionRisk: string) => `Risk level ${missionRisk.toLowerCase()} • keep the next action deliberate.`,
    heroSteadyTitle: 'ASCENT READY',
    heroSteadySubtitle: 'Your operator node is stable. Use this window to strengthen the tower with one clean pact.',
    heroSteadyStatus: 'STEADY',
    getHeroSteadyEmphasis: (missionRisk: string) => `Mission ready • ${missionRisk.toLowerCase()} pressure`,
    insightRecoveryTitle: 'RECOVERY PRIORITY',
    insightRecoveryBody: 'The system is under pressure. Choose one compact contract and protect the next streak window.',
    insightFractureTitle: 'STABILITY ALERT',
    insightFractureBody: 'Discipline is shaky. Favor a clean win over a flashy move.',
    insightOverclockTitle: 'CLOCK PRESSURE',
    insightOverclockBody: 'The terminal is running hot. Keep the next action deliberate and avoid unnecessary risk.',
    insightSteadyTitle: 'OPERATOR FLOW',
    insightSteadyBody: 'The climb is steady. Keep the cadence strong and let consistency carry the tower.',
    missionCriticalTitle: 'CRITICAL RECOVERY',
    missionCriticalBody: 'The node is under pressure. Secure one short, verified contract and avoid unnecessary strain.',
    missionCriticalNextAction: 'Complete a compact pact, then recover before taking another risk.',
    missionFractureTitle: 'FRACTURE RESET',
    missionFractureBody: 'Discipline is unstable. Favor one clean win over a large gamble.',
    missionFractureNextAction: 'Finish a focused task, then let the system settle before overclocking.',
    missionOverclockTitle: 'CLOCK DRIFT',
    missionOverclockBody: 'The terminal is straining under the current pressure. Keep the next move deliberate.',
    missionOverclockNextAction: 'Use the next pact to stabilize momentum rather than chase extra reward.',
    missionStrainTitle: 'STRAIN AWARENESS',
    missionStrainBody: 'Repeated overclock use is increasing risk. Protect the streak with measured execution.',
    missionStrainNextAction: 'Take one disciplined turn and let the timer breathe.',
    missionSteadyTitle: 'STEADY ACCELERATION',
    missionSteadyBody: 'The system is running smoothly. Keep the cadence without inflating the mission window.',
    missionSteadyNextAction: 'Push one clear contract and preserve your streak.',
    missionBaselineTitle: 'BASELINE RHYTHM',
    missionBaselineBody: 'The terminal is stable. Use this window to build consistency rather than chase volatility.',
    missionBaselineNextAction: 'Log a focused contract and let the system reward clean execution.',
    manualPpTitle: 'PP ECONOMY',
    manualPpBody: 'PP is your survival currency. Earn it through verified contracts and spend it carefully when the system demands a premium action.',
    manualFractureTitle: 'FRACTURE',
    manualFractureBody: 'A fracture state appears when discipline collapses. Recovery takes longer and the terminal becomes harsher.',
    manualOverclockTitle: 'OVERCLOCK',
    manualOverclockBody: 'Overclock buys time at a cost. It extends the mission deadline, but every use increases system strain.',
  },
  es: {
    howToUseSteps: [
      { title: '1. Registra tu pacto', body: 'Describe qué completaste y luego envía el pacto para ganar PP y fortalecer tu racha.' },
      { title: '2. Lee el estado de la misión', body: 'Usa el banner de la misión y el panel de orientación para entender la presión, el riesgo y el siguiente movimiento.' },
      { title: '3. Sube la torre', body: 'Cada contrato limpio fortalece tu rango, desbloquea mejor progresión y te mantiene en ascenso.' },
      { title: '4. Recupera u overclock con cuidado', body: 'Usa herramientas de recuperación cuando la presión sea alta y overclock solo si la recompensa merece el riesgo.' },
    ],
    firstSessionTitle: 'PRIMER CONTACTO',
    firstSessionBody: 'Tu primera misión es simple: registra un pacto claro, lee la guía y deja que la torre responda.',
    firstSessionStepOneTitle: '1. Escribe tu pacto',
    firstSessionStepOneBody: 'Describe la tarea completada en lenguaje simple para que el sistema pueda verificarla.',
    firstSessionStepTwoTitle: '2. Revisa la guía',
    firstSessionStepTwoBody: 'Usa el estado de la misión para ver el riesgo, la presión y el siguiente movimiento.',
    firstSessionStepThreeTitle: '3. Reclama tu recompensa',
    firstSessionStepThreeBody: 'Envía el pacto para ganar PP y avanzar en tu perfil de operador.',
    firstSessionPrimaryAction: 'ENVÍA TU PRIMER PACTO',
    dailyLoopTitle: 'CICLO DIARIO',
    dailyLoopBody: 'Una misión clara, una acción clara y una recompensa clara.',
    dailyLoopNextAction: 'Envía un pacto para ganar PP y avanzar en tu rango.',
    dailyLoopStepOneTitle: '1. Empieza con un pacto claro',
    dailyLoopStepOneBody: 'Escribe lo que completaste en un lenguaje simple.',
    dailyLoopStepTwoTitle: '2. Lee la guía',
    dailyLoopStepTwoBody: 'Revisa el estado de la misión antes de seguir.',
    dailyLoopStepThreeTitle: '3. Reclama la recompensa',
    dailyLoopStepThreeBody: 'Convierte el progreso en PP, racha y subida en la torre.',
    highRiskRedlineTitle: 'NODO DE RIESGO / RECUPERACIÓN DE LÍNEA ROJA',
    highRiskCriticalTitle: 'NODO DE RIESGO / OBJETIVO CRÍTICO',
    getHighRiskDescription: (archetype: string, statusEffect: string) => `El supervisor está empujando a ${archetype} hacia una ventana volátil con presión de ${statusEffect}. El fallo escalará las consecuencias de inmediato.`,
    overflowTitle: 'NODO DE ESTABILIDAD / AUMENTO DE RECOMPENSAS',
    overflowDescription: 'El terminal detecta un aumento de recompensas y propone una misión optimizada para mantener el enfoque y una progresión limpia.',
    baselineTitle: 'NODO BASE / OPERACIÓN CONSTANTE',
    baselineDescription: 'Una misión limpia diseñada para profundizar en el contrato actual sin empujar el sistema demasiado, preservando la estabilidad de la racha.',
    timerExpiredTerminal: '> PLAZO VENCIDO. PENALIZACIÓN EJECUTADA. VENTANA DEL CONTRATO CERRADA.',
    timerExpiredOverseer: '> CAPITANES: FALLA DE MISIÓN CONFIRMADA. BLOQUEO DE REDSTATE.',
    timerExpiredStatus: 'CONSECUENCIA APLICADA',
    dailySweepLockTerminal: '> REVISIÓN DIARIA COMPLETA. VENTANAS PERDIDAS DETECTADAS. REDSTATE ACTIVADO.',
    dailySweepLockOverseer: '> CAPITANES: DECAY DE DISCIPLINA CONFIRMADO. MODO HOSTIL AUTORIZADO.',
    dailySweepLockStatus: 'REDSTATE ACTIVADO',
    dailySweepWarningTerminal: '> REVISIÓN DIARIA COMPLETA. ADVERTENCIA EMITIDA. EL PRÓXIMO FALLO ESCALARÁ.',
    dailySweepWarningOverseer: '> CAPITANES: SOLO ADVERTENCIA. CONDUCTA BAJO REVISIÓN.',
    dailySweepWarningStatus: 'ADVERTENCIA EMITIDA',
    pactRejectedTerminal: '> REGISTRO DE INFRACCIÓN DE CONTRATO. SIN CRÉDITO OTORGADO.',
    pactRejectedTerminalFracture: '> REGISTRO DE INFRACCIÓN DE CONTRATO. ESTADO DE FRACTURA INTENSIFICADO.',
    pactRejectedOverseer: '> CAPITANES: ENVÍO RECHAZADO. EXPEDIENTE DE REVISIÓN DE DISCIPLINA.',
    pactRejectedStatus: 'PACTO RECHAZADO',
    overclockTerminal: '> PROTOCOLO DE DILATACIÓN TEMPORAL ACTIVADO. ESFUERZO DEL SISTEMA ACEPTADO.',
    overclockOverseer: '> CAPITANES: VENTANA DE OVERCLOCK EXTENDIDA. PERFIL DE RIESGO ELEVADO.',
    overclockStatus: 'OVERCLOCK',
    defaultTerminal: '> AVISO DEL SISTEMA REGISTRADO.',
    defaultOverseer: '> CAPITANES: CAMBIO DE ESTADO REGISTRADO.',
    defaultStatus: 'ESTADO ACTUALIZADO',
    glitchRedlineTitle: 'FALLA DE LÍNEA ROJA',
    glitchRedlineDescription: 'El terminal parpadea y distorsiona momentáneamente el registro de la misión.',
    glitchClockTitle: 'DESVÍO DEL RELOJ',
    glitchClockDescription: 'La cuenta atrás se desincrona durante un momento, introduciendo un pequeño peligro.',
    bannerRedline: 'TOLERANCIA CERO. ALERTA ROJA ACTIVA.',
    bannerOverclock: 'PROTOCOLO ANTICHEAT ACTIVO. DESVÍO DE VENTANA DETECTADO.',
    bannerBaseline: 'SOLO CONTRATOS. SIN MOTIVACIÓN VACÍA.',
    tagRedlineLabel: 'LÍNEA ROJA',
    tagRedlineDescription: 'La integridad del sistema se está desplomando bajo presión.',
    tagDriftLabel: 'DERIVA',
    tagDriftDescription: 'La atención se está fugando. La recuperación se vuelve más difícil.',
    tagFractureLabel: 'FRACTURA',
    tagFractureDescription: 'La disciplina es inestable. Cada fallo se vuelve más costoso.',
    tagOverclockLabel: 'OVERCLOCK',
    tagOverclockDescription: 'El terminal está sometido a tensión bajo un tiempo prestado.',
    tagStrainLabel: 'TENSIÓN',
    tagStrainDescription: 'El uso repetido de overclock está aumentando el riesgo.',
    hallOfFamePeakStreakTitle: 'RACHA MÁXIMA',
    hallOfFamePeakStreakDetail: 'Puntuación de consistencia',
    hallOfFameCurrentFloorTitle: 'PISO ACTUAL',
    hallOfFameCurrentFloorDetail: 'Nivel de progresión',
    hallOfFameSystemPressureTitle: 'PRESIÓN DEL SISTEMA',
    hallOfFameSystemPressureDetail: 'Estabilidad actual',
    hallOfFameRankTitle: 'RANGO',
    hallOfFameRankDetail: 'Posición actual',
    towerFloorLabelTop: 'ARRIBA',
    towerFloorLabelPrefix: 'P',
    skillDisciplineTitle: 'DISCIPLINA',
    skillDisciplineDescription: 'Calidad de ejecución bajo presión.',
    skillRecoveryTitle: 'RECUPERACIÓN',
    skillRecoveryDescription: 'Capacidad de recuperarse tras la tensión.',
    skillMomentumTitle: 'IMPULSO',
    skillMomentumDescription: 'Velocidad y ritmo bajo estrés.',
    skillIntegrityTitle: 'INTEGRIDAD',
    skillIntegrityDescription: 'Resistencia a la decadencia del sistema.',
    ascensionRedlineTitle: 'ASCENSIÓN DE LÍNEA ROJA',
    ascensionRedlineSubtitle: 'La torre está probando tu disciplina. Recupera rápido y mantén la línea.',
    ascensionRedlineRewardLabel: 'Acceso a recuperación / menos tensión',
    ascensionTowerTitle: 'ASCENSOR DE TORRE',
    ascensionTowerSubtitle: 'Las galerías superiores se están abriendo. Cada contrato limpio afina tu rango.',
    ascensionTowerRewardLabel: 'Acceso a nuevos pisos / recompensas más fuertes',
    ascensionBaselineTitle: 'RUTA DE ASCENSIÓN',
    ascensionBaselineSubtitle: 'Cada contrato impulsa el ascenso. Mantente constante y la torre responderá.',
    ascensionBaselineRewardLabel: 'Impulso de progresión',
    heroRecoveryTitle: 'PROTOCOLO DE RECUPERACIÓN',
    heroRecoverySubtitle: 'La torre está bajo tensión. Consigue una victoria compacta y estabiliza el ascenso.',
    heroRecoveryStatus: 'CRÍTICO',
    heroRecoveryEmphasis: 'Protege tu racha antes de empujar más.',
    heroDisciplineTitle: 'REINICIO DE DISCIPLINA',
    getHeroDisciplineSubtitle: (missionTitle: string) => `El nodo actual pide control sobre la intensidad. ${missionTitle} es tu mejor próximo movimiento.`,
    heroDisciplineStatus: 'AJUSTAR',
    heroDisciplineEmphasis: 'Elige la claridad sobre la presión.',
    heroClockTitle: 'CONTROL DEL RELOJ',
    heroClockSubtitle: 'El impulso es real, pero la precisión importa más que la velocidad ahora mismo.',
    heroClockStatus: 'ENFOCADO',
    getHeroClockEmphasis: (missionRisk: string) => `Nivel de riesgo ${missionRisk.toLowerCase()} • mantén la próxima acción deliberada.`,
    heroSteadyTitle: 'LISTO PARA ASCENDER',
    heroSteadySubtitle: 'Tu nodo de operador está estable. Usa esta ventana para fortalecer la torre con un pacto limpio.',
    heroSteadyStatus: 'ESTABLE',
    getHeroSteadyEmphasis: (missionRisk: string) => `Misión lista • presión ${missionRisk.toLowerCase()}`,
    insightRecoveryTitle: 'PRIORIDAD DE RECUPERACIÓN',
    insightRecoveryBody: 'El sistema está bajo presión. Elige un contrato compacto y protege la siguiente ventana de racha.',
    insightFractureTitle: 'ALERTA DE ESTABILIDAD',
    insightFractureBody: 'La disciplina está inestable. Prefiere una victoria limpia a un movimiento llamativo.',
    insightOverclockTitle: 'PRESIÓN DEL RELOJ',
    insightOverclockBody: 'El terminal está muy caliente. Mantén la siguiente acción deliberada y evita riesgos innecesarios.',
    insightSteadyTitle: 'FLUJO DE OPERADOR',
    insightSteadyBody: 'El ascenso es estable. Mantén el ritmo fuerte y deja que la consistencia sostenga la torre.',
    missionCriticalTitle: 'RECUPERACIÓN CRÍTICA',
    missionCriticalBody: 'El nodo está bajo presión. Consigue un contrato corto y verificado y evita tensión innecesaria.',
    missionCriticalNextAction: 'Completa un pacto compacto y luego recupera antes de asumir otro riesgo.',
    missionFractureTitle: 'REINICIO DE FRACTURA',
    missionFractureBody: 'La disciplina es inestable. Prefiere una victoria limpia a una gran apuesta.',
    missionFractureNextAction: 'Completa una tarea enfocada y deja que el sistema se estabilice antes de overclockear.',
    missionOverclockTitle: 'DESVÍO DEL RELOJ',
    missionOverclockBody: 'El terminal está sometido a tensión bajo la presión actual. Mantén el próximo movimiento deliberado.',
    missionOverclockNextAction: 'Usa el siguiente pacto para estabilizar el impulso en lugar de perseguir una recompensa extra.',
    missionStrainTitle: 'CONCIENCIA DE TENSIÓN',
    missionStrainBody: 'El uso repetido de overclock está aumentando el riesgo. Protege la racha con una ejecución mesurada.',
    missionStrainNextAction: 'Haz un turno disciplinado y deja que el temporizador respire.',
    missionSteadyTitle: 'ACELERACIÓN CONSTANTE',
    missionSteadyBody: 'El sistema funciona sin problemas. Mantén el ritmo sin inflar la ventana de la misión.',
    missionSteadyNextAction: 'Impulsa un contrato claro y preserva tu racha.',
    missionBaselineTitle: 'RITMO BASE',
    missionBaselineBody: 'El terminal está estable. Usa esta ventana para construir consistencia en lugar de perseguir la volatilidad.',
    missionBaselineNextAction: 'Registra un contrato enfocado y deja que el sistema recompense la ejecución limpia.',
    manualPpTitle: 'ECONOMÍA DE PP',
    manualPpBody: 'Los PP son tu moneda de supervivencia. Gánalos con contratos verificados y gástalos con cuidado cuando el sistema exija una acción premium.',
    manualFractureTitle: 'FRACTURA',
    manualFractureBody: 'Un estado de fractura aparece cuando la disciplina colapsa. La recuperación tarda más y el terminal se vuelve más duro.',
    manualOverclockTitle: 'OVERCLOCK',
    manualOverclockBody: 'Overclock compra tiempo a un coste. Amplía el plazo de la misión, pero cada uso aumenta la tensión del sistema.',
  },
  fr: {
    howToUseSteps: [
      { title: '1. Enregistrez votre pacte', body: 'Décrivez ce que vous avez accompli, puis soumettez le pacte pour gagner des PP et construire votre série.' },
      { title: '2. Lisez l’état de la mission', body: 'Utilisez la bannière de mission et le panneau d’orientation pour comprendre la pression, le risque et le prochain mouvement.' },
      { title: '3. Grimpez la tour', body: 'Chaque contrat propre renforce votre rang, débloque une meilleure progression et vous fait avancer.' },
      { title: '4. Récupérez ou surclockez prudemment', body: 'Utilisez les outils de récupération lorsque la pression est forte et surclockez seulement si la récompense vaut le risque.' },
    ],
    highRiskRedlineTitle: 'NŒUD DE RISQUE / RÉCUPÉRATION DE LA LIGNE ROUGE',
    highRiskCriticalTitle: 'NŒUD DE RISQUE / CIBLE CRITIQUE',
    getHighRiskDescription: (archetype: string, statusEffect: string) => `L’overseer pousse ${archetype} vers une fenêtre volatile avec une pression de ${statusEffect}. L’échec escaladera immédiatement les conséquences.`,
    overflowTitle: 'NŒUD DE STABILITÉ / SURGE DE RÉCOMPENSE',
    overflowDescription: 'Le terminal détecte une hausse de récompenses et propose une mission optimisée pour un focus soutenu et une progression propre.',
    baselineTitle: 'NŒUD DE BASE / OPÉRATION STABLE',
    baselineDescription: 'Une mission propre conçue pour approfondir le contrat actuel sans pousser le système trop fort tout en préservant la stabilité de la série.',
    timerExpiredTerminal: '> DÉLAI ÉCHU. PÉNALITÉ EXÉCUTÉE. FENÊTRE DE CONTRAT FERMÉE.',
    timerExpiredOverseer: '> CAPITAINES : ÉCHEC DE MISSION CONFIRMÉ. VERROUILLAGE RED-STATE.',
    timerExpiredStatus: 'CONSÉQUENCE APPLIQUÉE',
    dailySweepLockTerminal: '> BALAYAGE QUOTIDIEN TERMINÉ. FENÊTRES MANQUÉES DÉTECTÉES. RED-STATE ENGAGÉ.',
    dailySweepLockOverseer: '> CAPITAINES : DÉCROISSANCE DE LA DISCIPLINE CONFIRMÉE. MODE HOSTILE AUTORISÉ.',
    dailySweepLockStatus: 'RED-STATE ENGAGÉ',
    dailySweepWarningTerminal: '> BALAYAGE QUOTIDIEN TERMINÉ. AVERTISSEMENT ÉMIS. LA PROCHAINE ÉCHEC ESCALADERA.',
    dailySweepWarningOverseer: '> CAPITAINES : AVERTISSEMENT UNIQUE. CONDUITE SOUS EXAMEN.',
    dailySweepWarningStatus: 'AVERTISSEMENT ÉMIS',
    pactRejectedTerminal: '> VIOLATION DE CONTRAT ENREGISTRÉE. AUCUN CRÉDIT ATTRIBUÉ.',
    pactRejectedTerminalFracture: '> VIOLATION DE CONTRAT ENREGISTRÉE. ÉTAT DE FRACTURE INTENSIFIÉ.',
    pactRejectedOverseer: '> CAPITAINES : SOUMISSION REJETÉE. DOSSIER DE RÉVISION DE DISCIPLINE.',
    pactRejectedStatus: 'PACTE REJETÉ',
    overclockTerminal: '> PROTOCOLE DE DILATATION TEMPOREL ENGAGÉ. CONTRAINTE SYSTÈME ACCEPTÉE.',
    overclockOverseer: '> CAPITAINES : FENÊTRE OVERCLOCK ÉTENDUE. PROFIL DE RISQUE ÉLEVÉ.',
    overclockStatus: 'OVERCLOCK',
    defaultTerminal: '> AVIS SYSTÈME ENREGISTRÉ.',
    defaultOverseer: '> CAPITAINES : CHANGEMENT D’ÉTAT ENREGISTRÉ.',
    defaultStatus: 'ÉTAT MIS À JOUR',
    glitchRedlineTitle: 'GLITCH DE LIGNE ROUGE',
    glitchRedlineDescription: 'Le terminal clignote et déforme momentanément le journal de mission.',
    glitchClockTitle: 'DÉRIVE D’HORLOGE',
    glitchClockDescription: 'Le compte à rebours se décale un instant, introduisant un petit danger.',
    bannerRedline: 'ZÉRO TOLÉRANCE. ALERTE ROUGE ACTIVE.',
    bannerOverclock: 'PROTOCOLE ANTICHEAT ACTIF. DÉRIVE DE FENÊTRE DÉTECTÉE.',
    bannerBaseline: 'UNIQUEMENT DES CONTRATS. AUCUNE MOTIVATION VIDE.',
    tagRedlineLabel: 'LIGNE ROUGE',
    tagRedlineDescription: 'L’intégrité du système s’effondre sous la pression.',
    tagDriftLabel: 'DÉRIVE',
    tagDriftDescription: 'L’attention commence à s’échapper. La récupération devient plus difficile.',
    tagFractureLabel: 'FRACTURE',
    tagFractureDescription: 'La discipline est instable. Chaque échec devient plus coûteux.',
    tagOverclockLabel: 'OVERCLOCK',
    tagOverclockDescription: 'Le terminal est tendu sous un temps emprunté.',
    tagStrainLabel: 'TENSION',
    tagStrainDescription: 'L’usage répété d’overclock augmente le risque.',
    hallOfFamePeakStreakTitle: 'SÉRIE MAXIMALE',
    hallOfFamePeakStreakDetail: 'Score de cohérence',
    hallOfFameCurrentFloorTitle: 'ÉTAGE ACTUEL',
    hallOfFameCurrentFloorDetail: 'Niveau de progression',
    hallOfFameSystemPressureTitle: 'PRESSION DU SYSTÈME',
    hallOfFameSystemPressureDetail: 'Stabilité actuelle',
    hallOfFameRankTitle: 'RANG',
    hallOfFameRankDetail: 'Position actuelle',
    towerFloorLabelTop: 'HAUT',
    towerFloorLabelPrefix: 'É',
    skillDisciplineTitle: 'DISCIPLINE',
    skillDisciplineDescription: 'Qualité d’exécution sous pression.',
    skillRecoveryTitle: 'RÉCUPÉRATION',
    skillRecoveryDescription: 'Capacité à récupérer après la tension.',
    skillMomentumTitle: 'IMPULSION',
    skillMomentumDescription: 'Vitesse et rythme sous stress.',
    skillIntegrityTitle: 'INTÉGRITÉ',
    skillIntegrityDescription: 'Résistance à la dégradation du système.',
    ascensionRedlineTitle: 'ASCENSION DE LA LIGNE ROUGE',
    ascensionRedlineSubtitle: 'La tour met votre discipline à l’épreuve. Récupérez vite et tenez la ligne.',
    ascensionRedlineRewardLabel: 'Accès récupération / moins de tension',
    ascensionTowerTitle: 'ASCENSEUR DE TOUR',
    ascensionTowerSubtitle: 'Les galeries supérieures s’ouvrent. Chaque contrat propre affine votre rang.',
    ascensionTowerRewardLabel: 'Accès à de nouveaux étages / récompenses plus fortes',
    ascensionBaselineTitle: 'CHEMIN D’ASCENSION',
    ascensionBaselineSubtitle: 'Chaque contrat fait avancer l’ascension. Restez constant et la tour répondra.',
    ascensionBaselineRewardLabel: 'Impulsion de progression',
    heroRecoveryTitle: 'PROTOCOLE DE RÉCUPÉRATION',
    heroRecoverySubtitle: 'La tour est sous tension. Assurez une victoire compacte et stabilisez l’ascension.',
    heroRecoveryStatus: 'CRITIQUE',
    heroRecoveryEmphasis: 'Protégez votre série avant de pousser plus loin.',
    heroDisciplineTitle: 'RÉINITIALISATION DE DISCIPLINE',
    getHeroDisciplineSubtitle: (missionTitle: string) => `Le nœud actuel demande un contrôle sur l’intensité. ${missionTitle} est votre meilleur prochain mouvement.`,
    heroDisciplineStatus: 'AJUSTER',
    heroDisciplineEmphasis: 'Choisissez la clarté plutôt que la pression.',
    heroClockTitle: 'CONTRÔLE DE L’HORLOGE',
    heroClockSubtitle: 'L’élan est réel, mais la précision compte plus que la vitesse maintenant.',
    heroClockStatus: 'FOCUS',
    getHeroClockEmphasis: (missionRisk: string) => `Niveau de risque ${missionRisk.toLowerCase()} • gardez la prochaine action délibérée.`,
    heroSteadyTitle: 'PRÊT POUR L’ASCENSION',
    heroSteadySubtitle: 'Votre nœud d’opérateur est stable. Utilisez cette fenêtre pour renforcer la tour avec un pacte propre.',
    heroSteadyStatus: 'STABLE',
    getHeroSteadyEmphasis: (missionRisk: string) => `Mission prête • pression ${missionRisk.toLowerCase()}`,
    insightRecoveryTitle: 'PRIORITÉ DE RÉCUPÉRATION',
    insightRecoveryBody: 'Le système est sous pression. Choisissez un contrat compact et protégez la prochaine fenêtre de série.',
    insightFractureTitle: 'ALERTE DE STABILITÉ',
    insightFractureBody: 'La discipline est instable. Favorisez une victoire propre à un mouvement flashy.',
    insightOverclockTitle: 'PRESSION D’HORLOGE',
    insightOverclockBody: 'Le terminal chauffe. Gardez la prochaine action délibérée et évitez les risques inutiles.',
    insightSteadyTitle: 'FLUX D’OPÉRATEUR',
    insightSteadyBody: 'L’ascension est stable. Gardez le rythme solide et laissez la constance porter la tour.',
    missionCriticalTitle: 'RÉCUPÉRATION CRITIQUE',
    missionCriticalBody: 'Le nœud est sous pression. Obtenez un contrat court et vérifié et évitez la tension inutile.',
    missionCriticalNextAction: 'Terminez un pacte compact, puis récupérez avant de prendre un autre risque.',
    missionFractureTitle: 'RÉINITIALISATION DE FRACTURE',
    missionFractureBody: 'La discipline est instable. Favorisez une victoire propre à un grand pari.',
    missionFractureNextAction: 'Terminez une tâche ciblée, puis laissez le système se stabiliser avant de surclocker.',
    missionOverclockTitle: 'DÉRIVE D’HORLOGE',
    missionOverclockBody: 'Le terminal est tendu sous la pression actuelle. Gardez le prochain mouvement délibéré.',
    missionOverclockNextAction: 'Utilisez le prochain pacte pour stabiliser l’élan plutôt que pour chercher une récompense supplémentaire.',
    missionStrainTitle: 'SENSIBILITÉ À LA TENSION',
    missionStrainBody: 'L’usage répété de surclock augmente le risque. Protégez la série avec une exécution mesurée.',
    missionStrainNextAction: 'Faites un tour discipliné et laissez la minuterie respirer.',
    missionSteadyTitle: 'ACCÉLÉRATION STABLE',
    missionSteadyBody: 'Le système tourne bien. Gardez le rythme sans gonfler la fenêtre de mission.',
    missionSteadyNextAction: 'Poussez un contrat clair et préservez votre série.',
    missionBaselineTitle: 'RYTHME DE BASE',
    missionBaselineBody: 'Le terminal est stable. Utilisez cette fenêtre pour construire la constance plutôt que pour poursuivre la volatilité.',
    missionBaselineNextAction: 'Enregistrez un contrat ciblé et laissez le système récompenser une exécution propre.',
    manualPpTitle: 'ÉCONOMIE DE PP',
    manualPpBody: 'Les PP sont votre monnaie de survie. Gagnez-les grâce à des contrats vérifiés et dépensez-les avec soin lorsque le système exige une action premium.',
    manualFractureTitle: 'FRACTURE',
    manualFractureBody: 'Un état de fracture apparaît lorsque la discipline s’effondre. La récupération prend plus de temps et le terminal devient plus dur.',
    manualOverclockTitle: 'OVERCLOCK',
    manualOverclockBody: 'Overclock achète du temps à un coût. Il prolonge la deadline de la mission, mais chaque usage augmente la tension du système.',
  },
  de: {
    howToUseSteps: [
      { title: '1. Protokollieren Sie Ihren Pakt', body: 'Beschreiben Sie, was Sie abgeschlossen haben, und senden Sie dann den Pakt ein, um PP zu verdienen und Ihre Serie aufzubauen.' },
      { title: '2. Lesen Sie den Missionsstatus', body: 'Nutzen Sie das Missionsbanner und das Richtungsfeld, um Druck, Risiko und den nächsten Schritt zu verstehen.' },
      { title: '3. Steigen Sie den Turm hinauf', body: 'Jeder saubere Vertrag stärkt Ihren Rang, schaltet bessere Fortschritte frei und hält Sie im Aufstieg.' },
      { title: '4. Erholen oder overclocken Sie vorsichtig', body: 'Nutzen Sie Recovery-Tools bei hohem Druck und overclocken Sie nur, wenn die Belohnung das Risiko wert ist.' },
    ],
    highRiskRedlineTitle: 'RISIKOKNOTEN / ROTLINIEN-RECOVERY',
    highRiskCriticalTitle: 'RISIKOKNOTEN / KRITISCHES ZIEL',
    getHighRiskDescription: (archetype: string, statusEffect: string) => `Der Overseer treibt ${archetype} in ein volatiles Fenster mit ${statusEffect}-Druck. Ein Fehler eskaliert die Konsequenzen sofort.`,
    overflowTitle: 'STABILITÄTSKNOTEN / BELOHNUNGSANSTIEG',
    overflowDescription: 'Das Terminal erkennt einen Belohnungsanstieg und schlägt eine optimierte Mission für nachhaltigen Fokus und saubere Fortschritte vor.',
    baselineTitle: 'BASISKNOTEN / STETIGER BETRIEB',
    baselineDescription: 'Eine saubere Mission, die den aktuellen Vertrag vertieft, ohne das System zu stark zu belasten und die Serienstabilität zu erhalten.',
    timerExpiredTerminal: '> FRIST ABGELAUFEN. STRAFE AUSGEFÜHRT. VERTRAGSFENSTER GESCHLOSSEN.',
    timerExpiredOverseer: '> KAPITÄNE: MISSIONSFEHLER BESTÄTIGT. RED-STATE-SPERRE.',
    timerExpiredStatus: 'FOLGE ANGEWENDET',
    dailySweepLockTerminal: '> TÄGLICHE AUFRÄUMUNG ABGESCHLOSSEN. VERPASSTE FENSTER ERKANNT. RED-STATE AKTIV.',
    dailySweepLockOverseer: '> KAPITÄNE: DISZIPLINVERFALL BESTÄTIGT. FEINDLICHER MODUS AUTORISIERT.',
    dailySweepLockStatus: 'RED-STATE AKTIV',
    dailySweepWarningTerminal: '> TÄGLICHE AUFRÄUMUNG ABGESCHLOSSEN. WARNUNG AUSGESTELLT. DER NÄCHSTE FEHLER ESKALIERT.',
    dailySweepWarningOverseer: '> KAPITÄNE: NUR WARNUNG. VERHALTEN WIRD GEPRÜFT.',
    dailySweepWarningStatus: 'WARNUNG AUSGESTELLT',
    pactRejectedTerminal: '> VERTRAGSBRUCH PROTOKOLLIERT. KEINE GUTHABEN VERGÜTET.',
    pactRejectedTerminalFracture: '> VERTRAGSBRUCH PROTOKOLLIERT. FRAKTURZUSTAND VERSCHÄRFT.',
    pactRejectedOverseer: '> KAPITÄNE: EINSENDEUNG ABGELEHNT. DISZIPLINPRÜFUNGSDAKT.',
    pactRejectedStatus: 'PAKT ABGELEHNT',
    overclockTerminal: '> ZEITDEHNUNGSPROTOKOLL AKTIVIERT. SYSTEMBELASTUNG AKZEPTIERT.',
    overclockOverseer: '> KAPITÄNE: OVERCLOCK-FENSTER VERLÄNGERT. RISIKOPROFIL ERHÖHT.',
    overclockStatus: 'OVERCLOCK',
    defaultTerminal: '> SYSTEMHINWEIS PROTOKOLLIERT.',
    defaultOverseer: '> KAPITÄNE: STATUSÄNDERUNG PROTOKOLLIERT.',
    defaultStatus: 'STATUS AKTUALISIERT',
    glitchRedlineTitle: 'ROTLINIEN-GLITCH',
    glitchRedlineDescription: 'Das Terminal flackert und verzerrt kurz das Missionsprotokoll.',
    glitchClockTitle: 'UHRDRIFT',
    glitchClockDescription: 'Der Countdown driftet kurz aus dem Takt und erzeugt eine kleine Gefahr.',
    bannerRedline: 'NULLTOLERANZ. ROTER ALARM AKTIV.',
    bannerOverclock: 'ANTICHEAT-PROTOKOLL AKTIV. FENSTERDRIFT ERKANNT.',
    bannerBaseline: 'NUR VERTRÄGE. KEINE LEERE MOTIVATION.',
    tagRedlineLabel: 'ROTLINIE',
    tagRedlineDescription: 'Die Systemintegrität bricht unter Druck zusammen.',
    tagDriftLabel: 'DRIFT',
    tagDriftDescription: 'Die Aufmerksamkeit beginnt zu verschwimmen. Erholung wird schwieriger.',
    tagFractureLabel: 'FRAKTUR',
    tagFractureDescription: 'Die Disziplin ist instabil. Jeder Fehler wird teurer.',
    tagOverclockLabel: 'OVERCLOCK',
    tagOverclockDescription: 'Das Terminal spannt unter geliehener Zeit.',
    tagStrainLabel: 'BELASTUNG',
    tagStrainDescription: 'Wiederholter Overclock-Einsatz erhöht das Risiko.',
    hallOfFamePeakStreakTitle: 'SPITZENSTRECKE',
    hallOfFamePeakStreakDetail: 'Konsistenzpunktzahl',
    hallOfFameCurrentFloorTitle: 'AKTUELLER BODEN',
    hallOfFameCurrentFloorDetail: 'Fortschrittstufe',
    hallOfFameSystemPressureTitle: 'SYSTEMDRUCK',
    hallOfFameSystemPressureDetail: 'Aktuelle Stabilität',
    hallOfFameRankTitle: 'RANG',
    hallOfFameRankDetail: 'Aktuelle Stellung',
    towerFloorLabelTop: 'OBEN',
    towerFloorLabelPrefix: 'E',
    skillDisciplineTitle: 'DISZIPLIN',
    skillDisciplineDescription: 'Ausführungsqualität unter Druck.',
    skillRecoveryTitle: 'ERHOLUNG',
    skillRecoveryDescription: 'Fähigkeit, sich nach Belastung zu erholen.',
    skillMomentumTitle: 'MOMENTUM',
    skillMomentumDescription: 'Tempo und Rhythmus unter Stress.',
    skillIntegrityTitle: 'INTEGRITÄT',
    skillIntegrityDescription: 'Widerstand gegen Systemverfall.',
    ascensionRedlineTitle: 'ROTLINIEN-ASKENSION',
    ascensionRedlineSubtitle: 'Der Turm prüft Ihre Disziplin. Erholen Sie sich schnell und halten Sie die Linie.',
    ascensionRedlineRewardLabel: 'Erholungszugang / weniger Belastung',
    ascensionTowerTitle: 'TURM-ASCENDER',
    ascensionTowerSubtitle: 'Die oberen Galerien öffnen sich. Jeder saubere Vertrag schärft Ihren Rang.',
    ascensionTowerRewardLabel: 'Neuer Stockzugang / stärkere Belohnungen',
    ascensionBaselineTitle: 'ASKENSIONSWEG',
    ascensionBaselineSubtitle: 'Jeder Vertrag treibt den Aufstieg voran. Bleiben Sie konsistent und der Turm antwortet.',
    ascensionBaselineRewardLabel: 'Fortschrittsmomentum',
    heroRecoveryTitle: 'ERHOLUNGSPROTOKOLL',
    heroRecoverySubtitle: 'Der Turm steht unter Belastung. Sichern Sie einen kompakten Sieg und stabilisieren Sie den Aufstieg.',
    heroRecoveryStatus: 'KRITISCH',
    heroRecoveryEmphasis: 'Schützen Sie Ihre Serie, bevor Sie weiter drängen.',
    heroDisciplineTitle: 'DISZIPLIN-ZURÜCKSETZUNG',
    getHeroDisciplineSubtitle: (missionTitle: string) => `Der aktuelle Knoten verlangt Kontrolle über die Intensität. ${missionTitle} ist Ihr bester nächster Schritt.`,
    heroDisciplineStatus: 'ANPASSEN',
    heroDisciplineEmphasis: 'Wählen Sie Klarheit statt Druck.',
    heroClockTitle: 'UHRKONTROLLE',
    heroClockSubtitle: 'Der Schwung ist real, aber Präzision ist jetzt wichtiger als Geschwindigkeit.',
    heroClockStatus: 'FOKUSSIERT',
    getHeroClockEmphasis: (missionRisk: string) => `Risikoebene ${missionRisk.toLowerCase()} • halten Sie die nächste Aktion bewusst.`,
    heroSteadyTitle: 'AUFSTIEG BEREIT',
    heroSteadySubtitle: 'Ihr Operatorknoten ist stabil. Nutzen Sie dieses Fenster, um den Turm mit einem sauberen Pakt zu stärken.',
    heroSteadyStatus: 'STABIL',
    getHeroSteadyEmphasis: (missionRisk: string) => `Mission bereit • ${missionRisk.toLowerCase()} Druck`,
    insightRecoveryTitle: 'ERHOLUNGSPRIMAR',
    insightRecoveryBody: 'Das System steht unter Druck. Wählen Sie einen kompakten Vertrag und schützen Sie das nächste Serienfenster.',
    insightFractureTitle: 'STABILITÄTSALARM',
    insightFractureBody: 'Die Disziplin ist wackelig. Bevorzugen Sie einen sauberen Sieg über eine auffällige Bewegung.',
    insightOverclockTitle: 'UHRDRUCK',
    insightOverclockBody: 'Das Terminal läuft heiß. Halten Sie die nächste Aktion bewusst und vermeiden Sie unnötige Risiken.',
    insightSteadyTitle: 'OPERATORKRAFT',
    insightSteadyBody: 'Der Aufstieg ist stabil. Halten Sie den Takt stark und lassen Sie die Konsistenz den Turm tragen.',
    missionCriticalTitle: 'KRITISCHE ERHOLUNG',
    missionCriticalBody: 'Der Knoten steht unter Druck. Sichern Sie einen kurzen, verifizierten Vertrag und vermeiden Sie unnötige Belastung.',
    missionCriticalNextAction: 'Schließen Sie einen kompakten Pakt ab und erholen Sie sich, bevor Sie ein weiteres Risiko eingehen.',
    missionFractureTitle: 'FRAKTUR-RESET',
    missionFractureBody: 'Die Disziplin ist instabil. Bevorzugen Sie einen sauberen Sieg über ein großes Risiko.',
    missionFractureNextAction: 'Beenden Sie eine fokussierte Aufgabe und lassen Sie das System sich stabilisieren, bevor Sie overclocken.',
    missionOverclockTitle: 'UHRDRIFT',
    missionOverclockBody: 'Das Terminal spannt unter dem aktuellen Druck. Halten Sie den nächsten Schritt bewusst.',
    missionOverclockNextAction: 'Nutzen Sie den nächsten Pakt, um den Schwung zu stabilisieren, statt zusätzliche Belohnung zu verfolgen.',
    missionStrainTitle: 'BELASTUNGSBEWUSSTSEIN',
    missionStrainBody: 'Wiederholter Overclock-Einsatz erhöht das Risiko. Schützen Sie die Serie mit maßvoller Ausführung.',
    missionStrainNextAction: 'Machen Sie einen disziplinierten Zug und lassen Sie den Timer atmen.',
    missionSteadyTitle: 'STETIGE BESCHLEUNIGUNG',
    missionSteadyBody: 'Das System läuft reibungslos. Halten Sie den Takt bei, ohne das Missionsfenster aufzublähen.',
    missionSteadyNextAction: 'Schieben Sie einen klaren Vertrag vor und bewahren Sie Ihre Serie.',
    missionBaselineTitle: 'BASISRHYTHMUS',
    missionBaselineBody: 'Das Terminal ist stabil. Nutzen Sie dieses Fenster, um Konsistenz aufzubauen statt Volatilität zu verfolgen.',
    missionBaselineNextAction: 'Loggen Sie einen fokussierten Vertrag und lassen Sie das System saubere Ausführung belohnen.',
    manualPpTitle: 'PP-ÖKONOMIE',
    manualPpBody: 'PP sind Ihre Überlebenswährung. Verdienen Sie sie durch verifizierte Verträge und geben Sie sie sorgfältig aus, wenn das System eine Premium-Aktion verlangt.',
    manualFractureTitle: 'FRAKTUR',
    manualFractureBody: 'Ein Frakturzustand tritt auf, wenn die Disziplin zusammenbricht. Die Erholung dauert länger und das Terminal wird härter.',
    manualOverclockTitle: 'OVERCLOCK',
    manualOverclockBody: 'Overclock kauft Zeit zum Preis von Belastung. Es verlängert die Missionsfrist, aber jeder Einsatz erhöht die Systembelastung.',
  },
  pt: {
    howToUseSteps: [
      { title: '1. Registe o seu pacto', body: 'Descreva o que concluiu e depois envie o pacto para ganhar PP e construir a sua sequência.' },
      { title: '2. Leia o estado da missão', body: 'Use o banner da missão e o painel de orientação para compreender a pressão, o risco e o próximo passo.' },
      { title: '3. Suba a torre', body: 'Cada contrato limpo fortalece o seu posto, desbloqueia melhor progressão e mantém-no em ascensão.' },
      { title: '4. Recupere ou overclock com cuidado', body: 'Use ferramentas de recuperação quando a pressão for alta e overclock apenas quando a recompensa valer o risco.' },
    ],
    highRiskRedlineTitle: 'NÓ DE RISCO / RECUPERAÇÃO DA LINHA VERMELHA',
    highRiskCriticalTitle: 'NÓ DE RISCO / OBJETIVO CRÍTICO',
    getHighRiskDescription: (archetype: string, statusEffect: string) => `O overseer está a empurrar ${archetype} para uma janela volátil com pressão de ${statusEffect}. A falha escalonará imediatamente as consequências.`,
    overflowTitle: 'NÓ DE ESTABILIDADE / SURTO DE RECOMPENSAS',
    overflowDescription: 'O terminal detecta um surto de recompensas e propõe uma missão otimizada para foco sustentado e progressão limpa.',
    baselineTitle: 'NÓ DE BASE / OPERAÇÃO ESTÁVEL',
    baselineDescription: 'Uma missão limpa concebida para aprofundar o contrato atual sem empurrar o sistema demasiado, preservando a estabilidade da sequência.',
    timerExpiredTerminal: '> PRAZO EXPIRADO. PENALIDADE EXECUTADA. JANELA DO CONTRATO FECHADA.',
    timerExpiredOverseer: '> CAPITÃES: FALHA DA MISSÃO CONFIRMADA. BLOQUEIO RED-STATE.',
    timerExpiredStatus: 'CONSEQÜÊNCIA APLICADA',
    dailySweepLockTerminal: '> VARREDURA DIÁRIA CONCLUÍDA. JANELAS PERDIDAS DETECTADAS. RED-STATE ATIVADO.',
    dailySweepLockOverseer: '> CAPITÃES: DECAIMENTO DE DISCIPLINA CONFIRMADO. MODO HOSTIL AUTORIZADO.',
    dailySweepLockStatus: 'RED-STATE ATIVADO',
    dailySweepWarningTerminal: '> VARREDURA DIÁRIA CONCLUÍDA. AVISO EMITIDO. A PRÓXIMA FALHA ESCALARÁ.',
    dailySweepWarningOverseer: '> CAPITÃES: APENAS AVISO. CONDUTA EM REVISÃO.',
    dailySweepWarningStatus: 'AVISO EMITIDO',
    pactRejectedTerminal: '> VIOLAÇÃO DE CONTRATO REGISTADA. NENHUM CRÉDITO ATRIBUÍDO.',
    pactRejectedTerminalFracture: '> VIOLAÇÃO DE CONTRATO REGISTADA. ESTADO DE FRACTURA INTENSIFICADO.',
    pactRejectedOverseer: '> CAPITÃES: SUBMISSÃO REJEITADA. PROCESSO DE REVISÃO DE DISCIPLINA.',
    pactRejectedStatus: 'PACTO REJEITADO',
    overclockTerminal: '> PROTOCOLO DE DILATAÇÃO DE TEMPO ATIVADO. TENSÃO DO SISTEMA ACEITE.',
    overclockOverseer: '> CAPITÃES: JANELA DE OVERCLOCK ESTENDIDA. PERFIL DE RISCO ELEVADO.',
    overclockStatus: 'OVERCLOCK',
    defaultTerminal: '> AVISO DO SISTEMA REGISTADO.',
    defaultOverseer: '> CAPITÃES: ALTERAÇÃO DE ESTADO REGISTADA.',
    defaultStatus: 'ESTADO ATUALIZADO',
    glitchRedlineTitle: 'GLITCH DA LINHA VERMELHA',
    glitchRedlineDescription: 'O terminal pisca e distorce momentaneamente o registo da missão.',
    glitchClockTitle: 'DERIVA DO RELÓGIO',
    glitchClockDescription: 'A contagem regressiva sai do sincronismo por um momento, introduzindo um pequeno perigo.',
    bannerRedline: 'TOLERÂNCIA ZERO. ALERTA VERMELHA ATIVA.',
    bannerOverclock: 'PROTOCOLO ANTICHEAT ATIVO. DERIVA DE JANELA DETECTADA.',
    bannerBaseline: 'SOMENTE CONTRATOS. SEM MOTIVAÇÃO VAZIA.',
    tagRedlineLabel: 'LINHA VERMELHA',
    tagRedlineDescription: 'A integridade do sistema está a ruir sob pressão.',
    tagDriftLabel: 'DERIVA',
    tagDriftDescription: 'A atenção está a escapar. A recuperação fica mais difícil.',
    tagFractureLabel: 'FRACTURA',
    tagFractureDescription: 'A disciplina está instável. Cada falha torna-se mais cara.',
    tagOverclockLabel: 'OVERCLOCK',
    tagOverclockDescription: 'O terminal está a alcançar o limite com tempo emprestado.',
    tagStrainLabel: 'TENSÃO',
    tagStrainDescription: 'O uso repetido de overclock está a aumentar o risco.',
    hallOfFamePeakStreakTitle: 'SÉRIE MÁXIMA',
    hallOfFamePeakStreakDetail: 'Pontuação de consistência',
    hallOfFameCurrentFloorTitle: 'ANDAR ATUAL',
    hallOfFameCurrentFloorDetail: 'Nível de progressão',
    hallOfFameSystemPressureTitle: 'PRESSÃO DO SISTEMA',
    hallOfFameSystemPressureDetail: 'Estabilidade atual',
    hallOfFameRankTitle: 'POSIÇÃO',
    hallOfFameRankDetail: 'Classificação atual',
    towerFloorLabelTop: 'TOP',
    towerFloorLabelPrefix: 'P',
    skillDisciplineTitle: 'DISCIPLINA',
    skillDisciplineDescription: 'Qualidade de execução sob pressão.',
    skillRecoveryTitle: 'RECUPERAÇÃO',
    skillRecoveryDescription: 'Capacidade de recuperar após a tensão.',
    skillMomentumTitle: 'IMPULSO',
    skillMomentumDescription: 'Velocidade e ritmo sob stress.',
    skillIntegrityTitle: 'INTEGRIDADE',
    skillIntegrityDescription: 'Resistência à decadência do sistema.',
    ascensionRedlineTitle: 'ASCENSÃO DA LINHA VERMELHA',
    ascensionRedlineSubtitle: 'A torre está a testar a sua disciplina. Recupere rapidamente e mantenha a linha.',
    ascensionRedlineRewardLabel: 'Acesso a recuperação / menos tensão',
    ascensionTowerTitle: 'ASCENSOR DA TORRE',
    ascensionTowerSubtitle: 'As galerias superiores estão a abrir. Cada contrato limpo afia o seu posto.',
    ascensionTowerRewardLabel: 'Acesso a novos andares / recompensas mais fortes',
    ascensionBaselineTitle: 'CAMINHO DE ASCENSÃO',
    ascensionBaselineSubtitle: 'Cada contrato avança a subida. Mantenha-se consistente e a torre responderá.',
    ascensionBaselineRewardLabel: 'Impulso de progressão',
    heroRecoveryTitle: 'PROTOCOLO DE RECUPERAÇÃO',
    heroRecoverySubtitle: 'A torre está sob tensão. Conquiste uma vitória compacta e estabiliza a subida.',
    heroRecoveryStatus: 'CRÍTICO',
    heroRecoveryEmphasis: 'Proteja a sua sequência antes de empurrar mais.',
    heroDisciplineTitle: 'REINÍCIO DE DISCIPLINA',
    getHeroDisciplineSubtitle: (missionTitle: string) => `O nó atual pede controlo sobre a intensidade. ${missionTitle} é o seu melhor próximo movimento.`,
    heroDisciplineStatus: 'AJUSTAR',
    heroDisciplineEmphasis: 'Escolha clareza em vez de pressão.',
    heroClockTitle: 'CONTROLO DO RELÓGIO',
    heroClockSubtitle: 'O impulso é real, mas a precisão importa mais do que a velocidade agora.',
    heroClockStatus: 'FOCADO',
    getHeroClockEmphasis: (missionRisk: string) => `Nível de risco ${missionRisk.toLowerCase()} • mantenha a próxima ação deliberada.`,
    heroSteadyTitle: 'PRONTO PARA ASCENDER',
    heroSteadySubtitle: 'O seu nó de operador está estável. Use esta janela para fortalecer a torre com um pacto limpo.',
    heroSteadyStatus: 'ESTÁVEL',
    getHeroSteadyEmphasis: (missionRisk: string) => `Missão pronta • pressão ${missionRisk.toLowerCase()}`,
    insightRecoveryTitle: 'PRIORIDADE DE RECUPERAÇÃO',
    insightRecoveryBody: 'O sistema está sob pressão. Escolha um contrato compacto e proteja a próxima janela de sequência.',
    insightFractureTitle: 'ALERTA DE ESTABILIDADE',
    insightFractureBody: 'A disciplina está instável. Prefira uma vitória limpa a um movimento chamativo.',
    insightOverclockTitle: 'PRESSÃO DO RELÓGIO',
    insightOverclockBody: 'O terminal está muito quente. Mantenha a próxima ação deliberada e evite riscos desnecessários.',
    insightSteadyTitle: 'FLUXO DE OPERADOR',
    insightSteadyBody: 'A ascensão está estável. Mantenha o ritmo forte e deixe a consistência sustentar a torre.',
    missionCriticalTitle: 'RECUPERAÇÃO CRÍTICA',
    missionCriticalBody: 'O nó está sob pressão. Garanta um contrato curto e verificado e evite tensão desnecessária.',
    missionCriticalNextAction: 'Conclua um pacto compacto e depois recupere antes de assumir outro risco.',
    missionFractureTitle: 'REINÍCIO DE FRACTURA',
    missionFractureBody: 'A disciplina está instável. Prefira uma vitória limpa a um grande risco.',
    missionFractureNextAction: 'Termine uma tarefa focada e deixe o sistema estabilizar-se antes de overclockar.',
    missionOverclockTitle: 'DERIVA DO RELÓGIO',
    missionOverclockBody: 'O terminal está sob tensão com a pressão atual. Mantenha o próximo movimento deliberado.',
    missionOverclockNextAction: 'Use o próximo pacto para estabilizar o impulso em vez de perseguir recompensa extra.',
    missionStrainTitle: 'CONSCIÊNCIA DE TENSÃO',
    missionStrainBody: 'O uso repetido de overclock está a aumentar o risco. Proteja a sequência com execução medida.',
    missionStrainNextAction: 'Faça um turno disciplinado e deixe o temporizador respirar.',
    missionSteadyTitle: 'ACELERAÇÃO CONSTANTE',
    missionSteadyBody: 'O sistema está a correr sem problemas. Mantenha o ritmo sem inflar a janela da missão.',
    missionSteadyNextAction: 'Empurre um contrato claro e preserve a sua sequência.',
    missionBaselineTitle: 'RITMO DE BASE',
    missionBaselineBody: 'O terminal está estável. Use esta janela para construir consistência em vez de perseguir volatilidade.',
    missionBaselineNextAction: 'Registe um contrato focado e deixe o sistema recompensar a execução limpa.',
    manualPpTitle: 'ECONOMIA DE PP',
    manualPpBody: 'Os PP são a sua moeda de sobrevivência. Ganhe-os através de contratos verificados e gaste-os com cuidado quando o sistema exigir uma ação premium.',
    manualFractureTitle: 'FRACTURA',
    manualFractureBody: 'Um estado de fractura aparece quando a disciplina entra em colapso. A recuperação demora mais e o terminal fica mais duro.',
    manualOverclockTitle: 'OVERCLOCK',
    manualOverclockBody: 'Overclock compra tempo a um custo. Estende o prazo da missão, mas cada uso aumenta a tensão do sistema.',
  },
  ru: {
    howToUseSteps: [
      { title: '1. Запишите свой пакт', body: 'Опишите, что вы выполнили, затем отправьте пакт, чтобы заработать PP и укрепить свою серию.' },
      { title: '2. Прочитайте состояние миссии', body: 'Используйте баннер миссии и панель указаний, чтобы понять давление, риск и следующий шаг.' },
      { title: '3. Поднимайтесь по башне', body: 'Каждый чистый контракт укрепляет ваш ранг, открывает лучший прогресс и держит вас в восхождении.' },
      { title: '4. Восстанавливайтесь или overclock осторожно', body: 'Используйте инструменты восстановления при высоком давлении и overclock только если награда стоит риска.' },
    ],
    highRiskRedlineTitle: 'УЗЕЛ РИСКА / ВОССТАНОВЛЕНИЕ ПО КРАСНОЙ ЛИНИИ',
    highRiskCriticalTitle: 'УЗЕЛ РИСКА / КРИТИЧЕСКАЯ ЦЕЛЬ',
    getHighRiskDescription: (archetype: string, statusEffect: string) => `Наблюдатель толкает ${archetype} в нестабильное окно с давлением ${statusEffect}. Неудача немедленно усилит последствия.`,
    overflowTitle: 'УЗЕЛ СТАБИЛЬНОСТИ / ПИК НАГРАД',
    overflowDescription: 'Терминал обнаружил всплеск наград и предлагает оптимизированную миссию для устойчивого фокуса и чистого прогресса.',
    baselineTitle: 'БАЗОВЫЙ УЗЕЛ / СТАБИЛЬНАЯ ОПЕРАЦИЯ',
    baselineDescription: 'Чистая миссия, созданная для углубления текущего контракта без чрезмерного давления на систему и с сохранением стабильности серии.',
    timerExpiredTerminal: '> СРОК ИСТЁК. ШТРАФ ВЫПОЛНЕН. ОКНО КОНТРАКТА ЗАКРЫТО.',
    timerExpiredOverseer: '> КАПИТАНЫ: НЕУДАЧА МИССИИ ПОДТВЕРЖДЕНА. БЛОКИРОВКА RED-STATE.',
    timerExpiredStatus: 'НАКАЗАНИЕ ПРИМЕНЕНО',
    dailySweepLockTerminal: '> ЕЖЕДНЕВНАЯ ПРОВЕРКА ЗАВЕРШЕНА. ОБНАРУЖЕНЫ ПРОПУЩЕННЫЕ ОКНА. RED-STATE АКТИВИРОВАН.',
    dailySweepLockOverseer: '> КАПИТАНЫ: РАСПАД ДИСЦИПЛИНЫ ПОДТВЕРЖДЁН. ВКЛЮЧЁН ВРАЖДЕБНЫЙ РЕЖИМ.',
    dailySweepLockStatus: 'RED-STATE АКТИВИРОВАН',
    dailySweepWarningTerminal: '> ЕЖЕДНЕВНАЯ ПРОВЕРКА ЗАВЕРШЕНА. ВЫДАНО ПРЕДУПРЕЖДЕНИЕ. СЛЕДУЮЩАЯ НЕУДАЧА УСИЛИТСЯ.',
    dailySweepWarningOverseer: '> КАПИТАНЫ: ТОЛЬКО ПРЕДУПРЕЖДЕНИЕ. ПОВЕДЕНИЕ ПОД ПРИСМОТРОМ.',
    dailySweepWarningStatus: 'ПРЕДУПРЕЖДЕНИЕ ВЫДАНО',
    pactRejectedTerminal: '> РЕГИСТРАЦИЯ НАРУШЕНИЯ КОНТРАКТА. КРЕДИТЫ НЕ НАЧИСЛЯЮТСЯ.',
    pactRejectedTerminalFracture: '> РЕГИСТРАЦИЯ НАРУШЕНИЯ КОНТРАКТА. СОСТОЯНИЕ ТРЕЩИНЫ УСИЛЕНО.',
    pactRejectedOverseer: '> КАПИТАНЫ: ПОДАЧА ОТКЛОНЕНА. ДЕЛО ПО ДИСЦИПЛИНЕ.',
    pactRejectedStatus: 'ПАКТ ОТКЛОНЁН',
    overclockTerminal: '> ПРОТОКОЛ РАСШИРЕНИЯ ВРЕМЕНИ АКТИВИРОВАН. НАГРУЗКА СИСТЕМЫ ПРИНЯТА.',
    overclockOverseer: '> КАПИТАНЫ: ОКНО OVERCLOCK УДЛИНЕНО. ПРОФИЛЬ РИСКА ПОВЫШЕН.',
    overclockStatus: 'OVERCLOCK',
    defaultTerminal: '> СИСТЕМНОЕ УВЕДОМЛЕНИЕ ЗАРЕГИСТРИРОВАНО.',
    defaultOverseer: '> КАПИТАНЫ: СОСТОЯНИЕ ИЗМЕНЕНО.',
    defaultStatus: 'СОСТОЯНИЕ ОБНОВЛЕНО',
    glitchRedlineTitle: 'СБОЙ КРАСНОЙ ЛИНИИ',
    glitchRedlineDescription: 'Терминал мигает и временно искажает журнал миссии.',
    glitchClockTitle: 'ДРЕЙФ ЧАСОВ',
    glitchClockDescription: 'Отсчёт на мгновение выходит из синхронизации, создавая небольшую опасность.',
    bannerRedline: 'НУЛЕВАЯ ТОЛЕРАНТНОСТЬ. КРАСНАЯ ТРЕВОГА АКТИВНА.',
    bannerOverclock: 'АНТИЧИТ-ПРОТОКОЛ АКТИВЕН. ДРЕЙФ ОКНА ОБНАРУЖЕН.',
    bannerBaseline: 'ТОЛЬКО КОНТРАКТЫ. НИКАКОЙ ПУСТОЙ МОТИВАЦИИ.',
    tagRedlineLabel: 'КРАСНАЯ ЛИНИЯ',
    tagRedlineDescription: 'Целостность системы рушится под давлением.',
    tagDriftLabel: 'ДРЕЙФ',
    tagDriftDescription: 'Внимание ускользает. Восстановление становится сложнее.',
    tagFractureLabel: 'ТРЕЩИНА',
    tagFractureDescription: 'Дисциплина нестабильна. Каждая ошибка становится дороже.',
    tagOverclockLabel: 'OVERCLOCK',
    tagOverclockDescription: 'Терминал напрягается под заёмным временем.',
    tagStrainLabel: 'НАГРУЗКА',
    tagStrainDescription: 'Повторное использование overclock повышает риск.',
    hallOfFamePeakStreakTitle: 'ПИК СЕРИИ',
    hallOfFamePeakStreakDetail: 'Оценка последовательности',
    hallOfFameCurrentFloorTitle: 'ТЕКУЩИЙ ЭТАЖ',
    hallOfFameCurrentFloorDetail: 'Уровень прогресса',
    hallOfFameSystemPressureTitle: 'ДАВЛЕНИЕ СИСТЕМЫ',
    hallOfFameSystemPressureDetail: 'Текущая стабильность',
    hallOfFameRankTitle: 'РАНГ',
    hallOfFameRankDetail: 'Текущее положение',
    towerFloorLabelTop: 'ВВЕРХ',
    towerFloorLabelPrefix: 'Э',
    skillDisciplineTitle: 'ДИСЦИПЛИНА',
    skillDisciplineDescription: 'Качество выполнения под давлением.',
    skillRecoveryTitle: 'ВОССТАНОВЛЕНИЕ',
    skillRecoveryDescription: 'Способность восстанавливаться после напряжения.',
    skillMomentumTitle: 'ИМПУЛЬС',
    skillMomentumDescription: 'Скорость и ритм под стрессом.',
    skillIntegrityTitle: 'ЦЕЛОСТНОСТЬ',
    skillIntegrityDescription: 'Сопротивление деградации системы.',
    ascensionRedlineTitle: 'ВОСХОЖДЕНИЕ ПО КРАСНОЙ ЛИНИИ',
    ascensionRedlineSubtitle: 'Башня испытывает вашу дисциплину. Быстро восстановитесь и держитесь линии.',
    ascensionRedlineRewardLabel: 'Доступ к восстановлению / меньше напряжения',
    ascensionTowerTitle: 'ПОДЪЁМ ПО БАШНЕ',
    ascensionTowerSubtitle: 'Верхние галереи открываются. Каждый чистый контракт оттачивает ваш ранг.',
    ascensionTowerRewardLabel: 'Доступ к новому этажу / сильнее награды',
    ascensionBaselineTitle: 'ПУТЬ ВОСХОЖДЕНИЯ',
    ascensionBaselineSubtitle: 'Каждый контракт продвигает восхождение. Будьте последовательны, и башня ответит.',
    ascensionBaselineRewardLabel: 'Импульс прогресса',
    heroRecoveryTitle: 'ПРОТОКОЛ ВОССТАНОВЛЕНИЯ',
    heroRecoverySubtitle: 'Башня под напряжением. Добейтесь компактной победы и стабилизируйте восхождение.',
    heroRecoveryStatus: 'КРИТИЧНО',
    heroRecoveryEmphasis: 'Защитите свою серию прежде чем идти дальше.',
    heroDisciplineTitle: 'СБРОС ДИСЦИПЛИНЫ',
    getHeroDisciplineSubtitle: (missionTitle: string) => `Текущий узел требует контроля над интенсивностью. ${missionTitle} — лучший следующий шаг.`,
    heroDisciplineStatus: 'ПОДРЕГУЛИРОВАТЬ',
    heroDisciplineEmphasis: 'Выбирайте ясность вместо давления.',
    heroClockTitle: 'КОНТРОЛЬ ЧАСОВ',
    heroClockSubtitle: 'Импульс реален, но точность важнее скорости прямо сейчас.',
    heroClockStatus: 'СФОКУСИРОВАН',
    getHeroClockEmphasis: (missionRisk: string) => `Уровень риска ${missionRisk.toLowerCase()} • держите следующее действие осознанным.`,
    heroSteadyTitle: 'ГОТОВ К ВОСХОЖДЕНИЮ',
    heroSteadySubtitle: 'Ваш узел оператора стабилен. Используйте это окно, чтобы укрепить башню чистым пактом.',
    heroSteadyStatus: 'СТАБИЛЬНО',
    getHeroSteadyEmphasis: (missionRisk: string) => `Миссия готова • давление ${missionRisk.toLowerCase()}`,
    insightRecoveryTitle: 'ПРИОРИТЕТ ВОССТАНОВЛЕНИЯ',
    insightRecoveryBody: 'Система под давлением. Выберите компактный контракт и защитите следующее окно серии.',
    insightFractureTitle: 'ТРЕВОГА СТАБИЛЬНОСТИ',
    insightFractureBody: 'Дисциплина нестабильна. Предпочтите чистую победу эффектному ходу.',
    insightOverclockTitle: 'ДАВЛЕНИЕ ЧАСОВ',
    insightOverclockBody: 'Терминал перегрет. Держите следующее действие осознанным и избегайте лишнего риска.',
    insightSteadyTitle: 'ПОТОК ОПЕРАТОРА',
    insightSteadyBody: 'Восхождение стабильно. Держите ритм сильным и позвольте последовательности нести башню.',
    missionCriticalTitle: 'КРИТИЧЕСКОЕ ВОССТАНОВЛЕНИЕ',
    missionCriticalBody: 'Узел под давлением. Заключите короткий проверенный контракт и избегайте лишнего напряжения.',
    missionCriticalNextAction: 'Завершите компактный пакт, затем восстановитесь перед следующим риском.',
    missionFractureTitle: 'СБРОС ТРЕЩИНЫ',
    missionFractureBody: 'Дисциплина нестабильна. Предпочтите чистую победу большой ставке.',
    missionFractureNextAction: 'Завершите сфокусированную задачу, затем дайте системе успокоиться прежде чем overclock.',
    missionOverclockTitle: 'ДРЕЙФ ЧАСОВ',
    missionOverclockBody: 'Терминал напрягается под текущим давлением. Держите следующее движение осознанным.',
    missionOverclockNextAction: 'Используйте следующий пакт для стабилизации импульса, а не гонки за дополнительной наградой.',
    missionStrainTitle: 'ОСОЗНАНИЕ НАГРУЗКИ',
    missionStrainBody: 'Повторное использование overclock повышает риск. Защищайте серию выверенным выполнением.',
    missionStrainNextAction: 'Сделайте дисциплинированный ход и дайте таймеру выдохнуть.',
    missionSteadyTitle: 'СТАБИЛЬНОЕ УСКОРЕНИЕ',
    missionSteadyBody: 'Система работает гладко. Держите ритм, не раздувая окно миссии.',
    missionSteadyNextAction: 'Продвиньте ясный контракт и сохраните серию.',
    missionBaselineTitle: 'БАЗОВЫЙ РИТМ',
    missionBaselineBody: 'Терминал стабилен. Используйте это окно для укрепления последовательности, а не ради волатильности.',
    missionBaselineNextAction: 'Запишите сфокусированный контракт и позвольте системе вознаградить чистое исполнение.',
    manualPpTitle: 'ЭКОНОМИКА PP',
    manualPpBody: 'PP — ваша валюта выживания. Зарабатывайте их через проверенные контракты и тратьте с осторожностью, когда система требует премиальное действие.',
    manualFractureTitle: 'ТРЕЩИНА',
    manualFractureBody: 'Состояние трещины возникает, когда дисциплина рушится. Восстановление занимает больше времени, а терминал становится жестче.',
    manualOverclockTitle: 'OVERCLOCK',
    manualOverclockBody: 'Overclock покупает время за цену нагрузки. Он удлиняет дедлайн миссии, но каждое использование увеличивает нагрузку на систему.',
  },
  zh: {} as any,
  ja: {} as any,
};

translations.pt = {
  ...translations.en,
  howToUseSteps: [
    { title: '1. Registre o seu pacto', body: 'Descreva o que concluiu e depois envie o pacto para ganhar PP e reforçar a sua sequência.' },
    { title: '2. Leia o estado da missão', body: 'Use o banner da missão e o painel de orientação para compreender a pressão, o risco e o próximo movimento.' },
    { title: '3. Suba a torre', body: 'Cada contrato limpo reforça a sua posição, desbloqueia melhor progresso e mantém a subida em curso.' },
    { title: '4. Recupere ou overclock com cuidado', body: 'Use ferramentas de recuperação quando a pressão for alta e só overclock quando a recompensa justificar o risco.' },
  ],
};

translations.de = {
  ...translations.en,
  howToUseSteps: [
    { title: '1. Registrieren Sie Ihren Pakt', body: 'Beschreiben Sie, was Sie abgeschlossen haben, und senden Sie den Pakt ein, um PP zu verdienen und Ihre Serie aufzubauen.' },
    { title: '2. Lesen Sie den Missionsstatus', body: 'Nutzen Sie das Missionsbanner und das Leitungsfeld, um den aktuellen Druck, das Risiko und den nächsten Schritt zu verstehen.' },
    { title: '3. Steigen Sie den Turm hinauf', body: 'Jeder saubere Vertrag stärkt Ihren Rang, schaltet besseren Fortschritt frei und hält Ihren Aufstieg am Laufen.' },
    { title: '4. Erholen oder overclocken Sie vorsichtig', body: 'Nutzen Sie Erholungstools bei hohem Druck und overclocken Sie nur, wenn die Belohnung das Risiko rechtfertigt.' },
  ],
};

translations.zh = {
  ...translations.en,
  howToUseSteps: [
    { title: '1. 记录你的契约', body: '描述你完成了什么，然后提交契约来获得 PP 并建立连胜。' },
    { title: '2. 阅读任务状态', body: '使用任务横幅和指引面板了解当前压力、风险与下一步行动。' },
    { title: '3. 攀登高塔', body: '每一次干净的契约都会加强你的等级，解锁更好的进度并推动你继续上升。' },
    { title: '4. 小心恢复或超频', body: '压力很高时使用恢复工具，只有当回报足够值得时才进行超频。' },
  ],
};

translations.ja = {
  ...translations.en,
  howToUseSteps: [
    { title: '1. 誓約を記録する', body: '完了した内容を説明し、誓約を送信して PP を獲得し、連続記録を積み上げます。' },
    { title: '2. ミッション状態を読む', body: 'ミッションバナーとガイダンスパネルを使って、現在の圧力・リスク・次の一手を把握します。' },
    { title: '3. タワーを登る', body: 'きれいな契約を積み重ねるたびに階級が強化され、より良い進行が解放され、上昇を続けられます。' },
    { title: '4. 回復とオーバークロックを慎重に', body: '圧力が高い時は回復ツールを使い、報酬がリスクに見合う場合にのみオーバークロックします。' },
  ],
};

translations.ro = {
  ...translations.en,
  howToUseSteps: [
    { title: '1. Înregistrați pactul', body: 'Descrieți ce ați finalizat, apoi trimiteți pactul pentru a câștiga PP și a construi seria.' },
    { title: '2. Citiți starea misiunii', body: 'Folosiți bannerul misiunii și panoul de ghidare pentru a înțelege presiunea, riscul și următorul pas.' },
    { title: '3. Urcați în turn', body: 'Fiecare contract curat vă întărește rangul, dezvăluie o progresie mai bună și vă ține în ascensiune.' },
    { title: '4. Recuperați sau overclockați cu grijă', body: 'Folosiți instrumentele de recuperare când presiunea este ridicată și overclockați doar când recompensa justifică riscul.' },
  ],
};

translations.ar = {
  ...translations.en,
  howToUseSteps: [
    { title: '1. سجل pactك', body: 'صف ما أنجزته، ثم أرسل الاتفاق لكسب PP وبناء سلسلتك.' },
    { title: '2. اقرأ حالة المهمة', body: 'استخدم شريط المهمة ولوحة الإرشاد لفهم الضغط والخطر والخطوة التالية.' },
    { title: '3. صعد البرج', body: 'كل عقد نظيف يعزز رتبتك، ويكشف عن تقدم أفضل، ويحافظ على صعودك.' },
    { title: '4. تعافَ أو تجاوز الحد بحذر', body: 'استخدم أدوات التعافي عند ارتفاع الضغط، وقم بالتجاوز فقط إذا كانت المكافأة تستحق المخاطرة.' },
  ],
};

translations.hi = {
  ...translations.en,
  howToUseSteps: [
    { title: '1. अपना pact दर्ज करें', body: 'जो आपने पूरा किया है उसका वर्णन करें, फिर PP कमाने और अपनी streak बनाने के लिए pact जमा करें।' },
    { title: '2. मिशन की स्थिति पढ़ें', body: 'वर्तमान दबाव, जोखिम और अगला कदम समझने के लिए मिशन बैनर और गाइडेंस पैनल का उपयोग करें।' },
    { title: '3. टॉवर चढ़ें', body: 'हर साफ अनुबंध आपकी रैंक को मजबूत करता है, बेहतर प्रगति खोलता है और आपकी चढ़ाई जारी रखता है।' },
    { title: '4. सावधानी से रिकवर या ओवरक्लॉक करें', body: 'जब दबाव अधिक हो तो रिकवरी टूल का उपयोग करें और केवल तभी ओवरक्लॉक करें जब इनाम जोखिम के लायक हो।' },
  ],
};

translations.ko = {
  ...translations.en,
  howToUseSteps: [
    { title: '1. pact 기록하기', body: '완료한 내용을 설명한 뒤 pact를 제출해 PP를 얻고 연속 기록을 쌓으세요.' },
    { title: '2. 미션 상태 읽기', body: '미션 배너와 가이드 패널로 현재 압박, 위험, 다음 행동을 파악하세요.' },
    { title: '3. 타워 오르기', body: '깔끔한 계약은 계급을 강화하고 더 나은 진전을 열며 상승을 계속하게 합니다.' },
    { title: '4. 회복과 오버클럭을 신중하게', body: '압박이 심할 때는 회복 도구를 사용하고 보상이 위험에 상응할 때만 오버클럭하세요.' },
  ],
};

translations.it = {
  ...translations.en,
  howToUseSteps: [
    { title: '1. Registra il tuo patto', body: 'Descrivi cosa hai completato, poi invia il patto per guadagnare PP e costruire la tua serie.' },
    { title: '2. Leggi lo stato della missione', body: 'Usa il banner della missione e il pannello di guida per capire pressione, rischio e prossima mossa.' },
    { title: '3. Salì la torre', body: 'Ogni contratto pulito rafforza il tuo rango, sblocca una migliore progressione e tiene in ascesa.' },
    { title: '4. Recupera o overclock con attenzione', body: 'Usa gli strumenti di recupero quando la pressione è alta e overclock solo se la ricompensa giustifica il rischio.' },
  ],
};

const getLocalizedHowToUseSteps = (language: SupportedLanguage = 'en') => {
  return translations[language].howToUseSteps;
};

export type MissionContext = {
  pp: number;
  streak: number;
  redState: boolean;
  overclockCount: number;
  protocolArchetypeName: string;
  protocolStatusEffect: string;
};

const pickVariant = <T,>(items: T[], seed: number): T => items[Math.abs(seed) % items.length]!;

export const generateMissionBriefing = (context: MissionContext, language: SupportedLanguage = 'en'): MissionBriefing => {
  const isHighRisk = context.redState || context.overclockCount >= 2 || context.streak >= 6;
  const isOverflowing = context.pp >= 160;
  const seed = context.pp + context.streak + context.overclockCount;
  const localized = translations[language];

  const disciplineTemplates = [
    'Complete a 45 minute build, debug, or study sprint with zero distraction drift.',
    'Complete a 30 minute focused execution block and produce a measurable result.',
    'Complete a 40 minute coding, writing, or learning contract and archive the output.',
  ];

  const cardioTemplates = [
    'Complete a 20 minute run, walk, or mobility reset to recover system focus.',
    'Complete a 35 minute run, ride, or conditioning session at steady output.',
    'Complete a 25 minute recovery march and restore schedule control without drift.',
  ];

  const strengthTemplates = [
    'Complete a 30 minute recovery strength circuit and restore control of the schedule.',
    'Complete a 45 minute lifting or strength session and log the completed sets.',
    'Complete a 35 minute bodyweight or resistance block and confirm set completion.',
  ];

  const disciplineTemplate = pickVariant(disciplineTemplates, seed);
  const cardioTemplate = pickVariant(cardioTemplates, seed + 1);
  const strengthTemplate = pickVariant(strengthTemplates, seed + 2);

  if (isHighRisk) {
    return {
      title: context.redState ? localized.highRiskRedlineTitle : localized.highRiskCriticalTitle,
      description: localized.getHighRiskDescription(context.protocolArchetypeName, context.protocolStatusEffect),
      risk: 'HIGH',
      rewardBonus: 12,
      timeWindowMinutes: 45,
      contractTemplate: context.protocolStatusEffect === 'FRACTURE' ? cardioTemplate : strengthTemplate,
      recommendedStake: 24,
    };
  }

  if (isOverflowing) {
    return {
      title: localized.overflowTitle,
      description: localized.overflowDescription,
      risk: 'MEDIUM',
      rewardBonus: 6,
      timeWindowMinutes: 30,
      contractTemplate: disciplineTemplate,
      recommendedStake: 18,
    };
  }

  return {
    title: localized.baselineTitle,
    description: localized.baselineDescription,
    risk: 'LOW',
    rewardBonus: 3,
    timeWindowMinutes: 20,
    contractTemplate: context.protocolStatusEffect === 'DRIFT' ? cardioTemplate : disciplineTemplate,
    recommendedStake: 12,
  };
};

export const getConsequencePacket = (kind: ConsequenceKind, context: MissionContext, language: SupportedLanguage = 'en'): ConsequencePacket => {
  const localized = translations[language];

  switch (kind) {
    case 'TIMER_EXPIRED':
      return {
        terminalLine: localized.timerExpiredTerminal,
        overseerLine: localized.timerExpiredOverseer,
        statusLine: localized.timerExpiredStatus,
      };
    case 'DAILY_SWEEP_LOCK':
      return {
        terminalLine: localized.dailySweepLockTerminal,
        overseerLine: localized.dailySweepLockOverseer,
        statusLine: localized.dailySweepLockStatus,
      };
    case 'DAILY_SWEEP_WARNING':
      return {
        terminalLine: localized.dailySweepWarningTerminal,
        overseerLine: localized.dailySweepWarningOverseer,
        statusLine: localized.dailySweepWarningStatus,
      };
    case 'PACT_REJECTED':
      return {
        terminalLine: context.protocolStatusEffect === 'FRACTURE'
          ? localized.pactRejectedTerminalFracture
          : localized.pactRejectedTerminal,
        overseerLine: localized.pactRejectedOverseer,
        statusLine: localized.pactRejectedStatus,
      };
    case 'OVERCLOCKED':
      return {
        terminalLine: localized.overclockTerminal,
        overseerLine: localized.overclockOverseer,
        statusLine: localized.overclockStatus,
      };
    default:
      return {
        terminalLine: localized.defaultTerminal,
        overseerLine: localized.defaultOverseer,
        statusLine: localized.defaultStatus,
      };
  }
};

export const getTerminalGlitchEvent = (context: MissionContext, language: SupportedLanguage = 'en'): GlitchEvent | null => {
  const localized = translations[language];

  if (context.redState) {
    return {
      title: localized.glitchRedlineTitle,
      description: localized.glitchRedlineDescription,
      severity: 'HIGH',
      penaltyPP: 8,
    };
  }

  if (context.overclockCount >= 2 || context.protocolStatusEffect === 'OVERCLOCK') {
    return {
      title: localized.glitchClockTitle,
      description: localized.glitchClockDescription,
      severity: 'MEDIUM',
      penaltyPP: 4,
    };
  }

  return null;
};

export const getDisciplineBanner = (context: MissionContext, language: SupportedLanguage = 'en'): string => {
  const localized = translations[language];

  if (context.redState) {
    return localized.bannerRedline;
  }

  if (context.overclockCount >= 2 || context.protocolStatusEffect === 'OVERCLOCK') {
    return localized.bannerOverclock;
  }

  return localized.bannerBaseline;
};

export const getStatusEffectTags = (context: MissionContext, language: SupportedLanguage = 'en'): StatusEffectTag[] => {
  const localized = translations[language];
  const tags: StatusEffectTag[] = [];

  if (context.redState) {
    tags.push({ label: localized.tagRedlineLabel, description: localized.tagRedlineDescription });
  }

  if (context.protocolStatusEffect === 'DRIFT') {
    tags.push({ label: localized.tagDriftLabel, description: localized.tagDriftDescription });
  }

  if (context.protocolStatusEffect === 'FRACTURE') {
    tags.push({ label: localized.tagFractureLabel, description: localized.tagFractureDescription });
  }

  if (context.protocolStatusEffect === 'OVERCLOCK') {
    tags.push({ label: localized.tagOverclockLabel, description: localized.tagOverclockDescription });
  }

  if (context.overclockCount >= 2) {
    tags.push({ label: localized.tagStrainLabel, description: localized.tagStrainDescription });
  }

  return tags;
};

const getLevelThreshold = (level: number): number => {
  if (level <= 1) {
    return 100;
  }

  return 100 + Math.floor((level - 1) * 95) + Math.floor((level - 1) / 5) * 35;
};

const getRankTier = (level: number): string => {
  if (level >= 80) {
    return 'APEX';
  }

  if (level >= 50) {
    return 'LEGEND';
  }

  if (level >= 25) {
    return 'ELITE';
  }

  if (level >= 8) {
    return 'ASCENDER';
  }

  return 'INITIATE';
};

export const getProgressionSnapshot = (context: MissionContext & { level: number; xp?: number }, language: SupportedLanguage = 'en'): ProgressionSnapshot => {
  const localized = translations[language];
  const xp = Math.max(0, context.xp ?? 0);
  const previousThreshold = Math.max(0, (Math.max(1, context.level - 1)) * 500);
  const currentThreshold = Math.max(500, context.level * 500);
  const progressToCurrentLevel = Math.max(0, xp - previousThreshold);
  const levelRequirement = Math.max(1, currentThreshold - previousThreshold);
  const percent = Math.min(100, Math.max(0, Math.round((progressToCurrentLevel / levelRequirement) * 100)));

  const rankTier = getRankTier(context.level);
  const hallOfFame = [
    { title: localized.hallOfFamePeakStreakTitle, value: `${context.streak} DAYS`, detail: localized.hallOfFamePeakStreakDetail },
    { title: localized.hallOfFameCurrentFloorTitle, value: `LV ${context.level}`, detail: localized.hallOfFameCurrentFloorDetail },
    { title: localized.hallOfFameSystemPressureTitle, value: context.redState ? 'RED' : 'STABLE', detail: localized.hallOfFameSystemPressureDetail },
    { title: localized.hallOfFameRankTitle, value: rankTier, detail: localized.hallOfFameRankDetail },
  ];

  const towerFloors = Array.from({ length: 99 }, (_, index) => {
    const floor = index + 1;
    const unlocked = floor <= Math.min(99, Math.max(1, context.level));
    const active = floor === context.level;
    return {
      floor,
      label: floor === 99 ? localized.towerFloorLabelTop : `${localized.towerFloorLabelPrefix}${floor}`,
      unlocked,
      active,
    };
  });

  const skills: ProgressionSkill[] = [
    {
      title: localized.skillDisciplineTitle,
      value: `${Math.min(10, 3 + Math.floor(context.pp / 120))}/10`,
      description: localized.skillDisciplineDescription,
    },
    {
      title: localized.skillRecoveryTitle,
      value: `${Math.min(10, 2 + Math.floor(context.streak / 2))}/10`,
      description: localized.skillRecoveryDescription,
    },
    {
      title: localized.skillMomentumTitle,
      value: `${Math.min(10, 2 + Math.floor(context.overclockCount || 0))}/10`,
      description: localized.skillMomentumDescription,
    },
    {
      title: localized.skillIntegrityTitle,
      value: `${Math.min(10, 3 + Math.floor(context.level / 12))}/10`,
      description: localized.skillIntegrityDescription,
    },
  ];

  const ascension = context.redState
    ? {
        title: localized.ascensionRedlineTitle,
        subtitle: localized.ascensionRedlineSubtitle,
        rewardLabel: localized.ascensionRedlineRewardLabel,
      }
    : context.level >= 80
      ? {
          title: localized.ascensionTowerTitle,
          subtitle: localized.ascensionTowerSubtitle,
          rewardLabel: 'Apex floor access / mastery rewards',
        }
      : context.level >= 25
        ? {
            title: localized.ascensionTowerTitle,
            subtitle: localized.ascensionTowerSubtitle,
            rewardLabel: localized.ascensionTowerRewardLabel,
          }
        : {
            title: localized.ascensionBaselineTitle,
            subtitle: localized.ascensionBaselineSubtitle,
            rewardLabel: localized.ascensionBaselineRewardLabel,
          };

  return {
    hallOfFame,
    towerFloors,
    skills,
    nextLevelProgress: {
      current: progressToCurrentLevel,
      next: levelRequirement,
      percent,
    },
    ascension,
  };
};

export const getHeroSummary = (context: MissionContext, missionTitle: string, missionRisk: string, language: SupportedLanguage = 'en'): HeroSummary => {
  const localized = translations[language];

  if (context.redState) {
    return {
      title: localized.heroRecoveryTitle,
      subtitle: localized.heroRecoverySubtitle,
      statusLabel: localized.heroRecoveryStatus,
      emphasis: localized.heroRecoveryEmphasis,
    };
  }

  if (context.protocolStatusEffect === 'FRACTURE') {
    return {
      title: localized.heroDisciplineTitle,
      subtitle: localized.getHeroDisciplineSubtitle(missionTitle),
      statusLabel: localized.heroDisciplineStatus,
      emphasis: localized.heroDisciplineEmphasis,
    };
  }

  if (context.protocolStatusEffect === 'OVERCLOCK') {
    return {
      title: localized.heroClockTitle,
      subtitle: localized.heroClockSubtitle,
      statusLabel: localized.heroClockStatus,
      emphasis: localized.getHeroClockEmphasis(missionRisk),
    };
  }

  return {
    title: localized.heroSteadyTitle,
    subtitle: localized.heroSteadySubtitle,
    statusLabel: localized.heroSteadyStatus,
    emphasis: localized.getHeroSteadyEmphasis(missionRisk),
  };
};

export const getOperatorInsight = (context: MissionContext, language: SupportedLanguage = 'en'): OperatorInsight => {
  const localized = translations[language];

  if (context.redState) {
    return {
      title: localized.insightRecoveryTitle,
      body: localized.insightRecoveryBody,
    };
  }

  if (context.protocolStatusEffect === 'FRACTURE') {
    return {
      title: localized.insightFractureTitle,
      body: localized.insightFractureBody,
    };
  }

  if (context.protocolStatusEffect === 'OVERCLOCK') {
    return {
      title: localized.insightOverclockTitle,
      body: localized.insightOverclockBody,
    };
  }

  return {
    title: localized.insightSteadyTitle,
    body: localized.insightSteadyBody,
  };
};

export const getHowToUseSystemSteps = (language: SupportedLanguage = 'en'): HowToUseStep[] => getLocalizedHowToUseSteps(language).map((step: { title: string; body: string }) => ({ ...step }));

export const getFirstSessionGuide = (language: SupportedLanguage = 'en'): FirstSessionGuide => {
  const localized = translations[language];
  const steps = [
    { title: localized.firstSessionStepOneTitle, body: localized.firstSessionStepOneBody },
    { title: localized.firstSessionStepTwoTitle, body: localized.firstSessionStepTwoBody },
    { title: localized.firstSessionStepThreeTitle, body: localized.firstSessionStepThreeBody },
  ];

  return {
    title: localized.firstSessionTitle,
    body: localized.firstSessionBody,
    steps,
    primaryAction: localized.firstSessionPrimaryAction,
  };
};

export const getDailyLoopGuide = (language: SupportedLanguage = 'en'): DailyLoopGuide => {
  const localized = translations[language];
  const steps = [
    { title: localized.dailyLoopStepOneTitle, body: localized.dailyLoopStepOneBody },
    { title: localized.dailyLoopStepTwoTitle, body: localized.dailyLoopStepTwoBody },
    { title: localized.dailyLoopStepThreeTitle, body: localized.dailyLoopStepThreeBody },
  ];

  return {
    title: localized.dailyLoopTitle,
    body: localized.dailyLoopBody,
    nextAction: localized.dailyLoopNextAction,
    steps,
  };
};

export const getMissionGuidance = (context: MissionContext, language: SupportedLanguage = 'en'): MissionGuidance => {
  const localized = translations[language];

  if (context.redState) {
    return {
      title: localized.missionCriticalTitle,
      body: localized.missionCriticalBody,
      nextAction: localized.missionCriticalNextAction,
    };
  }

  if (context.protocolStatusEffect === 'FRACTURE') {
    return {
      title: localized.missionFractureTitle,
      body: localized.missionFractureBody,
      nextAction: localized.missionFractureNextAction,
    };
  }

  if (context.protocolStatusEffect === 'OVERCLOCK') {
    return {
      title: localized.missionOverclockTitle,
      body: localized.missionOverclockBody,
      nextAction: localized.missionOverclockNextAction,
    };
  }

  if (context.overclockCount >= 2) {
    return {
      title: localized.missionStrainTitle,
      body: localized.missionStrainBody,
      nextAction: localized.missionStrainNextAction,
    };
  }

  if (context.streak >= 6) {
    return {
      title: localized.missionSteadyTitle,
      body: localized.missionSteadyBody,
      nextAction: localized.missionSteadyNextAction,
    };
  }

  return {
    title: localized.missionBaselineTitle,
    body: localized.missionBaselineBody,
    nextAction: localized.missionBaselineNextAction,
  };
};

export const getOperatorManualEntries = (language: SupportedLanguage = 'en'): OperatorManualEntry[] => {
  const localized = translations[language];

  return [
    {
      title: localized.manualPpTitle,
      body: localized.manualPpBody,
    },
    {
      title: localized.manualFractureTitle,
      body: localized.manualFractureBody,
    },
    {
      title: localized.manualOverclockTitle,
      body: localized.manualOverclockBody,
    },
  ];
};
