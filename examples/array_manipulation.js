// array-example.js
import { createMICTEngine, applyTransformations } from './mict-logic-engine.js';

const config = {
  stages: ["Mapping", "Iteration", "Checking", "Transformation"],
  initialState: {
    numbers: [1, 2, 3, 4, 5],
    transformations: [
      { type: 'rotate', params: { shift: 2 } },
      { type: 'reverse' },
    ],
  },
  updateUI: (currentState, currentStage) => {
    console.log(`[${currentStage}] Numbers: ${currentState.numbers.join(', ')}`);
  },
  stageFunctions: {
    Mapping: (state) => state,
    Iteration: (state) => {
      const newNumbers = applyTransformations(state.numbers, 1, state.transformations);
      return { ...state, numbers: newNumbers };
    },
    Checking: (state) => state,
    Transformation: (state) => {
        // Example: Reverse the array if the first element is even
        const newNumbers = state.numbers[0] % 2 === 0 ? state.numbers.slice().reverse() : state.numbers;
        return { ...state, numbers: newNumbers };
    }
  },
};

const engine = createMICTEngine(config);
engine.startCycle(1000);
