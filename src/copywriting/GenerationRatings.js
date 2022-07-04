import React from 'react';
import styled from "styled-components";

import Rating from './Rating';

const SENTIMENT_LABELS = ["Negative", "Neutral", "Positive"];
const EMOTION_LABELS = ["Anger", "Joy", "Optimism", "Sadness"];

const SENTIMENT_COLORS = ["#E76969", "#CCC", "#55C144"];
const EMOTION_COLORS = ["#CD0707", "#EFB92E", "#A71ED8",  "#3992E3"];

function GenerationRatings(props) {
    var ratingsHTML = [];

    function drawRatingLabels() {
        var result = [];
        var ratings = props.lens.generations[props.hoverGen].sentiment
        if(props.type === 'emotion') {
            ratings = props.lens.generations[props.hoverGen].emotion;
        }
        var labels = props.type === 'sentiment' ? SENTIMENT_LABELS : EMOTION_LABELS;
        var colors = props.type === 'sentiment' ? SENTIMENT_COLORS : EMOTION_COLORS;
        for(var i = 0; i < ratings.length; i++) {
            result.push(
                <div key={i} style={{fontSize: "10px", color: colors[i]}}>{labels[i]}: <b>{ratings[i]}%</b></div>
            )
        }
        return result;
    }

    for(var inputText in props.groupedGenerations) {
        var group = props.groupedGenerations[inputText];
        for(var propertiesStr in group) {
            var subgroup = group[propertiesStr];
            for(var i = 0; i < subgroup.length; i++) {
                var idx = subgroup[i];
                var entry = props.lens.generations[idx];
                ratingsHTML.push(
                    <Rating
                        key={idx} genIdx={idx} hoverGen={props.hoverGen} setHoverGen={props.setHoverGen}
                        percentages={props.type === 'sentiment' ? entry.sentiment : entry.emotion}
                        colors={props.type === 'sentiment' ? SENTIMENT_COLORS : EMOTION_COLORS}
                    />
                )
            }
        }
    }

    return (
        <RatingsContainer>
            {ratingsHTML}
            {props.hoverGen !== null ?
                <HoverText style={{top: 48 + (120+72)*props.hoverGen + 84 + "px"}}>
                    {drawRatingLabels()}
                </HoverText> :
                ""
            }
        </RatingsContainer>
    );
}

const RatingsContainer = styled.div`
    display: flex;
    flex-direction: column;
    align-items: center;
    height: calc(100% - 32px);
    overflow-y: scroll;
    &::-webkit-scrollbar {
        width: 4px;
    }
    &::-webkit-scrollbar-thumb {
        background: #ccc;
        border-radius: 4px;
    }
    position: relative;
`;

const HoverText = styled.div`
    position: absolute;
`;


export default GenerationRatings;