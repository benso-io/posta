import React from "react";
export default class WindowFrame extends React.Component {
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