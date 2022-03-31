import React, { useEffect, useState } from 'react';
import styled from "styled-components";

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faChevronDown, faChevronUp } from '@fortawesome/free-solid-svg-icons'

const SWITCH_HEIGHT = 50;

function SwitchHistory(props) {
    const currSwitch = props.switches[props.switchId];
    const [openedInputs, setOpenedInputs] = useState([]);

    function propertyToText(name) {
        switch(name) {
            case "engine":
                return "Engine";
            case "temperature":
                return "Temperature";
            case "topP":
                return "Top P";
            case "frequencyPen":
                return "Frequency Pen";
            case "presencePen":
                return "Presence Pen";
            case "bestOf":
                return "Best of";
            default:
                return "";
        }
    }

    function toggleInput(e) {
        var idx = parseInt(e.target.getAttribute("data-idx"));
        if(openedInputs.includes(idx)) {
            setOpenedInputs(openedInputs.filter(x => x !== idx));
        } else {
            setOpenedInputs([...openedInputs, idx]);
        }
    }

    function historyToHTML() {
        var history = currSwitch.history;
        var html = [];
        for (var i = 0; i < history.length; i++) {
            var entry = history[i];
            switch(entry.type) {
                case 'create':
                    var properties = entry.data;
                    var propertyNames = Object.keys(properties);
                    html.push(<div key={"title-" + i} style={{color: currSwitch.color, fontWeight: "bold"}}>Create</div>)
                    for(var j = 0; j < propertyNames.length; j++) {
                        html.push(
                            <PropertyEntry key={"history-initial-" + j}>
                                <PropertyLine style={{backgroundColor: currSwitch.color}}></PropertyLine>
                                <PropertyName style={{backgroundColor: currSwitch.color}}>
                                    {propertyToText(propertyNames[j])}
                                </PropertyName>
                                <PropertyValue style={{borderColor: currSwitch.color}}>
                                    {properties[propertyNames[j]]}
                                </PropertyValue>
                            </PropertyEntry>
                        )
                    }
                    break;
                case 'change':
                    html.push(<div key={"title-" + i} style={{color: currSwitch.color, fontWeight: "bold"}}>Change</div>)
                    html.push(
                        <PropertyEntry key={"history-" + i}>
                            <PropertyLine style={{backgroundColor: currSwitch.color}}></PropertyLine>
                            <PropertyName style={{backgroundColor: currSwitch.color}}>
                                {propertyToText(entry.data.property)}
                            </PropertyName>
                            <PropertyValue style={{borderColor: currSwitch.color}}>
                                {entry.data.value}
                            </PropertyValue>
                        </PropertyEntry>
                    )
                    break;
                case 'generation':
                    html.push(<div key={"title-" + i} style={{color: currSwitch.color, fontWeight: "bold"}}>Generate</div>)
                    var generations = entry.data.generations

                    var isOpen = openedInputs.includes(i);

                    html.push(
                        <PropertyEntry key={"history-header-"+i}>
                            <PropertyLine style={{backgroundColor: currSwitch.color}}></PropertyLine>
                            <div data-idx={i} onClick={toggleInput} style={{flexGrow: "1", borderRadius: "4px", border: "solid 1px "+currSwitch.color}}>
                                <InputHeader data-idx={i} style={{ color: currSwitch.color}}>
                                    <div>Input</div> 
                                    <FontAwesomeIcon data-idx={i} onClick={toggleInput} icon={isOpen ? faChevronUp : faChevronDown} />
                                </InputHeader>
                                {isOpen && (
                                    <InputContent key={"history-input-" + i}>
                                        {entry.data.input.split('\n').map((line, i) => (
                                            <span key={i}>
                                                {line}
                                                <br/>
                                            </span>
                                        ))}
                                    </InputContent>
                                )}
                            </div>
                        </PropertyEntry>
                    )
                    for(var j = 0; j < generations.length; j++) {
                        html.push(
                            <PropertyEntry key={"history-gen-" + j}>
                                <PropertyLine style={{backgroundColor: currSwitch.color}}></PropertyLine>
                                <GenerationText style={{borderColor: currSwitch.color}}>
                                    {generations[j]}
                                </GenerationText>
                            </PropertyEntry>
                        )
                    }
                    break;
            }
        }
        return html;
    }

    var top = props.switchIdx*(SWITCH_HEIGHT + 12);
    var left = 62;

    return (
        <HistoryContainer 
            onClick={(e) => e.stopPropagation()}
            style={{top: top+ "px", left: left + "px", borderColor: currSwitch.color}}
        >
            {historyToHTML()}
        </HistoryContainer>
    )
}

const HistoryContainer = styled.div`
    height: 320px;
    width: 260px;
    border-radius: 4px;
    background-color: #ffffff;
    margin-bottom: 4px;
    border: solid 2px;
    box-shadow: 0px 4px 4px 0px rgba(0, 0, 0, 0.25);
    padding: 8px;
    font-size: 16px;
    overflow-y: scroll;
    display: flex;
    flex-direction: column;
    position: absolute;
    &::-webkit-scrollbar {
        width: 4px;
    }
    &::-webkit-scrollbar-thumb {
        background: #ccc;
        border-radius: 4px;
    }
    z-index: 10;
`;

const PropertyEntry = styled.div`
    display: flex;
    flex-direction: row;
    width: 100%;
    margin: 2px 0;
`;

const PropertyLine = styled.div`
    width: 4px;
    margin-right: 4px;
    margin-top: -2px;
    height: calc(100% + 4px);
`;
const PropertyName = styled.div`
    border-radius: 4px 0 0 4px;
    color: #fff;
    padding: 0 8px;
`;
const PropertyValue = styled.div`
    flex-grow: 1;
    color: #555;
    padding: 0 4px;
    border: solid 1px;
    border-radius: 0 4px 4px 0;
`;
const GenerationText = styled.div`
    color: #555;
    padding: 0 4px;
    border: solid 1px;
    border-radius: 4px;
    font-size: 12px;
    width: 100%;
    white-space: pre-line;
`;
const InputHeader = styled.div`
    width: 100%;
    color: #fff; 
    padding: 0 8px;
    border-radius: 4px 4px 0 0;
    cursor: pointer;
    display: flex; 
    flex-direction: row;
    justify-content: space-between;
    align-items: center;
`;
const InputContent = styled.div`
    color: #777;
    font-size: 12px;
    padding: 0 16px 4px 16px;
`;


export default SwitchHistory;