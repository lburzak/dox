class DataEvent {
    Type = "test"
    constructor(type, payload) {
        this.type = type
        this.payload = payload
    }
}

class ScratchRepository {
    constructor(data) {
        this.data = [...data];
        this.listeners = [];
    }

    findAll() {
        return [...this.data];
    }

    findOne(id) {
        return this.data.find(scratch => scratch.id === id);
    }

    removeOne(id) {
        this.data = this.data.filter(scratch => scratch.id !== id);

        this.listeners.forEach(onEvent => {
            onEvent({ type: "change", payload: [...this.data] })
        })
    }

    subscribe(onEvent) {
        this.listeners.push(onEvent)
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

function showScratch(scratch) {
    $("#items-list").append(createScratch(scratch))
}

$(document).ready(function () {
    const scratchRepository = new ScratchRepository([
        {id: 0, content: "This is some scratch text"},
        {id: 1, content: "Lorem ipsum dolor sit amet, consectetur adipiscing."},
        {
            id: 2,
            content: "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nunc sit amet imperdiet nisi, ut\n" +
                "    hendrerit magna.\n"
        },
        {id: 3, content: "Hello"}
    ]);

    scratchRepository.findAll().forEach(showScratch)

    scratchRepository.subscribe(event => {
        if (event.type === "change") {
            $("#items-list").html("")
            event.payload.forEach(showScratch)
        }
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