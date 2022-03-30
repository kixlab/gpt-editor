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
    const { insertText, isInline, deleteBackward, deleteFragment } = editor
  
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

    editor.deleteBackward = n => {
        const { selection, children } = editor;

        var childIdx = selection.anchor.path[1];
        var offset = selection.anchor.offset;
        var child = children[0].children[childIdx];

        if(child.text !== undefined) {
            childIdx = selection.anchor.path[1] - 1;
            if(childIdx < 0) return;
            child = children[0].children[childIdx];
            offset = child.children[0].text.length;
            Transforms.select(editor, {
                anchor: { path: [0, childIdx, 0], offset: offset},
                focus: { path: [0, childIdx, 0], offset: offset}
            })
        }

        const currentChildText = child.children[0].text;

        if(selection.anchor.offset === 1 && currentChildText.length === 1) return;

        switch(n) {
            case "word":
                var words = currentChildText.split(" ").filter(word => word !== "");
                if(currentChildText[0] !== "" && words.length === 1) {
                    Transforms.delete(editor, { unit: "character", distance: currentChildText.length - 1, reverse: true });
                    return;
                }
                break;
            case "line":
                Transforms.delete(editor, { unit: "character", distance: currentChildText.length - 1, reverse: true });
                return;
        }

        deleteBackward(n);
    }

    editor.deleteFragment = n => {
        const { selection, children } = editor;
        const { anchor, focus } = selection;
        if(Math.abs(focus.path[1] - anchor.path[1]) > 2) return;
        
        if(anchor.path[1] > focus.path[1]) {
            if(anchor.offset === children[0].children[anchor.path[1]].children[0].text.length) return;
            if(focus.offset === 0) return;
        } else if(anchor.path[1] < focus.path[1]) {
            if(focus.offset === children[0].children[focus.path[1]].children[0].text.length) return;
            if(anchor.offset === 0) return;
        } else {
            var child = children[0].children[anchor.path[1]];
            if(child.children[0].text.length === Math.abs(anchor.offset-focus.offset)) return;
        }

        deleteFragment(n);
    }

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

    function displayPath(path, isHover) {
        var totalNodes = editor.children[0].children.length;
        for(var i = totalNodes - 1; i >= 0; i--) {
            Transforms.removeNodes(
                editor,
                { at: [0, i] }
            )
        }
        var nodesToInsert = [];
        for(var i = 0; i < path.length; i++) {
            var currentNode = props.slots[path[i]];

            if(currentNode.type === "anchor") continue;
            
            nodesToInsert.push(
                {
                    type: 'span',
                    children: [{ text: currentNode.text }],
                    style: {
                        backgroundColor: props.currentDepth === i ? "rgba(0, 102, 255, 0.2)" : "",
                        color: isHover ? "#0066FF" : ""
                    },
                    slotId: path[i]
                }
            );
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
    }

    useEffect(() => {
        displayPath(props.getSlotPath(props.lastSlot), false);
    }, [props.lastSlot]);

    useEffect(() => {
        if(props.hoverSlot) {
            displayPath(props.getSlotPath(props.hoverSlot), true);
        } else {
            displayPath(props.getSlotPath(props.lastSlot), false);
        }
    }, [props.hoverSlot])

    useEffect(() => {
        for(var i = 0; i * 2 + 1 < editor.children[0].children.length; i++) {
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
        setValue(newValue);
        if(valueToText(value) === valueToText(newValue) || props.hoverSlot) return;

        var children = [...newValue[0].children];
        
        // check changes in spans

        var changedPathList = [];
        var changedTextList = [];

        for(var i = 0; i*2 + 1 < children.length; i++) {
            var span = children[i*2 + 1];
            if(span.isLast) continue;

            var spanText = span.children[0].text;
            var slotId = span.slotId;
            var slot = props.slots[slotId];

            if(slot.text !== spanText) {
                changedPathList.push(slotId);
                changedTextList.push(spanText);
            }
        }

        props.changeSlots(changedPathList, changedTextList);

        var lastSpan = children[children.length - 2];
        props.setIsInsert(lastSpan.children[0].text !== "");

        return;
    }

    function handleKeyDown(e) {
        if(e.key === 'Enter' && props.isMeta) {
            e.preventDefault();
            var valueChildren = value[0].children;
            var lastSpan = valueChildren[valueChildren.length - 1 - 1];
            props.handleCreate(lastSpan.children[0].text);
        } else if(e.key === "Enter") {
            e.preventDefault();
            editor.insertText('\n');
        }
    }
    
    function handleKeyUp(e) {
        return;
    }

    function handleClick(e) {
        const { selection, children } = editor;

        var lastSpanLocation = children[0].children.length - 1 - 1;
        if(selection.anchor.path[1] === lastSpanLocation || selection.anchor.path[1] === lastSpanLocation + 1) return;
        var selectedDepth = Math.floor((selection.anchor.path[1] - 1)/2);
        if(selectedDepth !== props.currentDepth) {
            props.setCurrentDepth(selectedDepth);
        }
    }

    return (
        <SuperContainer id="editor-container">
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
                    onClick={handleClick}
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