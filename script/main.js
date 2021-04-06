$(document).ready(function () {
    const scratchRepository = new ScratchRepository(localStorage);
    const docRepository = new DocRepository(localStorage);

    const inputBoxController = new InputBoxController($('#scratch-input'));
    const listController = new RepositoryListController($('#items-list'));
    new SidebarController($('#files-nav'), docRepository, scratchRepository, inputBoxController, listController);
    new EditorController($('#canvas-input'), scratchRepository);

    $('#sidebar').resizable({handles: 'e'});
})