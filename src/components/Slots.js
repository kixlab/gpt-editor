import React from 'react';

const SLOT_X_OFFSET = 20;
const SLOT_Y_OFFSET = 108;
const SLOT_X_SPACE = 40;
const SLOT_Y_SPACE = 30;
const SLOT_SIZE = 8;

function Slots(props) {
    function handleClick(e) {
        let data = e.target.getAttribute("data-id");
        if(data.split("-").length == 1) {
            switch (e.detail) {
                case 1:
                    props.setSelected({type: "slot", data: data});
                    props.changeLastSlot(parseInt(data));
                    break;
                case 2:
                    props.changeDepth(parseInt(data));
                    break;
                default:
                    break;
            }
        } else {
            props.setSelected({type: "slot-edge", data: data});
        }
    }

    function handleMouseEnter(e) {
        let data = parseInt(e.target.getAttribute("data-id"));
        var slotId = props.lastSlot;
        var slot = props.slots[slotId];
        while(slot.parent !== 0) {
            if(slotId === data) return;
            slotId = slot.parent;
            slot = props.slots[slotId];
        }

        props.setHoverSlot(data);
    }

    function handleMouseLeave(e) {
        props.setHoverSlot(null);
    }

    function recursiveSlotDrawing(slotId, depth, numInLevel, slotPath, slotHoverPath) {
        var elements = [];

        if(depth !== -1 && numInLevel[depth] == undefined) numInLevel.push(0);

        var coords = [SLOT_X_OFFSET + SLOT_X_SPACE * numInLevel[depth], SLOT_Y_OFFSET + SLOT_Y_SPACE * depth]

        var node = props.slots[slotId];
        if(depth !== -1) {
            var currSize = SLOT_SIZE + (props.currentDepth == depth ? 4 : 0)

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
                console.log(slotId);
                elements.push(
                    <circle 
                        key={slotId} data-id={slotId}
                        cx={coords[0]} cy={coords[1]} r={currSize}
                        fill={"rgba(0, 102, 255, 0.2)"} stroke="rgba(0, 102, 255, 0.2)" strokeWidth="2px"
                    />
                );
            }

            if(props.selected && props.selected.type === "slot" && slotId === parseInt(props.selected.data)) {
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
            if(childSlotId === undefined) childSlotId = Math.max(...Object.keys(props.slots)) + 1;

            var [svgs, newNumInLevel] = recursiveSlotDrawing(childSlotId, depth + 1, numInLevel, slotPath, slotHoverPath);
            elements = elements.concat(svgs);
            for(var j = depth + 1; j < newNumInLevel; j++) {
                if(numInLevel[j] == undefined) 
                    numInLevel.push(newNumInLevel[j]);
                else
                    numInLevel[j] += newNumInLevel[j];
            }

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
        
        return [elements, numInLevel];
    }

    return recursiveSlotDrawing(0, -1, [], props.getSlotPath(props.lastSlot), props.hoverSlot ? props.getSlotPath(props.hoverSlot) : [])[0];
}

export default Slots;