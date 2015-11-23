const actionCreator = (dispatch, type) => payload =>
  dispatch({
    type,
    payload
  })

export default actionCreator
