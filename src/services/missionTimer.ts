export function isPactExpired(deadline: string, nowMs = Date.now()): boolean {
  const deadlineMs = Number.isFinite(Date.parse(deadline)) ? Date.parse(deadline) : Number.NaN;
  if (!Number.isFinite(deadlineMs)) {
    return false;
  }

  return deadlineMs <= nowMs;
}

export function formatMissionCountdown(activePactDeadline: string) {
  const deadline = Number.isFinite(Date.parse(activePactDeadline)) ? Date.parse(activePactDeadline) : Number.NaN;
  if (!Number.isFinite(deadline)) {
    return '00:00:00';
  }

  const delta = Math.max(0, deadline - Date.now());
  const hours = Math.floor(delta / 3600000);
  const minutes = Math.floor((delta % 3600000) / 60000);
  const seconds = Math.floor((delta % 60000) / 1000);
  return [hours, minutes, seconds].map((value) => String(value).padStart(2, '0')).join(':');
}
