import React, { useState, useRef } from 'react';

import {
    SWITCH_X_OFFSET,
    SWITCH_Y_OFFSET,
    SWITCH_Y_SPACE,
    SWITCH_SIZE,
    LENS_SIZE,
    LENS_X_OFFSET
} from './Sizes';

import Lens from './Lens';

function Switches(props) {
    const [currColor, setCurrColor] = useState(0);
    const [hoverSwitch, setHoverSwitch] = useState(null);
    const clickTimer = useRef(null);

    function handleMouseEnter(e) {
        var hoverSwitch = e.target.getAttribute('data-id');
        if(hoverSwitch === "-1") return;
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
        if(e.target.tagName === "polygon") return;
        
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

        if(currSwitch !== null) {
            var trianglePoints = [
                [xPosition + SWITCH_SIZE + 8, yPosition + SWITCH_SIZE/2 - 10],
                [xPosition + SWITCH_SIZE + 8, yPosition + SWITCH_SIZE/2 + 10],
                [xPosition + SWITCH_SIZE + 8+ 20, yPosition + SWITCH_SIZE/2]
            ]
            var pointsStr = trianglePoints.map((point) => point.join(',')).join(' ');
            var triangle = (
                <polygon 
                    data-id={switchId}
                    points={pointsStr} style={{fill: currSwitch.color, cursor: "pointer"}} 
                    onClick={(e) => props.showSwitchProperties({x: e.pageX, y: e.pageY})}
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
        }

        var textOrLoadingSvg = currSwitch === null ? 
            (<text
                key={switchId + "-text"}
                x={xPosition + SWITCH_SIZE/2} y={yPosition + SWITCH_SIZE/2}
                textAnchor="middle" alignmentBaseline="middle"
                fontSize="18px" fontFamily="Roboto" fontWeight="bold" fill="#fff"
            >
                +
            </text>) : 
            currSwitch.isLoading ?
                (<g key={switchId + "-loading"} 
                    transform={`translate(${xPosition + SWITCH_SIZE/2 - 12.5}, ${yPosition + SWITCH_SIZE/2 - 12.5}) scale(0.5)`}>
                    <path 
                        fill="#fff" 
                        d="M25,5A20.14,20.14,0,0,1,45,22.88a2.51,2.51,0,0,0,2.49,2.26h0A2.52,2.52,0,0,0,50,22.33a25.14,25.14,0,0,0-50,0,2.52,2.52,0,0,0,2.5,2.81h0A2.51,2.51,0,0,0,5,22.88,20.14,20.14,0,0,1,25,5Z">
                            <animateTransform attributeName="transform" type="rotate" from="0 25 25" to="360 25 25" dur="0.5s" repeatCount="indefinite" />
                    </path>
                </g>) :
                (<text
                    key={switchId + "-text"}
                    x={xPosition + SWITCH_SIZE/2} y={yPosition + SWITCH_SIZE/2}
                    textAnchor="middle" alignmentBaseline="middle"
                    fontSize="14px" fontFamily="Roboto" fontWeight="bold" fill="#fff"
                >
                    {currSwitch.model}
                </text>)

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
                    width={SWITCH_SIZE} height={SWITCH_SIZE} rx="4"
                    fill={currSwitch === null ? "#0066FF44" : currSwitch.color}
                />
                {currSwitch === null ? "" : (isSelected ? selectionRing : "")}
                {textOrLoadingSvg}
                <rect 
                    data-type="switch" data-id={switchId}
                    x={xPosition - 4} y={yPosition - 4}
                    width={SWITCH_SIZE + 8} height={SWITCH_SIZE + 8}
                    fill="#00000000" style={{cursor: "pointer"}}
                />
                {currSwitch === null ? "" : (isSelected ? triangle : "")}
            </g>
        )
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
                    />
                )
                nextPosition += SWITCH_SIZE + SWITCH_Y_SPACE;
            } else if(isPinned) {
                drawOneSwitch(switchesList, switchId, curr, currPinnedPosition, isPinned);
                lensesList.push(
                    <Lens 
                        key={lensId} lensId={lensId} 
                        lenses={props.lenses} position={currPinnedPosition} switches={props.switches}
                        selected={props.selected} setSelected={props.setSelected}
                        slotifyGenerations={props.slotifyGenerations} changeLensProperty={props.changeLensProperty}
                    />
                )
                nextPinnedPosition += SWITCH_SIZE + 16 + LENS_SIZE + 16;
            } else {
                if(lensToPosition[lensId] !== undefined) {
                    currPosition = lensToPosition[lensId];
                    drawOneSwitch(switchesList, switchId, curr, currPosition);
                    lensToPosition[lensId] += SWITCH_SIZE + SWITCH_Y_SPACE;
                } else {
                    var lens = props.lenses[lensId];
                    var lensSize = lens.collapse ? lens.switches.length * (SWITCH_SIZE + SWITCH_Y_SPACE) - SWITCH_Y_SPACE : LENS_SIZE;
                    drawOneSwitch(switchesList, switchId, curr, nextPosition);
                    lensToPosition[lensId] = nextPosition + SWITCH_SIZE + SWITCH_Y_SPACE;
                    lensesList.push(
                        <Lens 
                            key={lensId} lensId={lensId} 
                            lenses={props.lenses} position={nextPosition} switches={props.switches}
                            selected={props.selected} setSelected={props.setSelected}
                            slotifyGenerations={props.slotifyGenerations} changeLensProperty={props.changeLensProperty}
                        />
                    )
                    nextPosition += lensSize + SWITCH_Y_SPACE;
                }
            }

            if(curr.slot !== null && isHover) {
                var thumb = document.getElementById(curr.slot + '-switch-' + switchId);
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

        switchesList.push(drawOneSwitch(switchesList, -1, null, nextPosition))

        return lensesList.concat(switchesList);
    }

    return (drawSwitches());
};

export default Switches;