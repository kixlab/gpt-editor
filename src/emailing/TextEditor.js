import React, { useEffect, useState, useCallback } from 'react';
import styled from "styled-components";

import { createEditor, Transforms, Editor, Element as SlateElement, Text } from 'slate'
import { Slate, Editable, withReact, ReactEditor } from 'slate-react'

function TextEditor(props) {
    const [editor] = useState(() => withReact(createEditor()));

    const [value, setValue] = useState([{
        type: 'paragraph',
        children: [{ text: '' }]
    }]);

    const renderLeaf = useCallback(props => {
        return <Leaf {...props} />
    }, [])


    const valueToText = (value) => {
        var text = "";
        for(var i = 0; i < value[0].children.length; i++) {
            var child = value[0].children[i];
            if(child.text !== undefined && child.color === undefined ) {
                text += child.text;
            }
        }
        return text;
    }

    const handleChange = (newValue) => {
        props.handleTextChange(valueToText(newValue));
        setValue(newValue);
    }

    useEffect(() => {
        console.log(props.addGeneration)
        if(props.addGeneration === null) return;

        if(value[0].children.length > editor.selection.focus.path[1] + 1) {
            Transforms.removeNodes(
                editor,
                { 
                    at: [ 0, editor.selection.focus.path[1] + 1 ],
                    match: n => Text.isText(n) && n.color 
                }
            )
        }
        Transforms.insertNodes(
            editor,
            props.addGeneration.isPermanent ?
                { text: props.addGeneration.text } :    
                { text: props.addGeneration.text, color: "#0066FF" }
            ,
            { at: [ 0, editor.selection.focus.path[1] + 1 ]}
        )
    }, [props.addGeneration]);

    return (
        <EditorCont>
            <Slate
                editor={editor}
                value={value}
                onChange={handleChange}
            >
                <Editable
                    className="email-editor"
                    renderLeaf={renderLeaf}
                    placeholder="Enter your email content here..."
                    onKeyDown={event => {
                        if (event.key === 'Enter') {
                            event.preventDefault();
                            editor.insertText('\n');
                        }
                    }}
                    onFocus={event => {
                        Transforms.setNodes(
                            editor,
                            { highlight: null },
                            { at: [], match: n => Text.isText(n) && n.highlight, mode: "all" }
                        )
                    }}
                    onBlur={event => {
                        Transforms.setNodes(
                            editor,
                            { highlight: true },
                            { match: n => {
                                var isMatch = Text.isText(n) && n.text !== "";
                                props.setSelectedText(n.text);
                                return isMatch;
                            }, split: true }
                        )
                    }}
                />
            </Slate>
        </EditorCont>
    )
}

const Leaf = props => {
    console.log(props);
    return (
        <span
            {...props.attributes}
            className="email-text"
            style={{ 
                backgroundColor: props.leaf.highlight ? '#0066FF33' : 'none',
                color: props.leaf.color ? props.leaf.color : "#333"
            }}
        >
            {props.children}
        </span>
    )
}

const EditorCont = styled.div`
    width: 40%;
    height: calc(100% - 240px);
    padding: 32px;
    padding-right: 16px;
    margin: 120px 0;
    color: #333;
    font-size: 18px;
    border: none;
    box-shadow: 0 8px 8px rgba(0, 0, 0, 0.25);
    background-color: #fff;
`;


export default TextEditor;
