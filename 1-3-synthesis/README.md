If you have cloned this repository locally, you can start it by running `npm install` and then `npm run dev` from a command line.

## Exercises

1. Create a DelayNode, with a delay time of 0.5 seconds and make the synthesizer's audio signal run through it. You should hear a note half a second after each click.
2. Connect the synthesizer to the destination twice: Once directly, and once through the DelayNode. Now you should hear the note immediately when you click, and then a second time half a second later.
3. Add a feedback loop to the delay line: Connect the output of the DelayNode to a GainNode, whose gain is set to 0.8. Connect the output of the GainNode back into the DelayNode. You should hear the note repeated many times, getting quieter every time. You have built an echo effect.

## Relevant Resources

- https://developer.mozilla.org/en-US/docs/Web/API/OscillatorNode
- https://developer.mozilla.org/en-US/docs/Web/API/DelayNode
- https://developer.mozilla.org/en-US/docs/Web/API/GainNode
- https://www.hackaudio.com/digital-signal-processing/echo-effects/
