const forward = (dispatch, type) =>
  action => dispatch({
    type,
    payload: action
  })

export default forward
