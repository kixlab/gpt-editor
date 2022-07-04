import React, { useState, useEffect, useRef } from 'react';
import styled from "styled-components";

import GenerationTextContainer from "./GenerationTextContainer";

import { PinButton } from './SVG'

function GenerationList(props) {
    const [hovered, setHovered] = useState(null);
    const [inputCollapsed, setInputCollapsed] = useState([]);
    const [propertyCollapsed, setPropertyCollapsed] = useState([]);

    const generations = [];

    function handlePin(e) {
        var curr = e.target;
        while(curr.tagName !== "svg") {
            curr = curr.parentNode;
        }
        var idx = curr.getAttribute("data-idx");
        props.pinGeneration(idx);
    }

    function handleBarMouseEnter(e) {
        var curr = e.target;
        setHovered({
            type: curr.getAttribute("data-type"),
            id: curr.getAttribute("data-id"),
        })
    }

    function handleBarClick(e) {
        var curr = e.target;
        var type = curr.getAttribute("data-type");
        var id = curr.getAttribute("data-id");
        if(type === "input") {
            id = parseInt(id);
            if(inputCollapsed.includes(id)) {
                setInputCollapsed(inputCollapsed.filter(ele => ele !== id));
            } else {
                setInputCollapsed(inputCollapsed.concat(id));
            }
        } else {
            if(propertyCollapsed.includes(id)) {
                setPropertyCollapsed(propertyCollapsed.filter(ele => ele !== id));
            } else {
                setPropertyCollapsed(propertyCollapsed.concat(id));
            }
        }
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

    var groups = Object.keys(groupedGenerations);
    for(var i = 0; i < groups.length; i++) {
        var inputText = groups[i];
        var group = groupedGenerations[inputText];
        var subGroups = Object.keys(group);

        // show button here
        generations.push(
            <div key={"input-button-" + i}>
                <HistoryButton></HistoryButton>
            </div>
        )

        console.log(inputCollapsed)
        if(inputCollapsed.includes(i)) {
            generations.push(
                <div key={"collapsed-" + i}>
                    <CollapsedBar 
                        data-type="input" data-id={i}
                        isHovered={hovered !== null && hovered.type === "input" && hovered.id == i}
                        onMouseEnter={handleBarMouseEnter} onMouseLeave={() => setHovered(null)}
                        onClick={handleBarClick}
                    ></CollapsedBar>
                </div>
            )
            continue;
        }

        for(var j = 0; j < subGroups.length; j++) {
            var propertiesStr = subGroups[j];
            var indices = group[propertiesStr];

            var propId = i + "-" + j;

            var inputIsTop = j == 0;
            var inputIsBot = false;
            generations.push(
                <div key={"property-button-" + propId} style={{display: "flex", flexDirection: "row", gap: "8px", alignItems: "center"}}>
                    <Bar 
                        isTop={inputIsTop} isBot={inputIsBot} 
                        data-type="input" data-id={i}
                        isHovered={hovered !== null && hovered.type === "input" && hovered.id == i}
                        onMouseEnter={handleBarMouseEnter} onMouseLeave={() => setHovered(null)}
                        onClick={handleBarClick}
                    ></Bar>
                    <HistoryButton></HistoryButton>
                </div>
            )

            if(propertyCollapsed.includes(propId)) {
                var inputIsTop = false;
                var inputIsBot = j == subGroups.length - 1;
                generations.push(
                    <div key={"collapsed-" + propId} style={{display: "flex", flexDirection: "row", gap: "8px", alignItems: "center"}}>
                        <Bar 
                            isTop={inputIsTop} isBot={inputIsBot} 
                            data-type="input" data-id={i}
                            isHovered={hovered !== null && hovered.type === "input" && hovered.id == i}
                            onMouseEnter={handleBarMouseEnter} onMouseLeave={() => setHovered(null)}
                            onClick={handleBarClick}
                        ></Bar>
                        <CollapsedBar 
                            data-type="property" data-id={propId}
                            isHovered={hovered !== null && hovered.type === "property" && hovered.id == propId}
                            onMouseEnter={handleBarMouseEnter} onMouseLeave={() => setHovered(null)}
                            onClick={handleBarClick}
                        ></CollapsedBar>
                    </div>
                )
                continue;
            }

            for(let k = 0; k < indices.length; k++) {
                var idx = indices[k];
                var entry = props.lens.generations[idx];

                var propsIsTop = k == 0;
                var propsIsBot = k == indices.length - 1;
                var inputIsTop = false;
                var inputIsBot = propsIsBot && j == subGroups.length - 1;

                generations.push(
                    <div key={idx} style={{display: "flex", flexDirection: "row", gap: "8px", alignItems: "center"}}>
                        <Bar 
                            isTop={inputIsTop} isBot={inputIsBot} 
                            data-type="input" data-id={i}
                            isHovered={hovered !== null && hovered.type === "input" && hovered.id == i}
                            onMouseEnter={handleBarMouseEnter} onMouseLeave={() => setHovered(null)}
                            onClick={handleBarClick}
                        ></Bar>
                        <Bar 
                            isTop={propsIsTop} isBot={propsIsBot} 
                            data-type="property" data-id={propId}
                            isHovered={hovered !== null && hovered.type === "property" && hovered.id == propId}
                            onMouseEnter={handleBarMouseEnter} onMouseLeave={() => setHovered(null)}
                            onClick={handleBarClick}
                        ></Bar>
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
`;

const Bar = styled.div`
    width: 8px;
    align-self: stretch;
    background-color: ${props => props.isHovered ? "#99C2FF" : "#DDD"};
    border-radius: ${props => props.isTop ? "3px 3px": "0px 0px"} ${props => props.isBot ? "3px 3px" : "0px 0px"};
    margin-top: ${props => props.isTop ? "8px" : "0px"};
    margin-bottom: ${props => props.isBot ? "8px": "0px"};
    cursor: pointer;
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

const CollapsedBar = styled.div`
    height: 8px;
    width: 32px;
    background-color: ${props => props.isHovered ? "#99C2FF" : "#DDD"};
    border-radius: 3px;
    cursor: pointer;
    margin: 8px 0px;
`;

const HistoryButton = styled.div`
    width: 24px;
    height: 24px; 
    border-radius: 4px;
    border: solid 2px #ccc; 
    margin: 8px 0;
`;

export default GenerationList;