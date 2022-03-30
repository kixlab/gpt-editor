import React from 'react';

import {
    SWITCH_SIZE,
    SWITCH_Y_SPACE,
    LENS_X_OFFSET,
    LENS_SIZE
} from './Sizes';

import {
    ListSmall,
    SpaceSmall,
    PeekSmall
} from './SVG.js'

import ListSpaceLens from './ListSpaceLens';
import PeekLens from './PeekLens';

function Lens(props) {
    const lens = props.lenses[props.lensId];

    if (lens === undefined) {
        return (
            <>
                <g
                    transform={`translate(${LENS_X_OFFSET}, ${props.position})`}
                    style={{ cursor: "pointer" }}
                    onClick={() => props.chooseLens(props.switchId, 'list')}
                >
                    {ListSmall}
                </g>
                <g
                    transform={`translate(${LENS_X_OFFSET + 50 + 4}, ${props.position})`}
                    style={{ cursor: "pointer" }}
                    onClick={() => props.chooseLens(props.switchId, 'space')}
                >
                    {SpaceSmall}
                </g>
                <g
                    transform={`translate(${LENS_X_OFFSET + 100 + 8}, ${props.position})`}
                    style={{ cursor: "pointer" }}
                    onClick={() => props.chooseLens(props.switchId, 'peek')}
                >
                    {PeekSmall}
                </g>
            </>
        )
    }

    function clickEdge(e) {
        let data = e.target.getAttribute("data-id");
        props.setSelected({type: "switch-lens-edge", data: data});
    }

    function drawConnectors(lens) {
        var connectors = [];
        for (var i = 0; i < lens.switches.length; i++) {
            var edgeStr = lens.switches[i] + '-' + props.lensId;
            var isSelected = props.selected && props.selected.type === 'switch-lens-edge' && props.selected.data === edgeStr;
            if(lens.isPinned) {
                var xPosition = LENS_X_OFFSET + LENS_SIZE + 32 + LENS_SIZE/2;
                connectors.push(
                    <line 
                        key={edgeStr+"drawn"}
                        x1={xPosition} y1={props.position - 16} 
                        x2={xPosition} y2={props.position}  
                        stroke={isSelected ? 'rgb(0, 194, 255)' : "#0066FF"} 
                        strokeWidth={isSelected ? "4px" : "2px"}
                        style={{cursor: 'pointer'}}
                    />
                )
                connectors.push(
                    <line 
                        key={edgeStr} onClick={clickEdge}
                        data-type={'switch-lens-edge'} data-id={edgeStr}
                        x1={xPosition} y1={props.position - 16} 
                        x2={xPosition} y2={props.position}  
                        stroke={"#00000000"} 
                        strokeWidth={"20px"}
                        style={{cursor: 'pointer'}}
                    />
                )
            } else if(i < 1 || !lens.collapse) {
                connectors.push(
                    <line 
                        key={edgeStr+"drawn"}
                        x1={LENS_X_OFFSET - 28 - 32} y1={i*(SWITCH_SIZE + SWITCH_Y_SPACE) + SWITCH_SIZE/2 + props.position} 
                        x2={LENS_X_OFFSET + 4} y2={i*(SWITCH_SIZE + SWITCH_Y_SPACE) + SWITCH_SIZE/2 + props.position}  
                        stroke={isSelected ? 'rgb(0, 194, 255)' : "#0066FF"} 
                        strokeWidth={isSelected ? "4px" : "2px"}
                        style={{cursor: 'pointer'}}
                    />
                )
                connectors.push(
                    <line 
                        key={edgeStr} onClick={clickEdge}
                        data-type={'switch-lens-edge'} data-id={edgeStr}
                        x1={LENS_X_OFFSET - 28} y1={i*(SWITCH_SIZE + SWITCH_Y_SPACE) + SWITCH_SIZE/2 + props.position} 
                        x2={LENS_X_OFFSET + 4} y2={i*(SWITCH_SIZE + SWITCH_Y_SPACE) + SWITCH_SIZE/2 + props.position}  
                        stroke={"#00000000"} 
                        strokeWidth={"20px"}
                        style={{cursor: 'pointer'}}
                    />
                )
            } else {
                var pathD = `M${LENS_X_OFFSET - 28 - 32} ${i*(SWITCH_SIZE + SWITCH_Y_SPACE) + SWITCH_SIZE/2 + props.position} h ${16} V ${SWITCH_SIZE/2 + props.position} h ${16}`
                connectors.unshift(
                    <path 
                        key={edgeStr} onClick={clickEdge}
                        data-type={'switch-lens-edge'} data-id={edgeStr}
                        d={pathD} fill="none"
                        stroke={"#00000000"} 
                        strokeWidth={"10px"}
                        style={{cursor: 'pointer'}}
                    />
                )
                connectors.unshift(
                    <path 
                        key={edgeStr+"drawn"}
                        d={pathD} fill="none"
                        stroke={isSelected ? 'rgb(0, 194, 255)' : "#0066FF"} 
                        strokeWidth={isSelected ? "4px" : "2px"}
                        style={{cursor: 'pointer'}}
                    />
                )
            }
        }
        return connectors;
    }

    function drawLens(lens) {
        switch (lens.type) {
            case 'list':
            case 'space':
                if(lens.collapse) {
                    return (
                        <g
                            transform={`translate(${LENS_X_OFFSET}, ${props.position})`} style={{ cursor: "pointer" }}
                            onClick={() => props.changeLensProperty(props.lensId, 'collapse', false)}
                            data-type="lens" data-id={props.lensId}
                        >
                            {lens.type === 'list' ? ListSmall : SpaceSmall}
                        </g>
                    )
                } else {
                    return (
                        <ListSpaceLens 
                            lensId={props.lensId} lenses={props.lenses} 
                            switches={props.switches} position={props.position}
                            slotifyGenerations={props.slotifyGenerations}
                            changeLensProperty={props.changeLensProperty}
                        />
                    )
                }
            case 'peek':
                var xPosition = LENS_X_OFFSET + (lens.isPinned ? LENS_SIZE + 32 + LENS_SIZE/2 - SWITCH_SIZE/2 : 0);
                if(lens.collapse) {
                    return (
                        <g
                            transform={`translate(${xPosition}, ${props.position})`} style={{ cursor: "pointer" }}
                            onClick={() => props.changeLensProperty(props.lensId, 'collapse', false)}
                            data-type="lens" data-id={props.lensId}
                        >
                            {PeekSmall}
                        </g>
                    )
                } else {
                    return (
                        <PeekLens 
                            lensId={props.lensId} lenses={props.lenses} 
                            switches={props.switches} position={props.position}
                            slotifyGenerations={props.slotifyGenerations}
                            changeLensProperty={props.changeLensProperty}
                        />
                    )
                }
        }
    }
    
    return (
        <>
            {drawConnectors(lens)}
            {drawLens(lens)}
        </>
    )
}

export default Lens;