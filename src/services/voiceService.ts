export async function createVoicePayload(text: string, type: string) {
  return { text, type, timestamp: new Date().toISOString() };
}

export async function startVoiceRecording() {
  return;
}

export async function stopVoiceRecording() {
  return null;
}

export async function transcribeAudio(uri: string) {
  return "";
}

export async function uploadVoicePayload(payload: unknown) {
  return;
}
