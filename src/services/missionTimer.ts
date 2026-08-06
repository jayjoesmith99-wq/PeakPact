export function formatMissionCountdown(activePactDeadline: string) {
  const deadline = Date.parse(activePactDeadline);
  const delta = Math.max(0, deadline - Date.now());
  const hours = Math.floor(delta / 3600000);
  const minutes = Math.floor((delta % 3600000) / 60000);
  const seconds = Math.floor((delta % 60000) / 1000);
  return [hours, minutes, seconds].map((value) => String(value).padStart(2, "0")).join(":");
}
