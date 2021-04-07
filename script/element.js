function renderScratchDragHelper() {
    return $("<div/>", {
        class: "icon icon-scratch",
        style: "height: 40px"
    })
}

function renderScratch(content) {
    return $("<div/>", {
        class: "light-theme card",
        html: content
    });
}

function renderDoc(doc) {
    return $("<div/>", {
        class: "light-theme file-row",
        html: doc.title
    })
}

function renderTrash() {
    return $("<div/>", {
        class: "icon icon-trash"
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