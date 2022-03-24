import React from 'react';
import styled from "styled-components";

function GenerationList(props) {
    const generations = [];

    function handleClick(e) {
        var index = parseInt(e.target.getAttribute("data-idx"));
        props.copyGeneration(props.lens.generations[index].text);
    }

    for(let i = 0; i < props.lens.generations.length; i++) {
        var entry = props.lens.generations[i];
        var color = props.switches[entry.switchId] ? props.switches[entry.switchId].color : "#ccc";
        generations.push(
            <div key={i} style={{display: "flex", flexDirection: "row", gap: "8px"}}>
                <Bar barColor={color}></Bar>
                <TextContainer key={i} data-idx={i} onClick={handleClick}>
                    {entry.text}
                </TextContainer>
            </div>
        )
    }
    return (
        <Container>
            {generations}
        </Container>
    );
}

const Container = styled.div`
    display: flex;
    flex-direction: column;
    gap: 12px;
`;

const Bar = styled.div`
    height: inherit;
    width: 6px;
    background-color: ${props => props.barColor};
    border-radius: 3px;
`;

const TextContainer = styled.div`
    background-color: #fff;
    border: solid 2px #ccc;
    border-radius: 8px;
    padding: 4px 8px;
    width: calc(100% - 8px - 6px);
    cursor: pointer;
    &:hover {
        background-color: rgba(0, 102, 255, 0.1);
        border-color: #0066FF;
    }
`;

export default GenerationList;