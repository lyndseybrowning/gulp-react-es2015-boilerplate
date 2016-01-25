import React from 'react';
import ReactDom from 'react-dom';

import helpers from './helpers';

const App = React.createClass({
  render() {
    return (
      <div> My App </div>
    )
  }
});

ReactDom.render(<App />, document.querySelector('#app'));
