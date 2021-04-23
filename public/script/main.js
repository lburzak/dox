$(document).ready(function () {
    const scratchRepository = new ScratchRepository(localStorage);
    const docRepository = new DocRepository(localStorage);

    const listController = new RepositoryListController($('#sidebar-list'));
    const trashBoxController = new TrashBoxController($('#trash-box'), scratchRepository);
    const titleController = new TitleController($('#app-title'));
    const editorController = new EditorController($('#editor textarea'), scratchRepository, docRepository, trashBoxController, titleController);

    const $sidebarInput = $('#sidebar-input-box');
    const docServiceLookup = {
        listModel: new RepositoryListModel(docRepository),
        rowController: new DocRowController(editorController, docRepository),
        inputBoxController: new DocInputBoxController($sidebarInput, docRepository)
    };
    const scratchServiceLookup = {
        listModel: new RepositoryListModel(scratchRepository),
        rowController: new ScratchRowController(trashBoxController),
        inputBoxController: new ScratchInputBoxController($sidebarInput, scratchRepository)
    };

    const narrowScreenQuery = new NarrowScreenMediaQuery();

    new SidebarController($('#sidebar'), narrowScreenQuery, listController, docServiceLookup, scratchServiceLookup);

    const $pluginPanel = $('#plugin-panel');
    const translator = new MockTranslator().withDelay(60);
    new TranslatorController($pluginPanel, translator);
    new PluginBarController($('#plugin-bar'), $pluginPanel)
});