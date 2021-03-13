const handlers = new Set();

chrome.browserAction.onClicked.addListener(()=>{
    chrome.runtime.openOptionsPage();
})

$$$SubScribeToPosta = (handler) => {
    console.log("new subscription from options page")
    handlers.add(handler);
}

var timer;

function refreshOptionsPage() {
    clearTimeout(timer)
    timer = setTimeout(()=>{
        try {
            Array.from(handlers).forEach(h => h())
        } catch (error) {
            console.log(error)
        }
    },100)
    
}


class Bucket {
    constructor(ItemConstructor) {
        this.ItemConstructor = ItemConstructor;
        this._bucket = {}
    }
    add(id) {
        const { ItemConstructor } = this;
        if (!this._bucket[id]) this._bucket[id] = new ItemConstructor(id);
        return this._bucket[id]
    }
    set(id, item){
        this._bucket[id] = item;
        return this._bucket[id];
    }
    get(id) {
        return this._bucket[id] || {
            get: () => ({}),
            set: () => ({ get: () => { } })
        };
    }
    list(decay = 10 * 1000) {
        return Object.keys(this._bucket).map(k => this._bucket[k])
        // .filter(i => !decay || !i.isDecayed(decay))
    }
}

class Item {
    constructor(id) {
        this.attributes = {};
        this.id = id;
        this.touch(true);
    }
    touch(modify) {
        this._json = modify ? undefined : this._json;
        this.lastSeen = Date.now();
        if (modify) refreshOptionsPage();
    }
    set(key, value) {
        this.touch(this.attributes[key] !== value);
        this.attributes[key] = value;
        return this;
    }

    isDecayed(decay) {
        return false
        if (decay && ((this.lastSeen + decay) < Date.now())) return true
    }

    json() {
        this._json = this._json || this.get();
        return this._json;
    }

    get() {
        return {
            id:this.id,
            ...this.attributes
        };
    }
}

class TabFrame extends Item {
    constructor(tabFrameId) {
        super(tabFrameId);
        this.children = new Bucket(TabFrame)
        this.set("listeners", []);
    }

    addChild(child) {
        return this.children.set(child.id,child);
    }

    get windowId(){
        return windowsByTabAndFrameId.get(this.id).id
    }

    get messages (){
        return messageByTabFrameId.get(this.id).messages || {
            messages: [],
            sent:0,
            count: 0,
            received:0
        };
    }

    get () {
        const {children,id} = this;
        return {
            ...super.get(),
            ...windowsByTabAndFrameId.get(id).get(),
            children: children.list()
        }
    }
}

class MessagesBucket extends Item {
    constructor(windowId) {
        super(windowId);
        this.messages = {
            messages: [],
            sent:0,
            count: 0,
            received:0
        }
    }
    
    addMessage(messageId,counter) {
        if(this.messages.messages.indexOf(messageId) !== -1) return
        this.messages[counter]++;
        this.messages.count++;
        this.messages.messages.unshift(messageId);
        this.messages.messages = this.messages.messages.slice(0, 100);//to avoid denial of service
        this.messages.messages = Array.from(this.messages.messages)
        this.touch(true)
        refreshOptionsPage()

    }

    get() {
        return {
                ...this.messages,
                messages: this.messages.map(m=>messagesByMessageId.get(m).get())
            }
    }
}


windowsByTabAndFrameId = new Bucket(TabFrame);
messagesByMessageId  = new Bucket(Item);
messageByTabFrameId  = new Bucket(MessagesBucket);

tabsFrames = new Bucket(TabFrame);

const receivedMessage = ({ messageId, data, origin },tabId, frameId) => {
    let tabWindowId = `${tabId}::${frameId}`;
    messageByTabFrameId.add(tabWindowId)
        .addMessage(messageId,"received")
    
    messagesByMessageId.add(messageId)
        .set("receiver", tabWindowId)
        .set("origin",origin)
        .set("data", data);
}

const accountForMessage = ({ messageId },tabId, frameId) => {
    let tabWindowId = `${tabId}::${frameId}`;
    messageByTabFrameId.add(tabWindowId)
        .addMessage(messageId,"sent")
    
    messagesByMessageId.add(messageId)
        .set("sender", tabWindowId);
}

const listeners = (message, tabId, frameId) => {
    const { listeners, windowId  } = message;
    windowsByTabAndFrameId.add(`${tabId}::${frameId}`).set("listeners",listeners).set("windowId", windowId)
}

const topicHandlers = {
    "received-message":receivedMessage,
    "account-for-message":accountForMessage,
    listeners,
    "account-for-path": (message, tabId, frameId)=>{
        let tabWindowId = `${tabId}::${frameId}`;
        let {path} =message;
        windowsByTabAndFrameId.add(tabWindowId).set("path",path);
    }
}


const processIncomingMessage = (message, tabId,frameId) => {
    let { topic } = message;
    if (!topicHandlers[topic]) return console.log(`TODO: handel ${topic} from ${tabId}:${frameId}`)
    topicHandlers[topic](message, tabId,frameId)
}

chrome.runtime.onMessage.addListener((message, sender, response) => {
    const { 
        frameId,
        tab: {
            id
        } } = sender

    if (!message) console.trace("empty message");
    try {
        processIncomingMessage(message, id, frameId)
    } catch (error) {
        console.log(error)
    }
})



const updateTabs = () => {
    chrome.tabs.query({}, (allTabs) => {
        let targetTabs = allTabs.filter(({ url }) => !url.startsWith("chrome"));
        Promise.all(
            targetTabs.map(({ id: tabId }) => new Promise((resolve, reject) => {
                chrome.webNavigation.getAllFrames({ tabId }, (frames) => resolve({
                    tabId,
                    frames
                }))
            }))

        ).then((updatedTabs) => {
            tabsFrames = new Bucket(TabFrame);
            updatedTabs.forEach(({ tabId, frames }) => {
                let topFrameIndex = frames.findIndex(({parentFrameId})=>parentFrameId===-1);
                if (typeof(topFrameIndex)==="undefined") return;
                let [{frameId,url}] = frames.splice(topFrameIndex,1);
                let tabFrameId = `${tabId}::${frameId}`;
                let top =  new TabFrame(tabFrameId);
                
                top.set("locationHref", url);
                windowsByTabAndFrameId.set(tabFrameId,top);
                tabsFrames.set(tabFrameId, top)
                frames.forEach(frame => {
                    const {
                        frameId,
                        parentFrameId,
                        url
                    } = frame;
                    let tabFrameId = `${tabId}::${frameId}`;
                    let parentTabFrameId = `${tabId}::${parentFrameId}`;
                    let windowFrame = windowsByTabAndFrameId.add(tabFrameId).set("locationHref", url);
                    let parentWindowFrame = windowsByTabAndFrameId.add(parentTabFrameId);
                    parentWindowFrame.addChild(windowFrame);
                })
            })
        })
    })
}

chrome.webNavigation.onDOMContentLoaded.addListener(updateTabs)
chrome.webNavigation.onCommitted.addListener(updateTabs)