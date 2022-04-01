import React from 'react';
import ReactDOM from 'react-dom';
import './public/css/index.css';
import AppEmail from './AppEmail';
import AppCopy from './AppCopy';
import AppBrain from './AppBrain';
import { store } from './app/store';
import { Provider } from 'react-redux';
import * as serviceWorker from './serviceWorker';
import "typeface-roboto";

const params = new Proxy(new URLSearchParams(window.location.search), {
  get: (searchParams, prop) => searchParams.get(prop),
});
// Get the value of "some_key" in eg "https://example.com/?some_key=some_value"
let value = params.app; // "some_value"

ReactDOM.render(
    <Provider store={store}>
      {value === "brain" ? <AppBrain /> : value === "email" ? <AppEmail /> : <AppCopy /> }
    </Provider>,
  document.getElementById('root')
);

// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: https://bit.ly/CRA-PWA
serviceWorker.unregister();
