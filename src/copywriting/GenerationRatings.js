import React from 'react';
import styled from "styled-components";

import Rating from './Rating';

const SENTIMENT_LABELS = ["Negative", "Neutral", "Positive"];
const EMOTION_LABELS = ["Anger", "Joy", "Optimism", "Sadness"];

const SENTIMENT_COLORS = ["#E76969", "#999", "#55C144"];
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

    function isFilteredByProperty(propertyStr, filterData) {
        var properties = propertyStr.trim().split("\n");
        for(var i = 0; i < properties.length; i++) {
            var property = properties[i].split(": ");
            var propName = property[0];
            var propValue = property[1];
            if(propName != "engine") {
                propValue = parseFloat(propValue);
                if(propValue < filterData[propName][0] || propValue > filterData[propName][1]) return true;
            } else {
                if(filterData.engine !== "all" && filterData.engine !== propValue) return true;
            }
        }
        return false;
    }

    var count = 0;
    for(var inputText in props.groupedGenerations) {
        var group = props.groupedGenerations[inputText];
        var isInputFilter = !inputText.includes(props.filter.data.input);
        if(isInputFilter) continue;
        for(var propertiesStr in group) {
            var indices = group[propertiesStr];
            var isPropertyFilter = isFilteredByProperty(propertiesStr, props.filter.data);
            if(isPropertyFilter) continue;

            var filteredIndices = indices.filter(index => {
                return props.lens.generations[index].text.includes(props.filter.data.output);
            });

            for(var i = 0; i < filteredIndices.length; i++) {
                var idx = filteredIndices[i];
                var entry = props.lens.generations[idx];
                ratingsHTML.push(
                    <Rating
                        key={idx} genIdx={idx} hoverGen={props.hoverGen} setHoverGen={props.setHoverGen}
                        percentages={props.type === 'sentiment' ? entry.sentiment : entry.emotion}
                        colors={props.type === 'sentiment' ? SENTIMENT_COLORS : EMOTION_COLORS}
                    />
                )
                if(props.hoverGen == idx) {
                    ratingsHTML.push(
                        <HoverText key="hover" style={{top: 48 + (80+72)*count + 64 + "px"}}>
                            {drawRatingLabels()}
                        </HoverText>
                    )
                }
                count += 1;
            }
        }
    }

    return (
        <RatingsContainer>
            {ratingsHTML}
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