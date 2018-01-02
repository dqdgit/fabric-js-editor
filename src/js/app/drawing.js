// darwing.js
"use strict";

// Application globals
var canvas = global.canvas;

// Application modules
var utils = new (require('./fabricUtils.js'))();
var statusBar = new (require('./statusBar.js'))();

// Module globals
var _drawnObj;         // The Fabric object being drawn
var _isMouseDown;      // Indicates if mouse button is donw or not
var _objType;          // The type of object being drawn


/**
 * Remove the drawing event handlers and make the canvas
 * objects selectable.
 */
function disableDraw() {
  // Reset the mouse events
  canvas.off('mouse:down', _drawMouseDown);
  canvas.off('mouse:move', _drawMouseMove);
  canvas.off('mouse:up', _drawMouseUp);

  //canvas.trigger('ted:listeners:reset');

  // Renable group selection
  canvas.set("selection", true);

  // Make all objects selectable
  var objs = canvas.getObjects();
  objs.forEach(function(o) { 
    o.set("selectable", true);
  });
}

/**
 * Event handler to begin drawing an object
 * 
 * @param {Object} o - Fabric mouse event
 */
function _drawMouseDown(o) {
  // Unregister escape key handler
  $(document).unbind("keyup", _escHandler);

  _isMouseDown = true;
  var pointer = canvas.getPointer(o.e);

  if (_objType === 'line') {
    var points = [pointer.x, pointer.y, pointer.x, pointer.y];
    _drawnObj = new fabric.Line(points, {
      // originX: 'center',
      // originY: 'center',
      fill: utils.getFillColor(),
      stroke: utils.getOutlineColor(),
      strokeWidth: utils.getOutlineWidth()
    });
  } else if (_objType === 'square') {
    _drawnObj = new fabric.Rect({
      width: 0,
      height: 0,
      top: pointer.y,
      left: pointer.x,
      fill: utils.getFillColor(),
      stroke: utils.getOutlineColor(),
      strokeWidth: utils.getOutlineWidth()
    });
  } else if (_objType === 'rounded-rect') {
    _drawnObj = new fabric.Rect({
      width: 0,
      height: 0,
      top: pointer.y,
      left: pointer.x,
      rx: 10,
      ry: 10,
      fill: utils.getFillColor(),
      stroke: utils.getOutlineColor(),
      strokeWidth: utils.getOutlineWidth()
    });
  } else if (_objType === 'circle') {
    _drawnObj = new fabric.Circle({
      radius: 0,
      top: pointer.y,
      left: pointer.x,
      fill: utils.getFillColor(),
      stroke: utils.getOutlineColor(),
      strokeWidth: utils.getOutlineWidth()
    });
  }

  canvas.add(_drawnObj);
}

/**
 * Mouse move event handler for drawing an object
 * 
 * @param {Object} o - Fabric mouse event
 */
function _drawMouseMove(o) {
  if (!_isMouseDown) return;
  var shift = o.e.shiftKey;
  var pointer = canvas.getPointer(o.e);

  if (_objType === 'line') {
    if (shift) {
      // TODO rotate towards closest angle
      _drawnObj.set({ x2: pointer.x, y2: pointer.y });
    } else {
      _drawnObj.set({ x2: pointer.x, y2: pointer.y });
    }
  } else if (_objType === 'square' || _objType === 'rounded-rect') {
    var newWidth = (_drawnObj.left - pointer.x) * -1;
    var newHeight = (_drawnObj.top - pointer.y) * -1;
    _drawnObj.set({ width: newWidth, height: newHeight });
  } else if (_objType === 'circle') {
    var x = _drawnObj.left - pointer.x;
    var y = _drawnObj.top - pointer.y;
    var diff = Math.sqrt(x * x + y * y);
    _drawnObj.set({ radius: diff / 2.3 });
  }

  canvas.renderAll();
}

/**
 * Event handler for end drawing of an object
 * 
 * @param {Object} o - Fabric mouse event
 */
function _drawMouseUp(o) {
  _isMouseDown = false;

  // Fix upside-down square
  if (_objType === 'square' || _objType === 'rounded-rect') {
    if (_drawnObj.width < 0) {
      var newLeft = _drawnObj.left + _drawnObj.width;
      var newWidth = Math.abs(_drawnObj.width);
      _drawnObj.set({ left: newLeft, width: newWidth });
    }

    if (_drawnObj.height < 0) {
      var newTop = _drawnObj.top + _drawnObj.height;
      var newHeight = Math.abs(_drawnObj.height);
      _drawnObj.set({ top: newTop, height: newHeight });
    }
  }

  // If the object is not tiny finish up and select it
  // otherwise delete it.
  if (_drawnObj.height !== 0 || _drawnObj.width !== 0) {
    canvas.defaultCursor = 'auto';

    // Fix selection issue
    utils.selectObjects();
    canvas.discardActiveObject();

    // Select the object
    canvas.setActiveObject(_drawnObj);

    // Update the status bar
    statusBar.updateCounts();
    statusBar.updateInfo();

    // Update the canvas
    canvas.renderAll();

    // Set per-pixel dragging rather than bounding-box dragging
    _drawnObj.perPixelTargetFind = true;
    _drawnObj.targetFindTolerance = 4;

    // Disable drawing
    disableDraw();

    // Push the canvas state to history
    canvas.trigger("object:statechange");
  } else {
    canvas.remove(_drawnObj);
  }
}

/**
 * 
 * @param {string} objType - kind of object to draw
 */
function drawObj(objType) {
  _objType = objType;

  // Esc key handler
  $(document).keyup(_escHandler);

  // Disable canvas group level selection so that it
  // doesn't interfer with drawing.
  canvas.set("selection", false);

  // Set the drawing mouse event handelers
  canvas.on('mouse:down', _drawMouseDown);
  canvas.on('mouse:move', _drawMouseMove);
  canvas.on('mouse:up', _drawMouseUp);
}

/**
 * 
 */
function _cancelInsert() {
  canvas.defaultCursor = 'auto';
  disableDraw();
  //$("#ted-toolbar-text").removeClass("toolbar-item-active ");
  $("#ted-toolbar-shpe").removeClass("toolbar-item-active ");
}

/**
 * Cancel text insertion
 * 
 * @param {Object} e - Fabric mouse event
 */
function _escHandler(e) {
  if (e.keyCode == 27) {
    _cancelInsert();

    // Unregister escape key handler
    $(document).unbind("keyup", _escHandler);
  }
}

/**
 * Module constructor
 */
function DrawingModule() {
  if (!(this instanceof DrawingModule)) return new DrawingModule();
}

// Exports
DrawingModule.prototype.drawObj = drawObj;
DrawingModule.prototype.disableDraw = disableDraw;

module.exports = DrawingModule;
