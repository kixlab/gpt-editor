import React from 'react';
import styled from "styled-components";

import Form from 'react-bootstrap/Form';

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faThumbtack } from '@fortawesome/free-solid-svg-icons'

const pinColors = ["#FFB30F", "#C1292E", "#5F0A87"];

function Editor(props) {
    return (
        <>
            <Form>
                <Form.Group className="mb-3" controlId="exampleForm.ControlTextarea1">
                    <Form.Label>Hovered On Text</Form.Label>
                    <Form.Control as="textarea" rows={10} value={props.selectedText}/>
                </Form.Group>
            </Form>
            <Form style={{position: "relative"}}>
                <PinBtn attr={{pinIdx: 0}}>
                    <FontAwesomeIcon icon={faThumbtack}/>
                </PinBtn>
                <Form.Group className="mb-3" controlId="exampleForm.ControlTextarea1">
                    <Form.Label>Pin 1 Text</Form.Label>
                    <Form.Control as="textarea" rows={10} value={props.pinnedText[0]}/>
                </Form.Group>
            </Form>
            <Form style={{position: "relative"}}>
                <PinBtn attr={{pinIdx: 1}}>
                    <FontAwesomeIcon icon={faThumbtack}/>
                </PinBtn>
                <Form.Group className="mb-3" controlId="exampleForm.ControlTextarea1">
                    <Form.Label>Pin 2 Text</Form.Label>
                    <Form.Control as="textarea" rows={10} value={props.pinnedText[1]}/>
                </Form.Group>
            </Form>
        </>
    );
}

const PinBtn = styled.div`
    position: absolute;
    background-color: ${props => pinColors[props.attr.pinIdx]};
    color: white;
    width: 20px;
    height: 20px;
    font-size: 12px;
    top: 24px;
    border-radius: 50%;
    left: -8px;
    display: flex;
    justify-content: center;
    align-items: center;
`;

export default Editor;