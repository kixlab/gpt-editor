import React, { useState, useRef, useEffect } from 'react';
import styled from "styled-components";

const bezierWeight = 0.65;

function Elastic(props) {
    const svgRef = useRef();
    const [path, setPath] = useState('');

    useEffect(() => {
        const newPath = [];
        const position = svgRef.current.getBoundingClientRect();

        var x1 = props.startPoint[0] - position.left;
        var y1 = props.startPoint[1] - position.top;
        var x4 = props.endPoint[0] - position.left;
        var y4 = props.endPoint[1] - position.top;

        // var dx = Math.abs(x4 - x1) * bezierWeight;
        // var x2 = x1 > x4 ? x1 - dx : x1 + dx;
        // var x3 = x1 > x4 ? x4 + dx : x4 - dx;
        
        // var d = `M ${x1} ${y1} C ${x2} ${y1}, ${x3} ${y4}, ${x4} ${y4}`;  

        var dx = Math.abs(y4 - y1) * bezierWeight;
        var y2 = y1 > y4 ? y1 - dx : y1 + dx;
        var y3 = y1 > y4 ? y4 + dx : y4 - dx;

        var d = `M ${x1} ${y1} C ${x1} ${y2}, ${x4} ${y3}, ${x4} ${y4}`;

        newPath.push(
            <path d={d} stroke="#0179be" fill="transparent" strokeWidth="2px" />
        )

        newPath.push(
            <circle cx={x1} cy={y1} r="5" fill="#0179be" />
        )
        newPath.push(
            <circle cx={x4} cy={y4} r="5" fill="#0179be" />
        )

        setPath(newPath);
    }, [props.startPoint, props.endPoint]);

    return (
        <ElasticCont ref={svgRef}>
            {path}
        </ElasticCont>
    );
}

const ElasticCont = styled.svg`
    position: absolute;
    top: 0;
    left: 12px;
    height: 100%;
    width: calc(100% - 24px);
    z-index: 2;
    pointer-events: none;
`;

export default Elastic;