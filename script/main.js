$(document).ready(function () {
    const scratchRepository = new ScratchRepository(localStorage);
    const docRepository = new DocRepository(localStorage);

    const inputBoxController = new InputBoxController($('#sidebar-input-box'));
    const listController = new RepositoryListController($('#sidebar-list'));
    new SidebarController($('#sidebar-tabs'), docRepository, scratchRepository, inputBoxController, listController);
    new EditorController($('#editor textarea'), scratchRepository);

    $('#sidebar').resizable({handles: 'e'});
})