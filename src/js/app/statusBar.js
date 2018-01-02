var canvas = global.canvas;


/**
 * 
 * @param {String} area - area to show message ("left", "middle", "right")
 * @param {String} message - message to show
 */
function putStatus(area, message) {
  var statusArea;
  switch (area) {
    case 'left':
      statusArea = $("#ted-status-left");
      break;

    case 'middle':
      statusArea = $("#ted-status-middle");
      break;

    case 'right':
      statusArea = $("#ted-status-right");
      break;

    default:
      statusArea = $("#ted-status-left");
  }

  statusArea.text(message);
}

/**
 * 
 * @param {String} area - area to clear ("left", "middle", "right")
 */
function clearStatus(area) {
  putStatus(area, "");
}

function updateMode(mode) {
  putStatus('left', "Mode: " + mode);
}

function updateInfo() {
  var activeObj = canvas.getActiveObject();
  var msg;

  if (activeObj === undefined) {
    msg = "No active object";
  } else {
    var type = activeObj.get('type');
    var x1, y1, x2, y2;
    x1 = activeObj.left;
    y1 = activeObj.top;
    x2 = x1 + activeObj.width;
    y2 = y1 + activeObj.height;
    msg = type.charAt(0).toUpperCase() + type.slice(1) + ": " +
          x1 + ", " +
          y1 + ", " +
          x2 + ", " +
          y2;
  }
  putStatus('middle', msg);
}

function updateCounts() {
  var nObjs = canvas.size();
  var msg;
  var nSelected;
  var activeObj = canvas.getActiveObject();

  if (activeObj === undefined) {
    nSelected = 0;
  } else {
    nSelected = (activeObj.type === 'activeSelection') ? activeObj.size() : 1;
  }
  
  msg = "Objects: " + nObjs + ", Selected: " + nSelected;
  putStatus('right', msg);
}

function putError(message) {
  putStatus('left', message);
}

/**
 * Module constructor
 */
function StatusBarModule() {
  if (!(this instanceof StatusBarModule)) return new StatusBarModule();
}

/*---- Exports ----*/
StatusBarModule.prototype.putStatus = putStatus;
StatusBarModule.prototype.clearStatus = clearStatus;
StatusBarModule.prototype.updateMode = updateMode;
StatusBarModule.prototype.updateInfo = updateInfo;
StatusBarModule.prototype.updateCounts = updateCounts;

module.exports = StatusBarModule;
