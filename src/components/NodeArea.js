import React, { useState, useEffect, useRef } from 'react';
import styled from "styled-components";

import CaretPositioning from './EditCaretPositioning'

const colors = [
    '#ffd3ad', '#ddb6c0', '#b2e4f7', '#96e5ac', '#d3aaeb', '#e5ccdf', '#b8b8eb', '#afc3e9', '#9feb87'
];

function NodeArea(props) {
    const containerRef = useRef(null);
    const keyTimer = useRef(null);

    const [spans, setSpans] = useState([]);
    const [caretPosition, setCaretPosition] = useState({start: 0, end: 0});
    const [keyPressed, setKeyPressed] = useState(null);

    useEffect(() => {
        if(props.sentenceIds.length == spans.length) return;

        var newSpans = [];
        for(var i = 0; i < props.sentenceIds.length; i++) {
            var sentenceId = props.sentenceIds[i];
            var color = colors[sentenceId % colors.length];
            var sentence = props.sentencesText[sentenceId];

            newSpans.push(
                <span key={i} style={!sentence.isEdited ? {backgroundColor: color} : {}}>{sentence.text}</span>
            )
        }

        setSpans(newSpans);
    }, [props.sentenceIds, props.sentencesText]);

    useEffect(() => {
        if(props.isFocused) containerRef.current.focus();
    }, [props.isFocused])

    useEffect(() => {
        CaretPositioning.restoreSelection(document.getElementById("editable"), caretPosition);
    }, [caretPosition])

    useEffect(() => {
        if(keyPressed != null) {
            keyTimer.current = setTimeout(() => {
                console.log(keyPressed.count);
                setKeyPressed({
                    key: keyPressed.key,
                    count: keyPressed.count + 1
                });
                placeholderGenerate(keyPressed.count + 1);
            }, 1000);
        } else {
            clearTimeout(keyTimer.current);
        }
    }, [keyPressed]);

    function handleChange(e) {
        console.log("change");
        let targetValue =  e.currentTarget.textContent;
        //save caret position(s), so can restore when component reloads
        let savedCaretPosition = CaretPositioning.saveSelection(e.currentTarget);

        var sentenceNodes = e.currentTarget.childNodes;
        var sentences = props.sentenceIds.map(id => props.sentencesText[id]);
        var changedIdx = -1;
        var changedText = "";
        for(var i = 0; i < sentenceNodes.length; i++) {
            if(sentenceNodes[i].innerHTML === sentences[i].text) continue;
            changedIdx = i;
            changedText = sentenceNodes[i].innerText;
        }
        if(changedIdx != -1) props.handleEditNode(props.nodeId, changedIdx, changedText);

        var newSpans = [...spans];
        newSpans[changedIdx] = <span key={changedIdx}>{changedText}</span>
        setSpans(newSpans);
        setCaretPosition(savedCaretPosition);
    }

    function handleKeyDown(e) {
        if(props.isAlt) {
            if (e.key === "Enter" && keyPressed == null) {
                setKeyPressed({key: e.key, count: 0});
                //props.handleGenerate(props.nodeId, false);
            } else if (e.key === "Backspace") {
                props.handleDelete(props.nodeId);
            }
        }
    }

    function handleKeyUp(e) {
        if(keyPressed != null && e.key === "Enter") {
            setKeyPressed(null);
        }
    }

    function placeholderWord() {
        return " " + "_".repeat(Math.floor(Math.random() * 4) + 3);  
    }

    function placeholderGenerate(count) {
        const nextSentenceId = parseInt(Object.keys(props.sentencesText).at(-1)) + count;
        var newSpans = [...spans];
        var placeholder = placeholderWord();
        if(count > 0) {
            placeholder += placeholderWord().repeat(Math.floor(Math.random() * 10) + 16) + ".";
        }

        newSpans.push(
            <span key={nextSentenceId} style={{backgroundColor: colors[nextSentenceId % colors.length]}}>{placeholder}</span>
        )
        
        setSpans(newSpans);
    }

    return (
        <TextContainer 
            id="editable"
            ref={containerRef} 
            onKeyDown={handleKeyDown}
            onKeyUp={handleKeyUp}
            onFocus={() => props.handleFocus(props.nodeId, 0)}
            onInput={handleChange}
            contentEditable={true}
            suppressContentEditableWarning={true}
        >
            {spans}
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