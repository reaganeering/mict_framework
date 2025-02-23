// async-example.js
import { createMICTEngine } from './mict-logic-engine.js';

// Simulate an API call (replace with a real fetch call)
function fetchData() {
    return new Promise(resolve => {
        setTimeout(() => {
            resolve({ data: "Some data from an API" });
        }, 1000);
    });
}

const config = {
    stages: ["Mapping", "Iteration", "Checking", "Transformation"],
    initialState: { data: null },
    updateUI: (currentState, currentStage) => {
        console.log(`[${currentStage}] Data:`, currentState.data);
    },
    stageFunctions: {
        Mapping: async (state) => { // Use async function
            console.log("Mapping: Fetching data...");
            try {
                const response = await fetchData(); // Await the Promise
                return { ...state, data: response.data }; // Update state with fetched data
            } catch (error) {
                console.error("Error fetching data:", error);
                return { ...state, data: "Error fetching data" }; // Set error state
            }
        },
        Iteration: (state) => state, // No change in this example
        Checking: (state) => state,
        Transformation: (state) => state,
    },
};

const engine = createMICTEngine(config);
engine.startCycle(2000); // Run every 2 seconds (to allow time for the async operation)
