// counter-example.js
import { createMICTEngine } from './mict-logic-engine.js';

const config = {
    stages: ["Mapping", "Iteration", "Checking", "Transformation"],
    initialState: { count: 0, limit: 10 },
    updateUI: (currentState, currentStage) => {
        console.log(`[${currentStage}] Count: ${currentState.count}`);
    },
    stageFunctions: {
        Mapping: (state) => state, // No change
        Iteration: (state) => ({ ...state, count: state.count + 1 }),
        Checking: (state) => {
            if (state.count >= state.limit) {
                console.log("Limit reached!");
            }
            return state;
        },
        Transformation: (state) => {
            if (state.count >= state.limit) {
                return { ...state, count: 0 }; // Reset the count
            }
            return state; // No change if limit not reached
        }
    },
};

const engine = createMICTEngine(config);
engine.startCycle(500); // Run every 500ms
