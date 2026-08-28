// Two-tone chime via Web Audio — no audio file to ship or host, and it
// sounds identical everywhere.
//
// Extracted from SignalsBoard, which had it first for arriving signals, so
// the notification bell rings with the same sound rather than a second
// implementation of the same idea.
//
// BROWSERS BLOCK AUDIO UNTIL THE PAGE HAS SEEN A USER GESTURE. The context
// is therefore created lazily on the first click or keydown rather than on
// mount, and until that gesture happens nothing is audible — there is no
// way around that from script, and pretending otherwise would mean a bell
// that silently does nothing on the first notification of a session while
// the code claims it rang. Callers should treat the chime as an
// enhancement: the visible toast and the badge carry the message on their
// own.

let sharedAudioCtx: AudioContext | null = null;

/** Call from a real user gesture handler. Safe to call repeatedly. */
export function unlockAudio(): void {
  if (sharedAudioCtx) return;
  const Ctx =
    window.AudioContext ||
    (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
  if (Ctx) sharedAudioCtx = new Ctx();
}

/** No-op until unlockAudio has run inside a gesture. */
export function playChime(): void {
  if (!sharedAudioCtx) return;
  const ctx = sharedAudioCtx;
  if (ctx.state === "suspended") ctx.resume();
  const now = ctx.currentTime;
  [880, 1320].forEach((freq, i) => {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = "sine";
    osc.frequency.value = freq;
    const start = now + i * 0.14;
    gain.gain.setValueAtTime(0, start);
    gain.gain.linearRampToValueAtTime(0.2, start + 0.02);
    gain.gain.exponentialRampToValueAtTime(0.001, start + 0.28);
    osc.connect(gain).connect(ctx.destination);
    osc.start(start);
    osc.stop(start + 0.3);
  });
}

/**
 * Installs the one-time gesture listeners that make sound possible at all.
 * Returns a cleanup function.
 */
export function armAudioUnlock(): () => void {
  const on = () => unlockAudio();
  window.addEventListener("pointerdown", on, { once: true });
  window.addEventListener("keydown", on, { once: true });
  return () => {
    window.removeEventListener("pointerdown", on);
    window.removeEventListener("keydown", on);
  };
}
