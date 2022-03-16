import React, { useState, useMemo, useEffect, useRef } from 'react';
import styled from "styled-components";

import { createEditor, Transforms, Editor, Element as SlateElement } from 'slate'
import { Slate, Editable, withReact, ReactEditor } from 'slate-react'

const isGPT = false;

const colors = [
    '#ffd3ad', '#ddb6c0', '#b2e4f7', '#96e5ac', '#d3aaeb', '#b8b8eb', '#afc3e9', '#9feb87'
];

const isSpan = editor => {
    const [span] = Editor.nodes(editor, {
        match: n => !Editor.isEditor(n) && SlateElement.isElement(n) && n.type === 'span'
    });
    return !!span;
}

const withInlines = editor => {
    const { insertText, insertFragment, isInline, deleteBackward, deleteForward } = editor
  
    editor.isInline = element =>
      ['span'].includes(element.type) || isInline(element)

    editor.insertText = text => {
        if(isSpan(editor)) {
            const { selection } = editor;
            insertText(text);
        } else {
            const { selection, children } = editor;

            if(selection.anchor.path[1]  === 0) {
                Transforms.insertText(
                    editor,
                    text,
                    { at: { path: [0, 1, 0], offset: 0}}
                )
            } else {
                var lastSpanLocation = children[0].children.length - 1 - 1;
                var lastSpan = children[0].children[lastSpanLocation];
                Transforms.insertText(
                    editor,
                    text, 
                    { at: { path: [0, lastSpanLocation, 0], offset: lastSpan.children[0].text.length}}
                )
            }
        }
    }

    editor.insertFragment = node => {
        var textCopied = "";
        for(var i = 0; i < node[0].children.length; i++) {
            var child = node[0].children[i];
            if(child.type === 'span')
                textCopied += child.children[0].text;
        }
        editor.insertText(textCopied);
    }

    // TODO: Prevent deleting spans

    return editor;
}

function TextEditor(props) {
    const editor = useMemo(() => withInlines(withReact(createEditor())), []);
    const [value, setValue] = useState([
        {
            type: 'paragraph',
            children: [
                {type: 'span', isLast: true, children: [{text: ''}]}
            ]
        }
    ]);

    useEffect(() => {
        var totalNodes = editor.children[0].children.length;
        for(var i = totalNodes - 1; i >= 0; i--) {
            Transforms.removeNodes(
                editor,
                { at: [0, i] }
            )
        }
        var nodesToInsert = [];
        var currentNode = props.slots;
        var currentPath = ""
        for(var i = 0; i < props.path.length; i++) {
            currentNode = currentNode.children[props.path[i]];
            currentPath += props.path[i];

            if(currentNode.type === "anchor") continue;
            
            nodesToInsert.push(
                {
                    type: 'span',
                    children: [{ text: currentNode.text }],
                    style: props.currentDepth === i ? {backgroundColor: "rgba(0, 102, 255, 0.2)"} : {},
                    path: currentPath
                }
            );
            currentPath += ","
        }
        nodesToInsert.push(
            {
                type: 'span',
                children: [{ text: "" }],
                isLast: true
            }
        )
        Transforms.insertNodes(
            editor,
            nodesToInsert,
            {at: [0, 0]}
        ) 
    }, [props.path]);

    useEffect(() => {
        for(var i = 0; i < props.path.length; i++) {
            if(i !== props.currentDepth) {
                Transforms.setNodes(
                    editor,
                    { style: {}},
                    { at: [0, i*2 + 1] }
                )
            } else {
                Transforms.setNodes(
                    editor,
                    { style: {backgroundColor: "rgba(0, 102, 255, 0.2)"}},
                    { at: [0, i*2 + 1] }
                )
            }
        }
    }, [props.currentDepth]);

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

        setValue(newValue);

        var children = [...newValue[0].children];
        
        // check changes in spans

        var changedPathList = [];
        var changedTextList = [];

        var currentNode = props.slots;
        var currentPath = [];
        for(var i = 0; i < props.path.length; i++) {
            currentNode = currentNode.children[props.path[i]];
            currentPath.push(props.path[i]);
            var span = children[i*2 + 1];

            var text = span.children[0].text;
            if(text !== currentNode.text) {
                changedPathList.push([...currentPath]);
                changedTextList.push(text);
            }
        }

        props.changeSlots(changedPathList, changedTextList);

        var lastSpan = children[children.length - 2];
        props.setIsInsert(lastSpan.children[0].text !== "");

        return;
    }

    function handleKeyDown(e) {
        console.log("down: " + e.key);

        if(e.key === "Enter") {
            e.preventDefault();
            editor.insertText('\n');
        } else if(e.key === 'g' && props.isMeta) {
            e.preventDefault();
            var valueChildren = value[0].children;
            var lastSpan = valueChildren[valueChildren.length - 1 - 1];
            props.handleGenerate(lastSpan.children[0].text);
        }
    }
    
    function handleKeyUp(e) {
        console.log("up: " + e.key);
    }


    return (
        <SuperContainer>
            <Slate 
                editor={editor}
                value={value}
                onChange={handleChange}
            >
                <Editable 
                    id={"editor"}
                    className="TextEditor"
                    renderElement={props => <Element {...props} />}
                    renderLeaf={props => <Text {...props} />}
                    onKeyDown={handleKeyDown}
                    onKeyUp={handleKeyUp}
                />
            </Slate>
        </SuperContainer>
    )
}

const Element = props => {
    const { attributes, children, element } = props;
    switch (element.type) {
      case 'span':
        return <SpanElement {...props} />
      default:
        return <p {...attributes}>{children}</p>
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
        <span style={props.element.style} {...props.attributes}>
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

const SuperContainer = styled.div`
    flex-basis: 45%; 
    margin: 60px 60px 60px 60px;
    box-shadow: 0px 8px 8px rgba(0, 0, 0, 0.25);
`;

export default TextEditor;