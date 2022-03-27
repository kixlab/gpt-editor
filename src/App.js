import './public/css/App.css';
import 'bootstrap/dist/css/bootstrap.min.css';
import axios from 'axios';
import styled from "styled-components";

import React, { useState, useReducer, useCallback, useEffect } from 'react';

import TextEditor from './emailing/TextEditor';
import Buttons from './emailing/Buttons';
import HoverLens from './emailing/HoverLens';

function generateId() {
    return Math.random().toString(36).slice(2, 12);
}

const colorWheel = ['#2BB115', '#FFAE50', '#BE6DE4', '#FF7A50', '#DAA06D', '#32D198', '#5A58E4', '#EA9EEC'];

function App() {
    const buttonsReducer = useCallback((buttons, action) => {
        var newButtons = JSON.parse(JSON.stringify(buttons));
        switch (action.type) {
            case 'create':
                var { buttonId, newButton } = action;
                newButtons[buttonId] = newButton;
                return newButtons
            case 'remove':
                var { buttonId } = action;
                delete newButtons[buttonId];
                return newButtons
            case 'add-slot':
                var { buttonId, slotId, index } = action;
                newButtons[buttonId].slots.splice(index, 0, slotId);
                return newButtons
            case 'remove-slot':
                var { buttonId, slotId } = action;
                newButtons[buttonId].slots = newButtons[buttonId].slots.filter(id => id !== slotId);
                return newButtons
            case 'add-switch':
                var { buttonId, switchId } = action;
                newButtons[buttonId].switches.push(switchId);
                return newButtons
            case 'remove-switch':
                var { buttonId, switchId } = action;
                newButtons[buttonId].switches = newButtons[buttonId].switches.filter(id => id !== switchId);
                return newButtons
            case 'set-lens':
                var { buttonId, lensId } = action;
                newButtons[buttonId].lens = lensId;
                return newButtons
            case 'change-output':
                var { buttonId, text } = action;
                newButtons[buttonId].outputPrefix = text;
                return newButtons
            case 'change-toggle':
                var { buttonId, property, value } = action;
                newButtons[buttonId][property] = value;
                return newButtons
            default:
                throw new Error();
        }
    });
    const [buttons, buttonsDispatch] = useReducer(buttonsReducer, {
        'a' : {
            slots: ['hey', 'hu'],
            switches: ['one', 'three'],
            lens: 'b',
            outputPrefix: "Changed text:",
            isLoading: false
        }
    });


    const slotsReducer = useCallback((slots, action) => {
        var newSlots = JSON.parse(JSON.stringify(slots));
        switch (action.type) {
            case 'create':
                var { slotId, slotType, text, button } = action;
                newSlots[slotId] = {type: slotType, text: text, button: button};
                return newSlots;
            case 'change':
                var { slotId, changedText } = action;
                newSlots[slotId].text = changedText;
                return newSlots;
            case 'remove':
                var { slotId } = action;
                delete newSlots[slotId];
                return newSlots;
            default:
                throw new Error();
        }
    }, []);
    const [slots, slotsDispatch] = useReducer(slotsReducer, {
        'hey': {
            type: 'input',
            text: "Change text to be more polite and friendly.",
            button: 'a'
        },
        'hu': {
            type: 'selection',
            text: "Original text:",
            button: 'a'
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
                var { switchId } = action;
                delete newSwitches[switchId];
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
                return newSwitches;
            default:
                throw new Error();
        }
    }, []);
    const [switches, switchesDispatch] = useReducer(switchesReducer, {'colorIndex': 0,
        'one': {
            model: "GPT-3",
            color: "#71AAFF",
            isChanged: false,
            button: 'a',
            properties: {
                engine: "text-davinci-002",
                temperature: 0.7,
                topP: 1,
                frequencyPen: 0,
                presencePen: 0,
                bestOf: 1
            }
        }, 
        'two': {
            model: "GPT-3",
            color: colorWheel[3],
            isChanged: false,
            button: -1,
            properties: {
                engine: "text-curie-001",
                temperature: 0.7,
                topP: 1,
                frequencyPen: 0,
                presencePen: 0,
                bestOf: 1
            }
        },
        'three': {
            model: "GPT-3",
            color: colorWheel[4],
            isChanged: false,
            button: 'a',
            properties: {
                engine: "text-curie-001",
                temperature: 0.7,
                topP: 1,
                frequencyPen: 0,
                presencePen: 0,
                bestOf: 1
            }
        }
    });

    const lensesReducer = useCallback((lenses, action) => {
        var newLenses = { ...lenses };
        switch (action.type) {
            case 'create':
                var { lensId, newLens } = action;
                newLenses[lensId] = newLens;
                return newLenses;
            case 'set-generations':
                var { lensId, generations } = action;
                if(newLenses[lensId] === undefined) return newLenses;
                newLenses[lensId].generations = generations;
                return newLenses;
            case 'change':
                var { lensId, lensType, properties } = action;
                var currLens = newLenses[lensId];
                currLens['type'] = lensType;
                currLens['properties'] = properties;
                return newLenses;
            case 'remove':
                var { lensId } = action;
                delete newLenses[lensId];
                return newLenses;
            default:
                throw new Error();
        }
    })
    const [lenses, lensesDispatch] = useReducer(lensesReducer, {
        'b': {
            type: 'list',
            generations: [],
            properties: {x: 'Positive', y: 'Joy'},
            button: 'a',
        }
    });

    const [isMeta, setIsMeta] = useState(false);
    const [selected, setSelected] = useState({type: null})
    const [text, setText] = useState("");
    const [selectedText, setSelectedText] = useState("");
    const [expandedButton, setExpandedButton] = useState(null);
    const [addGeneration, setAddGeneration] = useState(null);

    function handleKeyDown(e) {
        if (e.key === "Meta") {
            setIsMeta(true);
        } else if(isMeta && e.key === 'c') {
            if(selected.type === null) return;
            e.preventDefault()
            if(selected.type === 'button') {
                copyButton(selected.data);
                setSelected({type: null});
            } else if(selected.type === 'slot') {
                var buttonId = slots[selected.data].button
                copySlot(buttonId, selected.data);
                setSelected({type: null})
            } else if(selected.type === 'switch') {
                var buttonId = switches[selected.data].button;
                copySwitch(buttonId, selected.data);
                setSelected({type: null})
            }
        } else if(e.key === 'Backspace') {
            if(selected.type === null) return;
            if(selected.type === 'button') {
                removeButton(selected.data);
                setSelected({type: null});
            } else if(selected.type === 'slot') {
                var buttonId = slots[selected.data].button
                removeSlot(buttonId, selected.data);
                setSelected({type: null})
            } else if(selected.type === 'switch') {
                var buttonId = switches[selected.data].button
                removeSwitch(buttonId, selected.data);
                setSelected({type: null})
            }
        }
    }

    function handleKeyUp(e) {
        if (e.key === "Meta") {
            setIsMeta(false);
        }
    }

    function createButton() {
        var newButtonId = "b" + generateId();
        var newLensId = "l" + generateId();

        var newButton = {
            slots: [],
            switches: [],
            lens: newLensId,
            outputPrefix: "",
            isLoading: false
        }
        var newLens = {
            type: 'list',
            generations: [],
            properties: {x: "Positive", y: "Joy"},
            button: newButtonId,
        }

        buttonsDispatch({type: 'create', buttonId: newButtonId, newButton: newButton});
        lensesDispatch({type: "create", lensId: newLensId, newLens: newLens});
    }

    function copyButton(buttonId) {
        var toCopyButon = buttons[buttonId];
        var newButtonId = "b" + generateId();

        var copiedSlots = [];
        var copiedSwitches = [];
        var copiedLens = "";
        for(var i = 0; i < toCopyButon.slots.length; i++) {
            var newSlotId = "s" + generateId();
            var slot = slots[toCopyButon.slots[i]];
            slotsDispatch({type: 'create', slotId: newSlotId, slotType: slot.type, text: slot.text, button: newButtonId});
            copiedSlots.push(newSlotId);
        }
        for(var i = 0; i < toCopyButon.switches.length; i++) {
            var newSwitchId = "sw" + generateId();
            var switchToCopy = JSON.parse(JSON.stringify(switches[toCopyButon.switches[i]]));
            switchesDispatch({type: 'create', switchId: newSwitchId, newSwitch: switchToCopy});
            copiedSwitches.push(newSwitchId);
        }

        var newLensId = "l" + generateId();
        var lensToCopy = JSON.parse(JSON.stringify(lenses[toCopyButon.lens]));
        lensToCopy.button = newButtonId;
        lensesDispatch({type: 'create', lensId: newLensId, newLens: lensToCopy});
        copiedLens = newLensId;

        var newButton = {
            slots: copiedSlots,
            switches: copiedSwitches,
            lens: newLensId,
            outputPrefix: toCopyButon.outputPrefix,
            isLoading: false
        }
        buttonsDispatch({type: 'create', buttonId: newButtonId, newButton: newButton});
    }

    function removeButton(buttonId) {
        // remove all slots, switches, and lens
        var toRemoveButton = buttons[buttonId];
        for(var i = 0; i < toRemoveButton.slots.length; i++) {
            slotsDispatch({type: 'remove', slotId: toRemoveButton.slots[i]});
        }
        for(var i = 0; i < toRemoveButton.switches.length; i++) {
            switchesDispatch({type: 'remove', switchId: toRemoveButton.switches[i]});
        }

        lensesDispatch({type: 'remove', lensId: toRemoveButton.lens});

        if(expandedButton === buttonId) {
            setExpandedButton(null);
        }
        buttonsDispatch({type: 'remove', buttonId: buttonId});
    }

    function expandButton(buttonId) {
        if(expandedButton === buttonId) {
            setExpandedButton(null);
        } else {
            setExpandedButton(buttonId);
        }
    }

    function changeOutputPrefix(buttonId, text) {
        buttonsDispatch({type: 'change-output', buttonId: buttonId, text: text});
    }

    function createSlot(buttonId, type, index) {
        var newSlotId = "s" + generateId();
        slotsDispatch({type: 'create', slotId: newSlotId, slotType: type, text: "", button: buttonId});
        buttonsDispatch({type: 'add-slot', buttonId: buttonId, slotId: newSlotId, index: index});
    }

    function copySlot(buttonId, slotId, index) {
        var toCopySlot = slots[slotId];
        var index = buttons[buttonId].slots.findIndex(id => id === slotId);
        var newSlotId = "s" + generateId();
        slotsDispatch({type: 'create', slotId: newSlotId, slotType: toCopySlot.type, text: toCopySlot.text, button: toCopySlot.button});
        buttonsDispatch({type: 'add-slot', buttonId: buttonId, slotId: newSlotId, index: index+1});
    }

    function changeSlot(slotId, changedText) {
        slotsDispatch({type: 'change', slotId: slotId, changedText});
    }

    function removeSlot(buttonId, slotId) {
        buttonsDispatch({type: 'remove-slot', buttonId: buttonId, slotId: slotId});
        slotsDispatch({type: 'remove', slotId: slotId});
    }

    function createSwitch(buttonId) {
        var newSwitchId = "sw" + generateId();
        var newSwitch = {
            model: "GPT-3",
            color: "#71AAFF",
            isChanged: false,
            button: buttonId,
            properties: {
                engine: "text-davinci-002",
                temperature: 0.7,
                topP: 1,
                frequencyPen: 0,
                presencePen: 0,
                bestOf: 1
            }
        }
        switchesDispatch({type: 'create', switchId: newSwitchId, newSwitch: newSwitch});
        buttonsDispatch({type: 'add-switch', buttonId: buttonId, switchId: newSwitchId});
    }

    function copySwitch(buttonId, switchId) {
        var toCopySwitch = switches[switchId];
        var newSwitchId = "sw" + generateId();
        var newSwitch = JSON.parse(JSON.stringify(toCopySwitch));
        newSwitch.isChanged = false;
        switchesDispatch({type: 'create', switchId: newSwitchId, newSwitch: newSwitch});
        buttonsDispatch({type: 'add-switch', buttonId: buttonId, switchId: newSwitchId});
    }

    function removeSwitch(buttonId, switchId) {
        buttonsDispatch({type: 'remove-switch', buttonId: buttonId, switchId: switchId});
        switchesDispatch({type: 'remove', switchId: switchId});
    }

    function onPropertyChange(switchId, property, value) {
        switchesDispatch({type: 'change', switchId: switchId, property, value});
    }

    function changeLens(lensId, type, properties) {
        lensesDispatch({type: 'change', lensId: lensId, lensType: type, properties: properties});
    }

    function handleCanvasClick(e) {
        setSelected({type: null});
    }

    function handleGenerate(buttonId) {
        var currButton = buttons[buttonId];
        var slotIds = currButton.slots;
        var switchIds = currButton.switches;
        if(switchIds.length === 0) return;
        var currLens = lenses[currButton.lens];
        var data = {text: "", generators: [], n: 3, existing: currLens.generations};

        buttonsDispatch({type: 'change-toggle', buttonId: buttonId, property: 'isLoading', value: true});

        for(var i = 0; i < slotIds.length; i++) {
            var slot = slots[slotIds[i]];
            if(slot.type === 'input') {
                data.text += slot.text + "\n\n";
            } else if(slot.type === 'whole') {
                data.text += slot.text + " " + text + "\n\n";
            } else if(slot.type === 'selection') {
                data.text += slot.text + " " + selectedText + "\n\n";
            }
        }
        data.text += currButton.outputPrefix;

        console.log(data.text);

        for(i = 0; i < switchIds.length; i++) {
            var switchId = switchIds[i];
            var currSwitch = switches[switchId];
            data.generators.push({...currSwitch.properties, switchId: switchId});
        }

        axios
        .post(`http://localhost:5000/api/generate-multiple`, data)
        .then((response) => {
            lensesDispatch({type: 'set-generations', lensId: currButton.lens, generations: response.data});
            buttonsDispatch({type: 'change-toggle', buttonId: buttonId, property: 'isLoading', value: false});
            setSelected({type: 'lens', data: currButton.lens});
        });
    }

    function handleTextChange(newText) {
        if(text === newText) return;
        console.log(newText);
        setText(newText);
    }

    function showGeneration(genText, isPermanent) {
        setAddGeneration({'text': genText, isPermanent: isPermanent});
    }

    useEffect(() => {
        console.log(addGeneration);
    }, [addGeneration])

    function hideLens(lensId) {
        lensesDispatch({type: 'set-generations', lensId: lensId, generations: []});
        setSelected({type: null});
    }

    return (
        <div className="App" onKeyDown={handleKeyDown} onKeyUp={handleKeyUp} tabIndex="0" onClick={handleCanvasClick}>
            <Container>
                <TextEditor 
                    text={text} handleTextChange={handleTextChange} setSelectedText={setSelectedText}
                    addGeneration={addGeneration} 
                />
                <Buttons 
                    buttons={buttons} slots={slots} switches={switches} lenses={lenses}
                    createButton={createButton} expandButton={expandButton} expandedButton={expandedButton}
                    handleGenerate={handleGenerate}
                    selected={selected} setSelected={setSelected}
                    createSlot={createSlot} changeSlot={changeSlot} 
                    changeOutputPrefix={changeOutputPrefix}
                    createSwitch={createSwitch} onPropertyChange={onPropertyChange}
                    changeLens={changeLens}
                />
                <HoverLens
                    lenses={lenses} selected={selected} hideLens={hideLens}
                    showGeneration={showGeneration}
                />
            </Container>
        </div>
    );
}

const Container = styled.div`
    display: flex;
    flex-direction: row;
    padding: 0 120px;
    width: 100%;
    position: relative;
`;

export default App;
