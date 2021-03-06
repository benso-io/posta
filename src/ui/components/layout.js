
import React from "react";
export default class Layout extends React.Component {
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