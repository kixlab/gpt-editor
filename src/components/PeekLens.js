import React, { useState } from 'react';
import styled from "styled-components";

import { LENS_X_OFFSET, LENS_SIZE } from  './Sizes';

import { PeekBig, Collapse, PinButton} from './SVG.js'

function PeekLens(props) {
    const lens = props.lenses[props.lensId];

    const [collapseHover, setCollapseHover] = useState(false);
    const [hoveredIndexes, setHoveredIndexes] = useState([]);
    const [pinHover, setPinHover] = useState(false);

    function handleCollapseClick() {
        props.changeLensProperty(props.lensId, 'collapse', !lens.collapse);
    }

    function handleHoverContent(e) {
        var index = parseInt(e.target.getAttribute('data-index'));
        var newHoveredIndexes = [...hoveredIndexes];
        newHoveredIndexes.push(index);
        setHoveredIndexes(newHoveredIndexes);
    }

    function handlePinClick(e) {
        props.changeLensProperty(props.lensId, 'isPinned', !lens.isPinned);
    }

    function drawLensContent() {
        return (
            <foreignObject 
                x={4} y={0} width={LENS_SIZE} height={LENS_SIZE}
                data-type="lens" data-id={props.lensId}
            >
                <PeekContainer 
                    data-type="lens" data-id={props.lensId} data-switch={lens.switches[0]}
                    onClick={(e) => props.slotifyGenerations(e.target.getAttribute('data-switch'), lens.generations.map(g => g.text))}
                >
                    {lens.generations.map((generation, i) => {
                        return (
                            <Content 
                                key={i}
                                onMouseEnter={handleHoverContent}
                                data-index={i} data-length={lens.generations.length}
                                data-hovered={hoveredIndexes.includes(i)}
                                data-switch={lens.switches[0]}
                            >
                                {generation.text}
                            </Content>
                        )
                    })}
                </PeekContainer>
            </foreignObject>
        );
    }

    return (
        <g id={props.lensId} 
            transform={`translate(${LENS_X_OFFSET}, ${props.position})`}
            data-type="lens" data-id={props.lensId}
        >
            {PeekBig}
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
                onMouseEnter={() => setPinHover(true)} onMouseLeave={() => setPinHover(false)}
                onClick={handlePinClick} fill={(pinHover || lens.isPinned) ? "rgba(0, 102, 255, 0.7)" : "#ccc"}
            >
                {PinButton}
            </g>
        </g>
    )
}

const PeekContainer = styled.div`
    margin-top: 28px;
    height: calc(100% - 30px);
    width: calc(100% - 4px);
    padding: 14px;
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
    cursor: pointer;
    -webkit-touch-callout: none; /* iOS Safari */
    -webkit-user-select: none; /* Safari */
     -khtml-user-select: none; /* Konqueror HTML */
       -moz-user-select: none; /* Old versions of Firefox */
        -ms-user-select: none; /* Internet Explorer/Edge */
            user-select: none;
`;
const Content = styled.span`
    word-wrap: break-word;
    color: ${props => {
        var percentage = parseInt(props['data-length']) > 0 ? parseInt(props['data-index'])/parseInt(props['data-length']) : 0;
        percentage = 1 - percentage;
        if(parseInt(props['data-index'])%3 === 2) percentage = 0;
        if(props['data-hovered']) percentage = 1;
        return 'rgba(51, 51, 51, ' + percentage + ')';
    }};
    transition: color 2s ease;
`;

export default PeekLens;