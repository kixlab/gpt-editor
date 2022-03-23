import './public/css/App.css';
import 'bootstrap/dist/css/bootstrap.min.css';
import axios from 'axios';

import React, { useState, useReducer, useCallback } from 'react';
import PromptEditor from './copywriting/PromptEditor';

function generateId() {
    return Math.random().toString(36).slice(2, 12);
}

const colorWheel = ['#2BB115', '#FFAE50', '#BE6DE4', '#FF7A50', '#DAA06D', '#32D198', '#5A58E4', '#EA9EEC'];

function App() {
    const slotsReducer = useCallback((slots, action) => {
        var newSlots = JSON.parse(JSON.stringify(slots));
        switch (action.type) {
            case 'create':
                var { newText, depth } = action;
                newSlots.entries[depth].unshift(newText);
                newSlots.path[depth] = 0;
                return newSlots;
            case 'change':
                var { changedText, depth, index } = action;
                newSlots.entries[depth][index] = changedText;
                return newSlots;
            case 'remove':
                var { depth, index } = action;
                //TODO: check if path would be error
                newSlots.entries[depth].splice(index, 1);
                if(newSlots.entries[depth].length === 1) {
                    newSlots.entries.splice(depth, 1);
                    newSlots.path.splice(depth, 1);
                } else if(newSlots.entries[depth].length <= newSlots.path[depth]) {
                    newSlots.path[depth] = 0;
                }
                return newSlots;
            case 'create-line':
                newSlots.entries.push(['', null]);
                newSlots.path.push(0)
                console.log(newSlots);
                return newSlots;
            case 'change-path':
                var { depth, index } = action;
                newSlots.path[depth] = index;
                return newSlots;
            default:
                throw new Error();
        }
    }, []);
    const [slots, slotsDispatch] = useReducer(slotsReducer, 
        {entries: [['', null ]],
        path: [0]}
    );

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
                var currSwitch = newSwitches[switchId];
                currSwitch.properties[property] = value;
                if(currSwitch.color === '#71AAFF') {
                    var colorIndex = newSwitches['colorIndex']
                    currSwitch.color = colorWheel[colorIndex];
                    newSwitches['colorIndex'] = (colorIndex + 1) % colorWheel.length;
                }
                return newSwitches;
            case 'loading':
                var { switchId, isLoading } = action; 
                if(newSwitches[switchId] === undefined) return newSwitches;
                newSwitches[switchId].isLoading = isLoading;
                return newSwitches;
            default:
                throw new Error();
        }
    }, []);
    const [switches, switchesDispatch] = useReducer(switchesReducer, {'colorIndex': 0});
    const [isMeta, setIsMeta] = useState(false);
    const [selected, setSelected] = useState({type: null})

    function handleKeyDown(e) {
        if (e.key === "Meta") {
            setIsMeta(true);
        } else if(e.key === 'c' && isMeta) {
            if(selected.type === 'slots') {
                copySlots(selected.data, slots.path[selected.data]);
            }
        } else if(e.key === 'd' && isMeta) {
            e.preventDefault();
            if(selected.type === 'slots') {
                removeSlot(selected.data, slots.path[selected.data]);
            }
        }
    }

    function handleKeyUp(e) {
        if (e.key === "Meta") {
            setIsMeta(false);
        }
    }

    function createSlots(text, depth) {
        slotsDispatch({
            type: 'create',
            newText: "",
            depth: depth
        });
    }
    
    function copySlots(depth, index) {
        var newText = slots.entries[depth][index];
        setSelected({type: null})
        slotsDispatch({
            type: 'create',
            newText: newText,
            depth: depth
        });
    }

    function changeSlots(changedText, depth, index) {
        slotsDispatch({ type: "change", changedText, depth, index });
    }

    function changePath(depth, index) {
        if(selected.type === 'slots') setSelected({type: null})
        slotsDispatch({ type: 'change-path', depth, index})
    }

    function removeSlot(depth, index) {
        setSelected({type: null});
        slotsDispatch({ type: "remove", depth, index });
    }

    function addPromptLine() {
        slotsDispatch({ type: 'create-line' });
    }

    return (
        <div className="App" onKeyDown={handleKeyDown} onKeyUp={handleKeyUp} tabIndex="0">
            <PromptEditor
                isMeta={isMeta} slots={slots}
                createSlots={createSlots} copySlots={copySlots} changeSlots={changeSlots}
                changePath={changePath} selected={selected} setSelected={setSelected}
                addPromptLine={addPromptLine}
            />
        </div>
    );
}

export default App;
