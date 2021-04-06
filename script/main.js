$(document).ready(function () {
    const scratchRepository = new ScratchRepository(localStorage);
    const docRepository = new DocRepository(localStorage);

    const inputBoxController = new InputBoxController($('#sidebar-input-box'));
    const listController = new RepositoryListController($('#sidebar-list'));
    new SidebarController($('#sidebar-tabs'), docRepository, scratchRepository, inputBoxController, listController);
    const editorController = new EditorController($('#editor textarea'), scratchRepository, docRepository);

    listController.setOnRowClick(id => editorController.setDocId(id));

    $('#sidebar').resizable({handles: 'e'});
})