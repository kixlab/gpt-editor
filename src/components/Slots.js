import React from 'react';

const SLOT_X_OFFSET = 20;
const SLOT_Y_OFFSET = 108;
const SLOT_X_SPACE = 40;
const SLOT_Y_SPACE = 30;
const SLOT_SIZE = 8;

function Slots(props) {
    function handleClick(e) {
        let data = e.target.getAttribute("data-path");
        if(data.split("-").length == 1) {
            switch (e.detail) {
                case 1:
                    props.setSelected({type: "slot", data: data});
                    props.changePath(data);
                    break;
                case 2:
                    props.changeDepth(data.split(",").length - 1);
                    break;
                default:
                    console.log("click");
                    break;
            }
        } else {
            props.setSelected({type: "slot-edge", data: data});
        }
    }

    function handleMouseEnter(e) {
        var hoverPathStr = "s" + e.target.getAttribute("data-path");
        var currPathStr = "s" + props.path.join(",");
        if(currPathStr.includes(hoverPathStr)) return;
        props.setHoverPath(hoverPathStr.slice(1).split(",").map(x => parseInt(x)));
    }

    function handleMouseLeave(e) {
        props.setHoverPath(null);
    }

    function recursiveSlotDrawing(node, currPath, depth, numInLevel, isPath, isHoverPath) {
        var elements = [];

        if(depth !== -1 && numInLevel[depth] == undefined) numInLevel.push(0);

        var coords = [SLOT_X_OFFSET + SLOT_X_SPACE * numInLevel[depth], SLOT_Y_OFFSET + SLOT_Y_SPACE * depth]
        if(depth !== -1 && (node === undefined || node.type !== "anchor")) {
            var currPathStr = currPath.join(",");
            var currSize = SLOT_SIZE + (props.currentDepth == depth ? 4 : 0)

            if(node !== undefined) {
                elements.push(
                    <circle 
                        key={currPathStr} data-path={currPathStr}
                        onClick={handleClick} onMouseEnter={handleMouseEnter} onMouseLeave={handleMouseLeave}
                        cx={coords[0]} cy={coords[1]} r={currSize}
                        fill={isPath ? "#0066FF" : (isHoverPath ? "rgba(0, 102, 255, 0.4)" : "#fff")} 
                        stroke="#0066FF" strokeWidth="2px" style={{cursor: "pointer"}}
                    />
                );
            } else {
                elements.push(
                    <circle 
                        key={currPathStr} data-path={currPathStr}
                        cx={coords[0]} cy={coords[1]} r={currSize}
                        fill={"rgba(0, 102, 255, 0.2)"} stroke="rgba(0, 102, 255, 0.2)" strokeWidth="2px"
                    />
                );
            }

            if(props.selected && props.selected.type === "slot" && currPathStr === props.selected.data) {
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
        var childrenLen = children.length + ((props.isInsert && isPath && props.path.length === depth + 1) ? 1 : 0);

        for(var i = 0; i < childrenLen; i++) {
            var isTemp = i === children.length;
            var currIsPath = (isPath && props.path[depth + 1] == i) || isTemp;
            var currIsHoverPath = props.hoverPath && isHoverPath && props.hoverPath[depth + 1] == i;
            var [svgs, newNumInLevel] = recursiveSlotDrawing(children[i], [...currPath, i], depth + 1, numInLevel, currIsPath, currIsHoverPath);
            elements = elements.concat(svgs);
            for(var j = depth + 1; j < newNumInLevel; j++) {
                if(numInLevel[j] == undefined) 
                    numInLevel.push(newNumInLevel[j]);
                else
                    numInLevel[j] += newNumInLevel[j];
            }

            if(depth === -1 || node.type === "anchor")
                continue;
            
            var endCoords = [SLOT_X_OFFSET + SLOT_X_SPACE * (numInLevel[depth + 1] - 1), SLOT_Y_OFFSET + SLOT_Y_SPACE * (depth + 1)];
            var strokeColor = currIsPath ? "rgba(0, 102, 255, 1.0)" : "rgba(0, 102, 255, 0.2)";
            var edgeStr = currPath.join(",") + "-" + [...currPath, i].join(",");

            if(isTemp) {
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
                        key="selection-ring"
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
                        key={edgeStr} data-path={edgeStr} onClick={handleClick}
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

    return recursiveSlotDrawing(props.slots, [], -1, [], true, true)[0];
}

export default Slots;