const { spawn } = require("child_process");
const chromium = require('chromium');
const imagePath = chromium.path;
const appFactory = require("./app-factory");

const startBrowser = (url) => {
  return new Promise((resolve, reject) => {
    var args = [
      `--user-data-dir=.local-files/browser-profile`,
      `--load-extension=${__dirname}/chrome-extension`,
      `--whitelisted-extension-id=dnhcogbojmopnpcnbbpicobacfacdbbk`,
      url
    ].filter(a => a);
    const browserProcess = spawn(
      imagePath,
      args,
      {cwd:__dirname}
    );
    setTimeout(() => resolve(browserProcess), 1000)
  });
}

const [nodeImage, scriptPath, url="http://127.0.0.1:8080/"] = process.argv;

if (true){
  appFactory(true);
  require("./test-site/test-site-server")
}

startBrowser(url);