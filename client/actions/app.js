import apis from '../apis'

export function getSuggestions(name) {
  return (dispatch, getState) => {
    const state = getState()

    if (!state.app.get('loading')) {
      const url = apis.GET_SUGGESTIONS(encodeURIComponent(name))
      fetch(url)
        .then(res => res.json())
        .then(games => {
          dispatch({ type: 'GET_SUGGESTIONS_SUCCESS', suggestions: games })
        })
        .catch(error => {
          dispatch({ type: 'FETCH_ERROR', error, url })
        })
    }
  }
}
