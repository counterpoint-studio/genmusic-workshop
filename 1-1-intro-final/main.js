import "./style.css";

// Add your code here

let ambience = document.querySelector("#ambience");
let audioButton = document.querySelector("#audioButton");
let rewindbutton = document.querySelector("#rewindButton");

audioButton.addEventListener("click", () => {
  ambience.play();
});
rewindbutton.addEventListener("click", () => {
  ambience.currentTime = 0;
});
