function isEnterPressed(event) {
    return event.keyCode === 10 || event.keyCode === 13;
}

function isCtrlPressed(event) {
    return event.ctrlKey
}

class NarrowScreenMediaQuery {
    constructor() {
        this._query = window.matchMedia("only screen and (max-device-width: 40em)");
    }
    
    check() {
        return this._query.matches;
    }

    watch(callback) {
        this._query.addEventListener('change', (event) => {
            callback(event.matches)
        })
    }
}