// table.js
// 
// Implementation of the table "class"
//
/**
 * Table module
 * 
 * @module ./table.js
 */
"use strict";

// Application globals
var canvas = global.canvas;

// Application modules
var utils = new (require('./fabricUtils.js'))();
var tedUtils = new(require('./tedUtils.js'))();


/**
 * Cell constructor
 * 
 * @constructor
 * @param {Object} table - the Table containing the cells
 * @param {Number} row - the row of this cell
 * @param {Number} col  - the column of this cell
 * @param {Object} options - object containing options to apply
 */
function Cell(table, row, col, options) {
  this.row = row;
  this.col = col;
  this.width = 'width' in options ? options.width : 0;
  this.height = 'height' in options ? options.height : 0;
  this.id = tedUtils.newId();

  // Create the cell background
  // TODO
  //fill: 'backgroundColor' in options ? options.backgroundColor : table.backgroundColor,

  // Create the cell content
  //TODO
}

/**
 * Return an array containing all the objects for this cell.
 */
Cell.prototype.getObjects = function () {
  // TODO
  return [];
};

/**
 * Update the width of a cell
 * 
 * @param {Number} width - optional new width
 */
Cell.prototype.setWidth = function (width) {
  // TODO: Do some bounds checking?
  this.width = width;
};

/**
 * Update the height of a Cell.
 * 
 * @param {Number} height - optional new height
 */
Cell.prototype.setHeight = function (height) {
  // TODO: Do some bounds checking?
  this.height = height;
};

/**
 * Edge constructor. Create the Edge object and associated Fabric line.
 * 
 * @param {Number} x1 - the starting x value
 * @param {Number} y1 - the starting y value
 * @param {Number} x2 - the ending x value
 * @param {Number} y2 - the ending y value
 * @param {Object} options - object containing options to apply
 */
function Edge(x1, y1, x2, y2, options) {
  this.x1 = x1;
  this.y1 = y1;
  this.x2 = x2;
  this.y2 = y2;
  this.id = tedUtils.newId();
  options.ted.id = this.id;

  this.obj = new fabric.Line([this.x1, this.y1, this.x2, this.y2], options);
}

/**
 * Update the postion on the X axis for an edge.
 * 
 * @param {Number} x - new x value for the Edge
 */
Edge.prototype.setX = function (x) {
  // Update Edge properties
  this.x1 = x;
  this.x2 = x;
  // Update the Fabric object
  this.obj.set({ x1: this.x1, x2: this.x2 });
};

/**
 * Update the position on the Y axis for an edge.
 * 
 * @param {Number} y - new y value for the Edge
 */
Edge.prototype.setY = function (y) {
  // Update the Edge properties
  this.y1 = y;
  this.y2 = y;
  // Update the Fabric object
  this.obj.set({ y1: this.y1, y2: this.y2 });
};

/**
 * Table constructor
 * 
 * @param {Number} nRows - the number of rows in the table
 * @param {Number} nCols  - the number of columns in the table
 */
function Table(nRows, nCols) {
  this.nRows = nRows;
  this.nCols = nCols;
  this.top = 0;
  this.left = 0;
  this.width = 200;
  this.height = 200;
  this.borderWidth = 1;
  this.borderColor = "#757575";
  this.backgroundColor = "#FFFFFF";
  this.dividerWidth = 2;
  this.dividerColor = "#000000";
  this.id = tedUtils.newId();
}

/**
 * Return the bounding box of the specified cell
 * 
 * @param {Number} row - row index of the cell
 * @param {Number} col - column index of the cell
 */
Table.prototype.getCellRect = function(row, col) {
  var x = this.left;
  var y = this.top;
  
  // TODO: Use slice and reduce?
  for (var c = 0; c < col; c++) {
    x += this.cells[row][c].width;
  }

  // TODO: Use slice and reduce?
  for (var r = 0; r < row; r++) {
    y += this.cells[r][col].height;
  }

  return {
    x1: x,
    y1: y,
    x2: x + this.cells[row][col].width,
    y2: y + this.cells[row][col].height
  };
};

/**
 * Return the bounding box of the specified column
 * 
 * @param {Number} col - index of the column to return
 */
Table.prototype.getColRect = function(col) {
  var cellRect = this.getCellRect(0, col);
  return {
    x1: cellRect.x1,
    y1: cellRect.y1,
    x2: cellRect.x2,
    y2: cellRect.y1 + this.height
  };
};

/**
 * Return the bounding box of the specified row
 * 
 * @param {Number} row  - index of the row to return
 */
Table.prototype.getRowRect = function(row) {
  var cellRect = this.getCellRect(row, 0);
  return {
    x1: cellRect.x1,
    y1: cellRect.y1,
    x2: cellRect.x1 + this.width,
    y2: cellRect.y2
  };
};

/**
 * Return an array containing just the column dividers
 * for this table. Column dividers are the interior 
 * borders that separage adjacent columns.
 */
Table.prototype._createColDividers = function() {
  var rect;
  var dividers = [];
  var options = {
    stroke: this.dividerColor,
    strokeWidth: this.dividerWidth,
    //selectable: false,
    perPixelTargetFind: true,
    padding: 6,
    hoverCursor: 'col-resize',
    lockMovementY: true,
    hasBorders: false,
    hasControls: false,
    ted: {
      type: 'table-column-divider',
      tableId: this.id,
      index: undefined
    }
  };

  for (var c = 0; c < this.nCols - 1; c++) {
    rect = this.getColRect(c);
    // Use the right edge of the column
    options.ted.index = c;
    dividers.push(new fabric.Line([rect.x2, rect.y1, rect.x2, rect.y2], options));
  }

  return dividers;
};

/**
 * Update the width of the column specified by the colNum 
 * parameter. If the specified column has an adjacent column
 * to the right, it's width is also changed.
 * 
 * @param {Number} col - the index of the column to change
 * @param {Number} newX - the new X position of the column
 */
Table.prototype.updateColWidth = function(col, newX) {
  var c1 = col;                        // Left cell column index
  var c2 = col + 1;                    // Right cell column index
  var rect1 = this.getCellRect(0, c1); // First left cell rect
  var rect2 = this.getCellRect(0, c2); // First right cell rect
  var w1 = newX - rect1.x1;            // New width for left cells
  var w2 = rect2.x2 - newX;            // New width for right cells
  var ec = 2 * col + 2;                // Edge column index
  var r;                               // Counter

  // Adjust the width of the affected cells. 
  // The affected cells are the specified
  // one and the adjacent one to the right 
  for (r = 0; r < this.nRows; r++) {
    // Update cell[r][c] - the cell on the left
    this.cells[r][c1].setWidth(w1);

    // Update cell[r][c+1] - the cell on the right
    this.cells[r][c2].setWidth(w2);
  }

  // Adjust the affected edges. Edges are shared by
  // adjacent cells so only one edge needs adjustment
  // per row. Only process edges with vertical edges.
  for (r = 1; r < this.edges.length - 1; r += 2) {
    this.edges[r][ec].setX(newX);
  }
};

/**
 * Return an array containing just
 */
Table.prototype._createRowDividers = function() {
  var rect;
  var dividers = [];
  var options = {
    stroke: this.dividerColor,
    strokeWidth: this.dividerWidth,
    //selectable: false,
    perPixelTargetFind: true,
    padding: 6,
    hoverCursor: 'row-resize',
    lockMovementX: true, 
    hasBorders: false,   
    hasControls: false,
    ted: {
      type: 'table-row-divider',
      tableId: this.id,
      index: undefined
    }
  };

  for (var r = 0; r < this.nRows - 1; r++) {
    rect = this.getRowRect(r);
    // Use the bottom edge of the row
    options.ted.index = r;
    dividers.push(new fabric.Line([rect.x1,rect.y2,rect.x2, rect.y2], options));
  }

  return dividers;
};

Table.prototype.updateRowHeight = function (row, newY) {
  var r1 = row;
  var r2 = row + 1;
  var rect1 = this.getRowRect(r1, 0);
  var rect2 = this.getRowRect(r2, 0);
  var h1 = newY - rect1.y1;
  var h2 = rect2.y2 = newY;
  var er = 2 * row + 2;
  var c;

  for (c = 0; c < this.nCols; c++) {
    this.cells[r1][c].setHeight(h1);
    this.cells[r2][c].setHeight(h1);
  }

  for (c = 1; c < this.edges[er].length - 1; c += 2) {
    this.edges[er][c].setY(newY);
  }
};

/**
 * 
 */
Table.prototype._updateEdges = function () {
  // Update any columns whose size has changed
  var table = this;

  if (this.colDividers) {
    this.colDividers.forEach(function(divider) {
      // If the column divider has been modified update the columns
      if (divider.ted.modified) {
        table.updateColWidth(divider.ted.index, divider.left);
        divider.ted.modified = false;
      }
    });
  }

  // Update any rows whose size has changed
  if (this.rowDividers) {
    this.rowDividers.forEach(function(divider) {
      // If the row divider has been modified update the rows
      if (divider.ted.modified) {
        table.updateRowHeight(divider.ted.index, divider.top);
        divider.ted.modified = false;
      }
    });
  }
};

/**
 * Make this table the active object. If an array of objects
 * is provided use them to create the active object, otherwise
 * use all the objects in the table. The objs parameter is
 * provided so that the same method can be used by the
 * createTable method without having to gather all the
 * table options again.
 * 
 * @param {Array} objs - optional array of objects
 */
Table.prototype.setAsActiveObject = function (objs) {
  global.console.log("**** Table.prototype.setAsActiveObject");
  if (objs === undefined) {
    objs = this.getObjects();
  }
  var activeObject = utils.selectObjects(objs);
  activeObject.set("ted", { type: "table", id: this.id, editable: true, container: true });
};

/**
 * Return true if the given point is inside this table's 
 * bounding box. If not return false.
 * 
 * @param {Number} x - x coordinate in client space
 * @param {Number} y - y coordinae in client space
 */
Table.prototype.isHit = function(x, y) {
  var pt = new fabric.Point(x, y);
  return this.background.containsPoint(pt, null, true);
};

/**
 * Create a new table of the specified size and add it to the
 * array of tables.
 * 
 * @param {Number} nRows - number of rows in the new table
 * @param {Number} nCols - number of columns in the new table
 */
Table.newTable = function(nRows, nCols) {
  var table = new Table(nRows, nCols);
  // Use the mouse to determine the initial 
  // width and height of the table.
  table.sweep();

  // Add the table to the list of TED objects
  //_tables.push(table);
  tedUtils.addTedObject(table);

  return table;
};

/**
 * Return an array containing only the interior edges of
 * this table. Interior edges are all the ones which
 * are not part of the table's outer border.
 */
Table.prototype._getInnerObjects = function () {
  var objs = [];
  var lastCol;
  var firstCol;

  for (var r = 1; r < this.edges.length - 1; r++) {
    // Horizontal and vertical edge rows need to be scanned differently
    if (r % 2) {
      // Odd row
      firstCol = 2;
      lastCol = this.edges[r].length - 2;
    } else {
      // Even row
      firstCol = 1;
      lastCol = this.edges[r].length - 1;
    }

    for (var c = firstCol; c < lastCol; c++) {
      if (this.edges[r][c] !== null) {
        objs.push(this.edges[r][c].obj);
      }
    }
  }

  return objs;
};

/**
 * Return an array containing all the Fabric objects of a Table
 */
Table.prototype.getObjects = function() {
  var objs = [];
  var r, c;

  // Get the table background object
  objs.push(this.background);

  // Get table cell objects
  //
  // Note: Apparently the push.apply method is limited to
  // about 150,000 items, but these tables are small
  // and this method keeps lint happy.
  for (r = 0; r < this.nRows; r++) {
    for (c = 0; c < this.nCols; c++) {
      Array.prototype.push.apply(objs, this.cells[r][c].getObjects());
    }
  }

  // Get the table border edge objects
  for (r = 0; r < this.edges.length; r++) {
    for (c = 0; c < this.edges[r].length; c++) {
      if (this.edges[r][c] !== null) {
        objs.push(this.edges[r][c].obj);
      }
    }
  }

  return objs;
};

/**
 * Create the Cells for a Table
 */
Table.prototype._createCells = function() {
  var options = {
    width: this.width / this.nRows,
    height: this.height / this.nCols
  };

  // Create a two dimensional array for the table cells
  this.cells = new Array(this.nRows);
  for (var r = 0; r < this.nRows; r++) {
    this.cells[r] = new Array(this.nCols);
    for (var c = 0; c < this.nCols; c++) {
      this.cells[r][c] = new Cell(this, r, c, options);
    }
  }
};

/**
 * Create the background for a Table. The background includes both
 * the border and the filled rectangle. The background is used for
 * selection.
 */
Table.prototype._createBackground = function() {
  this.background = new fabric.Rect({
    top: this.top,
    left: this.left,
    width: this.width,
    height: this.height,
    fill: this.backgroundColor,
    stroke: this.borderColor,
    strokeWidth: 0,
    ted: {
      type: 'table-background',
      editable: true,
      containerId: this.id,
      tableId: this.id,
    }
  });
};

/**
 * Return a matrix of border edges for the associated table.
 * The matrix contains both the outer and inner (interior) edges
 * for the associated table.
 * 
 * Structure of the edges matrix. Even numbered rows
 * contain the horizontal edges. Odd numbered rows contain
 * the vertical edges.
 *
 *     0 1 2 3 4 5 6
 *  0: n - n - n - n
 *  1: | n | n | n |
 *  2: n - n - n - n
 *  3: | n | n | n |
 *  4: n - n - n - n
 *  5: | n | n | n |
 *  6: n - n - n - n
 * 
 * @param {Object} options - options to apply to all the edges
 */
Table.prototype._createEdges = function (options) {
  var nRows = (2 * this.nRows) + 1;
  var nCols = (2 * this.nCols) + 1;
  var rect;
  var r, er, ec;

  // Allocate the edge arrays.
  //
  // Even rows contain horizontal edges
  // Odd rows contain vertical edges
  var edges = new Array(nRows);
  for (r = 0; r < nRows; r++) {
    edges[r] = new Array(nCols).fill(null);
  }

  // Create the edges
  for (r = 0; r < this.nRows; r++) {
    er = 2 * r + 1;
    for (var c = 0; c < this.nCols; c++) {
      ec = 2 * c + 1;
      rect = this.getCellRect(r, c);
      // Create the top horizontal edge
      edges[er - 1][ec] = new Edge(rect.x1, rect.y1, rect.x2, rect.y1, options);
      // Create the left vertical edge
      edges[er][ec - 1] = new Edge(rect.x1, rect.y1, rect.x1, rect.y2, options);

      // For the right most cell in a row add the right vertical edge
      if (c == this.nCols - 1) {
        edges[er][ec + 1] = new Edge(rect.x2, rect.y1, rect.x2, rect.y2, options);
      }

      // For the bottom row of cells add the bottom horizontal edge
      if (r == this.nRows - 1) {
        edges[er + 1][ec] = new Edge(rect.x1, rect.y2, rect.x2, rect.y2, options);
      }
    }
  }

  return edges;
};

/**
 * Create the set of border edges for the table. Edges are
 * both the inner and outer edges for the given table. Outer
 * edges are the borders for the perimeter of the table. Inner
 * edges are the borders for the table cells which are not
 * perimeter edges. Some edges are shared by two adjacent cells.
 */
Table.prototype._createBorders = function() {
  var options = {
    stroke: this.borderColor,
    strokeWidth: this.borderWidth,
    fill: this.borderColor,
    opacity: 1,
    selectable: true,
    perPixelTargetFind: true,
    targetFindTolerance: 6,
    ted: {
      id: undefined,
      type: 'table-border',
      tableId: this.id,
    }
  };

  // Create the matrix of edges
  this.edges = this._createEdges(options);
};

/**
 * Create all Table elements and add it's Fabric
 * objects to the canvas.
 */
Table.prototype.createTable = function() {
  // Create all the table elements
  this._createBackground();
  this._createCells();
  this._createBorders();

  // Add the objects to the canvas and render
  var objs = this.getObjects();
  utils.addObjects(objs);
  this.setAsActiveObject(objs);
  canvas.renderAll();
};

/**
 * Begin edit mode on this table.
 */
Table.prototype.editStart = function() {
  global.console.log("**** Table.prototype.editStart");

  // Change the color of the selection
  // var activeObj = canvas.getActiveObject();
  // activeObj.ted.editing = true;
  // var objs = activeObj.getObjects();
  // objs.forEach(function(obj) {
  //   obj.set({
  //     cornerColor: '#FF0000',
  //     hasBorders: false,
  //   });
  // });

  // Discard the selection while editing
  canvas.discardActiveObject();
  this.background.set({ hasBorders: true, borderColor: '#00FF00' });

  // Get the interior edge objects so that we can hide them
  this.innerObjects = this._getInnerObjects();

  // Get the row and column divider lines
  this.colDividers = this._createColDividers();
  this.rowDividers = this._createRowDividers();

  // Hide the interior edges and display the dividers
  utils.hideObjects(this.innerObjects);
  utils.addObjects(this.colDividers);
  utils.addObjects(this.rowDividers);

  canvas.renderAll();
};

/**
 * End edit mode on this table.
 */
Table.prototype.editEnd = function() {
  global.console.log("**** Table.prototype.editEnd");
  // Discard the active object
  canvas.discardActiveObject();

  // Update the table border edges
  this._updateEdges();

  // Delete the dividers
  utils.deleteObjects(this.colDividers);
  utils.deleteObjects(this.rowDividers);
  this.colDividers = undefined;
  this.rowDividers = undefined;

  // Display the inner objects
  utils.showObjects(this.innerObjects);
  this.innerObjects = undefined;

  canvas.renderAll();
};

/**
 * Use the mouse ot interactively "sweep" out the width and 
 * height of the table.
 */
Table.prototype.sweep = function() {
  // Interactively draw a rectangle
  _sweepRect(function(obj) {
    // Copy the necessary data from the creation rectangle
    this.top = Math.round(obj.top);
    this.left = Math.round(obj.left);
    this.width = Math.round(obj.width);
    this.height = Math.round(obj.height);

    // Delete the creation rectangle, it will be replaced
    canvas.remove(obj);

    // Create the table
    this.createTable();
  }.bind(this));
};

/**
 * Helper function that uses the mouse to sweep out a temporary
 * rectangle that will be used to set the width and height
 * of a Table.
 * 
 * @param {Function} callback  - function to call when the sweep is completed
 */
function _sweepRect(callback) {
  var isMouseDown = false;
  var drawnObj;

  // Disable group selection
  canvas.set("selection", false);

  // Event handler to begin drawing an object
  function __sweepMouseDown(o) {
    // Unregister escape key handler
    //$(document).unbind("keyup", escHandler);

    isMouseDown = true;
    var pointer = canvas.getPointer(o.e);

    drawnObj = new fabric.Rect({
      width: 0,
      height: 0,
      top: pointer.y,
      left: pointer.x,
      fill: 'rgba(0, 0, 0, 0)',
      stroke: '#757575',
      strokeWidth: 1
    });

    canvas.add(drawnObj);
  }

  // Mouse move event handler for drawing an object
  function __sweepMouseMove(o) {
    if (!isMouseDown) return;

    var shift = o.e.shiftKey;
    var pointer = canvas.getPointer(o.e);

    var newWidth = (drawnObj.left - pointer.x) * -1;
    var newHeight = (drawnObj.top - pointer.y) * -1;
    drawnObj.set({ width: newWidth, height: newHeight });

    canvas.renderAll();
  }

  // Event handler for end drawing of an object
  function __sweepMouseUp(o) {
    isMouseDown = false;

    // Fix upside-down square
    if (drawnObj.width < 0) {
      var newLeft = drawnObj.left + drawnObj.width;
      var newWidth = Math.abs(drawnObj.width);
      drawnObj.set({ left: newLeft, width: newWidth });
    }

    if (drawnObj.height < 0) {
      var newTop = drawnObj.top + drawnObj.height;
      var newHeight = Math.abs(drawnObj.height);
      drawnObj.set({ top: newTop, height: newHeight });
    }

    // Pass back the object if it's not tiny
    if (drawnObj.height !== 0 || drawnObj.width !== 0) {
      canvas.defaultCursor = 'auto';

      // Reset the event handlers
      canvas.off('mouse:down', __sweepMouseDown);
      canvas.off('mouse:move', __sweepMouseMove);
      canvas.off('mouse:up', __sweepMouseUp);
      //canvas.trigger('ted:listeners:reset');

      canvas.set("selection", true);

      // Push the canvas state to history
      //canvas.trigger("object:statechange");

      // Pass the rectangle back to the table
      callback(drawnObj);
    } else {
      canvas.remove(drawnObj);
    }
  }

  // Set the event handlers
  canvas.on('mouse:down', __sweepMouseDown);
  canvas.on('mouse:move', __sweepMouseMove);
  canvas.on('mouse:up', __sweepMouseUp);
}

// Exports
module.exports = Table;