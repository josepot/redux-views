export interface Entity {
  id: string;
  text: string;
}
export interface State {
  foo: {
    bar: string,
    baz: number
  };
  bar: string[];
  xar: {
    [key: string]: Entity
  };
}
export enum ActionType {
  Action1 = 'action1',
  Action2 = 'action2'
}
export interface Action1 {
  type: ActionType.Action1;
  payload: {
    foo: string
  };
}
export interface Action2 {
  type: ActionType.Action2;
  payload: {
    bar: string
  };
}
export type Action = Action1 | Action2;

export const initialState: State = {
  foo: {
    bar: 'foo',
    baz: 3
  },
  bar: [],
  xar: {}
};
