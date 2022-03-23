import React, { useState, useEffect, useRef } from 'react';
import styled from "styled-components";

import PromptLine from './PromptLine';

function PromptEditor(props) {
    function handleLineChange(value, depth, index) {
        props.changeSlots(value, depth, index);
    }

    return (
        <Container>
            <div style={{fontSize: "20px", marginBottom: "12px"}}>Prompt</div>
            <InnerContainer>
                {props.currPath.map((index, depth) => (
                    <PromptLine 
                        key={`${depth}-${index}`} depth={depth} index={index}
                        value={props.slots[depth][index]} 
                        currPath={props.currPath} slots={props.slots}
                        handleChangeLine={handleLineChange} changePath={props.changePath}
                    />
                ))}
            </InnerContainer>
        </Container>
    )
}

const Container = styled.div`
    margin-left: 120px;
    margin-top: 60px;
    padding: 32px;
    padding-right: 16px;
    background-color: #fff;
    width: 30%;
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
    padding-right: 16px;
    &::-webkit-scrollbar {
        width: 4px;
    }
    &::-webkit-scrollbar-thumb {
        background: #ccc;
        border-radius: 4px;
    }
`;

export default PromptEditor;