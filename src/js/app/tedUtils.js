/**
 * TED application utilities module
 * 
 * @module ./tedUtils.js
 */

"use strict";

// Third party modules
var uuid = require('uuid4');

// Application globals
var canvas = global.canvas;

// Module globals
var _tedObjects = {};     // Map of TED objects using the UUID as the key
var _editing = {          // Keep info for object currently being edited
  active: false,
  ted: undefined,
  obj: undefined  
};


/**
 * Return true if the given Fabric object is a TED object
 * 
 * @param {Object} obj - Fabric object
 */
function isTed(obj) {
  return (obj.ted) ? true : false;
}

/**
 * Return the TED properties of the given Fabric object
 * if it has them. Otherwise return undefined.
 * 
 * @param {Object} obj - Fabric object
 */
function getTed(obj) {
  if (!isTed(obj)) return undefined;

  return obj.ted;
}

function setModified(obj) {
  if (!isTed(obj)) return;

  obj.ted.modified = true;
}

/**
 * Return a new TED object ID
 */
function newId() {
  return uuid();
}

/**
 * Add a TED object to the list of managed objects
 * 
 * @param {Object} tedObj - the TED object to add
 */
function addTedObject(tedObj) {
 // _tedObjects.push(tedObj);
  _tedObjects[tedObj.id] = tedObj;
}

/**
 * Return the TED object with the given TED ID
 * 
 * @param {String} tedId - a TED ID
 */
function findTedById(tedId) {
  // var tedObj = _tedObjects.find(function (item) {
  //   return item.id === tedId;
  // });

  // return tedObj;
  return _tedObjects[tedId];
}

/**
 * Return the Fabric object with the given TED ID
 * 
 * @param {String} tedId - a TED ID
 */
function findById(tedId) {
  var objs = canvas.getObjects();

  for (var i = 0; i < objs.length; i++) {
    if (isTed(objs[i])) {
      if (objs[i].ted.id && objs[i].ted.id === tedId) return objs[i];
    }
  }
  
  return undefined;
}

/**
 * Return the value of the given TED property on the 
 * specified Fabric object. Return undefined if
 * the property is not found.
 * 
 * @param {Object} obj - a Fabric object
 * @param {String} tedName - name of a TED property
 */
function tedGet(obj, tedName) {
  if (!isTed(obj)) return undefined;

  return (obj.ted[tedName]) ? obj.ted[tedName] : undefined;
}

/**
 * Return true if the given Fabric object is an editable TED object
 * 
 * @param {Object} obj - Fabric object
 */
function isEditable(obj) {
  if (!isTed(obj)) return false;

  var editable = tedGet(obj, "editable");
  return (editable) ? true : false;
}

/**
 * Return true if the given Fabric object has the TED
 * property "modified" and it's value is true.
 * 
 * @param {Object} obj - Fabric object
 */
function isModified(obj) {
  if (!isTed(obj)) return false;

  var modified = tedGet(obj, "modified");
  return (modified) ? true : false;
}

/**
 * Return true if the given Fabric object is TED container
 * 
 * @param {Object} obj - Fabric object
 */
function isContainer(obj) {
  if (!isTed(obj)) return false;

  //return (obj.ted.type == "table-background") ? true : false;
  return (obj.ted.container) ? true : false;
}

/**
 * Return true if the given Fabric object is part of TED
 * composite object like Table.
 * 
 * @param {Object} obj - Fabric object
 */
function isContained(obj) {
  if (!isTed(obj)) return false;

  //return (obj.ted.type == "table-background") ? true : false;
  return (obj.ted.containerId) ? true : false;
}

/**
 * If the given Fabric object is part of a TED composite 
 * object then make the entire composite object the Fabric
 * ActiveObject (i.e. ActiveSelection)
 * 
 * @param {Object} obj - Fabric object
 */
function setActiveContainer(obj) {
  var containerId, tedObj;

  if (!isContained(obj)) return;

  // TODO: Make this more robust. Maybe use a property to contain the function?
  containerId = tedGet(obj, "containerId");
  if (containerId) {
    tedObj = findTedById(containerId);
    if (tedObj) {
      canvas.discardActiveObject();
      tedObj.setAsActiveObject();
    }
  }
}

/**
 * Enable editing mode for the given TED object
 * 
 * @param {Object} obj - Fabric object
 */
function startEditing(obj) {
  global.console.log("**** startEditing: " + isEditable(obj));
  if (!isEditable(obj)) return;

  _editing.active = true;
  _editing.ted = obj.ted;
  _editing.obj = findTedById(obj.ted.id);
  // TODO: Maybe use a ted property for the function instead
  if (_editing.obj) _editing.obj.editStart();
}

/**
 * Disable editing mode for TED object currently being edited
 */
function stopEditing() {
  global.console.log("**** stopEditing: " + _editing.active);
  var tedObj;

  if (!_editing.active) return;

  // Editing mode has to be deactivated first to avoid an infinite loop.
  tedObj = _editing.obj;
  _editing.active = false;
  _editing.ted = undefined;
  _editing.obj = undefined;

  // TODO: Maybe use a ted property for the function instead
  tedObj.editEnd();
}

/**
 * Return true if the edit mode is enabled
 */
function isEditing() {
  return (_editing.active) ? _editing.obj : null;
}

/**
 * Return the TED object that is currently being edited
 */
function getEditingObject() {
  return (_editing.active) ? _editing.obj : null;
}

/**
 * Return true if the x, y of the given mouse event is
 * within the bounding box of the TED object currently
 * being edited. This is only valid for TED objects.
 * 
 * @param {Object} e - Fabric mouse event
 */
function inEditingObject(e) {
  if (!_editing.active) return false;

  var isHit = _editing.obj.isHit(e.e.clientX, e.e.clientY);
  //global.console.log("**** inEditingObject: isHit=" + isHit);
  return isHit;
}

/**
 * TED utilities module constructor
 */
function TedUtilsModule() {
  if (!(this instanceof TedUtilsModule)) return new TedUtilsModule();
}

// Exports
TedUtilsModule.prototype.isTed = isTed;
TedUtilsModule.prototype.getTed = getTed;
TedUtilsModule.prototype.setModified = setModified;
TedUtilsModule.prototype.newId = newId;
TedUtilsModule.prototype.addTedObject = addTedObject;
TedUtilsModule.prototype.findTedById = findTedById;
TedUtilsModule.prototype.findById = findById;
TedUtilsModule.prototype.tedGet = tedGet;
TedUtilsModule.prototype.isEditable = isEditable;
TedUtilsModule.prototype.isModified = isModified;
TedUtilsModule.prototype.isContainer = isContainer;
TedUtilsModule.prototype.isContained = isContained;
TedUtilsModule.prototype.setActiveContainer = setActiveContainer;
TedUtilsModule.prototype.startEditing = startEditing;
TedUtilsModule.prototype.stopEditing = stopEditing;
TedUtilsModule.prototype.isEditing = isEditing;
TedUtilsModule.prototype.getEditingObject = getEditingObject;
TedUtilsModule.prototype.inEditingObject = inEditingObject;

module.exports = TedUtilsModule;
