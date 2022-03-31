import React, { useState, useEffect, useRef } from 'react';
import styled from 'styled-components';

import TextareaAutosize from '@mui/base/TextareaAutosize';

function InputContent(props) {
    const [clickedSeparator, setClickedSeparator] = useState(null);

    function handleChange(e) {
        var slotId = e.target.getAttribute('data-id');
        if(slotId === "output-prefix") {
            props.changeOutputPrefix(props.buttonId, e.target.value);
        } else {
            props.changeSlot(e.target.getAttribute("data-id"), e.target.value);
        }
    }

    function handleClickAnywhere(e) {
        if(e.target.classList.contains("separator"))  return;
        setClickedSeparator(null);
    }

    function handleClickSeparator(e) {
        console.log(e.target)
        setClickedSeparator(parseInt(e.target.getAttribute('data-idx')));
    }

    function handleCreateSlot(type) {
        props.createSlot(props.buttonId, type, clickedSeparator);
        setClickedSeparator(null);
    }

    function handleClickSlot(e) {
        if(e.target.tagName === 'TEXTAREA') return;
        e.stopPropagation();
        var data = e.target.getAttribute('data-id');
        if(props.selected && props.selected.type === 'slot' && props.selected.data === data)
            props.setSelected({type: null});
        else
            props.setSelected({type: 'slot', data: e.target.getAttribute('data-id')});
    }

    function drawSeparator(idx) {
        var result = null;
        if(clickedSeparator === null || clickedSeparator !== idx) {
            result = (
                <Separator key={"s-" + idx} className="separator" data-idx={idx} onClick={handleClickSeparator}>
                    <SeparatorButton className="separator" data-idx={idx}></SeparatorButton>
                </Separator>
            )
        } else if(clickedSeparator === idx) {
            result = (
                <TypeButtonCont key="separator-buttons">
                    <TypeButton 
                        style={{border: "solid 2px #0066FF", backgroundColor: "#fff", color: "#ccc"}}
                        onClick={() => handleCreateSlot('input')}
                    >
                        Input text...
                    </TypeButton>
                    <TypeButton
                        onClick={() => handleCreateSlot('whole')}
                    >
                        [ Whole Text ]
                    </TypeButton>
                    <TypeButton
                        onClick={() => handleCreateSlot('selection')}
                    >
                        [ Selection ]
                    </TypeButton>
                </TypeButtonCont>
            )
        }
        return result;
    }

    function drawSlots() {
        var result = [];
        var slotIds = props.buttons[props.buttonId].slots;

        result.push(drawSeparator(0))

        for(var i = 0; i < slotIds.length; i++) {
            var slot = props.slots[slotIds[i]];

            if(slot.type === 'input') {
                result.push(
                    <TextAreaCont 
                        key={i} data-id={slotIds[i]} onClick={handleClickSlot}
                        isSelected={props.selected.type === 'slot' && props.selected.data === slotIds[i]}
                    >
                        <TextareaAutosize
                            className="no-outline"
                            style={textareaStyle}
                            value={slot.text} data-id={slotIds[i]}
                            onChange={handleChange}
                            placeholder="Input text..."
                        />
                    </TextAreaCont>
                )
            } else if(slot.type === 'whole') {
                result.push(
                    <DualCont key={i} data-id={slotIds[i]} onClick={handleClickSlot}>
                        <PrefixCont 
                            data-id={slotIds[i]} 
                            isSelected={props.selected.type === 'slot' && props.selected.data === slotIds[i]}
                        >
                            <TextareaAutosize
                                className="no-outline"
                                style={{...textareaStyle, textAlign: "right"}}
                                value={slot.text} data-id={slotIds[i]}
                                onChange={handleChange} placeholder="Input text..."
                            />
                        </PrefixCont>
                        <StaticCont 
                            data-id={slotIds[i]}
                            isSelected={props.selected.type === 'slot' && props.selected.data === slotIds[i]}
                        >
                            [ Whole Text ]
                        </StaticCont>
                    </DualCont>
                )
            } else if(slot.type === 'selection') {
                result.push(
                    <DualCont key={i} data-id={slotIds[i]} onClick={handleClickSlot}>
                        <PrefixCont 
                            data-id={slotIds[i]}
                            isSelected={props.selected.type === 'slot' && props.selected.data === slotIds[i]}
                        >
                            <TextareaAutosize
                                className="no-outline"
                                style={{...textareaStyle, textAlign: "right"}}
                                value={slot.text} data-id={slotIds[i]}
                                onChange={handleChange}
                                placeholder="Input text..."
                            />
                        </PrefixCont>
                        <StaticCont 
                            data-id={slotIds[i]}
                            isSelected={props.selected.type === 'slot' && props.selected.data === slotIds[i]}
                        >
                            [ Selection ]
                        </StaticCont>
                    </DualCont>
                )
            }

            result.push(drawSeparator(i+1));
        }

        result.push(
            <DualCont key={"output-prefix"} style={{cursor: "auto"}}>
                <PrefixCont style={{borderLeft: "solid 2px", borderColor: "#0066FF66"}}>
                    <TextareaAutosize
                        className="no-outline"
                        style={{...textareaStyle, textAlign: "right"}}
                        value={props.buttons[props.buttonId].outputPrefix}
                        data-id={"output-prefix"}
                        onChange={handleChange}
                        placeholder="Input text..."
                    />
                </PrefixCont>
                <StaticCont style={{backgroundColor: "#0066FF66"}}>
                    [ Output ]
                </StaticCont>
            </DualCont>
        )

        return result;
    }

    return (
        <InputContainer onClick={handleClickAnywhere}>
            <ContainerHeader>
                Input
            </ContainerHeader>
            <SlotContainer>
                {drawSlots()}
            </SlotContainer>
        </InputContainer>
    );
}

const SlotContainer = styled.div`
    display: flex;
    flex-direction: column;
    justify-content: center;
`;

const InputContainer = styled.div`
    width: 340px;
    padding: 8px 16px 16px 16px;
    background-color: #0066FF1A;
    border-radius: 12px;
    height: fit-content;
`;

const ContainerHeader = styled.div`
    font-size: 18px;
    color: #0066FF;
    width: 100%;
`;

const TextAreaCont = styled.div`
    width: 100%;
    padding: 4px 8px;
    border: solid 2px ${props => props.isSelected ? "#00C2FF" : "#0066FF"};
    border-radius: 4px;
    background-color: #fff;
    height: auto;
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    border-left: solid 14px ${props => props.isSelected ? "#00C2FF" : "#0066FF"};
    box-shadow: 0 2px 2px rgba(0, 0, 0, 0.25);
`;

const textareaStyle = {
    width: "100%",
    fontSize: "14px",
    color: "#333",
    resize: "none",
    padding: "0px",
    margin: "0px",
    border: "none",
    cursor: "auto"
};

const DualCont = styled.div`
    display: flex;
    flex-direction: row;
    gap: 4px;
    cursor: pointer;
`;

const PrefixCont = styled.div`
    padding: 4px 8px;
    border: solid 2px ${props => props.isSelected ? "#00C2FF" : "#0066FF"};
    border-radius: 4px;
    background-color: #fff;
    height: auto;
    flex: 1;
    display: flex;
    align-items: center;
    justify-content: center;
    border-left: solid 14px ${props => props.isSelected ? "#00C2FF" : "#0066FF"};
    text-align: right;
`;

const StaticCont = styled.div`
    color: #fff;
    border-radius: 4px;
    border: ${props => props.isSelected ? "solid 2px #00C2FF" : "none"};
    padding: 4px 8px;
    width: 110px;
    background-color: #0066FF;
    font-size: 14px;
    display: flex;
    align-items: center;
    justify-content: center;
`;

const Separator = styled.div`
    width: 100%;
    height: 14px;
    margin: 2px 0;
    opacity: 0;
    cursor: pointer;
    &:hover {
        opacity: 1;
        padding: 4px;
    }
`;

const SeparatorButton = styled.div`
    width: 100%;
    height: 6px;
    background-color: #0066FF66;
`;

const TypeButtonCont = styled.div`
    display: flex;
    flex-direction: row;
    justify-content: center;
    gap: 2px;
    padding: 8px 4px;
    background-color: #0066FF55;
    margin: 8px 0;
`;

const TypeButton = styled.div`
    color: #fff;
    border-radius: 4px;
    border: none;
    padding: 4px 8px;
    background-color: #0066FF80;
    font-size: 14px;
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
`;


export default InputContent;