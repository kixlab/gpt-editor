import React, { useEffect, useState } from 'react';
import styled from "styled-components";

import Slots from './Slots';
import SwitchProperties from './SwitchProperties';

function WidgetArea(props) {
    const [selected, setSelected] = useState(null);
    const [dragging, setDragging] = useState(null);

    function handleCanvasClick(e) {
        if (e.target.tagName !== "svg") return;
        setSelected(null);
    }

    function handleKeyDown(e) {
        if (selected === null) return;
        switch (e.key) {
            case "Backspace":
                if (selected.type === "slot") {
                    props.removeSlot(selected.data);
                    setSelected(null);
                } else if (selected.type === "slot-edge") {
                    props.detatchSlot(selected.data.split("-")[1]);
                    setSelected(null);
                } else if (selected.type === "switch") {
                    props.removeSwitch(selected.data);
                    setSelected(null);
                } else if (selected.type === 'switch-lens-edge') {
                    var parsedData = selected.data.split("-");
                    props.detatchLens(parsedData[0], parsedData[1]);
                    setSelected(null);
                }
                break;
            case "c":
                if (!props.isMeta) break;
                if (selected.type === "slot") {
                    props.copySlot(selected.data);
                } else if (selected.type === 'switch') {
                    props.copySwitch(selected.data);
                }
                break;
            case "g":
                if (!props.isMeta) break;
                e.preventDefault();
                if (selected.type === "slot") {
                    props.createSwitch(selected.data);
                }
            default:
                return;
        }
    }

    function handleMouseDown(e) {
        const x = e.pageX;
        const y = e.pageY;
        const offsetX = document.getElementById('editor-container').offsetWidth + 60 * 2;
        var draggingObj = { type: e.target.getAttribute("data-type"), startX: x - offsetX, startY: y };
        if ([null, "slot-edge"].includes(draggingObj.type)) {
            return;
        } else if(draggingObj.type === 'lens') {
            var parent = e.target.parentElement;
            while(!parent.getAttribute('data-id') && parent.getAttribute('data-type') === 'lens') 
                parent = parent.parentElement;
            if(parent.getAttribute('data-type') !== 'lens') return;
            draggingObj.data = parent.getAttribute('data-id');
        } else {
            draggingObj.data = e.target.getAttribute("data-id");
        }
        setDragging(draggingObj);
    }

    function handleMouseUp(e) {
        if (dragging == null) return;

        var dropObj = { type: e.target.getAttribute("data-type"), data: e.target.getAttribute("data-id") };
        if(dropObj.type === 'lens') {
            var parent = e.target.parentElement;
            while(!parent.getAttribute('data-id') && parent.getAttribute('data-type') === 'lens') 
                parent = parent.parentElement;
            if(parent.getAttribute('data-type') !== 'lens') {
                setDragging(null);
                return;
            }
            dropObj.data = parent.getAttribute('data-id');
        }

        if ([null, "slot-edge"].includes(dropObj.type)) {
            setDragging(null);
            return;
        } else if (dragging.type === "slot" && dropObj.type === "slot" && dragging.data !== dropObj.data) {
            dragging.data = dragging.data;
            dropObj.data = e.target.getAttribute("data-id");
            props.reattachSlot(dropObj.data, dragging.data);
        } else if (dragging.type === 'switch' && dropObj.type === 'slot') {
            props.attachSwitch(dropObj.data, dragging.data);
        } else if (dragging.type === 'slot' && dropObj.type === 'switch') {
            props.attachSwitch(dragging.data, dropObj.data);
        } else if (dragging.type === 'lens' && dropObj.type === 'switch') {
            props.attachLens(dropObj.data, dragging.data);
        } else if (dragging.type === 'switch' && dropObj.type === 'lens') {
            props.attachLens(dragging.data, dropObj.data);
        }
        setDragging(null);
    }

    function handleMouseMove(e) {
        if (dragging === null) return;
        var newDragging = { ...dragging };
        const x = e.pageX;
        const y = e.pageY;
        const offsetX = document.getElementById('editor-container').offsetWidth + 60 * 2;
        newDragging.endX = x - offsetX;
        newDragging.endY = y;

        var distance = Math.sqrt(Math.pow(newDragging.endX - newDragging.startX, 2) + Math.pow(newDragging.endY - newDragging.startY, 2));
        if (distance > 10)
            setDragging(newDragging);
    }

    var connectionSvg = [];
    if (dragging && dragging.endX) {
        connectionSvg.push(
            <line
                key="connection-line"
                x1={dragging.startX} y1={dragging.startY} stroke="#0066FF"
                x2={dragging.endX} y2={dragging.endY} strokeWidth="2"
            />
        )
    }

    function showSwitchProperties() {
        var copy = { ...selected };
        copy.isProperties = true;
        setSelected(copy);
    }

    return (
        <Container>
            <SvgContainer
                onClick={handleCanvasClick}
                onMouseDown={handleMouseDown} onMouseUp={handleMouseUp} onMouseMove={handleMouseMove}
                tabIndex="0" onKeyDown={handleKeyDown}
            >
                {filters}
                {connectionSvg}
                <Slots
                    slots={props.slots} lastSlot={props.lastSlot} currentDepth={props.currentDepth} isInsert={props.isInsert}
                    changeLastSlot={props.changeLastSlot} changeDepth={props.changeDepth}
                    hoverSlot={props.hoverSlot} setHoverSlot={props.setHoverSlot}
                    selected={selected} setSelected={setSelected} getSlotPath={props.getSlotPath}
                    switches={props.switches} showSwitchProperties={showSwitchProperties}
                    createSwitch={props.createSwitch} handleGenerate={props.handleGenerate}
                    lenses={props.lenses} chooseLens={props.chooseLens}
                    slotifyGenerations={props.slotifyGenerations} changeLensProperty={props.changeLensProperty}
                />
            </SvgContainer>
            {selected && selected.isProperties ?
                <SwitchProperties
                    switches={props.switches} switchId={selected.data}
                    onPropertyChange={props.onPropertyChange}
                />
                : ""
            }
        </Container>
    )
}

const filters = (<>
    <filter id="shadow">
        <feGaussianBlur stdDeviation="2.5" result="coloredBlur" />
        <feMerge>
            <feMergeNode in="coloredBlur" />
            <feMergeNode in="SourceGraphic" />
        </feMerge>
    </filter>
    <filter id="switch-shadow">
        <feDropShadow dx="0" dy="2" stdDeviation="1" floodColor="#000000" floodOpacity="0.3" />
    </filter>
    <filter id="svg-shadow" filterUnits="userSpaceOnUse" colorInterpolationFilters="sRGB">
        <feFlood floodOpacity="0" result="BackgroundImageFix" />
        <feColorMatrix in="SourceAlpha" type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0" result="hardAlpha" />
        <feOffset dy="4" />
        <feGaussianBlur stdDeviation="2" />
        <feComposite in2="hardAlpha" operator="out" />
        <feColorMatrix type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0.25 0" />
        <feBlend mode="normal" in2="BackgroundImageFix" result="effect1_dropShadow_145_66" />
        <feBlend mode="normal" in="SourceGraphic" in2="effect1_dropShadow_145_66" result="shape" />
    </filter>
</>);

const Container = styled.div`
    min-height: inherit !important;
    height: auto;
    flex-grow: 1;
    outline: none;
    flex-basis: 55%;
`;

const SvgContainer = styled.svg`
    min-height: inherit !important;
    height: auto;
    outline: none;
    width: 100%;
`;

export default WidgetArea;