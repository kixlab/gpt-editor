import React, { useState, useMemo, useEffect, useRef } from 'react';
import styled from "styled-components";

import CaretPositioning from './EditCaretPositioning'

import { createEditor, Transforms, Editor, Element as SlateElement } from 'slate'
import { Slate, Editable, withReact } from 'slate-react'

const colors = [
    '#ffd3ad', '#ddb6c0', '#b2e4f7', '#96e5ac', '#d3aaeb', '#b8b8eb', '#afc3e9', '#9feb87'
];

const isSpan = editor => {
    const [span] = Editor.nodes(editor, {
        match: n => !Editor.isEditor(n) && SlateElement.isElement(n) && n.type === 'span'
    });
    return !!span;
}

function NodeArea(props) {
    const withInlines = editor => {
        const { insertText, isInline } = editor
      
        editor.isInline = element =>
          ['span'].includes(element.type) || isInline(element)
        
        editor.insertText = text => {
            if(isSpan(editor)) {
                Transforms.setNodes(
                    editor,
                    { style: {}, isEdited: true },
                    { match: n => !Editor.isEditor(n) && SlateElement.isElement(n) &&  n.style !== undefined && n.style.backgroundColor !== undefined }
                )
                insertText(text);
            } else {
                const { selection } = editor;

                if(selection.anchor.path[1]  === 0) {
                    Transforms.insertText(
                        editor,
                        text,
                        { at: { path: [0, 1, 0], offset: 0}}
                    )
                    Transforms.setNodes(
                        editor,
                        { style: {}, isEdited: true },
                        { at: [0, 1] }
                    )
                } else {
                    var { children } = editor;
                    var lastSpanLocation = children[0].children.length - 1 - 1;
                    console.log(children, lastSpanLocation);
                    var lastSpan = children[0].children[lastSpanLocation];
                    var isEdited = lastSpan.isEdited;
                    var newSpanIdx = lastSpan.sentenceidx + 1;
                    if(isEdited) {
                        Transforms.insertText(
                            editor,
                            text, 
                            { at: { path: [0, lastSpanLocation, 0], offset: lastSpan.children[0].text.length}}
                        )
                    } else {
                        Transforms.insertNodes(
                            editor,
                            { type: 'span', children: [{ text: text }], sentenceidx: newSpanIdx, style: {}, isEdited: true },
                            { at: selection.anchor.path }
                        )
                    }
                }
            }
        }
    
        return editor;
    }

    const editor = useMemo(() => withInlines(withReact(createEditor())), []);
    const [value, setValue] = useState([
        {
            type: 'paragraph',
            children: [
                {text: ''}
            ]
        }
    ]);

    useEffect(() => { 
        if(props.sentenceIds.length > (value[0].children.length - 1)/2) {
            var nodesToInsert = [];
            for(var i = (value[0].children.length - 1)/2; i < props.sentenceIds.length; i++) {
                var sentenceId = props.sentenceIds[i];
                var color = colors[sentenceId % colors.length];
                var sentence = props.sentencesText[sentenceId];
                nodesToInsert.push(
                    {
                        type: 'span',
                        children: [{ text: sentence.text }],
                        style: sentence.isEdited ? {} : {backgroundColor: color},
                        isEdited: sentence.isEdited,
                        sentenceidx: i
                    }
                );
            }
            Transforms.insertNodes(
                editor,
                nodesToInsert,
                {at: [0, value[0].children.length - 1]}
            )   
        }
    }, [props.sentenceIds, props.sentencesText]);

    function valueToText(value) {
        var text = "";
        for(var i = 0; i < value[0].children.length; i++) {
            var child = value[0].children[i];
            if(child.type === 'span') {
                text += child.children[0].text;
            }
        }
        return text;
    }

    function handleChange(newValue) {
        if(valueToText(value) === valueToText(newValue)) return;
        console.log(newValue);
        setValue(newValue);

        var children = [...newValue[0].children];
        
        // check changes in spans
        var changedIdxList = [];
        var changedTextList = [];
        var deletedTextList = [];
        for(var i = 0; i < props.sentenceIds.length; i++) {
            var sentenceId = props.sentenceIds[i];
            var sentence = props.sentencesText[sentenceId];
            var span = children[(i - deletedTextList.length)*2 + 1];
            
            if(span === undefined || i != span.sentenceidx) {
                deletedTextList.push(i);
                continue;
            }

            var text = span.children[0].text;
            if(text !== sentence.text) {
                changedIdxList.push(i);
                changedTextList.push(text);
                continue;
            }
        }

        if((children.length - 1)/2 > props.sentenceIds.length) {
            var addedText = children[children.length - 1 - 1].children[0].text;
            changedIdxList.push(props.sentenceIds.length);
            changedTextList.push(addedText);
        }

        if(deletedTextList.length > 0) {
            for(i = deletedTextList[0]; i < props.sentenceIds.length - deletedTextList.length; i++) {
                Transforms.setNodes(
                    editor,
                    { sentenceidx: i},
                    { at: [0, i*2 + 1] }
                )
            }
        }

        if(changedIdxList.length > 0 || deletedTextList.length > 0) {
            props.handleEditNode(props.nodeId, changedIdxList, changedTextList, deletedTextList);
        }

        return;
    }

    function handleKeyDown(e) {
        if(e.key === "Enter") {
            e.preventDefault();
            props.handleGenerate(props.nodeId, 1, false);
        }
        console.log(e.key);
    }

    function handleKeyUp(e) {
        e.preventDefault();
        console.log(e.key);
    }

    return (
        <Slate 
            editor={editor}
            value={value}
            onChange={handleChange}
        >
            <Editable 
                id={"editable-" + props.nodeId}
                style={ContainerStyle}
                renderElement={props => <Element {...props} />}
                renderLeaf={props => <Text {...props} />}
                onKeyDown={handleKeyDown}
                onKeyUp={handleKeyUp}
            />
        </Slate>
    )
}

const Element = props => {
    const { attributes, children, element } = props;
    switch (element.type) {
      case 'span':
        return <SpanElement {...props} />
      default:
        return <p sentenceidx={element.sentenceidx} {...attributes}>{children}</p>
    }
};

// Put this at the start and end of an inline component to work around this Chromium bug:
// https://bugs.chromium.org/p/chromium/issues/detail?id=1249405
const InlineChromiumBugfix = () => (
    <span
      contentEditable={false}
      style={{fontSize: 0}}
    >
      ${String.fromCodePoint(160) /* Non-breaking space */}
    </span>
  )

const SpanElement = props => {
    return (
        <span style={props.element.style} sentenceidx={props.element.sentenceidx} {...props.attributes}>
            <InlineChromiumBugfix/>
            {props.children}
            <InlineChromiumBugfix/>
        </span>
    )
}

const Text = props => {
    const { attributes, children, leaf } = props
    return (
      <span
        // The following is a workaround for a Chromium bug where,
        // if you have an inline at the end of a block,
        // clicking the end of a block puts the cursor inside the inline
        // instead of inside the final {text: ''} node
        // https://github.com/ianstormtaylor/slate/issues/4704#issuecomment-1006696364
        style={
          leaf.text === ''
            ? {paddingLeft: "0.1px"}
            : null
        }
        {...attributes}
      >
        {children}
      </span>
    )
  }

const ContainerStyle = {
    flex: "0 0 400px",
    height: "100%",
    padding: "8px",
    border: "solid 1px #ccc",
    borderRadius: "12px",
}

export default NodeArea;