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

// An A major triad — A5, C#6, E6 — rather than the two tones this used to
// play. The old pair was 880 and 1320, a bare perfect fifth; the note that
// turns a fifth into a chord is the third between them, and that is the
// whole difference between a beep and a chime.
const TRIAD = [880, 1108.73, 1318.51];

// Each note is struck 110ms after the last, which is short enough that all
// three are still ringing at the end and the listener hears the chord
// rather than three separate beeps.
const STRIKE_GAP = 0.11;

// Peak gain, up from 0.2. Loud enough to be heard across a room without
// being the sort of notification people turn off.
const PEAK = 0.34;

// A quiet octave above each note. A pure sine is a tuning fork; real bells
// carry harmonics, and this is the cheapest one that reads as metal rather
// than as a test tone. Kept low or it turns shrill.
const HARMONIC_PEAK = 0.06;

// Bell tails are long. 1.1s of exponential decay is what stops this
// sounding like a UI click with a pitch.
const DECAY = 1.1;

/** No-op until unlockAudio has run inside a gesture. */
export function playChime(): void {
  if (!sharedAudioCtx) return;
  const ctx = sharedAudioCtx;
  if (ctx.state === "suspended") ctx.resume();
  const now = ctx.currentTime;

  // Everything runs through one gentle lowpass. Without it the octave
  // harmonics sit on top of the fundamentals with nothing taking the edge
  // off, and on phone speakers that is the difference between warm and
  // tinny.
  const warmth = ctx.createBiquadFilter();
  warmth.type = "lowpass";
  warmth.frequency.value = 3600;
  warmth.Q.value = 0.7;
  warmth.connect(ctx.destination);

  TRIAD.forEach((freq, i) => {
    const start = now + i * STRIKE_GAP;
    for (const [f, peak] of [
      [freq, PEAK],
      [freq * 2, HARMONIC_PEAK],
    ]) {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = "sine";
      osc.frequency.value = f;
      // Exponential in and out, never touching zero: exponentialRamp cannot
      // reach it, and a linear attack on a tone this short is audible as a
      // click at the front of the note.
      gain.gain.setValueAtTime(0.0001, start);
      gain.gain.exponentialRampToValueAtTime(peak, start + 0.03);
      gain.gain.exponentialRampToValueAtTime(0.0001, start + DECAY);
      osc.connect(gain).connect(warmth);
      osc.start(start);
      osc.stop(start + DECAY + 0.05);
    }
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
