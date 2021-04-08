$(document).ready(function () {
    const scratchRepository = new ScratchRepository(localStorage);
    const docRepository = new DocRepository(localStorage);

    const inputBoxController = new InputBoxController($('#sidebar-input-box'));
    const listController = new RepositoryListController($('#sidebar-list'));
    const editorController = new EditorController($('#editor textarea'), scratchRepository, docRepository);
    const trashBoxController = new TrashBoxController($('#trash-box'), scratchRepository);
    const docRowController = new DocRowController(editorController, docRepository);
    const scratchRowController = new ScratchRowController(trashBoxController);
    const translator = new MockTranslator().withDelay(1000);
    new TranslatorController($('#plugin-panel'), translator);
    new SidebarController($('#sidebar-tabs'), docRepository, scratchRepository, inputBoxController, listController, docRowController, scratchRowController);

    const narrowScreenQuery = new NarrowScreenMediaQuery();

    if (!narrowScreenQuery.check()) {
        $('#sidebar').resizable({handles: 'e'});
    }

    narrowScreenQuery.watch(isNarrow => {
        console.log(isNarrow)
        if (isNarrow)
            $('#sidebar').resizable("destroy").css({'width': ''});
        else
            $('#sidebar').resizable({handles: 'e'});
    })

    $('#action-translate').click(() => {
        $('#plugin-panel').toggle();
    })
})