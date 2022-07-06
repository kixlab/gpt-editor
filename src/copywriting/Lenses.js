import React, { useState } from 'react';
import styled from "styled-components";

import { NewListButton, NewSpaceButton, SentimentButton, EmotionButton, ClearButton, FilterButton } from './SVG';
import GenerationList from './GenerationList';
import GenerationSpace from './GenerationSpace';
import GenerationRatings from './GenerationRatings';

function Lenses(props) {
    const currLens = props.lenses[props.lensId];

    const [hoverGen, setHoverGen] = useState(null);

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


    function propertiesToStr(properties) {
        var defProperties = ["engine", "temperature", "presencePen", "bestOf"];
        var str = "";
        defProperties.forEach((property) => {
            str += property + ": " + properties[property] + "\n";
        })
        return str;
    }

    function groupGenerations(generations) {
        var groups = {};
        var inputGroups = {};
        for(var i = 0; i < generations.length; i++) {
            var gen = generations[i];
            if(gen.inputText in inputGroups) {
                inputGroups[gen.inputText].push(i);
            } else {
                inputGroups[gen.inputText] = [i];
                groups[gen.inputText] = {};
            }
        }
        for(var inputText in inputGroups) {
            var indices = inputGroups[inputText];
            var prevProperties = "";
            for(var i = 0; i < indices.length; i++) {
                var idx = indices[i];
                var gen = generations[idx];
                var propertiesStr = propertiesToStr(gen.properties);
                if(prevProperties == propertiesStr) {
                    groups[inputText][propertiesStr].push(idx);
                } else {
                    groups[inputText][propertiesStr] = [idx];
                }
                prevProperties = propertiesStr;
            }
        }
        return groups;
    }

    var groupedGenerations = groupGenerations(currLens.generations);

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
                            style={{width: "100px", marginRight: "16px"}} type="range" 
                            min="1" max="6" step="1" 
                            onChange={handleChange}
                        />
                        <div>
                            <svg height="32" width="82">
                                <ClearBtn 
                                    stroke="#ccc" fill="#ccc" 
                                    transform={`scale(${32/28})`} 
                                    onClick={() => props.clearLens()}
                                >
                                    {ClearButton}
                                </ClearBtn>
                                <ToggleBtn 
                                    id="filter-button"
                                    transform={`translate(50, 0) scale(${32/28})`} 
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        props.toggleFilter();
                                    }}
                                    isToggled={props.filter.isShown}
                                >
                                    {FilterButton}
                                </ToggleBtn>
                            </svg>
                        </div>
                    </LengthAdjust>
                    <Toggles>
                        <svg height="32" width="82">
                            <ToggleBtn 
                                transform={`scale(${32/28})`}
                                onClick={() => handleChangeType(0, "list")}
                                isToggled={currLens.types[0] === 'list'}
                            >
                                {NewListButton}
                            </ToggleBtn>
                            <line x1="40" y1="0" x2="40" y2="28" stroke="#ccc" strokeWidth="2"/>
                            <ToggleBtn
                                transform={`translate(50, 0) scale(${32/28})`} 
                                onClick={() => handleChangeType(0, "space")}
                                isToggled={currLens.types[0] === 'space'}
                            >
                                {NewSpaceButton}
                            </ToggleBtn>
                        </svg>
                    </Toggles>
                </BigHeader>
                <BigContent>
                    {currLens.generations.length === 0 ?
                        <div style={{color: "#ccc"}}>Get new suggestions by connecting prompts to generators and clicking on the generators...</div> :
                        (currLens.types[0] === 'list' ?
                            <GenerationList 
                                lens={currLens} switches={props.switches} pinGeneration={props.pinGeneration}
                                copyGeneration={props.copyGeneration} hoverGen={hoverGen} setHoverGen={setHoverGen}
                                groupedGenerations={groupedGenerations} setTooltip={props.setTooltip}
                                filter={props.filter}
                            /> :
                            <GenerationSpace 
                                lens={currLens} switches={props.switches} 
                                copyGeneration={props.copyGeneration} hoverGen={hoverGen} setHoverGen={setHoverGen}
                                filter={props.filter}
                            />
                        )
                    } 
                </BigContent>
            </BigLens>
            <Line></Line>
            <SmallLens>
                <Toggles>
                    <svg height="32" width="82">
                        <ToggleBtn 
                            transform={`scale(${32/28})`}
                            onClick={() => handleChangeType(1, "sentiment")}
                            isToggled={currLens.types[1] === 'sentiment'}
                        >
                            {SentimentButton}
                        </ToggleBtn>
                        <line x1="40" y1="0" x2="40" y2="28" stroke="#ccc" strokeWidth="2"/>
                        <ToggleBtn
                            transform={`translate(50, 0) scale(${32/28})`}
                            onClick={() => handleChangeType(1, "emotion")}
                            isToggled={currLens.types[1] === 'emotion'}
                        >
                            {EmotionButton}
                        </ToggleBtn>
                    </svg>
                </Toggles>
                <GenerationRatings 
                    lens={currLens} type={currLens.types[1]}
                    hoverGen={hoverGen} setHoverGen={setHoverGen}
                    groupedGenerations={groupedGenerations}
                    filter={props.filter}
                />
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

const ClearBtn = styled.g`
    cursor: pointer;
    stroke: #ccc;
    fill: #ccc;
    &:hover {
        stroke: #619aff;
        fill: #619aff;
    }
`;

const ToggleBtn = styled.g`
    cursor: pointer;
    stroke: ${props => props.isToggled ? "#0066FF" : "#ccc"};
    fill: ${props => props.isToggled ? "#0066FF" : "#ccc"};
    &:hover {
        stroke: ${props => props.isToggled ? "#0066FF" : "#619aff"};
        fill: ${props => props.isToggled ? "#0066FF" : "#619aff"};
    }
`;

const BigContent = styled.div`
    padding-right: 8px;
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
    width: 32px;
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
    padding: 16px;
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