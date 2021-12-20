import React, { useState } from 'react';
import axios from "axios";

import Node from './Node';
import MaxMinNode from './MaxMinNode';
import EdgeBackground from './EdgeBackground';
import Elastic from './Elastic';

import { loremipsum } from './LoremIpsum';
import { propTypes } from 'react-bootstrap/esm/Image';

function Tree(props) {
    const storyStarter = "Suddenly, icy fingers grabbed my arm as I inched through the darkness."
    const [treeData, setTreeData] = useState(
        {0: { id: 0, text: storyStarter, parent: -1, children: [], isNew: true, isMaximized: true }}
    );
    const [maxNodeId, setMaxNodeId] = useState(0);
    const [hoveredPath, setHoveredPath] = useState([]);
    const [pinnedPath, setPinnedPath] = useState([[], []]);
    const [dragPoints, setDragPoints] = useState(null);

    function getGenerations(text, nodeId) {
        var data = { text: text }
        axios
        .post(`http://localhost:5000/api/generate`, data)
        .then((response) => {
            console.log(response.data);
            var treeDataCopy = {...treeData};
            Object.keys(treeDataCopy).forEach((idx) => {
                treeDataCopy[idx].isNew = false;
            });
            var maxId = maxNodeId;
            for(var i = 0; i < response.data.length; i++) {
                maxId += 1;
                var newNodeId = maxId;
                var newNode = {
                    id: newNodeId,
                    text: response.data[i].text + ".",
                    parent: nodeId,
                    children: [],
                    isNew: true,
                    isMaximized: true
                }
                treeDataCopy[nodeId].children.push(newNodeId);
                treeDataCopy[newNodeId] = newNode;
            }
            setMaxNodeId(maxId);
            setTreeData(treeDataCopy);

            return response.data;
        });
    }

    function getTestGenerations(text, nodeId) {
        var treeDataCopy = {...treeData};
        Object.keys(treeDataCopy).forEach((idx) => {
            treeDataCopy[idx].isNew = false;
        });
        var maxId = maxNodeId;
        for(var i = 0; i < 3; i++) {
            maxId += 1;
            var newNodeId = maxId;
            var newNode = {
                id: newNodeId,
                text: loremipsum[Math.floor(Math.random() * loremipsum.length)] + ".",
                parent: nodeId,
                children: [],
                isNew: true,
                isMaximized: true
            }
            treeDataCopy[nodeId].children.push(newNodeId);
            treeDataCopy[newNodeId] = newNode;
        }
        setMaxNodeId(maxId);
        setTreeData(treeDataCopy);
    }

    function handleGenerate(nodeId) {
        //getGenerations(textify(nodeId), nodeId);
        getTestGenerations(textify(nodeId), nodeId);
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
        var treeDataCopy = {...treeData};
        treeDataCopy[nodeId].text = text;
        setTreeData(treeDataCopy);
    }

    function handleMaxMinimize(nodeId) {
        var treeDataCopy = {...treeData};
        treeDataCopy[nodeId].isMaximized = !treeDataCopy[nodeId].isMaximized;
        setTreeData(treeDataCopy);
    }

    function handleNodePin(pinIdx, nodeId) {
        props.handlePin(pinIdx, textify(nodeId));
        var pinnedPathCopy = [...pinnedPath];
        pinnedPathCopy[pinIdx] = getPath(nodeId);
        setPinnedPath(pinnedPathCopy);
    }

    function handleMouseDown(e) {
        if(e.target.id.includes("innernode")) {
            var nodeId = parseInt(e.target.id.split("-")[1]);
            var x = e.clientX;
            var y = e.clientY;
            setDragPoints([[x, y, nodeId], [x, y, -1]]);
        }
    }

    function handleMouseMove(e) {
        if(dragPoints) {
            var dragPointsCopy = [...dragPoints];
            var x = e.clientX;
            var y = e.clientY;
            dragPointsCopy[1] = [x, y];
            setDragPoints(dragPointsCopy);
        }
    }

    function handleMouseUp(e) {
        if(e.target.id.includes("innernode")) {
            var nodeId = parseInt(e.target.id.split("-")[1]);
            if(dragPoints[0][2] !== nodeId)
                mergeNodes(dragPoints[0][2], nodeId);
        }
        setDragPoints(null);
    }

    function mergeNodes(startNode, endNode) {
        var treeDataCopy = {...treeData};
        var startNodeCopy = {...treeDataCopy[startNode]};
        var endNodeCopy = {...treeDataCopy[endNode]};
        var startNodeChildren = startNodeCopy.children;
        var endNodeChildren = endNodeCopy.children;
        var startNodeParent = startNodeCopy.parent;

        var startNodeText = startNodeCopy.text;
        var endNodeText = endNodeCopy.text;

        var newChildren = [...startNodeChildren, ...endNodeChildren];

        endNodeCopy.text = endNodeText + " " + startNodeText;
        endNodeCopy.children = newChildren;
        treeDataCopy[endNode] = endNodeCopy;
 
        newChildren.forEach((value, idx) => {
            treeDataCopy[value].parent = endNode;
        });

        delete treeDataCopy[startNode];
        treeDataCopy[startNodeParent].children = treeDataCopy[startNodeParent].children.filter((value) => {
            return value !== startNode;
        });

        setTreeData(treeDataCopy);
    }

    function renderTree(currentNode, depth) {
        const tree = [
            <Node nodeId={currentNode.id} depth={depth} text={currentNode.text} isNew={currentNode.isNew}
                isBordered={hoveredPath.includes(currentNode.id)} 
                pinIdx={pinnedPath[0].includes(currentNode.id) ? 0 : (pinnedPath[1].includes(currentNode.id) ? 1 : -1)}
                handleGenerate={handleGenerate} onNodeHover={handleNodeHover}
                handleEdit={handleNodeEdit} handleMaxMinimize={handleMaxMinimize}
                handleNodePin={handleNodePin}/>
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
        <div onMouseDown={handleMouseDown} onMouseUp={handleMouseUp} onMouseMove={handleMouseMove}>
            {renderTree(treeData[0], 0)}
            {dragPoints ? <Elastic startPoint={dragPoints[0]} endPoint={dragPoints[1]}/> : ""}
            <EdgeBackground treeData={treeData}/>
        </div>
    )
}

export default Tree;