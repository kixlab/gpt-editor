import React, { useState, useEffect, useRef } from 'react';
import styled from 'styled-components';

import SwitchProperties from './SwitchProperties';
import SwitchHistory from './SwitchHistory';

import { SettingButton, HistoryButton } from './SVG';

const SWITCH_SIZE = 128;
const SWITCH_Y_OFFSET = 8;

function SwitchContent(props) {
    function handleClick(e) {
        e.stopPropagation();
        var data = e.target.getAttribute('data-id');
        if(data === "-1") {
            props.createSwitch(props.buttonId);
        } else {
            props.setSelected({type: 'switch', data: data});
        }
    }

    function drawOneSwitch(switchId, switchIdx) {
        var currSwitch = props.switches[switchId];

        var xPosition = 4;
        var yPosition = 4 + switchIdx*(SWITCH_SIZE + SWITCH_Y_OFFSET);

        var isSelected = props.selected && props.selected.type === "switch" && props.selected.data === switchId;
        var selectionRing = (
            <rect
                className="switch-selection" x={xPosition - 3} y={yPosition - 3}
                width={SWITCH_SIZE + 18 + 6} height={SWITCH_SIZE + 8} rx="4"
                fill="none" stroke="#00C2FF" strokeWidth="2px"
            />
        )

        if(currSwitch === undefined) {
            return (
                <g key={switchId+"group"}>
                    <g
                        key={switchId + "box"}
                        onClick={handleClick}
                    >
                        <rect
                            id={"switch-" + switchId}
                            className="switch-inactive"
                            x={(SWITCH_SIZE - 48)/2 + xPosition} y={yPosition}
                            width={48} height={48} rx="4"
                            fill="#0066FF33"
                        />
                        {isSelected ? selectionRing : ""}
                        <text
                            key={switchId + "-text"}
                            x={- yPosition - 48 / 2} y={xPosition + 2 + SWITCH_SIZE/2}
                            textAnchor="middle" alignmentBaseline="middle"
                            fontSize="30px"
                            fontFamily="Roboto" fontWeight="bold" fill="#fff"
                            transform="rotate(-90)"
                        >
                            +
                        </text>
                        <rect
                            data-type="switch" data-id={switchId}
                            x={(SWITCH_SIZE - 48)/2 + xPosition - 4} y={yPosition - 4}
                            width={48} height={48}
                            fill="#00000000" style={{ cursor: "pointer" }}
                        />
                    </g>
                </g>
            );
        }

        var textOrLoadingSvg = (
            <text
                key={switchId + "-text"}
                x={- yPosition - SWITCH_SIZE / 2} y={18}
                textAnchor="middle" alignmentBaseline="middle"
                fontSize={"14px"} 
                fontFamily="Roboto" fontWeight="bold" fill="#fff"
                transform="rotate(-90)"
            >
                {currSwitch.model}
            </text>
        )

        var propertiesSvg = createPropertySvg(switchId, currSwitch, xPosition + 18, yPosition);

        return (
            <g key={switchId+"group"}>
                <g
                    key={switchId + "box"}
                    onClick={handleClick}
                >
                    <rect
                        id={"switch-" + switchId}
                        className={"switch"} 
                        x={xPosition} y={yPosition}
                        width={SWITCH_SIZE+18} height={SWITCH_SIZE} rx="4"
                        fill={currSwitch.color}
                    />
                    {isSelected ? selectionRing : ""}
                    {textOrLoadingSvg}
                    <rect
                        data-type="switch" data-id={switchId}
                        x={xPosition - 4} y={yPosition - 4}
                        width={SWITCH_SIZE + 18 + 8} height={SWITCH_SIZE + 8}
                        fill="#00000000" style={{ cursor: "pointer" }}
                    />
                    {propertiesSvg}
                </g>
            </g>
        )
    }

    function handlePropertyClick(e) {
        e.stopPropagation();
        let switchId = e.target.getAttribute("data-id");
        if(props.switches[switchId].isLoading) return;
        let property = e.target.getAttribute("data-property");
        props.setSelected({type: "property", data: {switchId: switchId, property: property}});
    }

    function createPropertySvg(switchId, currSwitch, xPosition, yPosition) {
        var properties = ['engine', 'temperature', 'presencePen', 'bestOf'];
        var defaultValues = {
            engine: 'text-davinci-001',
            temperature: 0.7,
            presencePen: 0,
            bestOf: 3
        }
        var engineToLabel = {
            "text-davinci-002": "D2",
            "text-davinci-001": "D",
            "text-curie-001": "C",
            "text-babbage-001": "B",
            "text-ada-001": "A",
        }
        var propertyLabels = ["Engine", "Temp", "Presence", "Best Of"];
        var propertiesSvg = [];
        for(var i = 0; i < properties.length; i++) {
            var xIdx = i % 2;
            var yIdx = Math.floor(i / 2);
            var property = properties[i];
            var propertyLab = propertyLabels[i];
            var value = currSwitch.properties[property];
            var isChanged = value !== defaultValues[property];
            if(property == "engine") {
                value = engineToLabel[value];
            }
            var propSize = SWITCH_SIZE / 2 - 12;
            propertiesSvg.push(
                <g
                    id={"switch-" + switchId + "-property-" + property}
                    key={switchId + "-property-" + property}
                    transform={`translate(${xPosition + xIdx*(propSize + 8) + 8}, ${yPosition + yIdx*(propSize + 8) + 8})`}
                    opacity={isChanged ? "1.0" : "0.5"}
                >
                    <rect 
                        x="0" y="0" width={propSize} height={propSize} 
                        fill="#FFFFFFaa" stroke="none" rx="4"
                    />
                    <text
                        x={propSize/2} y={12}
                        textAnchor="middle" alignmentBaseline="middle"
                        fontSize="12px" fontFamily="Roboto" fill="#666"
                    >{propertyLab}</text>
                    <rect
                        x="4" y={(propSize)/2 - 8} 
                        width={propSize - 8} height={propSize/2 + 4}
                        fill="#FFF" rx="4"
                    />
                    <text
                        x={propSize/2} y={(propSize)/2 - 4 + propSize/2/2}
                        textAnchor="middle" alignmentBaseline="middle"
                        fontSize="18px" fontFamily="Roboto" fill="#333"
                    >{value}</text>
                    <rect
                        x="0" y="0" width={propSize} height={propSize}
                        data-id={switchId} data-property={property}
                        fill="#00000000" style={{ cursor: "pointer" }}
                        onClick={handlePropertyClick}
                    />
                </g>
            )
        }
        return propertiesSvg;
    }

    var currButton = props.buttons[props.buttonId];
    var switchIds = currButton.switches;

    return (
        <div style={{position: 'relative'}}>
            <svg width={SWITCH_SIZE + 18 + 8} height={(switchIds.length)*(SWITCH_SIZE+SWITCH_Y_OFFSET) + 48 + SWITCH_Y_OFFSET}>
                {switchIds.map((switchId, switchIdx) => drawOneSwitch(switchId, switchIdx))}
                {drawOneSwitch(-1, switchIds.length)}
            </svg>
            {props.selected && props.selected.type === "switch" ? 
                <SideButtons 
                    switches={props.switches} switchId={props.selected.data}
                    switchIdx={switchIds.indexOf(props.selected.data)}
                    selected={props.selected} setSelected={props.setSelected}
                ></SideButtons>
            : ""}
            {props.selected.isSideOpen ? 
                (props.selected.isSideOpen === 'properties' ?
                    <SwitchProperties 
                        switches={props.switches} switchId={props.selected.data}
                        switchIdx={switchIds.indexOf(props.selected.data)} switchLen={switchIds.length}
                        onPropertyChange={props.onPropertyChange}
                    /> : 
                    <SwitchHistory 
                        switches={props.switches} switchId={props.selected.data}
                        switchIdx={switchIds.indexOf(props.selected.data)}
                    />
                ) :
                ""
            }
        </div>
    )
}

function SideButtons(props) {
    var top = props.switchIdx*(SWITCH_SIZE + 12) + 4;
    var left = SWITCH_SIZE + 18 + 8;

    function handleClickSideBtn(e, type) {
        e.stopPropagation();
        var copy = { ...props.selected };
        copy.isSideOpen = type;
        props.setSelected(copy);
    }

    return (
        <svg
            height={50} width={25} 
            style={{position: "absolute", top: top + "px", left: left + "px", zIndex: 8}}
        >
            {/* <SideBtn 
                transform={`translate(0, 0)`}
                onClick={(e) => handleClickSideBtn(e, "properties")}
                color={props.switches[props.switchId].color}
            >
                {SettingButton}
            </SideBtn>, */}
            <SideBtn 
                transform={`translate(0, 0)`}
                onClick={(e) => handleClickSideBtn(e, "history")}
                color={props.switches[props.switchId].color}
            >
                {HistoryButton}
            </SideBtn>
        </svg>
    )
}

const SideBtn = styled.g`
    cursor: pointer;
    stroke: ${props => props.color};
    fill: ${props => props.color};
`;


export default SwitchContent;