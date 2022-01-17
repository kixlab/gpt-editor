import React, { useState, useEffect } from 'react';
import styled from "styled-components";

function EdgeBackground(props) {
    const [edges, setEdges] = useState([]);

    function createEdges(node, depth) {
        let edges = [];
        var parentEle = document.getElementById("node-" + node.id);
        var parentX = parentEle.offsetLeft + 40*depth - 12 + 20;
        var parentY = parentEle.offsetTop + parentEle.offsetHeight;

        if(node.isMaximized) {
            for(var i = 0; i < node.children.length; i++) {
                var path = "M " + parentX + " " + parentY;

                var childId = node.children[i];
                var ele = document.getElementById("node-" + childId);
                var childX = ele.offsetLeft + 40*(depth + 1) - 10;
                var childY = ele.offsetTop + ele.offsetHeight/2; 

                path += " L " + parentX + " " + childY;
                path += " L " + childX + " " + childY;

                edges.push(<path d={path} stroke="#ccc" strokeWidth="2px" fill="transparent"/>)

                var childNode = props.treeData[childId];
                edges.push(createEdges(childNode, depth+1));
            }
        }
        return edges;
    }

    useEffect(() => {
        setTimeout(() => {
            setEdges(createEdges(props.treeData[0], 0));
        }, 10);
    }, [props.treeData]);

    return (
        <Background>
            {edges}
        </Background>
    );
}

const Background = styled.svg`
    height: 100%;
    width: calc(100% - 24px);
    position: absolute;
    top: 0;
    z-index: -1;
`;

export default EdgeBackground;