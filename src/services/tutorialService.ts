export type TutorialStep = {
  id: number;
  title: string;
  body: string;
  hint: string;
  tab: 'PACT' | 'SQUAD' | 'STORE' | 'PROFILE' | 'SYSTEM';
};

const tutorialContentByLanguage: Record<string, TutorialStep[]> = {
  en: [
    {
      id: 0,
      title: 'WELCOME, OPERATOR',
      body: 'PeakPact is a personal discipline engine. You write contracts with yourself, stake Pact Points (PP), and prove you completed them. The AI verifies your report — miss a deadline and the system penalises you automatically.',
      hint: 'Swipe through this intro to learn the key mechanics before you begin.',
      tab: 'PACT',
    },
    {
      id: 1,
      title: 'PACT POINTS (PP)',
      body: 'PP is your discipline score. Earn PP by submitting verified pacts. Spend PP to unlock premium features, or lose it for missed contracts and breaches. Your current balance is always visible top-left in the OPERATOR LEDGER.',
      hint: 'Look at the top-left pane — that number is your live PP balance.',
      tab: 'PACT',
    },
    {
      id: 2,
      title: 'THE PACT RING',
      body: 'The crimson fractured ring represents an active, unverified contract. When you complete a task and submit proof, the ring seals into a clean, unbroken white circle. That visual confirmation is your daily win signal.',
      hint: 'The two rings shown are the before (crimson) and after (white) states.',
      tab: 'PACT',
    },
    {
      id: 3,
      title: 'CREATING A CONTRACT',
      body: 'Scroll down on the PACT tab to the contract form. Describe what you completed, set a time duration in minutes, and set a PP stake. Press SUBMIT PACT — the AI reads your report and awards PP if it passes verification.',
      hint: 'Start with a low stake (10–20 PP) while you get familiar with the system.',
      tab: 'PACT',
    },
    {
      id: 4,
      title: 'THE SEVERANCE TIMER',
      body: 'The countdown in the top-right SEVERANCE TIMER pane shows time until the daily reset. If you have an active contract and let the clock hit zero without submitting, your streak breaks and PP is deducted. This pressure is intentional.',
      hint: 'Set your contract early in the day — do not wait for the last hour.',
      tab: 'PACT',
    },
    {
      id: 5,
      title: 'SQUAD NETWORK',
      body: 'Tap the SQUAD tab to create or join a crew. Squad members see each other\'s live adherence status. Social accountability raises completion rates significantly. Warning: leaving a squad costs a Severance Toll (PP).',
      hint: 'Tap SQUAD in the navigation bar at the bottom of the header.',
      tab: 'SQUAD',
    },
    {
      id: 6,
      title: 'DESIGN TEMPLATES & STORE',
      body: 'Tap the STORE tab to browse premium visual themes unlockable with earned PP. Each template has unique colors, animations, and press sounds matched to its aesthetic. You earn your way to better visuals.',
      hint: 'Tap STORE — the BASE PROTOCOL template is yours from day one.',
      tab: 'STORE',
    },
    {
      id: 7,
      title: 'THE COMMAND BAR',
      body: 'The bar at the very bottom of the screen is your system CLI. Type /log pact to view your history, /search [name] to find operators, /override premium to access the upgrade panel, or /uplink to connect to Overseer.',
      hint: 'You are ready. Build the habit. The system holds you to it.',
      tab: 'PACT',
    },
  ],
  es: [
    {
      id: 0,
      title: 'BIENVENIDO, OPERADOR',
      body: 'PeakPact es un motor personal de disciplina. Escribes contratos contigo mismo, apuestas puntos de pacto (PP) y demuestras que los completaste. La IA verifica tu informe: si faltas una fecha límite, el sistema te penaliza automáticamente.',
      hint: 'Desliza por esta introducción para aprender los mecanismos clave antes de empezar.',
      tab: 'PACT',
    },
    {
      id: 1,
      title: 'PUNTOS DE PACTO (PP)',
      body: 'Los PP son tu puntuación de disciplina. Gánalos enviando pactos verificados. Gasta PP para desbloquear funciones premium o piérdelos por contratos incumplidos o infracciones. Tu saldo actual siempre aparece arriba a la izquierda en el libro mayor del operador.',
      hint: 'Mira el panel superior izquierdo: ese número es tu saldo de PP en vivo.',
      tab: 'PACT',
    },
    {
      id: 2,
      title: 'EL ANILLO DE PACTO',
      body: 'El anillo rojo fracturado representa un contrato activo y sin verificar. Cuando completas una tarea y envías prueba, el anillo se cierra en un círculo blanco limpio y intacto. Esa confirmación visual es tu señal diaria de victoria.',
      hint: 'Los dos anillos mostrados son los estados antes (rojo) y después (blanco).',
      tab: 'PACT',
    },
    {
      id: 3,
      title: 'CREAR UN CONTRATO',
      body: 'Desplázate hacia abajo en la pestaña PACT para ver el formulario del contrato. Describe lo que completaste, define una duración en minutos y una apuesta de PP. Pulsa ENVIAR PACTO: la IA lee tu informe y otorga PP si pasa la verificación.',
      hint: 'Empieza con una apuesta baja (10–20 PP) mientras te familiarizas con el sistema.',
      tab: 'PACT',
    },
    {
      id: 4,
      title: 'EL TEMPORIZADOR DE SEPARACIÓN',
      body: 'La cuenta atrás del panel superior derecho muestra el tiempo hasta el reinicio diario. Si tienes un contrato activo y dejas que el reloj llegue a cero sin enviar nada, tu racha se rompe y se descuentan PP. Esa presión es intencional.',
      hint: 'Define tu contrato temprano en el día: no esperes a la última hora.',
      tab: 'PACT',
    },
    {
      id: 5,
      title: 'RED DE ESCUADRAS',
      body: 'Pulsa la pestaña SQUAD para crear o unirte a un equipo. Los miembros ven el estado de adherencia en vivo. La responsabilidad social eleva mucho las tasas de finalización. Aviso: abandonar un escuadrón cuesta un peaje de separación (PP).',
      hint: 'Pulsa SQUAD en la barra de navegación inferior de la cabecera.',
      tab: 'SQUAD',
    },
    {
      id: 6,
      title: 'PLANTILLAS DE DISEÑO Y TIENDA',
      body: 'Pulsa la pestaña STORE para explorar temas visuales premium desbloqueables con PP ganados. Cada plantilla tiene colores, animaciones y sonidos de pulsación únicos. Ganas tu camino a mejores visuales.',
      hint: 'Pulsa STORE: la plantilla BASE PROTOCOL es tuya desde el primer día.',
      tab: 'STORE',
    },
    {
      id: 7,
      title: 'LA BARRA DE MANDO',
      body: 'La barra en la parte inferior de la pantalla es tu CLI del sistema. Escribe /log pact para ver tu historial, /search [nombre] para encontrar operadores, /override premium para acceder al panel de mejoras o /uplink para conectar con Overseer.',
      hint: 'Ya estás listo. Construye el hábito. El sistema te lo exige.',
      tab: 'PACT',
    },
  ],
};

export function getTutorialSteps(language: string) {
  const normalized = language?.toLowerCase();
  if (normalized?.startsWith('es')) return tutorialContentByLanguage.es;
  if (normalized?.startsWith('fr')) return tutorialContentByLanguage.fr;
  if (normalized?.startsWith('de')) return tutorialContentByLanguage.de;
  if (normalized?.startsWith('pt')) return tutorialContentByLanguage.pt;
  if (normalized?.startsWith('ja')) return tutorialContentByLanguage.ja;
  if (normalized?.startsWith('zh')) return tutorialContentByLanguage.zh;
  return tutorialContentByLanguage.en;
}

export const TUTORIAL_STEPS = getTutorialSteps('en');