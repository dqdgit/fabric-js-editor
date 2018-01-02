/**
 * Application mian event listenters
 * 
 * @module ./listeners.js
 */
"use strict";

// Application globals
var canvas = global.canvas;
var state = global.state;

// Application modules
var utils = new (require('./fabricUtils.js'))();
var toolbar = new (require('./toolbar.js'))();
var tedUtils = new (require('./tedUtils.js'))();

/**
 * Handler for the delete and backspace keys
 */
function initDeleteKeys() {
  // Handler for the delete and backspace keys
  $(document).keyup(function (e) {
    if (e.which == 46 || e.which == 8) {
      // Block the functionality if user is entering text
      var active = $(document.activeElement);
      if (active.is('input,textarea,text,password,file,email,search,tel,date')) {
        return;
      }

      utils.deleteSelected();
      e.preventDefault();
    }
  });
}

/**
 * Initialize the right click context menu and event handlers
 */
function initContextMenu() {
  // Setup right-click context menu
  $.contextMenu({
    selector: '#content',
    trigger: 'right',
    animation: { duration: 0 },
    callback: function (itemKey, opt) {
      if (itemKey === "delete") {
        utils.deleteSelected();
      } else if (itemKey === "forward") {
        utils.bringForward();
      } else if (itemKey === "front") {
        utils.bringToFront();
      } else if (itemKey === "backward") {
        utils.sendBackward();
      } else if (itemKey === "back") {
        utils.sendToBack();
      } else if (itemKey === "clone") {
        utils.clone();
      }
    },
    items: {
      "forward": { name: "Bring Forward" },
      "front": { name: "Bring to Front" },
      "backward": { name: "Send Backward" },
      "back": { name: "Send to Back" },
      "sep1": "---------",
      "clone": { name: "Clone" },
      "sep2": "---------",
      "delete": { name: "Delete" }
    }
  });

  // Bind right-click menu
  $('#content').bind('contextmenu.custom', function (e) {
    var target = canvas.findTarget(e.e);
    if (target !== null && target !== undefined) {
      canvas.setActiveObject(target);
      return true;
    }
    return false;
  });
}

/**
 * Check to is if the selected object is one of the special
 * application composite object like table. If so change the
 * active object to be all the objects in the composite object.
 */
function setActiveObject() {
  global.console.log("**** setActiveObject");
  var activeObj = canvas.getActiveObject();
  if (tedUtils.isContained(activeObj)) { 
    tedUtils.setActiveContainer(activeObj);
  }
}

/**
 * Initialize the selection handlers
 */
function initSelection() {
  canvas.on({
    "selection:created": function __listenersSelectionCreated() {
      global.console.log("**** selection:created");
      setActiveObject();
      toolbar.showActiveTools();
    },
    "before:selection:cleared": function __listenersBeforeSelectionCleared() {
      global.console.log("**** before:selection:cleared");
    },
    "selection:cleared": function __listenersSelectionCleared() {
      global.console.log("**** selection:cleared");
      toolbar.hideActiveTools();
    },
    "selection:updated": function __listenersSelectionUpdated() {
      global.console.log("**** selection:updated");
      setActiveObject();
      toolbar.showActiveTools();
    },
  });
}

/**
 * Set the default application mouse event handlers
 */
function initMouse() {
  canvas.on({
    'mouse:up': function __listenersMouseUp(e) {
      global.console.log("**** mouse:up");
      if (tedUtils.isEditing() && !tedUtils.inEditingObject(e)) {
        tedUtils.stopEditing();
      }
    },
    'mouse:dblclick': function __listenersMouseDblclick(e) {
      global.console.log('**** mouse:dblclick');
      var obj = e.target;
      if (tedUtils.isEditable(obj)) {
        tedUtils.startEditing(obj);
      }
    },  
    // "event:mouseover": function __listenersEventMouseOver(e) {
    //   global.console.log("event:mouseover");
    // },
    // "mouse:over": function(e) {
    //   global.console.log("**** mouse.over");
    //   if (e.target !== null) {
    //     global.console.log("  target: " + e.target.type);
    //   }
    // }
  });
}

/**
 * Initialize the drag and drop handlers.
 */
function initDragAndDrop() {
  // Canvas drag and drop
  var canvasContainer = $("#drawing-container");

  // Drag over event handler. May not need this.
  canvasContainer.on("dragover", function (ev) {
    if (ev.preventDefault) {
      ev.preventDefault();
    }
    //ev.stopPropagation();

    // Check to see if at least one item in the files being dropped
    // are a "droppable" type.
    var droppable = false;
    var type;
    var items = ev.originalEvent.dataTransfer.items;
    for (var i = 0; i < items.length; i++) {
      type = items[i].type;
      if (type == "image/png" || type == "image/jpeg" || type == "image/svg+xml") {
        droppable = true;
      }
    }

    if (droppable) {
      ev.originalEvent.dataTransfer.dropEffect = 'copy';
    } else {
      ev.originalEvent.dataTransfer.dropEffect = 'nome';
    }

    return false;
  });

  // Drag enter event handler. May not need this.
  canvasContainer.on("dragenter", function (ev) {
    //ev.preventDefault();
    //ev.stopPropagation();
    this.classList.add('over');
  });

  canvasContainer.on("dragleave", function (ev) {
    this.classList.remove('over');
  });

  // Drop event handler. 
  canvasContainer.on("drop", function (ev) {
    if (ev.stopPropagation) {
      ev.stopPropagation();
    }
    //ev.preventDefault();

    var type;
    var fileList = ev.originalEvent.dataTransfer.files;
    for (var i = 0; i < fileList.length; i++) {
      type = fileList[i].type;
      switch (type) {
        case "image/svg+xml":
          utils.readFromString(fileList[i]);
          break;
        case "image/png":
          utils.readFromData(fileList[i]);
          break;
        case "image/jpeg":
          utils.readFromData(fileList[i]);
          break;
        default:
          // TODO: Error, unknown type
          break;
      }
    }

    return false;
  });
}

/**
 * Initialize undo/redo event handlers
 */
function initUndoRedo() {
  canvas.on("object:modified", function () {
    state.save();
  });

  canvas.on("object:removed", function () {
    state.save();
  });

  canvas.on("object:statechange", function () {
    state.save();
  });
}

// /**
//  * Event handler for canvas resize events
//  */
function resizeHandler() {
  // Resize the canvas
  var width = $("body").width();
  var height = $("body").height();
  var toolbarHeight = $("#ted-toolbar").height();
  var statusbarHeight = $("#ted-status-bar").height();
  canvas.setWidth(width);
  canvas.setHeight(height - toolbarHeight - statusbarHeight - 5);
  //$("#canvas-container").css({ left: "50px", top: "40px", width: width });
  //$("#canvas-container").css({ left: "0px", top: "0px", width: width, height: height });
  //canvas.setHeight(window.innerHeight - $("#toolbar").height() - 150);

  // Subtract the left and right padding values
  var padLeft = parseInt($("#ted-toolbar").css("padding-left"));
  var padRight = parseInt($("#ted-toolbar").css("padding-right"));
  //$("#toolbar").css({ width: width - (padLeft + padRight) });
}

/**
 * Initialize the application custom events
 */
function initTedHandlers() {
  canvas.on('ted:listeners:reset', function(e) {
    global.console.log("**** ted:listeners:reset");
    initMouse();
  });
}

function initObjectHandlers() {
  // canvas.on('object:moving', function __objectMoving(e) {
  //   global.console.log("**** object:moving");
  // });

  canvas.on('object:modified', function __objectModified(e) {
    global.console.log("**** object:modified");
    var obj = e.target;
    if (tedUtils.isTed(obj)) {
      tedUtils.setModified(obj);
    }
  });
}

/**
 * Set the main application event handlers.
 */
function setDefaults() {
  initDeleteKeys();
  initContextMenu();
  initSelection();
  initMouse();
  initDragAndDrop();
  initUndoRedo();
  initTedHandlers();
  initObjectHandlers();
}

/**
 * Initialize the main application event handlers
 */
function initialize() {
  window.addEventListener('resize', resizeHandler, false);
  resizeHandler();

  setDefaults();
}

/**
 * Toolbar module constructor
 */
function ListenersModule() {
  if (!(this instanceof ListenersModule)) return new ListenersModule();
}

// Exports
ListenersModule.prototype.initialize = initialize;
ListenersModule.prototype.setDefaults = setDefaults;

module.exports = ListenersModule;
