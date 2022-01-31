import {hot} from 'react-hot-loader'
import React from 'react'
import ReactDOM from 'react-dom'
import App from './App'
import store from './store';
import {Provider} from "react-redux"

const Index: React.FC = () => {
  return <Provider store={store}><App/></Provider>
}

const Hot = hot(module)(Index)

ReactDOM.render(<Hot/>, document.getElementById('app'))