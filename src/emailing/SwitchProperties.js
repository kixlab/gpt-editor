import React, { useEffect, useState } from 'react';
import styled from "styled-components";

const SWITCH_SIZE = 50;
const SWITCH_PROPERTY_WIDTH = 160;
const SWITCH_PROPERTY_HEIGHT = 50;

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
    var properties = currSwitch.properties;

    useEffect(() => {
        setShowAll(false);
    }, [props.switchId]);

    function handleChange(e) {
        var propertyName = e.target.getAttribute("data-property");
        props.onPropertyChange(props.switchId, propertyName, e.target.value);
    }

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

    function propertiesToHTML(propertyNames, properties) {
        var result = [];
        for(var i = 0; i < propertyNames.length; i++) {
            var name = propertyNames[i];
            if(!showAll && i > 1 && properties[name] === defaultProperties[name]) continue;
            var inputHTML = "";
            switch (name) {
                case "engine":
                    inputHTML = (
                        <select className="dropdown" value={properties[name]} data-property={name} onChange={handleChange}>
                            <option value="text-davinci-002">text-davinci-002</option>
                            <option value="text-curie-001">text-curie-001</option>
                            <option value="text-babbage-001">text-babbage-001</option>
                            <option value="text-ada-001">text-ada-001</option>
                            <option value="text-davinci-001">text-davinci-001</option>
                            <option value="davinci-instruct-beta">davinci-instruct-beta</option>
                            <option value="davinci">davinci</option>
                            <option value="curie-instruct-beta">curie-instruct-beta</option>
                            <option value="curie">curie</option>
                            <option value="babbage">babbage</option>
                            <option value="ada">ada</option>
                        </select>
                    )
                    break;
                case "temperature":
                case "topP":
                    inputHTML = (
                        <input className="slider" type="range" min="0" max="1" step="0.01" value={properties[name]} onChange={handleChange} data-property={name}/>
                    )
                    break;
                case "frequencyPen":
                case "presencePen":
                    inputHTML = (
                        <input className="slider" type="range" min="0" max="2" step="0.01" value={properties[name]} onChange={handleChange} data-property={name}/>
                    )
                    break;
                case "bestOf":
                    inputHTML = (
                        <input className="slider" type="range" min="1" max="20" step="1" value={properties[name]} onChange={handleChange} data-property={name}/>
                    )
                    break;
            }
            result.push(
                <PropertyContainer key={name} style={{borderColor: currSwitch.color}}>
                    <PropertyHeader>
                        <div>{propertyToText(name)}</div>
                        {name !== "engine" ?
                            <input className="textinput" type="text" value={properties[name]} onChange={handleChange} data-property={name}/>
                            : ""}
                    </PropertyHeader>
                    {inputHTML}
                </PropertyContainer>
            )
        }
        return result;
    }

    var propsHTML = propertiesToHTML(Object.keys(properties), properties);

    var top = props.switchIdx*(SWITCH_PROPERTY_HEIGHT + 12);
    var left = 62;

    return (
        <div style={{position: "absolute", top: top+4 + "px", left: left + "px", zIndex: 10}} onClick={(e) => e.stopPropagation()}>
            {propsHTML}
            {propsHTML.length !== 6 ?
                <ShowAllButton 
                    style={{
                        borderTopColor: currSwitch.color, 
                        marginLeft: SWITCH_PROPERTY_WIDTH / 2 - 20 + "px",
                    }} 
                    onClick={(e) => setShowAll(!showAll)}
                />
                : ""
            }
        </div>
    )
}

const PropertyContainer = styled.div`
    height: ${SWITCH_PROPERTY_HEIGHT}px;
    width: ${SWITCH_PROPERTY_WIDTH}px;
    border-radius: 4px;
    background-color: #fff;
    margin-bottom: 4px;
    border: solid 2px;
    box-shadow: 0px 4px 4px 0px rgba(0, 0, 0, 0.25);
    padding: 0px 8px 0 8px;
    font-size: 14px;
`;

const PropertyHeader = styled.div`
    display: flex; 
    justify-content: space-between;
    padding-top: 2px;
    margin-bottom: -2px;
    -webkit-touch-callout: none;
    -webkit-user-select: none;
    -khtml-user-select: none;
    -moz-user-select: none;
    -ms-user-select: none;
    user-select: none;
`;

const ShowAllButton = styled.div`
    width: 0;
    height: 0;
	border-left: 10px solid transparent;
	border-right: 10px solid transparent;
	border-top: 20px solid;
    border-bottom: 0;
    cursor: pointer;
`;

export default SwitchProperties;