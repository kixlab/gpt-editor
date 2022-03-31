import './public/css/App.css';
import 'bootstrap/dist/css/bootstrap.min.css';
import axios from 'axios';
import styled from "styled-components";

import React, { useState, useReducer, useCallback } from 'react';
import PromptEditor from './copywriting/PromptEditor';
import Switches from './copywriting/Switches';
import SwitchProperties from './copywriting/SwitchProperties';
import TextEditor from './copywriting/TextEditor';
import Lenses from './copywriting/Lenses';
import SwitchHistory from './copywriting/SwitchHistory';

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
            ['Write a creative ad for the following product to run on Facebook aimed at parents:', null ],
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
                if(!currSwitch.isChanged) {
                    var colorIndex = newSwitches['colorIndex']
                    currSwitch.color = colorWheel[colorIndex];
                    newSwitches['colorIndex'] = (colorIndex + 1) % colorWheel.length;
                    currSwitch.isChanged = true;
                }
                var changeData = {property, value};
                var lastChange = currSwitch.history[currSwitch.history.length - 1];
                if(lastChange.type === 'change' && lastChange.data.property === property) {
                    currSwitch.history[currSwitch.history.length - 1].data.value = value;
                } else {
                    currSwitch.history.push({
                        type: 'change',
                        data: changeData
                    })
                }
                return newSwitches;
            case 'loading':
                var { switchId, isLoading } = action; 
                if(newSwitches[switchId] === undefined) return newSwitches;
                newSwitches[switchId].isLoading = isLoading;
                return newSwitches;
            case 'track-generations':
                var { switchId, textInput, generations, isLoading } = action;
                var currSwitch = newSwitches[switchId];
                var data = {
                    type: 'generation',
                    data: {
                        input: textInput,
                        generations: generations
                    }
                }
                currSwitch.history.push(data);
                currSwitch.isLoading = isLoading === undefined ? false : isLoading;
                return newSwitches;
            default:
                throw new Error();
        }
    }, []);
    const [switches, switchesDispatch] = useReducer(switchesReducer, {'colorIndex': 0});

    const lensesReducer = useCallback((lenses, action) => {
        var newLenses = { ...lenses };
        switch (action.type) {
            case 'set-generations':
                var { lensId, generations } = action;
                if(newLenses[lensId] === undefined) return newLenses;
                newLenses[lensId].generations = generations;
                return newLenses;
            case 'change':
                var { lensId, property, value } = action;
                var currLens = newLenses[lensId];
                currLens[property] = value;
                return newLenses;
            case 'change-type':
                var { lensId, typeIndex, newType } = action;
                newLenses[lensId].types[typeIndex] = newType;
                return newLenses;
            case 'detatch-switch':
                var { lensId, list } = action;
                for(var i = 0; i < list.length; i++) {
                    var switchId = list[i];
                    newLenses[lensId].generations = newLenses[lensId].generations.filter(g => g.switchId !== switchId);
                }
                return newLenses;
            case 'pin-generation':
                var { lensId, idx } = action;
                var isPinned = newLenses[lensId].generations[idx].isPinned;
                newLenses[lensId].generations[idx].isPinned = !isPinned;
                return newLenses;
            default:
                throw new Error();
        }
    })

    const [lenses, lensesDispatch] = useReducer(lensesReducer, {
        0: {
            types: ["list", "sentiment"],
            generations: [],
            generationLength: 3
        }
    });

    const [isMeta, setIsMeta] = useState(false);
    const [selected, setSelected] = useState({type: null})
    const [hoverPath, setHoverPath] = useState(null);
    const [text, setText] = useState("");

    function handleKeyDown(e) {
        if (e.key === "Meta") {
            setIsMeta(true);
            console.log(switches);
        } else if(e.key === 'c' && isMeta) {
            if(selected.type === 'slots') {
                copySlots(selected.data, slots.path[selected.data]);
            } else if(selected.type === 'switch') {
                copySwitch(selected.data);
            }
        } else if(e.key === 'Backspace' && selected.type !== null) {
            e.preventDefault();
            if(selected.type === 'slots') {
                removeSlot(selected.data, slots.path[selected.data]);
                setSelected({type: null});
            } else if(selected.type === 'switch') {
                lensesDispatch({type: "detatch-switch", lensId: 0, list: [selected.data]})
                switchesDispatch({type: 'remove', switchesToRemove: [selected.data]});
                setSelected({type: null});
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
            if(switches[id].path && switches[id].path[depth] === index) {
                switchesDispatch({ type: 'attach-path', switchId: id, path: null});
            } else if(slots.entries[depth].length == 2 && switches[id].path[depth] === 1) {
                var newPath = switches[id].path.slice();
                newPath.splice(depth, 1);
                switchesDispatch({type: 'attach-path', switchId: id, path: newPath});
            }
        });
    }

    function addPromptLine() {
        slotsDispatch({ type: 'create-line' });
        var switchIds = Object.keys(switches).filter(id => id !== 'colorIndex');
        switchIds.forEach(id => {
            switchesDispatch({ type: 'attach-path', switchId: id, path: switches[id].path ? [...switches[id].path, 1] : null});
        });
    }

    function textify() {
        var result = "";
        for(var i = 0; i < slots.path.length; i++) {
            var index = slots.path[i];
            var entry = slots.entries[i][index];
            if(entry === null) continue;
            result += entry + "\n\n";
        }
        return result;
    }

    function handleGenerate(switchId) {
        if (switches[switchId].isLoading || switches[switchId].path === null) return;

        var otherLoading = Object.keys(switches).some(id => switches[id].isLoading);
        if(otherLoading) return;

        var currSwitch = switches[switchId];
        switchesDispatch({ type: 'loading', switchId: switchId, isLoading: true });
        
        var currSwitch = switches[switchId];
        var currLens = lenses[0];
        var data = { ...currSwitch.properties };
        data.text = textify();

        switchesDispatch({ type: 'loading', switchId, isLoading: true });

        data.n = 3;
        data.length = currLens.generationLength;
        data.switchId = switchId;
        data.existing = currLens.generations;
        axios
        .post(`http://localhost:5000/api/generate-length`, data)
        .then((response) => {
            var newGenerations = response.data;
            newGenerations = newGenerations.map(generation => {
                return {...generation, text: generation.text.trim()}
            })
            lensesDispatch({type: "set-generations", lensId: 0, generations: newGenerations});
            switchesDispatch({ 
                type: 'track-generations', 
                switchId, textInput: data.text, 
                generations: newGenerations.filter(g => g.switchId === switchId && g.isNew).map(g => g.text)
            });
        });
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

    function createSwitch() {
        var newSwitchId = "s" + generateId();
        var properties = {
            engine: "text-davinci-002",
            temperature: 0.7,
            topP: 1,
            frequencyPen: 0,
            presencePen: 0,
            bestOf: 1
        }
        switchesDispatch({ 
            type: 'create', switchId: newSwitchId,
            newSwitch: {
                model: "GPT-3",
                path: null,
                color: "#71AAFF",
                isChanged: false,
                history: [{type: "create", data: {...properties}}],
                properties: properties
            }
        })
    }

    function copySwitch(switchId) {
        var newSwitchId = "s" + generateId();
        var toCopy = switches[switchId];
        var properties = {
            engine: toCopy.properties.engine,
            temperature: toCopy.properties.temperature,
            topP: toCopy.properties.topP,
            frequencyPen: toCopy.properties.frequencyPen,
            presencePen: toCopy.properties.presencePen,
            bestOf: toCopy.properties.bestOf
        }
        switchesDispatch({ 
            type: 'create', switchId: newSwitchId,
            newSwitch: {
                model: toCopy.model,
                path: toCopy.path,
                color: toCopy.color,
                isChanged: false,
                history: [{type: "create", data: {...properties}}],
                properties: properties
            }
        })
    }

    function handleCanvasClick(e) {
        setSelected({type: null});
    }
    
    function changeText(newText) {
        setText(newText);
    }

    function changeLens(lensId, property, value) {
        lensesDispatch({ type: 'change', lensId, property, value });
    }

    function changeLensType(lensId, typeIndex, newType) {
        lensesDispatch({ type: 'change-type', lensId, typeIndex, newType });
    }

    function copyGeneration(newText) {
        setText(text + " " + newText);
    }

    function clearLens() {
        var newGenerations = lenses[0].generations.filter(g => g.isPinned);
        lensesDispatch({type: "set-generations", lensId: 0, generations: newGenerations});
    }

    function pinGeneration(idx) {
        lensesDispatch({type: "pin-generation", lensId: 0, idx});
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
                    createSwitch={createSwitch}
                />
                {selected && selected.isSideOpen ?
                    (selected.isSideOpen === "properties" ? 
                        <SwitchProperties
                            switches={switches} switchId={selected.data}
                            onPropertyChange={onPropertyChange}
                        /> :
                        <SwitchHistory
                            switches={switches} switchId={selected.data}
                        />
                    ) : ""
                }
            </LeftColumn>
            <RightColumn>
                <TextEditor text={text} changeText={changeText} />
                <Lenses 
                    lenses={lenses} lensId={0} switches={switches}
                    changeLens={changeLens} changeLensType={changeLensType}
                    copyGeneration={copyGeneration} clearLens={clearLens}
                    pinGeneration={pinGeneration}
                />
            </RightColumn>
        </div>
    );
}

const LeftColumn = styled.div`
    width: calc(40% - 120px - 30px);
    margin-left: 120px;
    margin-top: 60px;
`;

const RightColumn = styled.div`
    width: calc(60% - 120px - 30px);
    margin-left: 60px;
    margin-top: 60px;
`;

export default App;
