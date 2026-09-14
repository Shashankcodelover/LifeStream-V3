/**
 * atcAudio.js
 * LifeStream Enterprise V5.0 - Authentic FAA Part 135 Synthesized Radio ATC Audio Co-Pilot
 * Uses Web Audio API for VHF radio squelch & PTT clicks + Web SpeechSynthesis for aviation voice clearance.
 */

let audioCtx = null;

function getAudioContext() {
  if (typeof window === 'undefined') return null;
  if (!audioCtx) {
    const AudioContextClass = window.AudioContext || window.webkitAudioContext;
    if (AudioContextClass) {
      audioCtx = new AudioContextClass();
    }
  }
  if (audioCtx && audioCtx.state === 'suspended') {
    audioCtx.resume().catch(() => {});
  }
  return audioCtx;
}

/**
 * Generates an authentic aviation VHF PTT (Push-To-Talk) mic click
 */
export function playRadioMicClick() {
  try {
    const ctx = getAudioContext();
    if (!ctx) return;

    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(880, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(440, ctx.currentTime + 0.04);

    gain.gain.setValueAtTime(0.2, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.04);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start();
    osc.stop(ctx.currentTime + 0.045);
  } catch (e) {
    // Ignore audio errors
  }
}

/**
 * Generates an authentic VHF radio static squelch release burst
 */
export function playRadioSquelchBurst(durationSec = 0.08) {
  try {
    const ctx = getAudioContext();
    if (!ctx) return;

    // Generate White Noise Buffer
    const bufferSize = Math.floor(ctx.sampleRate * durationSec);
    const noiseBuffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const output = noiseBuffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      output[i] = Math.random() * 2 - 1;
    }

    const whiteNoise = ctx.createBufferSource();
    whiteNoise.buffer = noiseBuffer;

    // Aviation Radio Bandpass Filter (300Hz - 3400Hz)
    const bandpass = ctx.createBiquadFilter();
    bandpass.type = 'bandpass';
    bandpass.frequency.value = 1800;
    bandpass.Q.value = 1.2;

    const gain = ctx.createGain();
    gain.gain.setValueAtTime(0.18, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + durationSec);

    whiteNoise.connect(bandpass);
    bandpass.connect(gain);
    gain.connect(ctx.destination);

    whiteNoise.start();
  } catch (e) {
    // Ignore audio errors
  }
}

/**
 * Synthesizes and broadcasts an authentic FAA Air-Traffic Control clearance transmission
 */
export function playATCClearance(clearanceText, onStart = null, onEnd = null) {
  if (typeof window === 'undefined') return;

  // 1. Play Opening PTT Mic Click & Quick Squelch
  playRadioMicClick();
  setTimeout(() => playRadioSquelchBurst(0.06), 40);

  if (!('speechSynthesis' in window)) {
    if (onEnd) setTimeout(onEnd, 2000);
    return;
  }

  // Cancel ongoing speech
  window.speechSynthesis.cancel();

  const utterance = new SpeechSynthesisUtterance(clearanceText);
  utterance.rate = 1.05; // Aviation brisk cadence
  utterance.pitch = 1.0; // Professional level pitch
  utterance.volume = 0.95;

  // Select an appropriate English voice if available
  const voices = window.speechSynthesis.getVoices();
  const preferredVoice =
    voices.find(v => v.lang.startsWith('en') && (v.name.includes('David') || v.name.includes('Natural') || v.name.includes('Google') || v.name.includes('Alex'))) ||
    voices.find(v => v.lang.startsWith('en'));

  if (preferredVoice) {
    utterance.voice = preferredVoice;
  }

  utterance.onstart = () => {
    if (onStart) onStart();
  };

  utterance.onend = () => {
    // Closing radio squelch & unkey click
    playRadioSquelchBurst(0.1);
    setTimeout(playRadioMicClick, 90);
    if (onEnd) onEnd();
  };

  utterance.onerror = () => {
    playRadioSquelchBurst(0.08);
    if (onEnd) onEnd();
  };

  // Small delay to let mic click sound before speech begins
  setTimeout(() => {
    window.speechSynthesis.speak(utterance);
  }, 100);
}

/**
 * Stops any active ATC transmission
 */
export function stopATCAudio() {
  if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
    window.speechSynthesis.cancel();
  }
}
