import React, { Component } from 'react'

const DISPATCH = 'DISPATCH'

const WILL_MOUNT = 'WILL_MOUNT'
const WILL_UNMOUNT = 'WILL_UNMOUNT'

const keyed = BaseRealmComponent => {
  const META_DISPATCH =
    'META_DISPATCH' + Math.random().toString(36).substr(2, 9)

  class Keyed extends Component {
    constructor(props) {
      super(props)
    }

    componentWillMount() {
      this.metaDispatch({
        type: WILL_MOUNT,
        payload: this.props.init
      })
    }

    componentWillUnmount() {
      this.metaDispatch({
        type: WILL_UNMOUNT
      })
    }

    baseDispatch = action => this.metaDispatch({
      type: DISPATCH,
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
        <BaseRealmComponent
          {...this.props}
          dispatch={this.baseDispatch}
          model={model[realmKey]}
        />
      )
    }
  }

  Keyed.init = () => ({})

  Keyed.update = (model, metaAction) => {
    if (metaAction.type !== META_DISPATCH) return model
    const { action, key } = metaAction.payload
    switch (action.type) {
    case WILL_MOUNT:
      if (model.hasOwnProperty(key)) return model
      const init = action.payload
      return {
        ...model,
        [key]: BaseRealmComponent.init(init)
      }
    case DISPATCH:
      if (!model.hasOwnProperty(key)) return model
      const baseComponentAction = action.payload
      return {
        ...model,
        [key]: BaseRealmComponent.update(model[key], baseComponentAction)
      }
    case WILL_UNMOUNT:
      if (!model.hasOwnProperty(key)) return model
      const newModel = { ...model }
      delete newModel[key]
      return newModel
    default:
      return model
    }
  }

  return Keyed
}

export default keyed
