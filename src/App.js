import './public/css/App.css';
import 'bootstrap/dist/css/bootstrap.min.css';

import React, { useState } from 'react';
import Track from './components/Track';

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
      <Track/>
    </div>
  );
}

export default App;
