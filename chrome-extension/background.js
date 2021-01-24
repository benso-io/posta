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
/******/ 	return __webpack_require__(__webpack_require__.s = 22);
/******/ })
/************************************************************************/
/******/ ({

/***/ 22:
/***/ (function(module, exports) {

const handlers = new Set();

$$$SubScribeToPosta = handler => {
  console.log("new subscription from options page");
  handlers.add(handler);
};

function refreshOptionsPage() {
  try {
    Array.from(handlers).forEach(h => h());
  } catch (error) {
    console.log(error);
  }
}

class Bucket {
  constructor(ItemConstructor) {
    this.ItemConstructor = ItemConstructor;
    this._bucket = [];
  }

  add(id) {
    const {
      ItemConstructor
    } = this;
    if (!this._bucket[id]) this._bucket[id] = new ItemConstructor(id);
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
    return Object.keys(this._bucket).map(k => this._bucket[k]).filter(i => !decay || !i.isDecayed(decay));
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
    this.lastSeen = Date.now();
    if (modify) refreshOptionsPage();
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
    return this.attributes;
  }

}

class Tab extends Item {
  get() {
    let {
      id,
      frameTree = {}
    } = this;
    return { ...frameTree,
      ...windowFrames.get(id).set("framePath", "window.top").get()
    };
  }

  accountForPath(path, windowId) {
    let [top, ...paths] = path.split(".frames[");
    paths = paths.map(p => Number(p.split("]")[0]));
    let ref = this.frameTree;

    while (paths.length) {
      let index = paths.shift();
      ref = ref.children[index];
    }

    if (!ref) return;

    let _windowFrame = windowFrames.get(windowId).set("framePath", path).get();

    var hasChanges = false;
    Object.keys(_windowFrame).forEach(key => {
      if (_windowFrame[key] !== ref[key]) {
        ref[key] = _windowFrame[key];
        hasChanges = true;
      }
    });
    this.touch(hasChanges);
    return this;
  }

  isNewTree(oldTree, newTree) {
    return oldTree && newTree && oldTree.path === newTree.path && oldTree.windowId === newTree.windowId && oldTree.children.reduce((res, treeNode, treeNodeIndex) => {
      if (!res) return false;
      return this.isNewTree(treeNode, newTree[treeNodeIndex]);
    }, true) ? false : true;
  }

  setFrameTree(newFrameTree) {
    let isNewTree = this.isNewTree(this.frameTree, newFrameTree);

    if (isNewTree) {
      this.frameTree = newFrameTree;
      this.touch(true);
    }

    return this;
  }

}

class WindowFrame extends Item {
  constructor(id) {
    super(id);
    this.messages = {
      all: {
        messages: [],
        count: 0
      },
      sent: {
        messages: [],
        count: 0
      },
      received: {
        count: 0,
        messages: []
      }
    };
  }

  addMessage(bucket, message) {
    this.messages.all.count++;
    this.messages.all.messages.unshift(message);
    this.messages.all.messages = this.messages.all.messages.slice(0, 100); //to avoid denial of service

    this.messages[bucket].count++;
    this.messages[bucket].messages.unshift(message);
    this.messages[bucket].messages = this.messages[bucket].messages.slice(0, 100); //to avoid denial of service

    this.touch(true);
    refreshOptionsPage();
  }

  addMessageReceived(message) {
    this.addMessage("received", message);
    return this;
  }

  addMessageSent(message) {
    this.addMessage("sent", message);
  }

  get() {
    let {
      sent = {
        messages: [],
        count: [0]
      },
      all = {
        messages: [],
        count: [0]
      },
      received = {
        messages: [],
        count: [0]
      }
    } = this.messages;
    return {
      windowId: this.id,
      messages: {
        sent,
        received,
        all
      },
      ...super.get()
    };
  }

}

tabs = new Bucket(Tab);
windowFrames = new Bucket(WindowFrame);
messages = new Bucket(Item); // this.windowFrames = windowFrames;
// this.tabs = tabs;

const receivedMessage = ({
  messageId,
  windowId,
  data
}) => {
  let message = messages.add(messageId).set("data", data).set("receiver", windowId);
  windowFrames.add(windowId).addMessageReceived(message); // sendToOptionsPage("message-received", {
  //         data,
  //         receiver: windowId,
  //         messageId
  //     })
};

const accountForMessage = ({
  windowId,
  messageId
}) => {
  let message = messages.add(messageId).set("sender", windowId);
  windowFrames.add(windowId).addMessageSent(message);
};

const windowTelemetry = message => {
  const {
    windowId,
    locationHref,
    listeners
  } = message;
  windowFrames.add(windowId).set("locationHref", locationHref).set("listeners", listeners);
};

const frameTree = message => {
  const {
    frameTree,
    windowId
  } = message;
  tabs.add(windowId).setFrameTree(frameTree);
};

const accountForPath = ({
  windowId,
  topWindowId,
  path
}) => {
  tabs.add(topWindowId).accountForPath(path, windowId);
};

const topicHandlers = {
  "received-message": receivedMessage,
  "window-telemetry": windowTelemetry,
  "account-for-message": accountForMessage,
  "account-for-path": accountForPath,
  "frame-tree": frameTree
};

const processIncomingMessage = message => {
  let {
    topic
  } = message;
  if (!topicHandlers[topic]) return console.log(`TODO: handel ${topic}`);
  topicHandlers[topic](message);
};

chrome.runtime.onConnect.addListener(function (port) {
  port.onMessage.addListener(message => {
    if (!message) console.trace("empty message");

    try {
      processIncomingMessage(message);
    } catch (error) {
      console.log(error);
    }
  });
});
chrome.tabs.onUpdated.addListener(() => {
  tabs = new Bucket(Tab);
});

/***/ })

/******/ });
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIndlYnBhY2s6Ly8vd2VicGFjay9ib290c3RyYXAiLCJ3ZWJwYWNrOi8vLy4vc3JjL2JhY2tncm91bmQuanMiXSwibmFtZXMiOlsiaGFuZGxlcnMiLCJTZXQiLCIkJCRTdWJTY3JpYmVUb1Bvc3RhIiwiaGFuZGxlciIsImNvbnNvbGUiLCJsb2ciLCJhZGQiLCJyZWZyZXNoT3B0aW9uc1BhZ2UiLCJBcnJheSIsImZyb20iLCJmb3JFYWNoIiwiaCIsImVycm9yIiwiQnVja2V0IiwiY29uc3RydWN0b3IiLCJJdGVtQ29uc3RydWN0b3IiLCJfYnVja2V0IiwiaWQiLCJnZXQiLCJzZXQiLCJsaXN0IiwiZGVjYXkiLCJPYmplY3QiLCJrZXlzIiwibWFwIiwiayIsImZpbHRlciIsImkiLCJpc0RlY2F5ZWQiLCJJdGVtIiwiYXR0cmlidXRlcyIsInRvdWNoIiwibW9kaWZ5IiwiX2pzb24iLCJ1bmRlZmluZWQiLCJsYXN0U2VlbiIsIkRhdGUiLCJub3ciLCJrZXkiLCJ2YWx1ZSIsImpzb24iLCJUYWIiLCJmcmFtZVRyZWUiLCJ3aW5kb3dGcmFtZXMiLCJhY2NvdW50Rm9yUGF0aCIsInBhdGgiLCJ3aW5kb3dJZCIsInRvcCIsInBhdGhzIiwic3BsaXQiLCJwIiwiTnVtYmVyIiwicmVmIiwibGVuZ3RoIiwiaW5kZXgiLCJzaGlmdCIsImNoaWxkcmVuIiwiX3dpbmRvd0ZyYW1lIiwiaGFzQ2hhbmdlcyIsImlzTmV3VHJlZSIsIm9sZFRyZWUiLCJuZXdUcmVlIiwicmVkdWNlIiwicmVzIiwidHJlZU5vZGUiLCJ0cmVlTm9kZUluZGV4Iiwic2V0RnJhbWVUcmVlIiwibmV3RnJhbWVUcmVlIiwiV2luZG93RnJhbWUiLCJtZXNzYWdlcyIsImFsbCIsImNvdW50Iiwic2VudCIsInJlY2VpdmVkIiwiYWRkTWVzc2FnZSIsImJ1Y2tldCIsIm1lc3NhZ2UiLCJ1bnNoaWZ0Iiwic2xpY2UiLCJhZGRNZXNzYWdlUmVjZWl2ZWQiLCJhZGRNZXNzYWdlU2VudCIsInRhYnMiLCJyZWNlaXZlZE1lc3NhZ2UiLCJtZXNzYWdlSWQiLCJkYXRhIiwiYWNjb3VudEZvck1lc3NhZ2UiLCJ3aW5kb3dUZWxlbWV0cnkiLCJsb2NhdGlvbkhyZWYiLCJsaXN0ZW5lcnMiLCJ0b3BXaW5kb3dJZCIsInRvcGljSGFuZGxlcnMiLCJwcm9jZXNzSW5jb21pbmdNZXNzYWdlIiwidG9waWMiLCJjaHJvbWUiLCJydW50aW1lIiwib25Db25uZWN0IiwiYWRkTGlzdGVuZXIiLCJwb3J0Iiwib25NZXNzYWdlIiwidHJhY2UiLCJvblVwZGF0ZWQiXSwibWFwcGluZ3MiOiI7UUFBQTtRQUNBOztRQUVBO1FBQ0E7O1FBRUE7UUFDQTtRQUNBO1FBQ0E7UUFDQTtRQUNBO1FBQ0E7UUFDQTtRQUNBO1FBQ0E7O1FBRUE7UUFDQTs7UUFFQTtRQUNBOztRQUVBO1FBQ0E7UUFDQTs7O1FBR0E7UUFDQTs7UUFFQTtRQUNBOztRQUVBO1FBQ0E7UUFDQTtRQUNBLDBDQUEwQyxnQ0FBZ0M7UUFDMUU7UUFDQTs7UUFFQTtRQUNBO1FBQ0E7UUFDQSx3REFBd0Qsa0JBQWtCO1FBQzFFO1FBQ0EsaURBQWlELGNBQWM7UUFDL0Q7O1FBRUE7UUFDQTtRQUNBO1FBQ0E7UUFDQTtRQUNBO1FBQ0E7UUFDQTtRQUNBO1FBQ0E7UUFDQTtRQUNBLHlDQUF5QyxpQ0FBaUM7UUFDMUUsZ0hBQWdILG1CQUFtQixFQUFFO1FBQ3JJO1FBQ0E7O1FBRUE7UUFDQTtRQUNBO1FBQ0EsMkJBQTJCLDBCQUEwQixFQUFFO1FBQ3ZELGlDQUFpQyxlQUFlO1FBQ2hEO1FBQ0E7UUFDQTs7UUFFQTtRQUNBLHNEQUFzRCwrREFBK0Q7O1FBRXJIO1FBQ0E7OztRQUdBO1FBQ0E7Ozs7Ozs7O0FDbEZBLE1BQU1BLFFBQVEsR0FBRyxJQUFJQyxHQUFKLEVBQWpCOztBQUVBQyxtQkFBbUIsR0FBSUMsT0FBRCxJQUFhO0FBQy9CQyxTQUFPLENBQUNDLEdBQVIsQ0FBWSxvQ0FBWjtBQUNBTCxVQUFRLENBQUNNLEdBQVQsQ0FBYUgsT0FBYjtBQUNILENBSEQ7O0FBS0EsU0FBU0ksa0JB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QU94RixPQUFPLENBQUNDLEdBQVIsQ0FBYSxnQkFBZXVGLEtBQU0sRUFBbEMsQ0FBUDtBQUMzQkYsZUFBYSxDQUFDRSxLQUFELENBQWIsQ0FBcUJoQixPQUFyQjtBQUNILENBSkQ7O0FBTUFpQixNQUFNLENBQUNDLE9BQVAsQ0FBZUMsU0FBZixDQUF5QkMsV0FBekIsQ0FBcUMsVUFBVUMsSUFBVixFQUFnQjtBQUNqREEsTUFBSSxDQUFDQyxTQUFMLENBQWVGLFdBQWYsQ0FBNEJwQixPQUFELElBQWE7QUFDcEMsUUFBSSxDQUFDQSxPQUFMLEVBQWN4RSxPQUFPLENBQUMrRixLQUFSLENBQWMsZUFBZDs7QUFDZCxRQUFJO0FBQ0FSLDRCQUFzQixDQUFDZixPQUFELENBQXRCO0FBQ0gsS0FGRCxDQUVFLE9BQU9oRSxLQUFQLEVBQWM7QUFDWlIsYUFBTyxDQUFDQyxHQUFSLENBQVlPLEtBQVo7QUFDSDtBQUVKLEdBUkQ7QUFTSCxDQVZEO0FBWUFpRixNQUFNLENBQUNaLElBQVAsQ0FBWW1CLFNBQVosQ0FBc0JKLFdBQXRCLENBQWtDLE1BQUk7QUFDbENmLE1BQUksR0FBRyxJQUFJcEUsTUFBSixDQUFXNEIsR0FBWCxDQUFQO0FBQ0gsQ0FGRCxFIiwiZmlsZSI6ImJhY2tncm91bmQuanMiLCJzb3VyY2VzQ29udGVudCI6WyIgXHQvLyBUaGUgbW9kdWxlIGNhY2hlXG4gXHR2YXIgaW5zdGFsbGVkTW9kdWxlcyA9IHt9O1xuXG4gXHQvLyBUaGUgcmVxdWlyZSBmdW5jdGlvblxuIFx0ZnVuY3Rpb24gX193ZWJwYWNrX3JlcXVpcmVfXyhtb2R1bGVJZCkge1xuXG4gXHRcdC8vIENoZWNrIGlmIG1vZHVsZSBpcyBpbiBjYWNoZVxuIFx0XHRpZihpbnN0YWxsZWRNb2R1bGVzW21vZHVsZUlkXSkge1xuIFx0XHRcdHJldHVybiBpbnN0YWxsZWRNb2R1bGVzW21vZHVsZUlkXS5leHBvcnRzO1xuIFx0XHR9XG4gXHRcdC8vIENyZWF0ZSBhIG5ldyBtb2R1bGUgKGFuZCBwdXQgaXQgaW50byB0aGUgY2FjaGUpXG4gXHRcdHZhciBtb2R1bGUgPSBpbnN0YWxsZWRNb2R1bGVzW21vZHVsZUlkXSA9IHtcbiBcdFx0XHRpOiBtb2R1bGVJZCxcbiBcdFx0XHRsOiBmYWxzZSxcbiBcdFx0XHRleHBvcnRzOiB7fVxuIFx0XHR9O1xuXG4gXHRcdC8vIEV4ZWN1dGUgdGhlIG1vZHVsZSBmdW5jdGlvblxuIFx0XHRtb2R1bGVzW21vZHVsZUlkXS5jYWxsKG1vZHVsZS5leHBvcnRzLCBtb2R1bGUsIG1vZHVsZS5leHBvcnRzLCBfX3dlYnBhY2tfcmVxdWlyZV9fKTtcblxuIFx0XHQvLyBGbGFnIHRoZSBtb2R1bGUgYXMgbG9hZGVkXG4gXHRcdG1vZHVsZS5sID0gdHJ1ZTtcblxuIFx0XHQvLyBSZXR1cm4gdGhlIGV4cG9ydHMgb2YgdGhlIG1vZHVsZVxuIFx0XHRyZXR1cm4gbW9kdWxlLmV4cG9ydHM7XG4gXHR9XG5cblxuIFx0Ly8gZXhwb3NlIHRoZSBtb2R1bGVzIG9iamVjdCAoX193ZWJwYWNrX21vZHVsZXNfXylcbiBcdF9fd2VicGFja19yZXF1aXJlX18ubSA9IG1vZHVsZXM7XG5cbiBcdC8vIGV4cG9zZSB0aGUgbW9kdWxlIGNhY2hlXG4gXHRfX3dlYnBhY2tfcmVxdWlyZV9fLmMgPSBpbnN0YWxsZWRNb2R1bGVzO1xuXG4gXHQvLyBkZWZpbmUgZ2V0dGVyIGZ1bmN0aW9uIGZvciBoYXJtb255IGV4cG9ydHNcbiBcdF9fd2VicGFja19yZXF1aXJlX18uZCA9IGZ1bmN0aW9uKGV4cG9ydHMsIG5hbWUsIGdldHRlcikge1xuIFx0XHRpZighX193ZWJwYWNrX3JlcXVpcmVfXy5vKGV4cG9ydHMsIG5hbWUpKSB7XG4gXHRcdFx0T2JqZWN0LmRlZmluZVByb3BlcnR5KGV4cG9ydHMsIG5hbWUsIHsgZW51bWVyYWJsZTogdHJ1ZSwgZ2V0OiBnZXR0ZXIgfSk7XG4gXHRcdH1cbiBcdH07XG5cbiBcdC8vIGRlZmluZSBfX2VzTW9kdWxlIG9uIGV4cG9ydHNcbiBcdF9fd2VicGFja19yZXF1aXJlX18uciA9IGZ1bmN0aW9uKGV4cG9ydHMpIHtcbiBcdFx0aWYodHlwZW9mIFN5bWJvbCAhPT0gJ3VuZGVmaW5lZCcgJiYgU3ltYm9sLnRvU3RyaW5nVGFnKSB7XG4gXHRcdFx0T2JqZWN0LmRlZmluZVByb3BlcnR5KGV4cG9ydHMsIFN5bWJvbC50b1N0cmluZ1RhZywgeyB2YWx1ZTogJ01vZHVsZScgfSk7XG4gXHRcdH1cbiBcdFx0T2JqZWN0LmRlZmluZVByb3BlcnR5KGV4cG9ydHMsICdfX2VzTW9kdWxlJywgeyB2YWx1ZTogdHJ1ZSB9KTtcbiBcdH07XG5cbiBcdC8vIGNyZWF0ZSBhIGZha2UgbmFtZXNwYWNlIG9iamVjdFxuIFx0Ly8gbW9kZSAmIDE6IHZhbHVlIGlzIGEgbW9kdWxlIGlkLCByZXF1aXJlIGl0XG4gXHQvLyBtb2RlICYgMjogbWVyZ2UgYWxsIHByb3BlcnRpZXMgb2YgdmFsdWUgaW50byB0aGUgbnNcbiBcdC8vIG1vZGUgJiA0OiByZXR1cm4gdmFsdWUgd2hlbiBhbHJlYWR5IG5zIG9iamVjdFxuIFx0Ly8gbW9kZSAmIDh8MTogYmVoYXZlIGxpa2UgcmVxdWlyZVxuIFx0X193ZWJwYWNrX3JlcXVpcmVfXy50ID0gZnVuY3Rpb24odmFsdWUsIG1vZGUpIHtcbiBcdFx0aWYobW9kZSAmIDEpIHZhbHVlID0gX193ZWJwYWNrX3JlcXVpcmVfXyh2YWx1ZSk7XG4gXHRcdGlmKG1vZGUgJiA4KSByZXR1cm4gdmFsdWU7XG4gXHRcdGlmKChtb2RlICYgNCkgJiYgdHlwZW9mIHZhbHVlID09PSAnb2JqZWN0JyAmJiB2YWx1ZSAmJiB2YWx1ZS5fX2VzTW9kdWxlKSByZXR1cm4gdmFsdWU7XG4gXHRcdHZhciBucyA9IE9iamVjdC5jcmVhdGUobnVsbCk7XG4gXHRcdF9fd2VicGFja19yZXF1aXJlX18ucihucyk7XG4gXHRcdE9iamVjdC5kZWZpbmVQcm9wZXJ0eShucywgJ2RlZmF1bHQnLCB7IGVudW1lcmFibGU6IHRydWUsIHZhbHVlOiB2YWx1ZSB9KTtcbiBcdFx0aWYobW9kZSAmIDIgJiYgdHlwZW9mIHZhbHVlICE9ICdzdHJpbmcnKSBmb3IodmFyIGtleSBpbiB2YWx1ZSkgX193ZWJwYWNrX3JlcXVpcmVfXy5kKG5zLCBrZXksIGZ1bmN0aW9uKGtleSkgeyByZXR1cm4gdmFsdWVba2V5XTsgfS5iaW5kKG51bGwsIGtleSkpO1xuIFx0XHRyZXR1cm4gbnM7XG4gXHR9O1xuXG4gXHQvLyBnZXREZWZhdWx0RXhwb3J0IGZ1bmN0aW9uIGZvciBjb21wYXRpYmlsaXR5IHdpdGggbm9uLWhhcm1vbnkgbW9kdWxlc1xuIFx0X193ZWJwYWNrX3JlcXVpcmVfXy5uID0gZnVuY3Rpb24obW9kdWxlKSB7XG4gXHRcdHZhciBnZXR0ZXIgPSBtb2R1bGUgJiYgbW9kdWxlLl9fZXNNb2R1bGUgP1xuIFx0XHRcdGZ1bmN0aW9uIGdldERlZmF1bHQoKSB7IHJldHVybiBtb2R1bGVbJ2RlZmF1bHQnXTsgfSA6XG4gXHRcdFx0ZnVuY3Rpb24gZ2V0TW9kdWxlRXhwb3J0cygpIHsgcmV0dXJuIG1vZHVsZTsgfTtcbiBcdFx0X193ZWJwYWNrX3JlcXVpcmVfXy5kKGdldHRlciwgJ2EnLCBnZXR0ZXIpO1xuIFx0XHRyZXR1cm4gZ2V0dGVyO1xuIFx0fTtcblxuIFx0Ly8gT2JqZWN0LnByb3RvdHlwZS5oYXNPd25Qcm9wZXJ0eS5jYWxsXG4gXHRfX3dlYnBhY2tfcmVxdWlyZV9fLm8gPSBmdW5jdGlvbihvYmplY3QsIHByb3BlcnR5KSB7IHJldHVybiBPYmplY3QucHJvdG90eXBlLmhhc093blByb3BlcnR5LmNhbGwob2JqZWN0LCBwcm9wZXJ0eSk7IH07XG5cbiBcdC8vIF9fd2VicGFja19wdWJsaWNfcGF0aF9fXG4gXHRfX3dlYnBhY2tfcmVxdWlyZV9fLnAgPSBcIlwiO1xuXG5cbiBcdC8vIExvYWQgZW50cnkgbW9kdWxlIGFuZCByZXR1cm4gZXhwb3J0c1xuIFx0cmV0dXJuIF9fd2VicGFja19yZXF1aXJlX18oX193ZWJwYWNrX3JlcXVpcmVfXy5zID0gMjIpO1xuIiwiY29uc3QgaGFuZGxlcnMgPSBuZXcgU2V0KCk7XHJcblxyXG4kJCRTdWJTY3JpYmVUb1Bvc3RhID0gKGhhbmRsZXIpID0+IHtcclxuICAgIGNvbnNvbGUubG9nKFwibmV3IHN1YnNjcmlwdGlvbiBmcm9tIG9wdGlvbnMgcGFnZVwiKVxyXG4gICAgaGFuZGxlcnMuYWRkKGhhbmRsZXIpO1xyXG59XHJcblxyXG5mdW5jdGlvbiByZWZyZXNoT3B0aW9uc1BhZ2UoKSB7XHJcbiAgICB0cnkge1xyXG4gICAgICAgIEFycmF5LmZyb20oaGFuZGxlcnMpLmZvckVhY2goaD0+aCgpKVxyXG4gICAgfSBjYXRjaCAoZXJyb3IpIHtcclxuICAgICAgICBjb25zb2xlLmxvZyhlcnJvcilcclxuICAgIH1cclxufVxyXG5cclxuXHJcbmNsYXNzIEJ1Y2tldCB7XHJcbiAgICBjb25zdHJ1Y3RvcihJdGVtQ29uc3RydWN0b3IpIHtcclxuICAgICAgICB0aGlzLkl0ZW1Db25zdHJ1Y3RvciA9IEl0ZW1Db25zdHJ1Y3RvcjtcclxuICAgICAgICB0aGlzLl9idWNrZXQgPSBbXVxyXG4gICAgfVxyXG4gICAgYWRkIChpZCkge1xyXG4gICAgICAgIGNvbnN0IHtJdGVtQ29uc3RydWN0b3J9ID0gdGhpcztcclxuICAgICAgICBpZiAoIXRoaXMuX2J1Y2tldFtpZF0pIHRoaXMuX2J1Y2tldFtpZF0gPSBuZXcgSXRlbUNvbnN0cnVjdG9yKGlkKTtcclxuICAgICAgICByZXR1cm4gdGhpcy5fYnVja2V0W2lkXVxyXG4gICAgfVxyXG4gICAgZ2V0IChpZCkge1xyXG4gICAgICAgIHJldHVybiB0aGlzLl9idWNrZXRbaWRdIHx8IHtcclxuICAgICAgICAgICAgZ2V0OigpPT4oe30pLFxyXG4gICAgICAgICAgICBzZXQ6KCk9Pih7Z2V0OigpPT57fX0pXHJcbiAgICAgICAgfTtcclxuICAgIH1cclxuICAgIGxpc3QoZGVjYXk9MTAqMTAwMCl7XHJcbiAgICAgICAgcmV0dXJuIE9iamVjdC5rZXlzKHRoaXMuX2J1Y2tldCkubWFwKGs9PnRoaXMuX2J1Y2tldFtrXSkuZmlsdGVyKGk9PiFkZWNheSB8fCAhaS5pc0RlY2F5ZWQoZGVjYXkpKVxyXG4gICAgfVxyXG59XHJcblxyXG5jbGFzcyBJdGVtIHtcclxuICAgIGNvbnN0cnVjdG9yIChpZCl7XHJcbiAgICAgICAgdGhpcy5hdHRyaWJ1dGVzID0ge307XHJcbiAgICAgICAgdGhpcy5pZCA9IGlkO1xyXG4gICAgICAgIHRoaXMudG91Y2godHJ1ZSk7XHJcbiAgICB9XHJcbiAgICB0b3VjaChtb2RpZnkpe1xyXG4gICAgICAgIHRoaXMuX2pzb24gPSBtb2RpZnkgPyB1bmRlZmluZWQgOiB0aGlzLl9qc29uO1xyXG4gICAgICAgIHRoaXMubGFzdFNlZW4gPSBEYXRlLm5vdygpO1xyXG4gICAgICAgIGlmIChtb2RpZnkpIHJlZnJlc2hPcHRpb25zUGFnZSgpO1xyXG4gICAgfVxyXG4gICAgc2V0KGtleSx2YWx1ZSkge1xyXG4gICAgICAgIHRoaXMudG91Y2godGhpcy5hdHRyaWJ1dGVzW2tleV0gIT09IHZhbHVlKTtcclxuICAgICAgICB0aGlzLmF0dHJpYnV0ZXNba2V5XSA9IHZhbHVlO1xyXG4gICAgICAgIHJldHVybiB0aGlzO1xyXG4gICAgfVxyXG5cclxuICAgIGlzRGVjYXllZCAoZGVjYXkpe1xyXG4gICAgICAgIHJldHVybiBmYWxzZVxyXG4gICAgICAgIGlmIChkZWNheSAmJiAoKHRoaXMubGFzdFNlZW4gKyBkZWNheSkgPCBEYXRlLm5vdygpKSkgcmV0dXJuIHRydWVcclxuICAgIH1cclxuXHJcbiAgICBqc29uKCl7XHJcbiAgICAgICAgdGhpcy5fanNvbiA9IHRoaXMuX2pzb24gfHwgdGhpcy5nZXQoKTtcclxuICAgICAgICByZXR1cm4gdGhpcy5fanNvbjtcclxuICAgIH1cclxuXHJcbiAgICBnZXQoKXtcclxuICAgICAgICByZXR1cm4gdGhpcy5hdHRyaWJ1dGVzO1xyXG4gICAgfVxyXG59XHJcblxyXG5jbGFzcyBUYWIgZXh0ZW5kcyBJdGVtIHtcclxuICAgIGdldCAoKXtcclxuICAgICAgICBsZXQge2lkLGZyYW1lVHJlZT17fX0gPSB0aGlzO1xyXG4gICAgICAgIHJldHVybiB7XHJcbiAgICAgICAgICAgIC4uLmZyYW1lVHJlZSxcclxuICAgICAgICAgICAgLi4ud2luZG93RnJhbWVzLmdldChpZCkuc2V0KFwiZnJhbWVQYXRoXCIsIFwid2luZG93LnRvcFwiKS5nZXQoKVxyXG4gICAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICBhY2NvdW50Rm9yUGF0aChwYXRoLCB3aW5kb3dJZCkge1xyXG4gICAgICAgIGxldCBbdG9wLC4uLnBhdGhzXSA9IHBhdGguc3BsaXQoXCIuZnJhbWVzW1wiKTtcclxuICAgICAgICBwYXRocyA9IHBhdGhzLm1hcChwPT5OdW1iZXIocC5zcGxpdChcIl1cIilbMF0pKTtcclxuICAgICAgICBsZXQgcmVmID0gdGhpcy5mcmFtZVRyZWU7XHJcbiAgICAgICAgd2hpbGUgKHBhdGhzLmxlbmd0aCkge1xyXG4gICAgICAgICAgICBsZXQgaW5kZXggPSBwYXRocy5zaGlmdCgpO1xyXG4gICAgICAgICAgICByZWY9cmVmLmNoaWxkcmVuW2luZGV4XTtcclxuICAgICAgICB9XHJcbiAgICAgICAgaWYgKCFyZWYpIHJldHVyblxyXG4gICAgICAgIGxldCBfd2luZG93RnJhbWUgPSAgd2luZG93RnJhbWVzLmdldCh3aW5kb3dJZCkuc2V0KFwiZnJhbWVQYXRoXCIsIHBhdGgpLmdldCgpO1xyXG4gICAgICAgIHZhciBoYXNDaGFuZ2VzID0gZmFsc2U7XHJcbiAgICAgICAgT2JqZWN0LmtleXMoX3dpbmRvd0ZyYW1lKS5mb3JFYWNoKChrZXkpPT57XHJcbiAgICAgICAgICAgIGlmIChfd2luZG93RnJhbWVba2V5XSAhPT0gcmVmW2tleV0pIHtcclxuICAgICAgICAgICAgICAgIHJlZltrZXldID0gX3dpbmRvd0ZyYW1lW2tleV07XHJcbiAgICAgICAgICAgICAgICBoYXNDaGFuZ2VzID0gdHJ1ZTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH0pXHJcblxyXG4gICAgICAgIHRoaXMudG91Y2goaGFzQ2hhbmdlcyk7XHJcbiAgICAgICAgcmV0dXJuIHRoaXNcclxuICAgIH1cclxuXHJcbiAgICBpc05ld1RyZWUob2xkVHJlZSxuZXdUcmVlKXtcclxuICAgICAgICByZXR1cm4gb2xkVHJlZSAmJiBuZXdUcmVlICYmIChvbGRUcmVlLnBhdGggPT09IG5ld1RyZWUucGF0aCkgJiZcclxuICAgICAgICAgICAgKG9sZFRyZWUud2luZG93SWQgPT09IG5ld1RyZWUud2luZG93SWQpICYmXHJcbiAgICAgICAgICAgICAgICBvbGRUcmVlLmNoaWxkcmVuLnJlZHVjZSgocmVzLCB0cmVlTm9kZSx0cmVlTm9kZUluZGV4KT0+e1xyXG4gICAgICAgICAgICAgICAgICAgIGlmICghcmVzKSByZXR1cm4gZmFsc2VcclxuICAgICAgICAgICAgICAgICAgICByZXR1cm4gdGhpcy5pc05ld1RyZWUodHJlZU5vZGUsIG5ld1RyZWVbdHJlZU5vZGVJbmRleF0pXHJcbiAgICAgICAgICAgICAgICB9LHRydWUpID8gZmFsc2UgOiB0cnVlXHJcbiAgICB9XHJcblxyXG4gICAgc2V0RnJhbWVUcmVlKG5ld0ZyYW1lVHJlZSl7XHJcbiAgICAgICAgbGV0IGlzTmV3VHJlZSA9IHRoaXMuaXNOZXdUcmVlKHRoaXMuZnJhbWVUcmVlLCBuZXdGcmFtZVRyZWUpXHJcbiAgICAgICAgaWYgKGlzTmV3VHJlZSkge1xyXG4gICAgICAgICAgICB0aGlzLmZyYW1lVHJlZSA9IG5ld0ZyYW1lVHJlZTtcclxuICAgICAgICAgICAgdGhpcy50b3VjaCh0cnVlKTtcclxuICAgICAgICB9XHJcbiAgICAgICAgcmV0dXJuIHRoaXM7XHJcbiAgICB9XHJcbn1cclxuXHJcbmNsYXNzIFdpbmRvd0ZyYW1lIGV4dGVuZHMgSXRlbSB7XHJcbiAgICBjb25zdHJ1Y3RvcihpZCl7XHJcbiAgICAgICAgc3VwZXIoaWQpO1xyXG4gICAgICAgIHRoaXMubWVzc2FnZXMgPSB7XHJcbiAgICAgICAgICAgIGFsbDp7XHJcbiAgICAgICAgICAgICAgICBtZXNzYWdlczogW10sXHJcbiAgICAgICAgICAgICAgICBjb3VudDogMFxyXG4gICAgICAgICAgICB9LFxyXG4gICAgICAgICAgICBzZW50OntcclxuICAgICAgICAgICAgICAgIG1lc3NhZ2VzOiBbXSxcclxuICAgICAgICAgICAgICAgIGNvdW50OiAwXHJcbiAgICAgICAgICAgIH0sIFxyXG4gICAgICAgICAgICByZWNlaXZlZDoge1xyXG4gICAgICAgICAgICAgICAgY291bnQ6MCxcclxuICAgICAgICAgICAgICAgIG1lc3NhZ2VzOiBbXVxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIGFkZE1lc3NhZ2UoYnVja2V0LCBtZXNzYWdlKXtcclxuICAgICAgICB0aGlzLm1lc3NhZ2VzLmFsbC5jb3VudCsrO1xyXG4gICAgICAgIHRoaXMubWVzc2FnZXMuYWxsLm1lc3NhZ2VzLnVuc2hpZnQobWVzc2FnZSk7XHJcbiAgICAgICAgdGhpcy5tZXNzYWdlcy5hbGwubWVzc2FnZXMgPSB0aGlzLm1lc3NhZ2VzLmFsbC5tZXNzYWdlcy5zbGljZSgwLDEwMCk7Ly90byBhdm9pZCBkZW5pYWwgb2Ygc2VydmljZVxyXG4gICAgICAgIHRoaXMubWVzc2FnZXNbYnVja2V0XS5jb3VudCsrO1xyXG4gICAgICAgIHRoaXMubWVzc2FnZXNbYnVja2V0XS5tZXNzYWdlcy51bnNoaWZ0KG1lc3NhZ2UpO1xyXG4gICAgICAgIHRoaXMubWVzc2FnZXNbYnVja2V0XS5tZXNzYWdlcyA9IHRoaXMubWVzc2FnZXNbYnVja2V0XS5tZXNzYWdlcy5zbGljZSgwLDEwMCk7Ly90byBhdm9pZCBkZW5pYWwgb2Ygc2VydmljZVxyXG4gICAgICAgIHRoaXMudG91Y2godHJ1ZSlcclxuICAgICAgICByZWZyZXNoT3B0aW9uc1BhZ2UoKVxyXG4gICAgfVxyXG5cclxuICAgIGFkZE1lc3NhZ2VSZWNlaXZlZChtZXNzYWdlKXtcclxuICAgICAgICB0aGlzLmFkZE1lc3NhZ2UoXCJyZWNlaXZlZFwiLCBtZXNzYWdlKTtcclxuICAgICAgICByZXR1cm4gdGhpcztcclxuICAgIH1cclxuICAgIGFkZE1lc3NhZ2VTZW50KG1lc3NhZ2Upe1xyXG4gICAgICAgIHRoaXMuYWRkTWVzc2FnZShcInNlbnRcIiwgbWVzc2FnZSk7XHJcbiAgICB9XHJcbiAgICBnZXQgKCl7XHJcbiAgICAgICAgbGV0IHtzZW50PXttZXNzYWdlczpbXSxjb3VudDpbMF19LGFsbD17bWVzc2FnZXM6W10sY291bnQ6WzBdfSxyZWNlaXZlZD17bWVzc2FnZXM6W10sY291bnQ6WzBdfX09IHRoaXMubWVzc2FnZXM7XHJcbiAgICAgICAgcmV0dXJuIHtcclxuICAgICAgICAgICAgd2luZG93SWQ6dGhpcy5pZCxcclxuICAgICAgICAgICAgbWVzc2FnZXM6e1xyXG4gICAgICAgICAgICAgICAgc2VudCxcclxuICAgICAgICAgICAgICAgIHJlY2VpdmVkLFxyXG4gICAgICAgICAgICAgICAgYWxsLFxyXG4gICAgICAgICAgICB9LFxyXG4gICAgICAgICAgICAuLi5zdXBlci5nZXQoKVxyXG4gICAgICAgIH1cclxuICAgIH1cclxufVxyXG5cclxudGFicyA9IG5ldyBCdWNrZXQoVGFiKTtcclxud2luZG93RnJhbWVzID0gbmV3IEJ1Y2tldChXaW5kb3dGcmFtZSk7XHJcbm1lc3NhZ2VzID0gbmV3IEJ1Y2tldChJdGVtKTtcclxuLy8gdGhpcy53aW5kb3dGcmFtZXMgPSB3aW5kb3dGcmFtZXM7XHJcbi8vIHRoaXMudGFicyA9IHRhYnM7XHJcblxyXG5cclxuY29uc3QgcmVjZWl2ZWRNZXNzYWdlID0gKHttZXNzYWdlSWQsIHdpbmRvd0lkLCBkYXRhfSk9PntcclxuICAgIGxldCBtZXNzYWdlID0gbWVzc2FnZXMuYWRkKG1lc3NhZ2VJZClcclxuICAgICAgICAuc2V0KFwiZGF0YVwiLGRhdGEpXHJcbiAgICAgICAgLnNldChcInJlY2VpdmVyXCIsd2luZG93SWQpO1xyXG4gICAgd2luZG93RnJhbWVzLmFkZCh3aW5kb3dJZCkuYWRkTWVzc2FnZVJlY2VpdmVkKG1lc3NhZ2UpO1xyXG4gICAgLy8gc2VuZFRvT3B0aW9uc1BhZ2UoXCJtZXNzYWdlLXJlY2VpdmVkXCIsIHtcclxuICAgIC8vICAgICAgICAgZGF0YSxcclxuICAgIC8vICAgICAgICAgcmVjZWl2ZXI6IHdpbmRvd0lkLFxyXG4gICAgLy8gICAgICAgICBtZXNzYWdlSWRcclxuICAgIC8vICAgICB9KVxyXG59XHJcblxyXG5jb25zdCBhY2NvdW50Rm9yTWVzc2FnZSA9ICh7d2luZG93SWQsbWVzc2FnZUlkfSk9PntcclxuICAgIGxldCBtZXNzYWdlID0gbWVzc2FnZXMuYWRkKG1lc3NhZ2VJZCkuc2V0KFwic2VuZGVyXCIsd2luZG93SWQpO1xyXG4gICAgd2luZG93RnJhbWVzLmFkZCh3aW5kb3dJZCkuYWRkTWVzc2FnZVNlbnQobWVzc2FnZSk7XHJcbn1cclxuXHJcbmNvbnN0IHdpbmRvd1RlbGVtZXRyeSA9IChtZXNzYWdlKT0+e1xyXG4gICAgY29uc3Qge3dpbmRvd0lkLGxvY2F0aW9uSHJlZixsaXN0ZW5lcnN9ID0gbWVzc2FnZTtcclxuICAgIHdpbmRvd0ZyYW1lcy5hZGQod2luZG93SWQpXHJcbiAgICAgICAgLnNldChcImxvY2F0aW9uSHJlZlwiLGxvY2F0aW9uSHJlZilcclxuICAgICAgICAuc2V0KFwibGlzdGVuZXJzXCIsbGlzdGVuZXJzKTtcclxufVxyXG5cclxuY29uc3QgZnJhbWVUcmVlID0gKG1lc3NhZ2UpPT57XHJcbiAgICBjb25zdCB7ZnJhbWVUcmVlLHdpbmRvd0lkfSA9IG1lc3NhZ2U7XHJcbiAgICB0YWJzLmFkZCh3aW5kb3dJZCkuc2V0RnJhbWVUcmVlKGZyYW1lVHJlZSk7XHJcbn1cclxuXHJcbmNvbnN0IGFjY291bnRGb3JQYXRoID0gKHt3aW5kb3dJZCx0b3BXaW5kb3dJZCxwYXRofSk9PntcclxuICAgIHRhYnMuYWRkKHRvcFdpbmRvd0lkKS5hY2NvdW50Rm9yUGF0aChwYXRoLCB3aW5kb3dJZCk7XHJcbn1cclxuXHJcblxyXG5cclxuY29uc3QgdG9waWNIYW5kbGVycyA9IHtcclxuICAgIFwicmVjZWl2ZWQtbWVzc2FnZVwiOnJlY2VpdmVkTWVzc2FnZSxcclxuICAgIFwid2luZG93LXRlbGVtZXRyeVwiOndpbmRvd1RlbGVtZXRyeSxcclxuICAgIFwiYWNjb3VudC1mb3ItbWVzc2FnZVwiOmFjY291bnRGb3JNZXNzYWdlLFxyXG4gICAgXCJhY2NvdW50LWZvci1wYXRoXCI6YWNjb3VudEZvclBhdGgsXHJcbiAgICBcImZyYW1lLXRyZWVcIjogZnJhbWVUcmVlXHJcbn1cclxuXHJcblxyXG5jb25zdCBwcm9jZXNzSW5jb21pbmdNZXNzYWdlID0gKG1lc3NhZ2UpID0+IHtcclxuICAgIGxldCB7IHRvcGljIH0gPSBtZXNzYWdlO1xyXG4gICAgaWYgKCF0b3BpY0hhbmRsZXJzW3RvcGljXSkgcmV0dXJuIGNvbnNvbGUubG9nKGBUT0RPOiBoYW5kZWwgJHt0b3BpY31gKVxyXG4gICAgdG9waWNIYW5kbGVyc1t0b3BpY10obWVzc2FnZSlcclxufVxyXG5cclxuY2hyb21lLnJ1bnRpbWUub25Db25uZWN0LmFkZExpc3RlbmVyKGZ1bmN0aW9uIChwb3J0KSB7XHJcbiAgICBwb3J0Lm9uTWVzc2FnZS5hZGRMaXN0ZW5lcigobWVzc2FnZSkgPT4ge1xyXG4gICAgICAgIGlmICghbWVzc2FnZSkgY29uc29sZS50cmFjZShcImVtcHR5IG1lc3NhZ2VcIik7XHJcbiAgICAgICAgdHJ5IHtcclxuICAgICAgICAgICAgcHJvY2Vzc0luY29taW5nTWVzc2FnZShtZXNzYWdlKVxyXG4gICAgICAgIH0gY2F0Y2ggKGVycm9yKSB7XHJcbiAgICAgICAgICAgIGNvbnNvbGUubG9nKGVycm9yKVxyXG4gICAgICAgIH1cclxuXHJcbiAgICB9KVxyXG59KTtcclxuXHJcbmNocm9tZS50YWJzLm9uVXBkYXRlZC5hZGRMaXN0ZW5lcigoKT0+e1xyXG4gICAgdGFicyA9IG5ldyBCdWNrZXQoVGFiKTtcclxufSkiXSwic291cmNlUm9vdCI6IiJ9
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IiIsImZpbGUiOiJiYWNrZ3JvdW5kLmpzIiwic291cmNlUm9vdCI6IiJ9