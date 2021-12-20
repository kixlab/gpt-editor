import React, { useEffect, useState } from 'react';
import styled from "styled-components";

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faMagic, faChevronUp, faThumbtack } from '@fortawesome/free-solid-svg-icons'

const pinColors = ["#FFB30F", "#C1292E", "#5F0A87"];

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

    function handleMinimize() {
        props.handleMaxMinimize(props.nodeId);
    }

    function handleClickPin(e) {
        props.handleNodePin(e.currentTarget.getAttribute("data"), props.nodeId);
    }

    var pins = [];
    if(isHovered) {
        for(var i = 0; i < 2; i++) {            
            pins.push(
                <PinBtn attr={{depth: props.depth, pinIdx: i}} data={i} onClick={handleClickPin}>
                    <FontAwesomeIcon icon={faThumbtack}/>
                </PinBtn>
            );
        }
    }

    return (
        <div id={"node-" + props.nodeId} key={"node-" + props.nodeId} 
            style={{position: "relative"}} onMouseEnter={handleHover} onMouseLeave={handleNotHover}>
            <MinimizeBtn attr={{depth: props.depth}} onClick={handleMinimize}>
                <FontAwesomeIcon icon={faChevronUp}/>
            </MinimizeBtn>
            {pins}
            <NodeCont
                attr={{depth: props.depth, isBordered: props.isBordered, isHovered: isHovered, isEdit: isEdit, isNew: props.isNew, pinIdx: props.pinIdx}}
                contentEditable={isEdit} onClick={handleClick} onKeyDown={handleKeyDown}
                onBlur={handleBlur}>
                {nodeText}
            </NodeCont>
            { !isHovered || isEdit ? "" : 
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
    padding-right: 32px;
    padding-left: 32px;
    border-radius: 4px;
    background-color: ${props => props.attr.isEdit ? "#fff" : (props.attr.pinIdx != -1 ? pinColors[props.attr.pinIdx]+"30" : "#eee") };
    font-weight: ${props => props.attr.isNew ? "bold" : "normal"};
    margin: 2px 0px;
    margin-left: ${props => props.attr.depth*40 + "px"};
    border: solid 2px ${props => props.attr.isBordered ? "#0179be" : "#fff"};
`;

// border: solid 2px ${props => props.attr.pinIdx != -1 ? pinColors[props.attr.pinIdx] : (props.attr.isBordered ? "#0179be" : "#fff")};

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
    width: 32px;
    top: 4px;
    right: 0px;
    z-index: 2;
    height: calc(100% - 8px);
    border: solid 2px #0179be;
    border-radius: 0 4px 4px 0;
    cursor: pointer;
    display: flex;
    justify-content: center;
    align-items: center;
`;

const MinimizeBtn = styled.div`
    position: absolute;
    background-color: #ccc;
    color: #999;
    width: 20px;
    top: 4px;
    left: ${props => props.attr.depth*40 + 2}px;
    z-index: 2;
    height: calc(100% - 8px);
    border-radius: 2px 0 0 2px;
    cursor: pointer;
    display: flex;
    justify-content: center;
    align-items: center;
`;

const PinBtn = styled.div`
    position: absolute;
    background-color: ${props => pinColors[props.attr.pinIdx]};
    color: white;
    width: 20px;
    height: 20px;
    font-size: 12px;
    top: -4px;
    border-radius: 50%;
    left: ${props => props.attr.depth*40 + 2 + (props.attr.pinIdx+1)*28}px;
    cursor: pointer;
    display: flex;
    justify-content: center;
    align-items: center;
`;


export default Node;