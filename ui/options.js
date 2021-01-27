import React, { Component } from "react";
import ReactDOM from "react-dom";
import "./options.scss"
import Editor from "./editor";

class Layout extends React.Component {
  render() {
    const { layout } = this.props;
    return <div className="layout">{layout.map(
      ({ w, h, name, content }, index) => (
        <div
          className={`content-block-${name}`}
          key={index}
          style={{
            width: `${w || 30}%`,
            height: `${h || 20}%`,
          }}>
          <div className="block">
            <div className="content">
              {content}
            </div>
          </div>
        </div>
      )
    )}</div>
  }
}

class WindowFrame extends React.Component {
  onSelect(e) {
    const { frame, selectFrame } = this.props;
    e.stopPropagation();
    if (typeof(frame.attributes.windowId)==="undefined"){
      return
    }
    selectFrame(frame.id);
  }
  render() {
    let { frame, order = 0, selectedTabFrameId, selectFrame } = this.props;
    const isSelected = selectedTabFrameId === frame.id;
    if (!frame) return null;
    const {  children } = frame;
    const {locationHref, listeners=[], windowId} = frame.attributes;
    const {  count= 0, sent=0, received = 0} = frame.messages || {};
    let _children = children.list();
    let fullInjected = typeof(windowId)==="undefined";
    // console.log(messages,children, locationHref, listeners)
    return <div className={`window-frame ${
        fullInjected ? 'unselectable ':''
        }order-${order}${
          isSelected ? ' selected' : ''
          }`} onClick={(e) => this.onSelect(e)} tabIndex="-1">
        <div className="href">{locationHref}</div>
        <div className="stats">
          { fullInjected  ? 
            <span className="dead">Not fully injected</span>:
           <>
           <span className="children-count"><strong>{children.length}</strong> children </span>
          <span className="listeners-count"><strong>{listeners.length}</strong> listeners</span>
          <span className="messages-count"><strong>
            <span className="sent">&uarr;{sent}</span>
            <span className="separator">/</span>
            <span className="received">&darr;{received}</span>
          </strong> messages
          </span></>}
        </div>
        {_children.length ? <div className="children">
          {_children.map((frame,index) => <WindowFrame
            key={index}
            frame={frame}
            selectFrame={selectFrame}
            selectedTabFrameId={selectedTabFrameId}
            order={order + 1}></WindowFrame>)}
        </div> : null}
      </div> 
  }
}


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
    // let message = selectedMessage.json();
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
    // const receiverWindow = this.backgroundPage.windowFrames.get(receiver).get();
    // const senderWindow = this.backgroundPage.windowFrames.get(sender).get();
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
    const { selectedTabFrameId, selectedMessage, receiverWindow, senderWindow } = (this.state || {});
    const { tabsFrames,windowsByTabAndFrameId ,messagesByMessageId} = this.backgroundPage;
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

          // const receiverWindow = this.backgroundPage.tabs.get(selectedTabId).windowFrames.get(receiver);
          // const senderWindow = this.backgroundPage.tabs.get(selectedTabId).windowFrames.get(sender);
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

  render() {
    const { selectedTabFrameId, selectedMessage, receiverWindow, senderWindow } = (this.state || {});
    const { tabsFrames,windowsByTabAndFrameId ,messagesByMessageId} = this.backgroundPage;
    let tabList = tabsFrames.list();
    const selectedFrame = typeof(selectedTabFrameId)!=="undefined" ? windowsByTabAndFrameId.get(selectedTabFrameId) : null;
    var messages =[];
    var listeners= [];
    if (selectedFrame){
      messages = selectedFrame.messages.messages || messages;
      listeners = selectedFrame.attributes.listeners || listeners;
    }    
    return <>
    <div className="head">
      <img src="benso.png"></img>
      <span className="name">Posta</span>
      <span>benso.io open source</span>
      <span className="ref"><a href="https://enso.security">by Enso Security</a></span>
    </div>
    <div style={{height:"calc(100% - 60px)"}}>
    <Layout layout={
      [
        {
          w: 30,
          h: 100,
          // {securityOrigin, frameId, listeners, href, children}
          content: <div className="frames">
            <div className="title light">Tabs</div>
            <div className="allFrames">
              {tabList.map((frame,index) => {
                const { id } = frame;
                return <div key={index} className="tab"><WindowFrame
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
          h: 20,
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
            {/* <div>{JSON.stringify({ messagesBucket }, null, " ")}</div> */}
          </div>
        },
        {
          w: 35,
          h: 15,
          content: <div className="actions">
            {selectedMessage ? <>
              <div className="origins">
              <div>
                <strong>From:</strong>
                <span>{senderWindow && senderWindow.attributes ? senderWindow.attributes.locationHref : "~~posta not injected~~"}</span>
              </div>
              <div>
                <strong>To:</strong>
                <span>{receiverWindow.attributes.locationHref}</span>
              </div>
              </div>
              
              <div className="message-buttons" >
                <button onClick={() => this.sendMessageFromOneFrameToAnother(senderWindow, receiverWindow)}>Replay</button>
                {/* <button>Simulate exploit</button> */}
              </div></> : "Select a message"
              }
          </div>
        }
      ]}
    ></Layout>
    </div>
    </>
  }
}

ReactDOM.render(<App></App>, document.getElementById("root"));