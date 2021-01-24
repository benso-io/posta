const handlers = new Set();

$$$SubScribeToPosta = (handler) => {
    console.log("new subscription from options page")
    handlers.add(handler);
}

function refreshOptionsPage() {
    try {
        Array.from(handlers).forEach(h=>h())
    } catch (error) {
        console.log(error)
    }
}


class Bucket {
    constructor(ItemConstructor) {
        this.ItemConstructor = ItemConstructor;
        this._bucket = []
    }
    add (id) {
        const {ItemConstructor} = this;
        if (!this._bucket[id]) this._bucket[id] = new ItemConstructor(id);
        return this._bucket[id]
    }
    get (id) {
        return this._bucket[id] || {
            get:()=>({}),
            set:()=>({get:()=>{}})
        };
    }
    list(decay=10*1000){
        return Object.keys(this._bucket).map(k=>this._bucket[k]).filter(i=>!decay || !i.isDecayed(decay))
    }
}

class Item {
    constructor (id){
        this.attributes = {};
        this.id = id;
        this.touch(true);
    }
    touch(modify){
        this._json = modify ? undefined : this._json;
        this.lastSeen = Date.now();
        if (modify) refreshOptionsPage();
    }
    set(key,value) {
        this.touch(this.attributes[key] !== value);
        this.attributes[key] = value;
        return this;
    }

    isDecayed (decay){
        return false
        if (decay && ((this.lastSeen + decay) < Date.now())) return true
    }

    json(){
        this._json = this._json || this.get();
        return this._json;
    }

    get(){
        return this.attributes;
    }
}

class Tab extends Item {
    get (){
        let {id,frameTree={}} = this;
        return {
            ...frameTree,
            ...windowFrames.get(id).set("framePath", "window.top").get()
        }
    }

    accountForPath(path, windowId) {
        let [top,...paths] = path.split(".frames[");
        paths = paths.map(p=>Number(p.split("]")[0]));
        let ref = this.frameTree;
        while (paths.length) {
            let index = paths.shift();
            ref=ref.children[index];
        }
        if (!ref) return
        let _windowFrame =  windowFrames.get(windowId).set("framePath", path).get();
        var hasChanges = false;
        Object.keys(_windowFrame).forEach((key)=>{
            if (_windowFrame[key] !== ref[key]) {
                ref[key] = _windowFrame[key];
                hasChanges = true;
            }
        })

        this.touch(hasChanges);
        return this
    }

    isNewTree(oldTree,newTree){
        return oldTree && newTree && (oldTree.path === newTree.path) &&
            (oldTree.windowId === newTree.windowId) &&
                oldTree.children.reduce((res, treeNode,treeNodeIndex)=>{
                    if (!res) return false
                    return this.isNewTree(treeNode, newTree[treeNodeIndex])
                },true) ? false : true
    }

    setFrameTree(newFrameTree){
        let isNewTree = this.isNewTree(this.frameTree, newFrameTree)
        if (isNewTree) {
            this.frameTree = newFrameTree;
            this.touch(true);
        }
        return this;
    }
}

class WindowFrame extends Item {
    constructor(id){
        super(id);
        this.messages = {
            all:{
                messages: [],
                count: 0
            },
            sent:{
                messages: [],
                count: 0
            }, 
            received: {
                count:0,
                messages: []
            }
        }
    }

    addMessage(bucket, message){
        this.messages.all.count++;
        this.messages.all.messages.unshift(message);
        this.messages.all.messages = this.messages.all.messages.slice(0,100);//to avoid denial of service
        this.messages[bucket].count++;
        this.messages[bucket].messages.unshift(message);
        this.messages[bucket].messages = this.messages[bucket].messages.slice(0,100);//to avoid denial of service
        this.touch(true)
        refreshOptionsPage()
    }

    addMessageReceived(message){
        this.addMessage("received", message);
        return this;
    }
    addMessageSent(message){
        this.addMessage("sent", message);
    }
    get (){
        let {sent={messages:[],count:[0]},all={messages:[],count:[0]},received={messages:[],count:[0]}}= this.messages;
        return {
            windowId:this.id,
            messages:{
                sent,
                received,
                all,
            },
            ...super.get()
        }
    }
}

tabs = new Bucket(Tab);
windowFrames = new Bucket(WindowFrame);
messages = new Bucket(Item);
// this.windowFrames = windowFrames;
// this.tabs = tabs;


const receivedMessage = ({messageId, windowId, data})=>{
    let message = messages.add(messageId)
        .set("data",data)
        .set("receiver",windowId);
    windowFrames.add(windowId).addMessageReceived(message);
    // sendToOptionsPage("message-received", {
    //         data,
    //         receiver: windowId,
    //         messageId
    //     })
}

const accountForMessage = ({windowId,messageId})=>{
    let message = messages.add(messageId).set("sender",windowId);
    windowFrames.add(windowId).addMessageSent(message);
}

const windowTelemetry = (message)=>{
    const {windowId,locationHref,listeners} = message;
    windowFrames.add(windowId)
        .set("locationHref",locationHref)
        .set("listeners",listeners);
}

const frameTree = (message)=>{
    const {frameTree,windowId} = message;
    tabs.add(windowId).setFrameTree(frameTree);
}

const accountForPath = ({windowId,topWindowId,path})=>{
    tabs.add(topWindowId).accountForPath(path, windowId);
}



const topicHandlers = {
    "received-message":receivedMessage,
    "window-telemetry":windowTelemetry,
    "account-for-message":accountForMessage,
    "account-for-path":accountForPath,
    "frame-tree": frameTree
}


const processIncomingMessage = (message) => {
    let { topic } = message;
    if (!topicHandlers[topic]) return console.log(`TODO: handel ${topic}`)
    topicHandlers[topic](message)
}

chrome.runtime.onConnect.addListener(function (port) {
    port.onMessage.addListener((message) => {
        if (!message) console.trace("empty message");
        try {
            processIncomingMessage(message)
        } catch (error) {
            console.log(error)
        }

    })
});

chrome.tabs.onUpdated.addListener(()=>{
    tabs = new Bucket(Tab);
})