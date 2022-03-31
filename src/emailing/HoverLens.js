import { listClasses } from '@mui/material';
import React, { useState } from 'react';
import styled from "styled-components";

function HoverLens(props) {
    if(props.activeLens === null) return "";
    var currLens = props.lenses[props.activeLens];

    var textElements = document.getElementsByClassName('email-text');
    for (var i = 0; i < textElements.length; i++) {
        if (textElements[i].style.backgroundColor !== '') 
            break;
    }

    var positions = textElements[i].getBoundingClientRect();
    var top = positions.top + positions.height + 64;
    var left = positions.left;

    var editorElement = document.getElementsByClassName('email-editor')[0];
    var editorPos = editorElement.getBoundingClientRect();

    var maxLeft = editorPos.left + editorPos.width + 32;
    if (left + 260 > maxLeft) {
        left = maxLeft - 260;
    }

    function handleClick(e) {
        e.stopPropagation();
        if(e.target.getAttribute('data-idx') === null) return;
        var index = parseInt(e.target.getAttribute('data-idx'))
        var genText = currLens.generations[index].text;
        props.showGeneration(genText, true);
    }

    function handleMouseEnter(e) {
        var index = parseInt(e.target.getAttribute('data-idx'))
        var genText = currLens.generations[index].text;
        props.showGeneration(genText, false);
    }

    var xRange = [1000000, -1000000];
    var yRange = [1000000, -1000000];
    for(var i = 0; i < currLens.generations.length; i++) {
        var generation = currLens.generations[i];
        var coordinates = generation.coordinates;
        xRange[0] = Math.min(xRange[0], coordinates.x);
        xRange[1] = Math.max(xRange[1], coordinates.x);
        yRange[0] = Math.min(yRange[0], coordinates.y);
        yRange[1] = Math.max(yRange[1], coordinates.y);
    }

    function translateCoordinates(coordinates, xRange, yRange) {
        var {x, y} = coordinates;
        var [xLoOld, xHiOld] = xRange;
        var [yLoOld, yHiOld] = yRange;
        const xLoNew = 12;
        const xHiNew = 260 - 12 - 12;
        const yLoNew = 12;
        const yHiNew = 260 - 12 - 12;
        var xNew = (x-xLoOld) / (xHiOld-xLoOld) * (xHiNew-xLoNew) + xLoNew;
        var yNew = yHiNew - (y-yLoOld) / (yHiOld-yLoOld) * (yHiNew-yLoNew);
        return [xNew, yNew];
    }

    function getAxisCoordinates(generation) {
        const SENTIMENT_LABELS = ["Negative", "Neutral", "Positive"];
        const EMOTION_LABELS = ["Anger", "Joy", "Optimism", "Sadness"];
        
        var coordinates = ['x', 'y'];
        coordinates = coordinates.map((axis) => {
            var property = currLens.properties[axis];
            var sentimentIdx = SENTIMENT_LABELS.indexOf(property);
            var emotionIdx = EMOTION_LABELS.indexOf(property);
            if(sentimentIdx !== -1) {
                return generation.sentiment[sentimentIdx];
            } else if(emotionIdx !== -1) {
                return generation.emotion[emotionIdx];
            }
        })
        return {x: coordinates[0], y: coordinates[1]};
    }

    function drawContent() {
        switch(currLens.type) {
            case 'list':
                return (
                    <ListContent>
                        {currLens.generations.map((generation, index) => {
                            return (
                                <ListItem 
                                    key={index} data-idx={index}
                                    onMouseEnter={handleMouseEnter}
                                >
                                    {generation.text}
                                </ListItem>
                            )
                        })}
                    </ListContent>
                )
            case 'axis':
                return (
                    <svg width="100%" height="100%" style={{margin: "6px"}}>
                        <line x1="12" y1="236" x2="236" y2="236" stroke="#0066ff66" strokeWidth="2"/>
                        <text 
                            x="130" y="248" fontSize="12" fill="#0066ff"
                            textAnchor="middle"
                        >
                            {currLens.properties.x}
                        </text>
                        <line x1="12" y1="12" x2="12" y2="236" stroke="#0066ff66" strokeWidth="2"/>
                        <text 
                            fontSize="12" fill="#0066ff"
                            textAnchor="middle" transform="translate(8, 130) rotate(-90)"
                        >
                            {currLens.properties.y}
                        </text>
                        {currLens.generations.map((generation, index) => {
                            var coordinates = getAxisCoordinates(generation);
                            var [x, y] = translateCoordinates(coordinates, [0, 100], [0, 100]);
                            var color = props.switches[generation.switchId].color;
                            return (
                                <circle
                                    key={index} data-idx={index}
                                    onMouseEnter={handleMouseEnter}
                                    cx={x} cy={y} r="6 " fill={color}
                                    stroke="#fff" strokeWidth="1"
                                    style={{cursor: "pointer"}}
                                />
                            )
                        })}
                    </svg>
                )
            case 'space':
                return (
                    <svg width="100%" height="100%" style={{margin: "6px"}}>
                        {currLens.generations.map((generation, index) => {
                            var [x, y] = translateCoordinates(generation.coordinates, xRange, yRange);
                            var color = props.switches[generation.switchId].color;
                            return (
                                <circle
                                    key={index} data-idx={index}
                                    onMouseEnter={handleMouseEnter}
                                    cx={x} cy={y} r="6 " fill={color}
                                    stroke="#fff" strokeWidth="1"
                                    style={{cursor: "pointer"}}
                                />
                            )
                        })}
                    </svg>
                )
        }
    }
    
    return (
        <LensContainer style={{ top: top + "px", left: left + "px" }} onClick={handleClick}>
            {drawContent()}
        </LensContainer>
    )
}

const LensContainer = styled.div`
    position: absolute;
    height: 260px;
    width: 260px;
    background-color: #fff;
    border-radius: 8px;
    border: solid 2px #0066FF;
    box-shadow: 4px 4px 8px rgba(0, 0, 0, 0.25);
`;

const ListContent = styled.div`
    display: flex;
    flex-direction: column;
    gap: 10px;
    font-size: 14px;
    padding: 0px 6px;
    margin: 12px 6px;
    overflow-y: scroll;
    height: calc(100% - 24px);
    &::-webkit-scrollbar {
        width: 4px;
    }
    &::-webkit-scrollbar-thumb {
        background: #ccc;
        border-radius: 4px;
    }
`;

const ListItem = styled.div`
    padding: 4px 8px;
    border-radius: 8px;
    border: solid 1px #ccc;
    cursor: pointer;
    &:hover {
        background-color: #0066FF33;
        border: solid 2px #0066FF66;
    }
`;

export default HoverLens;