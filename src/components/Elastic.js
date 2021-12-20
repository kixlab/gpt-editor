import React, { useState, useRef, useEffect } from 'react';
import styled from "styled-components";

const bezierWeight = 0.675;

function Elastic(props) {
    const svgRef = useRef();
    const [path, setPath] = useState('');

    useEffect(() => {
        const position = svgRef.current.getBoundingClientRect();

        var x1 = props.startPoint[0] - position.left;
        var y1 = props.startPoint[1] - position.top;
        var x4 = props.endPoint[0] - position.left;
        var y4 = props.endPoint[1] - position.top;

        var dx = Math.abs(x4 - x1) * bezierWeight;
    
        var x2 = x1 - dx;
        var x3 = x4 + dx;
        
        setPath(`M ${x1} ${y1} C ${x2} ${y1}, ${x3} ${y4}, ${x4} ${y4}`);  
    }, [props.startPoint, props.endPoint]);

    return (
        <ElasticCont ref={svgRef}>
            <path d={path} stroke="black" fill="transparent" />
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