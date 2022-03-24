import React, { useState, useEffect, useRef } from 'react';
import styled from "styled-components";

import PromptLine from './PromptLine';

function PromptEditor(props) {
    function handleLineChange(value, depth, index) {
        props.changeSlots(value, depth, index);
    }

    var linesHTML = "";
    if(props.hoverPath === null || props.slots.path.join(" ") === props.hoverPath.join(" ")) {
        linesHTML = props.slots.path.map((index, depth) => (
            <PromptLine 
                key={`${depth}-${index}`} depth={depth} index={index}
                value={props.slots.entries[depth][index]} slots={props.slots}
                handleLineChange={handleLineChange} changePath={props.changePath}
                selected={props.selected} setSelected={props.setSelected}
            />
        ))
    } else {
        linesHTML = props.hoverPath.map((index, depth) => (
            <PromptLine 
                key={`${depth}-${index}`} depth={depth} index={index}
                value={props.slots.entries[depth][index]} slots={props.slots}
                handleLineChange={handleLineChange} changePath={props.changePath}
                selected={props.selected} setSelected={props.setSelected}
                hoverPath={props.hoverPath} isHover={true}
            />
        ))
    }

    return (
        <Container>
            <div style={{fontSize: "20px", marginBottom: "12px"}}>Prompt</div>
            <InnerContainer>
                {linesHTML}
                <AddButton onClick={props.addPromptLine}>+ Add New</AddButton>
            </InnerContainer>
        </Container>
    )
}

const Container = styled.div`
    padding: 32px;
    padding-right: 24px;
    background-color: #fff;
    width: 100%;
    border-radius: 20px;
    box-shadow: 0 4px 4px rgba(0, 0, 0, 0.25);
    height: calc(100% - 92px - 64px - 128px);
`;

const InnerContainer = styled.div`
    display: flex;
    flex-direction: column;
    gap: 24px;
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

export default PromptEditor;