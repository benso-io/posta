const i = document.createElement("iframe");
    i.setAttribute("srcdoc", "JS:srcdoc");
    i.style.height = "100px";
    i.style.width = "100px";
    document.body.appendChild(i);


const iframe = document.createElement('iframe');
const html = 'JS:data uri';
iframe.src = 'data:text/html;charset=utf-8,' + encodeURI(html);
iframe.style.height = "100px";
iframe.style.width = "100px";
document.body.appendChild(iframe);