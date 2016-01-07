import React, { Component } from 'react'
import wrapDisplayName from 'recompose/wrapDisplayName'

const start = ({ model: initialModel, view: View, update }) => {
  class Start extends Component {
    constructor(props) {
      super(props)
    }

    state = { model: initialModel }

    dispatch = action =>
      this.setState(({ model }) => ({
        model: update(model, action)
      }))

    render() {
      return (
        <View
          dispatch={this.dispatch}
          model={this.state.model}
          {...this.props}
        />
      )
    }
  }

  Start.displayName = wrapDisplayName(View, 'start')

  return Start
}

export default start
