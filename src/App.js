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
  const [hoverPath, setHoverPath] = useState(null);

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

  function removeSlot(slotPath) {
    var newSlots = {...slots};
    var newPath = [...path];
    var currentNode = newSlots;
    for(var i = 0; i < slotPath.length - 1; i++) {
      currentNode = currentNode.children[slotPath[i]]
    }
    currentNode.children.splice(slotPath[slotPath.length - 1], 1);
    console.log(newSlots);
    setSlots(newSlots);
    setPath(newPath.slice(0, slotPath.length - 1));
  }

  function detatchSlot(slotPath) {
    var newSlots = {...slots};
    var newPath = [...path];

    var isIncluded = true;
    for(var i = 0; i < slotPath.length; i++) {
      if(newPath[i] !== slotPath[i]) {
        isIncluded = false;
        break;
      }
    }

    var currentNode = newSlots;
    for(var i = 0; i < slotPath.length - 1; i++) {
      currentNode = currentNode.children[slotPath[i]];
    }
    var detatched = currentNode.children.splice(slotPath[slotPath.length - 1], 1);

    // create anchors for (slotPath.length - 1) times and then attach detatched
    currentNode = newSlots;
    for(var i = 0; i < slotPath.length - 1; i++){
      var index = currentNode.children.length;
      currentNode.children.push({type: "anchor", children: []});
      currentNode = currentNode.children[index];
      if(isIncluded) {
        newPath[i] = index;
      }
    }
    currentNode.children.push(detatched[0]);
    newPath[slotPath.length - 1] = 0;

    console.log(newSlots);

    setSlots(newSlots);
    setPath(newPath);
  }

  return (
    <div className="App" onKeyDown={handleKeyDown} onKeyUp={handleKeyUp}>
      <TextEditor 
        isMeta={isMeta} slots={slots} path={path} currentDepth={currentDepth} hoverPath={hoverPath}
        changeSlots={changeSlots} handleGenerate={handleGenerate} setIsInsert={setIsInsert}
      />
      <WidgetArea 
        slots={slots} path={path} currentDepth={currentDepth} isInsert={isInsert} hoverPath={hoverPath}
        changePath={changePath} setHoverPath={setHoverPath} changeDepth={changeDepth} 
        removeSlot={removeSlot} detatchSlot={detatchSlot}
      />
    </div>
  );
}

export default App;
