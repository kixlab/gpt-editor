import React, { useState } from 'react';
import axios from "axios";

import Node from './Node';
import { loremipsum } from './LoremIpsum';
import { propTypes } from 'react-bootstrap/esm/Image';

function Tree(props) {
    const storyStarter = "Suddenly, icy fingers grabbed my arm as I inched through the darkness."
    const [treeData, setTreeData] = useState(
        [
            { id: 0, text: storyStarter, parent: -1, children: [] }
        ]
    );
    const [hoveredPath, setHoveredPath] = useState([]);

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

    function getTestGenerations(text, nodeId) {
        var treeDataCopy = [...treeData];
        for(var i = 0; i < 3; i++) {
            var newNodeId = treeDataCopy.length;
            var newNode = {
                id: newNodeId,
                text: loremipsum[Math.floor(Math.random() * loremipsum.length)] + ".",
                parent: nodeId,
                children: []
            }
            treeDataCopy[nodeId].children.push(newNodeId);
            treeDataCopy.push(newNode);
        }
        setTreeData(treeDataCopy);
    }

    function handleGenerate(nodeId) {
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

    function getPath(nodeId) {
        let path = [nodeId];
        let node = treeData[nodeId];
        while (node.parent !== -1) {
            path.push(node.parent);
            node = treeData[node.parent];
        }
        return path;
    }

    function handleNodeHover(nodeId) {
        props.handleSelection(textify(nodeId));
        setHoveredPath(getPath(nodeId));
    }

    function handleNodeEdit(nodeId, text) {
        var treeDataCopy = [...treeData];
        treeDataCopy[nodeId].text = text;
        setTreeData(treeDataCopy);
    }

    function renderTree(currentNode, depth) {
        const tree = [
            <Node nodeId={currentNode.id} depth={depth} text={currentNode.text} 
                isBordered={hoveredPath.includes(currentNode.id)}
                handleGenerate={handleGenerate} onNodeHover={handleNodeHover}
                handleEdit={handleNodeEdit}/>
        ];
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

export default Tree;