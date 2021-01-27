import React from "react";
import ReactDOM from "react-dom";
import "./options.scss"
import Editor from "../components/editor";
import WindowFrame from "../components/window-frame" ;
import Layout from '../components/layout';
import Header from '../components/header';


export default class App extends React.Component {
  constructor(...args) {
    super(...args);
    this.backgroundPage.$$$SubScribeToPosta(() => this.setState({}))
  }

  captureEditorSession(session) {
    this.editorSession = session;
  }

  selectMessage(messageId) {
    const { messagesByMessageId,windowsByTabAndFrameId } = this.backgroundPage;
    let { data, receiver, sender } = messagesByMessageId.get(messageId).get();
    switch (typeof (data)) {
      case "object":
        data = JSON.stringify(data, null, " ")
        break;
      case "string":
        try {
          data = JSON.stringify(JSON.parse(data), null, "  ")
        } catch (error) {
        }
        break;
      default:
        data = data.toString()
        break;
    }
    if (this.editorSession) this.editorSession.setValue(data)
    const receiverWindow = windowsByTabAndFrameId.get(receiver);
    const senderWindow = sender ? windowsByTabAndFrameId.get(sender) : null;
    this.setState({ selectedMessage:messageId, receiverWindow, senderWindow })
  }

  sendMessageFromOneFrameToAnother(from, to) {
    let data = this.editorSession.getValue();
    const [fromTabId,fromFrameId] = from.id.split("::");
      chrome.tabs.sendMessage(
        Number(fromTabId),
        {
          dispatchTo:to.attributes.path,
          data
        },
        {frameId:Number(fromFrameId)})
  }

  get backgroundPage() {
    return chrome.extension.getBackgroundPage();
  }

  selectFrame(selectedTabFrameId) {

    this.setState({
      selectedTabFrameId
    })
  }

  renderMessages (selectedFrame){
    
    const { selectedMessage } = (this.state || {});
    const { windowsByTabAndFrameId ,messagesByMessageId} = this.backgroundPage;

    var messages =[];
    var listeners= [];
    
    if (selectedFrame){
      messages = selectedFrame.messages.messages || messages;
      listeners = selectedFrame.attributes.listeners || listeners;
    }    
    return <>
    <div className="title">Messages</div>
    {selectedFrame ?
    <div className="messages">
        {messages.map((messageId, index) => {
          const { data, receiver, sender, origin } = messagesByMessageId.get(messageId).get();
          const receiverWindow = windowsByTabAndFrameId.get(receiver);
          const senderWindow = sender ? windowsByTabAndFrameId.get(sender) : null;
          
          let senderHref = (senderWindow 
            && senderWindow.attributes
            && senderWindow.attributes.locationHref) ? 
            senderWindow.attributes.locationHref : `origin: ${origin}`
          
          let receiverHref = receiverWindow.attributes ? receiverWindow.attributes.locationHref : "?";

          const isIncoming = receiverWindow.id === selectedFrame.id;
          let remote = isIncoming ? senderHref : receiverHref

          return <div
            tabIndex="-1"
            onClick={() => this.selectMessage(messageId)}
            className={`message${selectedMessage === messageId ? ' selected' : ''}`} key={index}>
            <div>
              <span style={{ fontSize: "1.4em", paddingRight: "8px" }}>
                {isIncoming ?
                  <strong>&darr;</strong> :
                  <strong>&uarr;</strong>
                }
              </span>
              <span>{typeof data === "string" ? data : JSON.stringify(data)}</span>
              <div className="remote">{isIncoming ? 'from: ' : " to: "}{remote}</div>
            </div>

          </div>
        })}
      </div>
       : "Select a frame to see its messages"}
       </>
  }

  sendToSelectFrame(){
    const { windowsByTabAndFrameId} = this.backgroundPage;
    const { selectedTabFrameId } = (this.state || {});
    const selectedFrame = typeof(selectedTabFrameId)!=="undefined" ? windowsByTabAndFrameId.get(selectedTabFrameId) : null;
    console.log(selectedFrame)
    if (selectedFrame) {
      let data = this.editorSession.getValue();
      const [tabId] = selectedFrame.id.split("::");
      chrome.tabs.sendMessage(
        Number(tabId),
        {
          dispatchTo:selectedFrame.attributes.path,
          data
        },
        {frameId:0}) 
    }
  }

  renderActions (){
    const { windowsByTabAndFrameId} = this.backgroundPage;
    const { selectedTabFrameId, code } = (this.state || {});
    const selectedFrame = typeof(selectedTabFrameId)!=="undefined" ? windowsByTabAndFrameId.get(selectedTabFrameId) : null;
    const { selectedMessage, receiverWindow, senderWindow } = (this.state || {});
    let replayBtn = selectedFrame ? <button onClick={() => this.sendToSelectFrame()}>Send to selected</button> :
      <button>Send to selected</button>;

    let openExploitPageBtn = selectedFrame ?
      <button><a 
        style={{textDecoration:"none", color: "#250D47"}}
        target="_blank"
        href={`${chrome.runtime.getURL("exploit.html")}?target=${btoa(selectedFrame.attributes.locationHref)}&code=${btoa(code)}`}>open exploit page</a></button>
    : null;
    return <>
      {
        selectedMessage ? <div className="origins">
      <div>
        <strong>From:</strong>
        <span>{senderWindow && senderWindow.attributes ? senderWindow.attributes.locationHref : "~~posta not injected~~"}</span>
      </div>
      <div>
        <strong>To:</strong>
        <span>{receiverWindow.attributes.locationHref}</span>
      </div>
      </div> :null}
      { selectedFrame ? <div className="message-buttons" >
        {replayBtn}
        {openExploitPageBtn}
      </div> : null}
      </>
  }

  render() {
    const { selectedTabFrameId } = (this.state || {});
    const { tabsFrames,windowsByTabAndFrameId ,messagesByMessageId} = this.backgroundPage;
    let tabList = tabsFrames.list();
    const selectedFrame = typeof(selectedTabFrameId)!=="undefined" ? windowsByTabAndFrameId.get(selectedTabFrameId) : null;
    var messages =[];
    var listeners= [];
    if (selectedFrame){
      messages = selectedFrame.messages.messages || messages;
      listeners = selectedFrame.attributes.listeners || listeners;
    }    
    let code = this.editorSession ? this.editorSession.getValue() : "";
    return <>
    <Header></Header>
    <div style={{height:"calc(100% - 60px)"}}>
    <Layout layout={
      [
        {
          w: 30,
          h: 100,
          content: <div className="frames">
            <div className="title light">Tabs</div>
            <div className="allFrames">
              {tabList.map((frame,index) => {
                const { id } = frame;
                return <div key={index} className="tab"><WindowFrame
                code={code}
                  selectedTabFrameId={selectedTabFrameId}
                  selectFrame={(selectedTabFrameId) => this.selectFrame(selectedTabFrameId)}
                  frame={frame}>
                </WindowFrame></div>
              })}
            </div>
          </div>
        },
        {
          w: 35,
          h: 70,
          content: <div style={{ height: "100%", padding:"10px" }}>{this.renderMessages(selectedFrame)}</div>
        },
        {
          w: 35,
          h: 30,
          content: <div style={{ height: "100%", padding:"10px" }}>
            <div className="title">Listeners</div>
            {selectedFrame ? 
            <div className="listeners">
              {listeners.map((listener, index) => {
                return <div className="listener" key={index}>{listener}</div>
              })
              }</div> 
              : "Select a frame to see it's listeners"}
          </div>
        },
        {
          w: 35,
          h: 85,
          content: <div style={{ maxHeight: "100%", backgroundColor: "#000000", height: "100%" }}>
            <Editor style={{ height: "100%", width: "100%" }} onMount={(session) => this.captureEditorSession(session)}></Editor>
          </div>
        },
        {
          w: 35,
          h: 15,
          content: <div className="actions">
            {this.renderActions()}
          </div>
        }
      ]}
    ></Layout>
    </div>
    </>
  }
}

ReactDOM.render(<App></App>, document.getElementById("root"));