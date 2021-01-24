const uuid = require('uuid').v4;
const agentFunction = require("./agent-body");

const getFunctionBody = (func) => {
    const string = func.toString()
    return string.substring(
        string.indexOf("{") + 1,
        string.lastIndexOf("}")
    )
}

let id=uuid();
window.windowId=id;
var script = document.createElement('script');
script.textContent = `window.windowId="${id}"
${getFunctionBody(agentFunction)}`;
document.documentElement.prepend(script);

var port;
const sendToBackground = (data)=>{
    if (!port) {
        try {
            port = chrome.runtime.connect();    
            port.onDisconnect.addListener(()=>port=undefined);
        } catch (error) {
            port = null;
            return setTimeout(()=>{
                sendToBackground(data);
            },50)
        }
    }
    port.postMessage(data);
}


window.addEventListener("posta-telemetry", (event)=>event.detail? sendToBackground(event.detail):null);