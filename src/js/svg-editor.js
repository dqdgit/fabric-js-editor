global.jQuery = require('jquery');
global.$ = global.jQuery;

$(function() {
  "use strict";

  // Create the global Fabric.js canvas
  global.FABRIC_CANVAS_NAME = "svg-editor-canvas";
  global.canvas = new fabric.Canvas(global.FABRIC_CANVAS_NAME);

  // Create the global state object
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

	new (require('./app/main.js'))();
});
