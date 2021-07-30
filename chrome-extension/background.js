/******/ (function(modules) { // webpackBootstrap
/******/ 	// The module cache
/******/ 	var installedModules = {};
/******/
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/
/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId]) {
/******/ 			return installedModules[moduleId].exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			i: moduleId,
/******/ 			l: false,
/******/ 			exports: {}
/******/ 		};
/******/
/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);
/******/
/******/ 		// Flag the module as loaded
/******/ 		module.l = true;
/******/
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/
/******/
/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;
/******/
/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;
/******/
/******/ 	// define getter function for harmony exports
/******/ 	__webpack_require__.d = function(exports, name, getter) {
/******/ 		if(!__webpack_require__.o(exports, name)) {
/******/ 			Object.defineProperty(exports, name, { enumerable: true, get: getter });
/******/ 		}
/******/ 	};
/******/
/******/ 	// define __esModule on exports
/******/ 	__webpack_require__.r = function(exports) {
/******/ 		if(typeof Symbol !== 'undefined' && Symbol.toStringTag) {
/******/ 			Object.defineProperty(exports, Symbol.toStringTag, { value: 'Module' });
/******/ 		}
/******/ 		Object.defineProperty(exports, '__esModule', { value: true });
/******/ 	};
/******/
/******/ 	// create a fake namespace object
/******/ 	// mode & 1: value is a module id, require it
/******/ 	// mode & 2: merge all properties of value into the ns
/******/ 	// mode & 4: return value when already ns object
/******/ 	// mode & 8|1: behave like require
/******/ 	__webpack_require__.t = function(value, mode) {
/******/ 		if(mode & 1) value = __webpack_require__(value);
/******/ 		if(mode & 8) return value;
/******/ 		if((mode & 4) && typeof value === 'object' && value && value.__esModule) return value;
/******/ 		var ns = Object.create(null);
/******/ 		__webpack_require__.r(ns);
/******/ 		Object.defineProperty(ns, 'default', { enumerable: true, value: value });
/******/ 		if(mode & 2 && typeof value != 'string') for(var key in value) __webpack_require__.d(ns, key, function(key) { return value[key]; }.bind(null, key));
/******/ 		return ns;
/******/ 	};
/******/
/******/ 	// getDefaultExport function for compatibility with non-harmony modules
/******/ 	__webpack_require__.n = function(module) {
/******/ 		var getter = module && module.__esModule ?
/******/ 			function getDefault() { return module['default']; } :
/******/ 			function getModuleExports() { return module; };
/******/ 		__webpack_require__.d(getter, 'a', getter);
/******/ 		return getter;
/******/ 	};
/******/
/******/ 	// Object.prototype.hasOwnProperty.call
/******/ 	__webpack_require__.o = function(object, property) { return Object.prototype.hasOwnProperty.call(object, property); };
/******/
/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "";
/******/
/******/
/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(__webpack_require__.s = 39);
/******/ })
/************************************************************************/
/******/ ({

/***/ 39:
/***/ (function(module, exports) {

// let handlers = new Set();
let uiUpdateHandler;
chrome.browserAction.onClicked.addListener(() => {
  chrome.runtime.openOptionsPage();
});

$$$SubScribeToPosta = handler => {
  handler("info", "new subscription from options page");
  windowsByTabAndFrameId = new Bucket(TabFrame);
  messagesByMessageId = new Bucket(Item);
  messageByTabFrameId = new Bucket(MessagesBucket);
  tabsFrames = new Bucket(TabFrame);
  uiUpdateHandler = handler;
}; // var timer;
// function refreshOptionsPage() {
//     clearTimeout(timer)
//     timer = setTimeout(()=>{
//         try {
//             // uiUpdateHandler();
//             // Array.from(handlers).forEach(h => h())
//         } catch (error) {
//             console.log(error)
//         }
//     },1000)
// }


class Bucket {
  constructor(ItemConstructor) {
    this.ItemConstructor = ItemConstructor;
    this._bucket = {};
  }

  add(id) {
    const {
      ItemConstructor
    } = this;
    if (!this._bucket[id]) this._bucket[id] = new ItemConstructor(id);
    return this._bucket[id];
  }

  set(id, item) {
    this._bucket[id] = item;
    return this._bucket[id];
  }

  get(id) {
    return this._bucket[id] || {
      get: () => ({}),
      set: () => ({
        get: () => {}
      })
    };
  }

  list(decay = 10 * 1000) {
    return Object.keys(this._bucket).map(k => this._bucket[k]); // .filter(i => !decay || !i.isDecayed(decay))
  }

}

class Item {
  constructor(id) {
    this.attributes = {};
    this.id = id;
    this.touch(true);
  }

  touch(modify) {
    this._json = modify ? undefined : this._json;
    this.lastSeen = Date.now(); // if (modify) refreshOptionsPage();
  }

  set(key, value) {
    this.touch(this.attributes[key] !== value);
    this.attributes[key] = value;
    return this;
  }

  isDecayed(decay) {
    return false;
    if (decay && this.lastSeen + decay < Date.now()) return true;
  }

  json() {
    this._json = this._json || this.get();
    return this._json;
  }

  get() {
    return {
      id: this.id,
      ...this.attributes
    };
  }

}

class TabFrame extends Item {
  constructor(tabFrameId) {
    super(tabFrameId);
    this.children = new Bucket(TabFrame);
    this.set("listeners", []);
  }

  addChild(child) {
    return this.children.set(child.id, child);
  }

  get windowId() {
    return windowsByTabAndFrameId.get(this.id).id;
  }

  get messages() {
    return messageByTabFrameId.get(this.id).messages || {
      messages: [],
      sent: 0,
      count: 0,
      received: 0
    };
  }

  get() {
    const {
      children,
      id
    } = this;
    return { ...super.get(),
      ...windowsByTabAndFrameId.get(id).get(),
      children: children.list()
    };
  }

}

class MessagesBucket extends Item {
  constructor(windowId) {
    super(windowId);
    this.messages = {
      messages: [],
      sent: 0,
      count: 0,
      received: 0
    };
  }

  addMessage(messageId, counter) {
    if (this.messages.messages.indexOf(messageId) !== -1) return;
    this.messages[counter]++;
    this.messages.count++;
    this.messages.messages.unshift(messageId);
    this.messages.messages = this.messages.messages.slice(0, 100); //to avoid denial of service

    this.messages.messages = Array.from(this.messages.messages);
    this.touch(true); // refreshOptionsPage()
  }

  get() {
    return { ...this.messages,
      messages: this.messages.map(m => messagesByMessageId.get(m).get())
    };
  }

}

windowsByTabAndFrameId = new Bucket(TabFrame);
messagesByMessageId = new Bucket(Item);
messageByTabFrameId = new Bucket(MessagesBucket);
tabsFrames = new Bucket(TabFrame);

const receivedMessage = ({
  messageId,
  data,
  origin
}, tabId, frameId) => {
  let tabWindowId = `${tabId}::${frameId}`;
  messageByTabFrameId.add(tabWindowId).addMessage(messageId, "received");
  uiUpdateHandler("info", `new message from ${origin}`, JSON.stringify(data));
  messagesByMessageId.add(messageId).set("receiver", tabWindowId).set("origin", origin).set("data", data).set("originalType", typeof data);
};

const accountForMessage = ({
  messageId
}, tabId, frameId) => {
  let tabWindowId = `${tabId}::${frameId}`;
  messageByTabFrameId.add(tabWindowId).addMessage(messageId, "sent");
  messagesByMessageId.add(messageId).set("sender", tabWindowId);
};

const listeners = (message, tabId, frameId) => {
  const {
    listeners,
    windowId
  } = message;
  windowsByTabAndFrameId.add(`${tabId}::${frameId}`).set("listeners", listeners).set("windowId", windowId);
};

const topicHandlers = {
  "received-message": receivedMessage,
  "account-for-message": accountForMessage,
  listeners,
  "account-for-path": (message, tabId, frameId) => {
    let tabWindowId = `${tabId}::${frameId}`;
    let {
      path
    } = message;
    windowsByTabAndFrameId.add(tabWindowId).set("path", path);
  }
};

const processIncomingMessage = (message, tabId, frameId) => {
  let {
    topic
  } = message;
  if (!topicHandlers[topic]) return console.log(`TODO: handel ${topic} from ${tabId}:${frameId}`);
  topicHandlers[topic](message, tabId, frameId);
};

chrome.runtime.onMessage.addListener((message, sender, response) => {
  const {
    frameId,
    tab: {
      id
    }
  } = sender;
  if (!message) console.trace("empty message");

  try {
    processIncomingMessage(message, id, frameId);
  } catch (error) {
    console.log(error);
  }
});

const updateTabs = () => {
  chrome.tabs.query({}, allTabs => {
    let targetTabs = allTabs.filter(({
      url
    }) => !url.startsWith("chrome"));
    Promise.all(targetTabs.map(({
      id: tabId
    }) => new Promise((resolve, reject) => {
      chrome.webNavigation.getAllFrames({
        tabId
      }, frames => resolve({
        tabId,
        frames
      }));
    }))).then(updatedTabs => {
      tabsFrames = new Bucket(TabFrame);
      updatedTabs.forEach(({
        tabId,
        frames
      }) => {
        let topFrameIndex = frames.findIndex(({
          parentFrameId
        }) => parentFrameId === -1);
        if (topFrameIndex === -1) return;
        let [{
          frameId,
          url
        }] = frames.splice(topFrameIndex, 1);
        let tabFrameId = `${tabId}::${frameId}`;
        let top = new TabFrame(tabFrameId);
        top.set("locationHref", url);
        windowsByTabAndFrameId.set(tabFrameId, top);
        tabsFrames.set(tabFrameId, top);
        frames.forEach(frame => {
          const {
            frameId,
            parentFrameId,
            url
          } = frame;
          let tabFrameId = `${tabId}::${frameId}`;
          let parentTabFrameId = `${tabId}::${parentFrameId}`;
          let windowFrame = windowsByTabAndFrameId.add(tabFrameId).set("locationHref", url);
          let parentWindowFrame = windowsByTabAndFrameId.add(parentTabFrameId);
          parentWindowFrame.addChild(windowFrame);
        });
      });
    });
  });
};

chrome.webNavigation.onDOMContentLoaded.addListener(updateTabs);
chrome.webNavigation.onCommitted.addListener(updateTabs);

/***/ })

/******/ });
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIndlYnBhY2s6Ly8vd2VicGFjay9ib290c3RyYXAiLCJ3ZWJwYWNrOi8vLy4vc3JjL2V4dGVuc2lvbi9iYWNrZ3JvdW5kLmpzIl0sIm5hbWVzIjpbInVpVXBkYXRlSGFuZGxlciIsImNocm9tZSIsImJyb3dzZXJBY3Rpb24iLCJvbkNsaWNrZWQiLCJhZGRMaXN0ZW5lciIsInJ1bnRpbWUiLCJvcGVuT3B0aW9uc1BhZ2UiLCIkJCRTdWJTY3JpYmVUb1Bvc3RhIiwiaGFuZGxlciIsIndpbmRvd3NCeVRhYkFuZEZyYW1lSWQiLCJCdWNrZXQiLCJUYWJGcmFtZSIsIm1lc3NhZ2VzQnlNZXNzYWdlSWQiLCJJdGVtIiwibWVzc2FnZUJ5VGFiRnJhbWVJZCIsIk1lc3NhZ2VzQnVja2V0IiwidGFic0ZyYW1lcyIsImNvbnN0cnVjdG9yIiwiSXRlbUNvbnN0cnVjdG9yIiwiX2J1Y2tldCIsImFkZCIsImlkIiwic2V0IiwiaXRlbSIsImdldCIsImxpc3QiLCJkZWNheSIsIk9iamVjdCIsImtleXMiLCJtYXAiLCJrIiwiYXR0cmlidXRlcyIsInRvdWNoIiwibW9kaWZ5IiwiX2pzb24iLCJ1bmRlZmluZWQiLCJsYXN0U2VlbiIsIkRhdGUiLCJub3ciLCJrZXkiLCJ2YWx1ZSIsImlzRGVjYXllZCIsImpzb24iLCJ0YWJGcmFtZUlkIiwiY2hpbGRyZW4iLCJhZGRDaGlsZCIsImNoaWxkIiwid2luZG93SWQiLCJtZXNzYWdlcyIsInNlbnQiLCJjb3VudCIsInJlY2VpdmVkIiwiYWRkTWVzc2FnZSIsIm1lc3NhZ2VJZCIsImNvdW50ZXIiLCJpbmRleE9mIiwidW5zaGlmdCIsInNsaWNlIiwiQXJyYXkiLCJmcm9tIiwibSIsInJlY2VpdmVkTWVzc2FnZSIsImRhdGEiLCJvcmlnaW4iLCJ0YWJJZCIsImZyYW1lSWQiLCJ0YWJXaW5kb3dJZCIsIkpTT04iLCJzdHJpbmdpZnkiLCJhY2NvdW50Rm9yTWVzc2FnZSIsImxpc3RlbmVycyIsIm1lc3NhZ2UiLCJ0b3BpY0hhbmRsZXJzIiwicGF0aCIsInByb2Nlc3NJbmNvbWluZ01lc3NhZ2UiLCJ0b3BpYyIsImNvbnNvbGUiLCJsb2ciLCJvbk1lc3NhZ2UiLCJzZW5kZXIiLCJyZXNwb25zZSIsInRhYiIsInRyYWNlIiwiZXJyb3IiLCJ1cGRhdGVUYWJzIiwidGFicyIsInF1ZXJ5IiwiYWxsVGFicyIsInRhcmdldFRhYnMiLCJmaWx0ZXIiLCJ1cmwiLCJzdGFydHNXaXRoIiwiUHJvbWlzZSIsImFsbCIsInJlc29sdmUiLCJyZWplY3QiLCJ3ZWJOYXZpZ2F0aW9uIiwiZ2V0QWxsRnJhbWVzIiwiZnJhbWVzIiwidGhlbiIsInVwZGF0ZWRUYWJzIiwiZm9yRWFjaCIsInRvcEZyYW1lSW5kZXgiLCJmaW5kSW5kZXgiLCJwYXJlbnRGcmFtZUlkIiwic3BsaWNlIiwidG9wIiwiZnJhbWUiLCJwYXJlbnRUYWJGcmFtZUlkIiwid2luZG93RnJhbWUiLCJwYXJlbnRXaW5kb3dGcmFtZSIsIm9uRE9NQ29udGVudExvYWRlZCIsIm9uQ29tbWl0dGVkIl0sIm1hcHBpbmdzIjoiO1FBQUE7UUFDQTs7UUFFQTtRQUNBOztRQUVBO1FBQ0E7UUFDQTtRQUNBO1FBQ0E7UUFDQTtRQUNBO1FBQ0E7UUFDQTtRQUNBOztRQUVBO1FBQ0E7O1FBRUE7UUFDQTs7UUFFQTtRQUNBO1FBQ0E7OztRQUdBO1FBQ0E7O1FBRUE7UUFDQTs7UUFFQTtRQUNBO1FBQ0E7UUFDQSwwQ0FBMEMsZ0NBQWdDO1FBQzFFO1FBQ0E7O1FBRUE7UUFDQTtRQUNBO1FBQ0Esd0RBQXdELGtCQUFrQjtRQUMxRTtRQUNBLGlEQUFpRCxjQUFjO1FBQy9EOztRQUVBO1FBQ0E7UUFDQTtRQUNBO1FBQ0E7UUFDQTtRQUNBO1FBQ0E7UUFDQTtRQUNBO1FBQ0E7UUFDQSx5Q0FBeUMsaUNBQWlDO1FBQzFFLGdIQUFnSCxtQkFBbUIsRUFBRTtRQUNySTtRQUNBOztRQUVBO1FBQ0E7UUFDQTtRQUNBLDJCQUEyQiwwQkFBMEIsRUFBRTtRQUN2RCxpQ0FBaUMsZUFBZTtRQUNoRDtRQUNBO1FBQ0E7O1FBRUE7UUFD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QUFNLEtBQUlDLE9BQVEsRUFBdEM7QUFDQSxjQUFJMkMsZ0JBQWdCLEdBQUksR0FBRTVDLEtBQU0sS0FBSXdDLGFBQWMsRUFBbEQ7QUFDQSxjQUFJSyxXQUFXLEdBQUdwRyxzQkFBc0IsQ0FBQ1csR0FBdkIsQ0FBMkJ1QixVQUEzQixFQUF1Q3JCLEdBQXZDLENBQTJDLGNBQTNDLEVBQTJEb0UsR0FBM0QsQ0FBbEI7QUFDQSxjQUFJb0IsaUJBQWlCLEdBQUdyRyxzQkFBc0IsQ0FBQ1csR0FBdkIsQ0FBMkJ3RixnQkFBM0IsQ0FBeEI7QUFDQUUsMkJBQWlCLENBQUNqRSxRQUFsQixDQUEyQmdFLFdBQTNCO0FBQ0gsU0FYRDtBQVlILE9BdEJEO0FBdUJILEtBakNEO0FBa0NILEdBcENEO0FBcUNILENBdENEOztBQXdDQTVHLE1BQU0sQ0FBQytGLGFBQVAsQ0FBcUJlLGtCQUFyQixDQUF3QzNHLFdBQXhDLENBQW9EZ0YsVUFBcEQ7QUFDQW5GLE1BQU0sQ0FBQytGLGFBQVAsQ0FBcUJnQixXQUFyQixDQUFpQzVHLFdBQWpDLENBQTZDZ0YsVUFBN0MsRSIsImZpbGUiOiJiYWNrZ3JvdW5kLmpzIiwic291cmNlc0NvbnRlbnQiOlsiIFx0Ly8gVGhlIG1vZHVsZSBjYWNoZVxuIFx0dmFyIGluc3RhbGxlZE1vZHVsZXMgPSB7fTtcblxuIFx0Ly8gVGhlIHJlcXVpcmUgZnVuY3Rpb25cbiBcdGZ1bmN0aW9uIF9fd2VicGFja19yZXF1aXJlX18obW9kdWxlSWQpIHtcblxuIFx0XHQvLyBDaGVjayBpZiBtb2R1bGUgaXMgaW4gY2FjaGVcbiBcdFx0aWYoaW5zdGFsbGVkTW9kdWxlc1ttb2R1bGVJZF0pIHtcbiBcdFx0XHRyZXR1cm4gaW5zdGFsbGVkTW9kdWxlc1ttb2R1bGVJZF0uZXhwb3J0cztcbiBcdFx0fVxuIFx0XHQvLyBDcmVhdGUgYSBuZXcgbW9kdWxlIChhbmQgcHV0IGl0IGludG8gdGhlIGNhY2hlKVxuIFx0XHR2YXIgbW9kdWxlID0gaW5zdGFsbGVkTW9kdWxlc1ttb2R1bGVJZF0gPSB7XG4gXHRcdFx0aTogbW9kdWxlSWQsXG4gXHRcdFx0bDogZmFsc2UsXG4gXHRcdFx0ZXhwb3J0czoge31cbiBcdFx0fTtcblxuIFx0XHQvLyBFeGVjdXRlIHRoZSBtb2R1bGUgZnVuY3Rpb25cbiBcdFx0bW9kdWxlc1ttb2R1bGVJZF0uY2FsbChtb2R1bGUuZXhwb3J0cywgbW9kdWxlLCBtb2R1bGUuZXhwb3J0cywgX193ZWJwYWNrX3JlcXVpcmVfXyk7XG5cbiBcdFx0Ly8gRmxhZyB0aGUgbW9kdWxlIGFzIGxvYWRlZFxuIFx0XHRtb2R1bGUubCA9IHRydWU7XG5cbiBcdFx0Ly8gUmV0dXJuIHRoZSBleHBvcnRzIG9mIHRoZSBtb2R1bGVcbiBcdFx0cmV0dXJuIG1vZHVsZS5leHBvcnRzO1xuIFx0fVxuXG5cbiBcdC8vIGV4cG9zZSB0aGUgbW9kdWxlcyBvYmplY3QgKF9fd2VicGFja19tb2R1bGVzX18pXG4gXHRfX3dlYnBhY2tfcmVxdWlyZV9fLm0gPSBtb2R1bGVzO1xuXG4gXHQvLyBleHBvc2UgdGhlIG1vZHVsZSBjYWNoZVxuIFx0X193ZWJwYWNrX3JlcXVpcmVfXy5jID0gaW5zdGFsbGVkTW9kdWxlcztcblxuIFx0Ly8gZGVmaW5lIGdldHRlciBmdW5jdGlvbiBmb3IgaGFybW9ueSBleHBvcnRzXG4gXHRfX3dlYnBhY2tfcmVxdWlyZV9fLmQgPSBmdW5jdGlvbihleHBvcnRzLCBuYW1lLCBnZXR0ZXIpIHtcbiBcdFx0aWYoIV9fd2VicGFja19yZXF1aXJlX18ubyhleHBvcnRzLCBuYW1lKSkge1xuIFx0XHRcdE9iamVjdC5kZWZpbmVQcm9wZXJ0eShleHBvcnRzLCBuYW1lLCB7IGVudW1lcmFibGU6IHRydWUsIGdldDogZ2V0dGVyIH0pO1xuIFx0XHR9XG4gXHR9O1xuXG4gXHQvLyBkZWZpbmUgX19lc01vZHVsZSBvbiBleHBvcnRzXG4gXHRfX3dlYnBhY2tfcmVxdWlyZV9fLnIgPSBmdW5jdGlvbihleHBvcnRzKSB7XG4gXHRcdGlmKHR5cGVvZiBTeW1ib2wgIT09ICd1bmRlZmluZWQnICYmIFN5bWJvbC50b1N0cmluZ1RhZykge1xuIFx0XHRcdE9iamVjdC5kZWZpbmVQcm9wZXJ0eShleHBvcnRzLCBTeW1ib2wudG9TdHJpbmdUYWcsIHsgdmFsdWU6ICdNb2R1bGUnIH0pO1xuIFx0XHR9XG4gXHRcdE9iamVjdC5kZWZpbmVQcm9wZXJ0eShleHBvcnRzLCAnX19lc01vZHVsZScsIHsgdmFsdWU6IHRydWUgfSk7XG4gXHR9O1xuXG4gXHQvLyBjcmVhdGUgYSBmYWtlIG5hbWVzcGFjZSBvYmplY3RcbiBcdC8vIG1vZGUgJiAxOiB2YWx1ZSBpcyBhIG1vZHVsZSBpZCwgcmVxdWlyZSBpdFxuIFx0Ly8gbW9kZSAmIDI6IG1lcmdlIGFsbCBwcm9wZXJ0aWVzIG9mIHZhbHVlIGludG8gdGhlIG5zXG4gXHQvLyBtb2RlICYgNDogcmV0dXJuIHZhbHVlIHdoZW4gYWxyZWFkeSBucyBvYmplY3RcbiBcdC8vIG1vZGUgJiA4fDE6IGJlaGF2ZSBsaWtlIHJlcXVpcmVcbiBcdF9fd2VicGFja19yZXF1aXJlX18udCA9IGZ1bmN0aW9uKHZhbHVlLCBtb2RlKSB7XG4gXHRcdGlmKG1vZGUgJiAxKSB2YWx1ZSA9IF9fd2VicGFja19yZXF1aXJlX18odmFsdWUpO1xuIFx0XHRpZihtb2RlICYgOCkgcmV0dXJuIHZhbHVlO1xuIFx0XHRpZigobW9kZSAmIDQpICYmIHR5cGVvZiB2YWx1ZSA9PT0gJ29iamVjdCcgJiYgdmFsdWUgJiYgdmFsdWUuX19lc01vZHVsZSkgcmV0dXJuIHZhbHVlO1xuIFx0XHR2YXIgbnMgPSBPYmplY3QuY3JlYXRlKG51bGwpO1xuIFx0XHRfX3dlYnBhY2tfcmVxdWlyZV9fLnIobnMpO1xuIFx0XHRPYmplY3QuZGVmaW5lUHJvcGVydHkobnMsICdkZWZhdWx0JywgeyBlbnVtZXJhYmxlOiB0cnVlLCB2YWx1ZTogdmFsdWUgfSk7XG4gXHRcdGlmKG1vZGUgJiAyICYmIHR5cGVvZiB2YWx1ZSAhPSAnc3RyaW5nJykgZm9yKHZhciBrZXkgaW4gdmFsdWUpIF9fd2VicGFja19yZXF1aXJlX18uZChucywga2V5LCBmdW5jdGlvbihrZXkpIHsgcmV0dXJuIHZhbHVlW2tleV07IH0uYmluZChudWxsLCBrZXkpKTtcbiBcdFx0cmV0dXJuIG5zO1xuIFx0fTtcblxuIFx0Ly8gZ2V0RGVmYXVsdEV4cG9ydCBmdW5jdGlvbiBmb3IgY29tcGF0aWJpbGl0eSB3aXRoIG5vbi1oYXJtb255IG1vZHVsZXNcbiBcdF9fd2VicGFja19yZXF1aXJlX18ubiA9IGZ1bmN0aW9uKG1vZHVsZSkge1xuIFx0XHR2YXIgZ2V0dGVyID0gbW9kdWxlICYmIG1vZHVsZS5fX2VzTW9kdWxlID9cbiBcdFx0XHRmdW5jdGlvbiBnZXREZWZhdWx0KCkgeyByZXR1cm4gbW9kdWxlWydkZWZhdWx0J107IH0gOlxuIFx0XHRcdGZ1bmN0aW9uIGdldE1vZHVsZUV4cG9ydHMoKSB7IHJldHVybiBtb2R1bGU7IH07XG4gXHRcdF9fd2VicGFja19yZXF1aXJlX18uZChnZXR0ZXIsICdhJywgZ2V0dGVyKTtcbiBcdFx0cmV0dXJuIGdldHRlcjtcbiBcdH07XG5cbiBcdC8vIE9iamVjdC5wcm90b3R5cGUuaGFzT3duUHJvcGVydHkuY2FsbFxuIFx0X193ZWJwYWNrX3JlcXVpcmVfXy5vID0gZnVuY3Rpb24ob2JqZWN0LCBwcm9wZXJ0eSkgeyByZXR1cm4gT2JqZWN0LnByb3RvdHlwZS5oYXNPd25Qcm9wZXJ0eS5jYWxsKG9iamVjdCwgcHJvcGVydHkpOyB9O1xuXG4gXHQvLyBfX3dlYnBhY2tfcHVibGljX3BhdGhfX1xuIFx0X193ZWJwYWNrX3JlcXVpcmVfXy5wID0gXCJcIjtcblxuXG4gXHQvLyBMb2FkIGVudHJ5IG1vZHVsZSBhbmQgcmV0dXJuIGV4cG9ydHNcbiBcdHJldHVybiBfX3dlYnBhY2tfcmVxdWlyZV9fKF9fd2VicGFja19yZXF1aXJlX18ucyA9IDM5KTtcbiIsIi8vIGxldCBoYW5kbGVycyA9IG5ldyBTZXQoKTtcclxubGV0IHVpVXBkYXRlSGFuZGxlcjtcclxuXHJcbmNocm9tZS5icm93c2VyQWN0aW9uLm9uQ2xpY2tlZC5hZGRMaXN0ZW5lcigoKT0+e1xyXG4gICAgY2hyb21lLnJ1bnRpbWUub3Blbk9wdGlvbnNQYWdlKCk7XHJcbn0pXHJcblxyXG4kJCRTdWJTY3JpYmVUb1Bvc3RhID0gKGhhbmRsZXIpID0+IHtcclxuICAgIGhhbmRsZXIoXCJpbmZvXCIsXCJuZXcgc3Vic2NyaXB0aW9uIGZyb20gb3B0aW9ucyBwYWdlXCIpO1xyXG4gICAgd2luZG93c0J5VGFiQW5kRnJhbWVJZCA9IG5ldyBCdWNrZXQoVGFiRnJhbWUpO1xyXG4gICAgbWVzc2FnZXNCeU1lc3NhZ2VJZCAgPSBuZXcgQnVja2V0KEl0ZW0pO1xyXG4gICAgbWVzc2FnZUJ5VGFiRnJhbWVJZCAgPSBuZXcgQnVja2V0KE1lc3NhZ2VzQnVja2V0KTtcclxuICAgIHRhYnNGcmFtZXMgPSBuZXcgQnVja2V0KFRhYkZyYW1lKTtcclxuICAgIHVpVXBkYXRlSGFuZGxlciA9IGhhbmRsZXI7XHJcbn1cclxuXHJcbi8vIHZhciB0aW1lcjtcclxuXHJcbi8vIGZ1bmN0aW9uIHJlZnJlc2hPcHRpb25zUGFnZSgpIHtcclxuLy8gICAgIGNsZWFyVGltZW91dCh0aW1lcilcclxuLy8gICAgIHRpbWVyID0gc2V0VGltZW91dCgoKT0+e1xyXG4vLyAgICAgICAgIHRyeSB7XHJcbi8vICAgICAgICAgICAgIC8vIHVpVXBkYXRlSGFuZGxlcigpO1xyXG4vLyAgICAgICAgICAgICAvLyBBcnJheS5mcm9tKGhhbmRsZXJzKS5mb3JFYWNoKGggPT4gaCgpKVxyXG4vLyAgICAgICAgIH0gY2F0Y2ggKGVycm9yKSB7XHJcbi8vICAgICAgICAgICAgIGNvbnNvbGUubG9nKGVycm9yKVxyXG4vLyAgICAgICAgIH1cclxuLy8gICAgIH0sMTAwMClcclxuICAgIFxyXG4vLyB9XHJcblxyXG5cclxuXHJcbmNsYXNzIEJ1Y2tldCB7XHJcbiAgICBjb25zdHJ1Y3RvcihJdGVtQ29uc3RydWN0b3IpIHtcclxuICAgICAgICB0aGlzLkl0ZW1Db25zdHJ1Y3RvciA9IEl0ZW1Db25zdHJ1Y3RvcjtcclxuICAgICAgICB0aGlzLl9idWNrZXQgPSB7fVxyXG4gICAgfVxyXG4gICAgYWRkKGlkKSB7XHJcbiAgICAgICAgY29uc3QgeyBJdGVtQ29uc3RydWN0b3IgfSA9IHRoaXM7XHJcbiAgICAgICAgaWYgKCF0aGlzLl9idWNrZXRbaWRdKSB0aGlzLl9idWNrZXRbaWRdID0gbmV3IEl0ZW1Db25zdHJ1Y3RvcihpZCk7XHJcbiAgICAgICAgcmV0dXJuIHRoaXMuX2J1Y2tldFtpZF1cclxuICAgIH1cclxuICAgIHNldChpZCwgaXRlbSl7XHJcbiAgICAgICAgdGhpcy5fYnVja2V0W2lkXSA9IGl0ZW07XHJcbiAgICAgICAgcmV0dXJuIHRoaXMuX2J1Y2tldFtpZF07XHJcbiAgICB9XHJcbiAgICBnZXQoaWQpIHtcclxuICAgICAgICByZXR1cm4gdGhpcy5fYnVja2V0W2lkXSB8fCB7XHJcbiAgICAgICAgICAgIGdldDogKCkgPT4gKHt9KSxcclxuICAgICAgICAgICAgc2V0OiAoKSA9PiAoeyBnZXQ6ICgpID0+IHsgfSB9KVxyXG4gICAgICAgIH07XHJcbiAgICB9XHJcbiAgICBsaXN0KGRlY2F5ID0gMTAgKiAxMDAwKSB7XHJcbiAgICAgICAgcmV0dXJuIE9iamVjdC5rZXlzKHRoaXMuX2J1Y2tldCkubWFwKGsgPT4gdGhpcy5fYnVja2V0W2tdKVxyXG4gICAgICAgIC8vIC5maWx0ZXIoaSA9PiAhZGVjYXkgfHwgIWkuaXNEZWNheWVkKGRlY2F5KSlcclxuICAgIH1cclxufVxyXG5cclxuY2xhc3MgSXRlbSB7XHJcbiAgICBjb25zdHJ1Y3RvcihpZCkge1xyXG4gICAgICAgIHRoaXMuYXR0cmlidXRlcyA9IHt9O1xyXG4gICAgICAgIHRoaXMuaWQgPSBpZDtcclxuICAgICAgICB0aGlzLnRvdWNoKHRydWUpO1xyXG4gICAgfVxyXG4gICAgdG91Y2gobW9kaWZ5KSB7XHJcbiAgICAgICAgdGhpcy5fanNvbiA9IG1vZGlmeSA/IHVuZGVmaW5lZCA6IHRoaXMuX2pzb247XHJcbiAgICAgICAgdGhpcy5sYXN0U2VlbiA9IERhdGUubm93KCk7XHJcbiAgICAgICAgLy8gaWYgKG1vZGlmeSkgcmVmcmVzaE9wdGlvbnNQYWdlKCk7XHJcbiAgICB9XHJcbiAgICBzZXQoa2V5LCB2YWx1ZSkge1xyXG4gICAgICAgIHRoaXMudG91Y2godGhpcy5hdHRyaWJ1dGVzW2tleV0gIT09IHZhbHVlKTtcclxuICAgICAgICB0aGlzLmF0dHJpYnV0ZXNba2V5XSA9IHZhbHVlO1xyXG4gICAgICAgIHJldHVybiB0aGlzO1xyXG4gICAgfVxyXG5cclxuICAgIGlzRGVjYXllZChkZWNheSkge1xyXG4gICAgICAgIHJldHVybiBmYWxzZVxyXG4gICAgICAgIGlmIChkZWNheSAmJiAoKHRoaXMubGFzdFNlZW4gKyBkZWNheSkgPCBEYXRlLm5vdygpKSkgcmV0dXJuIHRydWVcclxuICAgIH1cclxuXHJcbiAgICBqc29uKCkge1xyXG4gICAgICAgIHRoaXMuX2pzb24gPSB0aGlzLl9qc29uIHx8IHRoaXMuZ2V0KCk7XHJcbiAgICAgICAgcmV0dXJuIHRoaXMuX2pzb247XHJcbiAgICB9XHJcblxyXG4gICAgZ2V0KCkge1xyXG4gICAgICAgIHJldHVybiB7XHJcbiAgICAgICAgICAgIGlkOnRoaXMuaWQsXHJcbiAgICAgICAgICAgIC4uLnRoaXMuYXR0cmlidXRlc1xyXG4gICAgICAgIH07XHJcbiAgICB9XHJcbn1cclxuXHJcbmNsYXNzIFRhYkZyYW1lIGV4dGVuZHMgSXRlbSB7XHJcbiAgICBjb25zdHJ1Y3Rvcih0YWJGcmFtZUlkKSB7XHJcbiAgICAgICAgc3VwZXIodGFiRnJhbWVJZCk7XHJcbiAgICAgICAgdGhpcy5jaGlsZHJlbiA9IG5ldyBCdWNrZXQoVGFiRnJhbWUpXHJcbiAgICAgICAgdGhpcy5zZXQoXCJsaXN0ZW5lcnNcIiwgW10pO1xyXG4gICAgfVxyXG5cclxuICAgIGFkZENoaWxkKGNoaWxkKSB7XHJcbiAgICAgICAgcmV0dXJuIHRoaXMuY2hpbGRyZW4uc2V0KGNoaWxkLmlkLGNoaWxkKTtcclxuICAgIH1cclxuXHJcbiAgICBnZXQgd2luZG93SWQoKXtcclxuICAgICAgICByZXR1cm4gd2luZG93c0J5VGFiQW5kRnJhbWVJZC5nZXQodGhpcy5pZCkuaWRcclxuICAgIH1cclxuXHJcbiAgICBnZXQgbWVzc2FnZXMgKCl7XHJcbiAgICAgICAgcmV0dXJuIG1lc3NhZ2VCeVRhYkZyYW1lSWQuZ2V0KHRoaXMuaWQpLm1lc3NhZ2VzIHx8IHtcclxuICAgICAgICAgICAgbWVzc2FnZXM6IFtdLFxyXG4gICAgICAgICAgICBzZW50OjAsXHJcbiAgICAgICAgICAgIGNvdW50OiAwLFxyXG4gICAgICAgICAgICByZWNlaXZlZDowXHJcbiAgICAgICAgfTtcclxuICAgIH1cclxuXHJcbiAgICBnZXQgKCkge1xyXG4gICAgICAgIGNvbnN0IHtjaGlsZHJlbixpZH0gPSB0aGlzO1xyXG4gICAgICAgIHJldHVybiB7XHJcbiAgICAgICAgICAgIC4uLnN1cGVyLmdldCgpLFxyXG4gICAgICAgICAgICAuLi53aW5kb3dzQnlUYWJBbmRGcmFtZUlkLmdldChpZCkuZ2V0KCksXHJcbiAgICAgICAgICAgIGNoaWxkcmVuOiBjaGlsZHJlbi5saXN0KClcclxuICAgICAgICB9XHJcbiAgICB9XHJcbn1cclxuXHJcbmNsYXNzIE1lc3NhZ2VzQnVja2V0IGV4dGVuZHMgSXRlbSB7XHJcbiAgICBjb25zdHJ1Y3Rvcih3aW5kb3dJZCkge1xyXG4gICAgICAgIHN1cGVyKHdpbmRvd0lkKTtcclxuICAgICAgICB0aGlzLm1lc3NhZ2VzID0ge1xyXG4gICAgICAgICAgICBtZXNzYWdlczogW10sXHJcbiAgICAgICAgICAgIHNlbnQ6MCxcclxuICAgICAgICAgICAgY291bnQ6IDAsXHJcbiAgICAgICAgICAgIHJlY2VpdmVkOjBcclxuICAgICAgICB9XHJcbiAgICB9XHJcbiAgICBcclxuICAgIGFkZE1lc3NhZ2UobWVzc2FnZUlkLGNvdW50ZXIpIHtcclxuICAgICAgICBpZih0aGlzLm1lc3NhZ2VzLm1lc3NhZ2VzLmluZGV4T2YobWVzc2FnZUlkKSAhPT0gLTEpIHJldHVyblxyXG4gICAgICAgIHRoaXMubWVzc2FnZXNbY291bnRlcl0rKztcclxuICAgICAgICB0aGlzLm1lc3NhZ2VzLmNvdW50Kys7XHJcbiAgICAgICAgdGhpcy5tZXNzYWdlcy5tZXNzYWdlcy51bnNoaWZ0KG1lc3NhZ2VJZCk7XHJcbiAgICAgICAgdGhpcy5tZXNzYWdlcy5tZXNzYWdlcyA9IHRoaXMubWVzc2FnZXMubWVzc2FnZXMuc2xpY2UoMCwgMTAwKTsvL3RvIGF2b2lkIGRlbmlhbCBvZiBzZXJ2aWNlXHJcbiAgICAgICAgdGhpcy5tZXNzYWdlcy5tZXNzYWdlcyA9IEFycmF5LmZyb20odGhpcy5tZXNzYWdlcy5tZXNzYWdlcylcclxuICAgICAgICB0aGlzLnRvdWNoKHRydWUpXHJcbiAgICAgICAgLy8gcmVmcmVzaE9wdGlvbnNQYWdlKClcclxuXHJcbiAgICB9XHJcblxyXG4gICAgZ2V0KCkge1xyXG4gICAgICAgIHJldHVybiB7XHJcbiAgICAgICAgICAgICAgICAuLi50aGlzLm1lc3NhZ2VzLFxyXG4gICAgICAgICAgICAgICAgbWVzc2FnZXM6IHRoaXMubWVzc2FnZXMubWFwKG09Pm1lc3NhZ2VzQnlNZXNzYWdlSWQuZ2V0KG0pLmdldCgpKVxyXG4gICAgICAgICAgICB9XHJcbiAgICB9XHJcbn1cclxuXHJcblxyXG53aW5kb3dzQnlUYWJBbmRGcmFtZUlkID0gbmV3IEJ1Y2tldChUYWJGcmFtZSk7XHJcbm1lc3NhZ2VzQnlNZXNzYWdlSWQgID0gbmV3IEJ1Y2tldChJdGVtKTtcclxubWVzc2FnZUJ5VGFiRnJhbWVJZCAgPSBuZXcgQnVja2V0KE1lc3NhZ2VzQnVja2V0KTtcclxuXHJcbnRhYnNGcmFtZXMgPSBuZXcgQnVja2V0KFRhYkZyYW1lKTtcclxuXHJcblxyXG5jb25zdCByZWNlaXZlZE1lc3NhZ2UgPSAoeyBtZXNzYWdlSWQsIGRhdGEsIG9yaWdpbiB9LHRhYklkLCBmcmFtZUlkKSA9PiB7XHJcbiAgICBcclxuICAgIGxldCB0YWJXaW5kb3dJZCA9IGAke3RhYklkfTo6JHtmcmFtZUlkfWA7XHJcbiAgICBtZXNzYWdlQnlUYWJGcmFtZUlkLmFkZCh0YWJXaW5kb3dJZClcclxuICAgICAgICAuYWRkTWVzc2FnZShtZXNzYWdlSWQsXCJyZWNlaXZlZFwiKVxyXG4gICAgXHJcbiAgICB1aVVwZGF0ZUhhbmRsZXIoXCJpbmZvXCIsYG5ldyBtZXNzYWdlIGZyb20gJHtvcmlnaW59YCwgSlNPTi5zdHJpbmdpZnkoZGF0YSkpXHJcbiAgICBcclxuICAgIG1lc3NhZ2VzQnlNZXNzYWdlSWQuYWRkKG1lc3NhZ2VJZClcclxuICAgICAgICAuc2V0KFwicmVjZWl2ZXJcIiwgdGFiV2luZG93SWQpXHJcbiAgICAgICAgLnNldChcIm9yaWdpblwiLG9yaWdpbilcclxuICAgICAgICAuc2V0KFwiZGF0YVwiLCBkYXRhKVxyXG4gICAgICAgIC5zZXQoXCJvcmlnaW5hbFR5cGVcIiwgdHlwZW9mKGRhdGEpKTtcclxufVxyXG5cclxuY29uc3QgYWNjb3VudEZvck1lc3NhZ2UgPSAoeyBtZXNzYWdlSWQgfSx0YWJJZCwgZnJhbWVJZCkgPT4ge1xyXG4gICAgbGV0IHRhYldpbmRvd0lkID0gYCR7dGFiSWR9Ojoke2ZyYW1lSWR9YDtcclxuICAgIG1lc3NhZ2VCeVRhYkZyYW1lSWQuYWRkKHRhYldpbmRvd0lkKVxyXG4gICAgICAgIC5hZGRNZXNzYWdlKG1lc3NhZ2VJZCxcInNlbnRcIilcclxuICAgIFxyXG4gICAgbWVzc2FnZXNCeU1lc3NhZ2VJZC5hZGQobWVzc2FnZUlkKVxyXG4gICAgICAgIC5zZXQoXCJzZW5kZXJcIiwgdGFiV2luZG93SWQpO1xyXG59XHJcblxyXG5jb25zdCBsaXN0ZW5lcnMgPSAobWVzc2FnZSwgdGFiSWQsIGZyYW1lSWQpID0+IHtcclxuICAgIGNvbnN0IHsgbGlzdGVuZXJzLCB3aW5kb3dJZCAgfSA9IG1lc3NhZ2U7XHJcbiAgICB3aW5kb3dzQnlUYWJBbmRGcmFtZUlkLmFkZChgJHt0YWJJZH06OiR7ZnJhbWVJZH1gKS5zZXQoXCJsaXN0ZW5lcnNcIixsaXN0ZW5lcnMpLnNldChcIndpbmRvd0lkXCIsIHdpbmRvd0lkKVxyXG59XHJcblxyXG5jb25zdCB0b3BpY0hhbmRsZXJzID0ge1xyXG4gICAgXCJyZWNlaXZlZC1tZXNzYWdlXCI6cmVjZWl2ZWRNZXNzYWdlLFxyXG4gICAgXCJhY2NvdW50LWZvci1tZXNzYWdlXCI6YWNjb3VudEZvck1lc3NhZ2UsXHJcbiAgICBsaXN0ZW5lcnMsXHJcbiAgICBcImFjY291bnQtZm9yLXBhdGhcIjogKG1lc3NhZ2UsIHRhYklkLCBmcmFtZUlkKT0+e1xyXG4gICAgICAgIGxldCB0YWJXaW5kb3dJZCA9IGAke3RhYklkfTo6JHtmcmFtZUlkfWA7XHJcbiAgICAgICAgbGV0IHtwYXRofSA9bWVzc2FnZTtcclxuICAgICAgICB3aW5kb3dzQnlUYWJBbmRGcmFtZUlkLmFkZCh0YWJXaW5kb3dJZCkuc2V0KFwicGF0aFwiLHBhdGgpO1xyXG4gICAgfVxyXG59XHJcblxyXG5cclxuY29uc3QgcHJvY2Vzc0luY29taW5nTWVzc2FnZSA9IChtZXNzYWdlLCB0YWJJZCxmcmFtZUlkKSA9PiB7XHJcbiAgICBsZXQgeyB0b3BpYyB9ID0gbWVzc2FnZTtcclxuICAgIGlmICghdG9waWNIYW5kbGVyc1t0b3BpY10pIHJldHVybiBjb25zb2xlLmxvZyhgVE9ETzogaGFuZGVsICR7dG9waWN9IGZyb20gJHt0YWJJZH06JHtmcmFtZUlkfWApXHJcbiAgICB0b3BpY0hhbmRsZXJzW3RvcGljXShtZXNzYWdlLCB0YWJJZCxmcmFtZUlkKVxyXG59XHJcblxyXG5jaHJvbWUucnVudGltZS5vbk1lc3NhZ2UuYWRkTGlzdGVuZXIoKG1lc3NhZ2UsIHNlbmRlciwgcmVzcG9uc2UpID0+IHtcclxuICAgIGNvbnN0IHsgXHJcbiAgICAgICAgZnJhbWVJZCxcclxuICAgICAgICB0YWI6IHtcclxuICAgICAgICAgICAgaWRcclxuICAgICAgICB9IH0gPSBzZW5kZXJcclxuXHJcbiAgICBpZiAoIW1lc3NhZ2UpIGNvbnNvbGUudHJhY2UoXCJlbXB0eSBtZXNzYWdlXCIpO1xyXG4gICAgdHJ5IHtcclxuICAgICAgICBwcm9jZXNzSW5jb21pbmdNZXNzYWdlKG1lc3NhZ2UsIGlkLCBmcmFtZUlkKVxyXG4gICAgfSBjYXRjaCAoZXJyb3IpIHtcclxuICAgICAgICBjb25zb2xlLmxvZyhlcnJvcilcclxuICAgIH1cclxufSlcclxuXHJcblxyXG5cclxuY29uc3QgdXBkYXRlVGFicyA9ICgpID0+IHtcclxuICAgIGNocm9tZS50YWJzLnF1ZXJ5KHt9LCAoYWxsVGFicykgPT4ge1xyXG4gICAgICAgIGxldCB0YXJnZXRUYWJzID0gYWxsVGFicy5maWx0ZXIoKHsgdXJsIH0pID0+ICF1cmwuc3RhcnRzV2l0aChcImNocm9tZVwiKSk7XHJcbiAgICAgICAgUHJvbWlzZS5hbGwoXHJcbiAgICAgICAgICAgIHRhcmdldFRhYnMubWFwKCh7IGlkOiB0YWJJZCB9KSA9PiBuZXcgUHJvbWlzZSgocmVzb2x2ZSwgcmVqZWN0KSA9PiB7XHJcbiAgICAgICAgICAgICAgICBjaHJvbWUud2ViTmF2aWdhdGlvbi5nZXRBbGxGcmFtZXMoeyB0YWJJZCB9LCAoZnJhbWVzKSA9PiByZXNvbHZlKHtcclxuICAgICAgICAgICAgICAgICAgICB0YWJJZCxcclxuICAgICAgICAgICAgICAgICAgICBmcmFtZXNcclxuICAgICAgICAgICAgICAgIH0pKVxyXG4gICAgICAgICAgICB9KSlcclxuXHJcbiAgICAgICAgKS50aGVuKCh1cGRhdGVkVGFicykgPT4ge1xyXG4gICAgICAgICAgICB0YWJzRnJhbWVzID0gbmV3IEJ1Y2tldChUYWJGcmFtZSk7XHJcbiAgICAgICAgICAgIHVwZGF0ZWRUYWJzLmZvckVhY2goKHsgdGFiSWQsIGZyYW1lcyB9KSA9PiB7XHJcbiAgICAgICAgICAgICAgICBsZXQgdG9wRnJhbWVJbmRleCA9IGZyYW1lcy5maW5kSW5kZXgoKHtwYXJlbnRGcmFtZUlkfSk9PnBhcmVudEZyYW1lSWQ9PT0tMSk7XHJcbiAgICAgICAgICAgICAgICBpZiAodG9wRnJhbWVJbmRleD09PS0xKSByZXR1cm47XHJcbiAgICAgICAgICAgICAgICBsZXQgW3tmcmFtZUlkLHVybH1dID0gZnJhbWVzLnNwbGljZSh0b3BGcmFtZUluZGV4LDEpO1xyXG4gICAgICAgICAgICAgICAgbGV0IHRhYkZyYW1lSWQgPSBgJHt0YWJJZH06OiR7ZnJhbWVJZH1gO1xyXG4gICAgICAgICAgICAgICAgbGV0IHRvcCA9ICBuZXcgVGFiRnJhbWUodGFiRnJhbWVJZCk7XHJcbiAgICAgICAgICAgICAgICBcclxuICAgICAgICAgICAgICAgIHRvcC5zZXQoXCJsb2NhdGlvbkhyZWZcIiwgdXJsKTtcclxuICAgICAgICAgICAgICAgIHdpbmRvd3NCeVRhYkFuZEZyYW1lSWQuc2V0KHRhYkZyYW1lSWQsdG9wKTtcclxuICAgICAgICAgICAgICAgIHRhYnNGcmFtZXMuc2V0KHRhYkZyYW1lSWQsIHRvcClcclxuICAgICAgICAgICAgICAgIGZyYW1lcy5mb3JFYWNoKGZyYW1lID0+IHtcclxuICAgICAgICAgICAgICAgICAgICBjb25zdCB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGZyYW1lSWQsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHBhcmVudEZyYW1lSWQsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHVybFxyXG4gICAgICAgICAgICAgICAgICAgIH0gPSBmcmFtZTtcclxuICAgICAgICAgICAgICAgICAgICBsZXQgdGFiRnJhbWVJZCA9IGAke3RhYklkfTo6JHtmcmFtZUlkfWA7XHJcbiAgICAgICAgICAgICAgICAgICAgbGV0IHBhcmVudFRhYkZyYW1lSWQgPSBgJHt0YWJJZH06OiR7cGFyZW50RnJhbWVJZH1gO1xyXG4gICAgICAgICAgICAgICAgICAgIGxldCB3aW5kb3dGcmFtZSA9IHdpbmRvd3NCeVRhYkFuZEZyYW1lSWQuYWRkKHRhYkZyYW1lSWQpLnNldChcImxvY2F0aW9uSHJlZlwiLCB1cmwpO1xyXG4gICAgICAgICAgICAgICAgICAgIGxldCBwYXJlbnRXaW5kb3dGcmFtZSA9IHdpbmRvd3NCeVRhYkFuZEZyYW1lSWQuYWRkKHBhcmVudFRhYkZyYW1lSWQpO1xyXG4gICAgICAgICAgICAgICAgICAgIHBhcmVudFdpbmRvd0ZyYW1lLmFkZENoaWxkKHdpbmRvd0ZyYW1lKTtcclxuICAgICAgICAgICAgICAgIH0pXHJcbiAgICAgICAgICAgIH0pXHJcbiAgICAgICAgfSlcclxuICAgIH0pXHJcbn1cclxuXHJcbmNocm9tZS53ZWJOYXZpZ2F0aW9uLm9uRE9NQ29udGVudExvYWRlZC5hZGRMaXN0ZW5lcih1cGRhdGVUYWJzKVxyXG5jaHJvbWUud2ViTmF2aWdhdGlvbi5vbkNvbW1pdHRlZC5hZGRMaXN0ZW5lcih1cGRhdGVUYWJzKSJdLCJzb3VyY2VSb290IjoiIn0=
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IiIsImZpbGUiOiJiYWNrZ3JvdW5kLmpzIiwic291cmNlUm9vdCI6IiJ9