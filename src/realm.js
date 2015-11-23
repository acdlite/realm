import { Component, PropTypes } from 'react'
import wrapDisplayName from 'recompose/wrapDisplayName'
import shallowEqual from 'recompose/shallowEqual'
import createElement from 'recompose/createElement'
import omit from 'lodash/object/omit'

const omitDispatch = props => omit(props, 'dispatch')

const realm = ({ init, update, view }) => {
  class Realm extends Component {
    constructor() {
      super()
      this.dispatch = action => this.props.dispatch(action)
    }

    shouldComponentUpdate(nextProps) {
      return !shallowEqual(omitDispatch(nextProps), omitDispatch(this.props))
    }

    render() {
      return createElement(view, {
        dispatch: this.dispatch,
        model: this.props.model,
        ...omitDispatch(this.props)
      })
    }
  }

  Realm.displayName = wrapDisplayName(Component, 'realm')
  Realm.init = init
  Realm.update = update
  Realm.view = view

  Realm.propTypes = {
    model: PropTypes.any.isRequired,
    dispatch: PropTypes.func.isRequired
  }

  return Realm
}

export default realm
