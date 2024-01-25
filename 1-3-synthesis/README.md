If you have cloned this repository locally, you can start it by running `npm install` and then `npm run dev` from a command line.

## Exercises

1. Try different waveforms for the oscillator, and listen to what they sound like.
2. Create a BiquadFilterNode and route the audio signal through that, either before or after the gain. Set the type of the BiquadFilterNode to “lowpass”
3. Try different values for the “frequency” and “Q” parameters of the filter to hear how they sculpt the sound. (Hint: Interesting ranges might be 100-20000 for frqeuency and 0-10 for Q.
4. Create an ADSR automation envelope for the filter’s “frequency” similar to what we did with the gain.

## Relevant Resources

- https://developer.mozilla.org/en-US/docs/Web/API/OscillatorNode
- https://developer.mozilla.org/en-US/docs/Web/API/BiquadFilterNode
- https://www.roland.com/uk/blog/guide-to-subtractive-synthesis/
