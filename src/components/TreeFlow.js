import React, { useState, useCallback } from 'react';
import ReactFlow, {
    ReactFlowProvider,
    addEdge,
    removeElements,
    isNode,
} from 'react-flow-renderer';
import dagre from 'dagre';
import axios from 'axios';

import { loremipsum } from './LoremIpsum';

const dagreGraph = new dagre.graphlib.Graph();
dagreGraph.setDefaultEdgeLabel(() => ({}));

const position = { x: 0, y: 0 };
const edgeType = 'default';

const initialElements = [
    {
        id: '0',
        type: 'input',
        data: { label: 'Suddenly, icy fingers grabbed my arm as I inched through the darkness.' },
        position,
    }
];
const nodeWidth = 172;
const nodeHeight = 100;
const nodeSpacing = 40;

const getLayoutedElements = (elements, direction = 'TB') => {
    const isHorizontal = direction === 'LR';
    dagreGraph.setGraph({ rankdir: direction });

    elements.forEach((el) => {
        if (isNode(el)) {
            dagreGraph.setNode(el.id, { width: nodeWidth, height: nodeHeight });
        } else {
            dagreGraph.setEdge(el.source, el.target);
        }
    });

    dagre.layout(dagreGraph);

    return elements.map((el) => {
        if (isNode(el)) {
            const nodeWithPosition = dagreGraph.node(el.id);
            el.targetPosition = isHorizontal ? 'left' : 'top';
            el.sourcePosition = isHorizontal ? 'right' : 'bottom';

            // unfortunately we need this little hack to pass a slightly different position
            // to notify react flow about the change. Moreover we are shifting the dagre node position
            // (anchor=center center) to the top left so it matches the react flow node anchor point (top left).
            el.position = {
                x: nodeWithPosition.x - nodeWidth / 2 + Math.random() / 1000,
                y: nodeWithPosition.y - nodeHeight / 2,
            };
        }

        return el;
    });
};

const layoutedElements = getLayoutedElements(initialElements);

const TreeFlow = () => {
    const [elements, setElements] = useState(layoutedElements);
    const [nextEleIdx, setNextEleIdx] = useState(1);

    const onConnect = (params) =>
        setElements((els) =>
            addEdge({ ...params, type: 'smoothstep', animated: true }, els)
        );
    const onElementsRemove = (elementsToRemove) =>
        setElements((els) => removeElements(elementsToRemove, els));

    const getPath = (nodeId) => {
        const path = [nodeId];
        let el = elements.find((tmp) => tmp.target === nodeId);
        while (el) {
            path.unshift(el.source);
            el = elements.find((tmp) => tmp.target === el.source);
        }
        return path;
    }

    const pathToText = (path) => {
        let text = '';
        path.forEach((nodeId) => {
            const node = elements.find((tmp) => tmp.id === nodeId);
            text += node.data.label;
        });
        return text.trim();
    }

    const updateDown = (elements, nodeId, multi) => {
        var node = elements.find((tmp) => tmp.id === nodeId);
        node.position = {
            x: node.position.x + multi * (nodeSpacing + nodeWidth),
            y: node.position.y,
        }

        var children = elements.filter((tmp) => tmp.source === nodeId).map((tmp) => tmp.target);

        children.forEach((child) => updateDown(elements, child, multi));
    }

    const updateLayout = (elements, nodeId) => {
        const copyElements = [... elements];
    
        // find node update its position
        const nodeIdx = copyElements.findIndex((tmp) => tmp.id === nodeId);
        const node = copyElements[nodeIdx];
    
        // find children of nodeid
        const edges = copyElements.filter((el) => el.source === nodeId);
        edges.forEach((edge, idx) => {
            console.log(copyElements);
            console.log(edge);
            const childNode = copyElements.find((el) => el.id === edge.target);
            childNode.position = {
                x: node.position.x + idx * (nodeSpacing + nodeWidth),
                y: node.position.y + nodeHeight + nodeSpacing,
            };
        });
    
        node.position = {
            x: node.position.x + nodeSpacing + nodeWidth,
            y: node.position.y
        }
    
        // update upwards
        var tempId = nodeId;
        var toNodeEdge = copyElements.find((el) => el.target === tempId);
        while(toNodeEdge) {
            var parentId = toNodeEdge.source;
            var parentEdges = copyElements.filter((el) => el.source === parentId);
            var isLMR = parentEdges.findIndex((el) => el.target === tempId);

            var parentNode = copyElements.find((el) => el.id === parentId);
            parentNode.position = {
                x: parentNode.position.x + (isLMR < 2 ? 2 : 0) * (nodeSpacing + nodeWidth),
                y: parentNode.position.y,
            }

            if(isLMR == 0) {
                updateDown(copyElements, parentEdges[1].target, isLMR < 2 ? 2 : 0);
            }
            
            if(isLMR < 2) {
                updateDown(copyElements, parentEdges[2].target, isLMR < 2 ? 2 : 0);
            }

            toNodeEdge = copyElements.find((el) => el.target === parentId);
            tempId = parentId;
        }
    
        return copyElements;
    };

    const addChildren = (nodeId, isGPT) => {
        const copyElements = [];
        elements.forEach((el) => {
            if(el.id[0] === 'e') {
                copyElements.push(el);
            } else {
                el.type = 'default';
                copyElements.push(el);
            };
        });
        if (isGPT) {
            var pathText = pathToText(getPath(nodeId));
            var data = { text: pathText };
            axios
            .post(`http://localhost:5000/api/generate`, data)
            .then((response) => {
                console.log(response.data);

                for(var i = 0; i < response.data.length; i++) {
                    var childId = nextEleIdx + i + '';
                    copyElements.push({
                        id: childId,
                        data: { label: response.data[i].text + "." },
                        position,
                    });
                    copyElements.push({
                        id: nodeId + '-' + childId,
                        source: nodeId,
                        target: childId,
                        type: edgeType,
                        animated: false
                    }); 
                }

                setNextEleIdx(nextEleIdx + 3);
                setElements(getLayoutedElements(copyElements, nodeId));
            });
        } else {
            for(var i = 0; i < 3; i++) {
                var childId = nextEleIdx + i + '';
                copyElements.push({
                    id: childId,
                    data: { label: loremipsum[Math.floor(Math.random() * loremipsum.length)].trim() + "." },
                    position,
                    type: 'output'
                });
                copyElements.push({
                    id: 'e' + nodeId + '-' + childId,
                    source: nodeId,
                    target: childId,
                    type: edgeType,
                    animated: false
                }); 
            }
            setNextEleIdx(nextEleIdx + 3);
            setElements(getLayoutedElements(copyElements, nodeId));
        }
    }

    const onElementClick = (event, element) => {
        console.log('click', event, element)
        // TRUE --> USE GPT, FALSE --> USE LOREM IPSUM
        addChildren(element.id, false);
    };

    return (
        <div className="layoutflow">
            <ReactFlowProvider>
                <ReactFlow
                    elements={elements}
                    onConnect={onConnect}
                    onElementsRemove={onElementsRemove}
                    connectionLineType="smoothstep"
                    nodesConnectable={false}
                    nodesDraggable={false}
                    onElementClick={onElementClick}
                />
            </ReactFlowProvider>
        </div>
    );
};

export default TreeFlow;