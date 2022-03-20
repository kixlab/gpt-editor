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
    PeekSmall,
    SpaceBig,
    PeekBig
} from './SVG.js'

import ListLens from './ListLens';

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
            connectors.push(
                <line 
                    key={edgeStr+"drawn"}
                    x1={LENS_X_OFFSET - 28} y1={i*(SWITCH_SIZE + SWITCH_Y_SPACE) + SWITCH_SIZE/2 + props.position} 
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
        }
        return connectors;
    }

    function drawLens(lens) {
        switch (lens.type) {
            case 'list':
                return (
                    <ListLens 
                        lensId={props.lensId} lenses={props.lenses} 
                        switches={props.switches} position={props.position}
                        slotifyGenerations={props.slotifyGenerations}
                    />
                )
            case 'space':
                return (
                    <g id={props.lensId} 
                        transform={`translate(${LENS_X_OFFSET}, ${props.position})`}
                        data-type="lens" data-id={props.lensId}
                        style={{cursor: 'pointer'}}
                    >
                        {SpaceBig}
                    </g>
                )
            case 'peek':
                return (
                    <g id={props.lensId} 
                        transform={`translate(${LENS_X_OFFSET}, ${props.position})`}
                        data-type="lens" data-id={props.lensId}
                        style={{cursor: 'pointer'}}
                    >
                        {PeekBig}
                    </g>
                )
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