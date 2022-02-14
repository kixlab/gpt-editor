import React, { useState, useEffect, useRef } from 'react';
import styled from "styled-components";

import ContentEditable from 'react-contenteditable';
import CaretPositioning from './EditCaretPositioning'

const colors = [
    '#ffd3ad', '#ddb6c0', '#b2e4f7', '#96e5ac', '#d3aaeb', '#b8b8eb', '#afc3e9', '#9feb87'
];

function NodeArea(props) {
    const containerRef = useRef(null);
    const keyTimer = useRef(null);

    const [spans, setSpans] = useState([]);
    const [placeholderSpans, setPlaceholderSpans] = useState([]);
    const [caretPosition, setCaretPosition] = useState({start: 0, end: 0});
    const [keyPressed, setKeyPressed] = useState(null);
    const [isAltSpan, setIsAltSpan] = useState([]);

    useEffect(() => {     
        if(props.sentenceIds.length == spans.length) return;

        console.log("hey");

        var newSpans = [];
        for(var i = 0; i < props.sentenceIds.length; i++) {
            var sentenceId = props.sentenceIds[i];
            var color = colors[sentenceId % colors.length];
            var sentence = props.sentencesText[sentenceId];

            newSpans.push(
                `<span sentenceidx="${i}" style="${!sentence.isEdited ? `background-color: ${color}` : ""}">${sentence.text}</span>`
            )
        }

        setSpans(newSpans);
        setPlaceholderSpans([]);
    }, [props.sentenceIds, props.sentencesText]);

    useEffect(() => {
        if(props.isAlt) {
            setIsAltSpan([`<span></span>`]);
        } else {
            setIsAltSpan([]);
        }
    }, [props.isAlt]);

    useEffect(() => {
        if(props.isFocused) containerRef.current.focus();
    }, [props.isFocused])

    useEffect(() => {
        CaretPositioning.restoreSelection(document.getElementById("editable-" + props.nodeId), caretPosition);
    }, [caretPosition])

    useEffect(() => {
        if(keyPressed != null) {
            keyTimer.current = setTimeout(() => {
                placeholderGenerate(keyPressed.count + 1);
                setKeyPressed({
                    key: keyPressed.key,
                    count: keyPressed.count + 1
                });
            }, 1000);
        } else {
            clearTimeout(keyTimer.current);
        }
    }, [keyPressed]);

    function handleChange(e) {
        //save caret position(s), so can restore when component reloads
        let savedCaretPosition = CaretPositioning.saveSelection(e.currentTarget);

        var sentenceNodes = e.currentTarget.childNodes;
        var sentences = props.sentenceIds.map(id => props.sentencesText[id]);
        var changedIdxList = [];
        var changedTextList = [];
        var deletedIdxList = [];

        for(var i = 0; i < sentences.length; i++) {
            var node = sentenceNodes[i - deletedIdxList.length];
            if(node == undefined || node.textContent == "" || parseInt(node.getAttribute("sentenceidx")) != i) {
                deletedIdxList.push(i);
                continue;
            }
            if(node.innerHTML === sentences[i].text) {
                continue;
            }
            changedIdxList.push(i);
            changedTextList.push(node.innerText);
        }

        if(changedIdxList.length != 0) {
            props.handleEditNode(props.nodeId, changedIdxList, changedTextList, deletedIdxList);
        }

        var newSpans = [...spans];
        for(i = 0; i < changedIdxList.length; i++) {
            newSpans[changedIdxList[i]] = `<span sentenceidx=${changedIdxList[i]}>${changedTextList[i]}</span>`
        }

        setSpans(newSpans);
        setCaretPosition(savedCaretPosition);
    }

    function handleKeyDown(e) {
        console.log(e.code, props.isAlt)
        if(props.isAlt) {
            if (e.code === "Enter" && keyPressed == null) {
                placeholderGenerate(0);
                setKeyPressed({key: e.key, count: 0});
            } else if (e.code === "Backspace") {
                props.handleDelete(props.nodeId);
            }
        }
    }

    function handleKeyUp(e) {
        if(keyPressed != null && e.code === "Enter") {
            props.handleGenerate(props.nodeId, keyPressed.count, false);
            setKeyPressed(null);
        }
    }

    function placeholderWord() {
        return " " + "\u00a0".repeat(Math.floor(Math.random() * 4) + 3);  
    }

    function placeholderGenerate(count) {
        const nextSentenceId = parseInt(Object.keys(props.sentencesText).at(-1)) + 1;
        var newSpans = [...placeholderSpans];
        var placeholder = placeholderWord();
        if(count > 0) {
            placeholder += placeholderWord().repeat(Math.floor(Math.random() * 8) + 12) + ".";
        }

        newSpans.push(
            `<span key="${count + "-" + nextSentenceId}" style="${`background-color: ${colors[nextSentenceId % colors.length]}`}">${placeholder}</span>`
        )
        
        setPlaceholderSpans(newSpans);
    }

    return (
        <ContentEditable 
            id={"editable-" + props.nodeId}
            innerRef={containerRef}
            style={ContainerStyle}
            html={[...spans, ...isAltSpan, ...placeholderSpans].join("")}
            onKeyDown={handleKeyDown}
            onKeyUp={handleKeyUp}
            onFocus={() => props.handleFocus(props.nodeId, 0)}
            onChange={handleChange}
        />
    )

}

const ContainerStyle = {
    flex: "0 0 400px",
    height: "100%",
    padding: "8px",
    border: "solid 1px #ccc",
    borderRadius: "12px",
}
const TextContainer = styled.div`
    flex: 0 0 400px;
    height: 100%;
    padding: 8px;
    border: solid 1px #ccc;
    border-radius: 12px;
`;

export default NodeArea;