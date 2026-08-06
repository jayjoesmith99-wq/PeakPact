<<<<<<< HEAD
export const formatMissionCountdown = (deadline: string | number, now: number = Date.now()): string => {
  const deadlineMs = typeof deadline === 'number' ? deadline : Date.parse(deadline);
  const remainingMs = Math.max(0, deadlineMs - now);
  const totalSeconds = Math.floor(remainingMs / 1000);
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;

  return [hours, minutes, seconds].map((value) => String(value).padStart(2, '0')).join(':');
};
=======
export function formatMissionCountdown(activePactDeadline: string) {
  const deadline = Date.parse(activePactDeadline);
  const delta = Math.max(0, deadline - Date.now());
  const hours = Math.floor(delta / 3600000);
  const minutes = Math.floor((delta % 3600000) / 60000);
  const seconds = Math.floor((delta % 60000) / 1000);
  return [hours, minutes, seconds].map((value) => String(value).padStart(2, "0")).join(":");
}
>>>>>>> 2f1cd419750ef14ad65a62a00c79510454ca7b37
