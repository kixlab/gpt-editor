import React, { useState, useEffect } from 'react';
import styled from 'styled-components';

const BUTTON_SIZE = 64;
const BUTTON_Y_OFFSET = 16;

function Buttons(props) {

    function drawOnebutton(buttonId, buttonIdx, numSwitches) {
        var currButton = props.buttons[buttonId];
        var label = props.slots[currButton.slots[0]] ? props.slots[currButton.slots[0]].text : "I";
        label = label[0].toUpperCase()

        var xPosition = 32;
        var yPosition = buttonIdx*(BUTTON_SIZE + BUTTON_Y_OFFSET) + 60;
        var trianglePoints = [
            [xPosition + BUTTON_SIZE + 4, yPosition + BUTTON_SIZE/2 - 10],
            [xPosition + BUTTON_SIZE + 24, yPosition + BUTTON_SIZE/2],
            [xPosition + BUTTON_SIZE + 4, yPosition + BUTTON_SIZE/2 + 10]
        ]
        var pointsStr = trianglePoints.map((point) => point.join(',')).join(' ');
        var triangle = (
            <polygon
                data-id={buttonId}
                points={pointsStr} style={{ fill: "#0066FF", cursor: "pointer" }}
                onClick={(e) => {
                    e.stopPropagation();
                    console.log("show button details")
                }}
            />
        );

        var textOrLoadingSvg = currButton.isLoading ?
            (<g key={buttonId + "-loading"}
                transform={`translate(${xPosition + BUTTON_SIZE / 2 - 17.5}, ${yPosition + BUTTON_SIZE / 2 - 17.5}) scale(0.7)`}>
                <path
                    fill="#fff"
                    d="M25,5A20.14,20.14,0,0,1,45,22.88a2.51,2.51,0,0,0,2.49,2.26h0A2.52,2.52,0,0,0,50,22.33a25.14,25.14,0,0,0-50,0,2.52,2.52,0,0,0,2.5,2.81h0A2.51,2.51,0,0,0,5,22.88,20.14,20.14,0,0,1,25,5Z">
                    <animateTransform attributeName="transform" type="rotate" from="0 25 25" to="360 25 25" dur="0.5s" repeatCount="indefinite" />
                </path>
            </g>) :
            (<text
                key={buttonId + "-text"}
                x={xPosition + BUTTON_SIZE / 2} y={yPosition + BUTTON_SIZE / 2}
                textAnchor="middle" alignmentBaseline="middle"
                fontSize="18px" fontFamily="Roboto" fontWeight="bold" fill="#fff"
            >
                {label}
            </text>)

        return (
            <g key={buttonId+"group"}>
                {connectorSvg}
                <g
                    key={switchId + "box"}
                    onMouseEnter={handleMouseEnter} onMouseLeave={handleMouseLeave}
                    onClick={handleClick}
                >
                    <rect
                        id={"switch-" + switchId}
                        className={currSwitch.path !== null ? "switch" : "switch-inactive"} 
                        x={xPosition} y={yPosition}
                        width={SWITCH_SIZE} height={SWITCH_SIZE} rx="4"
                        fill={currSwitch.color + (currSwitch.path !== null ? "FF" : "88")}
                    />
                    {isSelected ? selectionRing : ""}
                    {textOrLoadingSvg}
                    <rect
                        data-type="switch" data-id={switchId}
                        x={xPosition - 4} y={yPosition - 4}
                        width={SWITCH_SIZE + 8} height={SWITCH_SIZE + 8}
                        fill="#00000000" style={currSwitch.path !== null ?{ cursor: "pointer" } : {}}
                    />
                    {isSelected ? triangle : ""}
                </g>
            </g>
        )
    }

    function drawButtons() {
        let buttons = [];
        var buttonIds = Object.keys(props.buttons);
        for (let i = 0; i < buttonIds.length; i++) {
            var currButtonId = buttonIds[i];
            var currButton = props.buttons[currButtonId];
            var label = props.slots[currButton.slots[0]] ? props.slots[currButton.slots[0]].text : "I";
            label = label[0].toUpperCase()
            buttons.push(
                <rect 
                    key={i} className="switch" style={{cursor: "pointer"}}
                    x={24} y={i*(BUTTON_SIZE + BUTTON_Y_OFFSET) + 60}
                    width={BUTTON_SIZE} height={BUTTON_SIZE} rx="8"
                    fill="#0066FF"
                />
            );
            buttons.push(
                <text
            )
        }
        return buttons;
    }

    return (
        <SVGContainer>
            <svg width="100%" height="100%">
                {filters}
                {drawButtons()}
            </svg>
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

const SVGContainer = styled.div`
    width: 60%;
    height: 100%;
    padding: 60px 0;
`;

export default Buttons;