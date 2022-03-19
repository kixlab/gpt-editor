import './public/css/App.css';
import 'bootstrap/dist/css/bootstrap.min.css';

import React, { useEffect, useState, useReducer } from 'react';
import TextEditor from './components/Editor';
import WidgetArea from './components/WidgetArea';
import { propTypes } from 'react-bootstrap/esm/Image';
import { onCompositionEnd } from 'draft-js/lib/DraftEditorCompositionHandler';
import axios from 'axios';

import "typeface-roboto";

function slotsReducer(slots, action) {
    switch (action.type) {
        case 'change':
            var newSlots = {...slots};
            var { changedSlotList, changedTextList } = action;
            for(var i = 0; i < changedSlotList.length; i++) {
                var node = newSlots[changedSlotList[i]];
                node.text = changedTextList[i];
            }
            return newSlots;
        default:
            throw new Error();
    }
}

function App() {
  const [slots, slotsDispatch] = useReducer(slotsReducer, {
    0: {
      type: "root",
      children: []
    }
  });
  const [lastSlot, setLastSlot] = useState(0);
  const [isMeta, setIsMeta] = useState(false);
  const [currentDepth, setCurrentDepth] = useState(-1);
  const [isInsert, setIsInsert] = useState(false);
  const [hoverSlot, setHoverSlot] = useState(null);
  const [switches, setSwitches] = useState({})
  const [lenses, setLenses] = useState({});

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
    slotsDispatch({type: "change", changedSlotList, changedTextList});
  }

  function handleCreate(value) {
    if(value === "") return;
    var newSlots = {...slots};
    var newSwitches = {...switches};

    var newSlotId = Math.max(...Object.keys(newSlots)) + 1;
    var newSwitchId = Object.keys(newSwitches).length == 0 ? 0 : Math.max(...Object.keys(newSwitches)) + 1;

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

  useEffect(() => {
    console.log(slots);
  }, [slots])
  useEffect(() =>{
    console.log(switches);
  }, [switches])

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
    }

    var parentSlotId = newSlots[slotId].parent;
    var children = newSlots[slotId].children;
    while(children.length !== 0) {
      var newChildren = [];
      for(var i = 0; i < children.length; i++) {
        var childId = children[i]
        newChildren = newChildren.concat(newSlots[childId].children);
        if(newSlots[childId].switches.length > 0) {
          for(var i = 0; i < newSlots[childId].switches.length; i++) {
            var switchId = newSlots[childId].switches[i];
            delete newSwitches[switchId];
          }
        }
        delete newSlots[childId];
      }
      children = newChildren;
    }
    delete newSlots[slotId];

    var parentSlot = newSlots[parentSlotId];
    var children = parentSlot.children;
    var index = children.indexOf(slotId);
    children.splice(index, 1);

    setSlots(newSlots);
    setLastSlot(parentSlotId);
    setHoverSlot(parentSlotId);
    setSwitches(newSwitches);
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
      children: [],
      switches: []
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

  function onPropertyChange(switchId, property, value) {
    var newSwitches = {...switches};
    switch (property) {
      case "temperature":
      case "topP":
          value = parseFloat(value);
          if(isNaN(value) || value < 0 || value > 1) return;
          break;
      case "frequencyPen":
      case "presencePen":
          value = parseFloat(value);
          if(isNaN(value) || value < 0 || value > 2) return;
          break;
      case "bestOf":
          value = parseInt(value);
          if(isNaN(value) || value < 1 || value > 20) return;
          break;
    }
    newSwitches[switchId].properties[property] = value;
    setSwitches(newSwitches);
  }

  function textify(slotId) {
    var text = "";
    var node = slots[slotId];
    while(node.parent !== undefined) {
        text = node.text + text;
        node = slots[node.parent];
    }
    return text;
  }

  function handleGenerate(switchId) {
    var newSwitches = {...switches};
    if(newSwitches[switchId].isLoading) return;
    
    var currSwitch = switches[switchId];
    var data = {...currSwitch.properties};
    data.text = textify(currSwitch.slot);
    
    newSwitches[switchId].isLoading = true;
    setSwitches(newSwitches);

    // TODO: modify generation format depending on lens

    if(lenses[currSwitch.lens] === undefined) {
      axios
      .post(`http://localhost:5000/api/generate-new`, data)
      .then((response) => {
          var newSwitches = {...switches};
          newSwitches[switchId].isLoading = false;

          var newSlots = {...slots};
          var currSlotId = currSwitch.slot;
          var currSlot = newSlots[currSlotId];
          var newSlotId = Math.max(...Object.keys(newSlots)) + 1;
          var newSwitchId = Math.max(...Object.keys(newSwitches)) + 1;

          newSlots[newSlotId] = {
            parent: currSlotId,
            type: "text",
            text: response.data[0].text,
            children: [],
            switches: [newSwitchId]
          }
          currSlot.children.push(newSlotId);
      
          newSwitches[newSwitchId] = JSON.parse(JSON.stringify(currSwitch));
          console.log(newSwitches, newSwitches[newSwitchId].slot);
          newSwitches[newSwitchId].slot = newSlotId;
          newSwitches[newSwitchId].lens = -1;
          
          setSlots(newSlots);
          setLastSlot(newSlotId);
          setSwitches(newSwitches);
      });
    }
  }

  return (
    <div className="App" onKeyDown={handleKeyDown} onKeyUp={handleKeyUp}>
      <TextEditor 
        isMeta={isMeta} slots={slots} lastSlot={lastSlot} currentDepth={currentDepth} hoverSlot={hoverSlot}
        changeSlots={changeSlots} handleCreate={handleCreate} setIsInsert={setIsInsert}
        getSlotPath={getSlotPath} setCurrentDepth={setCurrentDepth}
      />
      <WidgetArea 
        slots={slots} lastSlot={lastSlot} currentDepth={currentDepth} isInsert={isInsert} 
        isMeta={isMeta} hoverSlot={hoverSlot}
        changeLastSlot={changeLastSlot} setHoverSlot={setHoverSlot} changeDepth={changeDepth} 
        removeSlot={removeSlot} detatchSlot={detatchSlot} copySlot={copySlot}
        reattachSlot={reattachSlot} getSlotPath={getSlotPath}
        switches={switches} attachSwitch={attachSwitch} removeSwitch={removeSwitch}
        onPropertyChange={onPropertyChange}
        handleGenerate={handleGenerate}
      />
    </div>
  );
}

export default App;
