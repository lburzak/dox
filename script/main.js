class RepositoryList {
    constructor(repository) {
        this.repository = repository;
        this.container = this._buildContainer();

        this.repository.findAll().forEach(this._appendRow.bind(this));
        this.repository.subscribe(this._onDataChange.bind(this));
    }

    get root() {
        return this.container;
    }

    _buildContainer() {
    }

    _buildRow(entity) {
    }

    _appendRow(entity) {
        this.container.append(this._buildRow(entity));
    }

    _onDataChange(entities) {
        this.container.html("");
        entities.forEach(this._appendRow.bind(this));
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
        return renderScratch(scratch);
    }
}

class DocList extends RepositoryList {
    constructor(docRepository) {
        super(docRepository);
    }

    _buildContainer() {
        return $("<div/>", { id: "items-list" })
    }

    _buildRow(doc) {
        return renderDoc(doc)
    }
}

class InputBox {
    constructor() {
        this.element = this._build()
        this._bind(this.element)
    }

    get root() {
        return this.element
    }

    onSubmit() {}
    onKeyEvent(event) {}
    _build() {}

    _bind(element) {
        element.bind("submit", function () {
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

class ScratchInputBox extends InputBox {
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

    _build() {
        return $("<textarea\>", {
            id: "scratch-input",
            class: "light-theme-editor",
            rows: 3
        })
    }
}

class DocInputBox extends InputBox {
    constructor(docRepository) {
        super()
        this.docRepository = docRepository
    }

    onKeyEvent(event) {
        if (event.keyCode === 10 || event.keyCode === 13)
            this.triggerSubmit()
    }

    onSubmit(text) {
        this.docRepository.createOne(text);
    }

    _build() {
        return $("<textarea\>", {
            id: "scratch-input",
            class: "light-theme-editor",
            rows: 1
        })
    }
}

class Pager {
    constructor() {
        this.pages = [];
        this.container = $('<div/>', { class: 'pager' });
    }

    get root() {
        return this.container;
    }

    addPage(element) {
        return this.pages.push(element) - 1;
    }

    switchPage(pos) {
        this.container.html(this.pages[pos]);
    }
}

$(document).ready(function () {
    const scratchRepository = new ScratchRepository(localStorage);
    const scratchList = new ScratchList(scratchRepository);
    const scratchInputBox = new ScratchInputBox(scratchRepository);
    const docRepository = new DocRepository(localStorage);
    const docList = new DocList(docRepository)
    const docInputBox = new DocInputBox(docRepository)

    const pager = new Pager();

    const pageDoc = pager.addPage(
        $('<div/>')
            .append(docInputBox.root, docList.root)
    );

    const pageScratch = pager.addPage(
        $('<div/>')
            .append(scratchInputBox.root, scratchList.root)
    );

    $('#show-docs').click(() => pager.switchPage(pageDoc));
    $('#show-scratches').click(() => pager.switchPage(pageScratch));

    $('#sidebar').resizable({ handles: 'e' })
        .append(pager.root)

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