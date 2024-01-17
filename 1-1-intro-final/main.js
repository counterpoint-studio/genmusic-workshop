import "./style.css";

// Add your code here

let ambience = document.querySelector("#ambience");
let playButton = document.querySelector("#play");
let rewindbutton = document.querySelector("#rewind");

playButton.addEventListener("click", () => {
  ambience.play();
});
rewindbutton.addEventListener("click", () => {
  ambience.currentTime = 0;
});
