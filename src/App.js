import './public/css/App.css';
import 'bootstrap/dist/css/bootstrap.min.css';

import React, { useState } from 'react';
import TextEditor from './components/Editor';
import WidgetArea from './components/WidgetArea';
import { propTypes } from 'react-bootstrap/esm/Image';
import { onCompositionEnd } from 'draft-js/lib/DraftEditorCompositionHandler';

import "typeface-roboto";

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
      children: [2, 3, 4],
      switches: []
    },
    2: {
      parent: 1,
      type: "text",
      text: " World.",
      children: [],
      switches: [0]
    },
    3: {
      parent: 1,
      type: "text",
      text: " Hey hey hey!",
      children: [],
      switches: [1]
    },
    4: {
      parent: 1,
      type: "text",
      text: " Heyoooo!",
      children: [],
      switches: [2]
    }
  });
  const [lastSlot, setLastSlot] = useState(2);
  const [isMeta, setIsMeta] = useState(false);
  const [currentDepth, setCurrentDepth] = useState(0);
  const [isInsert, setIsInsert] = useState(false);
  const [hoverSlot, setHoverSlot] = useState(null);

  const [switches, setSwitches] = useState({
    0: {
      model: "GPT-3",
      slot: 2,
      lens: 0,
      color: "#FFAE50",
      properties: {
        engine: "davinci",
        temperature: 0.7,
        topP: 1,
        frequencyPen: 0,
        presencePen: 0,
        bestOf: 1
      }
    },
    1: {
      model: "GPT-3",
      slot: 3,
      lens: -1,
      color: "#71AAFF",
      properties: {
        engine: "davinci",
        temperature: 0.7,
        topP: 1,
        frequencyPen: 0,
        presencePen: 0,
        bestOf: 1
      }
    },
    2: {
      model: "GPT-3",
      slot: 4,
      lens: 0,
      color: "#2BB115",
      properties: {
        engine: "davinci",
        temperature: 0.7,
        topP: 1,
        frequencyPen: 0,
        presencePen: 0,
        bestOf: 1
      }
    }
  })

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
    var newSwitches = {...switches};

    var newSlotId = Math.max(...Object.keys(newSlots)) + 1;
    var newSwitchId = Math.max(...Object.keys(switches)) + 1;

    newSlots[lastSlot].children.push(newSlotId);
    newSlots[newSlotId] = {
      parent: lastSlot,
      type: "text",
      text: value,
      children: [],
      switches: [newSwitchId]
    };

    newSwitches[newSwitchId] = {
      model: "GPT-3",
      slot: newSlotId,
      lens: -1,
      color: "#71AAFF",
      properties: {
        engine: "davinci",
        temperature: 0.7,
        topP: 1,
        frequencyPen: 0,
        presencePen: 0,
        bestOf: 1
      }
    }

    setSlots(newSlots);
    setLastSlot(newSlotId);
    setSwitches(newSwitches);
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
    var newSwitches = {...switches};

    if(newSlots[slotId].switches.length > 0) {
      for(var i = 0; i < newSlots[slotId].switches.length; i++) {
        var switchId = newSlots[slotId].switches[i];
        delete newSwitches[switchId];
      }
      setSwitches(newSwitches);
    }

    var parentSlotId = newSlots[slotId].parent;
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

    var parentSlotId = newSlots[slotId].parent;
    var parentSlot = newSlots[parentSlotId];
    var children = parentSlot.children;
    var index = children.indexOf(slotId);
    children.splice(index, 1);

    var slot = newSlots[slotId];
    slot.parent = 0;
    newSlots[0].children.push(slotId);

    console.log(newSlots);

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



  function reattachSlot(parentSlot, childSlot) {
    var newSlots = {...slots};
    if(getSlotPath(parentSlot).includes(childSlot)) return;
    newSlots[parentSlot].children.push(childSlot);
    var childParentId = newSlots[childSlot].parent; 
    var childParent = newSlots[childParentId];
    var index = childParent.children.indexOf(childSlot);
    childParent.children.splice(index, 1);
    newSlots[childSlot].parent = parentSlot;
    setSlots(newSlots);
  }

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

  function attachSwitch(slotId, switchId) {
    var newSlots = {...slots};
    var newSwitches = {...switches};
    newSlots[slotId].switches.push(switchId);

    var originalSlotId = newSwitches[switchId].slot;
    var originalSlot = newSlots[originalSlotId];
    var originalSlotSwitches = originalSlot.switches;
    var index = originalSlotSwitches.indexOf(switchId);
    originalSlotSwitches.splice(index, 1);

    newSwitches[switchId].slot = slotId;
    setSwitches(newSwitches);
    setSlots(newSlots);
  }

  function removeSwitch(switchId) {
    var newSlots = {...slots};
    var newSwitches = {...switches};
    var slotId = newSwitches[switchId].slot;
    var slot = newSlots[slotId];
    var slotSwitches = slot.switches;
    var index = slotSwitches.indexOf(switchId);
    slotSwitches.splice(index, 1);

    delete newSwitches[switchId];
    setSlots(newSlots);
    setSwitches(newSwitches);
  }

  return (
    <div className="App" onKeyDown={handleKeyDown} onKeyUp={handleKeyUp}>
      <TextEditor 
        isMeta={isMeta} slots={slots} lastSlot={lastSlot} currentDepth={currentDepth} hoverSlot={hoverSlot}
        changeSlots={changeSlots} handleGenerate={handleGenerate} setIsInsert={setIsInsert}
        getSlotPath={getSlotPath} setCurrentDepth={setCurrentDepth}
      />
      <WidgetArea 
        slots={slots} lastSlot={lastSlot} currentDepth={currentDepth} isInsert={isInsert} 
        isMeta={isMeta} hoverSlot={hoverSlot}
        changeLastSlot={changeLastSlot} setHoverSlot={setHoverSlot} changeDepth={changeDepth} 
        removeSlot={removeSlot} detatchSlot={detatchSlot} copySlot={copySlot}
        reattachSlot={reattachSlot} getSlotPath={getSlotPath}
        switches={switches} attachSwitch={attachSwitch} removeSwitch={removeSwitch}
      />
    </div>
  );
}

export default App;
