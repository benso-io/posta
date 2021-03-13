module.exports = function agent() {
    console.debug(`agent injected in ${windowId} at ${location.href}`);

    const $$$_onMessage = window.onmessage;
    const $$$_addEventListener = window.addEventListener;
    const $$$listeners = new Set();
    const uuid = () => {
        return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
            let r = Math.random() * 16 | 0, v = c == 'x' ? r : (r & 0x3 | 0x8);
            return v.toString(16);
        });
    }

    const frameTree = (frameId = "root", refWindow = window, path = []) => {
        if (frameId !== "root") {
            refWindow.postMessage({
                isPostaMessage: true,
                topic: "account-for-path",
                path,
                topWindowId: windowId
            }, "*")
        }
        let childWindowsIds = Object.keys(refWindow.frames).slice(0, Object.keys(refWindow.frames).findIndex((v) => v === "window")).map(Number)
        childWindowsIds.forEach(id => frameTree(id, refWindow[id], path.concat(id)))
    }

    const sendToBackgroundPage = (body) => {
        if (!body) return console.trace("no sending without body")
        let event = new CustomEvent("posta-telemetry", { detail: body });
        window.dispatchEvent(event);
    }

    window.addEventListener("posta-relay", event=>{
        let {
            data,
            dispatchTo=[]
        } = event.detail
        let ref = window.top;
        while (dispatchTo.length) {
            let frameIndex = dispatchTo.shift();
            ref = ref.frames[frameIndex];
        }
        ref.postMessage(data,"*");
    })

    const sendWindowTelemetry = () => {
        sendToBackgroundPage({
            topic: "listeners",
            windowId,
            listeners: Array.from($$$listeners).map(i => i.toString())
        })
        if (window.top === window) frameTree();
        
        setTimeout(sendWindowTelemetry, 3 * 1000)
    }
    sendWindowTelemetry();

    const hub = (...args) => {
        const [event] = args;
        const { data, origin, source } = event;
        if (data.isPostaMessage) {
            let { topic } = data;
            switch (topic) {
                case "account-for-message":
                    let { messageId } = data;
                    sendToBackgroundPage({
                        topic,
                        windowId,
                        messageId
                    })
                    break;
                case "account-for-path":
                        let { path, topWindowId } = data;
                        sendToBackgroundPage({
                            topic,
                            windowId,
                            topWindowId,
                            path
                        })
                        break;
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
        
        sendToBackgroundPage({
            topic: "received-message",
            origin,
            messageId,
            windowId,
            data
        })

        $$$listeners.forEach(l => {
            try {
                l(...args)
            } catch (error) {
                
            }
        });
    }

    $$$_addEventListener("message", hub);
    let $$$onmessage;

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
                    $$$listeners.add(listener)
                    sendWindowTelemetry();
                    return 
                }
                $$$_addEventListener(...args);
            },
            configurable: true
        }
    });
}

