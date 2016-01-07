/**
 * In Elm, all application updates come from the root -- the components/views
 * themselves are stateless and pure. In a React app, this isn't necessarily
 * true, and often isn't. Any React component can update itself using state. In
 * order to interoperate with stateful React components, such as a Relay
 * container, we need a way to synchrononize external state with our Realm
 * model. `keyed` does this by dispatching special actions on mount and unmount.
 *
 * When using a keyed component, rather than storing a single copy of the
 * component's model, you keep a collection of models, stashed by key. On mount,
 * `keyed` dispatches a special action that adds a model instance to the
 * collection. Updates received from that component will update that specific
 * model instance. Then, when the component unmounts, the model is removed from
 * the collection.
 *
 * (To be extra clear: `keyed` is not necesssary if the data for a view can be
 * derived entirely from the model; it's only needed for cases where the output
 * of a view depends on data that is external to our model.)
 *
 * We ensure that a component is unmounted properly using the component keys,
 * an existing feature of React that is usually used to identify React elements
 * in a list across render cycles. Because element keys are not available on the
 * props object (as might be expected), we also specify a `realmKey` prop with
 * the same value.
 *
 * It's a bit hacky, but it's a necessary concession for React interop.
 */

import React, { Component } from 'react'

const BASE_DISPATCH = 'BASE_DISPATCH'

const WILL_MOUNT = 'WILL_MOUNT'
const WILL_UNMOUNT = 'WILL_UNMOUNT'

const keyed = Base => {
  const META_DISPATCH =
    'META_DISPATCH' + Math.random().toString(36).substr(2, 9)

  const init = () => ({})

  const update = (model, metaAction) => {
    if (metaAction.type !== META_DISPATCH) return model
    const { action, key } = metaAction.payload
    switch (action.type) {
    case WILL_MOUNT:
      const initialModel = action.payload
      return {
        ...model,
        [key]: initialModel
      }
    case BASE_DISPATCH:
      const baseComponentAction = action.payload
      return {
        ...model,
        [key]: Base.update(model[key], baseComponentAction)
      }
    case WILL_UNMOUNT:
      const newModel = { ...model }
      delete newModel[key]
      return newModel
    default:
      return model
    }
  }

  const view = class Keyed extends Component {
    constructor(props) {
      super(props)
    }

    componentWillMount() {
      const { model, init: initProp, realmKey } = this.props
      if (!model.hasOwnProperty(realmKey)) {
        this.metaDispatch({
          type: WILL_MOUNT,
          payload: initProp()
        })
      }
    }

    componentWillUnmount() {
      const { model, realmKey } = this.props
      if (model.hasOwnProperty(realmKey)) {
        this.metaDispatch({
          type: WILL_UNMOUNT
        })
      }
    }

    baseDispatch = action => this.metaDispatch({
      type: BASE_DISPATCH,
      payload: action
    })

    metaDispatch(action) {
      if (!this.props.realmKey) {
        throw new Error('keyed(): prop `realmKey` is required.')
      }

      this.props.dispatch({
        type: META_DISPATCH,
        payload: {
          key: this.props.realmKey,
          action
        }
      })
    }

    render() {
      const { model, realmKey } = this.props
      if (!model.hasOwnProperty(realmKey)) return null
      return (
        <Base.view
          {...this.props}
          dispatch={this.baseDispatch}
          model={model[realmKey]}
        />
      )
    }
  }

  return { init, update, view }
}

export default keyed
