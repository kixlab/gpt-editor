import React, { useState, useEffect } from 'react';
import styled from 'styled-components';

import { ListButton, SpaceButton, AxisButton } from './SVG';

const LENS_BUTTON_SIZE = 58;

function LensContent(props) {
    var currButton = props.buttons[props.buttonId];
    var currLensId = currButton.lens;
    var currLens = props.lenses[currLensId];

    function handleClick(type) {
        props.changeLens(currLensId, type, currLens.properties);
    }

    function handleChange(e) {
        var axis = e.target.getAttribute('data-axis');
        var newProperties = {...currLens.properties};
        newProperties[axis === 'horizontal' ? 'x' : 'y'] = e.target.value;
        props.changeLens(currLensId, currLens.type, newProperties);
    }

    return(
        <div>
            <ButtonCont height={LENS_BUTTON_SIZE} width={(LENS_BUTTON_SIZE+8)*3 - 8}>
                <g 
                    fill={currLens.type === 'list' ? "#0066FF" : "#CCC"} 
                    stroke={currLens.type === 'list' ? "#0066FF" : "#CCC"}
                    onClick={() => handleClick('list')} style={{cursor: "pointer"}}
                    transform={`scale(${LENS_BUTTON_SIZE/50})`}
                >
                    {ListButton}
                </g>
                <g 
                    fill={currLens.type === 'axis' ? "#0066FF" : "#CCC"} 
                    stroke={currLens.type === 'axis' ? "#0066FF" : "#CCC"}
                    onClick={() => handleClick('axis')} style={{cursor: "pointer"}}
                    transform={`translate(${(LENS_BUTTON_SIZE+8)*1}, 0) scale(${LENS_BUTTON_SIZE/50})`}
                >
                    {AxisButton}
                </g>
                <g
                    fill={currLens.type === 'space' ? "#0066FF" : "#CCC"} 
                    stroke={currLens.type === 'space' ? "#0066FF" : "#CCC"}
                    onClick={() => handleClick('space')} style={{cursor: "pointer"}}
                    transform={`translate(${(LENS_BUTTON_SIZE+8)*2}, 0) scale(${LENS_BUTTON_SIZE/50})`}
                >
                    {SpaceButton}
                </g>
            </ButtonCont>
            {currLens.type === 'axis' ?
                <PropertiesCont>
                    <div>
                        <div>Horizontal Axis</div>
                        <Dropdown className="dropdown" value={currLens.properties.x} data-axis='horizontal' onChange={handleChange}>
                            <option value="Negative">Negative</option>
                            <option value="Neutral">Neutral</option>
                            <option value="Positive">Positive</option>
                            <option value="Anger">Anger</option>
                            <option value="Joy">Joy</option>
                            <option value="Optimism">Optimism</option>
                            <option value="Sadness">Sadness</option>
                        </Dropdown>
                    </div>
                    <div>
                        <div>Vertical Axis</div>
                        <Dropdown value={currLens.properties.y} data-axis='vertical' onChange={handleChange}>
                            <option value="Negative">Negative</option>
                            <option value="Neutral">Neutral</option>
                            <option value="Positive">Positive</option>
                            <option value="Anger">Anger</option>
                            <option value="Joy">Joy</option>
                            <option value="Optimism">Optimism</option>
                            <option value="Sadness">Sadness</option>
                        </Dropdown>
                    </div>
                </PropertiesCont> :
                ""
            }
        </div>
    )
}

const ButtonCont = styled.svg`
    margin-bottom: 12px;
`;

const PropertiesCont = styled.div`
    display: flex;
    flex-direction: column;
    background-color: #fff;
    border: solid 1px #0066FF;
    border-radius: 8px;
    padding: 8px;
    gap: 10px;
    color: #333;
    font-size: 14px;
`;

const Dropdown = styled.select`
    border-color: #ccc;
    width: 100%;
    padding: 2px 4px;
    color: #333;
`;

export default LensContent;