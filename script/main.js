class ScratchRepository {
    constructor(storage) {
        this.storage = storage;
        this.listeners = [];
    }

    get data() {
        return JSON.parse(this.storage["scratches"])
    }

    set data(val) {
        this.storage["scratches"] = JSON.stringify(val)
    }

    get nextId() {
        return this.storage["id_scratches"] = parseInt(this.storage["id_scratches"]) + 1
    }

    findAll() {
        return [...this.data];
    }

    findOne(id) {
        return this.data.find(scratch => scratch.id === id);
    }

    removeOne(id) {
        this.data = this.data.filter(scratch => scratch.id !== id);
        this._emitChange();
    }

    createOne(content) {
        const scratch = { id: this.nextId, content };
        this.data = this.data.concat(scratch);
        this._emitChange()
    }

    subscribe(onEvent) {
        this.listeners.push(onEvent);
    }

    _emitChange() {
        const changedData = [...this.data]
        this.listeners.forEach(listener => listener(changedData))
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
        this.scratchRepository.subscribe(this._onDataChange.bind(this))
    }

    _createScratch(scratch) {
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

    _showScratch(scratch) {
        this.container.append(this._createScratch(scratch))
    }

    _onDataChange(newData) {
        this.container.html("")
        newData.forEach(this._showScratch.bind(this))
    }
}

$(document).ready(function () {
    const scratchRepository = new ScratchRepository(localStorage);

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

    $('#scratch-input').bind("submit", function() {
        scratchRepository.createOne($(this).val());
        $(this).val("")
    }).keypress(function (e) {
        if ((e.keyCode === 10 || e.keyCode === 13) && e.ctrlKey) {
            $(this).trigger("submit")
        }
    })
})