import React from "react";
const {encode } = require('js-base64').Base64;
export default class WindowFrame extends React.Component {
    onSelect(e) {
      const { frame, selectFrame,code } = this.props;
      e.stopPropagation();
      if (typeof(frame.attributes.windowId)==="undefined"){
        return
      }
      selectFrame(frame.id);
    }
    render() {
      let { frame, order = 0, selectedTabFrameId, selectFrame, code } = this.props;
      const isSelected = selectedTabFrameId === frame.id;
      if (!frame) return null;
      const {  children } = frame;
      const {locationHref, listeners=[], windowId} = frame.attributes;
      const {  count= 0, sent=0, received = 0} = frame.messages || {};
      let _children = children.list();
      let fullyInjected = typeof(windowId)==="undefined";
      let extUrl = chrome.runtime.getURL("exploit.html");
      extUrl = extUrl+`?target=${encode(locationHref)}&code=${encode(code)}`
      // console.log(messages,children, locationHref, listeners)
      return <div className={`window-frame ${
          fullyInjected ? 'unselectable ':''
          }order-${order}${
            isSelected ? ' selected' : ''
            }`} onClick={(e) => this.onSelect(e)} tabIndex="-1">
          <div className="href">{locationHref}
            <a className="link" target="_blank" href={extUrl}>host</a>
          </div>
          <div className="stats">
            { fullyInjected  ? 
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
                code={code}
              key={index}
              frame={frame}
              selectFrame={selectFrame}
              selectedTabFrameId={selectedTabFrameId}
              order={order + 1}></WindowFrame>)}
          </div> : null}
        </div> 
    }
  }