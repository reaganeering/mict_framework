# example.py
from mict_framework import MICT

def update_ui(state, stage):
    print(f"Current Stage: {stage}, State: {state}")

def mapping(state):
    print("Mapping stage:", state)
    return state  # No change in this example

def iteration(state):
    print("Iteration stage:", state)
    return {**state, "count": state["count"] + 1}  # Increment count

def checking(state):
    print("Checking stage:", state)
    if state["count"] > 5:
        raise ValueError("Count exceeded limit!")  # Example error
    return state

def transformation(state):
    print("Transformation stage:", state)
    return state  # No change in this example

# Create a MICT instance
config = {
    "stages": ["Mapping", "Iteration", "Checking", "Transformation"],
    "initialState": {"count": 0},  # Start with count = 0
    "updateUI": update_ui,
    "stageFunctions": {
        "Mapping": mapping,
        "Iteration": iteration,
        "Checking": checking,
        "Transformation": transformation
    },
    "interval": 1000  # Run every 1000ms (1 second)
}

mict_cycle = MICT(config)

# Start the cycle
mict_cycle.start_cycle()
 # Keep the main thread alive for a while to let the cycle run

try:
    time.sleep(10) #Keep the main thread alive
except KeyboardInterrupt:
    pass # Allow the use of CTRL-C to exit.
finally:
    mict_cycle.stop_cycle()  # Stop in the main thread.
