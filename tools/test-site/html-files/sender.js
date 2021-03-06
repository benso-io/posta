var index = 1;
const send = (timeout)=>{
    window.parent.postMessage(`message number ${index} from ${location.href} to root`, "*")
    setTimeout(()=>send(timeout), timeout)
}

send(1000)