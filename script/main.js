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

class ScratchList {
    constructor(scratchRepository) {
        this.scratchRepository = scratchRepository
        this.container = null
    }

    showInContainer(container) {
        this.container = container
        this.scratchRepository.findAll().forEach(this._showScratch.bind(this))

        this.scratchRepository.subscribe(event => {
            if (event.type === "change") {
                this._onDataChange(event.payload)
            }
        })
    }

    _createScratch(scratch) {
        return $("<div/>", {
            class: "card light-theme-card",
            html: scratch.content
        }).draggable({
            revert: true
        }).data("id", scratch.id)
    }

    _showScratch(scratch) {
        this.container.append(this._createScratch(scratch))
    }

    _onDataChange(newData) {
        this.container.html("")
        newData.forEach(this._showScratch.bind(this))
    }
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

    const scratchList = new ScratchList(scratchRepository);
    scratchList.showInContainer($("#items-list"))

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