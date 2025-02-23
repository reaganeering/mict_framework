// mict-framework.js

/**
 * Represents a single MICT (Mobius Inspired Cyclical Transformation) cycle.
 */
class MICT {
    /**
     * Creates a new MICT instance.
     * @param {object} config - Configuration object for the MICT cycle.
     * @param {string[]} config.stages - An array of stage names (e.g., ["Mapping", "Iteration", "Checking", "Transformation"]).
     * @param {object} config.initialState - The initial state of the system.  Can be any JavaScript object.
     * @param {function} config.updateUI - A function that will be called to update the user interface (or other external systems) after each stage transition.
     * @param {object} [config.stageFunctions={}] - An optional object mapping stage names to functions.  These functions will be called *before* the stage transition.
     * @param {number} [config.interval=0] - The interval in milliseconds for automatic cycle execution. 0 (or null/undefined) disables automatic cycling.
     * @param {function} [config.errorHandler] - An optional error handler function.
     * @throws {Error} If the configuration is invalid.
     */
    constructor(config) {
        if (!config || typeof config !== 'object') {
            throw new Error("MICT constructor requires a configuration object.");
        }
        if (!Array.isArray(config.stages) || config.stages.length === 0) {
            throw new Error("MICT configuration must include a 'stages' array with at least one stage.");
        }
        if (typeof config.updateUI !== 'function') {
            throw new Error("MICT configuration must include an 'updateUI' function.");
        }

        this.stages = config.stages;
        this.currentState = config.initialState;
        this.currentStageIndex = 0;
        this.updateUI = config.updateUI;
        this.stageFunctions = config.stageFunctions || {}; // Use an empty object if not provided
        this.intervalId = null;
        this.interval = config.interval || 0; // Store the interval
        this.errorHandler = config.errorHandler || null;
		  this.previousState = null; //Add for tracking.

        // Validate stageFunctions
        for (const stageName in this.stageFunctions) {
            if (!this.stages.includes(stageName)) {
                throw new Error(`Invalid stage name '${stageName}' in stageFunctions.  Must be one of: ${this.stages.join(', ')}`);
            }
            if (typeof this.stageFunctions[stageName] !== 'function') {
                throw new Error(`stageFunctions['${stageName}'] must be a function.`);
            }
        }
    }

    /**
     * Gets the name of the current stage.
     * @returns {string} The name of the current stage.
     */
    getCurrentStage() {
        return this.stages[this.currentStageIndex];
    }
    /**
     * Gets the current numerical index
     * @returns {integer} The index of the current stage.
     */
    getCurrentStageIndex(){
        return this.currentStageIndex;
    }

    /**
     * Transitions to the next stage in the cycle.  Calls the stage function (if any) before transitioning.
     */
     nextStage() {
        const currentStage = this.getCurrentStage();

        // Call the stage function (if it exists)
        if (this.stageFunctions[currentStage]) {
            try {
                // Pass the current state to the stage function.  The stage function
                // can modify the state directly, or return a *new* state.
                const newState = this.stageFunctions[currentStage](this.currentState);
					 this.previousState = this.currentState;// Save 
                if (newState !== undefined) {
                    this.currentState = newState; // Update state if a new state is returned
                }
            } catch (error) {
                if (this.errorHandler) {
                    this.errorHandler(error, currentStage, this.currentState);
                } else {
                    console.error(`Error in stage '${currentStage}':`, error);
                    // You might want to stop the cycle here in a production environment
                    // this.stopCycle();
                }
                return; // Don't proceed to the next stage if there's an error
            }
        }

        // Move to the next stage
        this.currentStageIndex = (this.currentStageIndex + 1) % this.stages.length;
        this.updateUI(this.currentState, this.getCurrentStage()); // Pass current state and stage
    }

    /**
     * Starts the automatic execution of the MICT cycle.
     * @param {number} [interval] - The interval in milliseconds.  If not provided, uses the interval from the constructor.
     */
    startCycle(interval) {
        if (this.intervalId) {
            console.warn("MICT cycle is already running.  Stopping the previous cycle.");
            this.stopCycle();
        }

        const intervalToUse = interval || this.interval; // Use provided interval, or constructor interval
        if (!intervalToUse) {
            console.warn("MICT cycle started without an interval.  Call nextStage() manually.");
            return; // Don't start if interval is 0, null, or undefined.
        }

        this.intervalId = setInterval(() => {
            this.nextStage();
        }, intervalToUse);
    }

    /**
     * Stops the automatic execution of the MICT cycle.
     */
    stopCycle() {
        if (this.intervalId) {
            clearInterval(this.intervalId);
            this.intervalId = null;
        }
    }

    /**
     * Sets the current state of the MICT cycle.
     * @param {object} newState The new state.
     */
    setState(newState) {
        this.currentState = newState;
        this.updateUI(this.currentState, this.getCurrentStage()); // Update UI with new state
    }
    /**
    * Gets the previousState
    */
    getPreviousState(){
        return this.previousState;
    }
     /**
     * Resets the MICT cycle to its initial state and stage.
     */
    reset() {
        this.currentStageIndex = 0;
        this.currentState = this.initialState; //Should be set.
		  this.previousState = null; //Reset this as well
        this.stopCycle(); // Stop any running interval
        this.updateUI(this.currentState, this.getCurrentStage()); // Update the UI
    }
}

export { MICT };
