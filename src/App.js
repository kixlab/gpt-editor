import './public/css/App.css';
import 'bootstrap/dist/css/bootstrap.min.css';

import React, { useState } from 'react';
import TextEditor from './components/Editor';
import WidgetArea from './components/WidgetArea';
import { propTypes } from 'react-bootstrap/esm/Image';

function App() {
  const [slots, setSlots] = useState({
    type: "root",
    children: [
      {type: "text", text: "Hello.", children: [
        {type: "text", text: " World.", children: []},
        {type: "text", text: " Hey hey hey!", children: []},
      ]}
    ]
  });
  const [path, setPath] = useState([0, 1]);
  const [isMeta, setIsMeta] = useState(false);
  const [currentDepth, setCurrentDepth] = useState(0);
  const [isInsert, setIsInsert] = useState(false);

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

  function changePath(pathStr) {
    setPath(pathStr.split(",").map(x => parseInt(x)));
  }

  function changeSlots(changedPathList, changedTextList) {
    var newSlots = {...slots};
    for(var i = 0; i < changedPathList.length; i++) {
        var node = newSlots;
        for(var j = 0; j < changedPathList[i].length; j++) {
            node = node.children[changedPathList[i][j]];
        }
        node.text = changedTextList[i];
    }
    setSlots(newSlots);
  }

  function handleGenerate(value) {
    var newSlots = {...slots};
    var newPath = [...path];
    
    var currentNode = newSlots;
    for(var i = 0; i < path.length; i++) {
      currentNode = currentNode.children[path[i]]
    }

    newPath.push(currentNode.children.length);
    currentNode.children.push({text: value, children: []});

    console.log(newSlots);
    console.log(newPath);

    setSlots(newSlots);
    setPath(newPath);
    setIsInsert(false);
  }

  function changeDepth(depth) {
    setCurrentDepth(depth);
  }

  return (
    <div className="App" onKeyDown={handleKeyDown} onKeyUp={handleKeyUp}>
      <TextEditor 
        isMeta={isMeta} slots={slots} path={path} currentDepth={currentDepth}
        changeSlots={changeSlots} handleGenerate={handleGenerate} setIsInsert={setIsInsert}
      />
      <WidgetArea 
        slots={slots} path={path} currentDepth={currentDepth} isInsert={isInsert}
        changePath={changePath} changeDepth={changeDepth}
      />
    </div>
  );
}

export default App;
