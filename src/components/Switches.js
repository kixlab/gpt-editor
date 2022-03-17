import React from 'react';

import {
    SWITCH_X_OFFSET,
    SWITCH_Y_OFFSET,
    SWITCH_Y_SPACE,
    SWITCH_SIZE,
    LENS_SIZE
} from './Sizes';

function Switches(props) {
    function drawOneSwitch(switchesList, switchId, currSwitch, yPosition) {
        var result = [];
        switchesList.push(
            <rect
                key={switchId} data-type="switch" data-id={switchId}
                className="switch" x={SWITCH_X_OFFSET} y={yPosition}
                width={SWITCH_SIZE} height={SWITCH_SIZE} rx="4"
                fill={currSwitch.color}
                style={{cursor: "pointer"}}
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
        console.log(switchIdList, props.slotsInDepth)
        for(var i = 0; i < switchIdList.length; i++) {
            var switchId = switchIdList[i];
            var curr = props.switches[switchId];
            if(!props.slotsInDepth.includes(curr.slot)) continue;
            var lensId = curr.lens;
            if(lensId === -1) {
                drawOneSwitch(switchesList, switchId, curr, nextPosition);
                nextPosition += SWITCH_SIZE + SWITCH_Y_SPACE;
            } else {
                if(lensToPosition[lensId] !== undefined) {
                    drawOneSwitch(switchesList, switchId, curr, lensToPosition[lensId]);
                    lensToPosition[lensId] += SWITCH_SIZE + SWITCH_Y_SPACE;
                } else {
                    drawOneSwitch(switchesList, switchId, curr, nextPosition);
                    lensToPosition[lensId] = nextPosition + SWITCH_SIZE + SWITCH_Y_SPACE;
                    nextPosition += LENS_SIZE + SWITCH_Y_SPACE;
                }
            }
        }
        return switchesList;
    }

    return (drawSwitches());
};

export default Switches;