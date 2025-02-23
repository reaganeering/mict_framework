# mict-framework.py

import time
import threading
from typing import Callable, Dict, List, Optional, Any, Union

class MICTError(Exception):
    """Base class for MICT-related errors."""
    pass

class ConfigurationError(MICTError):
    """Raised for errors in the MICT configuration."""
    pass

class MICT:
    """
    A class implementing the Mobius Inspired Cyclical Transformation (MICT) framework.

    Args:
        config (dict): A dictionary containing configuration options for the MICT cycle.

    Attributes:
        stages (list): A list of stage names (strings) defining the MICT cycle.
        current_state (dict): The current state of the system.
        previous_state (dict): The previous state of the system.
        current_stage_index (int): The index of the current stage in the `stages` list.
        updateUI (callable): A function to call for updating the user interface.
        stage_functions (dict): A dictionary mapping stage names to functions.
        interval_id (threading.Timer or None): The ID of the background thread (if running).
        interval (int): The interval (in milliseconds) between cycle iterations.
        error_handler (callable or None): A function to call for handling errors.
        config (dict):  Stores the original configuration
    """
    def __init__(self, config: Dict):
        if not isinstance(config, dict):
            raise TypeError("MICT constructor requires a configuration object.")
        if not isinstance(config.get('stages'), list) or not config['stages']:
            raise TypeError("MICT configuration must include a 'stages' list with at least one stage.")
        if not callable(config.get('updateUI')):
            raise TypeError("MICT configuration must include an 'updateUI' function.")

        self.stages: List[str] = config['stages']
        self.current_state: Dict = config.get('initialState', {})  # Default to empty dict if not provided
        self.previous_state: Optional[Dict] = None  # Initialize previous_state
        self.current_stage_index: int = 0
        self.updateUI: Callable[[Dict, str], None] = config['updateUI']
        self.stage_functions: Dict[str, Callable] = config.get('stageFunctions', {})  # Default to empty dict
        self.interval_id: Optional[threading.Timer] = None
        self.interval: int = config.get('interval', 0)  # Default to 0 (no interval)
        self.error_handler: Optional[Callable[[Exception, str, Dict], None]] = config.get('errorHandler', None)
        self._stop_event: threading.Event = threading.Event() # Event for stopping

        # Validate stageFunctions
        for stage_name, func in self.stage_functions.items():
            if stage_name not in self.stages:
                raise TypeError(f"Invalid stage name '{stage_name}' in stageFunctions. Must be one of: {', '.join(self.stages)}")
            if not callable(func):
                raise TypeError(f"stageFunctions['{stage_name}'] must be a function.")

        self.config = config #Store for later use.

    def get_current_stage(self) -> str:
        """Returns the name of the current stage."""
        return self.stages[self.current_stage_index]

    def get_current_stage_index(self) -> int:
        """Returns the index of the current stage."""
        return self.current_stage_index
    
    def get_previous_state(self) -> Optional[Dict]:
        """Returns the previous state of the system."""
        return self.previous_state

    def next_stage(self) -> None:
        """Executes the next stage in the MICT cycle."""
        current_stage = self.get_current_stage()

        # Call the stage function (if it exists)
        if current_stage in self.stage_functions:
            try:
                # Call stage function, potentially updating state
                new_state = self.stage_functions[current_stage](self.current_state)
                self.previous_state = self.current_state.copy() # Use copy to avoid modifying.
                if new_state is not None:  # Allow for no change.
                    self.current_state = new_state
            except Exception as error:
                if self.error_handler:
                    self.error_handler(error, current_stage, self.current_state)
                else:
                    print(f"Error in stage '{current_stage}': {error}")
                return  # Don't proceed to the next stage if there's an error

        # Move to the next stage
        self.current_stage_index = (self.current_stage_index + 1) % len(self.stages)
        self.updateUI(self.current_state, self.get_current_stage())

    def start_cycle(self, interval: Optional[int] = None) -> Optional[threading.Thread]:
        """
        Starts the MICT cycle.

        Args:
            interval (int, optional): The interval (in milliseconds) between cycle iterations.
                If not provided, uses the interval specified in the config.  If 0 or None,
                the cycle will not run automatically; `next_stage` must be called manually.

        Returns:
            threading.Thread or None: The thread object if the cycle is started with an interval,
                otherwise None.
        """
        if self.interval_id:
            print("MICT cycle is already running.  Stopping the previous cycle.")
            self.stop_cycle()

        self._stop_event.clear()  # Clear the stop event
        _interval = interval if interval is not None else self.interval
        if not _interval:
            print("MICT cycle started without an interval.  Call next_stage() manually.")
            return None

        def run_cycle():
            while not self._stop_event.is_set():  # Use the event to check for stopping
                self.next_stage()
                time.sleep(_interval / 1000)

        self.interval_id = threading.Thread(target=run_cycle)
        self.interval_id.daemon = True
        self.interval_id.start()
        return self.interval_id

    def stop_cycle(self) -> None:
        """Stops the MICT cycle."""
        self._stop_event.set()  # Signal the thread to stop
        self.interval_id = None


    def set_state(self, new_state: Dict) -> None:
        """
        Sets the current state of the system.

        Args:
            new_state (dict): The new state.
        """
        self.previous_state = self.current_state.copy() # Save previous state
        self.current_state = new_state
        self.updateUI(self.current_state, self.get_current_stage())

    def reset(self) -> None:
        """Resets the MICT cycle to its initial state."""
        self.current_stage_index = 0
        self.previous_state = None #Reset previous state
        self.current_state = self.config['initialState'].copy()  # Use initial state from config
        self.stop_cycle()
        self.updateUI(self.current_state, self.get_current_stage())
