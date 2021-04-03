function renderScratch(scratch) {
    return $("<div/>", {
        class: "card light-theme-card",
        html: scratch.content
    }).draggable({
        helper: function () {
            return $("<div/>", {
                class: "icon icon-scratch",
                style: "height: 40px"
            })
        },
        opacity: 0.5,
        cursorAt: {
            top: 30,
            left: 30
        }
    }).data("id", scratch.id)
}

function renderDoc(doc) {
    return $("<div/>", {
        class: "file-row light-theme-card",
        html: doc.title
    })
}