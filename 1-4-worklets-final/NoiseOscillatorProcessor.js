class NoiseOscillatorProcessor extends AudioWorkletProcessor {
  constructor() {
    super();
    this.state = "notStarted";
    this.stopAtTime = -1;
    this.port.onmessage = (event) => {
      if (event.data.start) {
        this.state = "started";
      } else if (event.data.stopAt) {
        this.stopAtTime = event.data.stopAt;
      }
    };
  }

  // inputs: Float32Array[][];
  // outputs: Float32Array[][];
  // The first dimension is the number of inputs/outputs.
  // The second dimension is the number of channels.
  // The final dimension is the number of samples to process at a time. In practice this is always 128 in Web Audio
  process(_inputs, outputs, _parameters) {
    if (this.stopAtTime >= 0 && this.stopAtTime < currentTime) {
      this.state = "stopped";
    }
    if (this.state === "started") {
      for (let o = 0; o < outputs.length; o++) {
        for (let ch = 0; ch < outputs[o].length; ch++) {
          for (let s = 0; s < outputs[o][ch].length; s++) {
            outputs[o][ch][s] = Math.random() * 2 - 1;
          }
        }
      }
    }
    return this.state !== "stopped";
  }
}

registerProcessor("noise-oscillator", NoiseOscillatorProcessor);
