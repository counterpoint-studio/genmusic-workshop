import "./style.css";

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

function playNote({
  duration = 0.2,
  attack = 0.01,
  decay = 0.1,
  sustain = 0.5,
  release = 1.0,
} = {}) {
  let now = audioCtx.currentTime;

  // Create
  let osc = audioCtx.createOscillator();
  let gain = audioCtx.createGain();

  // Configure
  osc.frequency.value = 261.63;
  gain.gain.setValueAtTime(0, now);
  gain.gain.linearRampToValueAtTime(0.3, now + attack);
  gain.gain.linearRampToValueAtTime(0.3 * sustain, now + attack + decay);
  gain.gain.setValueAtTime(0.3 * sustain, now + duration);
  gain.gain.setTargetAtTime(0, now + duration, release * 0.2);

  // Connect
  osc.connect(gain);
  gain.connect(audioCtx.destination);

  // Start
  osc.start();
  osc.stop(audioCtx.currentTime + duration + release);
}

async function startEverything() {
  await audioCtx.resume();
  await startLoop();
  noteButton.addEventListener("click", () => playNote());
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
