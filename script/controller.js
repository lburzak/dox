class SidebarController {
    static _Tab = Object.freeze({
        DOC: 'show-docs',
        SCRATCH: 'show-scratches'
    });

    constructor($sidebarNav, docRepository, scratchRepository, inputBoxController, listController, docRowController, scratchRowController) {
        this.docRepository = docRepository;
        this.scratchRepository = scratchRepository;
        this.inputBoxController = inputBoxController;
        this.listController = listController;
        this.docRowController = docRowController;
        this.scratchRowController = scratchRowController;

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
        let rowController;
        let repository;
        let multiline;

        switch (tab) {
            case SidebarController._Tab.DOC:
                rowController = this.docRowController;
                repository = this.docRepository;
                multiline = false;
                break;
            case SidebarController._Tab.SCRATCH:
                rowController = this.scratchRowController;
                repository = this.scratchRepository;
                multiline = true;
        }

        this.inputBoxController.setMultiline(multiline);
        this.inputBoxController.setOnSubmit(repository.createOne.bind(repository));
        this.listController.setRowController(rowController);
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

class RowController {
    makeRow(entity) {}
}

class DocRowController extends RowController {
    constructor(editorController, docRepository) {
        super();
        this._docRepository = docRepository;
        this._editorController = editorController;
    }

    makeRow(doc) {
        const $row = renderDoc(doc);
        $row.click(() => this._onSelectRow($row, doc.id));
        $row.hover(
            () => this._showTrashAction($row, doc.id),
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
        const deleteAction = renderDeleteDoc();
        deleteAction.click(() => this._onTrashAction(id));
        $row.append(deleteAction);
    }

    _hideTrashAction($row) {
        $row.children('.icon').remove();
    }

    _onTrashAction(id) {
        this._docRepository.removeOne(id);
    }

    _onRowClick(id) {
        this._editorController.setDocId(id);
    }
}

class ScratchRowController extends RowController {
    static _SCRATCH_DRAGGABLE_OPTS = Object.freeze({
        helper: renderScratchDragHelper,
        opacity: 0.5,
        cursorAt: {
            top: 30,
            left: 30
        }
    })

    constructor(trashBoxController) {
        super();
        this._trashBoxController = trashBoxController;
    }

    makeRow(scratch) {
        const $row = renderScratch(scratch.content);
        $row.draggable(ScratchRowController._SCRATCH_DRAGGABLE_OPTS);

        $row.on('dragstart', () => this._trashBoxController.show())
        $row.on('dragstop', () => this._trashBoxController.hide())

        putMetadata($row, {id: scratch.id});

        return $row;
    }
}

class RepositoryListController {
    _unsubscribe = () => {};

    constructor($list) {
        this.$list = $list;
    }

    setSource(repository) {
        this._unsubscribe();

        this._repository = repository;

        this._unsubscribe =
            repository.subscribe(entities =>
                this._populateList(entities)
            );
    }

    setRowController(rowController) {
        this._rowController = rowController;
    }

    _populateList(entities) {
        const rows = entities
            .map(entity => this._rowController.makeRow(entity));

        this.$list
            .empty()
            .append(rows);
    }
}

class EditorController {
    constructor($textarea, scratchRepository, docRepository) {
        this.scratchRepository = scratchRepository;
        this.docRepository = docRepository;
        this.$textarea = $textarea;

        $textarea.droppable({
            drop: this._handleDrop.bind(this)
        });

        $textarea.on('change keyup paste', this.save.bind(this))

        this._open(null);
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
            this._open(doc);
        }
    }

    save() {
        if (this.currentDoc !== null) {
            this.currentDoc.content = this.text;
            this.docRepository.updateOne(this.currentDoc);
        }
    }

    _open(doc) {
        this.currentDoc = doc;

        if (doc === null || doc === undefined) {
            this.text = "No doc opened.";
            this.$textarea.attr("disabled", true);
        } else {
            this.text = doc.content;
            this.$textarea.attr("disabled", false);
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

class TrashBoxController {
    static _ANIMATION_DURATION = 11;

    constructor($box, scratchRepository) {
        this._$box = $box;
        this._scratchRepository = scratchRepository;

        $box.droppable({
            drop: (_, ui) => this._handleDrop(ui.draggable)
        });
    }

    show() {
        this._$box.show(TrashBoxController._ANIMATION_DURATION);
    }

    hide() {
        this._$box.hide(TrashBoxController._ANIMATION_DURATION);
    }

    _handleDrop($draggable) {
        const {id} = retrieveMetadata($draggable);

        this._scratchRepository.removeOne(id);

        this.hide();
    }
}

class TranslatorController {
    constructor($panel, translator) {
        this._translator = translator;

        this._$sourceLangSelect = $('#translator-source-lang', $panel);
        this._$targetLangSelect = $('#translator-target-lang', $panel);
        this._$inputBox = $('#translator-input', $panel);
        this._$outputBox = $('#translator-result', $panel);
        this._$translateButton = $('#translator-translate', $panel);

        this._translator.getLanguages().then(languagesMap => this._setupLangSelects(languagesMap));

        this._$translateButton.on('click', () => { this._performTranslation() });
    }

    _setupLangSelects(languagesMap) {
        [this._$sourceLangSelect, this._$targetLangSelect].forEach($select =>
            this._populateLangSelect($select, languagesMap)
        )

        this._$sourceLangSelect
            .on('change', (event) => { this._onSourceLangChange(event.target.value) })
            .change();

        this._$targetLangSelect
            .on('change', (event) => { this._onTargetLangChange(event.target.value) })
            .change();
    }

    _populateLangSelect($select, languagesMap) {
        for (const [name, code] of Object.entries(languagesMap)) {
            $select.append(renderOption(name, code))
        }
    }

    _onSourceLangChange(code) {
        this._translator.setSourceLang(code);
    }

    _onTargetLangChange(code) {
        this._translator.setTargetLang(code);
    }

    _performTranslation() {
        this._showLoading();

        const input = this._$inputBox.val();

        this._translator.translate(input)
            .then(translated => {
                this._$outputBox.val(translated);
                this._hideLoading();
            });
    }

    _showLoading() {
        this._$translateButton
            .prop('disabled', true);
    }

    _hideLoading() {
        this._$translateButton
            .prop('disabled', false)
    }
}

class PluginBarController {
    constructor($bar, $panel) {
        this.$bar = $bar;
        this.$panel = $panel;

        $('#show-translator', this.$bar).click(
            () => this._onLaunchPlugin("translator")
        );
    }

    _onLaunchPlugin() {
        this.$panel.toggle();
    }
}