export const formatMissionCountdown = (deadline: string | number, now: number = Date.now()): string => {
  const deadlineMs = typeof deadline === 'number' ? deadline : Date.parse(deadline);
  const remainingMs = Math.max(0, deadlineMs - now);
  const totalSeconds = Math.floor(remainingMs / 1000);
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;

  return [hours, minutes, seconds].map((value) => String(value).padStart(2, '0')).join(':');
};
