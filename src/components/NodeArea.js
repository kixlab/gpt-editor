import React, { useState, useEffect, useRef } from 'react';
import styled from "styled-components";

const colors = [
    '#ffd3ad', '#ddb6c0', '#b2e4f7', '#96e5ac', '#d3aaeb', '#e5ccdf', '#b8b8eb', '#afc3e9', '#9feb87'
];

function NodeArea(props) {
    const containerRef = useRef(null);

    useEffect(() => {
        if(props.isFocused) containerRef.current.focus();
    }, [props.isFocused])

    function handleKeyDown(e) {
        if(props.isAlt) {
            if (e.key === "Enter") {
                props.handleGenerate(props.nodeId, false);
            } else if (e.key === "Backspace") {
                props.handleDelete(props.nodeId);
            }
        }
    }

    function handleChange(e) {
        var sentenceNodes = e.currentTarget.childNodes;
        var sentences = props.sentenceIds.map(id => props.sentencesText[id]);
        var changedIdx = -1;
        var changedText = "";
        for(var i = 0; i < sentenceNodes.length; i++) {
            if(sentenceNodes[i].innerHTML === sentences[i].text) continue;
            changedIdx = i;
            changedText = sentenceNodes[i].innerHTML;
        }
        if(changedIdx != -1) props.handleEditNode(props.nodeId, changedIdx, changedText);
    }

    var textHTML = [];
    for(var i = 0; i < props.sentenceIds.length; i++) {
        var sentenceId = props.sentenceIds[i];
        var color = colors[sentenceId % colors.length];
        var sentence = props.sentencesText[sentenceId];

        textHTML.push(
            <span style={!sentence.isEdited ? {backgroundColor: color} : {}}>{sentence.text}</span>
        )
    }

    return (
        <TextContainer 
            ref={containerRef} 
            onKeyDown={handleKeyDown}
            onFocus={() => props.handleFocus(props.nodeId, 0)}
            onInput={handleChange}
            contentEditable
        >
            {textHTML}
        </TextContainer>
    )

}

const TextContainer = styled.div`
    flex: 0 0 400px;
    height: 100%;
    padding: 8px;
    border: solid 1px #ccc;
    border-radius: 12px;
`;

export default NodeArea;