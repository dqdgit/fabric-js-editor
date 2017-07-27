global.jQuery = require('jquery');
global.$ = global.jQuery;

$(function() {
  "use strict";
  global.FABRIC_CANVAS_NAME = "svg-editor-canvas";
	global.canvas = new fabric.Canvas(FABRIC_CANVAS_NAME);
	new (require('./app/handlers.js'))();
});
