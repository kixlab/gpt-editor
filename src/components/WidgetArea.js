import React, { useState, useRef } from 'react';
import styled from "styled-components";

function WidgetArea(props) {
    return (
        <Container>
            <button onClick={props.changePath}> click </button>
        </Container>
    )
}

const Container = styled.div`
`;

export default WidgetArea;