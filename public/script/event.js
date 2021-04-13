function extendWithEmitter(ref) {
    const subscribers = {};

    $.extend(ref, {
        __isHandlingType(type) {
            return Array.isArray(subscribers[type]);
        }
    })

    $.extend(ref, {
        on: (type, handler) => {
            if (!ref.__isHandlingType(type))
                subscribers[type] = [];

            subscribers[type].push(handler);
        },
        off: (type, handler) => {
            if (!ref.__isHandlingType(type))
                return;

            if (handler === undefined)
                subscribers[type].length = 0;
            else
                subscribers[type].splice(subscribers[type].indexOf(handler));
        },
        emit: function (type, payload) {
            if (!ref.__isHandlingType(type))
                return;

            subscribers[type].forEach(handler => handler(payload))
        },
    });
}