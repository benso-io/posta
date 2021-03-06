import React from 'react';
export default class Header extends React.Component {
    constructor(...args) {
        super(...args);
    }
    render (){
        return <div className="head">
        <img src="benso.png"></img>
        <span className="name">Posta</span>
        <span><a style={{color: "initial",textDecoration:"none"}} href="https://benso.io">benso.io</a> open source</span>
        <span className="ref"><a href="https://enso.security">by Enso Security</a></span>
      </div>
    }
}