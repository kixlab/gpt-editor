import React, { useState } from 'react';

import {
    SWITCH_SIZE,
    LENS_X_OFFSET,
    LENS_SIZE
} from './Sizes';

import {
    ListSmall,
    SpaceSmall,
    PeekSmall,
    ListBig,
    SpaceBig,
    PeekBig
} from './SVG.js'

function Lens(props) {
    const lens = props.lenses[props.lensId];

    if (lens === undefined) {
        return (
            <>
                <g
                    transform={`translate(${LENS_X_OFFSET}, ${props.position})`}
                    style={{ cursor: "pointer" }}
                    onClick={() => props.selectLens(props.switchId, 'list')}
                >
                    {ListSmall}
                </g>
                <g
                    transform={`translate(${LENS_X_OFFSET + 50 + 4}, ${props.position})`}
                    style={{ cursor: "pointer" }}
                    onClick={() => props.selectLens(props.switchId, 'space')}
                >
                    {SpaceSmall}
                </g>
                <g
                    transform={`translate(${LENS_X_OFFSET + 100 + 8}, ${props.position})`}
                    style={{ cursor: "pointer" }}
                    onClick={() => props.selectLens(props.switchId, 'peek')}
                >
                    {PeekSmall}
                </g>
            </>
        )
    }

    switch (lens.type) {
        case 'list':
            return (
                <g id={props.lensId} transform={`translate(${LENS_X_OFFSET}, ${props.position})`}>
                    {ListBig}
                </g>
            )
        case 'space':
            return (
                <g id={props.lensId} transform={`translate(${LENS_X_OFFSET}, ${props.position})`}>
                    {SpaceBig}
                </g>
            )
        case 'peek':
            return (
                <g id={props.lensId} transform={`translate(${LENS_X_OFFSET}, ${props.position})`}>
                    {PeekBig}
                </g>
            )
    }
}

export default Lens;