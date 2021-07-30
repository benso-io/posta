import React from "react";
import { v4 as uuidv4 } from 'uuid';

const ace = require('ace-builds');
ace.config.setModuleUrl('ace/mode/javascript', require('file-loader?name=ace-[name].[ext]&esModule=false!ace-builds/src-noconflict/mode-javascript.js'));
ace.config.setModuleUrl('ace/mode/json', require('file-loader?name=ace-[name].[ext]&esModule=false!ace-builds/src-noconflict/mode-json.js'));
ace.config.setModuleUrl('ace/theme/merbivore_soft', require('file-loader?name=ace-[name].[ext]&esModule=false!ace-builds/src-noconflict/theme-merbivore_soft.js'))
ace.config.setModuleUrl('ace/mode/javascript_worker', require('file-loader?name=ace-[name].[ext]&esModule=false!ace-builds/src-noconflict/worker-javascript.js'))
ace.config.setModuleUrl('ace/mode/json_worker', require('file-loader?name=ace-[name].[ext]&esModule=false!ace-builds/src-noconflict/worker-json.js'))
ace.config.setModuleUrl('ace/mode/', require('file-loader?name=ace-[name].[ext]&esModule=false!ace-builds/src-noconflict/worker-json.js'))
ace.config.setModuleUrl('ace/ext/searchbox', require('file-loader?name=ace-[name].[ext]&esModule=false!ace-builds/src-noconflict/ext-searchbox.js'))

export default class Editor extends React.Component {
    constructor() {
        super()
        this.id = uuidv4();
    }
    componentDidMount() {
        const {save=()=>{}, onMount=()=>{} }=this.props;
        this.editor = ace.edit(this.id, {
            showGutter:true,
            showFoldWidgets: true,
            fontSize: "12pt"
        });
        this.editor.setTheme("ace/theme/merbivore_soft");
        this.session = ace.createEditSession("");
        this.editor.setSession(this.session);
        onMount(this.session);
    }

    render() {
        return (<div id={this.id} style={this.props.style}></div>);
    }
}