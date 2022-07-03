import React, { useState, useRef, useLayoutEffect } from 'react';
import styled from "styled-components";

import { HistoryButton, SettingButton } from './SVG';

const SWITCH_X_SPACE = 12;
const SWITCH_Y_OFFSET = 32;
const SWITCH_SIZE = 128;
const SWITCH_PROPERTY_WIDTH = 160;

function Switches(props) {
    const clickTimer = useRef(null);
    const containerRef = useRef(null);
    const [containerWidth, setContainerWidth] = useState(0);
    const [dragging, setDragging] = useState(null);

    useLayoutEffect(() => {
        // I don't think it can be null at this point, but better safe than sorry
        if (containerRef.current) {
            setContainerWidth(Math.floor(containerRef.current.getBoundingClientRect().width));
        }
    });

    function handleMouseEnter(e) {
        if(dragging !== null) return;
        var hoverSwitch = e.target.getAttribute('data-id');
        if(hoverSwitch === '-1') return;
        if(props.switches[hoverSwitch].path)
            props.setHoverPath(props.switches[hoverSwitch].path);
    }
    
    function handleMouseLeave(e) {
        props.setHoverPath(null);
        // TODO: make it so if hover on model it shows the corresponding slots on the top
    }
    
    function handleClick(e) {
        e.stopPropagation();
        let data = e.target.getAttribute("data-id");
        if(data === "-1") {
            props.createSwitch();
            return;
        }
        switch (e.detail) {
            case 1:
                clickTimer.current = setTimeout(() => {
                    props.handleGenerate(data);
                    props.setSelected({type: null});
                    clickTimer.current = null;
                }, 200);
                break;
            case 2:
                if(clickTimer.current == null) return;
                console.log(e);
                clearTimeout(clickTimer.current);
                clickTimer.current = null;
                if(props.selected.type === 'switch' && props.selected.data === data)
                    props.setSelected({type: null})
                else {
                    props.setSelected({type: "switch", data: data});
                    if(props.switches[data].path)
                        props.setPath(props.switches[data].path);
                }
                break;
            default:
                break;
        }
    }

    function handlePropertyClick(e) {
        e.stopPropagation();
        let switchId = e.target.getAttribute("data-id");
        let property = e.target.getAttribute("data-property");
        props.setSelected({type: "property", data: {switchId: switchId, property: property}});
    }

    function handleMouseDown(e) {
        const x = e.pageX;
        const y = e.pageY;
        const offsetX = 120;
        const offsetY = containerRef.current.getBoundingClientRect().y;
        var draggingObj = { type: e.target.getAttribute("data-type"), startX: x - offsetX, startY: y - offsetY };
        if ([null].includes(draggingObj.type)) {
            return;
        } else {
            draggingObj.data = e.target.getAttribute("data-id");
        }
        setDragging(draggingObj);
    }

    function handleMouseUp(e) {
        if (dragging == null) return;

        var dropObj = { type: e.target.getAttribute("data-type"), data: e.target.getAttribute("data-id") };

        if ([null].includes(dropObj.type)) {
            setDragging(null);
            return;
        } else if (dragging.type === 'appendage' && dropObj.type === 'switch'){
            props.attachPath(dropObj.data, props.slots.path);
        } else if (dragging.type === "switch" && dropObj.type === "appendage") {
            props.attachPath(dragging.data, props.slots.path);
        }
        setDragging(null);
    }

    function handleMouseMove(e) {
        if (dragging === null) return;
        var newDragging = { ...dragging };
        const x = e.pageX;
        const y = e.pageY;
        const offsetX = 120;
        const offsetY = containerRef.current.getBoundingClientRect().y;
        newDragging.endX = x - offsetX;
        newDragging.endY = y - offsetY;

        var distance = Math.sqrt(Math.pow(newDragging.endX - newDragging.startX, 2) + Math.pow(newDragging.endY - newDragging.startY, 2));
        if (distance > 10)
            setDragging(newDragging);
    }

    function handleClickSideBtn(e, type) {
        e.stopPropagation();
        var copy = { ...props.selected };
        copy.isSideOpen = type;
        props.setSelected(copy);
    }

    function drawOneSwitch(switchId, switchIdx, numSwitches) {
        var currSwitch = props.switches[switchId];

        var startingPoint = (containerWidth - numSwitches * SWITCH_SIZE - (numSwitches - 1) * SWITCH_X_SPACE) / 2;

        var xPosition = startingPoint + switchIdx * (SWITCH_SIZE + SWITCH_X_SPACE);
        var yPosition = SWITCH_Y_OFFSET;

        var sideButtons = [
            <SideBtn
                key={1} data-id={switchId} color={currSwitch.color}
                onClick={(e) => handleClickSideBtn(e, 'properties')}
                transform={`translate(${xPosition}, ${yPosition - 32 - 4}) scale(1.28)`}
            >
                {SettingButton}
            </SideBtn>,
            <SideBtn
                key={2} data-id={switchId} color={currSwitch.color}
                onClick={(e) => handleClickSideBtn(e, 'history')}
                transform={`translate(${xPosition + 32 + 4}, ${yPosition - 32 - 4}) scale(1.28)`}
            >
                {HistoryButton}
            </SideBtn>
        ]

        var isSelected = props.selected && props.selected.type === "switch" && props.selected.data === switchId;
        var selectionRing = (
            <rect
                className="switch-selection" x={xPosition - 3} y={yPosition - 3 - 18}
                width={SWITCH_SIZE + 6} height={SWITCH_SIZE + 6 + 18} rx="4"
                fill="none" stroke="#00C2FF" strokeWidth="2px"
            />
        )

        var connectorSvg = "";
        var isPath = currSwitch.path && props.slots.path.join(" ") === currSwitch.path.join(" ");
        var isHoverPath = currSwitch.path && props.hoverPath && props.hoverPath.join(" ") === currSwitch.path.join(" ");
        if(isPath || isHoverPath) {
            var centerCont = containerWidth / 2;
            var centerSwitch = xPosition + SWITCH_SIZE/2;
            connectorSvg = (
                <g>
                    <line x1={centerCont} y1="64" x2={centerSwitch} y2="64" stroke={isPath ? "#0066FF" : "#0066FF66" } strokeWidth="4px"/>
                    <line x1={centerSwitch} y1="62" x2={centerSwitch} y2="128" stroke={isPath ? "#0066FF" : "#0066FF66"} strokeWidth="4px"/>
                </g>
            )
        }

        var generatorLabel = (
            <text
                key={switchId + "-text"}
                x={xPosition + SWITCH_SIZE / 2} y={yPosition - 4}
                textAnchor="middle" alignmentBaseline="middle"
                fontSize="18px" fontFamily="Roboto" fontWeight="bold" fill="#fff"
            >
                {currSwitch.model}
            </text>
        )

        var propertiesSvg = createPropertySvg(switchId, currSwitch, xPosition, yPosition);

        return (
            <g key={switchId+"group"}>
                {connectorSvg}
                <g
                    key={switchId + "box"}
                    onMouseEnter={handleMouseEnter} onMouseLeave={handleMouseLeave}
                    onClick={handleClick}
                >
                    <rect
                        id={"switch-" + switchId}
                        className={currSwitch === undefined ? "switch-inactive" : "switch"} 
                        x={xPosition} y={yPosition - 18}
                        width={SWITCH_SIZE} height={SWITCH_SIZE + 18} rx="4"
                        fill={currSwitch === undefined ? "#77a3ff" : "#4D94FF"}
                    />
                    {currSwitch === undefined ? "" : (isSelected ? selectionRing : "")}
                    {currSwitch.isLoading ?
                        (<g key={switchId + "-loading"}
                            transform={`translate(${xPosition + SWITCH_SIZE / 2 - 17.5}, ${yPosition + SWITCH_SIZE / 2 - 17.5}) scale(0.7)`}>
                            <path
                                fill="#fff"
                                d="M25,5A20.14,20.14,0,0,1,45,22.88a2.51,2.51,0,0,0,2.49,2.26h0A2.52,2.52,0,0,0,50,22.33a25.14,25.14,0,0,0-50,0,2.52,2.52,0,0,0,2.5,2.81h0A2.51,2.51,0,0,0,5,22.88,20.14,20.14,0,0,1,25,5Z">
                                <animateTransform attributeName="transform" type="rotate" from="0 25 25" to="360 25 25" dur="0.5s" repeatCount="indefinite" />
                            </path>
                        </g>) : null
                    }
                    {generatorLabel}
                    <rect
                        data-type="switch" data-id={switchId}
                        x={xPosition - 4} y={yPosition - 18 - 4}
                        width={SWITCH_SIZE + 8} height={SWITCH_SIZE + 18 + 8}
                        fill="#00000000" style={{ cursor: "pointer" }}
                    />
                    {propertiesSvg}
                    {
                        ""
                        //currSwitch === undefined ? "" : (isSelected ? sideButtons : "")
                    }
                </g>
            </g>
        )
    }

    function createPropertySvg(switchId, currSwitch, xPosition, yPosition) {
        var properties = ['engine', 'temperature', 'presencePen', 'bestOf'];
        var engineToLabel = {
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
            if(property == "engine") {
                value = engineToLabel[value];
            }
            var propSize = SWITCH_SIZE / 2 - 12;
            propertiesSvg.push(
                <g
                    key={switchId + "-text-" + property} data-id={switchId} data-property={property}
                    transform={`translate(${xPosition + xIdx*(propSize + 8) + 8}, ${yPosition + yIdx*(propSize + 8) + 8})`}
                    opacity="0.5" onClick={handlePropertyClick}
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
                </g>
            )
        }
        return propertiesSvg;
    }

    function drawBulb() {
        var centerX = containerWidth / 2;
        return (
            <>
                <line x1={centerX} y1="0" x2={centerX} y2="55" stroke="#0066FF" strokeWidth="4px"/>
                <circle cx={centerX} cy="64" r="10" fill="#0066FF" style={{cursor: "pointer"}} data-type="appendage"/>
            </>
        )
    }

    var draggingSvg = "";
    if (dragging && dragging.endX) {
        draggingSvg = (
            <g>
                <line
                    key="connection-line-h"
                    x1={dragging.startX} y1={dragging.startY} stroke="#0066FF"
                    x2={dragging.endX} y2={dragging.startY} strokeWidth="2"
                />
                <line
                    key="connection-line-v"
                    x1={dragging.endX} y1={dragging.startY} stroke="#0066FF"
                    x2={dragging.endX} y2={dragging.endY} strokeWidth="2"
                />
            </g>
        )
    }
    
    var addSize = SWITCH_SIZE / 3;
    var xPosition = (containerWidth - addSize) / 2;
    var yPosition = SWITCH_Y_OFFSET + SWITCH_SIZE + 16;
    var addButton =  (
        <g key={-1+"group"}>
            <g
                key={-1 + "box"}
                onMouseEnter={handleMouseEnter} onMouseLeave={handleMouseLeave}
                onClick={handleClick}
            >
                <rect
                    id={"switch-" + -1}
                    className={"switch-inactive"} 
                    x={xPosition} y={yPosition}
                    width={addSize} height={addSize} rx="8"
                    fill={"#77a3ff"}
                />
                <text
                    key={-1 + "-text"}
                    x={xPosition + addSize / 2} y={yPosition + addSize / 2}
                    textAnchor="middle" alignmentBaseline="middle"
                    fontSize="24px" fontFamily="Roboto" fontWeight="bold" fill="#fff"
                >
                    +
                </text>
                <rect
                    data-type="switch" data-id={-1}
                    x={xPosition - 4} y={yPosition - 4}
                    width={addSize + 8} height={addSize + 8}
                    fill="#00000000" style={{ cursor: "pointer" }}
                />
            </g>
        </g>
    )

    var switchesIdList = Object.keys(props.switches).filter((switchId) => switchId !== 'colorIndex');

    return (
        <SVGContainer ref={containerRef} 
            onMouseMove={handleMouseMove} onMouseDown={handleMouseDown} onMouseUp={handleMouseUp}
        >
            {filters}
            {draggingSvg}
            {switchesIdList.map(
                (switchId, switchIdx) => 
                    drawOneSwitch(switchId, switchIdx, switchesIdList.length)
            )}
            {addButton}
            {null | drawBulb()}
        </SVGContainer>
    )
}

const filters = (<>
    <filter id="shadow">
        <feGaussianBlur stdDeviation="2.5" result="coloredBlur" />
        <feMerge>
            <feMergeNode in="coloredBlur" />
            <feMergeNode in="SourceGraphic" />
        </feMerge>
    </filter>
    <filter id="switch-shadow">
        <feDropShadow dx="0" dy="2" stdDeviation="1" floodColor="#000000" floodOpacity="0.3" />
    </filter>
    <filter id="svg-shadow" filterUnits="userSpaceOnUse" colorInterpolationFilters="sRGB">
        <feFlood floodOpacity="0" result="BackgroundImageFix" />
        <feColorMatrix in="SourceAlpha" type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0" result="hardAlpha" />
        <feOffset dy="4" />
        <feGaussianBlur stdDeviation="2" />
        <feComposite in2="hardAlpha" operator="out" />
        <feColorMatrix type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0.25 0" />
        <feBlend mode="normal" in2="BackgroundImageFix" result="effect1_dropShadow_145_66" />
        <feBlend mode="normal" in="SourceGraphic" in2="effect1_dropShadow_145_66" result="shape" />
    </filter>
</>);

const SVGContainer = styled.svg`
    height: 240px;
    width: 100%;
`;

const SideBtn = styled.g`
    cursor: pointer;
    stroke: ${props => props.color};
    fill: ${props => props.color};
`;

export default Switches;
