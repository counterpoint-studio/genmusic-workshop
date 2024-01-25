If you have cloned this repository locally, you can start it by running `npm install` and then `npm run dev` from a command line.

## Exercises

1. Create an Audio Worklet node called `Saturator`. Make it apply tanh saturation/distortion to its input signal by passing it through the tanh function: `outputSample = Math.tanh(inputSample)` for each sample.
2. Plug the worklet into your synthesizer. How does it change the sound?
   Hint: You can make just one permanent Saturator that all notes will be connected to, instead of making a new Saturator for each note.
3. Add some “drive” to the saturation by multiplying each sample by some number larger than 1 before passing it to the tanh. Try different numbers.

## Relevant Resources

- https://en.wikipedia.org/wiki/Sampling_(signal_processing)
- https://developer.mozilla.org/en-US/docs/Web/API/Web_Audio_API/Using_AudioWorklet
- https://developer.mozilla.org/en-US/docs/Web/API/AudioWorkletNode
- https://developer.mozilla.org/en-US/docs/Web/API/AudioWorkletProcessor
- https://en.wikipedia.org/wiki/White_noise
- https://www.izotope.com/en/learn/what-is-audio-saturation.html
- https://en.wikipedia.org/wiki/Hyperbolic_functions
- https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Math/tanh
