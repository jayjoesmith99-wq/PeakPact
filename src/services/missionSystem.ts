export type MissionBriefing = {
  title: string;
  description: string;
  risk: "LOW" | "MEDIUM" | "HIGH";
  rewardBonus: number;
  timeWindowMinutes: number;
  contractTemplate: string;
  recommendedStake: number;
};

export function generateMissionBriefing(_context: Record<string, unknown>, _language: string): MissionBriefing {
  return {
    title: "OPERATIONAL BRIEFING",
    description: "Maintain discipline and execute the current task with precision.",
    risk: "LOW",
    rewardBonus: 5,
    timeWindowMinutes: 45,
    contractTemplate: "Complete a focused execution block and report progress.",
    recommendedStake: 20,
  };
}

export function getConsequencePacket(reason: string, _context: Record<string, unknown>, _language: string) {
  return {
    terminalLine: `> CONSEQUENCE: ${reason}`,
    overseerLine: `> OVERSEER NOTICE: ${reason}`,
    statusLine: `STATUS: ${reason}`,
  };
}

export function getDailyLoopGuide(_language: string) {
  return {
    title: "DAILY LOOP",
    body: "Stay consistent with your core discipline and avoid gaps in routine.",
    nextAction: "Submit your next pact before the timer expires.",
    steps: [
      { title: "Plan", body: "Define the next execution task." },
      { title: "Execute", body: "Complete the task with focus." },
      { title: "Review", body: "Report your progress honestly." },
    ],
  };
}

export function getDisciplineBanner(_context: Record<string, unknown>, _language: string) {
  return "DISCIPLINE STATUS STABLE.";
}

export function getFirstSessionGuide(language: string) {
  const normalized = language?.toLowerCase();
  if (normalized?.startsWith('es')) {
    return {
      title: 'GUÍA DE LA PRIMERA SESIÓN',
      body: 'Bienvenido, operador. Empieza con una pequeña victoria y aprende el ciclo en tres pasos rápidos.',
      steps: [
        { title: 'Elige una tarea', body: 'Elige algo que puedas terminar hoy.' },
        { title: 'Envíala', body: 'Envía tu pacto para revisión y gana progreso.' },
        { title: 'Revisa el resultado', body: 'Mira tu recompensa, estado y próximo movimiento.' },
      ],
      primaryAction: 'EMPIEZA TU PRIMERA TAREA',
    };
  }
  if (normalized?.startsWith('fr')) {
    return {
      title: 'GUIDE DE LA PREMIÈRE SESSION',
      body: 'Bienvenue, opérateur. Commence par une petite victoire et apprends la boucle en trois étapes rapides.',
      steps: [
        { title: 'Choisis une tâche', body: 'Choisis une chose que tu peux terminer aujourd’hui.' },
        { title: 'Soumets-la', body: 'Envoie ton pacte pour vérification et gagne en progression.' },
        { title: 'Consulte le résultat', body: 'Vois ta récompense, ton statut et la prochaine étape.' },
      ],
      primaryAction: 'COMMENCE TA PREMIÈRE TÂCHE',
    };
  }
  if (normalized?.startsWith('de')) {
    return {
      title: 'ANLEITUNG ZUR ERSTEN SITZUNG',
      body: 'Willkommen, Operator. Starte mit einem kleinen Sieg und lerne die Schleife in drei schnellen Schritten.',
      steps: [
        { title: 'Wähle eine Aufgabe', body: 'Wähle etwas, das du heute abschließen kannst.' },
        { title: 'Sende sie', body: 'Sende deinen Pakt zur Prüfung und verdiene Fortschritt.' },
        { title: 'Prüfe das Ergebnis', body: 'Sieh dir Belohnung, Status und nächsten Schritt an.' },
      ],
      primaryAction: 'STARTE DEINE ERSTE AUFGABE',
    };
  }
  if (normalized?.startsWith('pt')) {
    return {
      title: 'GUIA DA PRIMEIRA SESSÃO',
      body: 'Bem-vindo, operador. Comece com uma pequena vitória e aprenda o ciclo em três etapas rápidas.',
      steps: [
        { title: 'Escolha uma tarefa', body: 'Escolha algo que você consiga concluir hoje.' },
        { title: 'Envie-a', body: 'Envie seu pacto para revisão e ganhe progresso.' },
        { title: 'Revise o resultado', body: 'Veja sua recompensa, status e próximo passo.' },
      ],
      primaryAction: 'COMECE SUA PRIMEIRA TAREFA',
    };
  }
  if (normalized?.startsWith('ja')) {
    return {
      title: '最初のセッションガイド',
      body: 'ようこそ、オペレーター。小さな勝利から始めて、3つのステップでループを覚えましょう。',
      steps: [
        { title: 'タスクを選ぶ', body: '今日終えられるものを1つ選びます。' },
        { title: '送信する', body: '契約をレビューに送って進捗を得ます。' },
        { title: '結果を確認する', body: '報酬、ステータス、次の一手を確認します。' },
      ],
      primaryAction: '最初のタスクを開始',
    };
  }
  if (normalized?.startsWith('zh')) {
    return {
      title: '首次会话指南',
      body: '欢迎，操作员。先从一个小胜利开始，并用三个快速步骤掌握循环。',
      steps: [
        { title: '选择任务', body: '选择一件你今天可以完成的事。' },
        { title: '提交任务', body: '将你的契约提交审核并获得进度。' },
        { title: '查看结果', body: '查看你的奖励、状态和下一步。' },
      ],
      primaryAction: '开始你的第一项任务',
    };
  }
  return {
    title: 'FIRST SESSION GUIDE',
    body: 'Welcome operator. Start with one small win and learn the loop in three quick steps.',
    steps: [
      { title: 'Pick a task', body: 'Choose one thing you can finish today.' },
      { title: 'Submit it', body: 'Send your pact for review and earn progress.' },
      { title: 'Review the result', body: 'See your reward, status, and next move.' },
    ],
    primaryAction: 'START YOUR FIRST TASK',
  };
}

export function getHeroSummary(_context: Record<string, unknown>, missionTitle: string, _missionRisk: string, _language: string) {
  return {
    title: "SYSTEM PILOT READY",
    subtitle: `Mission: ${missionTitle}`,
    emphasis: "Stay sharp and monitor the timer.",
    statusLabel: "COMMAND CORE",
  };
}

export function getHowToUseSystemSteps(_language: string) {
  return [
    { title: "WRITE YOUR PACT", body: "Describe what you accomplished." },
    { title: "SUBMIT PROOF", body: "Send the pact for verification." },
    { title: "EARN PP", body: "Use points to unlock templates." },
  ];
}

export function getMissionGuidance(_context: Record<string, unknown>, _language: string) {
  return {
    title: "MISSION GUIDANCE",
    body: "Keep your goal clear and your pact concise.",
    nextAction: "Submit a completion summary now.",
  };
}

export function getOperatorInsight(_context: Record<string, unknown>, _language: string) {
  return {
    title: "OPERATOR INSIGHT",
    body: "Your consistency is your strongest asset.",
  };
}

export function getOperatorManualEntries(_language: string) {
  return [
    { title: "Pact Formation", body: "Write clear commitments to earn PP." },
    { title: "Recovery", body: "Use stabilization when needed." },
  ];
}

function getLevelFromXP(xp: number) {
  if (xp >= 50000) {
    return 99;
  }

  let currentLevel = 1;
  let threshold = 500;
  let remainingXp = xp;

  while (remainingXp >= threshold && currentLevel < 99) {
    remainingXp -= threshold;
    currentLevel += 1;
    threshold += 500;
  }

  return Math.min(currentLevel, 99);
}

function getXpThresholdForLevel(level: number) {
  if (level <= 1) return 0;
  return 500 * (level - 1) * level / 2;
}

export function getProgressionSnapshot(context: Record<string, unknown>, _language: string) {
  const xp = typeof context.xp === 'number' ? context.xp : 0;
  const level = typeof context.level === 'number' ? context.level : getLevelFromXP(xp);
  const activeLevel = Math.min(Math.max(level, 1), 99);
  const currentThreshold = getXpThresholdForLevel(activeLevel);
  const nextThreshold = activeLevel >= 99 ? currentThreshold : getXpThresholdForLevel(activeLevel + 1);
  const progressPercent = activeLevel >= 99
    ? 100
    : xp === currentThreshold
      ? 100
      : Math.min(100, Math.max(0, Math.round(((xp - currentThreshold) / Math.max(1, nextThreshold - currentThreshold)) * 100)));

  return {
    nextLevelProgress: { percent: progressPercent },
    hallOfFame: [
      { title: 'Execution', value: 'Stable', detail: 'Maintain daily streak.' },
    ],
    towerFloors: Array.from({ length: 99 }, (_, index) => {
      const floor = index + 1;
      return {
        floor,
        label: `FLOOR ${floor}`,
        active: floor === activeLevel,
        unlocked: floor <= activeLevel,
      };
    }),
    skills: [
      { title: 'FOCUS', value: '3', description: 'Maintain attention on objective.' },
    ],
    ascension: {
      title: 'PATH FORGE',
      subtitle: 'Progress through daily discipline.',
      rewardLabel: 'New template unlock',
    },
  };
}

export function getStatusEffectTags(_context: Record<string, unknown>, _language: string) {
  return [{ label: "STABLE" }];
}

export function getTerminalGlitchEvent(_context: Record<string, unknown>, _language: string) {
  return { title: "MINOR GLITCH" };
}
