import React from "react";
import ReactDOM from "react-dom";
import "./test-site.scss"
import Layout from '../components/layout';
import Header from '../components/header';
import Vulnerable from "./vulnerable";


export default class App extends React.Component {
  renderMain(){
    this.state = this.state || {};
    return <>
      <Header></Header>
      <div style={{ height: "calc(100% - 60px)" }}>
        <Layout layout={
          [
            {
              w: 70,
              h: 70,
              content: <div>
                <span>Embedded using src, vulnerable </span>
                <div className="iframe">
                  <iframe id="target-iframe" src="http://127.0.0.1:8080/?scenario=vulnerable"></iframe>
                </div>

              </div>

            },
            {
              w: 70,
              h: 70,
              content: <div>
                <span>Embedded using src, vulnerable </span>
                <div className="iframe">
                  <input onChange={({target})=>this.setState( {value:target.value})} value={this.state.value}></input>
                  <button onClick={()=>{
                    document.getElementById("target-iframe").contentWindow.postMessage(this.state.value)
                  }}>send to child</button>
                </div>

              </div>

            },
          ]}
        ></Layout>
      </div>
    </>
  }
  
  render() {
    const urlSearchParams = new URLSearchParams(window.location.search);
    switch (urlSearchParams.get("scenario")) {
      case "vulnerable":
        return <Vulnerable></Vulnerable>
      default:
        return this.renderMain()
    }
    
  }
}

ReactDOM.render(<App></App>, document.getElementById("root"));