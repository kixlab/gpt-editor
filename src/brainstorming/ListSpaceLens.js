import React, { useState } from 'react';
import styled from "styled-components";

import { LENS_X_OFFSET, LENS_SIZE } from  './Sizes';

import { ListBig, SpaceBig, Collapse, SpaceButton, ListButton } from './SVG.js'

function ListSpaceLens(props) {
    const lens = props.lenses[props.lensId];

    const [collapseHover, setCollapseHover] = useState(false);
    const [alternateHover, setAlternateHover] = useState(false);
    const [spaceHover, setSpaceHover] = useState(null);

    function handleCollapseClick() {
        props.changeLensProperty(props.lensId, 'collapse', !lens.collapse);
    }
    
    function handleAlternateClick() {
        props.changeLensProperty(props.lensId, 'type', lens.type === 'list' ? 'space' : 'list');
    }

    function handleItemClick(e) {
        props.slotifyGenerations(e.target.getAttribute('data-switch'), [e.target.getAttribute('data-text')]);
    }

    function translateCoordinates(coordinates, xRange, yRange) {
        var {x, y} = coordinates;
        var [xLoOld, xHiOld] = xRange;
        var [yLoOld, yHiOld] = yRange;
        const LoNew = 48;
        const HiNew = 176;
        var xNew = (x-xLoOld) / (xHiOld-xLoOld) * (HiNew-LoNew) + LoNew;
        var yNew = (y-yLoOld) / (yHiOld-yLoOld) * (HiNew-LoNew) + LoNew;
        return [xNew, yNew];
    }

    function handleSpaceHover(e, isHover) {
        if(isHover) {
            var text = e.target.getAttribute('data-text');
            setSpaceHover({
                text: text, 
                x: parseInt(e.target.getAttribute('data-x')), 
                y: parseInt(e.target.getAttribute('data-y'))
            });
        } else {
            setSpaceHover(null);
        }
    }

    function drawLensContent() {
        if(lens.type === 'list') {
            return (
                <foreignObject 
                    x={4} y={0} width={LENS_SIZE} height={LENS_SIZE}
                    data-type="lens" data-id={props.lensId}
                >
                    <ListLensContainer data-type="lens" data-id={props.lensId}>
                        {lens.generations.map((generation, i) => {
                            return (
                                <ListItem 
                                    key={i} onClick={handleItemClick}
                                    style={{borderLeftColor: props.switches[generation.switchId].color}}
                                    data-type="lens" data-id={props.lensId}
                                    data-switch={generation.switchId} data-text={generation.text}
                                >
                                    {generation.text}
                                </ListItem>
                            )
                        })}
                    </ListLensContainer>
                </foreignObject>
            );
        } else {
            var xRange = [1000000, -1000000];
            var yRange = [1000000, -1000000];
            for(var i = 0; i < lens.generations.length; i++) {
                var generation = lens.generations[i];
                var coordinates = generation.coordinates;
                xRange[0] = Math.min(xRange[0], coordinates.x);
                xRange[1] = Math.max(xRange[1], coordinates.x);
                yRange[0] = Math.min(yRange[0], coordinates.y);
                yRange[1] = Math.max(yRange[1], coordinates.y);
            }
            return (
                <g data-type="lens" data-id={props.lensId}>
                    {lens.generations.map((generation, index) => {
                        var [x, y] = translateCoordinates(generation.coordinates, xRange, yRange);
                        return (
                            <circle data-type="lens" data-id={props.lensId}
                                key={index} cx={x} cy={y} r="6" style={{cursor: "pointer"}}
                                fill={props.switches[generation.switchId].color} 
                                stroke="#fff" strokeWidth="1" data-text={generation.text} data-x={x} data-y={y}
                                data-switch={generation.switchId} onClick={handleItemClick}
                                onMouseEnter={(e) => handleSpaceHover(e, true)} 
                                onMouseLeave={(e) => handleSpaceHover(e, false)}
                            />
                        )
                    })}
                    {spaceHover && (
                        <foreignObject 
                            x={spaceHover.x > 124 ? 24 : spaceHover.x - 100}
                            y={spaceHover.y + 16} width={240} height={200}
                        >
                            <HoverText>
                                {spaceHover.text}
                            </HoverText>
                        </foreignObject>
                    )}
                </g>
            );
        }
    }

    return (
        <g id={props.lensId} 
            transform={`translate(${LENS_X_OFFSET}, ${props.position})`}
            data-type="lens" data-id={props.lensId}
        >
            {lens.type === 'list' ? ListBig : SpaceBig}
            {drawLensContent()}
            <g 
                transform="translate(188, 10) scale(1.44)" style={{cursor: "pointer"}}
                onMouseEnter={() => setCollapseHover(true)} onMouseLeave={() => setCollapseHover(false)}
                onClick={handleCollapseClick} fill={collapseHover ? "rgba(0, 102, 255, 0.7)" : "#ccc"}
                stroke={collapseHover ? "rgba(0, 102, 255, 0.7)" : "#ccc"}
            >
                {Collapse}
            </g>
            <g 
                transform="translate(16, 10) scale(1.44)" style={{cursor: "pointer"}}
                onMouseEnter={() => setAlternateHover(true)} onMouseLeave={() => setAlternateHover(false)}
                onClick={handleAlternateClick} fill={alternateHover ? "rgba(0, 102, 255, 0.7)" : "#ccc"}
                stroke={alternateHover ? "rgba(0, 102, 255, 0.7)" : "#ccc"} 
            >
                {lens.type === 'list' ? SpaceButton : ListButton}
            </g>
        </g>
    )
}

const ListLensContainer = styled.div`
    margin-top: 28px;
    height: calc(100% - 30px);
    width: calc(100% - 4px);
    padding: 14px;
    display: flex;
    flex-direction: column;
    gap: 4px;
    font-size: 14px;
    color: #333;
    overflow-y: scroll;
    &::-webkit-scrollbar {
        width: 4px;
    }
    &::-webkit-scrollbar-thumb {
        background: #ccc;
        border-radius: 4px;
    }

`;

const ListItem = styled.div`
    padding: 0 6px;
    border-radius: 0 4px 4px 0;
    border: solid 1px rgba(0, 102, 255, 0.2);
    border-left: solid 3px;
    width: 100%;
    cursor: pointer;
    -webkit-touch-callout: none; /* iOS Safari */
    -webkit-user-select: none; /* Safari */
     -khtml-user-select: none; /* Konqueror HTML */
       -moz-user-select: none; /* Old versions of Firefox */
        -ms-user-select: none; /* Internet Explorer/Edge */
            user-select: none;
    &:hover {
        background-color: rgba(0, 102, 255, 0.3);
    }
`;

const HoverText = styled.div`
    background-color: #fff;
    border: solid 1px #ccc;
    border-radius: 4px;
    box-shadow: 2px 2px 8px rgba(0, 0, 0, 0.25);
    padding: 0 4px;
`;

export default ListSpaceLens;