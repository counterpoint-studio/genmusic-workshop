import "./style.css";

let audioButton = document.querySelector("#audioButton");

let audioCtx = new AudioContext();

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

  // Connect
  bufferSrcNode.connect(audioCtx.destination);

  // Start
  bufferSrcNode.start();
}

async function startEverything() {
  await startLoop();
  await audioCtx.resume();
}

audioButton.addEventListener("click", startEverything);
