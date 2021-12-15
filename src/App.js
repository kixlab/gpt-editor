import './public/css/App.css';
import 'bootstrap/dist/css/bootstrap.min.css';

import React from 'react';
import { Tree } from './components/Tree';

import Container from 'react-bootstrap/Container';

function App() {
  return (
    <div className="App">
      <Container>
          <Tree/>
      </Container>
    </div>
  );
}

export default App;
