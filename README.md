# rereducer

Create declarative redux reducers without boilerplate.

Basic example:
```js
import rereducer from 'rereducer';
const INITIAL_COUNTER_STATE = 0;

const counter = rereducer(
  INITIAL_COUNTER_STATE,
  ['INCREASE', x => x + 1],
  ['DECREASE', x => x - 1]
);

counter();
// => 0
counter(5, { type: 'INCREASE' });
// => 6
```

What if you want the same transformation for more than one action type?

```js
import rereducer from 'rereducer';
const INITIAL_COUNTER_STATE = 0;

const counter = rereducer(
  INITIAL_COUNTER_STATE,
  ['INCREASE', x => x + 1],
  ['DECREASE', x => x - 1],
  [['RESET', 'LOGOUT'], () => INITIAL_COUNTER_STATE]
);

counter(100, { type: 'RESET' });
// => 0
counter(100, { type: 'LOGOUT' });
// => 0
```

What if you need a more complex condition for a transformation?

```js
import rereducer from 'rereducer';
const INITIAL_COUNTER_STATE = 0;

const whenSomethingSpeciallHappens = (state, action) => (
  action.type === 'SOMETHING_SPECIAL' &&
  action.payload === 'SPECIAL_INDEED' &&
  state > 10
);

const counter = rereducer(
  INITIAL_COUNTER_STATE,
  ['INCREASE', x => x + 1],
  ['DECREASE', x => x - 1],
  [whenSomethingSpeciallHappens, x => x + 1000]
);

counter(11, { type: 'SOMETHING_SPECIAL', payload: 'SPECIAL_INDEED' });
// => 1011
counter(10, { type: 'SOMETHING_SPECIAL', payload: 'SPECIAL_INDEED' });
// => 10
counter(11, { type: 'SOMETHING_SPECIAL' });
// => 11
```

### Credits to:

- [@winkerVSbecks](https://github.com/winkerVSbecks): For sharing good ideas and feedback about the API
