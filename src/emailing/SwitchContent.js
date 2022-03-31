import React, { useState, useEffect, useRef } from 'react';
import styled from 'styled-components';

import SwitchProperties from './SwitchProperties';
import SwitchHistory from './SwitchHistory';

import { SettingButton, HistoryButton } from './SVG';

const SWITCH_SIZE = 50;
const SWITCH_Y_OFFSET = 12;

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
                width={SWITCH_SIZE + 6} height={SWITCH_SIZE + 6} rx="4"
                fill="none" stroke="#00C2FF" strokeWidth="2px"
            />
        )

        var textOrLoadingSvg = (
            <text
                key={switchId + "-text"}
                x={xPosition + SWITCH_SIZE / 2} y={yPosition + SWITCH_SIZE / 2}
                textAnchor="middle" alignmentBaseline="middle"
                fontSize={currSwitch === undefined ? "30px" : "14px"} 
                fontFamily="Roboto" fontWeight="bold" fill="#fff"
            >
                {currSwitch === undefined ? "+" : currSwitch.model}
            </text>
        )

        return (
            <g key={switchId+"group"}>
                <g
                    key={switchId + "box"}
                    onClick={handleClick}
                >
                    <rect
                        id={"switch-" + switchId}
                        className={currSwitch === undefined ? "switch-inactive" : "switch"} 
                        x={xPosition} y={yPosition}
                        width={SWITCH_SIZE} height={SWITCH_SIZE} rx="4"
                        fill={currSwitch === undefined ? "#0066FF33" : currSwitch.color}
                    />
                    {isSelected ? selectionRing : ""}
                    {textOrLoadingSvg}
                    <rect
                        data-type="switch" data-id={switchId}
                        x={xPosition - 4} y={yPosition - 4}
                        width={SWITCH_SIZE + 8} height={SWITCH_SIZE + 8}
                        fill="#00000000" style={{ cursor: "pointer" }}
                    />
                </g>
            </g>
        )
    }

    var currButton = props.buttons[props.buttonId];
    var switchIds = currButton.switches;

    return (
        <div style={{position: 'relative'}}>
            <svg width={SWITCH_SIZE + 8} height={(switchIds.length+1)*(SWITCH_SIZE+SWITCH_Y_OFFSET)}>
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
    var left = 60;

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
            <SideBtn 
                transform={`translate(0, 0)`}
                onClick={(e) => handleClickSideBtn(e, "properties")}
                color={props.switches[props.switchId].color}
            >
                {SettingButton}
            </SideBtn>,
            <SideBtn 
                transform={`translate(0, 27)`}
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