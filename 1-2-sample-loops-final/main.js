import "./style.css";

let audioButton = document.querySelector("#audioButton");

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
  let buffer = await loadBuffer("/loops/aat_texture_loop_scape_128.mp4");
  bufferSrcNode.buffer = buffer;
  bufferSrcNode.loop = true;

  // Connect
  bufferSrcNode.connect(audioCtx.destination);

  // Start
  bufferSrcNode.start();
}

async function startEverything() {
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
