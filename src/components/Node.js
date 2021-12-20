import React, { useEffect, useState } from 'react';
import styled from "styled-components";

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faMagic } from '@fortawesome/free-solid-svg-icons'

function Node(props) {
    const [nodeText, setNodeText] = useState(props.text);
    const [isHovered, setIsHovered] = useState(false);
    const [isEdit, setIsEdit] = useState(false);

    function handleGenerate() {
        props.handleGenerate(props.nodeId);
    }

    function handleClick(e) {
        if(e.detail == 2) {
            console.log("double click");
            setIsEdit(true);
        }
    }
    
    function handleHover() {
        setIsHovered(true);
        props.onNodeHover(props.nodeId);
    }

    function handleNotHover() {
        setIsHovered(false);
    }

    function handleKeyDown(e) {
        if (e.key === "Enter") {
            setIsEdit(false);
            setNodeText(e.currentTarget.textContent);
            props.handleEdit(props.nodeId, e.currentTarget.textContent);
        }
    }

    function handleBlur(e) {
        setIsEdit(false);
        setNodeText(e.currentTarget.textContent);
        props.handleEdit(props.nodeId, e.currentTarget.textContent);
    }


    return (
        <div style={{position: "relative"}} onMouseEnter={handleHover} onMouseLeave={handleNotHover}>
            <NodeCont attr={{depth: props.depth, isBordered: props.isBordered, isHovered: isHovered, isEdit: isEdit}}
                contentEditable={isEdit} onClick={handleClick} onKeyDown={handleKeyDown}
                onBlur={handleBlur}>
                {nodeText}
            </NodeCont>
            { !isHovered ? "" : 
                <GenerateBtn onClick={handleGenerate}>
                    <FontAwesomeIcon icon={faMagic} color="white"/>
                </GenerateBtn>
            }
        </div>
    )
}


const NodeCont = styled.div`
    display: inline-block;
    cursor: ${props => props.attr.isEdit ? "auto" : "default"};
    font-size: 14px;
    width: calc(100% - ${props => props.attr.depth*40 + "px"});
    padding: 6px 12px;
    padding-right: ${props => props.attr.isHovered ? "40px" : "16px"};
    border-radius: 4px;
    background-color: ${props => props.attr.isEdit ? "#fff" : "#eee"};
    margin: 4px 0px;
    margin-left: ${props => props.attr.depth*40 + "px"};
    border: solid 2px ${props => props.attr.isBordered ? "#0179be" : "#eee"};
`;

const NodeInput = styled.textarea`
    display: inline-block;
    font-size: 14px;
    width: calc(100% - ${props => props.attr.depth*40 + "px"});
    padding: 6px 12px;
    padding-right: ${props => props.attr.isHovered ? "40px" : "16px"};
    border-radius: 4px;
    background-color: #fff;
    margin: 4px 0px;
    margin-left: ${props => props.attr.depth*40 + "px"};
    border: solid 2px ${props => props.attr.isBordered ? "#0179be" : "#eee"};
`;

const GenerateBtn = styled.div`
    position: absolute;
    background-color: #0179be;
    width: 40px;
    top: 4px;
    right: 0px;
    z-index: 2;
    height: calc(100% - 8px);
    border-radius: 4px;
    cursor: pointer;
    display: flex;
    justify-content: center;
    align-items: center;
`;

export default Node;