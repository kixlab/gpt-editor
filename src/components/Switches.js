import React, {useState} from 'react';

import {
    SWITCH_X_OFFSET,
    SWITCH_Y_OFFSET,
    SWITCH_Y_SPACE,
    SWITCH_SIZE,
    LENS_SIZE
} from './Sizes';

function Switches(props) {
    const [hoverSwitch, setHoverSwitch] = useState(null);

    function handleMouseEnter(e) {
        setHoverSwitch(parseInt(e.target.getAttribute('data-id')));
    }
    
    function handleMouseLeave(e) {
        setHoverSwitch(null);
    }

    function drawOneSwitch(switchesList, switchId, currSwitch, yPosition) {
        var result = [];
        switchesList.push(
            <rect
                key={switchId} data-type="switch" data-id={switchId}
                className="switch" x={SWITCH_X_OFFSET} y={yPosition}
                width={SWITCH_SIZE} height={SWITCH_SIZE} rx="4"
                fill={currSwitch.color} style={{cursor: "pointer"}}
                onMouseEnter={handleMouseEnter} onMouseLeave={handleMouseLeave}
            />
        )
        switchesList.push(
            <text
                key={switchId + "-text"} data-type="switch" data-id={switchId}
                x={SWITCH_X_OFFSET + SWITCH_SIZE/2} y={yPosition + SWITCH_SIZE/2}
                textAnchor="middle" alignmentBaseline="middle"
                fontSize="12px" fontFamily="Roboto" fontWeight="bold" fill="#fff"
                style={{cursor: "pointer"}}
            >{currSwitch.model}</text>
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
            if(lensId === -1) {
                drawOneSwitch(switchesList, switchId, curr, nextPosition);
                nextPosition += SWITCH_SIZE + SWITCH_Y_SPACE;
            } else {
                if(lensToPosition[lensId] !== undefined) {
                    currPosition = lensToPosition[lensId];
                    drawOneSwitch(switchesList, switchId, curr, currPosition);
                    lensToPosition[lensId] += SWITCH_SIZE + SWITCH_Y_SPACE;
                } else {
                    drawOneSwitch(switchesList, switchId, curr, nextPosition);
                    lensToPosition[lensId] = nextPosition + SWITCH_SIZE + SWITCH_Y_SPACE;
                    nextPosition += LENS_SIZE + SWITCH_Y_SPACE;
                }
            }

            if(hoverSwitch === parseInt(switchId)) {
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