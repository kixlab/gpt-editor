import React, { useState, useEffect, useRef } from 'react';
import styled from "styled-components";

import TextareaAutosize from '@mui/base/TextareaAutosize';

function PromptLine(props) {
    const clickTimer = useRef(null);

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
        e.stopPropagation();
        props.changePath(props.depth, parseInt(e.target.getAttribute('data-index')))
    }

    const buttonsHTML = [];
    for(var i = 0; i < props.slots.entries[props.depth].length; i++) {
        var isOneHover = props.hoverPath && props.hoverPath[props.depth] === i;
        buttonsHTML.push(
            <Circle 
                key={i} isSelected={i === props.slots.path[props.depth]}
                data-index={i} isEmpty={props.slots.entries[props.depth][i] === null}
                onClick={handleClickTray} isHover={isOneHover}
            />
        );
    }

    function handleClickContainer(e) {
        if(!props.isTreatment) return;
        e.stopPropagation();

        switch (e.detail) {
            case 1:
                clickTimer.current = setTimeout(() => {
                    if(props.slots.path[props.depth] !== props.index) {
                        props.changePath(props.depth, props.index);
                    } else {
                        props.changePath(props.depth, props.slots.path[props.depth].length - 1);
                    }
                }, 150);
                break;
            case 2:
                if(e.target.tagName === "TEXTAREA" || clickTimer.current == null) return;
                clearTimeout(clickTimer.current);
                if(!props.isTreatment || (props.selected.type === 'slots' && props.selected.data[0] === props.depth && props.selected.data[1] === props.index)) {
                    props.setSelected({type: null})
                } else {
                    props.setSelected(
                        {type: "slots", data: [props.depth, props.index]}
                    );
                }
                window.getSelection().removeAllRanges();
                break;
            default:
                break;
        }
    }

    const isEmptyItem = props.value === null;


    var textAreaStyle = {
        width: "100%",
        border: "none",
        resize: "none",
        padding: "0px",
        color: props.isHover ? "#0066FF66" : "#333",
    };

    if(!props.isTreatment && props.slots.path[props.depth] !== props.index) return "";

    return (
        <div style={isEmptyItem ? {flex: "0", height: "100%"} : {flex: "1"}}>
            <TextAreaCont 
                onClick={handleClickContainer} 
                isSelected={props.selected.type === 'slots' && props.selected.data[0] === props.depth && props.selected.data[1] === props.index}
                inPath={props.inPath}
            >
                <TextareaAutosize 
                    ref={element => { if (element) element.style.setProperty('outline', 'none', 'important'); }}
                    style={textAreaStyle} value={currentValue} onChange={handleChange} 
                    placeholder="Input prompt line..."
                /> 
            </TextAreaCont>
        </div>
    )
}

const TextAreaCont = styled.div`
    width: 100%;
    height: 100%;
    padding: 4px 12px;
    border-radius: 4px;
    border: solid;
    border-width: ${(props) => props.isSelected ? "4px" : "2px"};
    border-color: ${(props) => props.isSelected ? "#00C2FF" : (props.inPath ? "#0066FF" : "#ddd") };
    border-top-width: 12px;
    background-color: #fff;
    color: #333;
    font-size: 14px;
    display: flex;
    cursor: pointer;
    align-items: center;
    justify-content: center;
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
    border: ${props => !props.isEmpty ? "none" : props.isSelected ? "solid 3px #0066FF" : props.isHover ? "solid 3px #0066FF66" : "solid 3px #ddd"};
    background-color: ${props => props.isEmpty ? "#fff" : props.isSelected ? "#0066FF" : props.isHover ? "#0066FF66" : "#ddd"};
    cursor: pointer;
`

export default PromptLine;