import React, { useState } from 'react';
import axios from "axios";

import { Node } from './Node';

// var testData = [
//     { id: 0, text: "Hey my name is Mark.", parent: -1, children: [1, 5, 12] },
//     { id: 1, text: "I am the child of Mark.", parent: 0, children: [2, 3, 4] },
//     { id: 2, text: "So that makes me Mark Jr.", parent: 1, children: [] },
//     { id: 3, text: "That makes my dad Mark Sr.", parent: 1, children: [] },
//     { id: 4, text: "That makes me Mark III.", parent: 1, children: [] },
//     { id: 5, text: "I am from the city of New York.", parent: 0, children: [6, 7, 8] },
//     { id: 6, text: "In New York, we call ourselves the New Yorkers.", parent: 5, children: []},
//     { id: 7, text: "New York is the largest city in the United States.", parent: 5, children: []},
//     { id: 8, text: "New Yorkers are known for their pizza.", parent: 5, children: [9, 10, 11] },
//     { id: 9, text: "Pizza is a staple food in New York.", parent: 8, children: []},
//     { id: 10, text: "Pizza is an amazing food.", parent: 8, children: []},
//     { id: 11, text: "Pizza with pepperoni is my favorite.", parent:8, children: []},
//     { id: 12, text: "I am a carpenter.", parent: 0, children: [13, 14, 15] },
//     { id: 13, text: "I am a lumberjack.", parent: 12, children: []},
//     { id: 14, text: "I am a painter.", parent: 12, children: []},
//     { id: 15, text: "I am a plumber.", parent: 12, children: []},
// ]

export function Tree() {
    const storyStarter = "Suddenly, icy fingers grabbed my arm as I inched through the darkness."
    const [treeData, setTreeData] = useState(
        [
            { id: 0, text: storyStarter, parent: -1, children: [] }
        ]
    );

    function getGenerations(text, nodeId) {
        var data = { text: text }
        axios
        .post(`http://localhost:5000/api/generate`, data)
        .then((response) => {
            console.log(response.data);

            var treeDataCopy = [...treeData];
            for(var i = 0; i < response.data.length; i++) {
                var newNodeId = treeDataCopy.length;
                var newNode = {
                    id: newNodeId,
                    text: response.data[i].text + ".",
                    parent: nodeId,
                    children: []
                }
                treeDataCopy[nodeId].children.push(newNodeId);
                treeDataCopy.push(newNode);
            }
            setTreeData(treeDataCopy);

            return response.data;
        });
    }

    function _handleNodeClick(nodeId) {
        getGenerations(textify(nodeId), nodeId);
    }

    function textify (nodeId) {
        let node = treeData[nodeId];
        let text = node.text;
        while (node.parent !== -1) {
            node = treeData[node.parent];
            text = node.text + " " + text;
        }
        return text;
    }

    function renderTree(currentNode, depth) {
        const tree = [<Node nodeId={currentNode.id} depth={depth} text={currentNode.text} handleClick={_handleNodeClick}/>];
        console.log(currentNode);
        for (let i = 0; i < currentNode.children.length; i++) {
            tree.push(renderTree(treeData[currentNode.children[i]], depth + 1));
        }
        return tree;
    }
    
    return (
        renderTree(treeData[0], 0)
    )
}