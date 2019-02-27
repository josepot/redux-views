import { isType, payload } from "rereducer";
import { Action, ActionType } from "storeTypes";

(() => { /// isType
  // $ExpectType ReducerLikeFunction<any, Action, boolean>
  const basicAction = isType<Action>(ActionType.Action1);

  // $ExpectError
  const unmatchingAction = isType<Action>("foo");

  const typeLess = isType<{ type: string }>("pass");

  // $ExpectError
  const unmatchingType = isType<{ payload: any }>("foo");
});

(() => { /// payload
  // $ExpectType ReducerLikeFunction<any, ActionWithPayload<any>, any>
  const basicPayload = payload('foo', 'bar');
});
