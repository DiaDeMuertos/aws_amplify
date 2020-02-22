import React, { Component } from 'react';
import { withAuthenticator } from 'aws-amplify-react';
import './App.css';

class App extends Component {
  render() {
    return (
      <div className="App">
        <header className="App-header">
          <h1>aws_amplify_env</h1>
        </header>
      </div>
    );
  }
}

export default withAuthenticator(App, true);
