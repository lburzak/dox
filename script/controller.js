class SidebarController {
    static _Tab = Object.freeze({
        DOC: 'show-docs',
        SCRATCH: 'show-scratches'
    });

    constructor($sidebarNav, docRepository, scratchRepository, inputBoxController, listController) {
        this.docRepository = docRepository;
        this.scratchRepository = scratchRepository;
        this.inputBoxController = inputBoxController;
        this.listController = listController;

        $sidebarNav.on('click', 'button', (event) => {
            this._handleNavButtonClick($(event.target));
        })
    }

    _handleNavButtonClick($elem) {
        $elem.siblings().removeClass('selected');
        $elem.addClass('selected');

        const id = $elem.attr('id');

        this._setupTab(id)
    }

    _setupTab(tab) {
        let renderFn;
        let repository;
        let multiline;

        switch (tab) {
            case SidebarController._Tab.DOC:
                renderFn = renderDoc;
                repository = this.docRepository;
                multiline = false;
                break;
            case SidebarController._Tab.SCRATCH:
                renderFn = renderScratch;
                repository = this.scratchRepository;
                multiline = true;
        }

        this.inputBoxController.setMultiline(multiline);
        this.inputBoxController.setOnSubmit(repository.createOne.bind(repository));
        this.listController.setRowRenderFn(renderFn);
        this.listController.setSource(repository);
    }
}

class InputBoxController {
    _multiline = false;
    _callback = () => {};

    constructor($elem) {
        this._$elem = $elem;
        this._$elem.on('keypress', this._handleKey.bind(this));
    }

    setMultiline(isMultiline) {
        this._multiline = isMultiline;
        this._$elem.attr('rows', (isMultiline) ? 3 : 1);
    }

    setOnSubmit(callback) {
        this._callback = callback;
    }

    clear() {
        this._$elem.val("");
    }

    _shouldHandleSubmit(event) {
        return isEnterPressed(event) && (!this._multiline || isCtrlPressed(event));
    }

    _handleKey(event) {
        if (this._shouldHandleSubmit(event)) {
            this._callback(this._$elem.val())
            this.clear();

            return false;
        }
    }
}

class RepositoryListController {
    _unsubscribe = () => {};
    _onRowClick = () => {};
    _renderRow = () => {};
    _repository = null;

    constructor($list) {
        this.$list = $list;
    }

    setRowRenderFn(renderRow) {
        this._renderRow = renderRow;
    }

    setSource(repository) {
        this._unsubscribe();

        this._repository = repository;

        this._unsubscribe =
            repository.subscribe(entities =>
                this._populateList(entities)
            );
    }

    /**
     * @param callback A function that handles row click based on entity id passed as an argument
     */
    setOnRowClick(callback) {
        this._onRowClick = callback;
    }

    _populateList(entities) {
        const rows = entities
            .map(this._createRow.bind(this));

        this.$list
            .empty()
            .append(rows);
    }

    _createRow(entity) {
        const $row = this._renderRow(entity);
        $row.click(() => this._onSelectRow($row, entity.id));
        $row.hover(
            () => this._showTrashAction($row, entity.id),
            () => this._hideTrashAction($row)
        );

        return $row;
    }

    _onSelectRow($row, id) {
        $row.siblings().removeClass('selected');
        $row.addClass('selected');

        this._onRowClick(id);
    }

    _showTrashAction($row, id) {
        const trashIcon = renderTrash();
        trashIcon.click(() => this._onTrashAction(id));
        $row.append(trashIcon);
    }

    _hideTrashAction($row) {
        $row.children('.icon').remove();
    }

    _onTrashAction(id) {
        this._repository.removeOne(id);
    }
}

class EditorController {
    currentDoc = null;

    constructor($textarea, scratchRepository, docRepository) {
        this.scratchRepository = scratchRepository;
        this.docRepository = docRepository;
        this.$textarea = $textarea;

        $textarea.droppable({
            drop: this._handleDrop.bind(this)
        });

        $textarea.on('change keyup paste', this.save.bind(this))
    }

    get text() {
        return this.$textarea.val();
    }

    set text(val) {
        this.$textarea.val(val);
    }

    setDocId(id) {
        const doc = this.docRepository.findOne(id);

        if (doc !== undefined) {
            this.currentDoc = doc;
            this.text = doc.content;
        }
    }

    save() {
        if (this.currentDoc !== null) {
            this.currentDoc.content = this.text;
            this.docRepository.updateOne(this.currentDoc);
        }
    }

    _handleDrop(_, ui) {
        const {id} = retrieveMetadata(ui.draggable);
        const scratch = this.scratchRepository.findOne(id);

        if (scratch !== undefined) {
            this.scratchRepository.removeOne(id);
            this._appendText(scratch.content);
        }
    }

    _appendText(text) {
        this.text += text;
        this.$textarea.trigger('change');
    }
}