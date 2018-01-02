// text.js
"use strict";

var canvas = global.canvas;
var drawing = new (require('./drawing.js'))();
var utils = new (require('./fabricUtils.js'))();


/**
 * 
 */
function insertText() {
  canvas.defaultCursor = 'crosshair';

  // Esc key handler
  $(document).keyup(_escHandler);

  // Turn off canvas group selection so that it doesn't interfer
  // with creating the new object.
  canvas.set("selection", false);

  canvas.on('mouse:down', function __textMouseDown(o){
    // Unregister escape key handler
    $(document).unbind("keyup", _escHandler);

    drawing.disableDraw();

    var fontFamily = utils.getFont();
    var fontSize = utils.getFontSize();
    var pointer = canvas.getPointer(o.e);
    var text = new fabric.IText('', {
      fontFamily: fontFamily,
      fontSize: fontSize,
      left: pointer.x,
      top: pointer.y
    });

    // Handler for Fabric iText editing:exited event
    text.on('editing:exited', function __textEditingExited(o) {
      $("#ted-toolbar-text").removeClass("toolbar-item-active ");
      // If the text has zero length just delete it otherwise
      // keep it and update undo/redo.
      if ($(this)[0].text.length === 0) {
        canvas.remove(text);
      } else {
        // Delete the event listener
        //text.__eventListeners["editing:exited"] = [];

        // Push the canvas state to history
        canvas.trigger("object:statechange");
      }
      text.off('editing:exited', __textEditingExited);
    });

    text.targetFindTolerance = 4;

    // Remove the text mouse event handler
    canvas.off('mouse:down', __textMouseDown);

    // TODO: Is select workaround needed here?

    canvas.add(text);
    canvas.setActiveObject(text);
    canvas.defaultCursor = 'auto';
    text.enterEditing();
  });
}

/**
 * TODO: I think this is intended to cancel creating a new text object
 *       but not quite sure how it works.
 */
function cancelInsert() {
  canvas.defaultCursor = 'auto';
  drawing.disableDraw();
  $("#ted-toolbar-text").removeClass("toolbar-item-active ");
}

/**
 * Cancel text insertion
 * 
 * @param {Object} e - Fabric mouse event
 */
function _escHandler(e) {
  if (e.keyCode == 27) {
    cancelInsert();

    // Unregister escape key handler
    $(document).unbind("keyup", _escHandler);
  }
}

/**
 * Return focus to itext if user was editing text
 */
function returnFocus() {
  var o = canvas.getActiveObject();
  if (o === undefined || o === null || o.type !== "i-text") {
    return;
  }

  if (o.hiddenTextarea) {
    o.hiddenTextarea.focus();
  }
}

/**
 * Set object style
 * 
 * @param {Object} object - Fabric object
 * @param {String} styleName 
 * @param {String} value 
 */
function _setStyle(object, styleName, value) {
  // Don't allow changing part of the text
  /*
  if (object.setSelectionStyles && object.isEditing) {
    var style = { };
    style[styleName] = value;
    object.setSelectionStyles(style);
  } else {
    object[styleName] = value;
  }
  */

  object[styleName] = value;
}

/**
 * Get object style
 * 
 * @param {*} object 
 * @param {*} styleName 
 */
function _getStyle(object, styleName) {
  // Don't allow changing part of the text
  /*
  if (object.getSelectionStyles && object.isEditing) {
    return object.getSelectionStyles()[styleName];
  } else {
    return object[styleName];
  }
  */

  return object[styleName];
}

/**
 * 
 * @param {*} obj 
 */
function isItalics(obj) {
  return (_getStyle(obj, 'fontStyle') || '').indexOf('italic') > -1;
}

/**
 * 
 */
function toggleItalics() {
  var button = $("#toolbar-italics");
  var obj = canvas.getActiveObject();
  var italics = !isItalics(obj);
  _setStyle(obj, 'fontStyle', italics ? 'italic' : 'normal');

  if (italics) {
    button.addClass("toolbar-item-active");
  } else {
    button.removeClass("toolbar-item-active");
  }
  canvas.renderAll();

  // Push the canvas state to history
  canvas.trigger("object:statechange");
}

/**
 * 
 * @param {*} obj 
 */
function isBold(obj) {
  return (_getStyle(obj, 'fontWeight') || '').indexOf('bold') > -1;
}

/**
 * 
 */
function toggleBold() {
  var button = $("#toolbar-bold");
  var obj = canvas.getActiveObject();
  var bold = !isBold(obj);
  _setStyle(obj, 'fontWeight', bold ? 'bold' : '');

  if (bold) {
    button.addClass("toolbar-item-active");
  } else {
    button.removeClass("toolbar-item-active");
  }
  canvas.renderAll();

  // Push the canvas state to history
  canvas.trigger("object:statechange");
}

/**
 * 
 * @param {*} obj 
 */
function isUnderline(obj) {
  return (_getStyle(obj, 'textDecoration') || '').indexOf('underline') > -1;
}

/**
 * 
 */
function toggleUnderline() {
  var button = $("#toolbar-underline");
  var obj = canvas.getActiveObject();
  var underlined = !isUnderline(obj);
  _setStyle(obj, 'textDecoration', underlined ? 'underline' : '');

  if (underlined) {
    button.addClass("toolbar-item-active");
  } else {
    button.removeClass("toolbar-item-active");
  }
  canvas.renderAll();

  // Push the canvas state to history
  canvas.trigger("object:statechange");
}

/**
 * Module constructor
 */
function TextModule() {
  if (!(this instanceof TextModule)) return new TextModule();
}

// Exports
TextModule.prototype.isBold = isBold;
TextModule.prototype.isUnderline = isUnderline;
TextModule.prototype.isItalics = isItalics;
TextModule.prototype.toggleBold = toggleBold;
TextModule.prototype.toggleUnderline = toggleUnderline;
TextModule.prototype.toggleItalics = toggleItalics;
TextModule.prototype.insertText = insertText;
TextModule.prototype.cancelInsert = cancelInsert;
TextModule.prototype.returnFocus = returnFocus;

module.exports = TextModule;
