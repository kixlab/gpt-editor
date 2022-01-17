import './public/css/App.css';
import 'bootstrap/dist/css/bootstrap.min.css';

import React, { useState } from 'react';
import TreeFlow from './components/TreeFlow';

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
      <TreeFlow/>
    </div>
  );
}

export default App;
