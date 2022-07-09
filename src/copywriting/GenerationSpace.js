import React, { useState, useRef, useLayoutEffect } from 'react';
import styled from "styled-components";

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

function GenerationSpace(props) {
    const containerRef = useRef(null);
    const [clickedGen, setClickedGen] = useState(-1);
    const [containerDims, setContainerDims] = useState([0, 0]);

    useLayoutEffect(() => {
        // I don't think it can be null at this point, but better safe than sorry
        if (containerRef.current) {
            setContainerDims([
                Math.floor(containerRef.current.getBoundingClientRect().width), 
                Math.floor(containerRef.current.getBoundingClientRect().height)
            ]);
        }
    }, []);

    function translateCoordinates(coordinates, xRange, yRange) {
        var {x, y} = coordinates;
        var [xLoOld, xHiOld] = xRange;
        var [yLoOld, yHiOld] = yRange;
        const xLoNew = 24;
        const xHiNew = containerDims[0] - 24;
        const yLoNew = 24;
        const yHiNew = containerDims[1] - 24;
        var xNew = (x-xLoOld) / (xHiOld-xLoOld) * (xHiNew-xLoNew) + xLoNew;
        var yNew = (y-yLoOld) / (yHiOld-yLoOld) * (yHiNew-yLoNew) + yLoNew;
        return [xNew, yNew];
    }

    function handleItemClick() {
        var index = clickedGen;
        if(index == -1) return;
        props.copyGeneration(props.lens.generations[index].text);
    }

    function handleMouseEnter(e) {
        var index = parseInt(e.target.getAttribute("data-idx"));
        props.setHoverGen(index);
    }

    function handleMouseLeave(e) {
        props.setHoverGen(null);
    }

    function handleGenClick(e) {
        var index = parseInt(e.target.getAttribute("data-idx"));
        if(index === clickedGen) 
            setClickedGen(-1);
        else
            setClickedGen(index);
    }

    var xRange = [1000000, -1000000];
    var yRange = [1000000, -1000000];
    for(var i = 0; i < props.lens.generations.length; i++) {
        var generation = props.lens.generations[i];
        var coordinates = generation.coordinates;
        xRange[0] = Math.min(xRange[0], coordinates.x);
        xRange[1] = Math.max(xRange[1], coordinates.x);
        yRange[0] = Math.min(yRange[0], coordinates.y);
        yRange[1] = Math.max(yRange[1], coordinates.y);
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

    function propertiesToHTML(properties) {
        var propertyNames = ['engine', 'temperature', 'presencePen', 'bestOf'];
        var html = propertyNames.map((propName, idx) => {
            var propValue = properties[propName]
            if(propName == "engine") {
                propValue = engineMap[propValue];
            }
            propName = propNameMap[propName];
            return (
                <div key={idx}>{propName}: <b>{propValue}</b></div>
            )
        })
        return [
            <PropertySubcontainer key={0}>
                {html[0]} {html[1]}
            </PropertySubcontainer>,
            <PropertySubcontainer key={1}>
                {html[2]} {html[3]}
            </PropertySubcontainer>
        ]
    }

    var pointsSvg = [];
    for(var inputText in props.groupedGenerations) {
        var group = props.groupedGenerations[inputText];
        var isInputFilter = !inputText.includes(props.filter.data.input);
        for(var propertiesStr in group) {
            var subgroup = group[propertiesStr];
            var isPropertyFilter = isFilteredByProperty(propertiesStr, props.filter.data);
            for(var i = 0; i < subgroup.length; i++) {
                var idx = subgroup[i];
                var generation = props.lens.generations[idx];
                var [x, y] = translateCoordinates(generation.coordinates, xRange, yRange);
                var isFiltered = isInputFilter || isPropertyFilter;
                pointsSvg.push(
                    <circle
                        key={idx} cx={x} cy={y} r={props.hoverGen === idx || clickedGen == idx ? "12" : "6"} style={{cursor: "pointer"}}
                        fill={isFiltered ? "#0066ff33" : "#0066ff"}
                        stroke={clickedGen === idx ? "#0066FF66" : "#fff"} strokeWidth={clickedGen === idx ? "8" : "1"}
                        data-text={generation.text} data-x={x} data-y={y}
                        data-idx={idx} onClick={handleGenClick}
                        onMouseEnter={handleMouseEnter} onMouseLeave={handleMouseLeave}
                    />
                )
            }
        }
    }  

    var currentGen = props.hoverGen !== null ? props.lens.generations[props.hoverGen] : (clickedGen !== -1 ? props.lens.generations[clickedGen] : null);

    return (
        <div style={{display: "flex", flexDirection: "row", height: "100%"}}>
            <SpaceContainer ref={containerRef}>
                {false && <foreignObject 
                    x="0" y="0" width={containerDims[0]} height={containerDims[1]}
                >
                    <HoverText>
                        <div>
                            {currentGen !== null ? currentGen.text : ""}
                        </div>
                    </HoverText>
                </foreignObject>}
                {pointsSvg}
            </SpaceContainer>
            <InfoContainer>
                <InfoSubcont>
                    <div style={{paddingBottom: "4px"}}>
                        <b>Input</b>
                    </div>
                    <TextCont style={{color: props.hoverGen !== null ? "#0066ffaa" : (clickedGen == -1 ? "#666" : "#333")}}>
                        {currentGen !== null ? 
                            currentGen.inputText.trim() : 
                             "Click or hover on a generation..."}
                    </TextCont>
                </InfoSubcont>
                <InfoSubcont style={{overflowY: "initial"}}>
                    <div style={{paddingBottom: "4px"}}>
                        <b>Parameters</b>
                    </div>
                    <TextCont style={{color: props.hoverGen !== null ? "#0066ffaa" : (clickedGen == -1 ? "#666" : "#333")}}>
                        {currentGen !== null ? 
                            propertiesToHTML(currentGen.properties) :
                            "Click or hover on a generation..."}
                    </TextCont>
                </InfoSubcont>
                <InfoSubcont 
                    style={{border: clickedGen !== -1 ? ("solid 2px #0066ff") : "", cursor: "pointer"}}
                    onClick={handleItemClick}
                >
                    <div style={{paddingBottom: "4px"}}>
                        <b>Generation</b> <span style={{color: "#666", fontSize: "10px"}}>Click to copy to editor...</span>
                    </div>
                    <TextCont style={{color: props.hoverGen !== null ? "#0066ffaa" : (clickedGen == -1 ? "#666" : "#333")}}>
                        {currentGen !== null ? 
                            currentGen.text :
                            "Click or hover on a generation..."}
                    </TextCont>
                </InfoSubcont>
            </InfoContainer>
        </div>
    )
}

const SpaceContainer = styled.svg`
    width: 65%;
    height: 100%;
`;

const HoverText = styled.div`
    display: flex;
    justify-content: center;
    height: 100%;
    width: 100%;
    align-items: center;
    padding: 8px;
    color: #0066ff99;
    -webkit-user-select: none; /* Safari */        
    -moz-user-select: none; /* Firefox */
    -ms-user-select: none; /* IE10+/Edge */
    user-select: none; /* Standard */
`;

const InfoContainer = styled.div`
    width: 35%;
    display: flex;
    flex-direction: column;
    gap: 8px;
`;

const InfoSubcont = styled.div`
    padding: 4px 8px;
    border-radius: 8px;
    box-shadow: 0px 4px 4px rgba(0,0,0,0.1);
    border: solid 1px #ccc;
    overflow-y: scroll;
    font-size: 14px;
    &::-webkit-scrollbar {
        width: 4px;
    }
    &::-webkit-scrollbar-thumb {
        background: #ccc;
        border-radius: 4px;
    }
`;

const TextCont = styled.div`
    overflow-y: scroll;
    white-space: pre-wrap;
    font-size: 12px;
`;

const PropertySubcontainer = styled.div`
    display: flex;
    flex-direction: row;
    gap: 4px;
    & > div {
        padding-right: 4px;
    }
`;

export default GenerationSpace;