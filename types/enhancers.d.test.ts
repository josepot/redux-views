import { assocReducer, mergeReducer, concatReducer, subReducer } from "rereducer";
import { State, Entity, Action } from "storeTypes";

(() => { /// assocReducer
  type MapState = State['xar'];
  const keyGetter = (state: MapState, action: Action) => 'foo';
  const templateGetter: (state: MapState, action: Action) => Entity = (state: MapState, action: Action) => ({
    id: 'newId',
    text: 'foo'
  });

  // $ExpectType Reducer<{ [key: string]: Entity; }, Action>
  const withTemplate = assocReducer<Entity, MapState, Action>(
    keyGetter,
    {
      id: keyGetter,
      text: 'foo'
    }
  );

  // $ExpectType Reducer<{ [key: string]: Entity; }, Action>
  const withGetter = assocReducer<Entity, MapState, Action>(
    keyGetter,
    templateGetter
  );

  const withIncompleteTemplate = assocReducer<Entity, MapState, Action>(
    keyGetter,
    // $ExpectError
    {
      id: keyGetter
    }
  );
});

(() => { // subReducer
  const getPath = (state: State, action: Action) => 'foo';
  const reducer = (state: State, action: Action) => 'bar';

  // $ExpectType Reducer<State, Action>
  const withStaticPath = subReducer<State, Action>('foo', reducer);

  // $ExpectType Reducer<State, Action>
  const withGetter = subReducer<State, Action>(getPath, reducer);

  // $ExpectType Reducer<State, Action>
  const withBoth = subReducer<State, Action>([getPath, 'bar'], reducer);
});

(() => { /// mergeReducer
  interface MergeState {
    foo: number;
    bar: string;
  }

  // $ExpectType Reducer<MergeState, Action>
  const identity = mergeReducer<MergeState, Action>({});

  // $ExpectType Reducer<MergeState, Action>
  const partial = mergeReducer<MergeState, Action>({
    bar: 'baz'
  });

  const partialFail = mergeReducer<MergeState, Action>({
    // $ExpectError
    fail: true
  });

  // $ExpectType Reducer<MergeState, Action>
  const getter = mergeReducer((state: MergeState, action: Action) => ({
    foo: 3
  }));
});

(() => { /// concatReducer
  type ConcatState = string[];

  // $ExpectType Reducer<string[], Action>
  const identityArray = concatReducer<ConcatState, Action>(() => []);

  // $ExpectType Reducer<string[], Action>
  const arrayConcat = concatReducer<ConcatState, Action>(() => ['foo']);

  // $ExpectError
  const arrayConcatFail = concatReducer<ConcatState, Action>(() => [3]);

  // $ExpectType Reducer<string, Action>
  const stringConcat = concatReducer<string, Action>(() => 'foo');
});
