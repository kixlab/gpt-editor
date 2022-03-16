import React, { useState, useRef } from 'react';
import styled from "styled-components";

const SLOT_X_OFFSET = 20;
const SLOT_Y_OFFSET = 108;
const SLOT_X_SPACE = 44;
const SLOT_Y_SPACE = 30;
const SLOT_SIZE = 8;

function WidgetArea(props) {
    const [selected, setSelected] = useState(null);

    function handleClick(e) {
        let data = e.target.getAttribute("data-path");
        if(data.split("-").length == 1) {
            switch (e.detail) {
                case 1:
                    setSelected({type: "slot", data: data});
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
            // TODO: make this work
            console.log("Delete line");
        }
    }

    function recursiveSlotDrawing(node, currPath, depth, numInLevel, isPath) {
        var elements = [];

        if(depth !== -1 && numInLevel[depth] == undefined) numInLevel.push(0);

        var coords = [SLOT_X_OFFSET + SLOT_X_SPACE * numInLevel[depth], SLOT_Y_OFFSET + SLOT_Y_SPACE * depth]
        if(depth !== -1) {
            var currPathStr = currPath.join(",");
            var currSize = SLOT_SIZE + (props.currentDepth == depth ? 4 : 0)
            elements.push(
                <circle 
                    key={currPathStr} data-path={currPathStr}
                    onClick={handleClick}
                    cx={coords[0]} cy={coords[1]} r={currSize}
                    fill={isPath ? "#0066FF" : "#fff"} stroke="#0066FF" strokeWidth="2px" style={{cursor: "pointer"}}
                />
            );

            if(selected && selected.type === "slot" && currPathStr === selected.data) {
                elements.push(
                    <circle
                        key="selection-ring"
                        cx={coords[0]} cy={coords[1]} r={currSize + 2*3}
                        fill="none" stroke="#00C2FF" strokeWidth="2px"
                    />
                )
            }
        }

        var children = node.children;

        if(children.length != 0) {
            for(var i = 0; i < children.length; i++) {
                var currIsPath = isPath && props.path[depth + 1] == i;
                var [svgs, newNumInLevel] = recursiveSlotDrawing(children[i], [...currPath, i], depth + 1, numInLevel, currIsPath);
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
                elements.unshift(
                    <line
                        key={currPath.join(",") + "-" + [...currPath, i].join(",") + "-line"}
                        data-path={currPath.join(",") + "-" + [...currPath, i].join(",") + "-line"}
                        onClick={handleClick} style={{cursor: "pointer"}}
                        x1={coords[0]} y1={coords[1] + 8} x2={endCoords[0]} y2={endCoords[1] - 8}
                        stroke={currIsPath ? "rgba(0, 102, 255, 1.0)" : "rgba(0, 102, 255, 0.2)"} strokeWidth="2px"
                    />
                )
            }
        }

        numInLevel[depth] += 1;
            
        return [elements, numInLevel];
    }

    return (
        <Container>
            {recursiveSlotDrawing(props.slots, [], -1, [], true)[0]}
        </Container>
    )
}

const Container = styled.svg`
    height: 100%;
    flex-grow: 1;
`;

export default WidgetArea;