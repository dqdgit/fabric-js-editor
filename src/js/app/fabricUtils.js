
"use strict";

/* -----------------
Good references:
  https://github.com/michaeljcalkins/angular-fabric/blob/master/assets/fabric.js
  http://fabricjs.com/js/kitchensink/controller.js
----------------- */

// Node modules
var fail = require('assert');
var read = require('fs');
var filesaver = require('filesaver.js');

// Application globals
var canvas = global.canvas;


/**
 * Add all the specified objects to the canvas
 * 
 * @param {Array} objs - the array of Fabric objects to add
 */
function addObjects(objs) {
  // If no objects were specified just return
  if (objs === undefined || objs.length < 1) {
    return;
  }

  // Add the given objects to the canvas
  objs.forEach(function(obj) {
    canvas.add(obj);
  });
}

/**
 * Make the given list of objects the active selection. If no
 * objects are given add all the objects.
 * 
 * @param {Array} objs - optional array of objects to select
 */
function selectObjects(objs) {
  // Remove existing selection
  canvas.discardActiveObject();

  // If no objects were specified use all the canvas objects
  if (objs === undefined) {
    objs = canvas.getObjects();
  }

  // Create the selection object
  var selection = new fabric.ActiveSelection(objs);

  // Make the selection active
  canvas.setActiveObject(selection);

  return canvas.getActiveObject();
}

/**
 * 
 * @param {Array} objs 
 */
function hideObjects(objs) {
  objs.forEach(function(obj) {
    obj.set('visible', false);
  });
}

/**
 * 
 * @param {Array} objs 
 */
function showObjects(objs) {
  objs.forEach(function(obj) {
    obj.set('visible', true);
  });
}

/**
 * 
 * @param {Array} objs 
 */
function deleteObjects(objs) {
  objs.forEach(function(obj) {
    canvas.remove(obj);
  });
}

/**
 * 
 */
function clone() {
  var object = null;
  if (canvas.getActiveGroup() !== null) {
    var objects = canvas.getActiveGroup().objects;

    // Fabric.js bug getting an object's coordinates when a group is selected
//    canvas.deactivateAll();
    canvas.discardActiveObject();

    var cloned = [];
    for (var i = 0; i < objects.length; i++) {
      object = objects[i].clone();
      object.set("top", object.top + 20);
      object.set("left", object.left + 20);
      canvas.add(object);
      cloned.push(object);
    }

    selectObjects(cloned);
  } else if (canvas.getActiveObject() !== null) {
    object = canvas.getActiveObject().clone();
    object.set("top", object.top + 20);
    object.set("left", object.left + 20);
    canvas.add(object);

    // select new object
//    canvas.deactivateAll();
    canvas.discardActiveObject();
    canvas.setActiveObject(object);
  }

  canvas.renderAll();

  // Push the canvas state to history
  canvas.trigger("object:statechange");
}

/**
 * 
 */
function deleteSelected() {
  // Delete the current object(s)
  var objs = canvas.getActiveObjects();
  var nObjs = objs.length;

  if (nObjs > 1) {
    //canvas.getActiveGroup().forEachObject(function (o) { canvas.remove(o); });
    //canvas.discardActiveGroup().renderAll();
    objs.forEach(function(o) { canvas.remove(o); });
    canvas.discardActiveObject();
    canvas.renderAll();
  } else if (nObjs === 1) {
    canvas.remove(canvas.getActiveObject());
  }
}

/**
 * 
 */
function bringForward() {
  // if (canvas.getActiveGroup() !== null) {
  //   sendGroupForward(canvas.getActiveGroup(), false);
  // } else if (canvas.getActiveObject() !== null) {
  //   canvas.bringForward(canvas.getActiveObject());
  // }
  var activeObj = canvas.getActiveObject();
  activeObj.bringForward();

  // Push the canvas state to history
  canvas.trigger("object:statechange");
}

/**
 * 
 */
function sendBackward() {
  // if (canvas.getActiveGroup() !== null) {
  //   sendGroupBackward(canvas.getActiveGroup(), false);
  // } else if (canvas.getActiveObject() !== null) {
  //   canvas.sendBackwards(canvas.getActiveObject());
  // }
  var activeObj = canvas.getActiveObject();
  activeObj.sendBackwards();

  // Push the canvas state to history
  canvas.trigger("object:statechange");
}

/**
 * 
 */
function bringToFront(objs) {
  // if (canvas.getActiveGroup() !== null) {
  //   sendGroupForward(canvas.getActiveGroup(), true);
  // } else if (canvas.getActiveObject() !== null) {
  //   canvas.bringToFront(canvas.getActiveObject());
  // }
  if (objs === undefined) {
    canvas.getActiveObject().bringToFront();
  } else if (objs.length > 0) {
    objs.forEach(function(obj) {
      obj.bringToFront();
    });
  } else {
    objs.bringToFront();
  }

  // Push the canvas state to history
  canvas.trigger("object:statechange");
}

/**
 * 
 */
function sendToBack() {
  // if (canvas.getActiveGroup() !== null) {
  //   sendGroupBackward(canvas.getActiveObject(), true);
  // } else if (canvas.getActiveObject() !== null) {
  //   canvas.sendToBack(canvas.getActiveObject());
  // }
  var activeObj = canvas.getActiveObject();
  activeObj.sendToBack();

  // Push the canvas state to history
  canvas.trigger("object:statechange");
}

// TODO Fabric.js might do this for us now that we've on version >1.5
/**
 * 
 * @param {*} group 
 * @param {*} bottom 
 */
// function sendGroupBackward(group, bottom) {
//   // Copy object references
//   var sorted = group.objects.slice();

//   // Sort the array
//   var objects = canvas.getObjects();
//   sorted.sort(function(a, b){
//     var z1 = objects.indexOf(a);
//     var z2 = objects.indexOf(b);
//     return a-b;
//   });

//   // Change layer of objects one-by-one
//   var obj;
//   if (bottom === true) {
//     for (var i = 0; i < sorted.length; i++) {
//       obj = sorted[i];
//       canvas.sendToBack(obj);
//     }
//   } else {
//     for (var j = sorted.length - 1; j >= 0; j--) {
//       obj = sorted[j];
//       canvas.sendBackwards(obj);
//     }
//   }
// }

// TODO Fabric.js might do this for us now that we've on version >1.5
/**
 * 
 * @param {*} group 
 * @param {*} top 
 */
// function sendGroupForward(group, top) {
//   // Copy object references
//   var sorted = group.objects.slice();

//   // Sort the array
//   var objects = canvas.getObjects();
//   sorted.sort(function(a, b){
//     var z1 = objects.indexOf(a);
//     var z2 = objects.indexOf(b);
//     return a-b;
//   });

//   // Change layer of objects one-by-one
//   var obj;
//   if (top === true) {
//     for (var i = sorted.length - 1; i >= 0; i--) {
//       obj = sorted[i];
//       canvas.bringToFront(obj);
//     }
//   } else {
//     for (var j = 0; j < sorted.length; j++) {
//       obj = sorted[j];
//       canvas.bringForward(obj);
//     }
//   }
// }

// This is the shadow-less version
/*
function getImageBounds() {
  selectAll();
  var rect = canvas.getActiveGroup().getBoundingRect();
  canvas.deactivateAll();
  canvas.renderAll();
  return rect;
}
*/

/**
 * Get image bounds with shadows included
 * 
 * @param {*} fitToCanvas 
 */
function getImageBounds(fitToCanvas) {
  var objs = canvas.getObjects();

  if (objs.length === 0) {
    return {
      top: 0, left: 0, height: 0, width: 0
    };
  }

  // Fabric.js bug getting an objects bounds when all objects are selected
  //canvas.deactivateAll();
  canvas.discardActiveObject();
  var bounds = objs[0].getBoundingRect();

  // Find maximum bounds
  for (var i = 0; i < objs.length; i++) {
    var obj = objs[i];
    var rect = getObjBounds(obj);

    if (rect.left < bounds.left) {
      bounds.width += bounds.left - rect.left;
      bounds.left = rect.left;
    }

    if (rect.top < bounds.top) {
      bounds.height += bounds.top - rect.top;
      bounds.top = rect.top;
    }

    var right = rect.left + rect.width;
    var bottom = rect.top + rect.height;

    if (right > bounds.left + bounds.width) {
      bounds.width = right - bounds.left;
    }

    if (bottom > bounds.top + bounds.height) {
      bounds.height = bottom - bounds.top;
    }
  }

  if (fitToCanvas) {
    // Fit to canvas
    if (bounds.left < 0) {
      bounds.width -= Math.abs(bounds.left);
      bounds.left = 0;
    }

    if (bounds.top < 0) {
      bounds.height -= Math.abs(bounds.top);
      bounds.top = 0;
    }

    if (bounds.left + bounds.width > canvas.width) {
      bounds.width = canvas.width - bounds.left;
    }

    if (bounds.top + bounds.height > canvas.height) {
      bounds.height = canvas.height - bounds.top;
    }
  }

  // Don't show selection tools
  selectObjects();
  //canvas.deactivateAll();
  canvas.discardActiveObject();
  canvas.renderAll();

  return bounds;
}

/**
 * Get object bounds with shadows included
 * 
 * @param {*} obj 
 */
function getObjBounds(obj) {
  var bounds = obj.getBoundingRect();
  //var shadow = obj.getShadow();
  var shadow = obj.get('shadow');

  if (shadow !== null) {
    var blur = shadow.blur;
    var mBlur = blur * Math.abs(obj.scaleX + obj.scaleY) / 4;
    var signX = shadow.offsetX >= 0.0 ? 1.0 : -1.0;
    var signY = shadow.offsetY >= 0.0 ? 1.0 : -1.0;
    var mOffsetX = shadow.offsetX * Math.abs(obj.scaleX);
    var mOffsetY = shadow.offsetY * Math.abs(obj.scaleY);
    var offsetX = mOffsetX + (signX * mBlur);
    var offsetY = mOffsetY + (signY * mBlur);

    if (mOffsetX > mBlur) {
      bounds.width += offsetX;
    } else if (mOffsetX  < -mBlur) {
      bounds.width -= offsetX;
      bounds.left += offsetX;
    } else {
      bounds.width += mBlur * 2;
      bounds.left -= mBlur - mOffsetX;
    }

    if (mOffsetY > mBlur) {
      bounds.height += offsetY;
    } else if (mOffsetY < -mBlur) {
      bounds.height -= offsetY;
      bounds.top += offsetY;
    } else {
      bounds.height += mBlur * 2;
      bounds.top -= mBlur - mOffsetY;
    }
  }

  return bounds;
}

/**
 * Export canvas to a file in the specified format 
 * 
 * @param {String} fileType - one of: "png", "jpeg", or "svg"
 *
 */
function exportFile(fileType) {
  // Get bounds of image
  var bounds = getImageBounds(true);
  var blob = null;

  // Get image data
  if (fileType === "svg") {
    var svg = canvas.toSVG({
      viewBox: {
        x: bounds.left,
        y: bounds.top,
        width: bounds.width,
        height: bounds.height
      }
    });
    blob = new Blob([svg], {type: "image/svg+xml"});
  } else {
    var dataURL = canvas.toDataURL({
        format: fileType,
        left: bounds.left,
        top: bounds.top,
        width: bounds.width,
        height: bounds.height,
        quality: 1.0
    });

    var data = atob(dataURL.replace(/^.*?base64,/, ''));
    var asArray = new Uint8Array(data.length);
    for( var i = 0, len = data.length; i < len; ++i ) {
      asArray[i] = data.charCodeAt(i);
    }
    blob = new Blob([asArray.buffer], {type: "image/" + fileType});
  }

  // Save file
  filesaver.saveAs(blob, "svg-editor." + fileType);
}

/**
 * 
 * @param {*} url 
 * @param {*} loader 
 */
function insertSvg(url, loader) {
  //loader.removeClass("noshow");
  loader.css({ display: "block" });
  fabric.loadSVGFromURL(url, function(objects, options) {
    var obj = fabric.util.groupSVGElements(objects, options);

    var scaleFactor = 1;
    if (obj.width > obj.height) {
      scaleFactor = (canvas.width / 3) / obj.width;
    } else {
      scaleFactor = (canvas.height / 3) / obj.height;
    }

    obj.set({
      top: Math.floor(canvas.height / 5),
      left: Math.floor(canvas.width / 5),
      scaleY: scaleFactor,
      scaleX: scaleFactor
    });

    canvas.add(obj);
    obj.perPixelTargetFind = true;
    obj.targetFindTolerance = 4;
//    canvas.deactivateAll();
    canvas.discardActiveObject();
    canvas.setActiveObject(obj);
    canvas.renderAll();

    // Push the canvas state to history
    canvas.trigger("object:statechange");

    //loader.addClass("noshow");
    loader.css({ display: "none" });
  });
}

/**
 * 
 * @param {*} data 
 * @param {*} loader 
 */
function insertImageFromData(data, loader) {
  //loader.removeClass("noshow");
  loader.css({ display: "block" });
  
  var imgObj = new Image();
  imgObj.src = data;

  imgObj.onload = function () {
    var obj = new fabric.Image(imgObj);

    var scaleFactor = 1;
    if (obj.width > obj.height) {
      scaleFactor = (canvas.width / 3) / obj.width;
    } else {
      scaleFactor = (canvas.height / 3) / obj.height;
    }

    obj.set({
      top: Math.floor(canvas.height / 5),
      left: Math.floor(canvas.width / 5),
      scaleY: scaleFactor,
      scaleX: scaleFactor
    });

    canvas.add(obj);
    obj.perPixelTargetFind = true;
    obj.targetFindTolerance = 4;

//    canvas.deactivateAll();
    canvas.discardActiveObject();
    canvas.setActiveObject(obj);
    canvas.renderAll();

    // Push the canvas state to history
    canvas.trigger("object:statechange");

    //loader.addClass("noshow");
    loader.css({ display: "none" });
  };
}

/**
 * 
 * @param {string} string 
 * @param {element} loader 
 */
function insertSvgFromString(string, loader) {
  //loader.removeClass("noshow");
  loader.css({ display: "block" });

  fabric.loadSVGFromString(string, function (objects, options) {
    var obj = fabric.util.groupSVGElements(objects, options);

    var scaleFactor = 1;
    if (obj.width > obj.height) {
      scaleFactor = (canvas.width / 3) / obj.width;
    } else {
      scaleFactor = (canvas.height / 3) / obj.height;
    }

    obj.set({
      top: Math.floor(canvas.height / 5),
      left: Math.floor(canvas.width / 5),
      scaleY: scaleFactor,
      scaleX: scaleFactor
    });

    canvas.add(obj);
    obj.perPixelTargetFind = true;
    obj.targetFindTolerance = 4;
//    canvas.deactivateAll();
    canvas.discardActiveObject();
    canvas.setActiveObject(obj);
    canvas.renderAll();

    // Push the canvas state to history
    canvas.trigger("object:statechange");

    //loader.addClass("noshow");
    loader.css({ display: "none" });
  });
}

/**
 * Read the contents of the given file and insert it as a string
 * 
 * @param {File} file - Web API File object to insert
 */
function readFromString(file) {
  var reader = new FileReader();

  reader.onload = function (ev) {
    insertSvgFromString(ev.target.result, $("#loading-spinner"));
  };

  reader.readAsText(file);
}

/**
 * 
 * @param {File} file - Web API File object to insert
 */
function readFromData(file) {
  var reader = new FileReader();

  reader.onload = function (ev) {
    insertImageFromData(ev.target.result, $("#loading-spinner"));
  };

  reader.readAsDataURL(file);
}

/**
 * 
 * @param {*} styleName 
 * @param {*} object 
 */
function getActiveStyle(styleName, object) {
  // Precedence:
  //   - parameter object
  //   - active object
  //   - canvas property
  // Bracket notation is equivalent to .get
  object = object || canvas.getActiveObject();
  // getActiveObject returns null, not undefined
  object = (object && object !== undefined) ? object : canvas;
  //var value = object[styleName];
  var value = object.get(styleName);
  // Handle the case where an object is found, but 
  // does not have the specified property. Try to 
  // get it from the canvas.
  if (value === undefined) {
    //value = canvas[styleName];
    value = canvas.get(styleName);
  } 

  return value;

  // Don't change part of text
  /*
  return (object.getSelectionStyles && object.isEditing) ? (object.getSelectionStyles()[styleName] || '') : (object[styleName] || '');
  */
}

/**
 * 
 * @param {*} styleName 
 * @param {*} value 
 * @param {*} object 
 */
function setActiveStyle(styleName, value, object) {
  // Precedence:
  //   - parameter object
  //   - active object
  //   - canvas property
  object = object || canvas.getActiveObject();
  object = (object !== undefined) ? object : canvas;
  // Bracket notation is equivalent to .set
  //object[styleName] = value;
  object.set(styleName, value);

  // Don't change part of text
  /*
  if (object.setSelectionStyles && object.isEditing) {
    var style = { };
    style[styleName] = value;
    object.setSelectionStyles(style);
  } else {
    object[styleName] = value;
  }
  */
}

/**
 * 
 */
function getFillColor() {
  // var object = canvas.getActiveObject();
  // if (object.customFillColor !== undefined) {
  //   return object.customFillColor;
  // } else if (object.type === 'line') {
  //   return getActiveStyle("stroke");
  // } else {
  //   return getActiveStyle("fill");
  // }

  //return getActiveStyle("fill");
  var object = canvas.getActiveObject();

  if (object && object !== undefined) {
    return object.getFill();
  } else {
    return getActiveStyle("fill", canvas);
  }
}

/**
 * 
 * @param {*} hex 
 */
function setFillColor(hex) {
  // var object = canvas.getActiveObject();
  // if (object) {
  //   if (object.type === 'i-text') {
  //     setActiveStyle('fill', hex);
  //   } else if (object.type === 'line') {
  //     setActiveStyle('stroke', hex);
  //   } else {
  //     if (!object.paths) {
  //       object.setFill(hex);
  //     } else if (object.paths) {
  //       for (var i = 0; i < object.paths.length; i++) {
  //         object.paths[i].setFill(hex);
  //       }
  //     }
  //   }

  //   object.customFillColor = hex;
  // }

  // object["fill"] = hex seems to be broken. Need to use
  // object.setFill(hex) instead
  //setActiveStyle("fill", hex);
  var object = canvas.getActiveObject();

  if (object && object !== undefined) {
    object.setFill(hex);
  } else {
    setActiveStyle("fill", hex, canvas);
  }
}

/**
 * 
 */
function getOutlineColor() {
  // var object = canvas.getActiveObject();
  // if (object.customOutlineColor !== undefined) {
  //   return object.customOutlineColor;
  // }

  return getActiveStyle("stroke");
}

/**
 * 
 * @param {*} hex 
 */
function setOutlineColor(hex) {
  // var object = canvas.getActiveObject();
  // if (object) {
  //   if (object.type === 'i-text' || object.type === 'line') {
  //     setActiveStyle('stroke', hex);
  //   } else {
  //     if (!object.paths) {
  //       object.setStroke(hex);
  //     } else if (object.paths) {
  //       for (var i = 0; i < object.paths.length; i++) {
  //         object.paths[i].setStroke(hex);
  //       }
  //     }
  //   }

  //   object.customOutlineColor = hex;
  // }
  var object = canvas.getActiveObject();

  if (object && object !== undefined) {
    if (object.type === 'i-text' || object.type === 'line') {
      setActiveStyle("stroke", hex, object);
    } else {
      object.setStroke(hex);
      setActiveStyle("stroke", hex, object);
    }
  } else {
    setActiveStyle("stroke", hex, canvas);
  }
}

/**
 * 
 */
function getOutlineWidth() {
  // var object = canvas.getActiveObject();
  // return object.getStrokeWidth();
  
  //return getActiveStyle("strokeWidth");
  var object = canvas.getActiveObject();

  if (object && object !== undefined) {
    //return object.getStrokeWidth();
    return object.get('strokeWidth');
  } else {
    return getActiveStyle("strokeWidth", canvas);
  }
}

/**
 * 
 * @param {*} value 
 */
function setOutlineWidth(value) {
  // var object = canvas.getActiveObject();
  // object.setStrokeWidth(parseInt(value));

  //setActiveStyle("strokeWidth", value);
  var object = canvas.getActiveObject();

  if (object && object !== undefined) {
    object.setStrokeWidth(value);
  } else {
    setActiveStyle("strokeWidth", value, canvas);
  }

  canvas.renderAll();
}

/**
 * 
 */
function getOutlineStyle() {
  var object = canvas.getActiveObject();

  var value = object.customOutlineStyle;
  if (value == undefined) {
    return "solid";
  } else {
    return value;
  }
}

/**
 * 
 * @param {*} value 
 */
function setOutlineStyle(value) {
  var object = canvas.getActiveObject();

  if (object.getStroke() == null) {
    object.setStroke(object.getFill());
  }

  var dashArray = [];
  switch (value) {
    case "dotted":
      dashArray = [3, 3];
      break;
    case "dashed":
      dashArray = [10, 10];
      break;
    case "solid":
      break;
    default:
      value = "solid";
      break;
  }

  object.setStrokeDashArray(dashArray);
  object.customOutlineStyle = value;
  canvas.renderAll();
}

/*
 * By default the coordinates of an object in a group are relative
 * to the group, but in an odd way. By default the origin x of the 
 * object is the left edge and the origin y is to the top edge. However
 * these values are relative to the center of the containing group. So
 * an object.left value of 1 means the left edge of the object is 1 unit
 * to the right of the center of the group. An object.left value of -1
 * means the left edge of the object is 1 unit to the left of the 
 * group center line. Very odd.
 * 
 * These relationships can be changed by changing the values of the 
 * group and object origin.
 * 
 */

 /**
  * Horizontally center the currently active group or object within the canvas
  */
function hCenterSelection() {
  var group = canvas.getActiveGroup();

  // Prioritize centering groups
  if (group && group !== undefined) {
    // Center the objects within the group
    var objects = group.getObjects();
    for (var i = 0; i < objects.length; i++) {
      objects[i].left = -(objects[i].width / 2.0);
    }

    // Center the group within the canvas
    canvas.centerObjectH(group);
    canvas.renderAll();
    return;
  }

  // Otherwise center active object within the canvas
  var object = canvas.getActiveObject();
  canvas.centerObjectH(object);
  canvas.renderAll();
}

/**
 * Vertically center the currently active group of object within the canvas
 */
function vCenterSelection() {
  var group = canvas.getActiveGroup();

  // Prioritize centering groups
  if (group && group !== undefined) {
    // Center the objects withing the group
    var objects = group.getObjects();
    for (var i = 0; i < objects.length; i++) {
      objects[i].top = -(objects[i].height / 2.0);
    }

    // Center the group within the canvas
    canvas.centerObjectV(group);
    canvas.renderAll();
    return;
  }

  // Otherwise center active object within the canvas
  var object = canvas.getActiveObject();
  canvas.centerObjectV(object);
  canvas.renderAll();
}

/**
 * 
 */
function getFontSize() {
  var px;
  var obj = canvas.getActiveObject();

  if (obj && obj != undefined) {
    px = getActiveStyle('fontSize');
  } else {
    px = getActiveStyle("fontSize", canvas);
  }

  return Math.round(px * (72/96));
}

/**
 * 
 * @param {*} value 
 */
function setFontSize(value) {
  var px = Math.round(value * (96/72));
  var obj = canvas.getActiveObject();

  if (obj && obj != undefined) {
    setActiveStyle('fontSize', px);
    canvas.renderAll();
  } else {
    setActiveStyle('fontSize', px, canvas);
  }
}

/**
 * 
 */
function getFont() {
  var fontFamily;
  var obj = canvas.getActiveObject();

  if (obj && obj != undefined) {
    fontFamily = obj.fontFamily;
    return fontFamily ? fontFamily.toLowerCase() : '';
  } else {
    fontFamily = getActiveStyle("fontFamily", canvas);
    return fontFamily ? fontFamily.toLowerCase() : '';
  }
}

/**
 * 
 * @param {*} font 
 */
function setFont(font) {
  var obj = canvas.getActiveObject();

  if (obj && obj != undefined) {
    obj.fontFamily = font.toLowerCase();
    canvas.renderAll();
  } else {
    setActiveStyle("fontFamily", font.toLowerCase(), canvas);
  }
}

/**
 * 
 */
function getTextAlign() {
  var obj = canvas.getActiveObject();
  // textAlign: left, center, right, justify
  if (obj !== undefined && (obj.type === 'i-text' || obj.type === 'text')) {
    return obj.getTextAlign();
  } else {
    return getActiveStyle("textAlign", canvas);
  }
}

/**
 * 
 * @param {*} value 
 */
function setTextAlign(value) {
  var obj = canvas.getActiveObject();

  value = value.toLowerCase();
  if (obj !== undefined && (obj.type === 'i-text' || obj.type === 'text')) {
    obj.setTextAlign(value);
    canvas.renderAll();
  } else {
    setActiveStyle("textAlign", value, canvas);
  }
}

/**
 * 
 */
function getTextSpacing() {
  var obj = canvas.getActiveObject();

  if (obj !== undefined && (obj.type === 'i-text' || obj.type === 'text')) {
    return obj.getLineHeight();
  } else {
    return getActiveStyle("lineHeight", canvas);
  }
}

/**
 * 
 * @param {*} value 
 */
function setTextSpacing(value) {
  var obj = canvas.getActiveObject();

  if (obj !== undefined && (obj.type === 'i-text' || obj.type === 'text')) {
    obj.setLineHeight(value);
    canvas.renderAll();
  } else {
    setActiveStyle("lineHeight", value, canvas);
  }
}

/**
 * 
 * @param {*} _color 
 * @param {*} _blur 
 * @param {*} _offsetX 
 * @param {*} _offsetY 
 * @param {*} object 
 */
function setShadow(_color, _blur, _offsetX, _offsetY, object) {
  object = object || canvas.getActiveObject();
  object.setShadow({
      color: _color,
      blur: _blur,
      offsetX: _offsetX,
      offsetY: _offsetY
  });
  canvas.renderAll();

  // Push the canvas state to history
  canvas.trigger("object:statechange");
}

/**
 * 
 * @param {*} color 
 * @param {*} object 
 */
function changeShadowColor(color, object) {
  object = object || canvas.getActiveObject();
  //var shadow = object.getShadow();
  var shadow = object.get('shadow');
  if (shadow === null) {
    return null;
  }
  setShadow(color, shadow.blur, shadow.offsetX, shadow.offsetY, object);
}

/**
 * 
 * @param {*} object 
 */
function clearShadow(object) {
  object = object || canvas.getActiveObject();
  object.setShadow(null);
  canvas.renderAll();

  // Push the canvas state to history
  canvas.trigger("object:statechange");
}

/**
 * 
 * @param {*} object 
 */
function isShadow(object) {
  object = object || canvas.getActiveObject();
  //var shadow = object.getShadow();
  var shadow = object.get('shadow');
  return (shadow !== null && (shadow.offsetX !== 0 || shadow.offsetY !== 0));
}

// Glow is just a shadow with an offset of zero
/**
 * 
 * @param {*} object 
 */
function isGlow(object) {
  object = object || canvas.getActiveObject();
  //var shadow = object.getShadow();
  var shadow = object.get('shadow');
  return (shadow !== null && shadow.offsetX === 0 && shadow.offsetY === 0);
}

/**
 * 
 * @param {*} object 
 */
function getShadowBlur(object) {
  object = object || canvas.getActiveObject();
  //var shadow = object.getShadow();
  var shadow = object.get('shadow');
  if (shadow === null) {
    return null;
  }

  return parseInt(shadow.blur);
}

/**
 * 
 * @param {*} object 
 */
function getShadowColor(object) {
  object = object || canvas.getActiveObject();
  //var shadow = object.getShadow();
  var shadow = object.get('shadow');
  if (shadow === null) {
    return null;
  }

  return shadow.color;
}

/**
 * 
 * @param {*} object 
 */
function getShadowOffset(object) {
  object = object || canvas.getActiveObject();
  //var shadow = object.getShadow();
  var shadow = object.get('shadow');
  if (shadow === null) {
    return null;
  }

  var x = parseInt(shadow.offsetX);
  var y = parseInt(shadow.offsetY);
  return {"x": x, "y": y};
}

/**
 * 
 * @param {*} left 
 * @param {*} top 
 */
function changeImageOffset(left, top) {
  var objs = canvas.getObjects();
  for (var i = 0; i < objs.length; i++) {
    objs[i].left += left;
    objs[i].top += top;
  }
}

/**
 * 
 */
function centerContent() {
  var bounds = getImageBounds(false);

  var canvasMidpointLeft = Math.round(canvas.width / 2);
  var canvasMidpointTop = Math.round(canvas.height / 2);
  var imageMidpointLeft = Math.round((bounds.width / 2) + bounds.left);
  var imageMidpointTop = Math.round((bounds.height / 2) + bounds.top);
  var diffLeft = canvasMidpointLeft - imageMidpointLeft;
  var diffTop = canvasMidpointTop - imageMidpointTop;

  changeImageOffset(diffLeft, diffTop);

  // Work around bug where you can't select objects after they have been added
  selectObjects();
//  canvas.deactivateAll();
  canvas.discardActiveObject();
  canvas.renderAll();
}

/**
 * Return the Ted type of the object if it has one, otherwise
 * return undefined.
 * 
 * @param {Object} obj - Fabric object to check
 */
function getTedType(obj) {
  var ted = obj.ted;
  return (ted === undefined) ? undefined : ted.type;
}

/**
 * UtilsModule constructor
 */
function UtilsModule() {
  if (!(this instanceof UtilsModule)) return new UtilsModule();
  // constructor
}

/*---- Exports ----*/
UtilsModule.prototype.addObjects = addObjects;
UtilsModule.prototype.selectObjects = selectObjects;
UtilsModule.prototype.hideObjects = hideObjects;
UtilsModule.prototype.showObjects = showObjects;
UtilsModule.prototype.deleteObjects = deleteObjects;
//UtilsModule.prototype.sendGroupBackward = sendGroupBackward;
//UtilsModule.prototype.sendGroupForward = sendGroupForward;
UtilsModule.prototype.exportFile = exportFile;
UtilsModule.prototype.getImageBounds = getImageBounds;
UtilsModule.prototype.deleteSelected = deleteSelected;
UtilsModule.prototype.insertSvg = insertSvg;
UtilsModule.prototype.insertSvgFromString = insertSvgFromString;
UtilsModule.prototype.insertImageFromData = insertImageFromData;
UtilsModule.prototype.bringToFront = bringToFront;
UtilsModule.prototype.sendToBack = sendToBack;
UtilsModule.prototype.sendBackward = sendBackward;
UtilsModule.prototype.bringForward = bringForward;
UtilsModule.prototype.clone = clone;
UtilsModule.prototype.getFillColor = getFillColor;
UtilsModule.prototype.setFillColor = setFillColor;
UtilsModule.prototype.getOutlineColor = getOutlineColor;
UtilsModule.prototype.setOutlineColor = setOutlineColor;
UtilsModule.prototype.getOutlineWidth = getOutlineWidth;
UtilsModule.prototype.setOutlineWidth = setOutlineWidth;
UtilsModule.prototype.getOutlineStyle = getOutlineStyle;
UtilsModule.prototype.setOutlineStyle = setOutlineStyle;
UtilsModule.prototype.hCenterSelection = hCenterSelection;
UtilsModule.prototype.vCenterSelection = vCenterSelection;
UtilsModule.prototype.getTextAlign = getTextAlign;
UtilsModule.prototype.setTextAlign = setTextAlign;
UtilsModule.prototype.getFontSize = getFontSize;
UtilsModule.prototype.setFontSize = setFontSize;
UtilsModule.prototype.getFont = getFont;
UtilsModule.prototype.setFont = setFont;
UtilsModule.prototype.getTextSpacing = getTextSpacing;
UtilsModule.prototype.setTextSpacing = setTextSpacing;
UtilsModule.prototype.setShadow = setShadow;
UtilsModule.prototype.clearShadow = clearShadow;
UtilsModule.prototype.isShadow = isShadow;
UtilsModule.prototype.isGlow = isGlow;
UtilsModule.prototype.getShadowBlur = getShadowBlur;
UtilsModule.prototype.getShadowOffset = getShadowOffset;
UtilsModule.prototype.changeShadowColor = changeShadowColor;
UtilsModule.prototype.getShadowColor = getShadowColor;
UtilsModule.prototype.centerContent = centerContent;
UtilsModule.prototype.readFromString = readFromString;
UtilsModule.prototype.readFromData = readFromData;
UtilsModule.prototype.getTedType = getTedType;

module.exports = UtilsModule;
