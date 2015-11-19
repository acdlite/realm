import React from 'react'
import { expect } from 'chai'
import createSpy from 'recompose/createSpy'
import { renderIntoDocument } from 'react-addons-test-utils'
import { realm, start, forward } from '../'

describe('realm', () => {
  const INCREMENT = 'INCREMENT'
  const DECREMENT = 'DECREMENT'

  const countSpy = createSpy()
  const Count = countSpy('div')

  const buttonSpy = createSpy()
  const Button = buttonSpy('button')

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

    view: ({ model, dispatch }) => (
      <div>
        <Counter dispatch={forward(dispatch, TOP)} model={model.top} />
        <Counter dispatch={forward(dispatch, BOTTOM)} model={model.bottom} />
      </div>
    )
  })

  const CounterApp = start(CounterPair)

  it('works', () => {
    renderIntoDocument(<CounterApp />)

    const getBottomCount = () => countSpy.getProps(0).count
    const getTopCount = () => countSpy.getProps(1).count

    const { onClick: decrementBottom } = buttonSpy.getProps(0)
    const { onClick: incrementBottom } = buttonSpy.getProps(1)

    const { onClick: decrementTop } = buttonSpy.getProps(2)
    const { onClick: incrementTop } = buttonSpy.getProps(3)

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
})
