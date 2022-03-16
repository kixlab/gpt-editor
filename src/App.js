import './public/css/App.css';
import 'bootstrap/dist/css/bootstrap.min.css';

import React, { useState } from 'react';
import TextEditor from './components/Editor';
import WidgetArea from './components/WidgetArea';
import { propTypes } from 'react-bootstrap/esm/Image';

function App() {
  const [slots, setSlots] = useState({
    0: {
      type: "root",
      children: [1]
    },
    1: {
      parent: 0,
      type: "text",
      text: "Hello.",
      children: [2, 3]
    },
    2: {
      parent: 1,
      type: "text",
      text: " World.",
      children: []
    },
    3: {
      parent: 1,
      type: "text",
      text: " Hey hey hey!",
      children: []
    }
  });
  const [lastSlot, setLastSlot] = useState(2);
  const [isMeta, setIsMeta] = useState(false);
  const [currentDepth, setCurrentDepth] = useState(0);
  const [isInsert, setIsInsert] = useState(false);
  const [hoverSlot, setHoverSlot] = useState(null);

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

  function changeLastSlot(slotId) {
    setLastSlot(slotId);
  }

  function changeSlots(changedSlotList, changedTextList) {
    var newSlots = {...slots};
    for(var i = 0; i < changedSlotList.length; i++) {
        var node = newSlots[changedSlotList[i]];
        node.text = changedTextList[i];
    }
    setSlots(newSlots);
  }

  function handleGenerate(value) {
    var newSlots = {...slots};

    var newSlotId = Math.max(...Object.keys(newSlots)) + 1;
    newSlots[lastSlot].children.push(newSlotId);
    newSlots[newSlotId] = {
      parent: lastSlot,
      type: "text",
      text: value,
      children: []
    };

    setSlots(newSlots);
    setLastSlot(newSlotId);
    setIsInsert(false);
  }

  function changeDepth(slotId) {
    var newDepth = 0;
    var node = slots[slotId];
    while(node.parent !== 0) {
        node = slots[node.parent];
        newDepth++;
    }
    setCurrentDepth(newDepth);
  }

  function removeSlot(slotId) {
    var newSlots = {...slots};
    var currentNode = newSlots;

    var parentSlotId = currentNode[slotId].parent;
    delete newSlots[slotId];

    var parentSlot = newSlots[parentSlotId];
    var children = parentSlot.children;
    var index = children.indexOf(slotId);
    children.splice(index, 1);

    setSlots(newSlots);
    setLastSlot(parentSlotId);
  }

  function detatchSlot(slotId) {
    var newSlots = {...slots};

    // create anchors for (slotPath.length - 1) times and then attach detatched
    var parentSlotId = newSlots[slotId].parent;
    var parentSlot = newSlots[parentSlotId];
    var children = parentSlot.children;
    var index = children.indexOf(slotId);
    children.splice(index, 1);

    var slot = newSlots[slotId];
    slot.parent = 0;

    setSlots(newSlots);
  }

  function copySlot(slotId) {
    var newSlots = {...slots};
    var toCopy = newSlots[slotId];
    var newSlotId = Math.max(...Object.keys(newSlots)) + 1;
    newSlots[newSlotId] = {
      parent: toCopy.parent,
      type: toCopy.type,
      text: toCopy.text,
      children: []
    };
    newSlots[toCopy.parent].children.push(newSlotId);
    setSlots(newSlots);
  }


  // TODO: make this function but improve checking if it is a valid path (not loop)
  /*function reattachSlot(parentPath, childPath) {
    console.log(parentPath, childPath);
    var newSlots = {...slots};
    var newPath = [];
    var currentNode = newSlots;
    for(var i = 0; i < childPath.length - 1; i++) {
      currentNode = currentNode.children[childPath[i]]
    }
    var childSlot = currentNode.children.splice(childPath[childPath.length - 1], 1);

    currentNode = newSlots;
    for(var i = 0; i < parentPath.length; i++) {
      newPath.push(parentPath[i]);
      currentNode = currentNode.children[parentPath[i]]
    }
    newPath.push(currentNode.children.length);
    currentNode.children.push(childSlot[0]);

    console.log(newSlots);
    setSlots(newSlots);
    setPath(newPath);
  }
  */

  function getSlotPath(slotId) {
    var path = [];
    var node = slots[slotId];
    while(node.parent !== undefined) {
        path.push(slotId);
        slotId = node.parent;
        node = slots[slotId];
    }
    path.reverse();
    return path;
  }

  return (
    <div className="App" onKeyDown={handleKeyDown} onKeyUp={handleKeyUp}>
      <TextEditor 
        isMeta={isMeta} slots={slots} lastSlot={lastSlot} currentDepth={currentDepth} hoverSlot={hoverSlot}
        changeSlots={changeSlots} handleGenerate={handleGenerate} setIsInsert={setIsInsert}
        getSlotPath={getSlotPath}
      />
      <WidgetArea 
        slots={slots} lastSlot={lastSlot} currentDepth={currentDepth} isInsert={isInsert} 
        isMeta={isMeta} hoverSlot={hoverSlot}
        changeLastSlot={changeLastSlot} setHoverSlot={setHoverSlot} changeDepth={changeDepth} 
        removeSlot={removeSlot} detatchSlot={detatchSlot} copySlot={copySlot}
        getSlotPath={getSlotPath}
      />
    </div>
  );
}

export default App;
