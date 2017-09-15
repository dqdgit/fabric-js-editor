"use strict";

var canvas = global.canvas;
var state = global.state;

/**
 * Third party modules
 */
// DQD
require('jquery');
require('jquery-ui');
require('jquery-contextmenu');
//require('spectrum-colorpicker');
//require('material-design-lite');
//require('dialog-polyfill');

/**
 * Application modules
 */
var utils = new (require('./fabricUtils.js'))();
//var statusBar = new (require('./statusBar.js'))();
var toolbar = new (require('./toolbar.js'))();

/**
 * Initialize module variables
 */
var objectSelected = false;

/**
 * Handler for the delete and backspace keys
 */
function deleteHandler() {
  // Handler for the delete and backspace keys
  $(document).keyup(function(e) {
    if(e.which == 46 || e.which == 8) {
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
function rightClick() {
  // Setup right-click context menu
  $.contextMenu({
    selector: '#content',
    trigger: 'right',
    animation: { duration: 0 },
    callback: function(itemKey, opt){
      if (itemKey === "delete") {
        utils.deleteSelected();
      } else if (itemKey === "forward") {
        utils.sendForward();
      } else if (itemKey === "front") {
        utils.sendToFront();
      } else if (itemKey === "backward") {
        utils.sendBackward();
      } else if (itemKey === "back") {
        utils.sendToBack();
      } else if (itemKey === "clone") {
        utils.clone();
      }
    },
    items: {
      "forward": {name: "Bring Forward"},
      "front": {name: "Bring to Front"},
      "backward": {name: "Send Backward"},
      "back": {name: "Send to Back"},
      "sep1": "---------",
      "clone": {name: "Clone"},
      "sep2": "---------",
      "delete": {name: "Delete"}
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
 * Initialize the canvas event handlers
 */
function initCanvas() {
  canvas.on({
    "object:selected": function () {
      // DQD - Added as part of click on nothing
      objectSelected = true;
      toolbar.showActiveTools();
    },
    "selection:cleared": function () {
      //DQD - Not sure this is correct
      //showActiveTools();
      // DQD - Added as part of click on nothing
      objectSelected = false;
      toolbar.hideActiveTools();
    },
    // DQD - Added this to try and deactivate active toolbars
    // when nothing is selected. May not be needed.
    "mouse:up": function (ev) {
      //if (!ev.target) {
      if (!objectSelected) {
        toolbar.hideActiveTools();
      }
    }
  });

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

  canvasContainer.on("dragleave", function(ev) {
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
 * Event handler for canvas resize events
 */
function resizeHandler() {
  // Resize the canvas
  var width = $("body").width();
  var height = $("body").height();
  var toolbarHeight = $("#toolbar").height();
  var statusbarHeight = $("#status_bar").height();
  canvas.setWidth(width);
  canvas.setHeight(height - toolbarHeight - statusbarHeight - 5);
  //$("#canvas-container").css({ left: "50px", top: "40px", width: width });
  //$("#canvas-container").css({ left: "0px", top: "0px", width: width, height: height });
  //canvas.setHeight(window.innerHeight - $("#toolbar").height() - 150);

  // Subtract the left and right padding values
  var padLeft = parseInt($("#toolbar").css("padding-left"));
  var padRight = parseInt($("#toolbar").css("padding-right"));
  //$("#toolbar").css({ width: width - (padLeft + padRight) });
}

/**
 * TODO: What does this do?
 * 
 * @param {*} sParam 
 */
// var getUrlParameter = function getUrlParameter(sParam) {
//   var sPageURL = decodeURIComponent(window.location.search.substring(1)),
//     sURLVariables = sPageURL.split('&'),
//     sParameterName,
//     i;

//   for (i = 0; i < sURLVariables.length; i++) {
//     sParameterName = sURLVariables[i].split('=');

//     if (sParameterName[0] === sParam) {
//       return sParameterName[1] === undefined ? true : sParameterName[1];
//     }
//   }
// };

/**
 * Initialize the module
 */
function MainModule() {
  if (!(this instanceof MainModule)) return new MainModule();

  // Show loading spinner until sample image has been loaded
  $("#loading-spinner").removeClass("noshow");

  // Initialize canvas
  fabric.Object.prototype.transparentCorners = false;
  window.addEventListener('resize', resizeHandler, false);
  resizeHandler();

  // Change fabric.js selection styles
  fabric.Object.prototype.set({
    borderColor: "#1c55d5",
    cornerColor: "#1c55d5",
    cornerSize: 8,
    rotatingPointOffset: 30
  });

  // Set some default values on the canvas
  utils.setFont("Liberation Sans");
  utils.setFontSize(18);
  utils.setFillColor("#ff0000");
  utils.setOutlineColor("#000000");
  utils.setOutlineWidth(3);
  utils.setTextSpacing(1.15);

  // Preserve object layer order when selecting objects
  canvas.preserveObjectStacking = true;

  // Setup handlers
  deleteHandler();
  rightClick();
  initCanvas();
  //listeners();
 
  try {
    canvas.clear();
    $("#loading-spinner").addClass("noshow");
  } catch (err) {
    $("#loading-spinner").addClass("noshow");
  }

  // Undo redo
  canvas.on("object:modified", function() {
    state.save();
  });

  canvas.on("object:removed", function() {
    state.save();
  });

  canvas.on("object:statechange", function() {
    state.save();
  });

  toolbar.initialize();
  //isAppLoading = false;
}

/**
 * Module exports
 */
module.exports = MainModule;
