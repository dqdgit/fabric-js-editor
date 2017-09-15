
/**
 * List of available SVG metadata keys
 */
var keys = [
  "title",
  "date",
  "creator",
  "rights",
  "publisher",
  "identifier",
  "source",
  "relation",
  "language",
  "keywords",
  "coverage",
  "description",
  "contributors"
];

/**
 * Convert the keyword properties to SVG XML
 */
function toXML() {
  // TODO: Implement
  return "";
}

/**
 * Convert the SVG XML metadata to keyword properties
 * 
 * @param {String} xml 
 */
function parseXML(xml) {
  // TODO: Implement
}

/* ----- exports ----- */

/**
 * Constructor for the metadata CommonJS module
 * 
 * @param {Object} metadata - Object containing metadata key/value pairs
 */
function MetadataModule(metadata) {
  if (!(this instanceof MetadataModule)) return new MetadataModule();

  for (var i = 0; i < keys.length; i++) {
    var prop = keys[i];
    if (metadata && metadata.hasOwnProperty(prop)) {
      this[prop] = metadata[prop];
    } else {
      this[prop] = "";
    }
  }
}

MetadataModule.prototype.toXML = toXML;
MetadataModule.prototype.parseXML = parseXML;

module.exports = MetadataModule;

