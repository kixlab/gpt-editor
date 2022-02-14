import React, { useState } from 'react';
import styled from "styled-components";
import axios from "axios";

import NodeArea from './SlateArea';
import { loremipsum } from './LoremIpsum';
import { parse } from '@fortawesome/fontawesome-svg-core';

const storyStarter = "Suddenly, icy fingers grabbed my arm as I inched through the darkness."

function Track() {
    const [ sentences, setSentences ] = useState(
        {0: {text: storyStarter, isEdited: false}}
    );
    const [ nodes, setNodes ] = useState(
        [{id: 0, sentences: [0]}]
    )
    const [ focusedNode, setFocusedNode ] = useState(-1);
    const [ isAlt, setIsAlt ] = useState(false);

    function updateSentences(nodeId, generatedSentences) { 
        var nextSentenceId = parseInt(Object.keys(sentences).at(-1)) + 1;
        var maxNodeId = Math.max.apply(null, Object.keys(nodes).map(id => parseInt(id)));

        var newSentences = {...sentences};
        for(var i = 0; i < generatedSentences.length; i++) {
            newSentences[nextSentenceId + i] = {text: generatedSentences[i], isEdited: false};
        }
        var newNodes = JSON.parse(JSON.stringify(nodes));
        var nodeIdx = newNodes.findIndex(node => node.id === nodeId);
        var node = newNodes[nodeIdx];
        for(i = 1; i < generatedSentences.length; i++) {
            newNodes.splice(nodeIdx + i, 0, {id: maxNodeId + i, sentences: [...node.sentences, nextSentenceId + i]});
        }
        newNodes[nodeIdx].sentences.push(nextSentenceId);
        
        setSentences(newSentences);
        setNodes(newNodes);
    }

    function textify(nodeId) {
        var text = "";
        var node = nodes.find(node => node.id === nodeId);
        for (var i = 0; i < node.sentences.length; i++) {
            text += sentences[node.sentences[i]].text;
        }
        return text;
    }

    function handleGenerate(nodeId, count, isGPT) {
        console.log("generate")
        if(isGPT) {
            var data = { text: textify(nodeId), count: count };
            axios
            .post(`http://localhost:5000/api/generate`, data)
            .then((response) => {
                var generatedSentences = [];
                for(var i = 0; i < response.data.length; i++) {
                    generatedSentences.push(response.data[i].text);
                }
                updateSentences(nodeId, generatedSentences);
            });
        } else {
            var generatedSentences = [];
            if(count === 0) {
                for(var i = 0; i < 3; i++) {
                    var words = loremipsum[Math.floor(Math.random() * loremipsum.length)].split(" ");
                    words.shift();
                    generatedSentences.push(" " + words[Math.floor(Math.random() * words.length)]);
                }
                console.log(generatedSentences);
            } else {
                for(var i = 0; i < 3; i++) {
                    var sentence = "";
                    for(var j = 0; j < count; j++) {
                        sentence += loremipsum[Math.floor(Math.random() * loremipsum.length)] + "."
                    }
                    generatedSentences.push(sentence);
                }
            }
            updateSentences(nodeId, generatedSentences);
        }
    }

    function handleFocus(nodeId, change) {
        if(nodeId == null)
            setFocusedNode(-1);

        var nodeIdx = nodes.findIndex(node => node.id === nodeId);

        var newFocusIdx = nodeIdx + change;
        if(newFocusIdx < 0) 
            newFocusIdx = nodes.length - 1;
        else if(newFocusIdx >= nodes.length)
            newFocusIdx = 0;
        
        setFocusedNode(nodes[newFocusIdx].id);
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
        var nodeIdx = newNodes.findIndex(node => node.id === nodeId);
        newNodes.splice(nodeIdx, 1);
        setNodes(newNodes);
    }

    function handleEditNode(nodeId, changedIdxList, changedTextList, deletedIdxList) {
        var newSentences = {...sentences};
        var newNodes = JSON.parse(JSON.stringify(nodes));
        var nodeIdx = newNodes.findIndex(node => node.id === nodeId);
        var isNodesChanged = false;

        for(var i = 0; i < changedIdxList.length; i++) {
            var changedIdx = changedIdxList[i];
            var changedText = changedTextList[i];
            var changedSentenceId = newNodes[nodeIdx].sentences[changedIdx];
            var changedSentence = sentences[changedSentenceId];

            if(changedSentence.isEdited) {
                newSentences[changedSentenceId].text = changedText;
            } else {
                var nextSentenceId = parseInt(Object.keys(newSentences).at(-1)) + 1;
                newSentences[nextSentenceId] = {text: changedText, isEdited: true};
                newNodes[nodeIdx].sentences[changedIdx] = nextSentenceId;
                isNodesChanged = true;
            }
        }
        for(i = deletedIdxList.length - 1; i >= 0; i--) {
            var deletedIdx = deletedIdxList[i];
            newNodes[nodeIdx].sentences.splice(deletedIdx, 1);
            isNodesChanged = true;
        }
        /*
        for(i = 0; i < deletedIdxList.length; i++) {
            console.log(deletedIdxList);
            var deletedIdx = deletedIdxList[i];
            var deletedSentenceId = newNodes[nodeIdx].sentences[deletedIdx];
            var deletedSentence = sentences[deletedSentenceId];

            if(deletedSentence.isEdited) {
                newSentences[deletedSentenceId].text = "";
            } else {
                var nextSentenceId = parseInt(Object.keys(newSentences).at(-1)) + 1;
                newSentences[nextSentenceId] = {text: "", isEdited: true};
                newNodes[nodeIdx].sentences[deletedIdx] = nextSentenceId;
                isNodesChanged = true;
            }
        }
        */
        
        setSentences(newSentences);
        if(isNodesChanged) {
            setNodes(newNodes);
        }
    }

    var trackHTML = [];
    for(var i = 0; i < nodes.length; i++) {
        trackHTML.push(
            <NodeArea 
                key={nodes[i].id} nodeId={nodes[i].id} isAlt={isAlt}
                sentenceIds={nodes[i].sentences} sentencesText={sentences} 
                handleGenerate={handleGenerate} handleFocus={handleFocus}
                handleDelete={handleDelete} handleEditNode={handleEditNode}
                isFocused={nodes[i].id === focusedNode}
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