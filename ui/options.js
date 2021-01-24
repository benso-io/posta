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
    const { frame, selectWindow } = this.props;
    e.stopPropagation();
    selectWindow(frame.windowId);
  }
  render() {
    let { frame, order = 0, selectWindow, selectedWindowId } = this.props;
    const isSelected = selectedWindowId && (selectedWindowId === frame.windowId);
    if (!frame) return null;
    const { locationHref, children = [], listeners = [], messages = {}, windowId } = frame;
    const { sent = { count: 0, messages: [] }, received = { count: 0, messages: [] } } = messages
    return windowId ?
      <div className={`window-frame order-${order}${isSelected ? ' selected' : ''}`} onClick={(e) => this.onSelect(e)} tabIndex="-1">
        <div className="href">{locationHref}</div>
        <div className="stats">
          <span className="children-count"><strong>{children.length}</strong> children </span>
          <span className="listeners-count"><strong>{listeners.length}</strong> listeners</span>
          <span className="messages-count"><strong>
            <span className="sent">&uarr;{sent.count}</span>
            <span className="separator">/</span>
            <span className="received">&darr;{received.count}</span>
          </strong> messages
          </span>
        </div>
        {children.length ? <div className="children">
          {children.map((frame) => <WindowFrame
            key={frame.windowId} frame={frame} selectWindow={selectWindow} selectedWindowId={selectedWindowId} order={order + 1}></WindowFrame>)}
        </div> : null}
      </div> :
      <div className={`window-frame unselectable order-${order}${isSelected ? ' selected' : ''}`}>
        <div className="href dead">Not fully injected - maybe an html data-uri frame?</div>
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

  selectMessage(selectedMessage) {
    let message = selectedMessage.json();
    let { data, receiver, sender } = message;
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
    const receiverWindow = this.backgroundPage.windowFrames.get(receiver).get();
    const senderWindow = this.backgroundPage.windowFrames.get(sender).get();
    this.setState({ selectedMessage, receiverWindow, senderWindow })
  }

  sendMessageFromOneFrameToAnother(from, to) {
    // let data = this.editorSession.getValue();
    // let [top, ...paths] = from.framePath.split(".frames[");
    // paths = paths.map(p => Number(p.split("]")[0]));
    // let ref = window.top;
    // console.log(ref)
    // while (paths.length) {
    //   let index = paths.shift();
    //   ref = ref.frames[index];
    // }
    
    // ref.postMessage({
    //   isPostaMessage: true,
    //   to: to.framePath,
    //   data
    // }, "*")
  }

  get backgroundPage() {
    return chrome.extension.getBackgroundPage();
  }

  selectWindow(selectedWindowId) {
    this.setState({
      selectedWindowId,
    })
  }

  render() {
    const { selectedWindowId, selectedMessage, receiverWindow, senderWindow } = (this.state || {});
    const { tabs } = this.backgroundPage;
    let tabList = tabs.list();
    const selectedWindow = selectedWindowId ? this.backgroundPage.windowFrames.get(selectedWindowId).get() : null;
    return <Layout layout={
      [
        {
          w: 30,
          h: 100,
          // {securityOrigin, frameId, listeners, href, children}
          content: <div className="frames">
            <div className="breadcrumbs">{`All Tabs >`}</div>
            <div className="allFrames">
              {tabList.map((topFrame) => {
                const frame = topFrame.get();
                const { windowId } = frame;
                return <div key={windowId} className="tab"><WindowFrame
                  selectedWindowId={selectedWindowId}
                  selectWindow={(windowId) => this.selectWindow(windowId)}
                  key={windowId}
                  frame={frame}>
                </WindowFrame></div>
              })}
            </div>
          </div>
        },
        {
          w: 35,
          h: 70,
          content: <div style={{ height: "100%" }}>
            <h3>Messages sent</h3>
            {selectedWindow ?
              <div className="messages">
                {(selectedWindow.messages.all.messages).map((message) => {
                  const { data, receiver, sender } = message.get();
                  const receiverWindow = this.backgroundPage.windowFrames.get(receiver).get();
                  const senderWindow = this.backgroundPage.windowFrames.get(sender).get();
                  let remote = receiverWindow.windowId === selectedWindow.windowId ?
                    senderWindow.locationHref :
                    receiverWindow.locationHref;
                  const isIncoming = receiverWindow.windowId === selectedWindow.windowId;
                  return <div
                    tabIndex="-1"
                    onClick={() => this.selectMessage(message)}
                    className={`message${selectedMessage === message ? ' selected' : ''}`} key={message.id}>
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
              </div> : "Select a frame to see its messages"}
          </div>
        },
        {
          w: 30,
          h: 20,
          content: <div style={{ height: "100%" }}>
            <h3>Listeners</h3>

            {selectedWindow ? <div className="listeners">
              {selectedWindow.listeners.map((listener, index) => {
                // let preview = listener && listener.handler ? listener.handler.description : "No preview"
                // preview = preview || "No preview";
                return <div className="listener" key={index}>{listener}</div>
              })
              }</div> : "Select a frame to see it's listeners"}
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
              <div>
                <strong>From:</strong>
                <span>{senderWindow.locationHref}</span>
              </div>
              <div>
                <strong>To:</strong>
                <span>{receiverWindow.locationHref}</span>
              </div>
              <div className="message-buttons">
                <button onClick={() => this.sendMessageFromOneFrameToAnother(senderWindow, receiverWindow)}>Replay</button>
                <button>Simulate exploit</button>
              </div></> : "Select a frame to see it's listeners"}
          </div>
        }
      ]}
    ></Layout>

    // <div>{JSON.stringify({messagesBucket,tabs},null, " ")}</div>
  }
}

ReactDOM.render(<App></App>, document.getElementById("root"));