import React, { useEffect, useState } from 'react';
import styled from "styled-components";

function TextEditor(props) {
    const [currValue, setCurrValue] = useState(props.text);
    const [style, setStyle] = useState({color: "#333", transition: 'all 1s ease'});

    useEffect(() => {
        if(props.text === currValue) return;
        setCurrValue(props.text);
        setStyle({color: "#0066FF", transition: "none" });
        setTimeout(() => {
            setStyle({color: "#333", transition: "all 1s ease"});
        }, 500);
    }, [props.text]);

    function handleChange(e) {
        setCurrValue(e.target.value);
        props.changeText(e.target.value);
    }

    return (
        <Editor 
            placeholder="Start typing or add a generations from below..." 
            value={currValue} onChange={handleChange}
            style={style}
        />
    )
}

const Editor = styled.textarea`
    width: 100%;
    height: calc(40% - 60px - 30px);
    margin-bottom: 30px;
    padding: 20px 32px;
    color: #333;
    font-size: 16px;
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
    transition: all 1s ease;
`;


export default TextEditor;
