const appFactory = require("./tools/app-factory");
const express = require('express');
const port = 8080;
const {join} = require("path");
const app = express();
app.use("/", express.static(join(__dirname,'chrome-extension'),{index:"test-site.html"}));
app.use("/exploit", express.static(join(__dirname,'chrome-extension'),{index:"exploit.html"}));
appFactory(true);

app.listen(port, function () {
    console.log('development server running on ' + port);
})