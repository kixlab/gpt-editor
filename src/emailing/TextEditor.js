import React, { useEffect, useState } from 'react';
import styled from "styled-components";

function TextEditor(props) {
    const [currValue, setCurrValue] = useState(props.text);

    useEffect(() => {
        if(props.text === currValue) return;
        setCurrValue(props.text);
    }, [props.text]);

    function handleChange(e) {
        setCurrValue(e.target.value);
        props.setText(e.target.value);
    }

    return (
        <Editor placeholder="Type your email's content..." value={currValue} onChange={handleChange}/>
    )
}

const Editor = styled.textarea`
    width: 40%;
    height: calc(100% - 240px);
    padding: 32px;
    margin: 120px 0;
    color: #333;
    font-size: 18px;
    outline: none !important;
    border: none;
    resize: none;
    overflow-y: scroll;
    box-shadow: 0 8px 8px rgba(0, 0, 0, 0.25);
    &::-webkit-scrollbar {
        width: 4px;
    }
    &::-webkit-scrollbar-thumb {
        background: #ccc;
        border-radius: 4px;
    }
`;


export default TextEditor;
