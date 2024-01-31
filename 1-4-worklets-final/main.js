import "./style.css";
import noiseOscProcessorUrl from "./NoiseOscillatorProcessor.js?url";
import saturatorProcessorUrl from "./SaturatorProcessor.js?url";
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
  {
    duration = 0.15,
    attack = 0.01,
    decay = 0.1,
    sustain = 0.5,
    release = 2.0,
    delayTime = 0.5,
    delayFeedback = 0.8,
  } = {},
  destination = audioCtx.destination
) {
  let now = audioCtx.currentTime;

  // Create
  let osc = audioCtx.createOscillator();
  let noiseOsc = new NoiseOscillatorNode(audioCtx);
  let noiseGain = audioCtx.createGain();
  let gain = audioCtx.createGain();
  let delay = audioCtx.createDelay();
  let delayFeedbackGain = audioCtx.createGain();

  // Configure
  osc.frequency.value = 261.63;
  noiseGain.gain.value = 0.1;
  gain.gain.setValueAtTime(0, now);
  gain.gain.linearRampToValueAtTime(0.3, now + attack);
  gain.gain.linearRampToValueAtTime(0.3 * sustain, now + attack + decay);
  gain.gain.setValueAtTime(0.3 * sustain, now + duration);
  gain.gain.setTargetAtTime(0, now + duration, release * 0.2);
  delay.delayTime.value = delayTime;
  delayFeedbackGain.gain.value = delayFeedback;

  // Connect
  osc.connect(gain);
  noiseOsc.connect(noiseGain);
  noiseGain.connect(gain);
  gain.connect(destination);
  gain.connect(delay);
  delay.connect(destination);
  delay.connect(delayFeedbackGain);
  delayFeedbackGain.connect(delay);

  // Start
  osc.start();
  noiseOsc.start();
  osc.stop(audioCtx.currentTime + duration + release);
  noiseOsc.stop(audioCtx.currentTime + duration + release);
}

async function startEverything() {
  await audioCtx.resume();
  await audioCtx.audioWorklet.addModule(noiseOscProcessorUrl);
  await audioCtx.audioWorklet.addModule(saturatorProcessorUrl);
  await startLoop();
  let saturator = new AudioWorkletNode(audioCtx, "saturator");
  saturator.connect(audioCtx.destination);
  noteButton.addEventListener("click", () => playNote({}, saturator));
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
