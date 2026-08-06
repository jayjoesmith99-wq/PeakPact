<<<<<<< HEAD
import AsyncStorage from '@react-native-async-storage/async-storage';

export type SupportedLanguage = 'en' | 'es' | 'fr' | 'de' | 'pt' | 'ru' | 'zh' | 'ja' | 'ro' | 'ar' | 'hi' | 'ko' | 'it';

export const SUPPORTED_LANGUAGES: Array<{ code: SupportedLanguage; label: string }> = [
  { code: 'en', label: 'English' },
  { code: 'es', label: 'Español' },
  { code: 'fr', label: 'Français' },
  { code: 'de', label: 'Deutsch' },
  { code: 'pt', label: 'Português' },
  { code: 'ru', label: 'Русский' },
  { code: 'zh', label: '中文' },
  { code: 'ja', label: '日本語' },
  { code: 'ro', label: 'Română' },
  { code: 'ar', label: 'العربية' },
  { code: 'hi', label: 'हिन्दी' },
  { code: 'ko', label: '한국어' },
  { code: 'it', label: 'Italiano' },
];

const LANGUAGE_STORAGE_KEY = '@peakpact/language';

const translations = {
  en: {
    onboardingTitle: 'WELCOME TO THE TOWER.',
    onboardingBody: 'The system is ready to receive your first pact. Complete one clean contract to enter the core loop, strengthen your rank, and begin your ascent.',
    onboardingButton: 'ENTER THE TOWER',
    submitPact: 'SUBMIT PACT',
    loadSample: 'LOAD SAMPLE',
    manual: 'MANUAL',
    syncQueue: 'SYNC QUEUE',
    terminalUpgrades: 'TERMINAL UPGRADES',
    lockTerminal: 'LOCK TERMINAL',
    missionTitle: 'ACTIVE MISSION',
    statusLabel: 'STATUS',
    operatorInsight: 'OPERATOR INSIGHT',
    guidance: 'OPERATIVE GUIDANCE',
    howToUse: 'HOW TO USE THE SYSTEM',
    commandAccess: 'COMMAND ACCESS',
    languageLabel: 'SYSTEM LANGUAGE',
    languageHint: 'Switch the interface language used by the terminal.',
    sampleHint: 'Start with a concrete result and measurable progress.',
  },
  es: {
    onboardingTitle: 'BIENVENIDO A LA TORRE.',
    onboardingBody: 'El sistema está listo para recibir tu primer pacto. Completa un contrato limpio para entrar en el bucle central, fortalecer tu rango y comenzar tu ascenso.',
    onboardingButton: 'ENTRAR A LA TORRE',
    submitPact: 'ENVIAR PACTO',
    loadSample: 'CARGAR EJEMPLO',
    manual: 'MANUAL',
    syncQueue: 'SINCRONIZAR COLA',
    terminalUpgrades: 'MEJORAS DE TERMINAL',
    lockTerminal: 'BLOQUEAR TERMINAL',
    missionTitle: 'MISIÓN ACTIVA',
    statusLabel: 'ESTADO',
    operatorInsight: 'VISIÓN DEL OPERADOR',
    guidance: 'ORIENTACIÓN OPERATIVA',
    howToUse: 'CÓMO USAR EL SISTEMA',
    commandAccess: 'ACCESO DE COMANDO',
    languageLabel: 'IDIOMA DEL SISTEMA',
    languageHint: 'Cambia el idioma de la interfaz del terminal.',
    sampleHint: 'Comienza con un resultado concreto y un progreso medible.',
  },
  fr: {
    onboardingTitle: 'BIENVENUE DANS LA TOURE.',
    onboardingBody: 'Le système est prêt à recevoir votre premier pacte. Complétez un contrat propre pour entrer dans la boucle centrale, renforcer votre rang et commencer votre ascension.',
    onboardingButton: 'ENTRER DANS LA TOURE',
    submitPact: 'SOUMETTRE LE PACTE',
    loadSample: 'CHARGER UN EXEMPLÉ',
    manual: 'MANUEL',
    syncQueue: 'SYNCHRONISER LA FILE',
    terminalUpgrades: 'AMÉLIORATIONS DU TERMINAL',
    lockTerminal: 'VERROUILLER LE TERMINAL',
    missionTitle: 'MISSION ACTIVE',
    statusLabel: 'ÉTAT',
    operatorInsight: 'VISION DE L’OPÉRATEUR',
    guidance: 'GUIDAGE OPÉRATIF',
    howToUse: 'COMMENT UTILISER LE SYSTÈME',
    commandAccess: 'ACCÈS COMMANDE',
    languageLabel: 'LANGUE DU SYSTÈME',
    languageHint: 'Changez la langue de l’interface du terminal.',
    sampleHint: 'Commencez par un résultat concret et une progression mesurable.',
  },
  pt: {
    onboardingTitle: 'BEM-VINDO À TORRE.',
    onboardingBody: 'O sistema está pronto para receber o seu primeiro pacto. Complete um contrato limpo para entrar no ciclo principal, fortalecer o seu posto e começar a sua ascensão.',
    onboardingButton: 'ENTRAR NA TORRE',
    submitPact: 'ENVIAR PACTO',
    loadSample: 'CARREGAR EXEMPLO',
    manual: 'MANUAL',
    syncQueue: 'SINCRONIZAR FILA',
    terminalUpgrades: 'MELHORIAS DO TERMINAL',
    lockTerminal: 'BLOQUEAR TERMINAL',
    missionTitle: 'MISSÃO ATIVA',
    statusLabel: 'ESTADO',
    operatorInsight: 'VISÃO DO OPERADOR',
    guidance: 'ORIENTAÇÃO OPERATIVA',
    howToUse: 'COMO USAR O SISTEMA',
    commandAccess: 'ACESSO DE COMANDO',
    languageLabel: 'IDIOMA DO SISTEMA',
    languageHint: 'Altere o idioma da interface do terminal.',
    sampleHint: 'Comece com um resultado concreto e um progresso mensurável.',
  },
  de: {
    onboardingTitle: 'WILLKOMMEN IM TURM.',
    onboardingBody: 'Das System ist bereit, Ihren ersten Pakt zu empfangen. Schließen Sie einen sauberen Vertrag ab, um in den Kernzyklus einzutreten, Ihren Rang zu stärken und Ihren Aufstieg zu beginnen.',
    onboardingButton: 'IN DEN TURM EINTRETEN',
    submitPact: 'PAKT SENDEN',
    loadSample: 'BEISPIEL LADEN',
    manual: 'HANDBUCH',
    syncQueue: 'WARTEQUEUE SYNCHRONISIEREN',
    terminalUpgrades: 'TERMINAL-ERWEITERUNGEN',
    lockTerminal: 'TERMINAL SPERREN',
    missionTitle: 'AKTIVE MISSION',
    statusLabel: 'STATUS',
    operatorInsight: 'OPERATORENSICHT',
    guidance: 'OPERATIVE ANLEITUNG',
    howToUse: 'SO BENUTZEN SIE DAS SYSTEM',
    commandAccess: 'KOMMANDOZUGANG',
    languageLabel: 'SYSTEMSPRACHE',
    languageHint: 'Ändern Sie die Sprache der Terminaloberfläche.',
    sampleHint: 'Beginnen Sie mit einem konkreten Ergebnis und messbarem Fortschritt.',
  },
  ru: {
    onboardingTitle: 'ДОБРО ПОЖАЛОВАТЬ В БАШНЮ.',
    onboardingBody: 'Система готова принять ваш первый пакт. Выполните чистый контракт, чтобы войти в центральный цикл, укрепить свой ранг и начать восхождение.',
    onboardingButton: 'ВОЙТИ В БАШНЮ',
    submitPact: 'ОТПРАВИТЬ ПАКТ',
    loadSample: 'ЗАГРУЗИТЬ ПРИМЕР',
    manual: 'РУКОВОДСТВО',
    syncQueue: 'СИНХРОНИЗИРОВАТЬ ОЧЕРЕДЬ',
    terminalUpgrades: 'УЛУЧШЕНИЯ ТЕРМИНАЛА',
    lockTerminal: 'ЗАБЛОКИРОВАТЬ ТЕРМИНАЛ',
    missionTitle: 'АКТИВНАЯ МИССИЯ',
    statusLabel: 'СТАТУС',
    operatorInsight: 'ВЗГЛЯД ОПЕРАТОРА',
    guidance: 'ОПЕРАТИВНОЕ НАПРАВЛЕНИЕ',
    howToUse: 'КАК ИСПОЛЬЗОВАТЬ СИСТЕМУ',
    commandAccess: 'КОМАНДНЫЙ ДОСТУП',
    languageLabel: 'ЯЗЫК СИСТЕМЫ',
    languageHint: 'Измените язык интерфейса терминала.',
    sampleHint: 'Начните с конкретного результата и измеримого прогресса.',
  },
  zh: {
    onboardingTitle: '欢迎来到高塔。',
    onboardingBody: '系统已准备好接收你的第一个契约。完成一个干净的合同，进入核心循环，提升你的等级，并开始你的攀升。',
    onboardingButton: '进入高塔',
    submitPact: '提交契约',
    loadSample: '加载示例',
    manual: '手册',
    syncQueue: '同步队列',
    terminalUpgrades: '终端升级',
    lockTerminal: '锁定终端',
    missionTitle: '当前任务',
    statusLabel: '状态',
    operatorInsight: '操作员洞察',
    guidance: '作战指导',
    howToUse: '如何使用本系统',
    commandAccess: '指挥访问',
    languageLabel: '系统语言',
    languageHint: '切换终端界面使用的语言。',
    sampleHint: '从具体结果和可衡量进度开始。',
  },
  ja: {
    onboardingTitle: 'タワーへようこそ。',
    onboardingBody: 'システムは最初の誓約を受け付ける準備ができています。きれいな契約を完了してコアループに入り、階級を強化し、上昇を始めましょう。',
    onboardingButton: 'タワーへ入る',
    submitPact: '誓約を送信',
    loadSample: 'サンプルを読み込む',
    manual: 'マニュアル',
    syncQueue: '同期キュー',
    terminalUpgrades: 'ターミナル強化',
    lockTerminal: 'ターミナルをロック',
    missionTitle: 'アクティブミッション',
    statusLabel: 'ステータス',
    operatorInsight: 'オペレーターインサイト',
    guidance: '作戦ガイダンス',
    howToUse: 'システムの使い方',
    commandAccess: 'コマンドアクセス',
    languageLabel: 'システム言語',
    languageHint: 'ターミナルの表示言語を切り替えます。',
    sampleHint: '具体的な成果と測定可能な進捗から始めます。',
  },
  ro: {
    onboardingTitle: 'BINE AȚI VENIT ÎN TURN.',
    onboardingBody: 'Sistemul este gata să primească primul pact. Finalizați un contract curat pentru a intra în bucla centrală, a vă consolida rangul și a începe ascensiunea.',
    onboardingButton: 'INTRAȚI ÎN TURN',
    submitPact: 'TRIMITE PACTUL',
    loadSample: 'ÎNCARCA EXEMPLU',
    manual: 'MANUAL',
    syncQueue: 'COADĂ DE SINCRONIZARE',
    terminalUpgrades: 'ÎMBUNĂTĂȚIRI TERMINAL',
    lockTerminal: 'BLOCARE TERMINAL',
    missionTitle: 'MISIUNE ACTIVĂ',
    statusLabel: 'STARE',
    operatorInsight: 'PERSPECTIVA OPERATORULUI',
    guidance: 'GHID OPERAȚIONAL',
    howToUse: 'CUM SE FOLOSEȘTE SISTEMUL',
    commandAccess: 'ACCES DE COMANDĂ',
    languageLabel: 'LIMBA SISTEMULUI',
    languageHint: 'Schimbați limba interfeței terminalului.',
    sampleHint: 'Începeți cu un rezultat concret și un progres măsurabil.',
  },
  ar: {
    onboardingTitle: 'مرحبًا بكم في البرج.',
    onboardingBody: 'النظام جاهز لاستقبال أول pact. أكمل عقدًا نظيفًا للدخول في الحلقة المركزية، وتعزيز رتبتك، والبدء في الصعود.',
    onboardingButton: 'الدخول إلى البرج',
    submitPact: 'إرسال الاتفاق',
    loadSample: 'تحميل مثال',
    manual: 'دليل',
    syncQueue: 'قائمة المزامنة',
    terminalUpgrades: 'ترقيات الطرفية',
    lockTerminal: 'قفل الطرفية',
    missionTitle: 'المهمة النشطة',
    statusLabel: 'الحالة',
    operatorInsight: 'رؤية المشغل',
    guidance: 'إرشادات تشغيلية',
    howToUse: 'كيف تستخدم النظام',
    commandAccess: 'الوصول إلى القيادة',
    languageLabel: 'لغة النظام',
    languageHint: 'غيّر لغة واجهة الطرفية.',
    sampleHint: 'ابدأ بنتيجة concrete ومقدمة قابلة للقياس.',
  },
  hi: {
    onboardingTitle: 'टॉवर में आपका स्वागत है।',
    onboardingBody: 'सिस्टम आपके पहले pact को स्वीकार करने के लिए तैयार है। केंद्रीय लूप में प्रवेश करने, अपनी रैंक मजबूत करने और अपनी चढ़ाई शुरू करने के लिए एक साफ अनुबंध पूरा करें।',
    onboardingButton: 'टॉवर में प्रवेश करें',
    submitPact: 'पैक्ट जमा करें',
    loadSample: 'नमूना लोड करें',
    manual: 'मैनुअल',
    syncQueue: 'सिंक कतार',
    terminalUpgrades: 'टर्मिनल अपग्रेड',
    lockTerminal: 'टर्मिनल लॉक करें',
    missionTitle: 'सक्रिय मिशन',
    statusLabel: 'स्थिति',
    operatorInsight: 'ऑपरेटर इनसाइट',
    guidance: 'ऑपरेटिव गाइडेंस',
    howToUse: 'सिस्टम का उपयोग कैसे करें',
    commandAccess: 'कमांड एक्सेस',
    languageLabel: 'सिस्टम भाषा',
    languageHint: 'टर्मिनल इंटरफ़ेस की भाषा बदलें।',
    sampleHint: 'एक ठोस परिणाम और मापने योग्य प्रगति से शुरुआत करें।',
  },
  ko: {
    onboardingTitle: '타워에 오신 것을 환영합니다.',
    onboardingBody: '시스템이 첫 번째 pact를 받을 준비가 되었습니다. 핵심 루프에 진입하고, 계급을 강화하고, 상승을 시작하기 위해 깔끔한 계약을 완료하세요.',
    onboardingButton: '타워 입장',
    submitPact: '계약 제출',
    loadSample: '샘플 불러오기',
    manual: '매뉴얼',
    syncQueue: '동기화 대기열',
    terminalUpgrades: '터미널 업그레이드',
    lockTerminal: '터미널 잠금',
    missionTitle: '활성 미션',
    statusLabel: '상태',
    operatorInsight: '운영자 인사이트',
    guidance: '운영 가이드',
    howToUse: '시스템 사용 방법',
    commandAccess: '명령 접근',
    languageLabel: '시스템 언어',
    languageHint: '터미널 인터페이스 언어를 전환합니다.',
    sampleHint: '구체적인 결과와 측정 가능한 진척으로 시작하세요.',
  },
  it: {
    onboardingTitle: 'BENVENUTO NELLA TORRE.',
    onboardingBody: 'Il sistema è pronto a ricevere il tuo primo patto. Completa un contratto pulito per entrare nel ciclo centrale, rafforzare il tuo rango e iniziare la tua ascesa.',
    onboardingButton: 'ENTRA NELLA TORRE',
    submitPact: 'INVIA PATTO',
    loadSample: 'CARICA ESEMPIO',
    manual: 'MANUALE',
    syncQueue: 'CODA DI SINCRONIZZAZIONE',
    terminalUpgrades: 'MIGLIORAMENTI TERMINAL',
    lockTerminal: 'BLOCCA TERMINAL',
    missionTitle: 'MISSIONE ATTIVA',
    statusLabel: 'STATO',
    operatorInsight: 'INTUITIONE DELL’OPERATORE',
    guidance: 'GUIDA OPERATIVA',
    howToUse: 'COME USARE IL SISTEMA',
    commandAccess: 'ACCESSO COMANDO',
    languageLabel: 'LINGUA DEL SISTEMA',
    languageHint: 'Cambia la lingua dell’interfaccia del terminale.',
    sampleHint: 'Inizia con un risultato concreto e un progresso misurabile.',
  },
} as const;

export const getSupportedLanguages = () => SUPPORTED_LANGUAGES;

export const getStoredLanguage = async (): Promise<SupportedLanguage> => {
  try {
    const value = await AsyncStorage.getItem(LANGUAGE_STORAGE_KEY);
    return (value as SupportedLanguage | null) ?? 'en';
  } catch {
    return 'en';
  }
};

export const setStoredLanguage = async (language: SupportedLanguage): Promise<void> => {
  try {
    await AsyncStorage.setItem(LANGUAGE_STORAGE_KEY, language);
  } catch {
    // ignore storage failures
  }
};

export const getLocalizedText = (key: keyof typeof translations.en, language: SupportedLanguage = 'en') => {
  return translations[language][key] ?? translations.en[key];
};

export const getLanguageLabel = (language: SupportedLanguage) => {
  return SUPPORTED_LANGUAGES.find((item) => item.code === language)?.label ?? 'English';
};
=======
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
>>>>>>> 2f1cd419750ef14ad65a62a00c79510454ca7b37
