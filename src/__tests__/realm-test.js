import React from 'react'
import { expect } from 'chai'
import { renderIntoDocument } from 'react-addons-test-utils'
import $ from 'teaspoon'
import { realm, keyed, createKeys, start, forward } from '../'

describe('realm', () => {
  const INCREMENT = 'INCREMENT'
  const DECREMENT = 'DECREMENT'

  const Count = props => <div {...props} />
  const Button = props => <button {...props} />

  const Counter = realm({
    init: (initialCount = 0) => initialCount,

    update: (count, action) => {
      switch (action.type) {
      case INCREMENT:
        return count + 1
      case DECREMENT:
        return count - 1
      default:
        return count
      }
    },

    view: ({ model: count, dispatch }) => (
      <div>
        <Count count={count} />
        <Button onClick={() => dispatch({ type: INCREMENT })}>+</Button>
        <Button onClick={() => dispatch({ type: DECREMENT })}>-</Button>
      </div>
    )
  })

  const TOP = 'TOP'
  const BOTTOM = 'BOTTOM'

  const CounterPair = realm({
    init: () => ({
      top: Counter.init(),
      bottom: Counter.init()
    }),

    update: (model, action) => {
      switch (action.type) {
      case TOP:
        return {
          top: Counter.update(model.top, action.payload),
          bottom: model.bottom
        }
      case BOTTOM:
        return {
          top: model.top,
          bottom: Counter.update(model.bottom, action.payload)
        }
      default:
        return model
      }
    },

    view: ({ model, dispatch }) =>
      <div>
        <Counter dispatch={forward(dispatch, TOP)} model={model.top} />
        <Counter dispatch={forward(dispatch, BOTTOM)} model={model.bottom} />
      </div>
  })

  const CounterApp = start(null, CounterPair)

  it('works', () => {
    const $tree = $(renderIntoDocument(<CounterApp />))
    const $counts = $tree.find(Count)
    const $buttons = $tree.find(Button)
    const $top = $counts[0]
    const $bottom = $counts[1]

    const getBottomCount = () => $bottom.props.count
    const getTopCount = () => $top.props.count

    const { onClick: decrementBottom } = $buttons[3].props
    const { onClick: incrementBottom } = $buttons[2].props

    const { onClick: decrementTop } = $buttons[1].props
    const { onClick: incrementTop } = $buttons[0].props

    expect(getTopCount()).to.equal(0)
    expect(getBottomCount()).to.equal(0)

    incrementTop()
    incrementTop()
    expect(getTopCount()).to.equal(2)
    expect(getBottomCount()).to.equal(0)

    incrementBottom()
    incrementBottom()
    expect(getTopCount()).to.equal(2)
    expect(getBottomCount()).to.equal(2)

    decrementTop()
    decrementTop()
    expect(getTopCount()).to.equal(0)
    expect(getBottomCount()).to.equal(2)

    decrementBottom()
    decrementBottom()
    expect(getTopCount()).to.equal(0)
    expect(getBottomCount()).to.equal(0)
  })

  describe('keyed', () => {
    const ADD_THING = 'ADD_THING'
    const REMOVE_THING = 'REMOVE_THING'
    const COUNTERS = 'COUNTERS'

    const KeyedCounter = keyed(Counter)

    const CounterList = realm({
      init: () => ({
        idCounter: 2,
        things: [{
          id: 1,
          count: 7
        }],
        [COUNTERS]: KeyedCounter.init()
      }),

      update: (model, action) => {
        switch (action.type) {
        case ADD_THING:
          return {
            ...model,
            idCounter: model.idCounter + 1,
            things: [...model.things, {
              id: model.idCounter,
              count: 0
            }]
          }
        case REMOVE_THING:
          const newThings = model.things.filter(t => t.id !== action.payload)
          return {
            ...model,
            things: newThings
          }
        case COUNTERS:
          return {
            ...model,
            [COUNTERS]: KeyedCounter.update(model[COUNTERS], action.payload)
          }
        default:
          return model
        }
      },

      view: ({ model, dispatch }) =>
        <div>
          {model.things.map(thing =>
            <KeyedCounter
              {...createKeys(thing.id)}
              init={thing.count}
              model={model[COUNTERS]}
              dispatch={forward(dispatch, COUNTERS)}
            />
          )}
        </div>
    })

    const CounterListApp = start(null, CounterList)

    it('passes init prop to base init() on mount', () => {
      const tree = renderIntoDocument(<CounterListApp />)
      const $tree = $(tree)
      const $Counters = $tree.find(Counter)
      expect($Counters.length).to.equal(1)
      expect($Counters[0].props.model).to.equal(7)
    })

    it('responds to updates', () => {
      const tree = renderIntoDocument(<CounterListApp />)
      const $tree = $(tree)
      const $list = $tree.find(CounterList)[0]
      $list.props.dispatch({ type: ADD_THING })
      const $Counters = $tree.find(Counter)
      expect($Counters.length).to.equal(2)
      const $newCounter = $Counters[1]
      expect($newCounter.props.model).to.equal(0)
      $newCounter.props.dispatch({ type: INCREMENT })
      expect($newCounter.props.model).to.equal(1)
    })

    it('removes keyed state on unmount', () => {
      const tree = renderIntoDocument(<CounterListApp />)
      const $tree = $(tree)
      let $Counters = $tree.find(Counter)
      expect($Counters.length).to.equal(1)
      expect($Counters[0].props.model).to.equal(7)
      const $list = $tree.find(CounterList)[0]
      $list.dispatch({ type: REMOVE_THING, payload: 1 })
      $Counters = $tree.find(Counter)
      expect($Counters.length).to.equal(0)
    })
  })
})
