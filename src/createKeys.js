const createKeys = input => {
  const key = JSON.stringify(input)
  return {
    key,
    realmKey: key
  }
}

export default createKeys
