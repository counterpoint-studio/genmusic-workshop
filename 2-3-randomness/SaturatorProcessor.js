class SaturatorProcessor extends AudioWorkletProcessor {
  process(inputs, outputs) {
    let drive = 5.5;
    for (let i = 0; i < inputs.length; i++) {
      for (let ch = 0; ch < inputs[i].length; ch++) {
        for (let s = 0; s < inputs[i][ch].length; s++) {
          outputs[i][ch][s] = Math.tanh(inputs[i][ch][s] * drive) / drive;
        }
      }
    }
    return true;
  }
}
registerProcessor("saturator", SaturatorProcessor);
