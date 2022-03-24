import React from 'react';
import styled from "styled-components";

import { ListButton, SpaceButton } from './SVG';
import GenerationList from './GenerationList';
import GenerationSpace from './GenerationSpace';

function Lenses(props) {
    const currLens = props.lenses[props.lensId];

    function handleChange(e) {
        var val = parseInt(e.target.value);
        if(val < 1) val = 1;
        if(val > 6) val = 6;
        props.changeLens(props.lensId, "generationLength", val);
    }

    function handleChangeType(index, type) {
        if(currLens.types[index] === type) return;
        props.changeLensType(props.lensId, index, type);
    }

    return (
        <LensContainer>
            <BigLens>
                <BigHeader>
                    <LengthAdjust>
                        <div style={{fontWeight: "bold", marginRight: "4px"}}>
                            Length:
                        </div>
                        <NumInput type="number" value={currLens.generationLength} onChange={handleChange}/>
                        <div style={{marginLeft: "4px", marginRight: "4px"}}> sentences</div>
                        <input 
                            className="slider" value={currLens.generationLength}
                            style={{width: "100px"}} type="range" 
                            min="1" max="6" step="1" 
                            onChange={handleChange}
                        />
                    </LengthAdjust>
                    <Toggles>
                        <svg height="32" width="82">
                            <ListBtn 
                                transform="scale(1.75)" 
                                onClick={() => handleChangeType(0, "list")}
                                isList={currLens.types[0] === 'list'}
                            >
                                {ListButton}
                            </ListBtn>
                            <line x1="40" y1="0" x2="40" y2="32" stroke="#ccc" strokeWidth="2"/>
                            <SpaceBtn
                                transform={`translate(50, 0) scale(1.75)`} 
                                onClick={() => handleChangeType(0, "space")}
                                isSpace={currLens.types[0] === 'space'}
                            >
                                {SpaceButton}
                            </SpaceBtn>
                        </svg>
                    </Toggles>
                </BigHeader>
                <BigContent>
                    {currLens.generations.length === 0 ?
                        <div style={{color: "#ccc"}}>Get new suggestions by connecting prompts to generators and clicking on the generators...</div> :
                        (currLens.types[0] === 'list' ?
                            <GenerationList lens={currLens} switches={props.switches} copyGeneration={props.copyGeneration} /> :
                            <GenerationSpace lens={currLens} switches={props.switches} copyGeneration={props.copyGeneration} />
                        )
                    } 
                </BigContent>
            </BigLens>
            <Line></Line>
            <SmallLens>

            </SmallLens>
        </LensContainer>
    )
}

const LensContainer = styled.div`
    display: flex;
    flex-direction: row;
    height: 55%;
    width: 100%;
    position: relative;
`;

const BigLens = styled.div`
    width: calc(100% - 120px - 16px);
    height: 100%;
    background-color: #fff;
    border: solid 2px #0066FF;
    border-radius: 20px;
    box-shadow: 0 8px 8px rgba(0, 0, 0, 0.25);
    padding: 16px;
`;

const BigHeader = styled.div`
    display: flex;
    font-size: 18px;
    justify-content: space-between;
    margin-bottom: 8px;
`;

const LengthAdjust = styled.div`
    display: flex;
    flex-direction: row;
    align-items: center;
`;

const Toggles = styled.div`
`;

const ListBtn = styled.g`
    cursor: pointer;
    stroke: ${props => props.isList ? "#0066FF" : "#ccc"};
    &:hover {
        stroke: ${props => props.isList ? "#0066FF" : "#0066FF66"};
    }
`;

const SpaceBtn = styled.g`
    cursor: pointer;
    stroke: ${props => props.isSpace ? "#0066FF" : "#ccc"};
    fill: ${props => props.isSpace ? "#0066FF" : "#ccc"};
    &:hover {
        stroke: ${props => props.isSpace ? "#0066FF" : "#0066FF66"};
        fill: ${props => props.isSpace ? "#0066FF" : "#0066FF66"};
    }
`;

const BigContent = styled.div`
    margin: 0 0 0 16px;
    padding-right: 16px;
    overflow-y: scroll;
    height: calc(100% - 32px - 16px);
    &::-webkit-scrollbar {
        width: 4px;
    }
    &::-webkit-scrollbar-thumb {
        background: #ccc;
        border-radius: 4px;
    }
`;

const NumInput = styled.input`
    border: solid 1px #ccc;
    border-radius: 2px;
    width: 40px;
    text-align: center;
    &::-webkit-outer-spin-button {
        -webkit-appearance: none;
    }
    &::-webkit-inner-spin-button {
        -webkit-appearance: none;
    }
`;

const SmallLens = styled.div`
    margin-left: 16px;
    width: 120px;
    height: 100%;
    background-color: #fff;
    border: solid 2px #0066FF;
    border-radius: 20px;
    box-shadow: 0 8px 8px rgba(0, 0, 0, 0.25);
`;

const Line = styled.div`
    height: 2px;
    width: 16px;
    background-color: #0066FF;
    top: calc(50% - 1px);
    left: calc(100% - 120px - 16px);
    position: absolute;
`;


export default Lenses;