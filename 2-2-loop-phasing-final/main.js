import "./style.css";
import noiseOscProcessorUrl from "./NoiseOscillatorProcessor.js?url";
import saturatorProcessorUrl from "./SaturatorProcessor.js?url";
import { NoiseOscillatorNode } from "./NoiseOscillatorNode";
import WAAClock from "waaclock";

const SCALE = [60, 62, 64, 65, 67, 69, 71]; // Major
// const SCALE = [57, 59, 60, 62, 64, 65, 67]; // Minor

let audioButton = document.querySelector("#audioButton");

let audioCtx = new AudioContext();
let clock = new WAAClock(audioCtx, { toleranceEarly: 0.1 });
let firstStart = true;

function loadBuffer(url) {
  return fetch(url)
    .then((r) => r.arrayBuffer())
    .then((buffer) => audioCtx.decodeAudioData(buffer));
}

function mtof(midi) {
  return Math.pow(2, (midi - 69) / 12) * 440;
}

async function startLoop() {
  // Create
  let bufferSrcNode = audioCtx.createBufferSource();
  let gain = audioCtx.createGain();

  // Configure
  let buffer = await loadBuffer("/loops/ai1_atmosphere_loop_factotum_60_C.mp4");
  bufferSrcNode.buffer = buffer;
  bufferSrcNode.loop = true;
  gain.gain.value = 0.6;

  // Connect
  bufferSrcNode.connect(gain);
  gain.connect(audioCtx.destination);

  // Start
  bufferSrcNode.start();
}

function playNote(
  {
    time,
    note,
    duration = 1.15,
    attack = 0.02,
    decay = 0.1,
    sustain = 0.5,
    release = 5.0,
    filterAttack = 0.01,
    filterDecay = 0.0,
    filterSustain = 1.0,
    filterRelease = 0.1,
  } = {},
  destination = audioCtx.destination
) {
  // Create
  let osc = audioCtx.createOscillator();
  let noiseOsc = new NoiseOscillatorNode(audioCtx);
  let noiseGain = audioCtx.createGain();
  let gain = audioCtx.createGain();
  let filter = audioCtx.createBiquadFilter();

  // Configure
  osc.type = "triangle";
  osc.frequency.value = mtof(note);
  noiseGain.gain.value = 0.2;
  gain.gain.value = 0;
  gain.gain.setValueAtTime(0, time);
  gain.gain.linearRampToValueAtTime(0.15, time + attack);
  gain.gain.linearRampToValueAtTime(0.15 * sustain, time + attack + decay);
  gain.gain.setValueAtTime(0.15 * sustain, time + duration);
  gain.gain.setTargetAtTime(0, time + duration, release * 0.2);
  filter.type = "lowpass";
  filter.Q.value = 2;
  filter.frequency.setValueAtTime(500, time);
  filter.frequency.linearRampToValueAtTime(1_000, time + filterAttack);
  filter.frequency.linearRampToValueAtTime(
    1_000 * filterSustain,
    time + filterAttack + filterDecay
  );
  filter.frequency.setValueAtTime(1_000 * filterSustain, time + duration);
  filter.frequency.setTargetAtTime(500, time + duration, filterRelease * 0.2);

  // Connect
  osc.connect(gain);
  noiseOsc.connect(noiseGain);
  noiseGain.connect(gain);
  gain.connect(filter);
  filter.connect(destination);

  // Start
  osc.start(time);
  noiseOsc.start();
  osc.stop(time + duration + release);
  noiseOsc.stop(time + duration + release);
}

function playOneShotBuffer({ time, buffer, gain = 0.5, rate = 1.0 }) {
  // Create
  let bufferSrcNode = audioCtx.createBufferSource();
  let gainNode = audioCtx.createGain();

  // Configure
  bufferSrcNode.buffer = buffer;
  bufferSrcNode.playbackRate.value = rate;
  gainNode.gain.value = gain;

  // Connect
  bufferSrcNode.connect(gainNode);
  gainNode.connect(audioCtx.destination);

  // Start
  bufferSrcNode.start(time);
}

function startMelody(destination) {
  let noteNumber = 0;
  clock
    .callbackAtTime((event) => {
      let chord = Math.floor(noteNumber / 12) % 2;
      let chordNoteIndexes = chord === 0 ? [0, 2, 4] : [1, 4, 6];
      let noteIndex = chordNoteIndexes[noteNumber % chordNoteIndexes.length];
      let note = SCALE[noteIndex];
      playNote({ time: event.deadline, note }, destination);
      noteNumber++;
    }, audioCtx.currentTime)
    .repeat(5);
}

function startNoteLoop(note, initialDelay, interval) {
  clock
    .callbackAtTime(
      (event) => playNote({ time: event.deadline, note }),
      audioCtx.currentTime + initialDelay
    )
    .repeat(interval);
}

async function startBufferLoop(url, gain, rate, initialDelay, interval) {
  let buffer = await loadBuffer(url);
  clock
    .callbackAtTime(
      (event) =>
        playOneShotBuffer({ time: event.deadline, buffer, gain, rate }),
      audioCtx.currentTime + initialDelay
    )
    .repeat(interval);
}

async function startEverything() {
  await audioCtx.resume();
  await audioCtx.audioWorklet.addModule(noiseOscProcessorUrl);
  await audioCtx.audioWorklet.addModule(saturatorProcessorUrl);
  await startLoop();
  clock.start();
  let saturator = new AudioWorkletNode(audioCtx, "saturator");
  saturator.connect(audioCtx.destination);
  // startMelody(saturator);
  startNoteLoop(SCALE[0] + 12, 6.2, 17.4);
  startNoteLoop(SCALE[2] + 12, 3.8, 17.0);
  startNoteLoop(SCALE[4], 8.4, 18.2);
  startNoteLoop(SCALE[5], 12.6, 18.6);
  startBufferLoop(
    "/oneshots/MNT_LR_modular_one_shot_bell_E.mp4",
    0.2,
    0.5,
    10.2,
    22.8
  );
  startBufferLoop(
    "/oneshots/MNT_LR_modular_one_shot_pluck_hi_C.mp4",
    0.2,
    0.5,
    18.2,
    47
  );
}

async function toggleAudio() {
  if (firstStart) {
    await startEverything();
    firstStart = false;
  } else if (audioCtx.state === "running") {
    await audioCtx.suspend();
  } else {
    await audioCtx.resume();
  }
}

audioButton.addEventListener("click", toggleAudio);
