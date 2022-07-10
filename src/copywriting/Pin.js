import React, { useState, useEffect, useRef } from 'react';
import styled from "styled-components";

import { PinButton } from './SVG'

function Pin(props) {
    const [isPinHover, setIsPinHover] = useState(false);
    const [memoWidth, setMemoWidth] = useState(7);

    useEffect(() => {
        if(props.isPinned == null || props.isPinned.length == 0){
            setMemoWidth(7);
        } else {
            setMemoWidth(props.isPinned.length);
        }
    }, [props.isPinned]);


    function handlePinMouseEnter(e) {
        setIsPinHover(true);
    }
    function handlePinMouseLeave(e) {
        setIsPinHover(false);
    }

    function handlePin(e) {
        e.stopPropagation();
        var curr = e.target;
        var idx = curr.getAttribute("data-idx");
        while(idx === null || idx === undefined) {
            curr = curr.parentNode;
            idx = curr.getAttribute("data-idx");
        }
        props.pinGeneration(idx, "click", "");
    }

    function handleMemoChange(e) {
        var value = e.target.value;
        setMemoWidth(value.length);
        props.pinGeneration(props.idx, "change", value)
    }

    return (
        <PinBtn 
            data-idx={props.idx} onClick={handlePin}
            isPinned={props.isPinned}
            onMouseEnter={handlePinMouseEnter} onMouseLeave={handlePinMouseLeave}
            isSpace={props.type == "space"}
        >
            <PinSVGCont isPinned={props.isPinned} isHover={isPinHover}>
                <svg width="16" height="16">
                    <g transform="scale(1.0)">
                        {PinButton}
                    </g>
                </svg>
            </PinSVGCont>
            {props.isPinned !== null && (isPinHover || props.isPinned.length > 0) ? 
                <MemoInput 
                    type="text"
                    placeholder="Memo..."
                    value={props.isPinned}
                    onClick={(e) => e.stopPropagation()}
                    onChange={handleMemoChange}
                    size={memoWidth}
                /> : 
                ""}
        </PinBtn>
    )
};

const PinBtn = styled.div`
    cursor: pointer;
    position: ${props => props.isSpace ? "relative" : "absolute"};
    right: ${props => props.isSpace? "0" : "-8px"};
    top: ${props => props.isSpace ? "0" : "-12px"};
    width: fit-content;
    z-index: 100;
    display: flex;
    align-items: center;
    justify-content: center;
    border-radius: 14px;
    border: solid 2px ${props => props.isPinned !== null ? "#0066FF" : "#ccc"};
    background-color: #fff;
    display: flex;
    flex-direction: row;
    z-index: 100;
    &:hover {
        border-color: ${props => props.isPinned !== null ? "#0066ff" : "#0066FF66"};
    }
`;

const PinSVGCont = styled.div`
    display: flex;
    align-items: center;
    justify-content: center;
    height: 22px;
    width: 22px;
    margin-left: ${props => props.isPinned !== null && (props.isPinned.length > 0 || props.isHover) ? "2px" : "0px"};
    & > svg > g {
        stroke: ${props => props.isPinned !== null ? "#0066FF" : "#ccc"};
        fill: ${props => props.isPinned !== null ? "#0066FF" : "#ccc"};
    }
    &:hover {
        & > svg > g {
            stroke: ${props => props.isPinned !== null ? "#0066FF" : "#619aff"};
        }
    }
`;

const MemoInput = styled.input`
    width: 100%;
    border: none;
    background-color: transparent;
    outline: none;
    font-size: 10px;
    color: #0066ff;
    font-weight: bold;
`;


export default Pin;