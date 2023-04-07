import React, { useState, useRef } from 'react';

import {
    SWITCH_X_OFFSET,
    SWITCH_Y_OFFSET,
    SWITCH_Y_SPACE,
    SWITCH_SIZE,
    LENS_SIZE,
    LENS_X_OFFSET
} from './Sizes';

import {
    HistoryButton,
    SettingButton
} from './SVG';


import Lens from './Lens';

function Switches(props) {
    const [currColor, setCurrColor] = useState(0);
    const [hoverSwitch, setHoverSwitch] = useState(null);
    const clickTimer = useRef(null);

    function handleMouseEnter(e) {
        var hoverSwitch = e.target.getAttribute('data-id');
        if(hoverSwitch === "-1" || e.target.classList.contains("sidebutton")) return;
        setHoverSwitch(hoverSwitch);
        var hoverSlot = props.switches[hoverSwitch].slot;
        props.setHoverSlot(hoverSlot);
    }
    
    function handleMouseLeave(e) {
        setHoverSwitch(null);
        props.setHoverSlot(null);
    }
    
    function handleClick(e) {
        let data = e.target.getAttribute("data-id");
        if(e.target.classList.contains("sidebutton")) return;
        
        if(data === "-1") {
            props.createSwitch(props.lastSlot);
            return;
        }

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
                props.setSelected({type: "switch", data: data});
                break;
            default:
                break;
        }
    }

    function drawOneSwitch(switchesList, switchId, currSwitch, yPosition, isPinned) {
        var xPosition = !isPinned ? SWITCH_X_OFFSET : LENS_X_OFFSET + LENS_SIZE + 32 + LENS_SIZE/2 - SWITCH_SIZE/2;
        yPosition = yPosition - (isPinned ? SWITCH_SIZE + 16 : 0);

        if(currSwitch === null) {
            xPosition = xPosition + (SWITCH_SIZE - 48)/2;
            return (
                <g 
                    key={switchId + "box"}
                    onMouseEnter={handleMouseEnter} onMouseLeave={handleMouseLeave}
                    onClick={handleClick}
                > 
                    <rect
                        id={"switch-" + switchId}
                        className={currSwitch === null ? "switch-inactive" : "switch"}
                        x={xPosition} y={yPosition}
                        width={48} height={48} rx="4"
                        fill="#0066FF44"
                    />
                        <text
                            key={switchId + "-text"}
                            x={xPosition + 48/2} y={yPosition + 48/2}
                            textAnchor="middle" alignmentBaseline="middle"
                            fontSize="32px" fontFamily="Roboto" fontWeight="bold" fill="#fff"
                        >
                            +
                        </text>      
                    <rect 
                        data-type="switch" data-id={switchId}
                        x={xPosition - 4} y={yPosition - 4}
                        width={48 + 8} height={48 + 8}
                        fill="#00000000" style={{cursor: "pointer"}}
                    />
                </g>
            );       
        }

        var sideButtons = [
            <g
                key={2}
                data-id={switchId} style={{cursor: "pointer"}}
                className="sidebutton"
                onClick={(e) => props.showSwitchSide('history')}
                transform={`translate(${xPosition+SWITCH_SIZE+8}, ${yPosition})`} 
                stroke={currSwitch.color} fill={currSwitch.color}
            >
                {HistoryButton}
            </g>
        ]

        var isSelected = props.selected && props.selected.type === "switch" && props.selected.data === switchId;
        var selectionRing = (
            <rect 
                className="switch-selection" x={xPosition - 3} y={yPosition - 3}
                width={SWITCH_SIZE + 6} height={SWITCH_SIZE + 6 + 12} rx="4"
                fill="none" stroke="#00C2FF" strokeWidth="2px"
            />
        )

        var loadingSvg = currSwitch.isLoading ?
            (<g key={switchId + "-loading"} 
                transform={`translate(${xPosition + SWITCH_SIZE/2 - 20}, ${yPosition + SWITCH_SIZE/2 - 8}) scale(0.8)`}>
                <path 
                    fill="#fff" 
                    d="M25,5A20.14,20.14,0,0,1,45,22.88a2.51,2.51,0,0,0,2.49,2.26h0A2.52,2.52,0,0,0,50,22.33a25.14,25.14,0,0,0-50,0,2.52,2.52,0,0,0,2.5,2.81h0A2.51,2.51,0,0,0,5,22.88,20.14,20.14,0,0,1,25,5Z">
                        <animateTransform attributeName="transform" type="rotate" from="0 25 25" to="360 25 25" dur="0.5s" repeatCount="indefinite" />
                </path>
            </g>) : "";

        var propertiesSvg = createPropertySvg(switchId, currSwitch, xPosition, yPosition + 12);

        switchesList.push(
            <g 
                key={switchId + "box"}
                onMouseEnter={handleMouseEnter} onMouseLeave={handleMouseLeave}
                onClick={handleClick}
            > 
                <rect
                    id={"switch-" + switchId}
                    className={currSwitch === null ? "switch-inactive" : "switch"}
                    x={xPosition} y={yPosition}
                    width={SWITCH_SIZE} height={SWITCH_SIZE + 12} rx="4"
                    fill={currSwitch.color}
                />
                {isSelected ? selectionRing : ""}
                <text
                    key={switchId + "-text"}
                    x={xPosition + SWITCH_SIZE/2} y={yPosition + 12}
                    textAnchor="middle" alignmentBaseline="middle"
                    fontSize="14px" fontFamily="Roboto" fontWeight="bold" fill="#fff"
                >
                    {currSwitch.model}
                </text>
                {loadingSvg}
                <rect 
                    data-type="switch" data-id={switchId}
                    x={xPosition - 4} y={yPosition - 4}
                    width={SWITCH_SIZE + 8} height={SWITCH_SIZE + 8 + 12}
                    fill="#00000000" style={{cursor: "pointer"}}
                />
                {isSelected ? sideButtons : ""}
                {propertiesSvg}
            </g>
        )
    }

    function createPropertySvg(switchId, currSwitch, xPosition, yPosition) {
        var properties = ['engine', 'temperature', 'presencePen', 'bestOf'];
        var defaultValues = {
            engine: 'text-davinci-001',
            temperature: 0.7,
            presencePen: 0,
            bestOf: 1
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

    function handlePropertyClick(e) {
        e.stopPropagation();
        let switchId = e.target.getAttribute("data-id");
        console.log(switchId);
        if(props.switches[switchId].isLoading) return;
        let property = e.target.getAttribute("data-property");
        console.log(property)
        props.setSelected({type: "property", data: {switchId: switchId, property: property}});
    }

    function drawSwitches() {
        var nextPosition = SWITCH_Y_OFFSET;
        var nextPinnedPosition = SWITCH_Y_OFFSET;
        var lensToPosition = {};
        var switchesList = [];
        var switchIdList = Object.keys(props.switches).filter((id) => id !== 'colorIndex');
        var lensesList = [];
        for(var i = 0; i < switchIdList.length; i++) {
            var switchId = switchIdList[i];
            var curr = props.switches[switchId];
            var lensId = curr.lens;
            var currPosition = nextPosition;
            var currPinnedPosition = nextPinnedPosition;
            var isPinned = props.lenses[lensId] && props.lenses[lensId].isPinned;

            var isHover = hoverSwitch === switchId;
            if(lensId === -1) {
                drawOneSwitch(switchesList, switchId, curr, nextPosition);
                lensesList.push(
                    <Lens 
                        key={'temporallens-' + switchId} 
                        lensId={lensId} switchId={switchId} 
                        lenses={props.lenses} position={nextPosition}
                        chooseLens={props.chooseLens}
                        clearLens={props.clearLens}
                    />
                )
                nextPosition += (SWITCH_SIZE + 12) + SWITCH_Y_SPACE;
            } else if(isPinned) {
                drawOneSwitch(switchesList, switchId, curr, currPinnedPosition, isPinned);
                lensesList.push(
                    <Lens 
                        key={lensId} lensId={lensId} 
                        lenses={props.lenses} position={currPinnedPosition} switches={props.switches}
                        selected={props.selected} setSelected={props.setSelected}
                        slotifyGenerations={props.slotifyGenerations} changeLensProperty={props.changeLensProperty}
                        clearLens={props.clearLens}
                    />
                )
                nextPinnedPosition += (SWITCH_SIZE + 12) + LENS_SIZE + 16;
            } else {
                if(lensToPosition[lensId] !== undefined) {
                    currPosition = lensToPosition[lensId];
                    drawOneSwitch(switchesList, switchId, curr, currPosition);
                    lensToPosition[lensId] += SWITCH_SIZE + SWITCH_Y_SPACE;
                } else {
                    var lens = props.lenses[lensId];
                    var lensSize = lens.collapse ? lens.switches.length * (SWITCH_SIZE + 12 + SWITCH_Y_SPACE) - SWITCH_Y_SPACE : LENS_SIZE;
                    drawOneSwitch(switchesList, switchId, curr, nextPosition);
                    lensToPosition[lensId] = nextPosition + (SWITCH_SIZE + 12) + SWITCH_Y_SPACE;
                    lensesList.push(
                        <Lens 
                            key={lensId} lensId={lensId} 
                            lenses={props.lenses} position={nextPosition} switches={props.switches}
                            selected={props.selected} setSelected={props.setSelected}
                            slotifyGenerations={props.slotifyGenerations} changeLensProperty={props.changeLensProperty}
                            clearLens={props.clearLens}
                        />
                    )
                    nextPosition += lensSize + SWITCH_Y_SPACE;
                }
            }

            if(curr.slot !== null && isHover) {
                var thumb = document.getElementById(curr.slot + '-switch-' + switchId);
                if(thumb !== null) {
                    var startCoords = [parseInt(thumb.getAttribute("x")) + 8, parseInt(thumb.getAttribute('y'))+4];
                    var endCoords = [SWITCH_X_OFFSET, currPosition + SWITCH_SIZE/2];
                    if(isPinned) {
                        endCoords = [LENS_X_OFFSET + LENS_SIZE + 32 + LENS_SIZE/2 - SWITCH_SIZE/2, currPinnedPosition - SWITCH_SIZE/2 - 16]
                    }
                    switchesList.unshift(
                        <line key={switchId + "-hover"}
                            x1={startCoords[0]} y1={startCoords[1]}
                            x2={endCoords[0]} y2={endCoords[1]}
                            stroke={curr.color + "80"} strokeWidth="4"
                        />
                    )
                }
            }
        }

        switchesList.push(drawOneSwitch(switchesList, -1, null, nextPosition))

        return lensesList.concat(switchesList);
    }

    return (drawSwitches());
};

export default Switches;