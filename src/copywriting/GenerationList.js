import React, { useState, useEffect, useRef } from 'react';
import styled from "styled-components";

import GenerationTextContainer from "./GenerationTextContainer";

import { PinButton } from './SVG'

import { ReactComponent as InputIcon } from '../img/InputIcon.svg';
import { ReactComponent as PropertyIcon } from '../img/PropertyIcon.svg';
import { ReactComponent as EditIcon } from '../img/EditIcon.svg';

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

    function handleTooltip(e) {
        var curr = e.target;
        while(curr.tagName !== "DIV") {
            curr = curr.parentNode;
        }
        var type = curr.getAttribute("data-type");
        var id = curr.getAttribute("data-id");
        var groups = Object.keys(props.groupedGenerations);
        if(type == "input") {
            id = parseInt(id);
            var data = groups[id];
        } else if(type == "property") {
            var ids = id.split("-");
            var inputIdx = parseInt(ids[0]);
            var propIdx = parseInt(ids[1]);
            var subgroups = Object.keys(props.groupedGenerations[groups[inputIdx]]);
            var data = subgroups[propIdx];
        } else {
            var ids = id.split("-");
            var inputIdx = parseInt(ids[0]);
            var propIdx = parseInt(ids[1]);
            var subgroups = Object.keys(props.groupedGenerations[groups[inputIdx]]);
            var data = {
                prev: subgroups[propIdx - 1],
                curr: subgroups[propIdx]
            }
        }
        props.setTooltip({
            type: type,
            id: id,
            data: data
        });
    }

    var groupedGenerations = props.groupedGenerations;

    var groups = Object.keys(groupedGenerations);
    for(var i = 0; i < groups.length; i++) {
        var inputText = groups[i];
        var group = groupedGenerations[inputText];
        var subGroups = Object.keys(group);

        // show button here
        generations.push(
            <div key={"input-button-" + i}>
                <HistoryButton 
                    id={"history-" + i} data-type="input" data-id={i} 
                    onMouseEnter={handleTooltip} onMouseLeave={() => props.setTooltip(null)}
                >
                    <InputIcon height="24px" width="24px"/>
                </HistoryButton>
            </div>
        )
        
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
                    <HistoryButton 
                        id={"history-" + propId} data-type={inputIsTop ? "property" : "property-change"} 
                        data-id={propId} 
                        onMouseEnter={handleTooltip} onMouseLeave={() => props.setTooltip(null)}
                    >
                        {inputIsTop ? 
                            <PropertyIcon height="24px" width="24px"/> : 
                            <EditIcon height="24px" width="24px"/>
                        }
                    </HistoryButton>
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
    background-color: ${props => props.isHovered ? "#619aff" : "#DDD"};
    border-radius: ${props => props.isTop ? "4px 4px": "0px 0px"} ${props => props.isBot ? "4px 4px" : "0px 0px"};
    margin-top: ${props => props.isTop ? "4px" : "0px"};
    margin-bottom: ${props => props.isBot ? "4px": "0px"};
    cursor: pointer;
`;

const PinBtn = styled.g`
    cursor: pointer;
    stroke: ${props => props.isPinned ? "#0066FF" : "#ccc"};
    fill: ${props => props.isPinned ? "#0066FF" : "#ccc"};
    &:hover {
        stroke: ${props => props.isPinned ? "#0066FF" : "#619aff"};
        fill: ${props => props.isPinned ? "#0066FF" : "#619aff"};
    }
`;

const CollapsedBar = styled.div`
    height: 8px;
    width: 32px;
    background-color: ${props => props.isHovered ? "#619aff" : "#DDD"};
    border-radius: 4px;
    cursor: pointer;
    margin: 4px 0px;
`;

const HistoryButton = styled.div`
    width: 28px;
    height: 28px; 
    border-radius: 4px;
    border: solid 2px #ccc; 
    margin: 4px 0;
    display: flex;
    cursor: pointer;
    &:hover {
        border: solid 2px #619aff;
        & > svg > rect, path {
            fill: #619aff;
        }
        & > svg > circle {
            stroke: #619aff;
        }
    }
`;

export default GenerationList;