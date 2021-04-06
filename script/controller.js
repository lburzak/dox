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
        $elem.siblings().removeClass('light-theme-selected');
        $elem.addClass('light-theme-selected');

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
        this.listController.setSource(repository, renderFn);
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

    constructor($list) {
        this.$list = $list;
    }

    setSource(repository, renderRow) {
        this._unsubscribe();

        this._unsubscribe =
            repository.subscribe(entities =>
                this._populateList(entities, renderRow)
            );
    }

    _populateList(entities, renderRow) {
        const rows = entities.map(renderRow);

        this.$list
            .empty()
            .append(rows);
    }
}

class EditorController {
    constructor($textarea, scratchRepository) {
        this.scratchRepository = scratchRepository;
        this.$textarea = $textarea;

        $textarea.droppable({
            drop: this._handleDrop.bind(this)
        });
    }

    _handleDrop(_, ui) {
        const {id} = retrieveMetadata(ui.draggable);
        const scratch = this.scratchRepository.findOne(id);

        if (scratch !== undefined) {
            this.scratchRepository.removeOne(id);
            this.$textarea.append(scratch.content);
        }
    }
}