import React from 'react';
import styled from "styled-components";

import Rating from './Rating';

const SENTIMENT_COLORS = ["#55C144", "#E76969", "#CCC"];
const EMOTION_COLORS = ["#EFB92E", "#A71ED8", "#CD0707", "#3992E3"];

function GenerationRatings(props) {
    var ratingsHTML = [];
    for(var i = 0; i < props.lens.generations.length; i++) {
        var entry = props.lens.generations[i];
        ratingsHTML.push(
            <Rating
                key={i} style={{height: document.getElementById("hey").height}}
                percentages={props.type === 'sentiment' ? entry.sentiment : entry.emotion}
                colors={props.type === 'sentiment' ? SENTIMENT_COLORS : EMOTION_COLORS}
            />
        )
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
`;


export default GenerationRatings;