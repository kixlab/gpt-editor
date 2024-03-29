import './public/css/App.css';
import 'bootstrap/dist/css/bootstrap.min.css';
import "typeface-roboto";
import axios from 'axios';

import React, { useState, useReducer, useCallback } from 'react';
import TextEditor from './brainstorming/Editor';
import WidgetArea from './brainstorming/WidgetArea';
import { loremipsum } from './brainstorming/LoremIpsum'
import { fas } from '@fortawesome/free-solid-svg-icons';

function generateId() {
    return Math.random().toString(36).slice(2, 12);
}

const colorWheel = ['#2BB115', '#FFAE50', '#BE6DE4', '#FF7A50', '#DAA06D', '#32D198', '#5A58E4', '#EA9EEC'];

function AppBrain() {
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
            case 'add-keyword':
                var { slotId, keyword } = action;
                newSlots[slotId].keyword = keyword;
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
            case 'attach-lens':
                var { switchId, lensId } = action;
                newSwitches[switchId].lens = lensId;
                return newSwitches;
            default:
                throw new Error();
        }
    }, []);
    const [switches, switchesDispatch] = useReducer(switchesReducer, {'colorIndex': 0});

    const lensesReducer = useCallback((lenses, action) => {
        var newLenses = { ...lenses };
        switch (action.type) {
            case 'create':
                var { lensId, newLens } = action;
                newLenses[lensId] = newLens;
                return newLenses;
            case 'attach-switch':
                var { lensId, switchId } = action;
                newLenses[lensId].switches.push(switchId);
                return newLenses;
            case 'detatch-switch':
                if(action.lensId !== undefined && action.lensId === -1) return newLenses;
                var listOfPairs = action.list;
                if(listOfPairs === undefined) {
                    listOfPairs = [{lensId: action.lensId, switchId: action.switchId}];
                }
                for(var i = 0; i < listOfPairs.length; i++) {
                    var {lensId, switchId} = listOfPairs[i];
                    var index = newLenses[lensId].switches.indexOf(switchId);
                    newLenses[lensId].switches.splice(index, 1);
                    if(newLenses[lensId].switches.length === 0) {
                        delete newLenses[lensId];
                        continue
                    }
                    newLenses[lensId].generations = newLenses[lensId].generations.filter(g => g.switchId !== switchId);
                }
                return newLenses;
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
            case 'set-timer':
                var { lensId } = action;
                if(newLenses[lensId] === undefined) return newLenses;
                newLenses[lensId].timer = setInterval(() => {
                    var currLens = lenses[lensId];
                    var currSwitch = switches[currLens.switches[0]];
                    var data = { ...currSwitch.properties };
                    data.text = textify(currSwitch.slot);
                    data.text += currLens.generations.map(g => g.text).join("");
                    data.n = 1;
                    axios
                    .post(`http://localhost:5000/api/generate-one`, data)
                    .then((response) => {
                        var newGenerations = response.data;
                        switchesDispatch({ 
                            type: 'track-generations', 
                            switchId: currLens.switches[0], textInput: data.text, 
                            generations: newGenerations.map(g => g.text),
                            isLoading: true
                        });
                        newGenerations = currLens.generations.concat(newGenerations);
                        lensesDispatch({type: "set-generations", lensId: currSwitch.lens, generations: newGenerations});
                    });
                }, 10000);
                return newLenses;
            case 'clear-timer':
                var { lensId } = action;
                if(newLenses[lensId] === undefined) return newLenses;
                clearInterval(newLenses[lensId].timer);
                newLenses[lensId].timer = null;
                return newLenses;
            default:
                throw new Error();
        }
    })
    const [lenses, lensesDispatch] = useReducer(lensesReducer, {});

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
                keyword: "...",
                children: [],
                switches: [] //newSwitchId]
            }
        });
        getKeyword(newSlotId, value);
        
        /*
        switchesDispatch({type: "create", switchId: newSwitchId,
            newSwitch: {
                model: "GPT-3",
                slot: newSlotId,
                lens: -1,
                color: "#71AAFF",
                isChanged: false,
                properties: {
                    engine: "davinci",
                    temperature: 0.7,
                    topP: 1,
                    frequencyPen: 0,
                    presencePen: 0,
                    bestOf: 1
            }
        }});
        */

        setLastSlot(newSlotId);
        setCurrentDepth(getSlotPath(lastSlot).length);
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
        var lensesToDetatch = [];
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
                        if (switches[switchId].lens !== -1) {
                            lensesToDetatch.push({lensId: switches[switchId].lens, switchId});
                        }
                    }
                }
                slotsToRemove.push(childId);
            }
            children = newChildren;
        }

        slotsDispatch({ type: "remove", slotId: slotId, slotsToRemove });
        switchesDispatch({ type: "remove", switchesToRemove });
        lensesDispatch({ type: "detatch-switch", list: lensesToDetatch });
        setLastSlot(parentSlotId);
        setHoverSlot(parentSlotId);
    }

    function detatchSlot(slotId) {
        slotsDispatch({ type: 'attach', slotId: slotId, newParentSlotId: 0 });
    }

    function copySlot(slotId) {
        var toCopy = slots[slotId];
        var newSlotId = generateId();
        slotsDispatch({
            type: "create", slotId: newSlotId, slot: {
                parent: toCopy.parent,
                type: toCopy.type,
                text: toCopy.text,
                keyword: toCopy.keyword,
                children: [],
                switches: []
            }
        });
    }

    function reattachSlot(parentSlot, childSlot) {
        var currChildren = slots[childSlot].children;
        var nextChildren = [];
        while(currChildren.length !== 0) {
            for(var i = 0; i < currChildren.length; i++) {
                var childId = currChildren[i];
                if(childId === parentSlot)
                    return;
                nextChildren = nextChildren.concat(slots[childId].children);
            }
            currChildren = nextChildren
            nextChildren = []
        }
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

    function createSwitch(slotId) {
        if(slotId === 'ROOT') slotId = null;

        var newSwitchId = "sw" + generateId();

        if(slotId !== null)
            slotsDispatch({ type: 'attach-switch', slotId: slotId, switchId: newSwitchId });
        
        var properties = {
            engine: "text-davinci-001",
            temperature: 0.7,
            topP: 1,
            frequencyPen: 0,
            presencePen: 0,
            bestOf: 1
        };
        switchesDispatch({type: "create", switchId: newSwitchId,
            newSwitch: {
                model: "GPT-3",
                slot: slotId,
                lens: -1,
                color: "#71AAFF",
                isChanged: false,
                history: [{type: 'create', data: {...properties}}],
                properties: properties
            }
        });
    }

    function attachSwitch(slotId, switchId) {
        slotsDispatch({ type: 'attach-switch', slotId: slotId, switchId: switchId });
        if(switches[switchId].slot !== null)
            slotsDispatch({ type: 'detatch-switch', slotId: switches[switchId].slot, switchId: switchId });
        switchesDispatch({ type: "attach-slot", switchId: switchId, slotId: slotId });
    }

    function removeSwitch(switchId) {
        var slotId = switches[switchId].slot;
        slotsDispatch({ type: 'detatch-switch', slotId, switchId });
        lensesDispatch({ type: 'detatch-switch', lensId: switches[switchId].lens, switchId: switchId });
        switchesDispatch({ type: 'remove', switchesToRemove: [switchId]})
    }

    function copySwitch(switchId) {
        var toCopy = switches[switchId];
        var newSwitchId = "sw" + generateId();
        if(toCopy.slot !== null)
            slotsDispatch({ type: 'attach-switch', slotId: toCopy.slot, switchId: newSwitchId });
        if(lenses[toCopy.lens] !== undefined && lenses[toCopy.lens].switches.length < 4 && lenses[toCopy.lens].type !== 'peek') {
            var copiedProperties = {
                engine: toCopy.properties.engine,
                temperature: toCopy.properties.temperature,
                topP: toCopy.properties.topP,
                frequencyPen: toCopy.properties.frequencyPen,
                presencePen: toCopy.properties.presencePen,
                bestOf: toCopy.properties.bestOf
            }
            switchesDispatch({
                type: "create", switchId: newSwitchId,
                newSwitch: {
                    model: toCopy.model,
                    slot: toCopy.slot,
                    lens: toCopy.lens,
                    color: toCopy.color,
                    isChanged: false,
                    history: [{type: 'create', data: {...copiedProperties}}],
                    properties: copiedProperties
            }});
            lensesDispatch({ type: 'attach-switch', lensId: toCopy.lens, switchId: newSwitchId });
        } else {
            var copiedProperties = {
                engine: toCopy.properties.engine,
                temperature: toCopy.properties.temperature,
                topP: toCopy.properties.topP,
                frequencyPen: toCopy.properties.frequencyPen,
                presencePen: toCopy.properties.presencePen,
                bestOf: toCopy.properties.bestOf
            }
            switchesDispatch({
                type: "create", switchId: newSwitchId,
                newSwitch: {
                    model: toCopy.model,
                    slot: toCopy.slot,
                    lens: -1,
                    color: toCopy.color,
                    isChanged: false,
                    history: [{type: 'create', data: {...copiedProperties}}],
                    properties: copiedProperties
                }
            });
        }
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
        if (switches[switchId].isLoading && lenses[switches[switchId].lens].type === 'peek') {
            var currLens = lenses[switches[switchId].lens];
            switchesDispatch({ type: 'loading', switchId, isLoading: false });
            lensesDispatch({ type: 'clear-timer', lensId: switches[switchId].lens });
            return;
        }

        var isOtherLoading = false;
        for (var i = 0; i < lenses[switches[switchId].lens].switches.length; i++) {
            if (switches[lenses[switches[switchId].lens].switches[i]].isLoading) {
                isOtherLoading = true;
            }
        }
        if (switches[switchId].slot === null || switches[switchId].isLoading || isOtherLoading) return;

        var currSwitch = switches[switchId];
        var currLens = lenses[currSwitch.lens];
        var data = { ...currSwitch.properties };
        data.text = textify(currSwitch.slot);

        switchesDispatch({ type: 'loading', switchId, isLoading: true });

        // TODO: modify generation format depending on lens

        if (currLens === undefined) {
            data.n = 1;
            axios
            .post(`http://localhost:5000/api/generate-one`, data)
            .then((response) => {
                var newSlotId = generateId();
                var newSwitchId = 'sw' + generateId();
                /*
                var newSwitch = JSON.parse(JSON.stringify(currSwitch));
                newSwitch.slot = newSlotId;
                newSwitch.lens = -1;
                newSwitch.isLoading = false;
                newSwitch.isChanged = false;

                switchesDispatch({ type: 'create', switchId: newSwitchId, newSwitch: newSwitch });
                */
                switchesDispatch({ 
                    type: 'track-generations', 
                    switchId, textInput: data.text, 
                    generations: [response.data[0].text]
                });

                slotsDispatch({
                    type: "create", slotId: newSlotId, slot: {
                        parent: currSwitch.slot,
                        type: "text",
                        text: response.data[0].text,
                        keyword: "...",
                        children: [],
                        switches: []
                    }
                });
                getKeyword(newSlotId, response.data[0].text);
                
                setLastSlot(newSlotId);
            });
        } else if(currLens.type === 'list' || currLens.type === 'space') {
            data.n = 3;
            data.existing = currLens.generations;
            data.switchId = switchId;
            axios
            .post(`http://localhost:5000/api/generate-new`, data)
            .then((response) => {
                var newGenerations = response.data;
                lensesDispatch({type: "set-generations", lensId: currSwitch.lens, generations: newGenerations});
                switchesDispatch({ 
                    type: 'track-generations', 
                    switchId, textInput: data.text, 
                    generations: newGenerations.filter(g => g.switchId === switchId && g.isNew).map(g => g.text)
                });
            });
        } else if(currLens.type === 'peek') {
            lensesDispatch({ type: 'set-timer', lensId: switches[switchId].lens });
        }
    }

    function chooseLens(switchId, type) {
        var newLensId = "l" + generateId();

        var newLens = {
            type: type,
            switches: [switchId],
            generations: [],
            isCollapsed: false,
            isPinned: false
        }
        switchesDispatch({ type: 'attach-lens', switchId, lensId: newLensId });
        lensesDispatch({ type: 'create', lensId: newLensId, newLens: newLens });
    }

    function attachLens(switchId, lensId) {
        if(lenses[lensId].switches.includes(switchId) || lenses[lensId].switches.length >= 4 || lenses[lensId].type === 'peek') return;
        if(switches[switchId].lens === -1) {
            lensesDispatch({ type: 'detatch-switch', lensId: switches[switchId].lens, switchId: switchId });
        }
        switchesDispatch({ type: 'attach-lens', switchId, lensId });
        lensesDispatch({ type: 'attach-switch', lensId, switchId });
    }

    function detatchLens(switchId, lensId) {
        switchesDispatch({ type: 'attach-lens', switchId, lensId: -1 });
        lensesDispatch({ type: 'detatch-switch', lensId, switchId });
    }

    function slotifyGenerations(switchId, values) {
        var currSwitch = switches[switchId];
        var parentSlot = currSwitch.slot;
        if(values.length === 0 ) return;
        for(var i = 0; i < values.length; i++) {
            var newSlotId = generateId();
            var newSwitchId = 'sw' + generateId();

            /*
            var newSwitch = JSON.parse(JSON.stringify(currSwitch));
            newSwitch.slot = newSlotId;
            newSwitch.lens = -1;
            newSwitch.isLoading = false;
            newSwitch.isChanged = false;

            switchesDispatch({ type: 'create', switchId: newSwitchId, newSwitch: newSwitch });
            */

            slotsDispatch({
                type: "create", slotId: newSlotId, slot: {
                    parent: parentSlot,
                    type: "text",
                    text: values[i],
                    keyword: "...",
                    children: [],
                    switches: []
                }
            });
            getKeyword(newSlotId, values[i]);
            parentSlot = newSlotId;
        }
        setLastSlot(newSlotId);
    }

    function changeLensProperty(lensId, property, value) {
        lensesDispatch({ type: 'change', lensId, property, value });
    }

    function clearLens(lensId) {
        lensesDispatch({type: "set-generations", lensId: lensId, generations: []});
    }

    function getKeyword(slotId, text) {
        var existingKeywords = Object.values(slots).map(s => s.keyword);
        var data = { slotId, text , existing: existingKeywords};
        axios
        .post(`http://localhost:5000/api/get-keyword`, data)
        .then((response) => {
            var slotId = response.data.slotId;
            var keyword = response.data.keyword;
            slotsDispatch({ type: 'add-keyword', slotId, keyword });
            return keyword;
        });
    }

    return (
        <div className="AppBrain" onKeyDown={handleKeyDown} onKeyUp={handleKeyUp}>
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
                switches={switches} createSwitch={createSwitch} attachSwitch={attachSwitch} 
                removeSwitch={removeSwitch} onPropertyChange={onPropertyChange} copySwitch={copySwitch}
                handleGenerate={handleGenerate} clearLens={clearLens}
                lenses={lenses} chooseLens={chooseLens} attachLens={attachLens} detatchLens={detatchLens}
                slotifyGenerations={slotifyGenerations} changeLensProperty={changeLensProperty}
            />
        </div>
    );
}

export default AppBrain;
