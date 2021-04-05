$(document).ready(function () {
    const scratchRepository = new ScratchRepository(localStorage);
    const docRepository = new DocRepository(localStorage);

    const inputBoxController = new InputBoxController($('#scratch-input'));
    const listController = new RepositoryListController($('#items-list'));
    const sidebarController = new SidebarController($('#files-nav'), docRepository, scratchRepository, inputBoxController, listController);

    $('#sidebar').resizable({handles: 'e'})

    $('#canvas-input').droppable({
        drop: function (event, ui) {
            const id = ui.draggable.data("id")
            const scratch = scratchRepository.findOne(id)

            if (scratch !== undefined) {
                scratchRepository.removeOne(id)
                $(this).append(scratch.content);
            }
        }
    });
})