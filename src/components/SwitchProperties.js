import React, { useEffect, useState } from 'react';
import styled from "styled-components";

import {
    SWITCH_SIZE,
    SWITCH_PROPERTY_WIDTH
} from './Sizes';

const defaultProperties = {
    engine: "davinci",
    temperature: 0.7,
    topP: 1,
    frequencyPen: 0,
    presencePen: 0,
    bestOf: 1
}

function SwitchProperties(props) {
    const [showAll, setShowAll] = useState(false);
    const currSwitch = props.switches[props.switchId];

    var position = document.getElementById('switch-' + props.switchId).getClientRects()[0];
    var properties = currSwitch.properties;

    function propertiesToHTML(propertyNames, properties) {
        var result = [];
        for(var i = 0; i < propertyNames.length; i++) {
            var name = propertyNames[i];
            if(!showAll && i > 1 && properties[name] === defaultProperties[name]) continue;
            result.push(
                <PropertyContainer key={name} style={{borderColor: currSwitch.color}}>
                    {name[0].toUpperCase() + name.slice(1)} <br/>
                    {properties[name]}
                </PropertyContainer>
            )
        }
        return result;
    }

    var propsHTML = propertiesToHTML(Object.keys(properties), properties);

    return (
        <div style={{position: "absolute", top: position.y + "px", left: position.x + SWITCH_SIZE + 6 + "px"}}>
            {propsHTML}
            {propsHTML.length !== 6 ?
                <ShowAllButton 
                    style={{borderTopColor: currSwitch.color, marginLeft: SWITCH_PROPERTY_WIDTH / 2 - 20 + "px"}} 
                    onClick={() => setShowAll(!showAll)}
                />
                : ""
            }
        </div>
    )
}

const PropertyContainer = styled.div`
    height: ${SWITCH_SIZE}px;
    width: ${SWITCH_PROPERTY_WIDTH}px;
    border-radius: 4px;
    background-color: #fff;
    margin-bottom: 4px;
    border: solid 2px;
    box-shadow: 0px 4px 4px 0px rgba(0, 0, 0, 0.25);
    padding: 0px 0 0 8px;
    font-size: 14px;
`;

const ShowAllButton = styled.div`
    width: 0;
    height: 0;
    margin-top: 8px;
	border-left: 10px solid transparent;
	border-right: 10px solid transparent;
	border-top: 20px solid;
    border-bottom: 0;
    cursor: pointer;
`

export default SwitchProperties;