import React, { useState } from 'react';
import styled from "styled-components";
import axios from "axios";

import NodeArea from './NodeArea';
import { loremipsum } from './LoremIpsum';

const storyStarter = "Suddenly, icy fingers grabbed my arm as I inched through the darkness."

function Track() {
    const [ sentences, setSentences ] = useState(
        {0: {text: storyStarter, isEdited: false}}
    );
    const [ nodes, setNodes ] = useState(
        [
            [0]
        ]
    )
    const [ focusedNode, setFocusedNode ] = useState(-1);
    const [ isAlt, setIsAlt ] = useState(false);

    function updateSentences(nodeId, generatedSentences) { 
        var nextSentenceId = parseInt(Object.keys(sentences).at(-1)) + 1;

        var newSentences = {...sentences};
        for(var i = 0; i < generatedSentences.length; i++) {
            newSentences[nextSentenceId + i] = {text: generatedSentences[i], isEdited: false};
        }
        var newNodes = JSON.parse(JSON.stringify(nodes));
        for(i = 1; i < generatedSentences.length; i++) {
            newNodes.splice(nodeId + 1, 0, [...newNodes[nodeId], nextSentenceId + i]);
        }
        newNodes[nodeId].push(nextSentenceId);

        setSentences(newSentences);
        setNodes(newNodes);
    }

    function textify(nodeId) {
        var text = "";
        var node = nodes[nodeId];
        for (var i = 0; i < node.length; i++) {
            text += sentences[node[i]];
        }
        return text;
    }

    function handleGenerate(nodeId, isGPT) {
        if(isGPT) {
            var data = { text: textify(nodeId) };
            axios
            .post(`http://localhost:5000/api/generate`, data)
            .then((response) => {
                var generatedSentences = [];
                for(var i = 0; i < response.data.length; i++) {
                    generatedSentences.push(response.data[i].text + ".");
                }
                updateSentences(nodeId, generatedSentences);
            });
        } else {
            var generatedSentences = [];
            for(var i = 0; i < 3; i++) {
                generatedSentences.push(loremipsum[Math.floor(Math.random() * loremipsum.length)] + ".");
            }
            console.log(generatedSentences);
            updateSentences(nodeId, generatedSentences);
        }
    }

    function handleFocus(nodeId, change) {
        console.log(nodeId, change);
        if(nodeId == null)
            setFocusedNode(-1);

        var newFocusNode = nodeId + change;
        if(newFocusNode < 0) 
            newFocusNode = nodes.length - 1;
        else if(newFocusNode >= nodes.length)
            newFocusNode = 0;

        setFocusedNode(newFocusNode);
    }


    function handleKeyDown(e) {
        if (e.key === "Alt") {
            console.log("ALT DOWN");
            setIsAlt(true);
        }
        
        if(isAlt) {
            if(e.key === "ArrowLeft") {
                e.preventDefault();
                handleFocus(focusedNode, -1);
            } else if(e.key === "ArrowRight") {
                e.preventDefault();
                handleFocus(focusedNode, 1);
            }
        }
    }

    function handleKeyUp(e) {
        if(e.key === "Alt") {
            console.log("ALT UP");
            setIsAlt(false);
        }
    }

    function handleDelete(nodeId) {
        var newNodes = [...nodes];
        newNodes.splice(nodeId, 1);
        setNodes(newNodes);
    }

    function handleEditNode(nodeId, changedIdx, changedText) {
        var newSentences = {...sentences};
        var newNodes = [...nodes];
        var changedSentenceId = newNodes[nodeId][changedIdx];
        var changedSentence = sentences[changedSentenceId];

        if(changedSentence.isEdited) {
            newSentences[changedSentenceId].text = changedText;
            setSentences(newSentences);
        } else {
            var nextSentenceId = parseInt(Object.keys(sentences).at(-1)) + 1;
            newSentences[nextSentenceId] = {text: changedText, isEdited: true};
            newNodes[nodeId][changedIdx] = nextSentenceId;
            setSentences(newSentences);
            setNodes(newNodes);
        }
    }

    var trackHTML = [];
    for(var i = 0; i < nodes.length; i++) {
        trackHTML.push(
            <NodeArea 
                key={i} nodeId={i} isAlt={isAlt}
                sentenceIds={nodes[i]} sentencesText={sentences} 
                handleGenerate={handleGenerate} handleFocus={handleFocus}
                handleDelete={handleDelete} handleEditNode={handleEditNode}
                isFocused={i === focusedNode}
            />
        )
    }
    
    return (
        <>
            <TrackContainer onKeyDown={handleKeyDown} onKeyUp={handleKeyUp}>
                {trackHTML}
            </TrackContainer>
        </>
    )
}

const TrackContainer = styled.div`
    display: flex;
    flex-direction: row;
    width: 100%;
    height: 800px;
    gap: 12px;
    overflow-x: scroll;
    padding: 12px;
`;

export default Track;