import React from 'react';
export default class Vulnerable extends React.Component {
  constructor(...args) {
    super()
    this.myRef = React.createRef();
    window.addEventListener("message",({data})=>{
      console.log(data)
      let newDiv = document.createElement('div');
      newDiv.innerHTML = data;
      this.myRef.current.appendChild(newDiv);
    })
  }
  render (){
    return <div ref={this.myRef}>Vulnerable</div>
  }
}