import React, { useEffect, useState } from 'react';
import { isCompositeComponent } from 'react-dom/test-utils';
import styled from "styled-components";
import { ResetButton } from './SVG';

const propNameMap = {
    'engine': 'Engine',
    'temperature': 'Temperature',
    'presencePen': 'Presence Penalty',
    'bestOf': 'Best Of',
};
const engineMap = {
    "text-davinci-002": "Davinci-2 (D2)",
    "text-davinci-001": "Davinci (D)",
    "text-curie-001": "Curie (C)",
    "text-babbage-001": "Babbage (B)",
    "text-ada-001": "Ada (A)"
}

function Filter(props) {
    const [tempValues, setTempValues] = useState({
        temperature: [0,0],
        presencePen: [0,0],
        bestOf: [0,0],
    })
    var ele = document.getElementById("filter-button");

    useEffect(() => {
        for(var key in tempValues) {
            if(tempValues[key][0] != props.filter.data[key][0] || tempValues[key][1] != props.filter.data[key][1]) {
                setTempValues({
                    temperature: [...props.filter.data['temperature']],
                    presencePen: [...props.filter.data['presencePen']],
                    bestOf: [...props.filter.data['bestOf']],
                });
                return;
            }
        }
    }, [props.filter]);

    if(ele == undefined) {
        return "";
    }

    var position = ele.getClientRects()[0];

    var top = position.y + 34;
    var left = position.x;

    function handleChange(property, index, value) {
        var copyValues = {...tempValues};
        copyValues[property][index] = value;
        setTempValues(copyValues);
    }
    
    function sendChange(property, index, value) {
        value = parseFloat(value);
        var isValid = true;
        switch (property) {
            case "temperature":
                if(isNaN(value) || value < 0 || value > 1) isValid = false;
                break;
            case "presencePen":
                if (isNaN(value) || value < 0 || value > 2) isValid = false;
                break;
            case "bestOf":
                if (isNaN(value) || value < 1 || value > 20) isValid = false;
                value = parseInt(value);
                break;
        }
        if(isValid) {
            if(index == 0 && props.filter.data[property][1] < value) isValid = false;
            if(index == 1 && props.filter.data[property][0] > value) isValid = false;
        }

        if(isValid) {
            props.setFilterData(property, index, value)
        } else {
            var copyValues = {...tempValues};
            copyValues[property][index] = props.filter.data[property][index];
            setTempValues(copyValues);
        }
    }

    function createInputRange(property) {
        var propertyToLabel = {
            'temperature': 'Temperature',
            'presencePen': 'Presence Pen',
            'bestOf': 'Best Of',
        }
        return (
            <InputContainer>
                <div>
                    <InputRange 
                        value={tempValues[property][0]}
                        onChange={(e) => handleChange(property, 0, e.target.value)}
                        onKeyDown={(e) => e.key === "Enter" && sendChange(property, 0, e.target.value)}
                        onBlur={(e) => sendChange(property, 0, e.target.value)}
                    />
                </div>
                <div style={{margin: "4px 0"}}> ≤ </div>
                <div style={{flex: "1", textAlign: "center"}}>{propertyToLabel[property]}</div>
                <div style={{margin: "4px 0"}}> ≤ </div>
                <div>
                    <InputRange 
                        value={tempValues[property][1]}
                        onChange={(e) => handleChange(property, 1, e.target.value)}
                        onKeyDown={(e) => e.key === "Enter" && sendChange(property, 1, e.target.value)}
                        onBlur={(e) => sendChange(property, 1, e.target.value)}
                    />
                </div>
            </InputContainer>

        )
    }

    return (
        <FilterCont style={{top: top + "px", left: left + "px"}} onClick={(e) => e.stopPropagation()}>
            <FilterHeader>
                <div><b>Filter</b></div>
                <svg height="28" width="28">
                    <ResetBtn 
                        stroke="#ccc" fill="#ccc" 
                        onClick={() => props.resetFilter()}
                    >
                        {ResetButton}
                    </ResetBtn>
                </svg>
            </FilterHeader>
            <div>
                <InputContainer>
                    <div style={{marginRight: "4px"}}>Input</div>
                    <div style={{flex: "1"}}>
                        <Input 
                            placeholder="Type text to filter..." 
                            value={props.filter.data.input}
                            onChange={(e) => props.setFilterData('input', null, e.target.value)}
                        />
                    </div>
                </InputContainer>
                <InputContainer>
                    <div style={{marginRight: "4px"}}>Engine</div>
                    <div style={{flex: "1"}}>
                        <Select value={props.filter.data.engine} onChange={(e) => props.setFilterData('engine', null, e.target.value)}>
                            <option value="all">All Engines</option>
                            <option value="text-davinci-002">Davinci-2 (D2)</option>
                            <option value="text-davinci-001">Davinci (D)</option>
                            <option value="text-curie-001">Curie (C)</option>
                            <option value="text-babbage-001">Babbage (B)</option>
                            <option value="text-ada-001">Ada (A)</option>
                        </Select>
                    </div>
                </InputContainer>
                {createInputRange("temperature")}
                {createInputRange("presencePen")}
                {createInputRange("bestOf")}
            </div>
        </FilterCont>
    )
}

const FilterCont = styled.div`
    background-color: #fff;
    border: solid 2px #0066FF;
    border-radius: 4px;
    padding: 8px;
    box-shadow: 0 4px 4px rgba(0, 0, 0, 0.25);
    z-index: 100;
    width: 240px;
    white-space: pre-wrap;
    color: #333;
    position: absolute;
    font-size: 16px;
`;

const FilterHeader = styled.div`
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 8px;
    height: 28px;
    font-size: 18px;
`;

const InputContainer = styled.div`
    display: flex;
    flex-direction: row; 
    width: 100%;
    align-items: center;
    margin-bottom: 8px;
`;

const Input = styled.input`
    width: 100%;
    border-radius: 4px;
    border: solid 1px #ccc;
    padding: 1px 4px;
`;

const Select = styled.select`
    width: 100%;
    border-radius: 4px;
    border: solid 1px #ccc;
    height: 28px;
    padding: 1px 4px;
`;

const InputRange = styled.input`
    width: 40px;
    border-radius: 4px;
    border: solid 1px #ccc;
    text-align: center;
`;

const ResetBtn = styled.g`
    cursor: pointer;
    stroke: #ccc;
    fill: #ccc;
    &:hover {
        stroke: #619aff;
        fill: #619aff;
    }
`;

export default Filter;