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

    function propertiesToStr(properties) {
        var defProperties = ["engine", "temperature", "presencePen", "bestOf"];
        var str = "";
        for(var key in properties) {
            if(defProperties.includes(key)) {
                str += key + ": " + properties[key] + "\n";
            }
        }
        return str;
    }

    function groupGenerations(generations) {
        var groups = {};
        var inputGroups = {};
        for(var i = 0; i < generations.length; i++) {
            var gen = generations[i];
            if(gen.inputText in inputGroups) {
                inputGroups[gen.inputText].push(i);
            } else {
                inputGroups[gen.inputText] = [i];
                groups[gen.inputText] = {};
            }
        }
        for(var inputText in inputGroups) {
            var indices = inputGroups[inputText];
            var prevProperties = "";
            for(var i = 0; i < indices.length; i++) {
                var idx = indices[i];
                var gen = generations[idx];
                var propertiesStr = propertiesToStr(gen.properties);
                if(prevProperties == propertiesStr) {
                    groups[inputText][propertiesStr].push(idx);
                } else {
                    groups[inputText][propertiesStr] = [idx];
                }
                prevProperties = propertiesStr;
            }
        }
        return groups;
    }

    var groupedGenerations = groupGenerations(props.lens.generations);

    for(var inputText in groupedGenerations) {
        var group = groupedGenerations[inputText];
        for(var propertiesStr in group) {
            var indices = group[propertiesStr];
            var properties = {};
            for(let i = 0; i < indices.length; i++) {
                var idx = indices[i];
                var entry = props.lens.generations[idx];
                var color = props.switches[entry.switchId] ? props.switches[entry.switchId].color : "#ccc";
                generations.push(
                    <div key={idx} style={{display: "flex", flexDirection: "row", gap: "8px", alignItems: "center"}}>
                        <Bar barColor={color}></Bar>
                        <GenerationTextContainer 
                            key={idx} idx={idx} text={entry.text}
                            hoverGen={props.hoverGen} setHoverGen={props.setHoverGen}
                            copyGeneration={props.copyGeneration} lens={props.lens}
                        />
                        <div>
                            <svg width="24" height="24" data-idx={idx} onClick={handlePin}>
                                <PinBtn transform="scale(1.5)" isPinned={entry.isPinned}>
                                    {PinButton}
                                </PinBtn>
                            </svg>
                        </div>
                    </div>
                )
            }
        }
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