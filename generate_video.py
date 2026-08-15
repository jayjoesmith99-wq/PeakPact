import math
import wave
from pathlib import Path

import cv2
import numpy as np

W, H = 1080, 1920
FPS = 30
DURATION_SECONDS = 10.4
TOTAL_FRAMES = int(FPS * DURATION_SECONDS)

VIDEO_PATH = Path("assets/cinematic-boot-elite.mp4")
AUDIO_PATH = Path("assets/sounds/welcome-elite-v2.wav")


def smoothstep(edge0: float, edge1: float, x: np.ndarray) -> np.ndarray:
    t = np.clip((x - edge0) / (edge1 - edge0 + 1e-9), 0.0, 1.0)
    return t * t * (3.0 - 2.0 * t)


def synthesize_audio(path: Path, duration_seconds: float, sample_rate: int = 48000) -> None:
    n_samples = int(duration_seconds * sample_rate)
    t = np.arange(n_samples, dtype=np.float32) / sample_rate

    # Layered bed with restrained distortion for a cinematic "elite" tone.
    sub = np.sin(2.0 * np.pi * 46.0 * t + 0.12 * np.sin(2.0 * np.pi * 0.17 * t))
    body = 0.72 * np.sin(2.0 * np.pi * 92.0 * t + 0.08 * np.sin(2.0 * np.pi * 0.11 * t))
    grit = 0.32 * np.sin(2.0 * np.pi * 184.0 * t + 0.06 * np.sin(2.0 * np.pi * 0.09 * t))

    # High texture and air.
    rng = np.random.default_rng(11)
    noise = rng.normal(0.0, 0.04, n_samples).astype(np.float32)
    shaped_noise = np.convolve(noise, np.ones(9, dtype=np.float32) / 9.0, mode="same")

    # Riser for dramatic lock-in moment.
    f0 = 240.0
    f1 = 2200.0
    k = np.log(f1 / f0) / max(duration_seconds, 1e-6)
    phase = 2.0 * np.pi * f0 * (np.exp(k * t) - 1.0) / k
    riser = np.sin(phase) * np.clip((t - 3.0) / 6.8, 0.0, 1.0) * 0.20

    # Impact pulses synced to visual flashes.
    pulse_times = [1.9, 3.6, 7.7, 9.1]
    pulse = np.zeros_like(t)
    for p in pulse_times:
        env = np.exp(-((t - p) / 0.13) ** 2)
        pulse += env * (np.sin(2.0 * np.pi * 58.0 * t) + 0.55 * np.sin(2.0 * np.pi * 116.0 * t))
    pulse *= 0.35

    left = 0.38 * sub + 0.34 * body + 0.22 * grit + 0.24 * shaped_noise + riser + pulse
    right = (
        0.38 * np.sin(2.0 * np.pi * 46.0 * t + 0.22)
        + 0.34 * np.sin(2.0 * np.pi * 92.0 * t + 0.16)
        + 0.22 * np.sin(2.0 * np.pi * 184.0 * t + 0.09)
        + 0.24 * shaped_noise
        + 0.98 * riser
        + 0.95 * pulse
    )

    # Attack and release envelope.
    attack = np.clip(t / 0.35, 0.0, 1.0)
    release = np.clip((duration_seconds - t) / 0.9, 0.0, 1.0)
    amp_env = attack * release
    left *= amp_env
    right *= amp_env

    # Gentle mastering limiter.
    stereo = np.stack([left, right], axis=1)
    stereo = np.tanh(stereo * 1.7) * 0.92
    pcm = (stereo * 32767.0).astype(np.int16)

    path.parent.mkdir(parents=True, exist_ok=True)
    with wave.open(str(path), "wb") as wav_file:
        wav_file.setnchannels(2)
        wav_file.setsampwidth(2)
        wav_file.setframerate(sample_rate)
        wav_file.writeframes(pcm.tobytes())


def make_frame(t: float, xs: np.ndarray, ys: np.ndarray, r: np.ndarray, theta: np.ndarray) -> np.ndarray:
    # Dark emerald cinematic gradient and moving energy field.
    base = np.zeros((H, W, 3), dtype=np.float32)
    vignette = np.clip(1.0 - (r * 1.08) ** 1.55, 0.0, 1.0)

    field_a = np.sin(14.0 * r - 3.8 * t + 4.0 * np.sin(theta * 2.0 + t * 0.4))
    field_b = np.cos(18.0 * (xs * 0.8 - ys * 0.45) + t * 1.8)
    flow = (field_a * 0.6 + field_b * 0.4 + 1.0) * 0.5

    pulse = 0.5 + 0.5 * math.sin(t * 1.7)
    flash = 0.0
    for p in [1.9, 3.6, 7.7, 9.1]:
        flash += math.exp(-((t - p) / 0.12) ** 2)

    glow = np.clip(vignette * (0.35 + 0.45 * flow + 0.28 * pulse + 0.35 * flash), 0.0, 1.0)
    base[..., 0] = 7.0 + glow * 26.0
    base[..., 1] = 10.0 + glow * 145.0
    base[..., 2] = 9.0 + glow * 52.0

    # Concentric lock rings.
    ring_radius = 0.14 + 0.025 * math.sin(t * 1.0)
    ring = np.exp(-((r - ring_radius) / 0.008) ** 2)
    ring += 0.7 * np.exp(-((r - (ring_radius + 0.07)) / 0.010) ** 2)
    base[..., 1] += ring * (65.0 + 55.0 * pulse)
    base[..., 2] += ring * 18.0

    # Scanline texture for a tactical display feel.
    y = np.arange(H, dtype=np.float32).reshape(H, 1)
    scan = (np.sin(y * 0.13 + t * 7.5) * 0.5 + 0.5) * 7.0
    base -= scan[..., None]

    # Horizontal sweep beam.
    sweep_pos = (math.sin(t * 0.55) * 0.5 + 0.5) * W
    beam = np.exp(-((np.arange(W, dtype=np.float32) - sweep_pos) / 78.0) ** 2)
    base[..., 1] += beam[None, :] * 45.0

    # Global fade in/out.
    fade_in = float(smoothstep(0.0, 0.6, np.array([t]))[0])
    fade_out = float(smoothstep(DURATION_SECONDS - 0.85, DURATION_SECONDS, np.array([t]))[0])
    fade = fade_in * (1.0 - 0.9 * fade_out)
    base *= fade

    frame = np.clip(base, 0.0, 255.0).astype(np.uint8)

    # Tactical overlays and mission lock text.
    cv2.rectangle(frame, (0, 0), (W, H), (28, 85, 40), 2)
    cv2.line(frame, (80, H // 2), (W - 80, H // 2), (52, 118, 75), 1)
    cv2.line(frame, (W // 2, 120), (W // 2, H - 120), (52, 118, 75), 1)

    def alpha_text(text: str, y_pos: int, scale: float, color: tuple[int, int, int], alpha: float) -> None:
        if alpha <= 0.001:
            return
        overlay = frame.copy()
        size, _ = cv2.getTextSize(text, cv2.FONT_HERSHEY_DUPLEX, scale, 2)
        x_pos = (W - size[0]) // 2
        cv2.putText(overlay, text, (x_pos, y_pos), cv2.FONT_HERSHEY_DUPLEX, scale, color, 2, cv2.LINE_AA)
        cv2.addWeighted(overlay, alpha, frame, 1.0 - alpha, 0.0, frame)

    # Timed text choreography.
    alpha_1 = max(0.0, min((t - 1.0) / 0.7, 1.0)) * max(0.0, min((7.0 - t) / 0.6, 1.0))
    alpha_2 = max(0.0, min((t - 3.25) / 0.45, 1.0)) * max(0.0, min((9.6 - t) / 0.7, 1.0))
    alpha_3 = max(0.0, min((t - 7.45) / 0.3, 1.0)) * max(0.0, min((10.2 - t) / 0.25, 1.0))

    alpha_text("PEAKPACT", H // 2 - 210, 1.28, (120, 230, 150), alpha_1)
    alpha_text("WE DO NOT DEFAULT TO COMFORT", H // 2 - 120, 0.95, (214, 232, 220), alpha_2)
    alpha_text("PROTOCOL LOCKED", H // 2 + 20, 1.25, (164, 255, 120), alpha_3)

    return frame


def render_video(path: Path) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    fourcc = cv2.VideoWriter_fourcc(*"mp4v")
    writer = cv2.VideoWriter(str(path), fourcc, FPS, (W, H))

    xs = (np.arange(W, dtype=np.float32) / (W - 1) - 0.5) * 2.0
    ys = (np.arange(H, dtype=np.float32) / (H - 1) - 0.5) * 2.0
    xg, yg = np.meshgrid(xs, ys)
    r = np.sqrt(xg * xg + yg * yg)
    theta = np.arctan2(yg, xg)

    for i in range(TOTAL_FRAMES):
        t = i / FPS
        frame = make_frame(t, xg, yg, r, theta)
        writer.write(frame)

    writer.release()


def main() -> None:
    print("Generating elite intro media...")
    synthesize_audio(AUDIO_PATH, DURATION_SECONDS)
    render_video(VIDEO_PATH)
    print(f"Video generated: {VIDEO_PATH}")
    print(f"Audio generated: {AUDIO_PATH}")


if __name__ == "__main__":
    main()
