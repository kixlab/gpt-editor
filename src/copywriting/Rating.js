import React, { useState, useRef, useEffect } from 'react';

const RATING_SIZE = 60 + 12;
const CIRCLE_RADIUS = 24;

function cleanPercentage(percentage) {
    const isNegativeOrNaN = !Number.isFinite(+percentage) || percentage < 0; // we can set non-numbers to 0 here
    const isTooHigh = percentage > 100;
    return isNegativeOrNaN ? 0 : isTooHigh ? 100 : +percentage;
};

const Circle = ({ color, percentage, prevPercentage }) => {
    const circ = 2 * Math.PI * CIRCLE_RADIUS;
    const strokePct = ((100 - (percentage + prevPercentage)) * circ) / 100; // where stroke will start, e.g. from 15% to 100%.
    return (
        <circle
            r={CIRCLE_RADIUS}
            cx={RATING_SIZE/2}
            cy={RATING_SIZE/2}
            fill="transparent"
            stroke={strokePct !== circ ? color : ""} // remove colour as 0% sets full circumference
            strokeWidth={"6px"}
            strokeDasharray={circ}
            strokeDashoffset={percentage ? strokePct : 0}
        ></circle>
    );
};

const Text = ({ percentage, color }) => {
    return (
        <text
            x="50%"
            y="50%"
            dominantBaseline="central"
            textAnchor="middle"
            fontSize={"20px"}
            fill={color}
        >
            {percentage.toFixed(0)}
        </text>
    );
};

const Rating = (props) => {
    const ratingRef = useRef(null);
    const [isHover, setIsHover] = useState(false);

    useEffect(() => {
        if(isHover) return;
        if(props.hoverGen === props.genIdx)
            ratingRef.current.scrollIntoView({ behavior: "smooth" });
    }, [props.hoverGen]);

    var circles = [];
    var totalPercentage = 0;
    var maxPercentage = 0;
    var maxColor = "#fff";
    for(var i = 0; i < props.percentages.length; i++) {
        var pct = cleanPercentage(props.percentages[i]);
        circles.unshift(<Circle key={i} color={props.colors[i]} percentage={pct} prevPercentage={totalPercentage} />);
        totalPercentage += pct;
        if(pct > maxPercentage) {
            maxPercentage = pct;
            maxColor = props.colors[i];
        }
    }
    if(props.hoverGen === props.genIdx) {
        circles.unshift(
            <circle
                key={props.percentages.length+1}
                r={CIRCLE_RADIUS + 8}
                cx={RATING_SIZE/2}
                cy={RATING_SIZE/2}
                fill="#fff"
                stroke={"#0066FF"}
                strokeWidth={"3px"}
            />
        )
    }

    function handleMouseEnter() {
        setIsHover(true);
        props.setHoverGen(props.genIdx);
    }

    function handleMouseLeave() {
        props.setHoverGen(null);
        setIsHover(false);
    }

    return (
        <div 
            ref={ratingRef} style={{padding: "60px 0"}} 
        >
            <svg 
                width={RATING_SIZE} height={RATING_SIZE} style={{cursor: "pointer"}}
                onMouseEnter={handleMouseEnter} onMouseLeave={handleMouseLeave}
            >
                <g>
                    {circles}
                </g>
                <Text percentage={maxPercentage} color={maxColor} />
            </svg>
        </div>
    );
};

export default Rating;