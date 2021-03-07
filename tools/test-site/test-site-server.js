const express = require('express');
const port = 8080;
const {join} = require("path");

var app = express();
app.use("/exploit", express.static(join(__dirname,'../../chrome-extension/'),{index:"exploit.html"}));
app.use("/", express.static(join(__dirname,'/html-files/')));


app.listen(port, function () {
    console.log('development server running on ' + port);
})