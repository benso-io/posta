const express = require('express');
const port = 8080;
const {join} = require("path");

var app = express();
app.use("/", express.static(join(__dirname,'/html-files/')))

app.listen(port, function () {
    console.log('development server running on ' + port);
})