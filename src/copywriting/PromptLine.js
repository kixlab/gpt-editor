import React, { useState, useEffect, useRef } from 'react';
import styled from "styled-components";

import TextareaAutosize from '@mui/base/TextareaAutosize';

function PromptLine(props) {
    const [currentValue, setCurrentValue] = useState(props.value);

    useEffect(() => {
        setCurrentValue(props.value);
    }, []);

    useEffect(() => {
        if(props.value === currentValue) return;
        setCurrentValue(props.value);
    }, [props.value]);

    function handleChange(e) {
        setCurrentValue(e.target.value);
        props.handleLineChange(e.target.value, props.depth, props.index);
    }

    function handleClickTray(e) {
        props.changePath(props.depth, parseInt(e.target.getAttribute('data-index')))
    }

    const buttonsHTML = [];
    for(var i = 0; i < props.slots.entries[props.depth].length; i++) {
        buttonsHTML.push(
            <Circle 
                key={i} isSelected={i === props.slots.path[props.depth]}
                data-index={i} isEmpty={props.slots.entries[props.depth][i] === null}
                onClick={handleClickTray}
            />
        );
    }

    function handleClickContainer(e) {
        if(e.target.tagName === 'TEXTAREA' || props.value === null) return;
        props.setSelected(
            props.selected.type === 'slots' && props.selected.data === props.depth ? 
            {type: null} : 
            {type: "slots", data: props.depth}
        );
    }

    const isEmptyItem = props.value === null;
    return (
        <div style={{width: "100%"}}>
            <TextAreaCont 
                onClick={handleClickContainer} 
                isSelected={props.selected.type === 'slots' && props.selected.data === props.depth}
                isEmptyItem={isEmptyItem}
            >
                {!isEmptyItem ? 
                    <TextareaAutosize 
                        ref={element => { if (element) element.style.setProperty('outline', 'none', 'important'); }}
                        style={textAreaStyle} value={currentValue} onChange={handleChange}
                        placeholder="Input prompt line..."
                    /> :
                    "Empty Line"
                }
            </TextAreaCont>
            <Tray>
                {buttonsHTML}
            </Tray>
        </div>
    )
}

const TextAreaCont = styled.div`
    width: 100%;
    padding: 8px 16px;
    border-radius: 4px;
    border: solid ${(props) => props.isSelected ? "4px #00C2FF" : props.isEmptyItem ? "2px #ddd" : "2px #0066FF"};
    box-shadow: 0 4px 4px rgba(0, 0, 0, 0.25);
    background-color: "#fff";
    color: ${(props) => props.isEmptyItem ? "#999" : "#333" };
    font-size: 18px;
    height: auto;
    display: flex;
    cursor: ${(props) => props.isEmptyItem ? "auto" : "pointer"};
    align-items: center;
    justify-content: center;
`;

const textAreaStyle = {
    width: "100%",
    border: "none",
    resize: "none",
    padding: "0px"
};

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
    border: solid 3px ${props => props.isSelected ? "#0066FF" : "#ddd"};
    background-color: ${props => props.isEmpty ? "#fff" : props.isSelected ? "#0066FF" : "#ddd"};
    cursor: pointer;
`

export default PromptLine;