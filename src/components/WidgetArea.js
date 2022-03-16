import React, { useState, useRef } from 'react';
import styled from "styled-components";

import Slots from './Slots'

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
        var draggingObj = {type: e.target.getAttribute("data-type")};
        if([null, "slot-edge"].includes(draggingObj.type)) {
            return;
        } else if(draggingObj.type === "slot") {
            draggingObj.data = e.target.getAttribute("data-id");
        }
        setDragging(draggingObj);
    }

    function handleMouseUp(e) {
        var dropObj = {type: e.target.getAttribute("data-type")};
        if([null, "slot-edge"].includes(dropObj.type)) {
            return;
        } else if(dragging.type === "slot" && dropObj.type === "slot") {
            if(dragging.data === e.target.getAttribute("data-id")) return;
            dragging.data = parseInt(dragging.data);
            dropObj.data = parseInt(e.target.getAttribute("data-id"));
            if(dropObj.data.length <= dragging.data.length) {
                props.reattachSlot(dropObj.data, dragging.data);
            }
        }
        setDragging(null);
    }

    return (
        <Container 
            onClick={handleCanvasClick} onMouseDown={handleMouseDown} onMouseUp={handleMouseUp}
            tabIndex="0" onKeyDown={handleKeyDown}
        >
            <filter id="shadow">
                <feGaussianBlur stdDeviation="2.5" result="coloredBlur"/>
                <feMerge>
                    <feMergeNode in="coloredBlur"/>
                    <feMergeNode in="SourceGraphic"/>
                </feMerge>
            </filter>
            <Slots 
                slots={props.slots} lastSlot={props.lastSlot} currentDepth={props.currentDepth} isInsert={props.isInsert} 
                changeLastSlot={props.changeLastSlot} changeDepth={props.changeDepth} 
                hoverSlot={props.hoverSlot} setHoverSlot={props.setHoverSlot}
                selected={selected} setSelected={setSelected} getSlotPath={props.getSlotPath}
            />
        </Container>
    )
}

const Container = styled.svg`
    height: 100%;
    flex-grow: 1;
    outline: none;
`;

export default WidgetArea;