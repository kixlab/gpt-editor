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
  const [pinnedText, setPinnedText] = useState(['', '']);

  const handleSelection = (text) => {
    setSelectedText(text);
  }

  const handlePin = (pinIdx, text) => {
    const pinnedTextCopy = [...pinnedText];
    pinnedTextCopy[pinIdx] = text;
    setPinnedText(pinnedTextCopy);
  }

  return (
    <div className="App">
      <Container>
        <Row>
          <Col style={{position: "relative"}}>
            <Tree handleSelection={handleSelection} handlePin={handlePin}/>
          </Col>
          <Col>
            <Editor selectedText={selectedText} pinnedText={pinnedText}/>
          </Col>
        </Row>
      </Container>
    </div>
  );
}

{/* <div className="App">
<Container>
  <Editor selectedText={selectedText} pinnedText={pinnedText}/>
  <Row style={{position: "relative", padding: "0 128px"}}>
    <Tree handleSelection={handleSelection} handlePin={handlePin}/>
  </Row>
</Container>
</div> */}

export default App;
