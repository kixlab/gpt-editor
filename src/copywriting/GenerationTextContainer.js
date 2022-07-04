import React, { useState, useEffect, useRef } from 'react';
import styled from "styled-components";

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

    return (
        <TextContainer
            ref={contRef}
            isHover={props.idx === props.hoverGen}
            onClick={handleClick} onMouseEnter={handleMouseEnter} onMouseLeave={handleMouseLeave}
        >
            {props.text}
        </TextContainer>
    );
}

const TextContainer = styled.div`
    background-color: ${props => props.isHover ? "rgba(0, 102, 255, 0.1)" : "#fff"};
    border: solid 2px;
    border-color: ${props => props.isHover ? "#0066FF" : "#ccc"};
    border-radius: 8px;
    padding: 4px 8px;
    margin: 4px 0;
    flex: 1;
    cursor: pointer;
`;

export default GenerationTextContainer;