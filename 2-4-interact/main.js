import "./style.css";
import noiseOscProcessorUrl from "./NoiseOscillatorProcessor.js?url";
import saturatorProcessorUrl from "./SaturatorProcessor.js?url";
import { NoiseOscillatorNode } from "./NoiseOscillatorNode";
import WAAClock from "waaclock";

const SCALE = [60, 62, 64, 65, 67, 69, 71]; // Major
// const SCALE = [57, 59, 60, 62, 64, 65, 67]; // Minor

let audioButton = document.querySelector("#audioButton");
let energySlider = document.querySelector("#energySlider");
let visContainer = document.querySelector("#vis");

let audioCtx = new AudioContext();
let clock = new WAAClock(audioCtx, { toleranceEarly: 0.1 });
let firstStart = true;
let clockEvents = [];
let energy = 0.5;

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
    velocity = 0.15,
    duration = 1.15,
    attack = 0.02,
    decay = 0.1,
    sustain = 0.5,
    release = 5.0,
    filterAttack = 0.01,
    filterDecay = 0.0,
    filterSustain = 1.0,
    filterRelease = 0.1,
    type = "triangle",
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
  osc.type = type;
  osc.frequency.value = mtof(note);
  noiseGain.gain.value = 0.2;
  gain.gain.value = 0;
  gain.gain.setValueAtTime(0, time);
  gain.gain.linearRampToValueAtTime(velocity, time + attack);
  gain.gain.linearRampToValueAtTime(velocity * sustain, time + attack + decay);
  gain.gain.setValueAtTime(velocity * sustain, time + duration);
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

function randRange(min = 0, max = 1) {
  return min + Math.random() * (max - min);
}

function startMelody(length, octaveShift, destination) {
  let chordNoteIndexes = [0, 2, 4, 6];
  let noteIndex = 0;
  let sequence = [];
  for (let i = 0; i < length; i += 1) {
    if (Math.random() < 0.2) {
      sequence.push(-1);
    } else {
      if (noteIndex === 0) noteIndex += 1;
      else if (noteIndex === chordNoteIndexes.length - 1) noteIndex -= 1;
      else noteIndex += Math.random() < 0.5 ? -1 : 1;
      let note = SCALE[chordNoteIndexes[noteIndex]] + 12 * octaveShift;
      sequence.push(note);
    }
  }

  let seqIndex = 0;
  let event = clock
    .callbackAtTime((event) => {
      let note = sequence[seqIndex++ % sequence.length];
      if (note === -1) return;
      let timingHumanisation = randRange(0.0, 0.02);
      playNote(
        {
          time: event.deadline + timingHumanisation,
          note,
          velocity: randRange(0.03, 0.06),
          duration: randRange(0.05, 0.15),
          attack: randRange(0.01, 0.02),
          decay: 0.0,
          sustain: 1.0,
          release: randRange(0.25, 1.0),
          type: Math.random() < 0.6 ? "sine" : "triangle",
        },
        destination
      );
    }, audioCtx.currentTime)
    .repeat(0.1);
  clockEvents.push(event);
}

function visualiseEvent({ time }) {
  let delay = Math.max(0, time - audioCtx.currentTime);
  setTimeout(() => {
    let x = randRange(0, window.innerWidth - 200);
    let y = randRange(0, window.innerHeight - 200);
    let hue = randRange(0, 360);
    let color = `hsl(${hue}, 80%, 50%)`;
    let eventEl = document.createElement("div");
    eventEl.classList.add("event");
    eventEl.style.left = `${x}px`;
    eventEl.style.top = `${y}px`;
    eventEl.style.backgroundColor = color;
    visContainer.appendChild(eventEl);
    eventEl
      .animate([{ opacity: 0.5 }, { opacity: 0 }], {
        duration: 3000,
        easing: "ease-out",
        fill: "forwards",
      })
      .finished.then(() => eventEl.remove());
  }, delay);
}

function startNoteLoop(note, initialDelay, interval) {
  let event = clock
    .callbackAtTime((event) => {
      playNote({ time: event.deadline, note });
      visualiseEvent({ time: event.deadline });
    }, audioCtx.currentTime + initialDelay)
    .repeat(interval);
  clockEvents.push(event);
}

async function startBufferLoop(url, gain, rate, initialDelay, interval) {
  let buffer = await loadBuffer(url);
  let event = clock
    .callbackAtTime((event) => {
      playOneShotBuffer({ time: event.deadline, buffer, gain, rate });
      visualiseEvent({ time: event.deadline });
    }, audioCtx.currentTime + initialDelay)
    .repeat(interval);
  clockEvents.push(event);
}

let lastStretch = 1;
function updateEnergy(value) {
  energy = value;

  let minStretch = 0.5;
  let maxStretch = 1.5;
  let reverseEnergy = 1 - energy;
  let stretch = minStretch + reverseEnergy * (maxStretch - minStretch);
  let stretchChange = stretch / lastStretch;
  lastStretch = stretch;

  clock.timeStretch(audioCtx.currentTime, clockEvents, stretchChange);
}

async function startEverything() {
  await audioCtx.audioWorklet.addModule(noiseOscProcessorUrl);
  await audioCtx.audioWorklet.addModule(saturatorProcessorUrl);
  await startLoop();
  await audioCtx.resume();
  let saturator = new AudioWorkletNode(audioCtx, "saturator");
  saturator.connect(audioCtx.destination);
  clock.start();
  startMelody(45, 0, saturator);
  startMelody(47, 1, saturator);
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
energySlider.addEventListener("input", (event) =>
  updateEnergy(parseFloat(event.target.value))
);
