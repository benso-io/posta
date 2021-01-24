module.exports = function agent() {
    console.debug(`agent injected in ${windowId} at ${location.href}`);

    const $$$_onMessage = window.onmessage;
    const $$$_addEventListener = window.addEventListener;
    const $$$listeners = new Set();
    const uuid = () => {
        return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
            var r = Math.random() * 16 | 0, v = c == 'x' ? r : (r & 0x3 | 0x8);
            return v.toString(16);
        });
    }

    const sendToPosta = (body) => {
        if (!body) return console.trace("no sending without body")
        var event = new CustomEvent("posta-telemetry", { detail: body });
        window.dispatchEvent(event);
    }

    const frameTree = (frameId = "root", refWindow = window, path = "window.top") => {
        if (frameId !== "root") {
            refWindow.postMessage({
                isPostaMessage: true,
                topic: "account-for-path",
                path,
                topWindowId: windowId
            }, "*")
        }
        let childWindowsIds = Object.keys(refWindow.frames).slice(0, Object.keys(refWindow.frames).findIndex((v) => v === "window")).map(Number)
        return {
            path,
            frameId,
            children: childWindowsIds.map(id => frameTree(id, refWindow[id], `${path}.frames[${id}]`))
        }
    }

    const sendWindowTelemetry = () => {
        sendToPosta({
            topic: "window-telemetry",
            windowId,
            locationHref: window.location.href,
            listeners: Array.from($$$listeners).map(i => i.toString())
        })
        if (window.top === window) sendToPosta({
            topic: "frame-tree",
            frameTree: frameTree(),
            windowId
        })
        setTimeout(sendWindowTelemetry, 1 * 3000)
    }
    sendWindowTelemetry();

    const hub = (...args) => {
        const [event] = args;
        const { data, source } = event;
        if (data.isPostaMessage) {
            let { topic } = data;
            switch (topic) {
                case "account-for-message":
                    let { messageId } = data;
                    sendToPosta({
                        topic,
                        windowId,
                        messageId
                    })
                    break;
                case "account-for-path":
                    let { path, topWindowId } = data;
                    sendToPosta({
                        topic,
                        windowId,
                        topWindowId,
                        path
                    })
                    break;
                case "replay-message":
                    let { to, data: _data } = data;
                    let [top, ...paths] = to.split(".frames[");
                    paths = paths.map(p => Number(p.split("]")[0]));
                    let ref = window.top;
                    while (paths.length) {
                        let index = paths.shift();
                        ref = ref.frames[index];
                    }
                    ref.postMessage(_data, "*");
                default:
                    break;
            }
            return
        }
        let messageId = uuid();
        source.postMessage({
            isPostaMessage: true,
            topic: "account-for-message",
            messageId
        }, "*");
        sendToPosta({
            topic: "received-message",
            messageId,
            windowId,
            data
        })

        $$$listeners.forEach(l => l(...args));
    }

    $$$_addEventListener("message", hub);
    var $$$onmessage;

    Object.defineProperties(window, {
        onmessage: {
            set: (cb) => {
                console.trace("new listener", cb);
                $$$onmessage = cb;
                if (cb) $$$listeners.add($$$onmessage)
            },
            get: () => $$$onmessage
        },
        addEventListener: {
            value: (...args) => {
                const [type, listener, options] = args;
                if (type === "message") {
                    console.trace(`new event listener ${window.windowId}`);
                    return $$$listeners.add(listener)
                }
                $$$_addEventListener(...args);
            },
            configurable: true
        }
    });
}

