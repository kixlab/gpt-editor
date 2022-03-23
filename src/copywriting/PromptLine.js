import React, { useState, useEffect, useRef } from 'react';
import styled from "styled-components";

function PromptLine(props) {
    const textareaRef = useRef(null);
    const [currentValue, setCurrentValue] = useState(props.value);

    useEffect(() => {
        if(props.value === currentValue) return;
        setCurrentValue(props.value);
    }, [props.value]);

    useEffect(() => {
        console.log('hey');
        textareaRef.current.style.height = "0px";
        const scrollHeight = textareaRef.current.scrollHeight;
        textareaRef.current.style.height = scrollHeight + 4 + "px";
    }, [currentValue]);

    function handleChange(e) {
        setCurrentValue(e.target.value);
        props.handleChangeLine(e.target.value, props.depth, props.index);
    }

    function handleClickTray(e) {
        props.changePath(props.depth, parseInt(e.target.getAttribute('data-index')))
    }

    const buttonsHTML = [];
    for(var i = 0; i < props.slots[props.depth].length; i++) {
        buttonsHTML.push(
            <Circle 
                key={i} isSelected={i === props.currPath[props.depth]}
                data-index={i}
                onClick={handleClickTray}
            />
        );
    }

    return (
        <div>
            <Line ref={textareaRef} value={currentValue} onChange={handleChange}/>
            <Tray>
                {buttonsHTML}
            </Tray>
        </div>
    )
}

const Line = styled.textarea`
    width: 100%;
    padding: 8px 16px;
    border-radius: 4px;
    border: solid 2px #0066FF;
    box-shadow: 0 4px 4px rgba(0, 0, 0, 0.25);
    background-color: #fff;
    font-size: 18px;
    height: auto;
    resize: none;
    overflow-y: hidden;
    outline: none !important;
`;

const Tray = styled.div`
    display: flex;
    margin-top: 8px;
    gap: 8px;
    flex-direction: row;
    justify-content: center;
`;

const Circle = styled.div`
    width: 20px;
    height: 20px;
    border-radius: 10px;
    background-color: ${props => props.isSelected ? "#0066FF" : "#ddd"};
    cursor: pointer;
`

export default PromptLine;