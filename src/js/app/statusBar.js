
/**
 * 
 * @param {String} area - area to show message ("left", "middle", "right")
 * @param {String} message - message to show
 */
function putStatus(area, message) {

}

/**
 * 
 * @param {String} area - area to clear ("left", "middle", "right")
 */
function clearStatus(area) {

}

/* ----- exports ----- */

function StatusBarModule() {
  if (!(this instanceof StatusBarModule)) return new StatusBarModule();
  // constructor
}

StatusBarModule.prototype.putStatus = putStatus;
StatusBarModule.prototype.clearStatus = clearStatus;

module.exports = StatusBarModule;
