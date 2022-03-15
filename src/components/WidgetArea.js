import React, { useState, useRef } from 'react';
import styled from "styled-components";

function WidgetArea(props) {
    function recursivePipeDrawing(node, path, depth, numInLevel) {
        var children = node.children;
        if(children.length == 0) {
            if(depth !== -1 && numInLevel[depth] == undefined)
                numInLevel.push(0);
            numInLevel[depth] += 1;
            return [
                <circle key={path} cx={14 + 32 * (numInLevel[depth] - 1)} cy={depth * 30 + 108} r="8"/>, 
                numInLevel
            ];
        } else {
            var elements = [];
            if(depth !== -1 && numInLevel[depth] == undefined)
                numInLevel.push(0);
            
            for(var i = 0; i < children.length; i++) {
                var [svgs, newNumInLevel] = recursivePipeDrawing(children[i], path + " " + i, depth + 1, numInLevel);
                elements = elements.concat(svgs);
                for(var j = depth + 1; j < newNumInLevel; j++) {
                    if(numInLevel[j] == undefined) 
                        numInLevel.push(newNumInLevel[j]);
                    else
                        numInLevel[j] += newNumInLevel[j];
                }
            }

            if(depth !== -1)
                elements.push(
                    <circle key={path} cx={14 + 32 * numInLevel[depth]} cy={depth * 30 + 108} r="8"/>
                );
            numInLevel[depth] += 1;
            
            return [elements, numInLevel];
        }
    }

    return (
        <Container>
            {recursivePipeDrawing(props.pipe, "", -1, [])[0]}
        </Container>
    )
}

const Container = styled.svg`
    height: 100%;
    flex-grow: 1;
`;

export default WidgetArea;