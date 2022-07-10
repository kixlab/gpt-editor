import React, { useState, useEffect, useRef } from 'react';
import styled from "styled-components";

import Pin from './Pin';

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

    var isHovering = props.hoverGen === props.idx;
    var isPinned = props.lens.generations[props.idx].isPinned;

    return (
        <TextContainer
            ref={contRef}
            isHover={isHovering} isNew={props.lens.generations[props.idx].isNew}
            onClick={handleClick} onMouseEnter={handleMouseEnter} onMouseLeave={handleMouseLeave}
        >
            {props.text}
            {(isPinned !== null || isHovering) &&
                <Pin
                    idx={props.idx} isPinned={isPinned}
                    pinGeneration={props.pinGeneration}
                />
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
    margin: 6px 0;
    flex: 1;
    cursor: pointer;
    position: relative;
    font-size: 14px;
    font-weight: ${props => props.isNew ? "bold" : "normal"};
`;

export default GenerationTextContainer;