import React, { useEffect, useState } from 'react';
import styled from "styled-components";

import {
    SWITCH_SIZE,
    SWITCH_PROPERTY_WIDTH
} from './Sizes';

function SwitchHistory(props) {
    const currSwitch = props.switches[props.switchId];

    var position = document.getElementById('switch-' + props.switchId).getClientRects()[0];

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

    function historyToHTML() {
        var history = currSwitch.history;
        var html = [];
        for (var i = 0; i < history.length; i++) {
            var entry = history[i];
            switch(entry.type) {
                case 'create':
                    var properties = entry.data;
                    var propertyNames = Object.keys(properties);
                    html.push(<div style={{color: currSwitch.color, fontWeight: "bold"}}>Create</div>)
                    for(var j = 0; j < propertyNames.length; j++) {
                        html.push(
                            <PropertyEntry>
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
                    html.push(<div style={{color: currSwitch.color, fontWeight: "bold"}}>Change</div>)
                    html.push(
                        <PropertyEntry>
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
                    html.push(<div style={{color: currSwitch.color, fontWeight: "bold"}}>Generate</div>)
                    var generations = entry.data.generations
                    html.push(
                        <PropertyEntry>
                            <PropertyLine style={{backgroundColor: currSwitch.color}}></PropertyLine>
                            <PropertyName style={{backgroundColor: currSwitch.color}}>
                                Input
                            </PropertyName>
                        </PropertyEntry>
                    )
                    for(var j = 0; j < generations.length; j++) {
                        html.push(
                            <PropertyEntry>
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


    return (
        <HistoryContainer 
            style={{top: position.y + "px", left: position.x + SWITCH_SIZE + 6 + "px", borderColor: currSwitch.color}}
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
`;


export default SwitchHistory;