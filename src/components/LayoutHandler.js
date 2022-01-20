import React, { useEffect } from 'react';
import { useStore, useZoomPanHelper } from 'react-flow-renderer';

function LayoutHandler(props) {
    const store = useStore();

    useEffect(() => {
        const { nodes, width, height, transform } = store.getState();

        var cursorNode = nodes[props.cursor];

        var newTransform = {
            x: width / 2 - cursorNode.position.x * transform[2],
            y: height / 2 - cursorNode.position.y * transform[2] - props.nodeHeight*2
        };

        props.handleTransform(newTransform);
    }, [props.elements, props.cursor]);

    return (
        ''
    );
};

export default LayoutHandler;