class ScratchRepository {
    data = [
        { id: 0, content: "This is some scratch text" },
        { id: 1, content: "Lorem ipsum dolor sit amet, consectetur adipiscing."},
        { id: 2, content: "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nunc sit amet imperdiet nisi, ut\n" +
                "    hendrerit magna.\n" },
        { id: 3, content: "Hello" }
    ];

    findAll() {
        return [ ...this.data ];
    }

    findOne(id) {
        return this.data.find(scratch => scratch.id === id);
    }

    removeOne(id) {
        this.data = this.data.filter(scratch => scratch.id !== id);
    }
}

function createScratch(scratch) {
    return $("<div/>", {
        class: "card light-theme-card",
        html: scratch.content
    }).draggable({
        revert: true
    }).data("id", scratch.id)
}

$(document).ready(function () {
    const scratchRepository = new ScratchRepository();

    scratchRepository.findAll().forEach(scratch => {
        createScratch(scratch).appendTo("#sidebar")
    })

    $('#sidebar').resizable({
        handles: 'e'
    });

    $('#canvas-input').droppable({
        drop: function (event, ui) {
            const id = ui.draggable.data("id")
            const scratch = scratchRepository.findOne(id)

            if (scratch !== undefined) {
                scratchRepository.removeOne(id)
                $(this).append(scratch.content);
            }
        }
    })
})