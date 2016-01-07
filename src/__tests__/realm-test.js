import React from 'react'
import { expect } from 'chai'
import $ from 'teaspoon'
import { start, forward, keyed, createKeys } from '../'
import { toClass } from 'recompose'

describe('realm', () => {
  const INCREMENT = 'INCREMENT'
  const DECREMENT = 'DECREMENT'

  const Count = toClass('div')
  const Button = toClass('button')

  const Counter = {
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

    view: toClass(({ model: count, dispatch }) =>
      <div>
        <Count count={count} />
        <Button onClick={() => dispatch({ type: INCREMENT })}>+</Button>
        <Button onClick={() => dispatch({ type: DECREMENT })}>-</Button>
      </div>
    )
  }

  const TOP = 'TOP'
  const BOTTOM = 'BOTTOM'

  const CounterPair = {
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

    view: toClass(({ model, dispatch }) =>
      <div>
        <Counter.view
          dispatch={forward(dispatch, TOP)}
          model={model.top}
        />
        <Counter.view
          dispatch={forward(dispatch, BOTTOM)}
          model={model.bottom}
        />
      </div>
    )
  }

  const CounterApp = start({
    model: CounterPair.init(),
    update: CounterPair.update,
    view: CounterPair.view
  })

  it('works', () => {
    const $tree = $(<CounterApp />).render()
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

    const CounterList = {
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

      view: toClass(({ model, dispatch }) =>
        <div>
          {model.things.map(thing =>
            <KeyedCounter.view
              {...createKeys(thing.id)}
              init={() => Counter.init(thing.count)}
              model={model[COUNTERS]}
              dispatch={forward(dispatch, COUNTERS)}
            />
          )}
        </div>
      )
    }

    const CounterListApp = start({
      model: CounterList.init(),
      update: CounterList.update,
      view: CounterList.view
    })

    it('uses init prop', () => {
      const $tree = $(<CounterListApp />).render()
      const $counts = $tree.find(Count)
      expect($counts.length).to.equal(1)
      expect($counts[0].props.count).to.equal(7)
    })

    it('responds to updates', () => {
      const $tree = $(<CounterListApp />).render()
      const $list = $tree.find(CounterList.view)[0]
      expect($list.props.model.things.length).to.equal(1)
      expect($list.props.model[COUNTERS]).to.eql({ 1: 7 })
      $list.props.dispatch({ type: ADD_THING })
      expect($list.props.model.things.length).to.equal(2)
      expect($list.props.model[COUNTERS]).to.eql({ 1: 7, 2: 0 })
    })

    it('removes keyed state on unmount', () => {
      const $tree = $(<CounterListApp />).render()
      const $list = $tree.find(CounterList.view)[0]
      expect($list.props.model.things.length).to.equal(1)
      expect($list.props.model[COUNTERS]).to.eql({ 1: 7 })
      $list.props.dispatch({ type: REMOVE_THING, payload: 1 })
      expect($list.props.model.things.length).to.equal(0)
      expect($list.props.model[COUNTERS]).to.eql({})
    })
  })
})
