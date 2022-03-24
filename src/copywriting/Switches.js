import React, { useState, useRef, useLayoutEffect } from 'react';
import styled from "styled-components";

const SWITCH_X_SPACE = 16;
const SWITCH_SIZE = 50;
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
        props.setHoverPath(props.switches[hoverSwitch].path);
    }
    
    function handleMouseLeave(e) {
        props.setHoverPath(null);
        // TODO: make it so if hover on model it shows the corresponding slots on the top
    }
    
    function handleClick(e) {
        let data = e.target.getAttribute("data-id");
        if(e.target.tagName === "polygon") return;
        switch (e.detail) {
            case 1:
                clickTimer.current = setTimeout(() => {
                    props.handleGenerate(data);
                    clickTimer.current = null;
                }, 150);
                break;
            case 2:
                if(clickTimer.current == null) return;
                clearTimeout(clickTimer.current);
                clickTimer.current = null;
                if(props.selected.type === 'switch' && props.selected.data === data)
                    props.setSelected({type: null})
                else {
                    props.setSelected({type: "switch", data: data});
                    props.setPath(props.switches[data].path);
                }
                break;
            default:
                break;
        }
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
        console.log(dropObj);

        if ([null].includes(dropObj.type)) {
            setDragging(null);
            return;
        } else if (dragging.type === 'appendage' && dropObj.type === 'switch'){
            props.attachPath(parseInt(dropObj.data), props.slots.path);
        } else if (dragging.type === "switch" && dropObj.type === "appendage") {
            props.attachPath(parseInt(dragging.data), props.slots.path);
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


    function drawOneSwitch(switchId, switchIdx, numSwitches) {
        var currSwitch = props.switches[switchId];

        var startingPoint = (containerWidth - numSwitches * SWITCH_SIZE - (numSwitches - 1) * SWITCH_X_SPACE) / 2;

        var xPosition = startingPoint + switchIdx * (SWITCH_SIZE + SWITCH_X_SPACE);
        var yPosition = 128;
        var trianglePoints = [
            [xPosition, yPosition - 6],
            [xPosition + 10, yPosition - 26],
            [xPosition + 20, yPosition - 6]
        ]
        var pointsStr = trianglePoints.map((point) => point.join(',')).join(' ');
        var triangle = (
            <polygon
                data-id={switchId}
                points={pointsStr} style={{ fill: currSwitch.color, cursor: "pointer" }}
                onClick={(e) => props.showSwitchProperties({ x: e.pageX, y: e.pageY })}
            />
        );

        var isSelected = props.selected && props.selected.type === "switch" && props.selected.data === switchId;
        var selectionRing = (
            <rect
                className="switch-selection" x={xPosition - 3} y={yPosition - 3}
                width={SWITCH_SIZE + 6} height={SWITCH_SIZE + 6} rx="4"
                fill="none" stroke="#00C2FF" strokeWidth="2px"
            />
        )

        var textOrLoadingSvg = currSwitch.isLoading ?
            (<g key={switchId + "-loading"}
                transform={`translate(${xPosition + SWITCH_SIZE / 2 - 12.5}, ${yPosition + SWITCH_SIZE / 2 - 12.5}) scale(0.5)`}>
                <path
                    fill="#fff"
                    d="M25,5A20.14,20.14,0,0,1,45,22.88a2.51,2.51,0,0,0,2.49,2.26h0A2.52,2.52,0,0,0,50,22.33a25.14,25.14,0,0,0-50,0,2.52,2.52,0,0,0,2.5,2.81h0A2.51,2.51,0,0,0,5,22.88,20.14,20.14,0,0,1,25,5Z">
                    <animateTransform attributeName="transform" type="rotate" from="0 25 25" to="360 25 25" dur="0.5s" repeatCount="indefinite" />
                </path>
            </g>) :
            (<text
                key={switchId + "-text"}
                x={xPosition + SWITCH_SIZE / 2} y={yPosition + SWITCH_SIZE / 2}
                textAnchor="middle" alignmentBaseline="middle"
                fontSize="14px" fontFamily="Roboto" fontWeight="bold" fill="#fff"
            >
                {currSwitch.model}
            </text>)

        var connectorSvg = "";
        var isPath = props.slots.path.join(" ") === currSwitch.path.join(" ");
        var isHoverPath = props.hoverPath && props.hoverPath.join(" ") === currSwitch.path.join(" ");
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
                    className="switch" x={xPosition} y={yPosition}
                    width={SWITCH_SIZE} height={SWITCH_SIZE} rx="4"
                    fill={currSwitch.color}
                />
                {isSelected ? selectionRing : ""}
                {textOrLoadingSvg}
                <rect
                    data-type="switch" data-id={switchId}
                    x={xPosition - 4} y={yPosition - 4}
                    width={SWITCH_SIZE + 8} height={SWITCH_SIZE + 8}
                    fill="#00000000" style={{ cursor: "pointer" }}
                />
                {isSelected ? triangle : ""}
            </g>
            </g>
        )
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

    var switchesIdList = Object.keys(props.switches).filter((switchId) => switchId !== 'colorIndex');

    function handleCanvasClick(e) {
        if(e.target.tagName !== 'svg') return;
        props.setSelected({type: null})
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

    return (
        <SVGContainer ref={containerRef} 
            onClick={handleCanvasClick} 
            onMouseMove={handleMouseMove} onMouseDown={handleMouseDown} onMouseUp={handleMouseUp}
        >
            {filters}
            {draggingSvg}
            {switchesIdList.map(
                (switchId, switchIdx) => 
                    drawOneSwitch(switchId, switchIdx, switchesIdList.length)
            )}
            {drawBulb()}
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
    height: 200px;
    width: 100%;
`;

export default Switches;
