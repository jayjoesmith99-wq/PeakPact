export const resolveAuthVideoMuted = (): boolean => {
  const rawValue = process.env.EXPO_PUBLIC_AUTH_GATE_VIDEO_MUTED;
  if (!rawValue) {
    return false;
  }

  return rawValue.toLowerCase() === 'true' || rawValue === '1';
};
