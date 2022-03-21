import React, { useState } from 'react';
import styled from "styled-components";

import { LENS_X_OFFSET, LENS_SIZE } from  './Sizes';

import { PeekBig, Collapse } from './SVG.js'

function PeekLens(props) {
    const lens = props.lenses[props.lensId];

    const [collapseHover, setCollapseHover] = useState(false);
    const [hoveredIndexes, setHoveredIndexes] = useState([]);

    function handleCollapseClick() {
        props.changeLensProperty(props.lensId, 'collapse', !lens.collapse);
    }

    function handleHoverContent(e) {
        var index = parseInt(e.target.getAttribute('data-index'));
        var newHoveredIndexes = [...hoveredIndexes];
        newHoveredIndexes.push(index);
        setHoveredIndexes(newHoveredIndexes);
    }

    function drawLensContent() {
        return (
            <foreignObject 
                x={4} y={0} width={LENS_SIZE} height={LENS_SIZE}
                data-type="lens" data-id={props.lensId}
            >
                <PeekContainer data-type="lens" data-id={props.lensId}>
                    {lens.generations.map((generation, i) => {
                        return (
                            <Content 
                                onMouseEnter={handleHoverContent}
                                data-index={i} data-length={lens.generations.length}
                                data-isHovered={hoveredIndexes.includes(i)}
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
`;
const Content = styled.span`
    word-wrap: break-word;
    color: ${props => {
        var percentage = parseInt(props['data-length']) > 0 ? parseInt(props['data-index'])/parseInt(props['data-length']) : 0;
        percentage = 1 - percentage;
        if(parseInt(props['data-index'])%3 === 2) percentage = 0;
        if(props['data-isHovered']) percentage = 1;
        return 'rgba(51, 51, 51, ' + percentage + ')';
    }};
    transition: color 2s ease;
`;

export default PeekLens;