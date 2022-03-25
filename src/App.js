import './public/css/App.css';
import 'bootstrap/dist/css/bootstrap.min.css';
import axios from 'axios';
import styled from "styled-components";

import React, { useState, useReducer, useCallback } from 'react';

import TextEditor from './emailing/TextEditor';
import Buttons from './emailing/Buttons';

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
        0 : {
            slots: [],
            switches: [],
            lens: -1,
            outputPrefix: "Output:",
            isLoading: false,
            isExpanded: false
        }
    });


    const slotsReducer = useCallback((slots, action) => {
        var newSlots = JSON.parse(JSON.stringify(slots));
        switch (action.type) {
            case 'create':
                var { slotId, type, text } = action;
                newSlots[slotId] = {type: type, text: text};
                return newSlots;
            case 'change':
                var { slotId, changedText } = action;
                newSlots[slotId] = changedText;
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
        0: {
            type: 'input',
            text: "Complete this email with a friendly tone:",
        },
        1: {
            type: 'whole',
            text: "Input:"
        },
        1: {
            type: 'selection',
            text: "Original text:"
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
    const [switches, switchesDispatch] = useReducer(switchesReducer, {'colorIndex': 0});

    const lensesReducer = useCallback((lenses, action) => {
        var newLenses = { ...lenses };
        switch (action.type) {
            case 'create':
                var { lensId, type, properties } = action;
                newLenses[lensId] = {
                    type: type,
                    properties: properties,
                    generations: []
                };
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
            case 'remove':
                var { lensId } = action;
                delete newLenses[lensId];
                return newLenses;
            default:
                throw new Error();
        }
    })
    const [lenses, lensesDispatch] = useReducer(lensesReducer, {
        0: {
            type: "list",
            generations: [],
            properties: null
        }
    });

    const [isMeta, setIsMeta] = useState(false);
    const [selected, setSelected] = useState({type: null})
    const [text, setText] = useState("");

    function handleKeyDown(e) {
        if (e.key === "Meta") {
            setIsMeta(true);
        } 
        // TODO: copy buttons, copy slots, copy switches
    }

    function handleKeyUp(e) {
        if (e.key === "Meta") {
            setIsMeta(false);
        }
    }

    function createButton() {
        var newButtonId = "b" + generateId();
        var newButton = {
            slots: [],
            switches: [],
            lens: -1,
            outputPrefix: "",
            isLoading: false,
            isExpanded: false
        }
        buttonsDispatch({type: 'create', buttonId: newButtonId, newButton: newButton});
    }

    function copyButton(buttonId) {
        // TODO: copy all slots, switches, and lenses
        var toCopyButon = buttons[buttonId];

        var copiedSlots = [];
        var copiedSwitches = [];
        var copiedLens = "";
        for(var i = 0; i < toCopyButon.slots.length; i++) {
            var newSlotId = "s" + generateId();
            var slot = slots[toCopyButon.slots[i]];
            slotsDispatch({type: 'create', slotId: newSlotId, type: slot.type, text: slot.text});
            copiedSlots.push(newSlotId);
        }
        for(var i = 0; i < toCopyButon.switches.length; i++) {
            var newSwitchId = "sw" + generateId();
            var switchToCopy = Object.parse(Object.stringify(switches[toCopyButon.switches[i]]));
            switchesDispatch({type: 'create', switchId: newSwitchId, newSwitch: switchToCopy});
            copiedSwitches.push(newSwitchId);
        }
        if(toCopyButon.lens !== -1) {
            var newLensId = "l" + generateId();
            var lensToCopy = Object.parse(Object.stringify(lenses[toCopyButon.lens]));
            lensesDispatch({type: 'create', lensId: newLensId, type: lensToCopy.type, properties: lensToCopy.properties});
            copiedLens = newLensId;
        }
        var newButtonId = "b" + generateId();
        var newButton = {
            slots: copiedSlots,
            switches: copiedSwitches,
            lens: copiedLens,
            outputPrefix: toCopyButon.outputPrefix,
            isLoading: false,
            isExpanded: false
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
        if(toRemoveButton.lens !== -1) {
            lensesDispatch({type: 'remove', lensId: toRemoveButton.lens});
        }
        buttonsDispatch({type: 'remove', buttonId: buttonId});
    }

    function expandButton(buttonId, isExpanded) {
        buttonsDispatch({type: 'change-toggle', buttonId: buttonId, property: 'isExpanded', value: isExpanded});
    }   

    function createSlot(buttonId, type, index) {
        var newSlotId = "s" + generateId();
        slotsDispatch({type: 'create', slotId: newSlotId, type: type, text: ""});
        buttonsDispatch({type: 'add-slot', buttonId: buttonId, slotId: newSlotId, index: index});
    }

    function copySlot(buttonId, slotId, index) {
        var toCopySlot = slots[slotId];
        var newSlotId = "s" + generateId();
        slotsDispatch({type: 'create', slotId: newSlotId, type: toCopySlot.type, text: toCopySlot.text});
        buttonsDispatch({type: 'add-slot', buttonId: buttonId, slotId: newSlotId, index: index+1});
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
        var newSwitch = Object.parse(Object.stringify(toCopySwitch));
        newSwitch.isChanged = false;
        switchesDispatch({type: 'create', switchId: newSwitchId, newSwitch: newSwitch});
        buttonsDispatch({type: 'add-switch', buttonId: buttonId, switchId: newSwitchId});
    }

    function removeSwitch(buttonId, switchId) {
        buttonsDispatch({type: 'remove-switch', buttonId: buttonId, switchId: switchId});
        switchesDispatch({type: 'remove', switchId: switchId});
    }

    function createLens(buttonId, type, properties) {
        var newLensId = "l" + generateId();
        lensesDispatch({type: 'create', lensId: newLensId, type: type, properties: properties});
        buttonsDispatch({type: 'set-lens', buttonId: buttonId, lensId: newLensId});
    }

    function changeLens(buttonId, type, properties) {
        lensesDispatch({type: 'change', lensId: buttons[buttonId].lens, type: type, properties: properties});
    }

    function handleCanvasClick(e) {
        setSelected({type: null});
    }

    function handleGenerate(buttonId) {
        console.log(buttonId);
    }

    return (
        <div className="App" onKeyDown={handleKeyDown} onKeyUp={handleKeyUp} tabIndex="0" onClick={handleCanvasClick}>
            <Container>
                <TextEditor text={text} setText={setText} />
                <Buttons 
                    buttons={buttons} slots={slots} switches={switches} lenses={lenses}
                    createButton={createButton} expandButton={expandButton}
                    handleGenerate={handleGenerate}
                    selected={selected} setSelected={setSelected}
                />
            </Container>
        </div>
    );
}

const Container = styled.div`
    display: flex;
    flex-direction: row;
    padding: 0 120px;
    width: 100%
`;

export default App;
