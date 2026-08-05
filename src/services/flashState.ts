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
