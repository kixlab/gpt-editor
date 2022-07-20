import React, { useState, useRef, useLayoutEffect, useEffect } from 'react';
import styled from "styled-components";

import Pin from './Pin';
import { PinButton } from './SVG';

const propNameMap = {
    'engine': 'Engine',
    'temperature': 'Temperature',
    'presencePen': 'Presence Pen',
    'bestOf': 'Best Of',
};
const engineMap = {
    "text-davinci-002": "Davinci-2",
    "text-davinci-001": "Davinci",
    "text-curie-001": "Curie",
    "text-babbage-001": "Babbage",
    "text-ada-001": "Ada"
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

    useEffect(() => {
        if(clickedGen !== -1 && props.lens.generations[clickedGen] == undefined) {
            setClickedGen(-1);
        }
    }, [props.lens.generations]);

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
        var curr = e.target;
        var index = curr.getAttribute("data-idx");
        while(!index) {
            curr = curr.parentElement;
            index = curr.getAttribute("data-idx");
        }
        index = parseInt(index);
        props.setHoverGen(index);
    }

    function handleMouseLeave(e) {
        props.setHoverGen(null);
    }

    function handleGenClick(e) {
        var curr = e.target;
        var index = curr.getAttribute("data-idx");
        while(!index) {
            curr = curr.parentElement;
            index = curr.getAttribute("data-idx");
        }
        index = parseInt(index);
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
                var isFiltered = isInputFilter || isPropertyFilter || !generation.text.includes(props.filter.data.output);
                pointsSvg.push(
                    <Circle
                        key={idx} cx={x} cy={y} r={props.hoverGen === idx || clickedGen == idx ? "10" : "5"} style={{cursor: "pointer"}}
                        isClicked={clickedGen == idx} isFiltered={isFiltered}
                        isNew={props.lens.generations[idx].isNew}
                        data-text={generation.text} data-x={x} data-y={y}
                        data-idx={idx} onClick={handleGenClick}
                        onMouseEnter={handleMouseEnter} onMouseLeave={handleMouseLeave}
                        isPinned={generation.isPinned}
                    >
                        {generation.isPinned !== null ? 
                            (generation.isPinned.length == 0 ? 
                                <svg 
                                    width={13} height={13}
                                >
                                    <g 
                                        transform={`scale(${13/16})`}
                                        stroke={clickedGen==idx ? "#fff" : "#0066FF"}
                                        fill={clickedGen==idx ? "#fff" : "#0066FF"}
                                    >
                                        {PinButton}
                                    </g>
                                </svg>:
                                generation.isPinned) :
                            ""}
                    </Circle>
                )
            }
        }
    }  

    var currentIdx = props.hoverGen !== null ? props.hoverGen : (clickedGen !== -1) ? clickedGen : -1;
    var currentGen = props.lens.generations[currentIdx];
    if(currentGen == undefined)
        currentGen = null

    return (
        <div style={{display: "flex", flexDirection: "row", height: "100%"}}>
            <SpaceContainer ref={containerRef}>
                {pointsSvg}
                <HoverText>
                    <div>
                        {currentGen !== null ? currentGen.text : ""}
                    </div>
                </HoverText>
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
                        <b>Configurations</b>
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
                    <div style={{paddingBottom: "4px", display: "flex", alignItems: "center", justifyContent: "space-between"}}>
                        <div><b>Generation</b></div>
                        {currentGen !== null &&<Pin 
                            idx={currentIdx} isPinned={currentGen.isPinned}
                            pinGeneration={props.pinGeneration}
                            type="space"
                        />}
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

const SpaceContainer = styled.div`
    width: 65%;
    height: 100%;
    position: relative;
`;

const Circle = styled.div`
    position: absolute;
    width: ${props => props.isPinned !== null ? "fit-content" : (props.r * 2)}px;
    height: ${props => props.isPinned !== null ? "fit-content" : (props.r * 2)}px;
    left: ${props => props.cx - (props.isPinned !== null ? 5 : props.r)}px;
    top: ${props => props.cy - (props.isPinned !== null ? 5 : props.r)}px;
    border-radius: ${props => props.isPinned !== null ? "16px" : "50%"};
    background-color: ${props => props.isClicked || props.isNew ? "#0066FF" : "#fff"};
    opacity: ${props => props.isFiltered ? 0.3 : 1};
    border: solid 2px #0066FF;
    padding: ${props => props.isPinned !== null ? (props.isPinned.length > 0 ? "0px 4px" : "2px") : "0px"};
    font-size: 10px;
    color: ${props => props.isClicked ? "#fff" : "#0066ff"};
    font-weight: bold;
    box-shadow: 0px 0px 0px 2px rgba(255, 255, 255, 1);
    display: flex;
    align-items: center;
    justify-content: center;
`;

const HoverText = styled.div`
    display: flex;
    justify-content: center;
    height: 98%;
    width: 100 %;
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
    z-index: 100;
`;

const InfoSubcont = styled.div`
    padding: 4px 8px;
    border-radius: 8px;
    box-shadow: 0px 4px 4px rgba(0,0,0,0.1);
    border: solid 1px #ccc;
    overflow-y: scroll;
    font-size: 14px;
    background-color: #fff;
    &::-webkit-scrollbar {
        width: 4px;
    }
    &::-webkit-scrollbar-thumb {
        background: #ccc;
        border-radius: 4px;
    }
`;

const TextCont = styled.div`
    white-space: pre-wrap;
    font-size: 12px;
`;

const PropertySubcontainer = styled.div`
    display: flex;
    flex-direction: row;
    gap: 4px;
    & > div {
        flex: 1;
    }
`;

export default GenerationSpace;