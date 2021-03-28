class DocumentRepository {
    constructor(storage, collectionName) {
        this.storage = storage;
        this.collectionName = collectionName;
        this.idsLocationName = `id_${this.collectionName}`
        this.listeners = [];
    }

    get data() {
        return JSON.parse(this.storage[this.collectionName])
    }

    set data(val) {
        this.storage[this.collectionName] = JSON.stringify(val)
    }

    get nextId() {
        return this.storage[this.idsLocationName] = parseInt(this.storage[this.idsLocationName]) + 1
    }

    findAll() {
        return [...this.data];
    }

    findOne(id) {
        return this.data.find(document => document.id === id);
    }

    removeOne(id) {
        this.data = this.data.filter(document => document.id !== id);
        this._emitChange();
    }

    insertOne(entity) {
        const document = { id: this.nextId, ...entity };
        this.data = this.data.concat(document);
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

class ScratchRepository extends DocumentRepository {
    constructor(storage) {
        super(storage, "scratches");
    }

    createOne(content) {
        const scratch = { content }
        this.insertOne(scratch)
    }
}

class DocRepository extends DocumentRepository {
    constructor(storage) {
        super(storage, "docs");
    }

    createOne(title) {
        const doc = { title, content: "" }
        this.insertOne(doc)
    }
}

class RepositoryList {
    constructor(repository) {
        this.repository = repository
        this.container = this._buildContainer()

        this.repository.findAll().forEach(this._appendRow.bind(this))
        this.repository.subscribe(this._onDataChange.bind(this))
    }

    get root() {
        return this.container
    }

    _buildContainer() {}

    _buildRow(entity) { }

    _appendRow(entity) {
        this.container.append(this._buildRow(entity))
    }

    _onDataChange(entities) {
        this.container.html("")
        entities.forEach(this._appendRow.bind(this))
    }
}


class ScratchList extends RepositoryList {
    constructor(scratchRepository) {
        super(scratchRepository);
    }

    _buildContainer() {
        return $("<div/>", { id: "items-list" })
    }

    _buildRow(scratch) {
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
}

class InputBoxController {
    constructor() {
        this.element = this._build()
    }

    get root() {
        return this.element
    }

    onSubmit() {}
    onKeyEvent(event) {}

    _build() {
        return $("<textarea\>", {
            id: "scratch-input",
            class: "light-theme-editor"
        })
            .bind("submit", function () {
                const content = $(this.element).val()
                $(this.element).val("")
                this.onSubmit(content)
            }.bind(this))
            .keypress(this.onKeyEvent.bind(this))
    }

    triggerSubmit() {
        this.element.trigger("submit")
    }
}

class ScratchInputBoxController extends InputBoxController {
    constructor(scratchRepository) {
        super()
        this.scratchRepository = scratchRepository
    }

    onKeyEvent(event) {
        if ((event.keyCode === 10 || event.keyCode === 13) && event.ctrlKey)
            this.triggerSubmit()
    }

    onSubmit(content) {
        this.scratchRepository.createOne(content);
    }
}

$(document).ready(function () {
    const scratchRepository = new ScratchRepository(localStorage);
    const scratchList = new ScratchList(scratchRepository);
    const scratchInputBoxController = new ScratchInputBoxController(scratchRepository);

    $('#sidebar').resizable({ handles: 'e' })
        .append(scratchInputBoxController.root)
        .append(scratchList.root)

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