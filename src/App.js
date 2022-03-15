import './public/css/App.css';
import 'bootstrap/dist/css/bootstrap.min.css';

import React, { useState } from 'react';
import TextEditor from './components/Editor';
import WidgetArea from './components/WidgetArea';
import { propTypes } from 'react-bootstrap/esm/Image';

function App() {
  const [pipe, setPipe] = useState({
    children: [
      {text: "Hello.", children: [
        {text: " World.", children: []},
        {text: " Hey hey hey!", children: []},
      ]}
    ]
  });
  const [path, setPath] = useState([0, 1]);
  const [isMeta, setIsMeta] = useState(false);

  function handleKeyDown(e) {
      if (e.key === "Meta") {
          setIsMeta(true);
      }
  }

  function handleKeyUp(e) {
      if(e.key === "Meta") {
          setIsMeta(false);
      }
  }

  function changePath() {
    var newPath = [];
    var currentNode = pipe;
    while(currentNode.children.length != 0) {
      if(newPath.length == 1) {
        newPath.push(path[1] == 1 ? 0 : 1);
        currentNode = currentNode.children[path[1] == 1 ? 0 : 1];
      } else {
        newPath.push(currentNode.children.length - 1);
        currentNode = currentNode.children[currentNode.children.length - 1];
      }
    }
    setPath(newPath);
  }

  function changePipe(changedPathList, changedTextList) {
    var newPipe = {...pipe};
    for(var i = 0; i < changedPathList.length; i++) {
        var node = newPipe;
        for(var j = 0; j < changedPathList[i].length; j++) {
            node = node.children[changedPathList[i][j]];
        }
        node.text = changedTextList[i];
    }
    setPipe(newPipe);
  }

  function handleGenerate(value) {
    var newPipe = {...pipe};
    var newPath = [...path];
    
    var currentNode = newPipe;
    for(var i = 0; i < path.length; i++) {
      currentNode = currentNode.children[path[i]]
    }

    newPath.push(currentNode.children.length);
    currentNode.children.push({text: value, children: []});

    console.log(newPipe);
    console.log(newPath);

    setPipe(newPipe);
    setPath(newPath);
  }

  return (
    <div className="App" onKeyDown={handleKeyDown} onKeyUp={handleKeyUp}>
      <TextEditor 
        isMeta={isMeta} pipe={pipe} path={path} 
        changePipe={changePipe} handleGenerate={handleGenerate}
      />
      <WidgetArea 
        pipe={pipe}
        changePath={changePath}
      />
    </div>
  );
}

export default App;
