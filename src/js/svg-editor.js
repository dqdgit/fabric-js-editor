/**
 * Application entry point
 */

// Appliation globals
global.jQuery = require('jquery');
global.$ = global.jQuery;
global.console = require('console');

// Third party modules
require('jquery-contextmenu');
require('spectrum-colorpicker');
require('material-design-lite');
require('dialog-polyfill');
require('fabric');


/**
 * Appliation entry point
 */
$(document).ready(function _svgEditor() {
  "use strict";

  // Create the application global Fabric.js canvas
  global.FABRIC_CANVAS_NAME = "svg-editor-canvas";
  global.canvas = new fabric.Canvas(
    global.FABRIC_CANVAS_NAME,
    {
      preserveObjectStacking: true,
      fireRightClick: true,
      renderOnAddRemove: false,
      selection: true,
      selectionFullyContained: true,
      stopContxtMenu: false,
      perPixelTargetFind: true,
      targetFindTolerance: 8,
    }
  );
  
  fabric.Object.prototype.transparentCorners = false;

  // Create and initialize the application global state module
  global.state = new (require('./app/state.js'))(
    // Constructor getState parameter
    function () {
      return JSON.stringify(canvas);
    },
    // Constructor setState parameter
    function (newState) {
      canvas.clear();
      canvas.loadFromJSON(newState);
      canvas.renderAll();
    }
  );

  // Allocate the application main and invoke it's constructor
	new (require('./app/main.js'))();
});
