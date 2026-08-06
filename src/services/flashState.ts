<<<<<<< HEAD
export type RedFlashState = {
  redState: boolean;
  flashSuppressed: boolean;
  offline: boolean;
  levelFlash: boolean;
};

export type RecoveryVisualState = {
  isRecoveryVisualActive: boolean;
  accentTone: 'neutral' | 'calm' | 'alert';
};

export const isRedFlashActive = ({ redState, flashSuppressed, offline, levelFlash }: RedFlashState) => {
  if (!redState || flashSuppressed) {
    return false;
  }

  return offline || levelFlash;
};

export const shouldPulseRedFlash = ({ redState, flashSuppressed }: Pick<RedFlashState, 'redState' | 'flashSuppressed'>) => {
  return redState && !flashSuppressed;
};

export const getRecoveryVisualState = ({
  redState,
  flashSuppressed,
  recoveryWindowActive,
}: Pick<RedFlashState, 'redState' | 'flashSuppressed'> & { recoveryWindowActive?: boolean }): RecoveryVisualState => {
  if (!redState) {
    return { isRecoveryVisualActive: false, accentTone: 'neutral' };
  }

  if (flashSuppressed && recoveryWindowActive) {
    return { isRecoveryVisualActive: true, accentTone: 'calm' };
  }

  return { isRecoveryVisualActive: false, accentTone: 'alert' };
};
=======
export function getRecoveryVisualState({ redState, flashSuppressed, recoveryWindowActive, }: { redState: boolean; flashSuppressed: boolean; recoveryWindowActive: boolean; }) {
  return {
    isRecoveryVisualActive: redState && flashSuppressed,
  };
}

export function isRedFlashActive({ redState, flashSuppressed, offline, levelFlash, }: { redState: boolean; flashSuppressed: boolean; offline: boolean; levelFlash: boolean; }) {
  return redState && !flashSuppressed;
}

export function shouldPulseRedFlash({ redState, flashSuppressed, }: { redState: boolean; flashSuppressed: boolean; }) {
  return redState && !flashSuppressed;
}
>>>>>>> 2f1cd419750ef14ad65a62a00c79510454ca7b37
