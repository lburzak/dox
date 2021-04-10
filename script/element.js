function renderScratchDragHelper() {
    return $("<div/>", {
        class: "icon icon-scratch"
    })
}

function renderScratch(content) {
    return $("<div/>", {
        class: "light-theme card"
    }).text(content);
}

function renderDoc(doc) {
    return $("<div/>", {
        class: "light-theme file-row"
    }).append($("<span/>").text(doc.title));
}

function renderDeleteDoc() {
    return $("<div/>", {
        class: "icon icon-trash"
    })
}

function renderOption(text, value) {
    return $('<option/>', { value, text })
}

function putMetadata($element, metadata) {
    $element.data("id", metadata.id);
}

function retrieveMetadata($element) {
    return {
        id: $element.data("id")
    };
}