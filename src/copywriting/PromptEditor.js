import React, { useState, useEffect, useRef } from 'react';
import styled from "styled-components";

import PromptLine from './PromptLine';

function PromptEditor(props) {
    function handleLineChange(value, depth, index) {
        props.changeSlots(value, depth, index);
    }

    var promptHTML = [];
    for(var depth = 0; depth < props.slots.entries.length; depth++) {
        var lineHTML = [];
        for(var index = 0; index < props.slots.entries[depth].length - 1; index++) {
            lineHTML.push(
                <PromptLine 
                    key={`${depth}-${index}`} depth={depth} index={index}
                    value={props.slots.entries[depth][index]} slots={props.slots}
                    handleLineChange={handleLineChange} changePath={props.changePath}
                    selected={props.selected} setSelected={props.setSelected}
                    inPath={props.slots.path[depth] === index}
                    isTreatment={props.isTreatment}
                />
            )
        }
        promptHTML.push(
            <LineContainer key={depth}>
                {lineHTML}
                {props.isTreatment && <div style={{display: "flex", alignItems: "center"}}>
                    <AddSlotButton 
                        data-depth={depth} 
                        onClick={(e) => props.createSlots(parseInt(e.target.getAttribute("data-depth")))}>
                            +
                    </AddSlotButton>
                </div>}
            </LineContainer>
        );
    }

    return (
        <Container>
            <div style={{fontSize: "20px", marginBottom: "12px"}}>Prompt</div>
            <InnerContainer>
                {promptHTML}
                <AddButton onClick={(e) => {
                    e.stopPropagation();
                    props.addPromptLine();
                }}>
                    + Add Line
                </AddButton>
            </InnerContainer>
        </Container>
    )
}

const Container = styled.div`
    padding: 24px;
    paddin-right: 16px;
    background-color: #fff;
    width: 100%;
    border-radius: 20px;
    box-shadow: 0 4px 4px rgba(0, 0, 0, 0.25);
    height: calc(100% - 92px - 64px - 128px);
`;

const InnerContainer = styled.div`
    display: flex;
    flex-direction: column;
    gap: 16px;
    height: calc(100% - 32px - 12px);
    overflow-y: scroll;
    padding-right: 8px;
    &::-webkit-scrollbar {
        width: 4px;
    }
    &::-webkit-scrollbar-thumb {
        background: #ccc;
        border-radius: 4px;
    }
    align-items: center;
`;

const AddButton = styled.button`
    background-color: rgba(0, 102, 255, 0.6);
    color: white;
    font-size: 18px;
    padding: 8px 16px;
    width: fit-content;
    border: none;
    border-radius: 8px;
`;

const LineContainer = styled.div`
    display: flex;
    flex-direction: row;
    gap: 4px;
    width: 100%;
`;

const AddSlotButton = styled.button`
    display: flex;
    background-color: rgba(0, 102, 255, 0.6);
    color: white;
    font-size: 24px;
    border: none;
    border-radius: 4px;
    font-weight: bold;
    height: 32px;
    width: 32px;
    line-height: 24px;
    justify-content: center;
`;

export default PromptEditor;