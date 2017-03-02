import { message } from 'antd'
import { List, Map } from 'immutable'
import { captureError, setExtraContext } from 'opbeat-react'
import * as React from 'react'
import RestartMessage from '../component/RestartMessage'

const INITIAL_STATE = Map({
  loading    : true,
  suggestions: List()
})

export default function (state = INITIAL_STATE, action) {
  switch (action.type) {
    case 'GET_SUGGESTIONS_SUCCESS':
      return state.merge({ suggestions: action.suggestions })
    case 'CLEAR_SUGGESTIONS':
      return state.merge({ suggestions: List() })
    case 'LOAD_APP':
      return state.merge({ loading: true })
    case 'LOAD_APP_DONE':
      return state.merge({ loading: false })
    case 'FETCH_ERROR':
      setExtraContext({ api: action.url })
      captureError(action.error)
      message.error(<RestartMessage />, 1000)
      console.error(action.error)
      return state
    default:
      return state
  }
}
