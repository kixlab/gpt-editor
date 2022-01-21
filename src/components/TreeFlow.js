import React, { useState, useCallback, useEffect, useRef } from 'react';
import ReactFlow, {
    ReactFlowProvider,
    addEdge,
    removeElements,
    isNode,
} from 'react-flow-renderer';
import dagre from 'dagre';
import axios from 'axios';
import { animate } from 'popmotion';

import { loremipsum } from './LoremIpsum';

import LayoutHandler from './LayoutHandler';

const dagreGraph = new dagre.graphlib.Graph();
dagreGraph.setDefaultEdgeLabel(() => ({}));

const position = { x: 0, y: 0 };
const edgeType = 'default';

const cursorStyle = { border: "2px solid #4286f4" };

const initialElements = [
    {
        id: '0',
        type: 'input',
        data: { label: 'Suddenly, icy fingers grabbed my arm as I inched through the darkness.' },
        position,
        children: [],
        style: cursorStyle
    }
];

const ISGPT = false;
const NODE_WIDTH = 172;
const NODE_HEIGHT = 100;
const H_SPACING = 40;
const V_SPACING = 80;

const getLayoutedElements = (elements, direction = 'TB') => {
    const isHorizontal = direction === 'LR';
    dagreGraph.setGraph({
        rankdir: direction,
        nodesep: H_SPACING,
        ranksep: V_SPACING
    });

    elements.forEach((el) => {
        if (isNode(el)) {
            dagreGraph.setNode(el.id, { width: NODE_WIDTH, height: NODE_HEIGHT });
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
                x: nodeWithPosition.x - NODE_WIDTH / 2 + Math.random() / 1000,
                y: nodeWithPosition.y - NODE_HEIGHT / 2,
            };
        }

        return el;
    });
};

const layoutedElements = getLayoutedElements(initialElements);

const TreeFlow = () => {
    const [rfInstance, setRfInstance] = useState(null);
    const [elements, setElements] = useState(layoutedElements);
    const [nextEleIdx, setNextEleIdx] = useState(1);
    const [cursor, setCursor] = useState('0');
    const [keyPressed, setKeyPressed] = useState(null);

    const onLoad = useCallback((instance) => {
        instance.fitView();
        setRfInstance(instance);
    }, []);

    const onConnect = (params) => {
        setElements((els) =>
            addEdge({ ...params, type: 'smoothstep', animated: true }, els)
        );
    }

    const onElementsRemove = (elementsToRemove) => {
        setElements((els) => removeElements(elementsToRemove, els));
    }

    //TODO: FIX SMOOTHING
    const handleTransform = useCallback((transform) => {
        if(!rfInstance) return;

        const {
            position: [x, y],
            zoom,
        } = rfInstance.toObject();

        animate({
            from: { x: x, y: y, zoom },
            to: { x: transform.x, y: transform.y, zoom},
            onUpdate: ({ x, y, zoom }) => { 
                return rfInstance.setTransform({ x, y, zoom })
            },
        });
    }, [rfInstance]);

    const getPath = (nodeId) => {
        const path = [nodeId];
        let parentId = elements[parseInt(nodeId)].parentId;
        while (parentId) {
            path.unshift(parentId);
            parentId = elements[parseInt(parentId)].parentId;
        }
        return path;
    }

    const pathToText = (path) => {
        let text = '';
        path.forEach((nodeId) => {
            const node = elements[parseInt(nodeId)];
            text += node.data.label;
        });
        return text.trim();
    }

    const addChildren = (nodeId) => {
        const copyElements = [];
        elements.forEach((el) => {
            if (el.id[0] === 'e') {
                copyElements.push(el);
            } else {
                el.type = 'default';
                copyElements.push(el);
            };
        });
        if (ISGPT) {
            var pathText = pathToText(getPath(nodeId));
            var data = { text: pathText };
            axios
                .post(`http://localhost:5000/api/generate`, data)
                .then((response) => {
                    console.log(response.data);

                    for (var i = 0; i < response.data.length; i++) {
                        var childId = nextEleIdx + i + '';

                        copyElements.splice(parseInt(childId), 0, {
                            id: childId,
                            data: { label: response.data[i].text + "." },
                            position,
                            parentId: nodeId,
                            children: []
                        });
                        copyElements.push({
                            id: nodeId + '-' + childId,
                            source: nodeId,
                            target: childId,
                            type: edgeType,
                            animated: false
                        });

                        copyElements[nodeId].children.push(childId);
                    }

                    setNextEleIdx(nextEleIdx + 3);
                    setElements(getLayoutedElements(copyElements, nodeId));
                });
        } else {
            for (var i = 0; i < 3; i++) {
                var childId = nextEleIdx + i + '';

                copyElements.splice(parseInt(childId), 0, {
                    id: childId,
                    data: { label: loremipsum[Math.floor(Math.random() * loremipsum.length)].trim() + "." },
                    position,
                    type: 'output',
                    parentId: nodeId,
                    children: []
                });
                copyElements.push({
                    id: 'e' + nodeId + '-' + childId,
                    source: nodeId,
                    target: childId,
                    type: edgeType,
                    animated: false
                });

                copyElements[nodeId].children.push(childId);
            }

            setNextEleIdx(nextEleIdx + 3);
            setElements(getLayoutedElements(copyElements, nodeId));
        }
    }

    const onElementClick = (event, element) => {
        setCursor(element.id);
    };

    const handleCursorMove = (type) => {
        const cursorNode = elements[cursor];

        if(!cursorNode.parentId && type !== "DOWN") {
            return;
        }

        var cursorParent, cursorChildren, cursorIndex;
        if(cursorNode.parentId) {
            cursorParent = elements[cursorNode.parentId];
            cursorChildren = cursorParent.children;
            cursorIndex = cursorChildren.indexOf(cursor);
        }
        var newCursor = cursor;

        switch(type) {
            case "LEFT":
                if (cursorIndex > 0) {
                    newCursor = cursorChildren[cursorIndex - 1];
                }
                break;
            case "RIGHT":
                if (cursorIndex < cursorChildren.length - 1) {
                    newCursor = cursorChildren[cursorIndex + 1];
                }
                break;
            case "UP":
                if (cursorNode.parentId) {
                    newCursor = cursorNode.parentId;
                }
                break;
            case "DOWN":
                console.log(cursorNode);
                if (cursorNode.children.length > 0) {
                    if(cursorNode.children.length < 3) {
                        newCursor = cursorNode.children[0];
                    } else {
                        newCursor = cursorNode.children[1];
                    }
                }
                break;
        }

        const copyElements = [... elements];
        copyElements[cursor].style = null;
        copyElements[newCursor].style = cursorStyle

        setCursor(newCursor);
        setElements(copyElements);
    }

    const lengthenBranch = () => {
        const copyElements = [];
        elements.forEach((el) => {
            if (el.id[0] === 'e') {
                copyElements.push(el);
            } else {
                el.type = 'default';
                copyElements.push(el);
            };
        });
        var currId = cursor;
        var currNode = copyElements[parseInt(currId)];
        
        console.log(elements);

        // TODO: fix this shit
        while(currNode.children.length > 0) {
            currId = currNode.children[0];
            currNode = copyElements[parseInt(currId)];
        }
        var childId = '' + nextEleIdx;
        currId = '' + currNode.id;
        copyElements[parseInt(currId)].children.push(childId);

        copyElements.splice(parseInt(childId), 0, {
            id: childId,
            data: { label: loremipsum[Math.floor(Math.random() * loremipsum.length)].trim() + "." },
            position,
            type: 'output',
            parentId: currId,
            children: []
        });
        copyElements.push({
            id: 'e' + currId + '-' + childId,
            source: currId,
            target: childId,
            type: edgeType,
            animated: false
        });

        console.log(copyElements);

        setElements(getLayoutedElements(copyElements));
        setNextEleIdx(nextEleIdx + 1);
    };

    const keyTimer = useRef(null);

    const handleKeyDown = (event) => {
        console.log(event.key);
        if(["ArrowDown", "ArrowRight", "ArrowLeft", "ArrowUp"].includes(event.key)) {
            handleCursorMove(event.key.replace("Arrow", "").toUpperCase());
        } else if(event.key === "Enter") {
            addChildren(cursor);
        } else if(keyPressed == null) {
            setKeyPressed({key: event.key, count: 0});
        }
    }

    const handleKeyUp = (event) => {
        if(["ArrowDown", "ArrowRight", "ArrowLeft", "ArrowUp", "Enter"].includes(event.key)) {
            return;
        } else if(keyPressed != null) {
            setKeyPressed(null);
            //clearInterval(keyPressed.timer);
           //setKeyPressed(null);
        }
    }

    useEffect(() => {
        if(keyPressed != null) {
            keyTimer.current = setTimeout(() => {
                lengthenBranch();
                setKeyPressed({
                    key: keyPressed.key,
                    count: keyPressed.count + 1
                });
            }, 1000);
        } else {
            clearTimeout(keyTimer.current);
        }
    }, [keyPressed]);

    return (
        <div className="layoutflow" tabIndex="0" onKeyDown={handleKeyDown} onKeyUp={handleKeyUp}>
            <ReactFlowProvider>
                <ReactFlow
                    elements={elements}
                    onLoad={onLoad}
                    onConnect={onConnect}
                    onElementsRemove={onElementsRemove}
                    connectionLineType="smoothstep"
                    nodesConnectable={false}
                    nodesDraggable={false}
                    onElementClick={onElementClick}
                />
                <LayoutHandler elements={elements} cursor={cursor} handleTransform={handleTransform} nodeHeight={NODE_HEIGHT}/>
            </ReactFlowProvider>
        </div>
    );
};

export default TreeFlow;