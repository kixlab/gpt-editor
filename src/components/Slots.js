import React from 'react';

import { SLOT_X_OFFSET, SLOT_Y_OFFSET, SLOT_X_SPACE, SLOT_Y_SPACE, SLOT_SIZE } from './Sizes';

import Switches from './Switches';

function Slots(props) {
    function handleClick(e) {
        let data = e.target.getAttribute("data-id");
        if(data.split("-").length == 1) {
            switch (e.detail) {
                case 1:
                    props.changeDepth(data);
                    props.changeLastSlot(data);
                    props.setSelected(null);
                    break;
                case 2:
                    props.setSelected({type: "slot", data: data});
                    break;
                default:
                    break;
            }
        } else {
            props.setSelected({type: "slot-edge", data: data});
        }
    }

    function handleMouseEnter(e) {
        let data = e.target.getAttribute("data-id");
        var slotId = props.lastSlot;
        var slot = props.slots[slotId];
        if(props.lastSlot === 'ROOT') return;
        while(slot.parent !== 'ROOT') {
            if(slotId === data) return;
            slotId = slot.parent;
            slot = props.slots[slotId];
        }

        props.setHoverSlot(data);
    }

    function handleMouseLeave(e) {
        props.setHoverSlot(null);
    }

    function recursiveSlotDrawing(slotId, depth, numInLevel, slotPath, slotHoverPath, slotsInDepth) {
        var elements = [];

        if(depth !== -1 && numInLevel[depth] == undefined) numInLevel.push(0);

        var coords = [SLOT_X_OFFSET + SLOT_X_SPACE * numInLevel[depth], SLOT_Y_OFFSET + SLOT_Y_SPACE * depth]

        var node = props.slots[slotId];
        if(depth !== -1) {
            var currSize = SLOT_SIZE;
            // TODO: check if slot's switch's lens is pinned
            var isPinned = false;
            if(props.currentDepth == depth || isPinned) {
                currSize += props.currentDepth === depth ? 4 : 0;
                slotsInDepth.push(slotId);

                if(node !== undefined) {
                    for(var i = 0; i < node.switches.length; i++) {
                        var switchId = node.switches[i];
                        elements.push(
                            <rect
                                key={slotId+"-switch-"+switchId} id={slotId+"-switch-"+switchId}
                                x={coords[0] + currSize + 1 + 1} y={coords[1] - currSize + i*9}
                                width="8" height="8" fill={props.switches[switchId].color}
                                rx="1"
                            />
                        )
                    }
                }
            }

            if(node !== undefined) {
                var isPath = slotPath.includes(slotId);
                elements.push(
                    <circle 
                        key={slotId} data-type="slot" data-id={slotId}
                        onClick={handleClick} onMouseEnter={handleMouseEnter} onMouseLeave={handleMouseLeave}
                        cx={coords[0]} cy={coords[1]} r={currSize}
                        fill={isPath ? "#0066FF" : (slotHoverPath.includes(slotId) ? "rgba(0, 102, 255, 0.4)" : "#fff")} 
                        stroke="#0066FF" strokeWidth="2px" style={{cursor: "pointer"}}
                    />
                );
            } else {
                elements.push(
                    <circle 
                        key={slotId} data-id={slotId}
                        cx={coords[0]} cy={coords[1]} r={currSize}
                        fill={"rgba(0, 102, 255, 0.2)"} stroke="rgba(0, 102, 255, 0.2)" strokeWidth="2px"
                    />
                );
            }

            if(props.selected && props.selected.type === "slot" && slotId === props.selected.data) {
                elements.push(
                    <circle
                        key="selection-ring"
                        cx={coords[0]} cy={coords[1]} r={currSize + 2*3}
                        fill="none" stroke="#00C2FF" strokeWidth="2px"
                        style={{filter: "url(#shadow)"}}
                    />
                )
            }
        }

        var children = node === undefined ? [] : node.children;
        var childrenLen = children.length + ((props.isInsert && slotPath.includes(slotId) && slotPath.length === depth + 1) ? 1 : 0);

        for(var i = 0; i < childrenLen; i++) {
            var childSlotId = children[i];
            if(childSlotId === undefined) childSlotId = "TEMP";

            var [svgs, newNumInLevel] = recursiveSlotDrawing(childSlotId, depth + 1, numInLevel, slotPath, slotHoverPath, slotsInDepth);
            elements = elements.concat(svgs);

            if(depth === -1)
                continue;
            
            var endCoords = [SLOT_X_OFFSET + SLOT_X_SPACE * (numInLevel[depth + 1] - 1), SLOT_Y_OFFSET + SLOT_Y_SPACE * (depth + 1)];
            var strokeColor = slotPath.includes(slotId) && slotPath.includes(childSlotId) ? "rgba(0, 102, 255, 1.0)" : "rgba(0, 102, 255, 0.2)";
            var edgeStr = slotId + "-" + childSlotId;

            if(props.slots[childSlotId] === undefined) {
                elements.unshift(
                    <line
                        key={edgeStr} data-path={edgeStr} 
                        x1={coords[0]} y1={coords[1] + 8} x2={endCoords[0]} y2={endCoords[1] - 8}
                        stroke={strokeColor} strokeWidth="2px" strokeDasharray={"3,3"}
                    />
                )
            } else if(props.selected && props.selected.type === "slot-edge" && props.selected.data === edgeStr) {
                elements.unshift(
                    <line
                        key="selection-ring" data-type="slot-edge" data-id={edgeStr}
                        x1={coords[0]} y1={coords[1] + 8} x2={endCoords[0]} y2={endCoords[1] - 8}
                        stroke="#00C2FF" strokeWidth="4px"
                    />
                )
            } else {
                elements.unshift(
                    <line
                        key={edgeStr+"-area"}
                        x1={coords[0]} y1={coords[1] + 8} x2={endCoords[0]} y2={endCoords[1] - 8}
                        stroke={strokeColor} strokeWidth="2px"
                    />
                )
                elements.unshift(
                    <line
                        key={edgeStr} data-type="slot-edge" data-id={edgeStr} onClick={handleClick}
                        x1={coords[0]} y1={coords[1] + 8} x2={endCoords[0]} y2={endCoords[1] - 8}
                        stroke="rgba(0, 0, 0, 0)" strokeWidth="20px"
                        style={{cursor: "pointer"}}
                    />
                )
            }
        }

        numInLevel[depth] += 1;
        
        return [elements, numInLevel, slotsInDepth];
    }

    var [elements, numInLevel, slotsInDepth] = recursiveSlotDrawing(
        'ROOT', -1, [], 
        props.getSlotPath(props.lastSlot), 
        props.hoverSlot ? props.getSlotPath(props.hoverSlot) : [], 
        []
    );

    return (
        <>
            {elements}
            {<Switches 
                switches={props.switches} slots={props.slots} slotsInDepth={slotsInDepth} 
                selected={props.selected} setHoverSlot={props.setHoverSlot} setSelected={props.setSelected}
                showSwitchProperties={props.showSwitchProperties} handleGenerate={props.handleGenerate}
                lenses={props.lenses} chooseLens={props.chooseLens}
                slotifyGenerations={props.slotifyGenerations} changeLensProperty={props.changeLensProperty}
            />}
        </>
    );
}

export default Slots;