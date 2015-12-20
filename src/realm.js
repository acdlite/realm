import { Component, PropTypes } from 'react'
import wrapDisplayName from 'recompose/wrapDisplayName'
import createElement from 'recompose/createElement'

const createRealmComponent = ({ init, update, view }) => {
  class Realm extends Component {
    constructor(props) {
      super(props)
    }

    dispatch = action => this.props.dispatch(action)

    render() {
      return createElement(view, {
        ...this.props,
        dispatch: this.dispatch
      })
    }
  }

  Realm.displayName = wrapDisplayName(Component, 'createRealmComponent')
  Realm.init = init
  Realm.update = update
  Realm.view = view

  Realm.propTypes = {
    model: PropTypes.any.isRequired,
    dispatch: PropTypes.func.isRequired
  }

  return Realm
}

export default createRealmComponent
