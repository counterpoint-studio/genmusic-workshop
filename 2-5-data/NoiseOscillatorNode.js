export class NoiseOscillatorNode extends AudioWorkletNode {
  constructor(context) {
    super(context, "noise-oscillator");
  }

  start() {
    this.port.postMessage({ start: true });
  }

  stop(atTime) {
    this.port.postMessage({ stopAt: atTime });
  }
}
