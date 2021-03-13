const uuid = require('uuid').v4;
const agentFunction = require("./agent-body").toString();



let windowId=uuid();
window.windowId=windowId;
let script = document.createElement('script');
script.textContent = `window.windowId="${windowId}";(${agentFunction})()`;
document.documentElement.prepend(script);

chrome.runtime.onMessage.addListener((message, sender)=>{
    let event = new CustomEvent("posta-relay", { detail: message });
    window.dispatchEvent(event);
})

window.addEventListener("posta-telemetry", event=>chrome.runtime.sendMessage(event.detail))