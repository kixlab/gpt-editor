const updateLayout = (elements, nodeId) => {
    const copyElements = [... elements];

    // find node update its position
    const nodeIdx = copyElements.findIndex((tmp) => tmp.id === nodeId);
    const node = copyElements[nodeIdx];

    // find children of nodeid
    const edges = copyElements.filter((el) => el.source === nodeId);
    edges.forEach((edge, idx) => {
        console.log(copyElements);
        console.log(edge);
        const childNode = copyElements.find((el) => el.id === edge.target);
        childNode.position = {
            x: node.position.x + idx * (nodeSpacing + nodeWidth),
            y: node.position.y + nodeHeight + nodeSpacing,
        };
    });

    node.position = {
        x: node.position.x + nodeSpacing + nodeWidth,
        y: node.position.y
    }

    // update upwards
    var tempId = nodeId;
    var toNodeEdge = copyElements.find((el) => el.target === tempId);
    while(toNodeEdge) {
        var parentId = toNodeEdge.source;
        var parentEdges = copyElements.filter((el) => el.source === parentId);
        var isLMR = parentEdges.findIndex((el) => el.target === tempId);

        var parentNode = copyElements.find((el) => el.id === parentId);
        parentNode.position = {
            x: parentNode.position.x + (isLMR < 2 ? 2 : 0) * (nodeSpacing + nodeWidth),
            y: parentNode.position.y,
        }

        if(isLMR == 0) {
            updateDown(copyElements, parentEdges[1].target, isLMR < 2 ? 2 : 0);
        }
        
        if(isLMR < 2) {
            updateDown(copyElements, parentEdges[2].target, isLMR < 2 ? 2 : 0);
        }

        toNodeEdge = copyElements.find((el) => el.target === parentId);
        tempId = parentId;
    }

    return copyElements;
};

const updateDown = (elements, nodeId, multi) => {
    var node = elements.find((tmp) => tmp.id === nodeId);
    node.position = {
        x: node.position.x + multi * (nodeSpacing + nodeWidth),
        y: node.position.y,
    }

    var children = elements.filter((tmp) => tmp.source === nodeId).map((tmp) => tmp.target);

    children.forEach((child) => updateDown(elements, child, multi));
}