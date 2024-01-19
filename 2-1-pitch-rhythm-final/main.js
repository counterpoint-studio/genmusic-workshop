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

  // Configure
  let buffer = await loadBuffer("/loops/ai1_atmosphere_loop_factotum_60_C.mp4");
  bufferSrcNode.buffer = buffer;
  bufferSrcNode.loop = true;

  // Connect
  bufferSrcNode.connect(audioCtx.destination);

  // Start
  bufferSrcNode.start();
}

function playNote(
  time,
  note,
  duration = 1.15,
  attack = 0.21,
  decay = 0.1,
  sustain = 0.5,
  release = 5.0,
  filterAttack = 0.01,
  filterDecay = 0.0,
  filterSustain = 1.0,
  filterRelease = 0.1
) {
  // Create
  let osc = audioCtx.createOscillator();
  let noiseOsc = new NoiseOscillatorNode(audioCtx);
  let noiseGain = audioCtx.createGain();
  let gain = audioCtx.createGain();
  let filter = audioCtx.createBiquadFilter();
  let saturator = new AudioWorkletNode(audioCtx, "saturator");

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
  filter.connect(saturator);
  saturator.connect(audioCtx.destination);

  // Start
  osc.start(time);
  noiseOsc.start();
  osc.stop(time + duration + release);
  noiseOsc.stop(time + duration + release);
}

function startMelody() {
  let noteNumber = 0;
  clock
    .callbackAtTime((event) => {
      let chord = Math.floor(noteNumber / 12) % 2;
      let chordNoteIndexes = chord === 0 ? [0, 2, 4] : [1, 4, 6];
      let noteIndex = chordNoteIndexes[noteNumber % chordNoteIndexes.length];
      let note = SCALE[noteIndex];
      playNote(event.deadline, note);
      noteNumber++;
    }, audioCtx.currentTime)
    .repeat(5);
}

async function startEverything() {
  await audioCtx.audioWorklet.addModule(noiseOscProcessorUrl);
  await audioCtx.audioWorklet.addModule(saturatorProcessorUrl);
  await startLoop();
  await audioCtx.resume();
  clock.start();
  startMelody();
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
