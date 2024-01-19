import "./style.css";
import noiseOscProcessorUrl from "./NoiseOscillatorProcessor.js?url";
import { NoiseOscillatorNode } from "./NoiseOscillatorNode";

let audioButton = document.querySelector("#audioButton");
let noteButton = document.querySelector("#noteButton");

let audioCtx = new AudioContext();
let firstStart = true;

function loadBuffer(url) {
  return fetch(url)
    .then((r) => r.arrayBuffer())
    .then((buffer) => audioCtx.decodeAudioData(buffer));
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
  duration = 0.15,
  attack = 0.01,
  decay = 0.1,
  sustain = 0.5,
  release = 2.0,
  filterAttack = 0.01,
  filterDecay = 0.0,
  filterSustain = 1.0,
  filterRelease = 0.1
) {
  let now = audioCtx.currentTime;

  // Create
  let osc = audioCtx.createOscillator();
  let noiseOsc = new NoiseOscillatorNode(audioCtx);
  let noiseGain = audioCtx.createGain();
  let gain = audioCtx.createGain();
  let filter = audioCtx.createBiquadFilter();

  // Configure
  osc.type = "square";
  osc.frequency.value = 261.63;
  noiseGain.gain.value = 0.5;
  gain.gain.setValueAtTime(0, now);
  gain.gain.linearRampToValueAtTime(0.3, now + attack);
  gain.gain.linearRampToValueAtTime(0.3 * sustain, now + attack + decay);
  gain.gain.setValueAtTime(0.3 * sustain, now + duration);
  gain.gain.setTargetAtTime(0, now + duration, release * 0.2);
  filter.type = "lowpass";
  filter.Q.value = 2;
  filter.frequency.setValueAtTime(500, now);
  filter.frequency.linearRampToValueAtTime(1_000, now + filterAttack);
  filter.frequency.linearRampToValueAtTime(
    1_000 * filterSustain,
    now + filterAttack + filterDecay
  );
  filter.frequency.setValueAtTime(1_000 * filterSustain, now + duration);
  filter.frequency.setTargetAtTime(500, now + duration, filterRelease * 0.2);

  // Connect
  osc.connect(gain);
  noiseOsc.connect(noiseGain);
  noiseGain.connect(gain);
  gain.connect(filter);
  filter.connect(saturator);

  // Start
  osc.start();
  noiseOsc.start();
  osc.stop(audioCtx.currentTime + duration + release);
  noiseOsc.stop(audioCtx.currentTime + duration + release);
}

async function startEverything() {
  await audioCtx.audioWorklet.addModule(noiseOscProcessorUrl);
  await startLoop();
  await audioCtx.resume();
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
noteButton.addEventListener("click", () => playNote());
