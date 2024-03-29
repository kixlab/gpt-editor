import './public/css/App.css';
import 'bootstrap/dist/css/bootstrap.min.css';
import axios from 'axios';
import styled from "styled-components";

import React, { useState, useReducer, useCallback, useEffect } from 'react';
import PromptEditor from './copywriting/PromptEditor';
import Switches from './copywriting/Switches';
import SwitchProperties from './copywriting/SwitchProperties';
import TextEditor from './copywriting/TextEditor';
import Lenses from './copywriting/Lenses';
import SwitchHistory from './copywriting/SwitchHistory';
import Tooltip from './copywriting/Tooltip';
import Filter from './copywriting/Filter';

function generateId() {
    return Math.random().toString(36).slice(2, 12);
}

const params = new Proxy(new URLSearchParams(window.location.search), {
get: (searchParams, prop) => searchParams.get(prop),
});
// Get the value of "some_key" in eg "http://example.com/?some_key=some_value"
const HOST_NAME = window.location.host;
let isTreatment = parseInt(params.s) == 1; // "some_value"
let userId = params.u;

const colorWheel = ['#2BB115', '#FFAE50', '#BE6DE4', '#FF7A50', '#DAA06D', '#32D198', '#5A58E4', '#EA9EEC'];

function AppCopy() {
    const slotsReducer = useCallback((slots, action) => {
        var newSlots = JSON.parse(JSON.stringify(slots));
        switch (action.type) {
            case 'create':
                var { newText, depth } = action;
                newSlots.entries[depth].splice(-1, 0, newText);
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

    var temp = userId.split("-");
    const userIdType = temp[temp.length - 1];
    const initialSlots = isTreatment ? 
        [
            ['Write an ad for the following product', null ],
            ["Product: LangLang is an app that connects you to language teachers across the world.", "App: LangLang is an app that (1) allows you to track your language development, and (2) finds teachers that match what you need to improve on.", null],
            ["Tone: informative, friendly", "Tone: comical, humorous", null],
            ["Audience: college students", "Audience: busy parents", null]
        ] : (userIdType !== "2" ? 
                [
                    ['Write an ad for the following product', null ],
                    ["Product: LangLang is an app that connects you to language teachers across the world.", null],
                    ["Tone: informative, friendly", null],
                    ["Audience: college students", null]
                ] :
                [
                    ['Write an ad for the following product', null ],
                    ["App: LangLang is an app that (1) allows you to track your language development, and (2) finds teachers that match what you need to improve on.", null],
                    ["Tone: comical, humorous", null],
                    ["Audience: busy parents", null]
                ] 
            )
    const [slots, slotsDispatch] = useReducer(slotsReducer, 
        {entries: initialSlots,
        path: [0, 0, 0, 0]}
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
                var { lensId, idx, isPinned } = action;
                newLenses[lensId].generations[idx].isPinned = isPinned;
                return newLenses;
            case 'unnew-generation':
                var { lensId, idx } = action;
                newLenses[lensId].generations[idx].isNew = false;
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
    const [tooltip, setTooltip] = useState(null);
    const [filter, setFilter] = useState({
        isShown: false, 
        data: {
            input: "",
            engine: "all",
            temperature: [0.0, 1.0],
            presencePen: [0.0, 2.0],
            bestOf: [3, 20],
            output: ""
        }
    });

    useEffect(() => {
        var data = { userId: userId };
        axios
        .post(`http://${HOST_NAME}/api/get-recent`, data)
        .then((response) => {
            var generations = response.data['generations'];
            var text = response.data['text'];
            lensesDispatch({type: "set-generations", lensId: 0, generations: generations});
            setText(text);
        });
    }, []);

    function handleKeyDown(e) {
        if (e.key === "Meta") {
            setIsMeta(true);
            console.log(switches);
        } else if(e.key === 'c' && isMeta) {
            if(selected.type === 'slots') {
                copySlots(selected.data);
            } else if(selected.type === 'switch') {
                copySwitch(selected.data);
            }
        } else if(e.key === 'Backspace' && selected.type !== null && selected.type !== "property") {
            e.preventDefault();
            if(selected.type === 'slots') {
                removeSlot(selected.data);
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

    function createSlots(depth) {
        slotsDispatch({
            type: 'create',
            newText: "",
            depth: depth
        });
    }
    
    function copySlots(data) {
        if(!isTreatment) return;
        var depth = data[0];
        var index = data[1];
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

    function removeSlot(data) {
        var depth = data[0];
        var index = data[1];
        setSelected({type: null});
        slotsDispatch({ type: "remove", depth, index });
        return;
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

    function textify(path) {
        var result = "";
        console.log(slots.path);
        for(var i = 0; i < slots.path.length; i++) {
            var index = slots.path[i];
            if(index === null) continue;
            var entry = slots.entries[i][index];
            if(entry === null) continue;
            result += entry + "\n\n";
        }
        return result;
    }

    function handleGenerate(switchId) {
        if (switches[switchId].isLoading) return;

        var otherLoading = Object.keys(switches).some(id => switches[id].isLoading);
        //if(otherLoading) return;

        var currSwitch = switches[switchId];
        switchesDispatch({ type: 'loading', switchId: switchId, isLoading: true });
        
        var currSwitch = switches[switchId];
        var currLens = lenses[0];
        var data = { ...currSwitch.properties };
        data.text = textify(currSwitch.path);

        switchesDispatch({ type: 'loading', switchId, isLoading: true });

        data.n = 3;
        data.length = currLens.generationLength;
        data.switchId = switchId;
        data.userId = userId;
        axios
        .post(`http://${HOST_NAME}/api/generate-length`, data)
        .then((response) => {
            var newGenerations = response.data;
            newGenerations.forEach(g => {
                g.isNew = true;
                g.isPinned = null;
            });
            var generations = currLens.generations.concat(newGenerations);
            lensesDispatch({type: "set-generations", lensId: 0, generations: generations});

            switchesDispatch({ 
                type: 'track-generations', 
                switchId, textInput: data.text, 
                generations: newGenerations.filter(g => g.switchId === switchId && g.isNew).map(g => g.text)
            });

            var nextData = { userId: userId, sentences: generations, text: text };
            axios
            .post(`http://${HOST_NAME}/api/get-similarity`, nextData)
            .then((response) => {
                var generations = response.data;
                lensesDispatch({type: "set-generations", lensId: 0, generations: generations});
            });
        });
    }

    function attachPath(switchId, path) {
        switchesDispatch({ type: 'attach-path', switchId, path})
    }

    function onPropertyChange(switchId, property, value) {
        var defaultValues = {
            engine: 'text-davinci-001',
            temperature: 0.7,
            presencePen: 0,
            bestOf: 3
        }
        if(value == "") {
            value = defaultValues[property];
            switchesDispatch({ type: 'change', switchId, property, value });
            return;
        }
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
                if (isNaN(value) || value < 3 || value > 20) return;
                break;
        }
        switchesDispatch({ type: 'change', switchId, property, value });
    }

    function createSwitch() {
        var newSwitchId = "s" + generateId();
        var properties = {
            engine: "text-davinci-001",
            temperature: 0.7,
            topP: 1,
            frequencyPen: 0,
            presencePen: 0,
            bestOf: 3
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
        setFilter({isShown: false, data: filter.data});
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
        if(text ===  "")
            setText(newText);
        else
            setText(text + " " + newText);
    }

    function clearLens() {
        var newGenerations = lenses[0].generations.filter(g => g.isPinned !== null);
        lensesDispatch({type: "set-generations", lensId: 0, generations: newGenerations});
    }

    function pinGeneration(idx, type, value) {
        var isPinned = lenses[0].generations[idx].isPinned;
        if(type == "click") {
            if(isPinned == null) { 
                lensesDispatch({type: "pin-generation", lensId: 0, idx, isPinned: ""});
            } else {
                lensesDispatch({type: "pin-generation", lensId: 0, idx, isPinned: null});
            }
        } else {
            lensesDispatch({type: "pin-generation", lensId: 0, idx, isPinned: value});
        }
    }

    function toggleFilter() {
        setFilter({isShown: !filter.isShown, data: filter.data});
    }

    function setFilterData(property, index, value) {
        var newData = {...filter.data};
        if(index == null)
            newData[property] = value;
        else
            newData[property][index] = value;
        setFilter({isShown: filter.isShown, data: newData});
    }

    function resetFilter() {
        setFilter({
            isShown: filter.isShown,
            data: {
                input: "",
                engine: "all",
                temperature: [0.0, 1.0],
                presencePen: [0.0, 2.0],
                bestOf: [3, 20],
                output: ""
            }
        });
    }

    function toggleNewGeneration(idx) {
        lensesDispatch({type: "unnew-generation", lensId: 0, idx});
    }

    useEffect(() => {
        createSwitch();
    }, []);

    return (
        <div className="App" onKeyDown={handleKeyDown} onKeyUp={handleKeyUp} tabIndex="0" onClick={handleCanvasClick}>
            <LeftColumn>
                <PromptEditor
                    slots={slots}
                    createSlots={createSlots} copySlots={copySlots} changeSlots={changeSlots}
                    changePath={changePath} selected={selected} setSelected={setSelected}
                    addPromptLine={addPromptLine}
                    hoverPath={hoverPath}
                    isTreatment={isTreatment}
                />
                <Switches
                    slots={slots} switches={switches}
                    selected={selected} setSelected={setSelected}
                    handleGenerate={handleGenerate} setPath={setPath}
                    hoverPath={hoverPath} setHoverPath={setHoverPath}
                    attachPath={attachPath} onPropertyChange={onPropertyChange}
                    createSwitch={createSwitch}
                    isTreatment={isTreatment}
                />
                {selected && selected.type == "property" ?
                    <SwitchProperties
                        switches={switches} switchId={selected.data.switchId}
                        property={selected.data.property} value={switches[selected.data.switchId].properties[selected.data.property]}
                        onPropertyChange={onPropertyChange}
                    /> : ""
                }
            </LeftColumn>
            <RightColumn>
                <TextEditor text={text} changeText={changeText} />
                <Lenses 
                    lenses={lenses} lensId={0} switches={switches}
                    changeLens={changeLens} changeLensType={changeLensType}
                    copyGeneration={copyGeneration} clearLens={clearLens}
                    pinGeneration={pinGeneration} setTooltip={setTooltip}
                    toggleFilter={toggleFilter} filter={filter}
                    isTreatment={isTreatment} toggleNewGeneration={toggleNewGeneration}
                />
            </RightColumn>
            {tooltip && <Tooltip tooltip={tooltip}/>}
            {filter.isShown && <Filter filter={filter} setFilterData={setFilterData} resetFilter={resetFilter}/>}
        </div>
    );
}

const LeftColumn = styled.div`
    width: calc(45% - 100px - 20px);
    margin-left: 100px;
    margin-top: 60px;
`;

const RightColumn = styled.div`
    width: calc(55% - 100px - 20px);
    margin-left: 40px;
    margin-top: 60px;
`;

export default AppCopy;
