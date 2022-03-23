import './public/css/App.css';
import 'bootstrap/dist/css/bootstrap.min.css';
import "typeface-roboto";
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
                if(newSlots[depth] === undefined) {
                    newSlots[depth] = [newText];
                } else {
                    newSlots[depth].push(newText);
                }
                return newSlots;
            case 'change':
                var { changedText, depth, index } = action;
                newSlots[depth][index] = changedText;
                console.log(newSlots);
                return newSlots;
            case 'remove':
                var { depth, index } = action;
                newSlots[depth].splice(index, 1);
                return newSlots;
            default:
                throw new Error();
        }
    }, []);
    const [slots, slotsDispatch] = useReducer(slotsReducer, 
        [
            ["Write a creative ad for the following product to run on Facebook aimed at parents:","Write a creative ad for the following product to run on Twitter aimed at parents:"],
            ["Product: Learning Room is a virtual environment to help students from kindergarten to high school excel in school."],
        ]
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
    const [currPath, setCurrPath] = useState([0, 0]);

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

    function createSlots(text, depth) {
        slotsDispatch({
            type: 'create',
            newText: "",
            depth: depth
        });
    }
    
    function copySlots(depth, index) {
        var newText = slots[depth][index];
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
        var copyPath = [...currPath];
        copyPath[depth] = index;
        setCurrPath(copyPath);
    }

    return (
        <div className="App" onKeyDown={handleKeyDown} onKeyUp={handleKeyUp}>
            <PromptEditor
                isMeta={isMeta} slots={slots} currPath={currPath}
                createSlots={createSlots} copySlots={copySlots} changeSlots={changeSlots}
                changePath={changePath}
            />
        </div>
    );
}

export default App;
