import React, { useEffect, useState } from 'react';
import styled from "styled-components";

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
    var ele = document.getElementById("filter-button");
    if(ele == undefined)
        return "";

    var position = ele.getClientRects()[0];

    var top = position.y + 34;
    var left = position.x;

    function propsStrToHtml(propsStr) {
        var props = propsStr.split("\n");
        var html = [];
        for(var i = 0; i < props.length - 1; i++) {
            var prop = props[i];
            var propSplit = prop.split(": ");
            var propName = propSplit[0];
            var propValue = propSplit[1];
            if(propName == "engine") {
                propValue = engineMap[propValue];
            }
            propName = propNameMap[propName];
            html.push(<div key={i}>{propName}: <b>{propValue}</b></div>)
        }
        return html;
    }

    function propsChangeToHtml(data) {
        var prevProps = data['prev'].split("\n");
        var currProps = data['curr'].split("\n");
        for(var i = 0; i < currProps.length - 1; i++) {
            if(prevProps[i] == currProps[i]) continue;
            var currProp = currProps[i];
            var currPropSplit = currProp.split(": ");
            var propName = currPropSplit[0];
            var currPropValue = currPropSplit[1];
            var prevPropValue = prevProps[i].split(": ")[1];
            if(propName == "engine") {
                currPropValue = engineMap[currPropValue];
                prevPropValue = engineMap[prevPropValue];
            }
            propName = propNameMap[propName];
            return (<div key={i}>{propName}: <b>{prevPropValue}</b> → <b>{currPropValue}</b></div>);
        }
    }

    return (
        <FilterCont style={{position: "absolute", top: top + "px", left: left + "px"}}>
            <b>Filter</b>
            <br/>
            <div style={{color: "#666", paddingTop: "8px"}}>
                {Object.keys(propNameMap).map((prop) => {
                    return (<div key={prop}>{prop}: <b>hey</b></div>);
                })}
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
    max-width: 400px;
    white-space: pre-wrap;
    color: #333;
`;

export default Filter;