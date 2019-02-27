import rereducer from "rereducer";
import { State, Action, Action1, Action2, ActionType, initialState } from 'storeTypes';

const myGenericReducer = (state: State, action: Action) => state;
const myAction1Reducer = (state: State, action: Action1) => state;
const myAction2Reducer = (state: State, action: Action2) => state;
const myWatcher = (state: State, action: Action) => true;

(() => { /// API
  const noWatchers = rereducer<State, Action>(
    initialState
  );

  const simpleWatcher = rereducer<State, Action>(
    initialState,
    [ActionType.Action1, myAction1Reducer]
  );

  const functionWatcher = rereducer<State, Action>(
    initialState,
    [ActionType.Action1, myAction1Reducer],
    [myWatcher, myGenericReducer]
  );

  const combinedWatcher = rereducer<State, Action>(
    initialState,
    [
      [ActionType.Action1, myWatcher],
      myGenericReducer
    ]
  );

  const nestedWatcher = rereducer<State, Action>(
    initialState,
    [
      [
        [ActionType.Action1, ActionType.Action2],
        myWatcher
      ],
      myGenericReducer
    ]
  );
});

(() => { /// Initial value as first parameter
  // $ExpectType Reducer<State, Action>
  const noWatchers = rereducer<State, Action>(
    initialState
  );

  // $ExpectType Reducer<State, Action>
  const singleWatcher = rereducer<State, Action>(
    initialState,
    [ActionType.Action1, myAction1Reducer]
  );

  // $ExpectType Reducer<State, Action>
  const twoWatchers = rereducer<State, Action>(
    initialState,
    [ActionType.Action1, myAction1Reducer],
    [ActionType.Action2, myAction2Reducer]
  );
});

(() => { /// Action filtering
  rereducer<State, Action>(
    initialState,
    [ActionType.Action1, myGenericReducer]
  );

  rereducer<State, Action>(
    initialState,
    [ActionType.Action1, myAction1Reducer]
  );

  rereducer<State, Action>(
    initialState,
    // $ExpectError
    [ActionType.Action1, myAction2Reducer]
  );
});
