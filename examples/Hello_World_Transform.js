// example.js
import { createMICTEngine } from './mict-logic-engine.js'; //  Adjust path if needed

/**
 * Shuffles the characters of a string.
 * @param {string} str The input string.
 * @returns {string} The shuffled string.
 */
function shuffleString(str) {
    if (typeof str !== 'string') {
        return ''; // Or throw an error, depending on desired behavior
    }
    let arr = str.split('');
    for (let i = arr.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    return arr.join('');
}

// --- Configuration for the MICT cycle ---
const config = {
    stages: ["Mapping", "Iteration", "Checking", "Transformation"],
    initialState: {
        text: "Hello, World!",
    },
    updateUI: (currentState, currentStage) => {
        console.log(`[${currentStage}] Current State:`, currentState);
    },
    stageFunctions: {
        Mapping: (state) => {
            console.log("Mapping stage - No state change");
            return state; // No change in this example
        },
        Iteration: (state) => {
            console.log("Iteration stage - No state change");
             return state; // No change in this example
        },
        Checking: (state) => {
            console.log("Checking stage - No state change");
            return state; // No change in this example
        },
        Transformation: (state) => {
            console.log("Transformation stage - Shuffling text");
            const newText = shuffleString(state.text);
            return { ...state, text: newText }; // Return a *new* state object
        }
    },
    errorHandler: (error, stage, state) => {
        console.error(`Error in stage ${stage}:`, error);
        console.error("Current state:", state);
    }
};

// --- Create and Start the MICT Engine ---
const engine = createMICTEngine(config);
engine.startCycle(1000); // Run the cycle every 1 second (1000ms)

// --- (Optional) Stop the cycle after a few iterations ---
// setTimeout(() => {
//     engine.stopCycle();
//     console.log("Cycle stopped.");
// }, 5000); // Stop after 5 seconds (adjust as needed)


// --- (Optional) Manually step through the cycle ---
// You could also add buttons in an HTML page to call engine.nextStage()
// to step through the cycle manually.
