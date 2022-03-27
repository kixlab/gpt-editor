import { listClasses } from '@mui/material';
import React, { useState } from 'react';
import styled from "styled-components";

function HoverLens(props) {
    if(props.selected.type !== 'lens') return "";
    var currLens = props.lenses[props.selected.data];

    var textElements = document.getElementsByClassName('email-text');
    var positions = textElements[textElements.length - 1].getBoundingClientRect();
    for (var i = 0; i < textElements.length; i++) {
        if (textElements[i].style.backgroundColor !== '') {
            positions = textElements[i].getBoundingClientRect();
            break;
        }
    }

    var top = positions.top + positions.height + 8;
    var left = positions.left;

    var editorElement = document.getElementsByClassName('email-editor')[0];
    var editorPos = editorElement.getBoundingClientRect();

    var maxLeft = editorPos.left + editorPos.width + 32;
    if (left + 260 > maxLeft) {
        left = maxLeft - 260;
    }

    function handleClick(e) {
        e.stopPropagation();
        if(e.target.getAttribute('data-idx') === null) return;
        var index = parseInt(e.target.getAttribute('data-idx'))
        var genText = currLens.generations[index].text;
        props.showGeneration(genText, true);
    }

    function drawContent() {
        switch(currLens.type) {
            case 'list':
                return (
                    <ListContent>
                        {currLens.generations.map((generation, index) => {
                            return (
                                <ListItem key={index} data-idx={index}>
                                    {generation.text}
                                </ListItem>
                            )
                        })}
                    </ListContent>
                )
            case 'axis':
                return (
                    <svg width="100%" height="100%">
                        <circle cx="10" cy="10" r="4" fill="red" />
                    </svg>
                )
            case 'space':
                return (
                    <svg width="100%" height="100%">
                        <circle cx="10" cy="10" r="4" fill="red" />
                    </svg>
                )
        }
    }
    
    return (
        <LensContainer style={{ top: top + "px", left: left + "px" }} onClick={handleClick}>
            {drawContent()}
        </LensContainer>
    )
}

const LensContainer = styled.div`
    position: absolute;
    height: 260px;
    width: 260px;
    background-color: #fff;
    border-radius: 8px;
    border: solid 2px #0066FF;
    box-shadow: 4px 4px 8px rgba(0, 0, 0, 0.25);
`;

const ListContent = styled.div`
    display: flex;
    flex-direction: column;
    gap: 10px;
    font-size: 14px;
    padding: 0px 6px;
    margin: 12px 6px;
    overflow-y: scroll;
    height: calc(100% - 24px);
    &::-webkit-scrollbar {
        width: 4px;
    }
    &::-webkit-scrollbar-thumb {
        background: #ccc;
        border-radius: 4px;
    }
`;

const ListItem = styled.div`
    padding: 4px 8px;
    border-radius: 8px;
    border: solid 1px #ccc;
    cursor: pointer;
    &:hover {
        background-color: #0066FF33;
        border: solid 2px #0066FF66;
    }
`;

export default HoverLens;