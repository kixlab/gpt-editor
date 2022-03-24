import './public/css/App.css';
import 'bootstrap/dist/css/bootstrap.min.css';
import axios from 'axios';
import styled from "styled-components";

import React, { useState, useReducer, useCallback } from 'react';
import PromptEditor from './copywriting/PromptEditor';
import Switches from './copywriting/Switches';
import SwitchProperties from './copywriting/SwitchProperties';


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
                newSlots.path.push(0);
                return newSlots;
            case 'change-path':
                var { depth, index } = action;
                newSlots.path[depth] = index;
                return newSlots;
            case 'set-path':
                var { path } = action;
                newSlots.path = path;
                return newSlots;
            default:
                throw new Error();
        }
    }, []);
    const [slots, slotsDispatch] = useReducer(slotsReducer, 
        {entries: [
            ['Write a creative ad for the following product to run on Facebook aimed at parents:', 'Write a creative ad for the following product to run on Twitter aimed at parents:', null ],
            ["Product: Learning Room is a virtual environment to help students from kindergarten to high school excel in school.", null]
        ],
        path: [0, 0]}
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
            case 'attach-path':
                var { switchId, path } = action;
                newSwitches[switchId].path = path;
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
    const [switches, switchesDispatch] = useReducer(switchesReducer, {'colorIndex': 0,
        0: {
            model: "GPT-3",
            path: null,
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
        1: {
            model: "GPT-3",
            path: [1, 0],
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
            path: [1, 1],
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
    });
    const [isMeta, setIsMeta] = useState(false);
    const [selected, setSelected] = useState({type: null})
    const [hoverPath, setHoverPath] = useState(null);

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

    function setPath(path) {
        slotsDispatch({ type: 'set-path', path})
    }

    function removeSlot(depth, index) {
        setSelected({type: null});
        slotsDispatch({ type: "remove", depth, index });
        var switchIds = Object.keys(switches).filter(id => id !== 'colorIndex');
        switchIds.forEach(id => {
            if(switches[id].path && switches[id].path[depth] === index)
                switchesDispatch({ type: 'attach-path', switchId: id, path: null});
        });
    }

    function addPromptLine() {
        slotsDispatch({ type: 'create-line' });
        var switchIds = Object.keys(switches).filter(id => id !== 'colorIndex');
        switchIds.forEach(id => {
            switchesDispatch({ type: 'attach-path', switchId: id, path: switches[id].path ? [...switches[id].path, 1] : null});
        });
    }

    function handleGenerate(switchId) {
        var currSwitch = switches[switchId];
        switchesDispatch({ type: 'loading', switchId: switchId, isLoading: true });
    }

    function attachPath(switchId, path) {
        switchesDispatch({ type: 'attach-path', switchId, path})
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

    function handleCanvasClick(e) {
        setSelected({type: null});
    }

    return (
        <div className="App" onKeyDown={handleKeyDown} onKeyUp={handleKeyUp} tabIndex="0" onClick={handleCanvasClick}>
            <LeftColumn>
                <PromptEditor
                    slots={slots}
                    createSlots={createSlots} copySlots={copySlots} changeSlots={changeSlots}
                    changePath={changePath} selected={selected} setSelected={setSelected}
                    addPromptLine={addPromptLine}
                    hoverPath={hoverPath}
                />
                <Switches
                    slots={slots} switches={switches}
                    selected={selected} setSelected={setSelected}
                    handleGenerate={handleGenerate} setPath={setPath}
                    hoverPath={hoverPath} setHoverPath={setHoverPath}
                    attachPath={attachPath} onPropertyChange={onPropertyChange}
                />
                {selected && selected.isProperties ?
                    <SwitchProperties
                        switches={switches} switchId={selected.data}
                        onPropertyChange={onPropertyChange}
                    />
                    : ""
                }
            </LeftColumn>
        </div>
    );
}

const LeftColumn = styled.div`
    width: calc(45% - 120px - 48px);
    margin-left: 120px;
    margin-top: 60px;
`;

export default App;
