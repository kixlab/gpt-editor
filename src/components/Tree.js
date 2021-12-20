import React, { useState } from 'react';
import axios from "axios";

import Node from './Node';
import MaxMinNode from './MaxMinNode';
import EdgeBackground from './EdgeBackground';

import { loremipsum } from './LoremIpsum';
import { propTypes } from 'react-bootstrap/esm/Image';

function Tree(props) {
    const storyStarter = "Suddenly, icy fingers grabbed my arm as I inched through the darkness."
    const [treeData, setTreeData] = useState(
        [
            { id: 0, text: storyStarter, parent: -1, children: [], isNew: true, isMaximized: true }
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
            treeDataCopy.forEach((value, idx) => {
                treeDataCopy[idx].isNew = false;
            });
            for(var i = 0; i < response.data.length; i++) {
                var newNodeId = treeDataCopy.length;
                var newNode = {
                    id: newNodeId,
                    text: response.data[i].text + ".",
                    parent: nodeId,
                    children: [],
                    isNew: true,
                    isMaximized: true
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
        treeDataCopy.forEach((value, idx) => {
            treeDataCopy[idx].isNew = false;
        });
        for(var i = 0; i < 3; i++) {
            var newNodeId = treeDataCopy.length;
            var newNode = {
                id: newNodeId,
                text: loremipsum[Math.floor(Math.random() * loremipsum.length)] + ".",
                parent: nodeId,
                children: [],
                isNew: true,
                isMaximized: true
            }
            treeDataCopy[nodeId].children.push(newNodeId);
            treeDataCopy.push(newNode);
        }
        setTreeData(treeDataCopy);
    }

    function handleGenerate(nodeId) {
        getTestGenerations(textify(nodeId), nodeId);
        // getTestGenerations(textify(nodeId), nodeId);
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

    function handleMaxMinimize(nodeId) {
        var treeDataCopy = [...treeData];
        treeDataCopy[nodeId].isMaximized = !treeDataCopy[nodeId].isMaximized;
        setTreeData(treeDataCopy);
    }

    function renderTree(currentNode, depth) {
        const tree = [
            <Node nodeId={currentNode.id} depth={depth} text={currentNode.text} isNew={currentNode.isNew}
                isBordered={hoveredPath.includes(currentNode.id)}
                handleGenerate={handleGenerate} onNodeHover={handleNodeHover}
                handleEdit={handleNodeEdit} handleMaxMinimize={handleMaxMinimize}/>
        ];

        if(currentNode.isMaximized) {
            for (let i = 0; i < currentNode.children.length; i++) {
                var child = treeData[currentNode.children[i]];
                tree.push(renderTree(child, depth + 1));
            }
        }else {
            tree[0] = (
                <MaxMinNode nodeId={currentNode.id} depth={depth}
                    handleMaxMinimize={handleMaxMinimize}/>
            );
        }

        return tree;
    }
    
    return (
        <>
            {renderTree(treeData[0], 0)}
            <EdgeBackground treeData={treeData}/>
        </>
    )
}

export default Tree;