import type { SupportedLanguage } from './index';

type EntryCopy = {
  badge: string;
  subtitle: string;
  signIn: string;
  signUp: string;
  email: string;
  password: string;
  processing: string;
  grantAccess: string;
  footer: string;
  chooseLanguage: string;
  languageSubtitle: string;
  selected: string;
  continue: string;
};

const entryCopy: Record<SupportedLanguage, EntryCopy> = {
  en: { badge: 'OPERATOR ACCESS', subtitle: 'Secure your command center and continue your pact.', signIn: 'SIGN IN', signUp: 'SIGN UP', email: 'EMAIL', password: 'PASSWORD', processing: 'PROCESSING...', grantAccess: 'GRANT ACCESS', footer: 'No codename required. Just secure access.', chooseLanguage: 'Choose your language', languageSubtitle: 'Language is applied before onboarding, welcome cinematic, and mission system.', selected: 'Selected', continue: 'Continue' },
  es: { badge: 'ACCESO DEL OPERADOR', subtitle: 'Asegura tu centro de mando y continúa tu pacto.', signIn: 'INICIAR SESIÓN', signUp: 'REGISTRARSE', email: 'CORREO', password: 'CONTRASEÑA', processing: 'PROCESANDO...', grantAccess: 'CONCEDER ACCESO', footer: 'No necesitas un nombre en clave. Solo acceso seguro.', chooseLanguage: 'Elige tu idioma', languageSubtitle: 'El idioma se aplica antes de la incorporación, la bienvenida cinematográfica y el sistema de misiones.', selected: 'Seleccionado', continue: 'Continuar' },
  fr: { badge: 'ACCÈS OPÉRATEUR', subtitle: 'Sécurisez votre centre de commande et poursuivez votre pacte.', signIn: 'SE CONNECTER', signUp: 'S’INSCRIRE', email: 'E-MAIL', password: 'MOT DE PASSE', processing: 'TRAITEMENT...', grantAccess: 'ACCORDER L’ACCÈS', footer: 'Aucun nom de code requis. Un accès sécurisé suffit.', chooseLanguage: 'Choisissez votre langue', languageSubtitle: 'La langue est appliquée avant l’accueil, le film de bienvenue et le système de missions.', selected: 'Sélectionné', continue: 'Continuer' },
  de: { badge: 'OPERATOR-ZUGANG', subtitle: 'Sichere dein Kommandozentrum und setze deinen Pakt fort.', signIn: 'ANMELDEN', signUp: 'REGISTRIEREN', email: 'E-MAIL', password: 'PASSWORT', processing: 'WIRD VERARBEITET...', grantAccess: 'ZUGANG GEWÄHREN', footer: 'Kein Codename erforderlich. Nur sicherer Zugang.', chooseLanguage: 'Sprache auswählen', languageSubtitle: 'Die Sprache wird vor Einführung, Begrüßungsfilm und Missionssystem angewendet.', selected: 'Ausgewählt', continue: 'Weiter' },
  pt: { badge: 'ACESSO DO OPERADOR', subtitle: 'Proteja seu centro de comando e continue seu pacto.', signIn: 'ENTRAR', signUp: 'CADASTRAR', email: 'E-MAIL', password: 'SENHA', processing: 'PROCESSANDO...', grantAccess: 'CONCEDER ACESSO', footer: 'Nenhum codinome é necessário. Apenas acesso seguro.', chooseLanguage: 'Escolha seu idioma', languageSubtitle: 'O idioma é aplicado antes da integração, do vídeo de boas-vindas e do sistema de missões.', selected: 'Selecionado', continue: 'Continuar' },
  ja: { badge: 'オペレーターアクセス', subtitle: 'コマンドセンターを保護し、契約を続けましょう。', signIn: 'ログイン', signUp: '登録', email: 'メール', password: 'パスワード', processing: '処理中...', grantAccess: 'アクセスを許可', footer: 'コードネームは不要です。安全なアクセスだけで始められます。', chooseLanguage: '言語を選択', languageSubtitle: '言語はオンボーディング、ウェルカム映像、ミッションシステムの前に適用されます。', selected: '選択中', continue: '続ける' },
  zh: { badge: '操作员访问', subtitle: '保护你的指挥中心，继续执行契约。', signIn: '登录', signUp: '注册', email: '邮箱', password: '密码', processing: '处理中...', grantAccess: '授予访问权限', footer: '无需代号，只需安全访问。', chooseLanguage: '选择你的语言', languageSubtitle: '语言会在引导、欢迎影片和任务系统之前应用。', selected: '已选择', continue: '继续' },
  ro: { badge: 'ACCES OPERATOR', subtitle: 'Securizează-ți centrul de comandă și continuă pactul.', signIn: 'AUTENTIFICARE', signUp: 'ÎNREGISTRARE', email: 'E-MAIL', password: 'PAROLĂ', processing: 'SE PROCESEAZĂ...', grantAccess: 'ACORDĂ ACCES', footer: 'Nu este necesar un nume de cod. Ai nevoie doar de acces securizat.', chooseLanguage: 'Alege limba', languageSubtitle: 'Limba se aplică înainte de onboarding, filmul de bun venit și sistemul de misiuni.', selected: 'Selectat', continue: 'Continuă' },
  it: { badge: 'ACCESSO OPERATORE', subtitle: 'Proteggi il tuo centro di comando e continua il tuo patto.', signIn: 'ACCEDI', signUp: 'REGISTRATI', email: 'E-MAIL', password: 'PASSWORD', processing: 'ELABORAZIONE...', grantAccess: 'CONCEDI ACCESSO', footer: 'Nessun nome in codice richiesto. Solo accesso sicuro.', chooseLanguage: 'Scegli la lingua', languageSubtitle: 'La lingua viene applicata prima dell’onboarding, del filmato di benvenuto e del sistema di missioni.', selected: 'Selezionato', continue: 'Continua' },
};

export function getEntryCopy(language: SupportedLanguage): EntryCopy {
  return entryCopy[language] ?? entryCopy.en;
}
