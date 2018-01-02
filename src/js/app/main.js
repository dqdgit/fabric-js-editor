/**
 * Initialize the application
 * 
 * @module ./main.js
 */
"use strict";

// Application globals
var canvas = global.canvas;
var state = global.state;

// Application modules
var utils = new (require('./fabricUtils.js'))();
var toolbar = new (require('./toolbar.js'))();
var statusBar = new (require('./statusBar.js'))();
var listeners = new (require('./listeners.js'))();


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
 * Initialize the application.
 * 
 * @constructor
 */
function MainModule() {
  if (!(this instanceof MainModule)) return new MainModule();

  // Show loading spinner until initialization is complete
  $("#loading-spinner").css({ display: "block" });

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

  // Initialize basic event handlers
  listeners.initialize();
 
  // Undisplay the loading spinner
  try {
    canvas.clear();
    $("#loading-spinner").css({ display: "none" });
  } catch (err) {
    $("#loading-spinner").css({ display: "none" });
  }

  // Initalize the toolbar
  toolbar.initialize();

  // Initialize the status bar
  statusBar.updateMode("Select");
  statusBar.updateInfo();
  statusBar.updateCounts();
}

// Exports
module.exports = MainModule;
