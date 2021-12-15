import React, { useState } from 'react';
import axios from "axios";

import styled from "styled-components";

const NodeCont = styled.div`
    display: inline-block;
    padding: 8px 16px;
    border-radius: 4px;
    background-color: #ccc;
    margin: 4px 0px;
    cursor: pointer;
`;


export function Node(props) {
    function _handleClick() {
        props.handleClick(props.nodeId);
    }
    
    return (
        <div>
            <NodeCont style={{marginLeft: props.depth*40 + "px"}}
                onClick={_handleClick}>
                {props.text}
            </NodeCont>
        </div>
    )
}

