import React from "react";
import ReactDOM from "react-dom";
import "./main.scss"
import Editor from "../components/editor";
import WindowFrame from "../components/window-frame";
import Layout from '../components/layout';
import Header from '../components/header';
import Log from "../components/log";
const { encode } = require('js-base64').Base64;
const beautify = require('js-beautify').js;

function uuidv4(){
  let dt = new Date().getTime()
  const uuid = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
      const r = (dt + Math.random()*16)%16 | 0
      dt = Math.floor(dt/16)
      return (c=='x' ? r :(r&0x3|0x8)).toString(16)
  })
  
  return uuid
}


export default class App extends React.Component {
  constructor(...args) {
    super(...args);
    setInterval(()=>this.setState({renderId: uuidv4()}),300)
  }



  captureEditorSession(session) {
    this.editorSession = session;
  }

  selectMessage(messageId) {
    if (!messageId) {
      this.setState({ selectedMessage: undefined})
      return
    }
    const { messagesByMessageId, windowsByTabAndFrameId } = this.backgroundPage;
    let { data, receiver, sender } = messagesByMessageId.get(messageId).get();
    let mode = {
      v: Date.now(),
      path: "ace/mode/json"
    }
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
    if (this.editorSession) {
      this.editorSession.setValue(data);
      this.editorSession.setMode(mode);
    }
    const receiverWindow = windowsByTabAndFrameId.get(receiver);
    const senderWindow = sender ? windowsByTabAndFrameId.get(sender) : null;
    this.setState({ selectedMessage: messageId, receiverWindow, senderWindow })
  }



  selectListener(listener, selectedFrame) {
    this.selectMessage()
    if (this.editorSession) {
      let code = `// Listener on ${selectedFrame.attributes.locationHref}
${beautify(listener, {
        "indent_size": "4",
        "indent_char": " ",
        "max_preserve_newlines": "2",
        "preserve_newlines": true,
        "keep_array_indentation": false,
        "break_chained_methods": false,
        "indent_scripts": "separate",
        "brace_style": "expand",
        "space_before_conditional": true,
        "unescape_strings": true,
        "jslint_happy": true,
        "end_with_newline": false,
        "wrap_line_length": "40",
        "indent_inner_html": true,
        "comma_first": false,
        "e4x": false,
        "indent_empty_lines": true
      })}
      `
      this.editorSession.setValue(code);
      this.editorSession.setMode({
        path: "ace/mode/javascript",
        v: Date.now()
      })
    }
  }

  get backgroundPage() {
    return chrome.extension.getBackgroundPage();
  }

  selectFrame(selectedTabFrameId) {
    this.setState({
      selectedTabFrameId
    })
  }

  renderMessages(selectedFrame) {

    const { selectedMessage } = (this.state || {});
    const { windowsByTabAndFrameId, messagesByMessageId } = this.backgroundPage;

    let messages = [];
    let listeners = [];

    if (selectedFrame) {
      messages = selectedFrame.messages.messages || messages;
      listeners = selectedFrame.attributes.listeners || listeners;
    }
    return <>
      <div className="title">
        <div>Messages</div>
        <input placeholder="filter" type="search" value={this.getFilterValue("messages")} onChange={({target})=>this.setFilterValue("messages", target.value)} />
      </div>
      {selectedFrame ?
        <div className="messages">
          {this.filterList("messages",messages).map((messageId, index) => {
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
                <span>{typeof data === "string" ? 
                  data : 
                  typeof(data) === "undefined" ? "undefined" :
                  JSON.stringify(data)}</span>
                <div className="remote">{isIncoming ? 'from: ' : " to: "}{remote}</div>
              </div>

            </div>
          })}
        </div>
        : "Select a frame to see its messages"}
    </>
  }

  getEditorData (){
    return this.editorSession.getValue();
  }

  sendMessage (targetFrame, data) {
    if (targetFrame) {
      const [tabId] = targetFrame.id.split("::");
      chrome.tabs.sendMessage(
        Number(tabId),
        {
          dispatchTo: targetFrame.attributes.path,
          data
        },
        { frameId: 0 })
    }
  }

  sendToSelectedFrame() {
    const { windowsByTabAndFrameId } = this.backgroundPage;
    const { selectedTabFrameId } = (this.state || {});
    const selectedFrame = typeof (selectedTabFrameId) !== "undefined" ? windowsByTabAndFrameId.get(selectedTabFrameId) : null;
    if (selectedFrame) {
      let data = this.editorSession.getValue();
      const [tabId] = selectedFrame.id.split("::");
      chrome.tabs.sendMessage(
        Number(tabId),
        {
          dispatchTo: selectedFrame.attributes.path,
          data
        },
        { frameId: 0 })
    }
  }

  openExploitPage() {
    const { windowsByTabAndFrameId } = this.backgroundPage;
    const { selectedTabFrameId } = (this.state || {});
    const selectedFrame = typeof (selectedTabFrameId) !== "undefined" ? windowsByTabAndFrameId.get(selectedTabFrameId) : null;
    const code = this.editorSession ? this.editorSession.getValue() : "";
    window.open(`${chrome.runtime.getURL("exploit.html")}?target=${encode(selectedFrame.attributes.locationHref)}&code=${encode(code)}`)
  }

  renderMessageControlPanel() {
    const { windowsByTabAndFrameId,messagesByMessageId } = this.backgroundPage;
    const { selectedTabFrameId } = (this.state || {});
    const selectedFrame = typeof (selectedTabFrameId) !== "undefined" ? windowsByTabAndFrameId.get(selectedTabFrameId) : null;
    const { selectedMessage, receiverWindow, senderWindow } = (this.state || {});
    const { data, receiver, sender } = messagesByMessageId.get(selectedMessage).get();
    return <div>
      {
        selectedMessage ? <div className="origins">
          <div className="key-value">
            <div className="key">type</div>
            <div className="value">{typeof(data)}</div>
          </div>
          <div className="key-value clickable" onClick={()=>this.selectFrame(senderWindow.id)}>
            <div className="key">sender: </div>
            <div className="value">{senderWindow && senderWindow.attributes ? senderWindow.attributes.locationHref : "~~posta not injected~~"}</div>
          </div>
          <div className="key-value clickable" onClick={()=>this.selectFrame(receiverWindow.id)}>
            <div className="key">receiver: </div>
            <div className="value">{receiverWindow.attributes.locationHref}</div>
          </div>
          <div className="action">Resend to {receiverWindow.attributes.locationHref}</div>
          <div className="buttons">
              <div onClick={()=>this.sendMessage(receiverWindow,undefined)}>undefined</div>
              <div onClick={()=>{
                try {
                  let obj = this.getEditorData();
                  this.sendMessage(receiverWindow,JSON.parse(obj))
                } catch (error) {
                  
                }
                
              }}>as object</div>
              <div onClick={()=>this.sendMessage(receiverWindow,this.getEditorData())}>as string</div>
              <div onClick={()=>this.sendMessage(receiverWindow,Number(this.getEditorData()))}>as number</div>
              <div onClick={()=>this.sendMessage(receiverWindow,null)}>null</div>
            </div>
          <div className="buttons">
            <div onClick={() => this.openExploitPage()}>open in exploit page</div>
          </div>
          </div> : <div style={{ height: "38px" }}>
            select a message
          </div>
        }
    </div>
  }

  
  getFilterValue(filterName){
    return localStorage.getItem(`filter-${filterName}`).toLowerCase() || ""
  }

  setFilterValue(filterName, value){
    localStorage.setItem(`filter-${filterName}`,value)
    this.setState({
      [`filter-${filterName}`]:value
    })
  }

  filterList(type,list){
    let filterValue = this.getFilterValue(type);
    if (!filterValue) return list;
    switch (type) {
      case "listeners":
        return list.filter((item)=>{
          return item.toLowerCase().includes(filterValue)
        });
        
      case "messages":
        return list.filter(messageId=>{
          const {  messagesByMessageId } = this.backgroundPage;
          const { data, receiver, sender } = messagesByMessageId.get(messageId).get();
          return (JSON.stringify(data)||"").toLowerCase().includes(filterValue) ||
            (receiver||"").toLowerCase().includes(filterValue) || (
              (sender||"").toLowerCase()
              ||"").includes(filterValue)
        });
      default:
        return list
    }
  }

  render() {
    const { selectedTabFrameId } = (this.state || {});
    const { tabsFrames, windowsByTabAndFrameId } = this.backgroundPage;
    let tabList = tabsFrames.list();
    const selectedFrame = typeof (selectedTabFrameId) !== "undefined" ? windowsByTabAndFrameId.get(selectedTabFrameId) : null;
    let messages = [];
    let listeners = [];
    if (selectedFrame) {
      messages = selectedFrame.messages.messages || messages;
      listeners = selectedFrame.attributes.listeners || listeners;
    }
    let code = this.editorSession ? this.editorSession.getValue() : "";
    return <>
      <Header></Header>
      <div style={{ height: "calc(100% - 60px)" }}>
        <Layout layout={
          [
            {
              w: 100,
              h: 80,
              content: <Layout layout={[
                {
                  w: 30,
                  h: 100,
                  content: <div className="frames">
                    <div className="title light">Tabs</div>
                    <div className="allFrames">
                      {this.filterList("tabs", tabList).map((frame, index) => {
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
                  h: 50,
                  content: <div style={{ height: "100%", padding: "10px" }}>{this.renderMessages(selectedFrame)}</div>
                },
                {
                  w: 35,
                  h: 50,
                  content: <div style={{ height: "100%", padding: "10px" }}>
                    <div className="title">
                      <div>Listeners</div>
                      <input placeholder="filter" type="search" value={this.getFilterValue("listeners")} onChange={({target})=>this.setFilterValue("listeners", target.value)} />
                    </div>
                    {selectedFrame ?
                      <div className="listeners">
                        {this.filterList("listeners",listeners).map((listener, index) => {
                          return <div onClick={() => this.selectListener(listener, selectedFrame)} className="listener" key={index}>{listener}</div>
                        })
                        }</div>
                      : "Select a frame to see it's listeners"}
                  </div>
                },
                {
                  w: 35,
                  h: 100,
                  content: <>
                    <div style={{ height: "180px", width: "100%" }} className="actions">
                      {this.renderMessageControlPanel()}
                    </div>
                  <div style={{ maxHeight: "calc(100% - 180px)", backgroundColor: "#000000", height: "calc(100% - 120px)" }}>
                    <Editor style={{ height: "100%", width: "100%" }} onMount={(session) => this.captureEditorSession(session)}></Editor>
                  </div>
                    
                    </>
                }
              ]}></Layout>
            },
            {
              w: 100,
              h: 20,
              name: "log",
              content: <Log></Log>
            }
          ]}
        ></Layout>
      </div>
    </>
  }
}

ReactDOM.render(<App></App>, document.getElementById("root"));