import React from 'react';
import styled from "styled-components";

import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import Form from 'react-bootstrap/Form';

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faThumbtack } from '@fortawesome/free-solid-svg-icons'

const pinColors = ["#FFB30F", "#C1292E", "#5F0A87"];

function Editor(props) {
    return (
        <>
            <Row>
                <Form>
                    <Form.Group className="mb-3" controlId="exampleForm.ControlTextarea1">
                        <Form.Label>Hovered On Text</Form.Label>
                        <Form.Control as="textarea" rows={10} value={props.selectedText}/>
                    </Form.Group>
                </Form>
            </Row>
            <Row>
                <Col>
                <Form style={{position: "relative", paddingTop: "12px"}}>
                    <PinBtn attr={{pinIdx: 0}}>
                        <FontAwesomeIcon icon={faThumbtack}/>
                    </PinBtn>
                    <Form.Group className="mb-3" controlId="exampleForm.ControlTextarea1">
                        <Form.Control as="textarea" rows={15} value={props.pinnedText[0]}/>
                    </Form.Group>
                </Form>
                </Col>
                <Col>
                <Form style={{position: "relative", paddingTop: "12px"}}>
                    <PinBtn attr={{pinIdx: 1}}>
                        <FontAwesomeIcon icon={faThumbtack}/>
                    </PinBtn>
                    <Form.Group className="mb-3" controlId="exampleForm.ControlTextarea1">
                        <Form.Control as="textarea" rows={15} value={props.pinnedText[1]}/>
                    </Form.Group>
                </Form>
                </Col>
            </Row>
        </>
    );
}

const PinBtn = styled.div`
    position: absolute;
    background-color: ${props => pinColors[props.attr.pinIdx]};
    color: white;
    width: 30px;
    height: 30px;
    font-size: 18px;
    top: 0px;
    border-radius: 50%;
    left: -12px;
    display: flex;
    justify-content: center;
    align-items: center;
`;

export default Editor;