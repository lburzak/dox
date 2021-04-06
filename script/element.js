const SCRATCH_DRAGGABLE_OPTS = Object.freeze({
    helper: renderScratchDragHelper,
    opacity: 0.5,
    cursorAt: {
        top: 30,
        left: 30
    }
})

function renderScratchDragHelper() {
    return $("<div/>", {
        class: "icon icon-scratch",
        style: "height: 40px"
    })
}

function renderScratch(scratch) {
    const element = $("<div/>", {
        class: "card light-theme-card",
        html: scratch.content
    }).draggable(SCRATCH_DRAGGABLE_OPTS);

    putMetadata(element, {id: scratch.id});

    return element;
}

function renderDoc(doc) {
    return $("<div/>", {
        class: "file-row light-theme-card",
        html: doc.title
    })
}

function putMetadata($element, metadata) {
    $element.data("id", metadata.id);
}

function retrieveMetadata($element) {
    return {
        id: $element.data("id")
    };
}