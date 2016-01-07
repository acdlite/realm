# Realm

A total rip-off of the [Elm Architecture](https://github.com/evancz/elm-architecture-tutorial/), in React.

Realm components are React components, so they are interoperable with non-Realm components. Use Realm for your entire app, or just in specific places.

One way to think of it is as "nested Redux." Each Realm component is its own mini-Redux app, which can be composed of other Redux apps.

```js
import { realm, forward } from 'react-realm'

const INCREMENT = 'INCREMENT'
const DECREMENT = 'DECREMENT'

const init = (initialCount = 0) => initialCount

  // This is a reducer, like Redux
const update = (count, action) => {
  switch (action.type) {
  case INCREMENT:
    return count + 1
  case DECREMENT
    return count - 1
  default
    return count
}

// This is just a stateless functional React component
// Any React component (including a class) is valid
const view = ({ model, dispatch }) =>
  <div>
    Count: {model}
    <button onClick={() => dispatch({ type: INCREMENT })>+</button>
    <button onClick={() => dispatch({ type: DECREMENT })>-</button>
  </div>

// Either compose with other Realm components, or use `start()`
const CounterApp = start({
  model: init(),
  update,
  view
})

ReactDOM.render(<CounterApp />)
```

See also [Realm Redux](https://github.com/acdlite/realm-redux), which enables the use of Redux extensions with Realm components.

### Why you should use this library

- You think Elm is awesome, but are stuck writing JavaScript for various practical reasons
- You like functional programming
- You like Redux, and want access to its huge ecosystem of extensions and resources

### Why you shouldn't use this library

- Because you should use Elm instead
- Because it's in **extreme alpha** and not yet ready for public use. I intend to get it ready in time for my [React Conf talk](http://conf.reactjs.com/schedule.html#back-to-react) on February 23.

Note that while Realm is an implementation of the Elm Architecture, it does not and cannot claim to replicate the entirety of Elm the language.

Docs in progress / non-existent until the library is ready. In the meantime, see this [test](https://github.com/acdlite/realm/blob/master/src/__tests__/realm-test.js) for an example.
