class SidebarController {
    constructor($sidebar, narrowScreenQuery, listController, docServiceLookup, scratchServiceLookup) {
        this.docServiceLookup = docServiceLookup;
        this.scratchServiceLookup = scratchServiceLookup;
        this.listController = listController;

        this.$sidebar = $sidebar;
        const $sidebarNav = $('#sidebar-tabs', this.$sidebar);

        $sidebarNav.on('click', 'button', (event) => {
            this._handleNavButtonClick($(event.target));
        });

        if (!narrowScreenQuery.check())
            this._enableResizable();

        narrowScreenQuery.watch(isNarrow => {
            if (isNarrow)
                this._disableResizable();
            else
                this._enableResizable();
        });

        this._switchTab('show-docs');
    }

    _handleNavButtonClick($elem) {
        this._markSelectedTab($elem);
        const navId = $elem.attr('id');

        this._switchTab(navId);
    }

    _switchTab(navId) {
        this._tearDownTab();

        switch (navId) {
            case "show-docs":
                this.serviceLookup = this.docServiceLookup;
                break;
            case "show-scratches":
                this.serviceLookup = this.scratchServiceLookup;
                break;
        }

        this._setupTab();
    }

    _markSelectedTab($elem) {
        $elem.siblings().removeClass('selected');
        $elem.addClass('selected');
    }

    _setupTab() {
        const { listModel, inputBoxController, rowController } = this.serviceLookup;

        inputBoxController.attach();

        this.listController.setRowController(rowController);
        this.listController.setModel(listModel);
    }

    _tearDownTab() {
        this.serviceLookup?.inputBoxController?.detach();
    }

    _enableResizable() {
        this.$sidebar.resizable({handles: 'e', minWidth: 200});
    }

    _disableResizable() {
        this.$sidebar.resizable("destroy").css({'width': ''});
    }
}

class InputBoxController {
    _rows = 0;
    _placeholder = "";

    constructor($textarea) {
        this._$elem = $textarea;
    }

    attach() {
        this._$elem.attr('rows', this._rows);
        this._$elem.attr('placeholder', this._placeholder);

        this.keyHandler = this._handleKey.bind(this);
        this._$elem.on('keypress', this.keyHandler);
    }

    detach() {
        this._$elem.off('keypress');
    }

    _onSubmit(text) {}

    clear() {
        this._$elem.val("");
    }

    _isMultiline() {
        return this._rows > 1;
    }

    _shouldHandleSubmit(event) {
        return isEnterPressed(event) && (!this._isMultiline() || isCtrlPressed(event));
    }

    _handleKey(event) {
        if (this._shouldHandleSubmit(event)) {
            this._onSubmit(this._$elem.val())
            this.clear();

            return false;
        }
    }
}

class DocInputBoxController extends InputBoxController {
    _rows = 1;
    _placeholder = "New document...";

    constructor($textarea, docRepository) {
        super($textarea);
        this.docRepository = docRepository;
    }

    _onSubmit(text) {
        this.docRepository.createOne(text);
    }
}

class ScratchInputBoxController extends InputBoxController {
    _rows = 3;
    _placeholder = "New scratch...";

    constructor($textarea, scratchRepository) {
        super($textarea);
        this.scratchRepository = scratchRepository;
    }

    _onSubmit(text) {
        this.scratchRepository.createOne(text);
    }
}

class RowController {
    makeRow(entity) {}
}

class DocRowController extends RowController {
    _selectedId = -1;

    constructor(editorController, docRepository) {
        super();
        this._docRepository = docRepository;
        this._editorController = editorController;
    }

    makeRow(doc) {
        const $row = renderDoc(doc);

        if (doc.id === this._selectedId)
            $row.addClass('selected');

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

        this._selectedId = id;
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

class RepositoryListModel {
    constructor(repository) {
        extendWithEmitter(this);

        repository.subscribe(entities => { this._setEntities(entities); })
    }

    getEntities() {
        return this._entities;
    }

    _setEntities(entities) {
        this._entities = [...entities];
        this.emit("update");
    }
}

class RepositoryListController {
    constructor($list) {
        this.$list = $list;
    }

    setModel(model) {
        this.model?.off("update");
        this.model = model;

        this._populateList(this.model.getEntities());

        this.model.on("update", () => {
            this._populateList(this.model.getEntities());
        })
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
    constructor($textarea, scratchRepository, docRepository, trashBoxController, titleController) {
        this.scratchRepository = scratchRepository;
        this.docRepository = docRepository;
        this.$textarea = $textarea;
        this._trashBoxController = trashBoxController;
        this._titleController = titleController;

        this._close();

        $textarea.droppable({
            drop: this._handleDrop.bind(this)
        });

        $textarea.on('change keyup paste', this.save.bind(this))

        docRepository.subscribe(updatedCollection =>
            this._handleDocsCollectionUpdate(updatedCollection)
        )
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

        this.text = doc.content;
        this.$textarea.attr("disabled", false);

        this._titleController.onDocOpened(doc);
    }

    _close() {
        this.currentDoc = null;

        this.text = "No doc opened.";
        this.$textarea.attr("disabled", true);

        this._titleController.onDocClosed();
    }

    _handleDrop(_, ui) {
        if (!this._isDocOpened())
            return false;

        const {id} = retrieveMetadata(ui.draggable);
        const scratch = this.scratchRepository.findOne(id);

        if (scratch !== undefined) {
            this.scratchRepository.removeOne(id);
            this._appendText(scratch.content);
        }

        this._trashBoxController.hide();
    }

    _appendText(text) {
        this.text += text;
        this.$textarea.trigger('change');
    }

    _isDocOpened() {
        return this.currentDoc !== undefined && this.currentDoc !== null && typeof this.currentDoc === "object";
    }

    _handleDocsCollectionUpdate(updatedCollection) {
        if (this._isDocOpened() && !updatedCollection.includes(this.currentDoc)) {
            this._close();
        }
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

class TitleController {
    constructor($header) {
        this._$header = $header;
    }

    onDocOpened(doc) {
        document.title = `Dox - ${doc.title}`;
        this._$header.attr('disabled', false).text(doc.title);
    }

    onDocClosed() {
        document.title = `Dox`;
        this._$header.attr('disabled', true).text(`Dox`);
    }
}