import React from 'react';

import Form from 'react-bootstrap/Form';

function Editor(props) {
    return (
        <Form>
            <Form.Group className="mb-3" controlId="exampleForm.ControlTextarea1">
                <Form.Label>Example textarea</Form.Label>
                <Form.Control as="textarea" rows={10} value={props.selectedText}/>
            </Form.Group>
        </Form>
    );
}

export default Editor;