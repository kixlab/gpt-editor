import React, { useState, useRef } from 'react';
import styled from "styled-components";

import Slots from './Slots';

function WidgetArea(props) {
    const [selected, setSelected] = useState(null);
    const [dragging, setDragging] = useState(null);

    function handleCanvasClick(e) {
        if(e.target.tagName !== "svg") return;
        setSelected(null);
    }

    function handleKeyDown(e) {
        if(selected === null) return;
        switch(e.key) {
            case "Backspace":
                if(selected.type === "slot") {
                    props.removeSlot(parseInt(selected.data));
                    setSelected(null);
                } else if(selected.type === "slot-edge") {
                    props.detatchSlot(parseInt(selected.data.split("-")[1]));
                    setSelected(null);
                } else if(selected.type === "switch") {
                    props.removeSwitch(parseInt(selected.data));
                    setSelected(null);
                }
                break;
            case "c":
                if(!props.isMeta) break;
                if(selected.type === "slot") {
                    props.copySlot(parseInt(selected.data));
                }
                break;
            default:
                return;
        }
    }

    function handleMouseDown(e) {
        const x = e.pageX;
        const y = e.pageY;
        const offsetX = document.getElementById('editor-container').offsetWidth + 60*2;
        var draggingObj = {type: e.target.getAttribute("data-type"), startX: x-offsetX, startY: y};
        if([null, "slot-edge"].includes(draggingObj.type)) {
            return;
        } 
        draggingObj.data = e.target.getAttribute("data-id");
        setDragging(draggingObj);
    }

    function handleMouseUp(e) {
        if(dragging == null) return;
        
        var dropObj = {type: e.target.getAttribute("data-type"), data: e.target.getAttribute("data-id")};
        if([null, "slot-edge"].includes(dropObj.type)) {
            setDragging(null);
            return;
        } else if(dragging.type === "slot" && dropObj.type === "slot" && dragging.data !== dropObj.data) {
            dragging.data = parseInt(dragging.data);
            dropObj.data = parseInt(e.target.getAttribute("data-id"));
            props.reattachSlot(dropObj.data, dragging.data);
        } else if(dragging.type === 'switch' && dropObj.type === 'slot') {
            props.attachSwitch(parseInt(dropObj.data), parseInt(dragging.data));
        } else if(dragging.type === 'slot' && dropObj.type === 'switch') {
            props.attachSwitch(parseInt(dragging.data), parseInt(dropObj.data));
        }
        setDragging(null);
    }

    function handleMouseMove(e) {
        if(dragging === null) return;
        var newDragging = {...dragging};
        const x = e.pageX;
        const y = e.pageY;
        const offsetX = document.getElementById('editor-container').offsetWidth + 60*2;
        newDragging.endX = x-offsetX;
        newDragging.endY = y;

        var distance = Math.sqrt(Math.pow(newDragging.endX - newDragging.startX, 2) + Math.pow(newDragging.endY - newDragging.startY, 2));
        if(distance > 10)
            setDragging(newDragging);
    }

    var connectionSvg = [];
    if(dragging && dragging.endX) {
        connectionSvg.push(
            <line 
                key="connection-line"
                x1={dragging.startX} y1={dragging.startY} stroke="#0066FF"
                x2={dragging.endX} y2={dragging.endY} strokeWidth="2" 
            />
        )
    }

    return (
        <Container 
            onClick={handleCanvasClick} 
            onMouseDown={handleMouseDown} onMouseUp={handleMouseUp} onMouseMove={handleMouseMove}
            tabIndex="0" onKeyDown={handleKeyDown}
        >
            <filter id="shadow">
                <feGaussianBlur stdDeviation="2.5" result="coloredBlur"/>
                <feMerge>
                    <feMergeNode in="coloredBlur"/>
                    <feMergeNode in="SourceGraphic"/>
                </feMerge>
            </filter>
            <filter id="switch-shadow">
                <feDropShadow dx="0" dy="2" stdDeviation="1" floodColor="#000000" floodOpacity="0.3"/>
            </filter>
            {connectionSvg}
            <Slots 
                slots={props.slots} lastSlot={props.lastSlot} currentDepth={props.currentDepth} isInsert={props.isInsert} 
                changeLastSlot={props.changeLastSlot} changeDepth={props.changeDepth} 
                hoverSlot={props.hoverSlot} setHoverSlot={props.setHoverSlot}
                selected={selected} setSelected={setSelected} getSlotPath={props.getSlotPath}
                switches={props.switches}
            />
        </Container>
    )
}

const Container = styled.svg`
    min-height: inherit !important;
    height: auto;
    flex-grow: 1;
    outline: none;
    flex-basis: 55%;
`;

export default WidgetArea;