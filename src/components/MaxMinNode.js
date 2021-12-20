import React, { useEffect, useState } from 'react';
import styled from "styled-components";

function MaxMinNode(props) {
    function handleClick() {
        props.handleMaxMinimize(props.nodeId);
    }

    return (
        <MaxMinBtn attr={{depth: props.depth}} onClick={handleClick}>
            {props.isMinimized ? "+" : "-"}
        </MaxMinBtn>
    )
}

const MaxMinBtn = styled.div`
    width: calc(100% - ${props => props.attr.depth * 40}px);
    height: 20px;
    border-radius: 4px;
    background-color: #f5f5f5;
    margin-left: ${props => props.attr.depth*40 + "px"};
    text-align: center;
    cursor: pointer;
`;

export default MaxMinNode;