// TODO: Add test for React Redux connect function

import { createSelector, createStructuredSelector } from '../src/index'

// Construct 1E6 states for perf test outside of the perf test so as to not change the execute time of the test function
const numOfStates = 1000000
const states = []

for (let i = 0; i < numOfStates; i++) {
  states.push({ a: 1, b: 2 })
}

describe('selector', () => {
  test('basic selector', () => {
    const selector = createSelector(
      [state => state.a],
      a => a
    )
    const firstState = { a: 1 }
    const firstStateNewPointer = { a: 1 }
    const secondState = { a: 2 }

    expect(selector(firstState)).toBe(1)
    expect(selector(firstState)).toBe(1)
    expect(selector.recomputations()).toBe(1)
    expect(selector(firstStateNewPointer)).toBe(1)
    expect(selector.recomputations()).toBe(1)
    expect(selector(secondState)).toBe(2)
    expect(selector.recomputations()).toBe(2)
  })
  test("don't pass extra parameters to inputSelector when only called with the state", () => {
    const selector = createSelector(
      [(...params) => params.length],
      a => a
    )
    expect(selector({})).toBe(1)
  })
  test('basic selector multiple keys', () => {
    const selector = createSelector(
      [state => state.a, state => state.b],
      (a, b) => a + b
    )
    const state1 = { a: 1, b: 2 }
    expect(selector(state1)).toBe(3)
    expect(selector(state1)).toBe(3)
    expect(selector.recomputations()).toBe(1)
    const state2 = { a: 3, b: 2 }
    expect(selector(state2)).toBe(5)
    expect(selector(state2)).toBe(5)
    expect(selector.recomputations()).toBe(2)
  })
  test('basic selector invalid input selector', () => {
    expect(() =>
      createSelector(
        [state => state.a],
        'not a function',
        (a, b) => a + b
      )
    ).toThrow(/Selector creators expect all input-selectors to be functions/)
  })
  test('basic selector cache hit performance', () => {
    if (process.env.COVERAGE) {
      return // don't run performance tests for coverage
    }

    const selector = createSelector(
      [state => state.a, state => state.b],
      (a, b) => a + b
    )
    const state1 = { a: 1, b: 2 }

    const start = new Date()
    for (let i = 0; i < 1000000; i++) {
      selector(state1)
    }
    const totalTime = new Date() - start

    expect(selector(state1)).toBe(3)
    expect(selector.recomputations()).toBe(1)
    expect(totalTime < 1000).toBe(true)
  })
  test('basic selector cache hit performance for state changes but shallowly equal selector args', () => {
    if (process.env.COVERAGE) {
      return // don't run performance tests for coverage
    }

    const selector = createSelector(
      [state => state.a, state => state.b],
      (a, b) => a + b
    )

    const start = new Date()
    for (let i = 0; i < numOfStates; i++) {
      selector(states[i])
    }
    const totalTime = new Date() - start

    expect(selector(states[0])).toBe(3)
    expect(selector.recomputations()).toBe(1)
    expect(totalTime < 1000).toBe(true)
  })
  test('memoized composite arguments', () => {
    const selector = createSelector(
      [state => state.sub],
      sub => sub
    )
    const state1 = { sub: { a: 1 } }
    expect(selector(state1)).toEqual({ a: 1 })
    expect(selector(state1)).toEqual({ a: 1 })
    expect(selector.recomputations()).toBe(1)
    const state2 = { sub: { a: 2 } }
    expect(selector(state2)).toEqual({ a: 2 })
    expect(selector.recomputations()).toBe(2)
  })
  test('first argument can be an array', () => {
    const selector = createSelector(
      [state => state.a, state => state.b],
      (a, b) => {
        return a + b
      }
    )
    expect(selector({ a: 1, b: 2 })).toBe(3)
    expect(selector({ a: 1, b: 2 })).toBe(3)
    expect(selector.recomputations()).toBe(1)
    expect(selector({ a: 3, b: 2 })).toBe(5)
    expect(selector.recomputations()).toBe(2)
  })
  test('can accept props', () => {
    const selector = createSelector(
      [state => state.a, state => state.b, (state, props) => props.c],
      (a, b, c) => a + b + c
    )
    expect(selector({ a: 1, b: 2 }, { c: 100 })).toBe(103)
  })
  test('recomputes result after exception', () => {
    let called = 0
    const selector = createSelector(
      [state => state.a],
      () => {
        called++
        throw Error('test error')
      }
    )
    expect(() => selector({ a: 1 })).toThrow('test error')
    expect(() => selector({ a: 1 })).toThrow('test error')
    expect(called).toBe(2)
  })
  test('memoizes previous result before exception', () => {
    let called = 0
    const selector = createSelector(
      [state => state.a],
      a => {
        called++
        if (a > 1) throw Error('test error')
        return a
      }
    )
    const state1 = { a: 1 }
    const state2 = { a: 2 }
    expect(selector(state1)).toBe(1)
    expect(() => selector(state2)).toThrow('test error')
    expect(selector(state1)).toBe(1)
    expect(called).toBe(2)
  })
  test('chained selector', () => {
    const selector1 = createSelector(
      [state => state.sub],
      sub => sub
    )
    const selector2 = createSelector(
      [selector1],
      sub => sub.value
    )
    const state1 = { sub: { value: 1 } }
    expect(selector2(state1)).toBe(1)
    expect(selector2(state1)).toBe(1)
    expect(selector2.recomputations()).toBe(1)
    const state2 = { sub: { value: 2 } }
    expect(selector2(state2)).toBe(2)
    expect(selector2.recomputations()).toBe(2)
  })
  test('chained selector with props', () => {
    const selector1 = createSelector(
      [state => state.sub, (state, props) => props.x],
      (sub, x) => ({ sub, x })
    )
    const selector2 = createSelector(
      [selector1, (state, props) => props.y],
      (param, y) => param.sub.value + param.x + y
    )
    const state1 = { sub: { value: 1 } }
    expect(selector2(state1, { x: 100, y: 200 })).toBe(301)
    expect(selector2(state1, { x: 100, y: 200 })).toBe(301)
    expect(selector2.recomputations()).toBe(1)
    const state2 = { sub: { value: 2 } }
    expect(selector2(state2, { x: 100, y: 201 })).toBe(303)
    expect(selector2.recomputations()).toBe(2)
  })
  test('chained selector with variadic args', () => {
    const selector1 = createSelector(
      [state => state.sub, (state, props, another) => props.x + another],
      (sub, x) => ({ sub, x })
    )
    const selector2 = createSelector(
      [selector1, (state, props) => props.y],
      (param, y) => param.sub.value + param.x + y
    )
    const state1 = { sub: { value: 1 } }
    expect(selector2(state1, { x: 100, y: 200 }, 100)).toBe(401)
    expect(selector2(state1, { x: 100, y: 200 }, 100)).toBe(401)
    expect(selector2.recomputations()).toBe(1)
    const state2 = { sub: { value: 2 } }
    expect(selector2(state2, { x: 100, y: 201 }, 200)).toBe(503)
    expect(selector2.recomputations()).toBe(2)
  })
  test('override valueEquals', () => {
    // a rather absurd equals operation we can verify in tests
    const selector = createSelector(
      [state => state.a],
      a => a,
      (a, b) => typeof a === typeof b
    )
    expect(selector({ a: 1 })).toBe(1)
    expect(selector({ a: 2 })).toBe(1) // yes, really true
    expect(selector.recomputations()).toBe(2)
    expect(selector({ a: 'A' })).toBe('A')
    expect(selector.recomputations()).toBe(3)
  })
  test('structured selector', () => {
    const selector = createStructuredSelector({
      x: state => state.a,
      y: state => state.b
    })
    const firstResult = selector({ a: 1, b: 2 })
    expect(firstResult).toEqual({ x: 1, y: 2 })
    expect(selector({ a: 1, b: 2 })).toBe(firstResult)
    const secondResult = selector({ a: 2, b: 2 })
    expect(secondResult).toEqual({ x: 2, y: 2 })
    expect(selector({ a: 2, b: 2 })).toBe(secondResult)
  })
  test('structured selector with invalid arguments', () => {
    expect(() =>
      createStructuredSelector(state => state.a, state => state.b)
    ).toThrow(/expects first argument to be an object.*function/)
    expect(() =>
      createStructuredSelector({
        a: state => state.b,
        c: 'd'
      })
    ).toThrow(/Selector creators expect all input-selectors to be functions/)
  })
  test('resetRecomputations', () => {
    const selector = createSelector(
      [state => state.a],
      a => a
    )
    expect(selector({ a: 1 })).toBe(1)
    expect(selector({ a: 1 })).toBe(1)
    expect(selector.recomputations()).toBe(1)
    expect(selector({ a: 2 })).toBe(2)
    expect(selector.recomputations()).toBe(2)

    selector.resetRecomputations()
    expect(selector.recomputations()).toBe(0)

    expect(selector({ a: 1 })).toBe(1)
    expect(selector({ a: 1 })).toBe(1)
    expect(selector.recomputations()).toBe(1)
    expect(selector({ a: 2 })).toBe(2)
    expect(selector.recomputations()).toBe(2)
  })
  test('export last function as resultFunc', () => {
    const lastFunction = () => {}
    const selector = createSelector(
      [state => state.a],
      lastFunction
    )
    expect(selector.resultFunc).toBe(lastFunction)
  })
  test('export dependencies as dependencies', () => {
    const dependency1 = state => state.a
    const dependency2 = state => state.a

    const selector = createSelector(
      [dependency1, dependency2],
      () => {}
    )
    expect(selector.dependencies).toEqual([dependency1, dependency2])
  })
})
