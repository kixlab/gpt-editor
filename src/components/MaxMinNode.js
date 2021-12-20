import React, { useEffect, useState } from 'react';
import styled from "styled-components";

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faChevronDown } from '@fortawesome/free-solid-svg-icons'

function MaxMinNode(props) {
    function handleClick() {
        props.handleMaxMinimize(props.nodeId);
    }

    return (
        <div id={"node-" + props.nodeId} key={"node-" + props.nodeId}>
            <MinimizeBtn attr={{depth: props.depth}}  onClick={handleClick}>
                <FontAwesomeIcon icon={faChevronDown}/>
            </MinimizeBtn>
        </div>
    );
}

const MinimizeBtn = styled.div`
    background-color: #ccc;
    color: #999;
    width: 40px;
    margin: 4px 0;
    margin-left: ${props => props.attr.depth*40 + 2}px;
    z-index: 2;
    height: 20px;
    border-radius: 4px;
    cursor: pointer;
    display: flex;
    justify-content: center;
    align-items: center;
`;


export default MaxMinNode;