$(document).ready(function () {
    const scratchRepository = new ScratchRepository(localStorage);
    const docRepository = new DocRepository(localStorage);

    const inputBoxController = new InputBoxController($('#sidebar-input-box'));
    const listController = new RepositoryListController($('#sidebar-list'));
    const editorController = new EditorController($('#editor textarea'), scratchRepository, docRepository);
    const trashBoxController = new TrashBoxController($('#trash-box'), scratchRepository);
    const docRowController = new DocRowController(editorController, docRepository);
    const scratchRowController = new ScratchRowController(trashBoxController);
    new SidebarController($('#sidebar-tabs'), docRepository, scratchRepository, inputBoxController, listController, docRowController, scratchRowController);

    $('#sidebar').resizable({handles: 'e'});
})