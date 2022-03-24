import React, { useState, useRef, useLayoutEffect } from 'react';
import styled from "styled-components";

function GenerationSpace(props) {
    const containerRef = useRef(null);
    const [containerDims, setContainerDims] = useState([0, 0]);
    const [spaceHover, setSpaceHover] = useState(null);

    useLayoutEffect(() => {
        // I don't think it can be null at this point, but better safe than sorry
        if (containerRef.current) {
            setContainerDims([
                Math.floor(containerRef.current.getBoundingClientRect().width), 
                Math.floor(containerRef.current.getBoundingClientRect().height)
            ]);
        }
    }, []);

    function translateCoordinates(coordinates, xRange, yRange) {
        var {x, y} = coordinates;
        var [xLoOld, xHiOld] = xRange;
        var [yLoOld, yHiOld] = yRange;
        const xLoNew = 24;
        const xHiNew = containerDims[0] - 24;
        const yLoNew = 24;
        const yHiNew = containerDims[1] - 24;
        var xNew = (x-xLoOld) / (xHiOld-xLoOld) * (xHiNew-xLoNew) + xLoNew;
        var yNew = (y-yLoOld) / (yHiOld-yLoOld) * (yHiNew-yLoNew) + yLoNew;
        return [xNew, yNew];
    }

    function handleSpaceHover(e, isHover) {
        if(isHover) {
            var text = e.target.getAttribute('data-text');
            setSpaceHover({
                text: text, 
                x: parseInt(e.target.getAttribute('data-x')), 
                y: parseInt(e.target.getAttribute('data-y'))
            });
        } else {
            setSpaceHover(null);
        }
    }

    function handleItemClick(e) {
        var index = parseInt(e.target.getAttribute("data-idx"));
        props.copyGeneration(props.lens.generations[index].text);
    }

    var xRange = [1000000, -1000000];
    var yRange = [1000000, -1000000];
    for(var i = 0; i < props.lens.generations.length; i++) {
        var generation = props.lens.generations[i];
        var coordinates = generation.coordinates;
        xRange[0] = Math.min(xRange[0], coordinates.x);
        xRange[1] = Math.max(xRange[1], coordinates.x);
        yRange[0] = Math.min(yRange[0], coordinates.y);
        yRange[1] = Math.max(yRange[1], coordinates.y);
    }

    const pointsSvg = [];
    for (var i = 0; i < props.lens.generations.length; i++) {
        var generation = props.lens.generations[i];
        var [x, y] = translateCoordinates(generation.coordinates, xRange, yRange);
        pointsSvg.push(
            <circle
                key={i} cx={x} cy={y} r="6" style={{cursor: "pointer"}}
                fill={props.switches[generation.switchId].color} 
                stroke="#fff" strokeWidth="1" data-text={generation.text} data-x={x} data-y={y}
                data-idx={i} onClick={handleItemClick}
                onMouseEnter={(e) => handleSpaceHover(e, true)} 
                onMouseLeave={(e) => handleSpaceHover(e, false)}
            />
        )
    }


    return (
        <>
            <SpaceContainer ref={containerRef}>
                <foreignObject 
                    x="0" y="0" width={containerDims[0]} height={containerDims[1]}
                >
                    <HoverText>
                        <div>
                            {spaceHover ? spaceHover.text : ''}
                        </div>
                    </HoverText>
                </foreignObject>
                {pointsSvg}
            </SpaceContainer>
        </>
    )
}

const SpaceContainer = styled.svg`
    width: 100%;
    height: 100%;
`;
const HoverText = styled.div`
    display: flex;
    justify-content: center;
    height: 100%;
    width: 100%;
    align-items: center;
    padding: 8px;
    color: #0066ff88;
    -webkit-user-select: none; /* Safari */        
    -moz-user-select: none; /* Firefox */
    -ms-user-select: none; /* IE10+/Edge */
    user-select: none; /* Standard */
`;

export default GenerationSpace;