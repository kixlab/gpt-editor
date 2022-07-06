import React, { useState, useEffect, useRef } from 'react';
import styled from "styled-components";

import GenerationTextContainer from "./GenerationTextContainer";

import { ReactComponent as InputIcon } from '../img/InputIcon.svg';
import { ReactComponent as PropertyIcon } from '../img/PropertyIcon.svg';
import { ReactComponent as EditIcon } from '../img/EditIcon.svg';

const propNameMap = {
    'engine': 'Engine',
    'temperature': 'Temperature',
    'presencePen': 'Presence Penalty',
    'bestOf': 'Best Of',
};
const engineMap = {
    "text-davinci-002": "Davinci-2 (D2)",
    "text-davinci-001": "Davinci (D)",
    "text-curie-001": "Curie (C)",
    "text-babbage-001": "Babbage (B)",
    "text-ada-001": "Ada (A)"
}

function GenerationList(props) {
    const [hovered, setHovered] = useState(null);
    const [inputCollapsed, setInputCollapsed] = useState([]);
    const [propertyCollapsed, setPropertyCollapsed] = useState([]);
    const [inputHistoryShown, setInputHistoryShown] = useState([]);
    const [propertyHistoryShown, setPropertyHistoryShown] = useState([]);

    const generations = [];

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

    function handleHistoryClick(e) {
        var curr = e.target;
        while(curr.tagName !== "DIV") {
            curr = curr.parentNode;
        }
        var type = curr.getAttribute("data-type");
        var id = curr.getAttribute("data-id");
        if(type === "input") {
            id = parseInt(id);
            if(inputHistoryShown.includes(id)) {
                setInputHistoryShown(inputHistoryShown.filter(ele => ele !== id));
            } else {
                setInputHistoryShown(inputHistoryShown.concat(id));
                props.setTooltip(null);
            }
        } else {
            if(propertyHistoryShown.includes(id)) {
                setPropertyHistoryShown(propertyHistoryShown.filter(ele => ele !== id));
            } else {
                setPropertyHistoryShown(propertyHistoryShown.concat(id));
                props.setTooltip(null);
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
            if(inputHistoryShown.includes(id)) return;
            var data = groups[id];
        } else if(type == "property") {
            if(propertyHistoryShown.includes(id)) return;
            var ids = id.split("-");
            var inputIdx = parseInt(ids[0]);
            var propIdx = parseInt(ids[1]);
            var subgroups = Object.keys(props.groupedGenerations[groups[inputIdx]]);
            var data = subgroups[propIdx];
        } else {
            if(propertyHistoryShown.includes(id)) return;
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

    function showHistory(type, data) {
        if(type == "input") {
            return (
                <HistoryInputContainer>
                    <div>{data}</div>
                </HistoryInputContainer>
            )
        } else if(type == "property") {
            var properties = data.split("\n");
            properties = properties.map((prop, idx) => {
                var propSplit = prop.split(": ");
                var propName = propSplit[0];
                var propValue = propSplit[1];
                if(propName == "engine") {
                    propValue = engineMap[propValue];
                }
                propName = propNameMap[propName];
                return (
                    <div key={idx}>{propName}: <b>{propValue}</b></div>
                )
            })
            return (
                <HistoryPropertyContainer>
                    <div>
                        {properties[0]} {properties[1]}
                    </div>
                    <div>
                        {properties[2]} {properties[3]}
                    </div>
                </HistoryPropertyContainer>
            )
        } else {
            var prevProperties = data.prev.split("\n");
            var currProperties = data.curr.split("\n");
            for(var i = 0; i < prevProperties.length; i++) {
                if(prevProperties[i] == currProperties[i]) continue;
                var propSplit = prevProperties[i].split(": ");
                var propName = propSplit[0];
                var prevPropValue = propSplit[1];
                var currPropValue = currProperties[i].split(": ")[1];
                if(propName == "engine") {
                    prevPropValue = engineMap[prevPropValue];
                    currPropValue = engineMap[currPropValue];
                }
                propName = propNameMap[propName];
                return (
                    <HistoryPropertyContainer style={{flex: "none"}}>
                        {propName}:&nbsp;<b>{prevPropValue}</b>&nbsp;→&nbsp;<b>{currPropValue}</b>
                    </HistoryPropertyContainer>
                )
            }
        }
    }

    function isFilteredByProperty(propertyStr, filterData) {
        var properties = propertyStr.trim().split("\n");
        for(var i = 0; i < properties.length; i++) {
            var property = properties[i].split(": ");
            var propName = property[0];
            var propValue = property[1];
            if(propName != "engine") {
                propValue = parseFloat(propValue);
                if(propValue < filterData[propName][0] || propValue > filterData[propName][1]) return true;
            } else {
                if(filterData.engine !== "all" && filterData.engine !== propValue) return true;
            }
        }
        return false;
    }

    var groupedGenerations = props.groupedGenerations;

    var groups = Object.keys(groupedGenerations);
    for(var i = 0; i < groups.length; i++) {
        var inputText = groups[i];
        var group = groupedGenerations[inputText];
        var subGroups = Object.keys(group);

        var isInputFilter = !inputText.includes(props.filter.data.input);

        // show button here
        generations.push(
            <Entry key={"input-button-" + i}>
                <HistoryButton 
                    id={"history-" + i} data-type="input" data-id={i} 
                    onMouseEnter={handleTooltip} onMouseLeave={() => props.setTooltip(null)}
                    onClick={handleHistoryClick}
                    isShown={inputHistoryShown.includes(i)}
                >
                    <InputIcon height="24px" width="24px"/>
                </HistoryButton>
                {inputHistoryShown.includes(i) && showHistory("input", inputText)}
            </Entry>
        )
        
        if(isInputFilter) {
            generations.push(
                <Entry key={"filtered-" + i}>
                    <FilteredCircle></FilteredCircle>
                </Entry>
            )
            continue;
        } else if(inputCollapsed.includes(i)) {
            generations.push(
                <Entry key={"collapsed-" + i}>
                    <CollapsedBar 
                        data-type="input" data-id={i}
                        isHovered={hovered !== null && hovered.type === "input" && hovered.id == i}
                        onMouseEnter={handleBarMouseEnter} onMouseLeave={() => setHovered(null)}
                        onClick={handleBarClick}
                    ></CollapsedBar>
                </Entry>
            )
            continue;
        }

        for(var j = 0; j < subGroups.length; j++) {
            var propertiesStr = subGroups[j];
            var indices = group[propertiesStr];

            var isPropertyFilter = isFilteredByProperty(propertiesStr, props.filter.data);

            var propId = i + "-" + j;

            var inputIsTop = j == 0;
            var inputIsBot = false;
            generations.push(
                <Entry key={"property-button-" + propId}>
                    <Bar 
                        isTop={inputIsTop} isBot={inputIsBot} 
                        data-type="input" data-id={i}
                        isHovered={hovered !== null && hovered.type === "input" && hovered.id == i}
                        onMouseEnter={handleBarMouseEnter} onMouseLeave={() => setHovered(null)}
                        onClick={handleBarClick}
                    ></Bar>
                    <HistoryButton 
                        id={"history-" + propId} data-type={inputIsTop ? "property" : "property-change"} 
                        data-id={propId} onClick={handleHistoryClick}
                        onMouseEnter={handleTooltip} onMouseLeave={() => props.setTooltip(null)}
                        isShown={propertyHistoryShown.includes(propId)}
                    >
                        {inputIsTop ? 
                            <PropertyIcon height="24px" width="24px"/> : 
                            <EditIcon height="24px" width="24px"/>
                        }
                    </HistoryButton>
                    {propertyHistoryShown.includes(propId) && 
                        (inputIsTop ? 
                            showHistory("property", propertiesStr) : 
                            showHistory("property-change", {prev: subGroups[j-1], curr: propertiesStr}))
                    }
                </Entry>
            )

            var inputIsTop = false;
            var inputIsBot = j == subGroups.length - 1;
            if(isPropertyFilter) {
                generations.push(
                    <Entry key={"filtered-" + propId}>
                        <Bar 
                            isTop={inputIsTop} isBot={inputIsBot} 
                            data-type="input" data-id={i}
                            isHovered={hovered !== null && hovered.type === "input" && hovered.id == i}
                            onMouseEnter={handleBarMouseEnter} onMouseLeave={() => setHovered(null)}
                            onClick={handleBarClick}
                        ></Bar>
                        <FilteredCircle></FilteredCircle>
                    </Entry>
                )
                continue;
            }else if(propertyCollapsed.includes(propId)) {
                generations.push(
                    <Entry key={"collapsed-" + propId}>
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
                    </Entry>
                )
                continue;
            }

            for(let k = 0; k < indices.length; k++) {
                var idx = indices[k];
                var entry = props.lens.generations[idx];

                var propsIsTop = k == 0;
                var propsIsBot = k == indices.length - 1;
                inputIsTop = false;
                inputIsBot = propsIsBot && j == subGroups.length - 1;

                generations.push(
                    <Entry key={idx}>
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
                            pinGeneration={props.pinGeneration}
                        />
                    </Entry>
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

const Entry = styled.div`
    display: flex;
    flex-direction: row; 
    gap: 8px; 
    align-items: stretch;
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
    border-radius: 4px;
    border: solid 2px ${props => props.isShown ? "#0066FF" : "#ccc"}; 
    margin: 4px 0;
    display: flex;
    cursor: pointer;
    align-items: center;
    & > svg > rect, path {
        fill: ${props => props.isShown ? "#0066FF" : "#ddd"};
    }
    & > svg > circle {
        stroke: ${props => props.isShown ? "#0066FF" : "#ddd"};
    }
    &:hover {
        border: solid 2px ${props => props.isShown ? "#0066FF" : "#619aff"};
        & > svg > rect, path {
            fill: ${props => props.isShown ? "#0066FF" : "#619aff"};
        }
        & > svg > circle {
            stroke: ${props => props.isShown ? "#0066FF" : "#619aff"};
        }
    }
`;

const HistoryInputContainer = styled.div`
    border: solid 1px #99C2FF;
    border-radius: 8px;
    padding: 4px 4px 4px 8px;
    margin: 4px 0;
    white-space: pre-wrap;
    color: #666;
    & > div {
        max-height: 96px;
        overflow-y: auto;
        padding-right: 8px;
        &::-webkit-scrollbar {
            width: 4px;
        }
        &::-webkit-scrollbar-thumb {
            background: #ccc;
            border-radius: 4px;
        }
    }
`;

const HistoryPropertyContainer = styled.div`
    border: solid 1px #99C2FF;
    border-radius: 8px;
    padding: 4px 8px;
    margin: 4px 0;
    display: flex;
    color: #666;
    & > div {
        display: flex;
        flex-direction: column;
        gap: 4px;
        & > div {
            padding-right: 8px;
        }
    }
`;

const FilteredCircle = styled.div`
    width: 32px;
    height: 8px;
    border-radius: 4px;
    border: solid 2px #ddd;
    margin: 4px 0;
`;

export default GenerationList;