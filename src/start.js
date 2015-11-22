import { Component } from 'react'
import wrapDisplayName from 'recompose/wrapDisplayName'
import createElement from 'recompose/createElement'
import shallowEqual from 'recompose/shallowEqual'

const start = BaseComponent => {
  class Start extends Component {
    constructor() {
      super()

      this.state = { model: BaseComponent.init() }

      this.dispatch = action =>
        this.setState(({ model }) => ({
          model: BaseComponent.update(model, action)
        }))
    }

    shouldComponentUpdate(nextProps, nextState) {
      return (
        !shallowEqual(nextProps, this.props) ||
        nextState.model !== this.state.model
      )
    }

    render() {
      return createElement(BaseComponent, {
        dispatch: this.dispatch,
        model: this.state.model,
        ...this.props
      })
    }
  }

  Start.displayName = wrapDisplayName(BaseComponent, 'start')

  return Start
}

export default start
