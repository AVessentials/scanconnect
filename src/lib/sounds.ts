/**
 * Shared sound functions for notification chime/bell previews.
 * Uses Web Audio API — no external audio files needed.
 */

let audioCtx: AudioContext | null = null;

function ensureAudioCtx(): AudioContext {
  if (!audioCtx) {
    audioCtx = new AudioContext();
  }
  if (audioCtx.state === "suspended") {
    audioCtx.resume();
  }
  return audioCtx;
}

/** Two-tone chime: E5 → G5 */
export function playChime() {
  try {
    const ctx = ensureAudioCtx();
    const now = ctx.currentTime;
    const notes = [659.25, 783.99]; // E5, G5
    const noteDuration = 0.12;
    const gap = 0.08;

    notes.forEach((freq, i) => {
      const start = now + i * (noteDuration + gap);
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = "sine";
      osc.frequency.setValueAtTime(freq, start);

      gain.gain.setValueAtTime(0, start);
      gain.gain.linearRampToValueAtTime(0.15, start + 0.01);
      gain.gain.exponentialRampToValueAtTime(0.001, start + noteDuration);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(start);
      osc.stop(start + noteDuration + 0.01);
    });
  } catch {
    // Silently ignore — audio unsupported
  }
}

/** Single bell-like tone: A5 with longer decay */
export function playBell() {
  try {
    const ctx = ensureAudioCtx();
    const now = ctx.currentTime;

    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = "triangle";
    osc.frequency.setValueAtTime(880, now); // A5

    gain.gain.setValueAtTime(0, now);
    gain.gain.linearRampToValueAtTime(0.12, now + 0.005);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.5);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start(now);
    osc.stop(now + 0.55);
  } catch {
    // Silently ignore — audio unsupported
  }
}
