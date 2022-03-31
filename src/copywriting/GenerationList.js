import React, { useState, useEffect, useRef } from 'react';
import styled from "styled-components";

import GenerationTextContainer from "./GenerationTextContainer";

import { PinButton } from './SVG'

function GenerationList(props) {
    const generations = [];

    function handlePin(e) {
        var curr = e.target;
        while(curr.tagName !== "svg") {
            curr = curr.parentNode;
        }
        var idx = curr.getAttribute("data-idx");
        props.pinGeneration(idx);
    }

    for(let i = 0; i < props.lens.generations.length; i++) {
        var entry = props.lens.generations[i];
        var color = props.switches[entry.switchId] ? props.switches[entry.switchId].color : "#ccc";
        generations.push(
            <div key={i} style={{display: "flex", flexDirection: "row", gap: "8px", alignItems: "center"}}>
                <Bar barColor={color}></Bar>
                <GenerationTextContainer 
                    key={i} idx={i} text={entry.text}
                    hoverGen={props.hoverGen} setHoverGen={props.setHoverGen}
                    copyGeneration={props.copyGeneration} lens={props.lens}
                />
                <div>
                    <svg width="24" height="24" data-idx={i} onClick={handlePin}>
                        <PinBtn transform="scale(1.5)" isPinned={entry.isPinned}>
                            {PinButton}
                        </PinBtn>
                    </svg>
                </div>
            </div>
        )
    }
    return (
        <Container>
            {generations}
        </Container>
    );
}

const Container = styled.div`
    display: flex;
    flex-direction: column;
    gap: 12px;
`;

const Bar = styled.div`
    align-self: stretch;
    width: 6px;
    background-color: ${props => props.barColor};
    border-radius: 3px;
`;

const PinBtn = styled.g`
    cursor: pointer;
    stroke: ${props => props.isPinned ? "#0066FF" : "#ccc"};
    fill: ${props => props.isPinned ? "#0066FF" : "#ccc"};
    &:hover {
        stroke: ${props => props.isPinned ? "#0066FF" : "#0066FF66"};
        fill: ${props => props.isPinned ? "#0066FF" : "#0066FF66"};
    }
`;

export default GenerationList;