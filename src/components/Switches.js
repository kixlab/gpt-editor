import React, { useState, useRef } from 'react';

import {
    SWITCH_X_OFFSET,
    SWITCH_Y_OFFSET,
    SWITCH_Y_SPACE,
    SWITCH_SIZE,
    LENS_SIZE
} from './Sizes';

function Switches(props) {
    const [hoverSwitch, setHoverSwitch] = useState(null);
    const clickTimer = useRef(null);

    function handleMouseEnter(e) {
        var hoverSwitch = parseInt(e.target.getAttribute('data-id'))
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
        switch (e.detail) {
            case 1:
                clickTimer.current = setTimeout(() => {
                    props.setSelected({type: "switch", data: data});
                    clickTimer.current = null;
                }, 150);
                break;
            case 2:
                if(clickTimer.current == null) return;
                clearTimeout(clickTimer.current);
                clickTimer.current = null;
                console.log("generate")
                break;
            default:
                break;
        }
    }

    function drawOneSwitch(switchesList, switchId, currSwitch, yPosition, isHover) {
        var trianglePoints = [
            [SWITCH_X_OFFSET + SWITCH_SIZE + 8, yPosition + SWITCH_SIZE/2 - 10],
            [SWITCH_X_OFFSET + SWITCH_SIZE + 8, yPosition + SWITCH_SIZE/2 + 10],
            [SWITCH_X_OFFSET + SWITCH_SIZE + 8+ 20, yPosition + SWITCH_SIZE/2]
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
                className="switch-selection" x={SWITCH_X_OFFSET - 3} y={yPosition - 3}
                width={SWITCH_SIZE + 6} height={SWITCH_SIZE + 6} rx="4"
                fill="none" stroke="#00C2FF" strokeWidth="2px"
            />
        )

        switchesList.push(
            <g 
                key={switchId + "box"}
                onMouseEnter={handleMouseEnter} onMouseLeave={handleMouseLeave}
                onClick={handleClick}
            > 
                <rect
                    id={"switch-" + switchId}
                    className="switch" x={SWITCH_X_OFFSET} y={yPosition}
                    width={SWITCH_SIZE} height={SWITCH_SIZE} rx="4"
                    fill={currSwitch.color}
                />
                {isSelected ? selectionRing : ""}
                <text
                    key={switchId + "-text"}
                    x={SWITCH_X_OFFSET + SWITCH_SIZE/2} y={yPosition + SWITCH_SIZE/2}
                    textAnchor="middle" alignmentBaseline="middle"
                    fontSize="14px" fontFamily="Roboto" fontWeight="bold" fill="#fff"
                >{currSwitch.model}</text>
                <rect 
                    data-type="switch" data-id={switchId}
                    x={SWITCH_X_OFFSET - 4} y={yPosition - 4}
                    width={SWITCH_SIZE + 8} height={SWITCH_SIZE + 8}
                    fill="#00000000" style={{cursor: "pointer"}}
                />
                {isSelected ? triangle : ""}
            </g>
        )
    }

    function drawSwitches() {
        var nextPosition = SWITCH_Y_OFFSET;
        var lensToPosition = {};
        var switchesList = [];
        var switchIdList = Object.keys(props.switches);
        for(var i = 0; i < switchIdList.length; i++) {
            var switchId = switchIdList[i];
            var curr = props.switches[switchId];
            if(!props.slotsInDepth.includes(curr.slot)) continue;
            var lensId = curr.lens;
            var currPosition = nextPosition;

            var isHover = hoverSwitch === parseInt(switchId);
            if(lensId === -1) {
                drawOneSwitch(switchesList, switchId, curr, nextPosition, isHover);
                nextPosition += SWITCH_SIZE + SWITCH_Y_SPACE;
            } else {
                if(lensToPosition[lensId] !== undefined) {
                    currPosition = lensToPosition[lensId];
                    drawOneSwitch(switchesList, switchId, curr, currPosition, isHover);
                    lensToPosition[lensId] += SWITCH_SIZE + SWITCH_Y_SPACE;
                } else {
                    drawOneSwitch(switchesList, switchId, curr, nextPosition, isHover);
                    lensToPosition[lensId] = nextPosition + SWITCH_SIZE + SWITCH_Y_SPACE;
                    nextPosition += LENS_SIZE + SWITCH_Y_SPACE;
                }
            }

            if(isHover) {
                var thumb = document.getElementById(curr.slot + '-switch-' + switchId);
                var startCoords = [parseInt(thumb.getAttribute("x")) + 8, parseInt(thumb.getAttribute('y'))+4];
                var endCoords = [SWITCH_X_OFFSET, currPosition + SWITCH_SIZE/2];
                switchesList.unshift(
                    <line key={switchId + "-hover"}
                        x1={startCoords[0]} y1={startCoords[1]}
                        x2={endCoords[0]} y2={endCoords[1]}
                        stroke={curr.color + "80"} strokeWidth="4"
                    />
                )
            }
        }

        return switchesList;
    }

    return (drawSwitches());
};

export default Switches;