import React, { useEffect, useState } from 'react';
import styled from "styled-components";

const SWITCH_SIZE = 64;
const SWITCH_PROPERTY_WIDTH = 160;
const SWITCH_PROPERTY_HEIGHT = 52;

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
    const [current, setCurrent] = useState(props.value);
    const currSwitch = props.switches[props.switchId];

    var position = document.getElementById("switch-"+props.switchId+"-property-"+props.property).getClientRects()[0];
    var properties = currSwitch.properties;

    useEffect(() => {
        if(current !== props.value) setCurrent(props.value);
    }, [props.value]);

    function handleInputChange(e) {
        console.log(e.target.value);
        setCurrent(e.target.value);
    }

    function handleKeyDown(e) {
        if (e.key === "Enter") {
            handleChange(e);
        }

    }

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
                            <option value="text-davinci-002">Davinci-2 (D2)</option>
                            <option value="text-davinci-001">Davinci (D)</option>
                            <option value="text-curie-001">Curie (C)</option>
                            <option value="text-babbage-001">Babbage (B)</option>
                            <option value="text-ada-001">Ada (A)</option>
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
                <PropertyContainer key={name} style={{borderColor: "#0066FF"}}>
                    <PropertyHeader>
                        <div>{propertyToText(name)}</div>
                        {name !== "engine" ?
                            <input 
                                className="textinput" type="text" 
                                value={current} data-property={name}
                                onKeyDown={handleKeyDown} onBlur={handleChange}
                                onChange={handleInputChange}
                            />
                            : ""}
                    </PropertyHeader>
                    {inputHTML}
                </PropertyContainer>
            )
        }
        return result;
    }

    var propsHTML = propertiesToHTML([props.property], properties);

    var top = position.y //- propsHTML.length*(SWITCH_PROPERTY_HEIGHT+4) -  4;
    var left = position.x;

    return (
        <div style={{position: "absolute", top: top + "px", left: left + "px"}} onClick={(e) => e.stopPropagation()}>
            {propsHTML}
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
	border-bottom: 20px solid;
    border-top: 0;
    cursor: pointer;
`;

export default SwitchProperties;