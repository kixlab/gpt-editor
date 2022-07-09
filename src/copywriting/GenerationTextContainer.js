import React, { useState, useEffect, useRef } from 'react';
import styled from "styled-components";

import { PinButton } from './SVG'

function GenerationTextContainer(props) {
    const contRef = useRef(null);

    const [isHover, setIsHover] = useState(false);

    useEffect(() => {
        if(isHover) return;
        if(props.hoverGen === props.idx)
            contRef.current.scrollIntoView({ behavior: "smooth" });
    }, [props.hoverGen]);

    function handleClick(e) {
        var index = parseInt(props.idx);
        props.copyGeneration(props.lens.generations[index].text);
    }

    function handleMouseEnter(e) {
        var index = parseInt(props.idx);
        props.setHoverGen(index);
        setIsHover(true);
    }

    function handleMouseLeave(e) {
        props.setHoverGen(null);
        setIsHover(false);
    }

    function handlePin(e) {
        e.stopPropagation();
        var curr = e.target;
        var idx = curr.getAttribute("data-idx");
        while(idx === null || idx === undefined) {
            curr = curr.parentNode;
            idx = curr.getAttribute("data-idx");
        }
        console.log(idx);
        props.pinGeneration(idx);
    }

    var isHovering = props.hoverGen === props.idx;
    var isPinned = props.lens.generations[props.idx].isPinned;

    return (
        <TextContainer
            ref={contRef}
            isHover={isHovering}
            onClick={handleClick} onMouseEnter={handleMouseEnter} onMouseLeave={handleMouseLeave}
        >
            {props.text}
            {(isPinned || isHovering) &&
                <PinBtn 
                    data-idx={props.idx} onClick={handlePin}
                    isPinned={isPinned}
                >
                    <svg width="16" height="16">
                        <g transform="scale(1.0)">
                            {PinButton}
                        </g>
                    </svg>
                </PinBtn>
            }
        </TextContainer>
    );
}

const TextContainer = styled.div`
    background-color: ${props => props.isHover ? "rgba(0, 102, 255, 0.1)" : "#fff"};
    border: solid 2px;
    border-color: ${props => props.isHover ? "#0066FF" : "#ccc"};
    border-radius: 8px;
    padding: 4px 10px 4px 8px;
    margin: 4px 0;
    flex: 1;
    cursor: pointer;
    position: relative;
    font-size: 14px;
`;

const PinBtn = styled.div`
    cursor: pointer;
    position: absolute;
    right: 4px;
    top: 4px;
    z-index: 100;
    height: 24px;
    width: 24px;
    display: flex;
    align-items: center;
    justify-content: center;
    border-radius: 12px;
    & > svg > g {
        stroke: ${props => props.isPinned ? "#0066FF" : "#ccc"};
        fill: ${props => props.isPinned ? "#0066FF" : "#ccc"};
    }
    &:hover {
        background-color: #0066FF33;
        & > svg > g {
            stroke: ${props => props.isPinned ? "#0066FF" : "#619aff"};
            fill: ${props => props.isPinned ? "#0066FF" : "#619aff"};
        }
    }
`;

export default GenerationTextContainer;