import React from "react";
import { v4 as uuidv4 } from 'uuid';
// import "ace-builds/src-noconflict/ace"

var ace = require('ace-builds/src-noconflict/ace')
ace.config.set('basePath', "/node_modules/ace-builds/src-noconflict/");
var merbivore_soft = require('ace-builds/src-noconflict/theme-merbivore_soft');
// var {Mode} = require('ace-builds/src-noconflict/mode-json');
// console.log(Mode)
// var ace = require('ace-builds');

export default class Editor extends React.Component {
    constructor() {
        super()
        this.id = uuidv4();
    }
    componentDidMount() {
        const {save=()=>{}, onMount=()=>{} }=this.props;
        this.editor = ace.edit(this.id, {
            showGutter:false,
            showFoldWidgets: true,
            
            fontSize: "12pt"
        });
        this.editor.setTheme(merbivore_soft);
        this.session = ace.createEditSession("");
        // this.session.setMode(Mode);
        // this.session.setValue(content);
        // this.session.on("change", (change, session) => save(session.getValue()));
        this.editor.setSession(this.session);
        onMount(this.session);
    }

    render() {
        return (<div id={this.id} style={this.props.style}></div>);
    }
}