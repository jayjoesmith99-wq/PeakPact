<<<<<<< HEAD
import { AudioEpisode } from '../types';
import { type SupportedLanguage } from './i18n';

const episodeTitles: Record<SupportedLanguage, string[]> = {
  en: [
    'THE AWAKENING',
    'SIGNAL IN THE VOID',
    'RED STATE PROTOCOL',
    'THE FIRST PACT',
    'CORRUPTED SECTOR',
    'DATA RESILIENCY',
    "THE OVERSEER'S DECREE",
    'FLOOR SCALING',
    'TERMINAL VELOCITY',
    'THE BREAKING POINT',
    'SYSTEM OVERRIDE',
    'PEAK PROTOCOL',
  ],
  es: [
    'EL DESPERTAR',
    'SEÑAL EN EL VACÍO',
    'PROTOCOLO DE ESTADO ROJO',
    'EL PRIMER PACTO',
    'SECTOR CORRUPTO',
    'RESILIENCIA DE DATOS',
    'EL DECRETO DEL SUPERVISOR',
    'ESCALADO DE PISOS',
    'VELOCIDAD DE TERMINAL',
    'EL PUNTO DE ROTURA',
    'SOBREESCRITURA DEL SISTEMA',
    'PROTOCOLO DE CIMA',
  ],
  fr: [
    'THE AWAKENING',
    'SIGNAL IN THE VOID',
    'RED STATE PROTOCOL',
    'THE FIRST PACT',
    'CORRUPTED SECTOR',
    'DATA RESILIENCY',
    "THE OVERSEER'S DECREE",
    'FLOOR SCALING',
    'TERMINAL VELOCITY',
    'THE BREAKING POINT',
    'SYSTEM OVERRIDE',
    'PEAK PROTOCOL',
  ],
  pt: [
    'O DESPERTAR',
    'SINAL NO VAZIO',
    'PROTOCOLO DE ESTADO VERMELHO',
    'O PRIMEIRO PACTO',
    'SECTOR CORRUPTO',
    'RESILIÊNCIA DE DADOS',
    'O DECRETO DO SUPERVISOR',
    'ESCALA DE ANDARES',
    'VELOCIDADE DO TERMINAL',
    'O PONTO DE RUPTURA',
    'SOBREPOSIÇÃO DO SISTEMA',
    'PROTOCOLO DE PICO',
  ],
  de: [
    'DIE ERWECKUNG',
    'SIGNAL IM LEEREN',
    'ROTER STATUS-PROTOKOLL',
    'DER ERSTE PAKT',
    'KORRUPTER SEKTOR',
    'DATENWIDERSTANDSFÄHIGKEIT',
    'DER BESCHLUSS DES AUFSEHERS',
    'ETAGEN-SKALIERUNG',
    'TERMINAL-GESCHWINDIGKEIT',
    'DER BRECHPUNKT',
    'SYSTEMÜBERSCHREIBUNG',
    'GIPFELPROTOKOLL',
  ],
  ru: [
    'THE AWAKENING',
    'SIGNAL IN THE VOID',
    'RED STATE PROTOCOL',
    'THE FIRST PACT',
    'CORRUPTED SECTOR',
    'DATA RESILIENCY',
    "THE OVERSEER'S DECREE",
    'FLOOR SCALING',
    'TERMINAL VELOCITY',
    'THE BREAKING POINT',
    'SYSTEM OVERRIDE',
    'PEAK PROTOCOL',
  ],
  ro: [
    'TREZIREA',
    'SEMNAL ÎN VID',
    'PROTOCOL STARE ROȘIE',
    'PRIMUL PACT',
    'SECTOR CORUPT',
    'REZILIENȚA DATELOR',
    'DECRETUL SUPERVIZORULUI',
    'SCALAREA ETAJELOR',
    'VELOCITATEA TERMINALULUI',
    'PUNCTUL DE RUPTURĂ',
    'SUPRASCRIBEREA SISTEMULUI',
    'PROTOCOLUL VÂRFULUI',
  ],
  ar: [
    'الاستيقاظ',
    'إشارة في الفراغ',
    'بروتوكول الحالة الحمراء',
    'الاتفاق الأول',
    'القطاع الفاسد',
    'مرونة البيانات',
    'مرسوم المشرف',
    'تدرج الطوابق',
    'سرعة الطرفية',
    'نقطة الانكسار',
    'كتابة النظام فوق بعضها',
    'بروتوكول القمة',
  ],
  hi: [
    'जागरण',
    'खालीपन में संकेत',
    'लाल स्थिति प्रोटोकॉल',
    'पहला pact',
    'दूषित क्षेत्र',
    'डेटा लचीलापन',
    'सुपरवाइज़र का आदेश',
    'मंजिलों का स्केलिंग',
    'टर्मिनल वेग',
    'विभाजन बिंदु',
    'सिस्टम ओवरराइट',
    'पीक प्रोटोकॉल',
  ],
  ko: [
    '각성',
    '공허 속의 신호',
    '레드 스테이트 프로토콜',
    '첫 번째 pact',
    '손상된 섹터',
    '데이터 복원력',
    '감독자의 명령',
    '층 확장',
    '터미널 속도',
    '파괴 지점',
    '시스템 재정의',
    '피크 프로토콜',
  ],
  it: [
    'IL RISVEGLIO',
    'SEGNALI NEL VUOTO',
    'PROTOCOLLO STATO ROSSO',
    'IL PRIMO PATTO',
    'SETTORE CORROTTO',
    'RESILIENZA DEI DATI',
    'IL DECRETO DEL SUPERVISORE',
    'SCALATA DEI PIANI',
    'VELOCITÀ DEL TERMINALE',
    'IL PUNTO DI ROTTURA',
    'SOVRASCRITTURA DEL SISTEMA',
    'PROTOCOLLO DEL PICCO',
  ],
  zh: [
    '觉醒',
    '虚空中的信号',
    '红色状态协议',
    '第一个契约',
    '腐化扇区',
    '数据韧性',
    '监督者的法令',
    '层级扩展',
    '终端速度',
    '崩裂节点',
    '系统覆写',
    '巅峰协议',
  ],
  ja: [
    '覚醒',
    '虚空の信号',
    'レッドステートプロトコル',
    '最初の誓約',
    '汚染されたセクター',
    'データレジリエンス',
    '監督者の命令',
    'フロア拡張',
    'ターミナル・ベロシティ',
    '崩壊の瞬間',
    'システムオーバーライド',
    'ピークプロトコル',
  ],
};

const episodeUnlockLevels = [1, 3, 5, 8, 12, 17, 23, 30, 38, 47, 58, 99];

export const AUDIO_EPISODES: AudioEpisode[] = episodeTitles.en.map((title, index) => ({
  episodeNumber: index + 1,
  title: `EPISODE ${index + 1}: ${title}`,
  requiredLevel: episodeUnlockLevels[index] ?? 99,
  unlocked: false,
  audioUrl: `https://your-supabase-project.supabase.co/storage/v1/object/public/audio-drama/ep${index + 1}.mp3`,
}));

export const getUnlockedEpisodes = (userLevel: number, language: SupportedLanguage = 'en'): AudioEpisode[] =>
  AUDIO_EPISODES.map((episode, index) => ({
    ...episode,
    title: `${language === 'es' ? 'EPISODIO' : language === 'pt' ? 'EPISÓDIO' : language === 'de' ? 'EPISODE' : language === 'ro' ? 'EPISOD' : language === 'ar' ? 'حلقة' : language === 'hi' ? 'एपिसोड' : language === 'ko' ? '에피소드' : language === 'it' ? 'EPISODIO' : language === 'zh' ? '剧集' : language === 'ja' ? 'エピソード' : 'EPISODE'} ${index + 1}: ${episodeTitles[language][index]}`,
    unlocked: userLevel >= episode.requiredLevel,
  }));

export const getNewlyUnlockedEpisodes = (previousLevel: number, nextLevel: number, language: SupportedLanguage = 'en'): AudioEpisode[] =>
  getUnlockedEpisodes(nextLevel, language).filter((episode) => episode.unlocked && episode.requiredLevel > previousLevel);

export const getNarrativeProgress = (userLevel: number, language: SupportedLanguage = 'en') => {
  const episodes = getUnlockedEpisodes(userLevel, language);
  const unlockedCount = episodes.filter((episode) => episode.unlocked).length;
  const nextEpisode = episodes.find((episode) => !episode.unlocked) ?? null;

  return {
    episodes,
    unlockedCount,
    totalCount: episodes.length,
    nextEpisode,
  };
};
=======
export function getNarrativeProgress(level: number, language: string) {
  const total = 10;
  const unlocked = Math.min(total, Math.floor(level / 2));
  return {
    unlockedCount: unlocked,
    totalCount: total,
    episodes: Array.from({ length: total }, (_, index) => ({
      title: `Episode ${index + 1}`,
      requiredLevel: (index + 1) * 2,
      unlocked: index < unlocked,
    })),
  };
}

export function getNewlyUnlockedEpisodes(oldLevel: number, nextLevel: number, language: string) {
  if (nextLevel <= oldLevel) {
    return [];
  }
  return Array.from({ length: nextLevel - oldLevel }, (_, index) => ({
    title: `Episode ${oldLevel + index + 1}`,
    episodeNumber: oldLevel + index + 1,
  }));
}
>>>>>>> 2f1cd419750ef14ad65a62a00c79510454ca7b37
