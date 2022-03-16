import React, { useState, useRef } from 'react';
import styled from "styled-components";

import Slots from './Slots'

function WidgetArea(props) {
    const [selected, setSelected] = useState(null);

    function handleCanvasClick(e) {
        if(e.target.tagName !== "svg") return;
        setSelected(null);
    }

    function handleKeyDown(e) {
        if(selected === null) return;
        switch(e.key) {
            case "Backspace":
                if(selected.type === "slot") {
                    props.removeSlot(selected.data.split(",").map(x => parseInt(x)));
                    setSelected(null);
                } else if(selected.type === "slot-edge") {
                    props.detatchSlot(selected.data.split("-")[1].split(",").map(x => parseInt(x)));
                    setSelected(null);
                }
                break;
            case "c":
                if(!props.isMeta) break;
                if(selected.type === "slot") {
                    props.copySlot(selected.data.split(",").map(x => parseInt(x)));
                }
                break;
            default:
                console.log(e.key);
        }
    }

    return (
        <Container onClick={handleCanvasClick} tabIndex="0" onKeyDown={handleKeyDown}>
            <filter id="shadow">
                <feGaussianBlur stdDeviation="2.5" result="coloredBlur"/>
                <feMerge>
                    <feMergeNode in="coloredBlur"/>
                    <feMergeNode in="SourceGraphic"/>
                </feMerge>
            </filter>
            <Slots 
                slots={props.slots} path={props.path} currentDepth={props.currentDepth} isInsert={props.isInsert} 
                changePath={props.changePath} changeDepth={props.changeDepth} 
                hoverPath={props.hoverPath} setHoverPath={props.setHoverPath}
                selected={selected} setSelected={setSelected} 
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