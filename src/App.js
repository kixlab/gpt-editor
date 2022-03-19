import './public/css/App.css';
import 'bootstrap/dist/css/bootstrap.min.css';

import React, { useState, useReducer, useCallback } from 'react';
import TextEditor from './components/Editor';
import WidgetArea from './components/WidgetArea';
import { propTypes } from 'react-bootstrap/esm/Image';
import { onCompositionEnd } from 'draft-js/lib/DraftEditorCompositionHandler';
import axios from 'axios';

import "typeface-roboto";

function generateId() {
    return Math.random().toString(36).slice(2, 12);
}

function App() {
    const slotsReducer = useCallback((slots, action) => {
        var newSlots = { ...slots };
        switch (action.type) {
            case 'change':
                var { changedSlotList, changedTextList } = action;
                for (var i = 0; i < changedSlotList.length; i++) {
                    var node = newSlots[changedSlotList[i]];
                    node.text = changedTextList[i];
                }
                return newSlots;
            case 'create':
                var { slotId, slot } = action;
                var parentId = slot.parent;
                var parentSlot = newSlots[parentId];
                parentSlot.children.push(slotId);
                newSlots[slotId] = slot;
                return newSlots;
            case 'remove':
                var { slotId, slotsToRemove } = action;
                var parentSlotId = newSlots[slotId].parent;
                var parentSlot = newSlots[parentSlotId];
                var children = parentSlot.children;
                var index = children.indexOf(slotId);
                children.splice(index, 1);
                for (var i = 0; i < slotsToRemove.length; i++) {
                    delete newSlots[slotsToRemove[i]];
                }
                return newSlots;
            case 'attach':
                var { slotId, newParentSlotId } = action

                var parentSlotId = newSlots[slotId].parent;
                var parentSlot = newSlots[parentSlotId];
                var children = parentSlot.children;
                var index = children.indexOf(slotId);
                children.splice(index, 1);

                var slot = newSlots[slotId];
                slot.parent = newParentSlotId;
                newSlots[newParentSlotId].children.push(slotId);
                return newSlots;
            case 'attach-switch':
                var { slotId, switchId } = action;
                newSlots[slotId].switches.push(switchId);
                return newSlots;
            case 'detatch-switch':
                var { slotId, switchId } = action;
                var slot = newSlots[slotId];
                var slotSwitches = slot.switches;
                var index = slotSwitches.indexOf(switchId);
                slotSwitches.splice(index, 1);
                return newSlots;
            default:
                throw new Error();
        }
    }, []);
    const [slots, slotsDispatch] = useReducer(slotsReducer, {
        'ROOT': {
            type: "root",
            children: []
        }
    });

    const switchesReducer = useCallback((switches, action) => {
        var newSwitches = { ...switches };
        switch (action.type) {
            case 'create':
                var { switchId, newSwitch } = action;
                newSwitches[switchId] = newSwitch;
                return newSwitches;
            case 'remove':
                var { switchesToRemove } = action;
                for (var i = 0; i < switchesToRemove.length; i++) {
                    delete newSwitches[switchesToRemove[i]];
                }
                return newSwitches;
            case 'attach-slot':
                var { switchId, slotId } = action;
                newSwitches[switchId].slot = slotId;
                return newSwitches;
            case 'change':
                var { switchId, property, value } = action;
                newSwitches[switchId].properties[property] = value;
                return newSwitches;
            case 'loading':
                var { switchId, isLoading } = action; 
                newSwitches[switchId].isLoading = isLoading;
                return newSwitches;
            default:
                throw new Error();
        }
    }, []);
    const [switches, switchesDispatch] = useReducer(switchesReducer, {});

    const [lenses, setLenses] = useState({});

    const [isMeta, setIsMeta] = useState(false);
    const [lastSlot, setLastSlot] = useState('ROOT');
    const [hoverSlot, setHoverSlot] = useState(null);
    const [currentDepth, setCurrentDepth] = useState(-1);
    const [isInsert, setIsInsert] = useState(false);

    function handleKeyDown(e) {
        if (e.key === "Meta") {
            setIsMeta(true);
        }
    }

    function handleKeyUp(e) {
        if (e.key === "Meta") {
            setIsMeta(false);
        }
    }

    function changeLastSlot(slotId) {
        setLastSlot(slotId);
    }

    function changeSlots(changedSlotList, changedTextList) {
        slotsDispatch({ type: "change", changedSlotList, changedTextList });
    }

    function handleCreate(value) {
        if (value === "") return;

        var newSlotId = generateId();
        var newSwitchId = "sw" + generateId();

        slotsDispatch({type: "create", slotId: newSlotId, 
            slot: {
                parent: lastSlot,
                type: "text",
                text: value,
                children: [],
                switches: [newSwitchId]
            }
        });
        
        switchesDispatch({type: "create", switchId: newSwitchId,
            newSwitch: {
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
        }});

        setLastSlot(newSlotId);
        setIsInsert(false);
    }

    function changeDepth(slotId) {
        var newDepth = -1;
        var node = slots[slotId];
        while (node.parent !== undefined) {
            node = slots[node.parent];
            newDepth++;
        }
        setCurrentDepth(newDepth);
    }

    function removeSlot(slotId) {
        var slotsToRemove = [];
        var switchesToRemove = [];
        var parentSlotId = slots[slotId].parent;
        var children = [slotId];
        while (children.length !== 0) {
            var newChildren = [];
            for (var i = 0; i < children.length; i++) {
                var childId = children[i]
                newChildren = newChildren.concat(slots[childId].children);
                if (slots[childId].switches.length > 0) {
                    for (var i = 0; i < slots[childId].switches.length; i++) {
                        var switchId = slots[childId].switches[i];
                        switchesToRemove.push(switchId);
                    }
                }
                slotsToRemove.push(childId);
            }
            children = newChildren;
        }

        slotsDispatch({ type: "remove", slotId: slotId, slotsToRemove });
        switchesDispatch({ type: "remove", switchesToRemove });
        setLastSlot(parentSlotId);
        setHoverSlot(parentSlotId);
    }

    function detatchSlot(slotId) {
        slotsDispatch({ type: 'attach', slotId: slotId, newParentSlotId: 0 });
    }

    function copySlot(slotId) {
        var toCopy = slots[slotId];
        var newSlotId = generateId;
        slotsDispatch({
            type: "create", slotId: newSlotId, slot: {
                parent: toCopy.parent,
                type: toCopy.type,
                text: toCopy.text,
                children: [],
                switches: []
            }
        });
    }

    function reattachSlot(parentSlot, childSlot) {
        slotsDispatch({ type: 'attach', slotId: childSlot, newParentSlotId: parentSlot });
    }

    function getSlotPath(slotId) {
        var path = [];
        var node = slots[slotId];
        while (node.parent !== undefined) {
            path.push(slotId);
            slotId = node.parent;
            node = slots[slotId];
        }
        path.reverse();
        return path;
    }

    function attachSwitch(slotId, switchId) {
        slotsDispatch({ type: 'attach-switch', slotId: slotId, switchId: switchId });
        slotsDispatch({ type: 'detatch-switch', slotId: switches[switchId].slot, switchId: switchId });
        switchesDispatch({ type: "attach-slot", switchId: switchId, slotId: slotId });
    }

    function removeSwitch(switchId) {
        var slotId = switches[switchId].slot;
        slotsDispatch({ type: 'detatch-switch', slotId: slotId });
        switchesDispatch({ type: 'remove', switchesToRemove: [switchId]})
    }

    function onPropertyChange(switchId, property, value) {
        switch (property) {
            case "temperature":
            case "topP":
                value = parseFloat(value);
                if (isNaN(value) || value < 0 || value > 1) return;
                break;
            case "frequencyPen":
            case "presencePen":
                value = parseFloat(value);
                if (isNaN(value) || value < 0 || value > 2) return;
                break;
            case "bestOf":
                value = parseInt(value);
                if (isNaN(value) || value < 1 || value > 20) return;
                break;
        }
        switchesDispatch({ type: 'change', switchId, property, value });
    }

    function textify(slotId) {
        var text = "";
        var node = slots[slotId];
        while (node.parent !== undefined) {
            text = node.text + text;
            node = slots[node.parent];
        }
        return text;
    }

    function handleGenerate(switchId) {
        if (switches[switchId].isLoading) return;

        var currSwitch = switches[switchId];
        var data = { ...currSwitch.properties };
        data.text = textify(currSwitch.slot);

        switchesDispatch({ type: 'loading', switchId, isLoading: true });

        // TODO: modify generation format depending on lens

        if (lenses[currSwitch.lens] === undefined) {
            axios
                .post(`http://localhost:5000/api/generate-new`, data)
                .then((response) => {
                    var newSlotId = generateId();
                    var newSwitchId = 'sw' + generateId();

                    slotsDispatch({
                        type: "create", slotId: newSlotId, slot: {
                            parent: currSwitch.slot,
                            type: "text",
                            text: response.data[0].text,
                            children: [],
                            switches: [newSwitchId]
                        }
                    });

                    var newSwitch = JSON.parse(JSON.stringify(currSwitch));
                    newSwitch.slot = newSlotId;
                    newSwitch.lens = -1;
                    newSwitch.isLoading = false;

                    setLastSlot(newSlotId);
                    switchesDispatch({ type: 'create', switchId: newSwitchId, newSwitch: newSwitch });
                    switchesDispatch({ type: 'loading', switchId, isLoading: false });
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
