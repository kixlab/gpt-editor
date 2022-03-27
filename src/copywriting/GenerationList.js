import React, { useState, useEffect, useRef } from 'react';
import styled from "styled-components";

import GenerationTextContainer from "./GenerationTextContainer";

function GenerationList(props) {
    const generations = [];

    for(let i = 0; i < props.lens.generations.length; i++) {
        var entry = props.lens.generations[i];
        var color = props.switches[entry.switchId] ? props.switches[entry.switchId].color : "#ccc";
        generations.push(
            <div key={i} style={{display: "flex", flexDirection: "row", gap: "8px"}}>
                <Bar barColor={color}></Bar>
                <GenerationTextContainer 
                    key={i} idx={i} text={entry.text}
                    hoverGen={props.hoverGen} setHoverGen={props.setHoverGen}
                    copyGenerations={props.copyGenerations} lens={props.lens}
                />
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
    height: inherit;
    width: 6px;
    background-color: ${props => props.barColor};
    border-radius: 3px;
`;

export default GenerationList;