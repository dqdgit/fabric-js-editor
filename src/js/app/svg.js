
//require('jquery');

var utils = new (require('./fabricUtils.js'))();

var OSB_NS = "http://www.openswatchbook.org/uri/2009/osb";
var DC_NS = "http://purl.org/dc/elements/1.1/";
var CC_NS = "http://creativecommons.org/ns#";
var RDF_NS = "http://www.w3.org/1999/02/22-rdf-syntax-ns#";
var SVG_NS = "http://www.w3.org/2000/svg";


function xmlFromCanvas(canvas) {
  var bounds = getImageBounds(true);
  var data = canvas.toSVG({
    viewBox: {
      x: bounds.left,
      y: bounds.top,
      width: bounds.width,
      height: bounds.height
    },
    width: bounds.width.toString() + "px",
    height: bounds.height.toString() + "px"
  });

  var parser = new DOMParser();
  var xmlDoc = parser.parseFromString(data, "text/xml");
  return xmlDoc;
}

function addNamespace(node, ns, uri) {
  if (!node.hasAttributeNS("xmlns", uri)) {
    node.setAttributeNS("xmlns", ns, uri);
  }
}

function addNamespaces(xmlDoc) {
  var svgNode = xmlDoc.getElementsByTagName("svg")[0];

  addNamespace(svgNode, "osb", OSB_NS);
  addNamespace(svgNode, "dc", DC_NS);
  addNamespace(svgNode, "cc", CC_NS);
  addNamespace(svgNode, "rdf", RDF_NS);
  addNamespace(svgNode, "svg", SVG_NS);

  return xmlDoc;
}

function addMetadata(xmlDoc, metadata) {
  return xmlDoc;
}

function insertMetadata(xmlDoc, metadata) {
  // Add namespaces if needed
  addNamespaces(xmlDoc);

  // Add/Update metadata section
  addMetadata(xmlDoc, metadata);

  return xmlDoc;
}

/* ----- Exports ----- */

function SvgModule() {
  if (!(this instanceof SvgModule)) return new SvgModule();
}

SvgModule.prototype.xmlFromCanvas = xmlFromCanvas;
SvgModule.prototype.insertMetadata = insertMetadata;

module.exports = SvgModule;
