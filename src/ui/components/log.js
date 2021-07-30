import classNames from 'classnames'
import React from 'react';
import "./log.scss"

function uuidv4() {
    let dt = new Date().getTime()
    const uuid = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
        const r = (dt + Math.random() * 16) % 16 | 0
        dt = Math.floor(dt / 16)
        return (c == 'x' ? r : (r & 0x3 | 0x8)).toString(16)
    })

    return uuid
}

export default class Log extends React.Component {
    constructor(...args) {
        super(...args);
        this.state = {
            log: [],
        }
        if (chrome.extension) {
            chrome.extension.getBackgroundPage().$$$SubScribeToPosta((...args) => {
                if (args.length) this.log(...args);
                this.setState({
                    renderId: uuidv4()
                })
            });
        }
        
    }

    pushLogRecord(record) {
        const { log = [] } = this.state || {};
        log.unshift(record);
        log.splice(30);
        this.setState({ log });
        return record;
    }

    log(level, message, stack, status) {
        return this.pushLogRecord({
            id: uuidv4(),
            ts: (new Date()).toISOString().substr(11, 12),
            level,
            message,
            stack,
            status,
        })
    }

    render() {
        return <div className="papers">
            {this.state.log.map((item, index) => <div
                className={classNames(item.level, item.status)}
                key={index}>
                <div>
                    <span level={item.level}>{item.level}</span>
                    <span className={classNames("ts", item.status)}>[{item.ts}]</span>
                    <span className="title-source">{item.message}</span>
                </div>
                <div className={classNames("stack", item.status)}>{item.stack}</div>
            </div>)
            }</div>
    }
}