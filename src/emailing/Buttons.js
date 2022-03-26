import React, { useState, useEffect, useRef } from 'react';
import styled from 'styled-components';

import InputContent from './InputContent';
import SwitchContent from './SwitchContent';
import LensContent from './LensContent';

const BUTTON_SIZE = 64;
const BUTTON_Y_OFFSET = 16;

function Buttons(props) {
    const [hoverButton, setHoverButton] = useState(null);
    const clickTimer = useRef(null);

    function handleMouseEnter(e) {
        if(e.target.getAttribute("data-id") === "-1") return;
        setHoverButton(e.target.getAttribute("data-id"));
    }
    function handleMouseLeave() {
        setHoverButton(null);
    }
    function handleClick(e) {
        e.stopPropagation();
        var buttonId = e.target.getAttribute("data-id");
        if(buttonId === "-1") {
            props.createButton();
        } else {
            let data = e.target.getAttribute("data-id");
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
                    clearTimeout(clickTimer.current);
                    clickTimer.current = null;
                    if(props.selected.type === 'button' && props.selected.data === data) {
                        props.setSelected({type: null})
                    } else {
                        props.setSelected({type: "button", data: data});
                    }
                    break;
                default:
                    break;
            }
        }
    }

    function handleClickExpand(e) {
        e.stopPropagation();
        var buttonId = e.target.getAttribute("data-id");
        props.expandButton(buttonId);
    }

    function drawOneButton(buttonId, buttonIdx) {
        var xPosition = 32;
        var yPosition = buttonIdx*(BUTTON_SIZE + BUTTON_Y_OFFSET) + 60;

        var currButton = props.buttons[buttonId];
        var label = "+";
        var triangle = "";
        var isSelected = false;
        var textOrLoadingSvg = (
            <text
                key={buttonId + "-text"}
                x={xPosition + BUTTON_SIZE/2} y={yPosition + BUTTON_SIZE/2 + 4}
                textAnchor="middle" alignmentBaseline="middle"
                fontSize="40px" fontFamily="Roboto" fontWeight="bold" fill="#fff"
            >
                {label}
            </text>
        )

        if(currButton !== undefined) {
            var isExpanded = buttonId === props.expandedButton;
            label = props.slots[currButton.slots[0]] ? props.slots[currButton.slots[0]].text : "I";
            label = label.length === 0 ? "I" : label[0].toUpperCase()

            var trianglePoints = [
                [xPosition + BUTTON_SIZE + (isExpanded ? 24 : 4), yPosition + BUTTON_SIZE/2 - 10],
                [xPosition + BUTTON_SIZE + (isExpanded ? 4 : 24), yPosition + BUTTON_SIZE/2],
                [xPosition + BUTTON_SIZE + (isExpanded ? 24 : 4), yPosition + BUTTON_SIZE/2 + 10]
            ]
            var pointsStr = trianglePoints.map((point) => point.join(',')).join(' ');
            var triangle = (
                <>
                    <polygon
                        data-id={buttonId}
                        points={pointsStr} style={{ fill: "#0066FF" }}
                    />
                    <rect 
                        data-id={buttonId} style={{ fill: "#00000000", cursor: "pointer" }}
                        x={xPosition + BUTTON_SIZE + 4} y={yPosition}
                        width={20} height={BUTTON_SIZE}
                        onClick={handleClickExpand}
                    />
                </>
            );

            isSelected = props.selected && props.selected.type === "button" && props.selected.data === buttonId;
            var selectionRing = (
                <rect
                    className="switch-selection" x={xPosition - 3} y={yPosition - 3}
                    width={BUTTON_SIZE + 6} height={BUTTON_SIZE + 6} rx="4"
                    fill="none" stroke="#00C2FF" strokeWidth="2px"
                />
            )

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
                    x={xPosition + BUTTON_SIZE/2} y={yPosition + BUTTON_SIZE/2 + 4}
                    textAnchor="middle" alignmentBaseline="middle"
                    fontSize="40px" fontFamily="Roboto" fontWeight="bold" fill="#fff"
                >
                    {label}
                </text>)
        }

        return (
            <g key={buttonId+"group"}>
                <g
                    key={buttonId + "box"}
                    onMouseEnter={handleMouseEnter} onMouseLeave={handleMouseLeave}
                    onClick={handleClick}
                >
                    <rect
                        id={"button-" + buttonId}
                        className={buttonId !== -1 ? "switch" : ""}
                        x={xPosition} y={yPosition}
                        width={BUTTON_SIZE} height={BUTTON_SIZE} rx="8"
                        fill={buttonId !== -1 ? "#0066FF" : "#0066FF66"}
                    />
                    {isSelected ? selectionRing : ""}
                    {textOrLoadingSvg}
                    <rect
                        data-type="button" data-id={buttonId}
                        x={xPosition - 4} y={yPosition - 4}
                        width={BUTTON_SIZE + 8} height={BUTTON_SIZE + 8}
                        fill="#00000000" style={{ cursor: "pointer" }}
                    />
                    {(hoverButton && hoverButton === buttonId) || (buttonId !== -1 && isExpanded) ? triangle : ""}
                </g>
            </g>
        )
    }

    function drawExpanded() {
        if(props.expandedButton === null) return "";
        var buttonId = props.expandedButton;
        var currButton = props.buttons[buttonId];
        var buttonIds = Object.keys(props.buttons);
        var buttonIdx = buttonIds.indexOf(buttonId);

        var xPosition = 32 + 64 + 32;
        var yPosition = buttonIdx*(BUTTON_SIZE + BUTTON_Y_OFFSET) + 120;

        return (
            <ExpandedDetails xPosition={xPosition} yPosition={yPosition}>
                <InputContainer>
                    <ContainerHeader>
                        Input
                    </ContainerHeader>
                    <InputContent 
                        buttons={props.buttons} buttonId={buttonId}
                        slots={props.slots} changeSlot={props.changeSlot} createSlot={props.createSlot}
                        changeOutputPrefix={props.changeOutputPrefix}
                        selected={props.selected} setSelected={props.setSelected}
                    />
                </InputContainer>
                <Line></Line>
                <ModelContainer>
                    <ContainerHeader style={{marginBottom: "4px"}}>
                        Model
                    </ContainerHeader>
                    <SwitchContent
                        buttons={props.buttons} buttonId={buttonId} switches={props.switches}
                        selected={props.selected} setSelected={props.setSelected}
                        createSwitch={props.createSwitch} onPropertyChange={props.onPropertyChange}
                    />
                </ModelContainer>
                <Line></Line>
                <OutputContainer>
                    <ContainerHeader style={{marginBottom: "4px"}}>
                        Output
                    </ContainerHeader>
                    <LensContent
                        buttons={props.buttons} buttonId={buttonId}
                        lenses={props.lenses} changeLens={props.changeLens}
                    />
                </OutputContainer>
            </ExpandedDetails>
        )
    }

    const buttonIds = Object.keys(props.buttons);

    return (
        <SVGContainer>
            <svg width="100%" height="100%">
                {filters}
                {buttonIds.map((buttonId, idx) => drawOneButton(buttonId, idx))}
                {drawOneButton(-1, buttonIds.length)}
            </svg>
            {drawExpanded()}
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
    position: relative;
`;

const ExpandedDetails = styled.div`
    position: absolute; 
    top: ${props => props.yPosition}px;
    left: ${props => props.xPosition}px;
    display: flex;
    flex-direction: row;
`;

const ContainerHeader = styled.div`
    font-size: 18px;
    color: #0066FF;
    width: 100%;
`;

const Line = styled.div`
    width: 20px;
    height: 2px;
    background-color: #0066FF;
    margin-top: 24px;
`;

const InputContainer = styled.div`
    width: 340px;
    padding: 8px 16px 16px 16px;
    background-color: #0066FF1A;
    border-radius: 12px;
    height: fit-content;
`;

const ModelContainer = styled.div`
    padding: 8px 16px 16px 16px;
    background-color: #0066FF1A;
    border-radius: 12px;
    height: fit-content;
`;

const OutputContainer = styled.div`
    padding: 8px 16px 16px 16px;
    background-color: #0066FF1A;
    border-radius: 12px;
    height: fit-content;
`;

export default Buttons;