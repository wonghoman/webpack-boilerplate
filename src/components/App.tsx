import React from 'react';
import { hot } from 'react-hot-loader';
import s from './App.css';

class App extends React.Component {
  public render() {
    return <div className={s.app}>App</div>;
  }
}

export default hot(module)(App);
