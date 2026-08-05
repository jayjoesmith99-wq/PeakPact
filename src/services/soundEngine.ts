/**
 * SoundEngine — cross-platform audio for PeakPact button feedback.
 *
 * Web:    Web Audio API synthesis (no files, no autoplay restrictions after
 *         first gesture, true zero-latency).
 * Native: expo-av with preloaded WAV assets + playsInSilentModeIOS: true
 *         (bypasses iOS physical silent switch; Android has no equivalent).
 *
 * Sounds are keyed to DesignTemplateId so each template's press physics
 * has a matched sonic signature.
 */

import { Audio } from 'expo-av';
import { Platform } from 'react-native';
import type { DesignTemplateId } from './designTemplates';

// ─── Asset map (used only on native) ──────────────────────────────────────

const ASSETS: Record<DesignTemplateId, ReturnType<typeof require>> = {
  'core':                  require('../../assets/sounds/click-core.wav'),
  'terminal-cyber-dungeon':require('../../assets/sounds/click-terminal.wav'),
  'mecha-hud-pilot':       require('../../assets/sounds/click-mecha.wav'),
  'litrpg-stat-sheet':     require('../../assets/sounds/click-litrpg.wav'),
  'apex-megacorp-os':      require('../../assets/sounds/click-apex.wav'),
};

// ─── Native state ─────────────────────────────────────────────────────────

const nativePool: Partial<Record<DesignTemplateId, Audio.Sound>> = {};
let nativeReady = false;

// ─── Web state ────────────────────────────────────────────────────────────

let webCtx: AudioContext | null = null;

function getCtx(): AudioContext | null {
  if (Platform.OS !== 'web') return null;
  if (typeof window === 'undefined' || !('AudioContext' in window || 'webkitAudioContext' in window)) return null;
  if (!webCtx) {
    const Ctor = window.AudioContext ?? (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    webCtx = new Ctor();
  }
  if (webCtx.state === 'suspended') {
    void webCtx.resume();
  }
  return webCtx;
}

// ─── Web synthesisers — one per template ──────────────────────────────────

const τ = Math.PI * 2;

function webSynth(
  ctx: AudioContext,
  durationS: number,
  build: (ctx: AudioContext, now: number, dest: AudioNode) => void,
): void {
  const master = ctx.createGain();
  master.gain.setValueAtTime(1, ctx.currentTime);
  master.connect(ctx.destination);
  build(ctx, ctx.currentTime, master);
  // auto-disconnect after sound finishes
  setTimeout(() => master.disconnect(), (durationS + 0.05) * 1000);
}

function webCore(ctx: AudioContext): void {
  webSynth(ctx, 0.085, (ctx, now, dest) => {
    const env = ctx.createGain();
    env.gain.setValueAtTime(0, now);
    env.gain.linearRampToValueAtTime(0.88, now + 0.0025);
    env.gain.exponentialRampToValueAtTime(0.001, now + 0.085);
    env.connect(dest);

    const osc1 = ctx.createOscillator();
    osc1.type = 'sine'; osc1.frequency.value = 420;
    osc1.connect(env); osc1.start(now); osc1.stop(now + 0.085);

    const g2 = ctx.createGain();
    g2.gain.setValueAtTime(0.42, now);
    g2.gain.exponentialRampToValueAtTime(0.001, now + 0.04);
    g2.connect(dest);
    const osc2 = ctx.createOscillator();
    osc2.type = 'sine'; osc2.frequency.value = 3200;
    osc2.connect(g2); osc2.start(now); osc2.stop(now + 0.04);
  });
}

function webTerminal(ctx: AudioContext): void {
  // FM synthesis: carrier 2400 Hz, modulator 220 Hz, index 8 → noise-like
  webSynth(ctx, 0.065, (ctx, now, dest) => {
    const env = ctx.createGain();
    env.gain.setValueAtTime(0.92, now);
    env.gain.exponentialRampToValueAtTime(0.001, now + 0.065);
    env.connect(dest);

    const mod = ctx.createOscillator();
    mod.frequency.value = 220;
    const modGain = ctx.createGain();
    modGain.gain.value = 2400 * 8; // FM index × carrier freq
    mod.connect(modGain);

    const car = ctx.createOscillator();
    car.type = 'sine';
    car.frequency.value = 2400;
    modGain.connect(car.frequency);
    car.connect(env); mod.start(now); car.start(now);
    mod.stop(now + 0.065); car.stop(now + 0.065);

    const bite = ctx.createOscillator();
    bite.frequency.value = 4800;
    const biteEnv = ctx.createGain();
    biteEnv.gain.setValueAtTime(0.32, now);
    biteEnv.gain.exponentialRampToValueAtTime(0.001, now + 0.03);
    bite.connect(biteEnv); biteEnv.connect(dest);
    bite.start(now); bite.stop(now + 0.03);
  });
}

function webMecha(ctx: AudioContext): void {
  webSynth(ctx, 0.21, (ctx, now, dest) => {
    // sub-bass thud: 68 Hz + harmonics
    const mainEnv = ctx.createGain();
    mainEnv.gain.setValueAtTime(0.72, now);
    mainEnv.gain.exponentialRampToValueAtTime(0.001, now + 0.21);
    mainEnv.connect(dest);

    [68, 136, 204].forEach((freq, i) => {
      const g = [1, 0.38, 0.14][i];
      const osc = ctx.createOscillator();
      osc.type = 'sine'; osc.frequency.value = freq;
      const gain = ctx.createGain(); gain.gain.value = g;
      osc.connect(gain); gain.connect(mainEnv);
      osc.start(now); osc.stop(now + 0.21);
    });

    // metal click transient
    const metalEnv = ctx.createGain();
    metalEnv.gain.setValueAtTime(0.28, now);
    metalEnv.gain.exponentialRampToValueAtTime(0.001, now + 0.04);
    metalEnv.connect(dest);
    const metal = ctx.createOscillator();
    metal.type = 'sine'; metal.frequency.value = 920;
    metal.connect(metalEnv); metal.start(now); metal.stop(now + 0.04);
  });
}

function webLitrpg(ctx: AudioContext): void {
  webSynth(ctx, 0.052, (ctx, now, dest) => {
    const env = ctx.createGain();
    env.gain.setValueAtTime(0.90, now);
    env.gain.exponentialRampToValueAtTime(0.001, now + 0.052);
    env.connect(dest);

    const high = ctx.createOscillator();
    high.frequency.value = 1850;
    const hg = ctx.createGain(); hg.gain.value = 0.62;
    high.connect(hg); hg.connect(env); high.start(now); high.stop(now + 0.052);

    const snap = ctx.createOscillator();
    snap.frequency.value = 3700;
    const sg = ctx.createGain();
    sg.gain.setValueAtTime(0.38, now);
    sg.gain.exponentialRampToValueAtTime(0.001, now + 0.018);
    snap.connect(sg); sg.connect(dest); snap.start(now); snap.stop(now + 0.018);
  });
}

function webApex(ctx: AudioContext): void {
  webSynth(ctx, 0.135, (ctx, now, dest) => {
    const env = ctx.createGain();
    env.gain.setValueAtTime(0, now);
    env.gain.linearRampToValueAtTime(0.60, now + 0.006);
    env.gain.exponentialRampToValueAtTime(0.001, now + 0.135);
    env.connect(dest);

    // Exponential frequency sweep 700 → 90 Hz using setValueCurve
    const steps = 64;
    const curve = new Float32Array(steps);
    for (let i = 0; i < steps; i++) {
      curve[i] = 700 * Math.exp(-Math.log(700 / 90) * (i / (steps - 1)));
    }
    const osc = ctx.createOscillator();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(700, now);
    osc.frequency.setValueCurveAtTime(curve, now, 0.135);
    osc.connect(env); osc.start(now); osc.stop(now + 0.135);

    // sub layer at half frequency
    const sub = ctx.createOscillator();
    sub.type = 'sine';
    sub.frequency.setValueAtTime(350, now);
    sub.frequency.setValueCurveAtTime(curve.map((v) => v * 0.5), now, 0.135);
    const subGain = ctx.createGain(); subGain.gain.value = 0.18;
    sub.connect(subGain); subGain.connect(env);
    sub.start(now); sub.stop(now + 0.135);
  });
}

const WEB_SYNTHS: Record<DesignTemplateId, (ctx: AudioContext) => void> = {
  'core':                   webCore,
  'terminal-cyber-dungeon': webTerminal,
  'mecha-hud-pilot':        webMecha,
  'litrpg-stat-sheet':      webLitrpg,
  'apex-megacorp-os':       webApex,
};

// ─── Public API ───────────────────────────────────────────────────────────

/**
 * Call once at app start (after mounting) to:
 * - Configure the iOS audio session to bypass the physical silent switch
 * - Preload all 5 sounds into memory on native for zero-latency playback
 */
export async function initAudio(): Promise<void> {
  if (Platform.OS === 'web') return; // web uses lazy AudioContext
  if (nativeReady) return;

  try {
    await Audio.setAudioModeAsync({
      playsInSilentModeIOS: true,   // bypass iOS silent switch
      staysActiveInBackground: false,
      allowsRecordingIOS: false,
    });

    await Promise.all(
      (Object.keys(ASSETS) as DesignTemplateId[]).map(async (id) => {
        const { sound } = await Audio.Sound.createAsync(ASSETS[id], {
          shouldPlay: false,
          volume: 0.9,
          isLooping: false,
        });
        nativePool[id] = sound;
      }),
    );

    nativeReady = true;
  } catch {
    // audio is enhancement-only; never block app startup
  }
}

/**
 * Play the sound matched to the active template.
 * Called on press-in (the moment the scale animation starts compressing).
 */
export function playTemplateSound(templateId: DesignTemplateId): void {
  if (Platform.OS === 'web') {
    const ctx = getCtx();
    if (!ctx) return;
    try {
      WEB_SYNTHS[templateId]?.(ctx);
    } catch { /* ignore */ }
    return;
  }

  const sound = nativePool[templateId];
  if (!sound) return;
  // fire-and-forget; never await on the press handler hot path
  void sound.setPositionAsync(0).then(() => sound.playAsync()).catch(() => {});
}

/** Call on app unmount to release native audio resources. */
export function unloadAudio(): void {
  Object.values(nativePool).forEach((s) => void s?.unloadAsync().catch(() => {}));
}

// ── Boot sequence sounds ───────────────────────────────────────────────────

function webBootCrack(ctx: AudioContext): void {
  webSynth(ctx, 0.10, (ctx, now, dest) => {
    const env = ctx.createGain();
    env.gain.setValueAtTime(1.0, now);
    env.gain.exponentialRampToValueAtTime(0.001, now + 0.10);
    env.connect(dest);
    // Heavy FM noise burst — high modulation index creates electrical character
    const mod = ctx.createOscillator();
    mod.frequency.value = 280;
    const modGain = ctx.createGain();
    modGain.gain.value = 14000;
    mod.connect(modGain);
    const car = ctx.createOscillator();
    car.frequency.value = 11000;
    modGain.connect(car.frequency);
    car.connect(env);
    mod.start(now); car.start(now);
    mod.stop(now + 0.10); car.stop(now + 0.10);
    // High transient bite layer
    const bite = ctx.createOscillator();
    bite.frequency.value = 6200;
    const bEnv = ctx.createGain();
    bEnv.gain.setValueAtTime(0.55, now);
    bEnv.gain.exponentialRampToValueAtTime(0.001, now + 0.035);
    bite.connect(bEnv); bEnv.connect(dest);
    bite.start(now); bite.stop(now + 0.035);
  });
}

/** Electrical CRT crack for the boot void phase. */
export function playBootCrack(): void {
  if (Platform.OS === 'web') {
    const ctx = getCtx();
    if (!ctx) return;
    try { webBootCrack(ctx); } catch { /* ignore */ }
    return;
  }
  playTemplateSound('terminal-cyber-dungeon');
}

/** Sub-bass thud for the ring reveal moment. */
export function playBootThud(): void {
  if (Platform.OS === 'web') {
    const ctx = getCtx();
    if (!ctx) return;
    try { webMecha(ctx); } catch { /* ignore */ }
    return;
  }
  playTemplateSound('mecha-hud-pilot');
}
