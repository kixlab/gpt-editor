import './public/css/App.css';
import 'bootstrap/dist/css/bootstrap.min.css';

import React, { useState } from 'react';
import Tree from './components/Tree';
import Editor from './components/Editor';

import Container from 'react-bootstrap/Container';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';

function App() {
  const [selectedText, setSelectedText] = useState('');

  const handleSelection = (text) => {
    setSelectedText(text);
  }

  return (
    <div className="App">
      <Container>
        <Row>
          <Col style={{position: "relative"}}>
            <Tree handleSelection={handleSelection}/>
          </Col>
          <Col>
            <Editor selectedText={selectedText}/>
          </Col>
        </Row>
      </Container>
    </div>
  );
}

export default App;
