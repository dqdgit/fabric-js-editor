"use strict";

var canvas = global.canvas;

// DQD
//require('../lib/jquery.ui.position.min.js');
//require('../lib/jquery.contextMenu.min.js');
//require('../lib/jquery.tooltipster.min.js');
require('jquery');
require('jquery-ui');
require('jquery-contextmenu');
require('spectrum-colorpicker');
require('material-design-lite');
require('dialog-polyfill');


var config = require('./config.js');
var utils = new (require('./fabricUtils.js'))();
var page = new (require('./page.js'))();
var drawing = new (require('./drawing.js'))();
var text = new (require('./text.js'))();
var fetchApi = new (require('./fetchApi.js'))();
var importExport = new (require('./importExport.js'))();
var isAppLoading = true;

/**
 * Initialize the editor state cache
 */
var state = new (require('./state.js'))(
  function() {
    // get state
    return JSON.stringify(canvas);
  },
  function(newState) {
    // set state
    canvas.clear();
    canvas.loadFromJSON(newState);
    canvas.renderAll();
  }
);

/**
 * Handler for the delete and backspace keys
 */
function deleteHandler() {
  // Handler for the delete and backspace keys
  $(document).keyup(function(e) {
    if(e.which == 46 || e.which == 8) {
      // Block the functionality if user is entering text
      var active = $(document.activeElement);
      if (active.is('input,textarea,text,password,file,email,search,tel,date')) {
        return;
      }

      utils.deleteSelected();
      e.preventDefault();
    }
  });
}

/**
 * Initialize the right click context menu and event handlers
 */
function rightClick() {
  // Setup right-click context menu
  $.contextMenu({
    selector: '#content',
    trigger: 'right',
    animation: { duration: 0 },
    callback: function(itemKey, opt){
      if (itemKey === "delete") {
        utils.deleteSelected();
      } else if (itemKey === "forward") {
        utils.sendForward();
      } else if (itemKey === "front") {
        utils.sendToFront();
      } else if (itemKey === "backward") {
        utils.sendBackward();
      } else if (itemKey === "back") {
        utils.sendToBack();
      } else if (itemKey === "clone") {
        utils.clone();
      }
    },
    items: {
      "forward": {name: "Bring Forward"},
      "front": {name: "Bring to Front"},
      "backward": {name: "Send Backward"},
      "back": {name: "Send to Back"},
      "sep1": "---------",
      "clone": {name: "Clone"},
      "sep2": "---------",
      "delete": {name: "Delete"}
    }
  });

  // Bind right-click menu
  $('#content').bind('contextmenu.custom', function (e) {
    var target = canvas.findTarget(e.e);
    if (target !== null && target !== undefined) {
      canvas.setActiveObject(target);
      return true;
    }
    return false;
  });
}

/**
 * TODO: Not yet sure what this does
 * 
 * @param {*} button 
 */
function toggle(button) {
  var open = $("div.sidebar-item-selected");

  if (open.length === 0) {
    page.openPanel(button, true);
    return;
  }

  if (open.attr("id") == button.attr("id")) {
    // Same button clicked
    page.closePanel(open, true);
  } else {
    // Different button clicked
    page.closePanel(open, false);
    page.openPanel(button, false);
  }
}

/**
 * Return a string with the frist character or each
 * word captialized
 * 
 * @param {string} str 
 */
function toTitleCase(str)
{
  return str.replace(/\w\S*/g, function(txt) {
    return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();
  });
}

/**
 * Display the active font in the toolbar tool
 */
function showCurrentFont() {
  var font = toTitleCase(utils.getFont());
  if (font.length > 9) {
    font = font.substring(0,10) + "...";
  }
  $("#current-font").text(font);
}

/**
 * Display the current font size in the toolbar
 */
function showCurrentFontSize() {
  var fontSize = utils.getFontSize();
  $("#current-font-size").text(fontSize.toString());
}

/**
 * Indicate the active outline (border) width in the tool submenu
 */
function showCurrentOutlineWidth() {
  var width = utils.getOutlineWidth();

  var element = $("#toolbar-outline-width-submenu > .submenu-item-selected");
  if (element.length > 0) {
    element.removeClass("submenu-item-selected");
  }

  element = $("#outline-width-" + width.toString());
  element.addClass("submenu-item-selected");
}

/**
 * Indicate the active outline (border) style in the tool submenu
 */
function showCurrentOutlineStyle() {
  var style = utils.getOutlineStyle();

  var element = $("#toolbar-outline-style-submenu > .submenu-item-selected");
  if (element.length > 0) {
    element.removeClass("submenu-item-selected");
  }
}

/**
 * Incicate the active text alignment in the tool submenu
 */
function showCurrentTextAlign() {
  var mode = utils.getTextAlign();
  var element = $("#toolbar-text-align-submenu > .submenu-item-selected");
  if (element.length > 0) {
    element.removeClass("submenu-item-selected");
  }

  element = $("#text-align-" + mode);
  element.addClass("submenu-item-selected");
}

/**
 * Undisplay the currently active contextual tools
 */
function hideActiveTools() {
  $("#active-tools").addClass("noshow");
  var active = $("#active-tools > .toolbar-item-active");
  if (active.length > 0) {
    active.removeClass("toolbar-item-active");
  }

  var submenus = $("#active-tools > .toolbar-submenu");
  if (submenus.length > 0) {
    submenus.addClass("noshow");
  }
}

/**
 * Display the appropriate contextual tools for the selected object or group
 */
function showActiveTools() {
  if (isAppLoading === true) {
    return;
  }

  var tools = $("#active-tools");
  var obj = canvas.getActiveObject();
  var group = canvas.getActiveGroup();

  // DQD
  // Figure out the intended logic. This seems
  // overly complicated.
  if (group !== null && group !== undefined) {
    $("#active-tools > div").addClass("noshow");
    tools.removeClass("noshow");
    $("div.group", tools).removeClass("noshow");
  } else if (obj !== null && obj !== undefined) {
    $("#active-tools > div").addClass("noshow");
    tools.removeClass("noshow");

    var type = canvas.getActiveObject().type;

    if (type === "i-text") {
      $("div.text", tools).removeClass("noshow");

      if (text.isBold(obj)) {
        $("#toolbar-bold").addClass("toolbar-item-active");
      } else {
        $("#toolbar-bold").removeClass("toolbar-item-active");
      }

      if (text.isItalics(obj)) {
        $("#toolbar-italics").addClass("toolbar-item-active");
      } else {
        $("#toolbar-italics").removeClass("toolbar-item-active");
      }

      if (text.isUnderline(obj)) {
        $("#toolbar-underline").addClass("toolbar-item-active");
      } else {
        $("#toolbar-underline").removeClass("toolbar-item-active");
      }

      showCurrentFontSize();
      showCurrentFont();
    } else if (type === "svg") {
      $("div.svg", tools).removeClass("noshow");
    } else {
      $("div.shape", tools).removeClass("noshow");
    }

    // Init fill color picker
    page.fillColorPicker();
    var color = utils.getFillColor();
    if (color && color !== "") {
      $("#toolbar-fill-color").spectrum("set", color);
    }

    // Init outline color picker
    page.outlineColorPicker();
    var outlineColor = utils.getOutlineColor();
    if (outlineColor && outlineColor !== "") {
      $("#toolbar-outline-color").spectrum("set", outlineColor);
    }

    // Init outline width
    showCurrentOutlineWidth();

    // Shadow and glow
    setCurrentShadowValues();
    page.glowColorPicker();
    page.shadowColorPicker();

  } else {
    hideActiveTools();
  }
}

/**
 * TODO: What does this do?
 */
function fitSearchResults() {
  var results = $("#slideout-artwork > .slideout-body > .search-results");
  var padding = $("#top").height() + 175;
  results.css("height", window.innerHeight - padding);
}

/**
 * TODO: What does this do?
 * @param {*} e 
 */
function resetFormElement(e) {
  e.wrap('<form>').closest('form').get(0).reset();
  e.unwrap();

  // Prevent form submission
  e.stopPropagation();
  e.preventDefault();
}

/**
 * Initialize the font family submenu and it's event handler
 */
function initFontFamily() {
  var fontClickHandler = function () {
    var fontName = $(this).text();
    utils.setFont(fontName);
    showCurrentFont();
    text.returnFocus();
  };

  $(window).on("fontLoadedEvent", function (event, family, fvd) {
    var displayName;

    // This is need to process TypeKit family names which
    // have names like liberation-sans. Google fonts have 
    // names like Actor.
    if (family === family.toLowerCase()) {
      displayName = toTitleCase(family.replace("-", " "));
    } else {
      displayName = family;
    }

    var familyId = "font-family-" + family.replace(/\s+/g, '');

    // Build the submenu item string for the font
    var str = '';
    str += '<div class="submenu-item"';
    str += ' id="' + familyId + '"';
    str += ' data-font-family="' + family + '"';
    str += ' data-display-name="' + displayName + '">';
    str += '<span style="font-family: ';
    str += "'" + family + "'";
    str += '">' + displayName;
    str += "</span></div>";

    $("#toolbar-font-family-submenu").append(str);

    var element = $("#" + familyId);
    element.click(fontClickHandler);
  });

  $(window).on("allFontsLoadedEvent", function (event) {
    // Is the menu being used?
    if ($("#toolbar-font-family").hasClass("toolbar-item-active") === true) {
      return;
    }

    // Sort the fonts, use the display name as the key
    var sorted = $("#toolbar-font-family .submenu-item").sort(function (a, b) {
      var contentA = $(a).attr('data-display-name');
      var contentB = $(b).attr('data-display-name');
      return (contentA < contentB) ? -1 : (contentA > contentB) ? 1 : 0;
    });

    //$("#toolbar-font-family .toolbar-submenu").html(sorted);
    $("#toolbar-font-family-submenu").html(sorted);

    // Set new event listeners for all the submen-items
    $("#toolbar-font-family .submenu-item").click(fontClickHandler);
  });

  // $("#font-arial").click(function () {
  //   utils.setFont("Arial");
  //   showCurrentFont();
  //   text.returnFocus();
  // });
  showCurrentFont();
  text.returnFocus();
}

/**
 * Initialize the font size submenu and it's event handler
 */
function initFontSize() {
  var fontSizeClickHandler = function () {
    //var fontSize = $(this).text();
    //var fontSize = utils.getFontSize();
    //utils.setFontSize(parseInt(fontSize));
    showCurrentFontSize();
    text.returnFocus();
  };

  var fontSizes = [6, 7, 8, 9, 10, 11, 12, 14, 18, 24, 30, 36];
  for (var i = 0; i < fontSizes.length; i++) {
    var size = fontSizes[i].toString();
    var str = '<div class="submenu-item" id="font-size-' + size +
      '" data-font-size="' + size + '">' + size + '</div>';
    $("#toolbar-font-size > .toolbar-submenu").append(str);
    var element = $("#font-size-" + size);
    element.click(fontSizeClickHandler);
  }

  showCurrentFontSize();
  text.returnFocus();
}

/**
 * Initialize the outline (border) width submenu and event handler
 */
function initOutlineWidth() {
  var outlineWidthClickHandler = function () {
    var outlineWidth = $(this).text();
    utils.setOutlineWidth(parseInt(outlineWidth));
    showCurrentOutlineWidth();
  };

  var outlineWidths = [1, 2, 3, 4, 5, 8, 12, 16, 24];
  for (var i = 0; i < outlineWidths.length; i++) {
    var width = outlineWidths[i].toString();
    var str = '<div class="submenu-item" id="outline-width-' + width +
      '" data-outline-width="' + width + '">' + width + 'px</div>';
    $("#toolbar-outline-width-submenu").append(str);
    var element = $("#outline-width-" + width);
    element.click(outlineWidthClickHandler);
  }
}

/**
 * Initialize the outline (border) style submenu and event handler
 */
function initOutlineStyle() {
  var outlineStyleClickHandler = function () {
    var outlineStyle = $(this).text();
    utils.setOutlineStyle(parseInt(outlineStyle));
    showCurrentOutlineStyle();
  };

  var outlineStyles = ["solid", "dotted", "dashed"];
  for (var i = 0; i < outlineStyles.length; i++) {
    var style = outlineStyles[i];
    var str = '<div class="submenu-item" id="outline-style-' + style +
      '" data-outline-style="' + style + '">' + style + '</div>';
    $("#toolbar-outline-style-submenu").append(str);
    var element = $("#outline-style-" + style);
    element.click(outlineStyleClickHandler);
  }
}

/**
 * Initialize the canvas event handlers
 */
function initCanvas() {
  canvas.on({
    "object:selected": function () {
      showActiveTools();
    },
    "selection:cleared": function () {
      showActiveTools();
    }
  });

  window.addEventListener('resize', fitSearchResults, false);
  fitSearchResults();
}

/**
 * Initialize the undo and redo event handlers
 */
function initUndo() {
  $("#toolbar-undo").click(function () {
    state.undo();
  });

  $("#toolbar-redo").click(function () {
    state.redo();
  });
}

/**
 * Initialize the text tool event handler
 */
function initText() {
  $("#toolbar-text").click(function () {
    $(document).trigger("click.submenu"); // Make sure all submenus are closed
    if ($("#toolbar-text").hasClass("toolbar-item-active")) {
      $("#toolbar-text").removeClass("toolbar-item-active");
      text.cancelInsert();
    } else {
      $("#toolbar-text").addClass("toolbar-item-active");
      text.insertText();
    }
  });
}

/**
 * Initialize the submenu event handlers
 */
function initSubmenus() {
  $('.toolbar-dropdown').each(function (i, obj) {
    $(obj).click(function (event) {
      var button = $(this);
      var popup = $(".toolbar-submenu", button);
      var visible = popup.is(":visible");

      if (visible) {
        // We're closing the submenu
        var clickedButton = event.target.id === button.attr('id');
        var noAutoClose = $(".toolbar-submenu", button).hasClass("no-auto-close");
        if (!clickedButton && noAutoClose) {
          return;
        }

        if (button.hasClass("toolbar-item-active")) {
          button.removeClass("toolbar-item-active");
        }

        page.closeSubmenu(button);
        $(document).unbind("click.submenu");
      } else {
        // We're opening the submenu
        $(document).trigger("click.submenu", true);

        button.addClass("toolbar-item-active");
        $(".mdl-tooltip").addClass("noshow");

        var x = button.offset().top + 27;
        var y = button.offset().left;
        popup.css({ top: x, left: y });
        popup.removeClass("noshow");

        // DQD - This block was causing the font family submeny to be hidden when 
        // the user clicked some place other than the current font name. Not sure
        // what the intent of the code was.
        //
        // $(document).bind("click.submenu", function(event, noTooltips) {
        //   if (event.target.id === button.attr('id')) {
        //     return;
        //   }

        //   page.closeSubmenu(button, noTooltips);
        //   $(document).unbind("click.submenu");
        // });

        // Hack to get spectrum color pickers to redraw
        if (popup[0] && popup[0].id === "shadow-submenu") {
          var shadowColor = utils.getShadowColor();
          $("#shadow-color-picker").spectrum("set", shadowColor);
          $("#shadow-color-hex").val($("#shadow-color-picker").spectrum("get").toHexString());

          $("#glow-color-hex").val(shadowColor);
          $("#glow-color-picker").spectrum("set", shadowColor);
        }
      }
    });
  });
}

/**
 * Initialize the shape tool event handlers
 */
function initShapes() {
  $("#shapes-line").click(function () {
    canvas.deactivateAllWithDispatch();
    canvas.renderAll();
    drawing.drawObj("line");
    canvas.defaultCursor = 'crosshair';
  });

  $("#shapes-circle").click(function () {
    canvas.deactivateAllWithDispatch();
    canvas.renderAll();
    drawing.drawObj("circle");
    canvas.defaultCursor = 'crosshair';
  });

  $("#shapes-rectangle").click(function () {
    canvas.deactivateAllWithDispatch();
    canvas.renderAll();
    drawing.drawObj("square");
    canvas.defaultCursor = 'crosshair';
  });

  $("#shapes-rounded").click(function () {
    canvas.deactivateAllWithDispatch();
    canvas.renderAll();
    drawing.drawObj("rounded-rect");
    canvas.defaultCursor = 'crosshair';
  });
}

/**
 * Initialize the import and export event handlers
 */
function initImportExport() {
  // Download jpeg, png or svg
  $("#download-image-button").click(function () {
    var type = $("input[name=file-type]:checked").val();
    var background = $("input[name=background-color]:checked").val();

    var rect;
    if (background === 'white' || type === 'jpeg') {
      if (type === 'png' || type === 'jpeg') {
        canvas.setBackgroundColor("#FFFFFF");
        canvas.renderAll();
      } else {
        rect = new fabric.Rect({
          left: 0,
          top: 0,
          fill: 'white',
          width: canvas.width,
          height: canvas.height
        });
        canvas.add(rect);
        canvas.sendToBack(rect);
        canvas.renderAll();
      }
    }

    utils.exportFile(type);
    hideActiveTools();

    // Cleanup background
    if (background === 'white' || type === 'jpeg') {
      if (type === 'png' || type === 'jpeg') {
        canvas.setBackgroundColor("");
      } else {
        canvas.remove(rect);
      }
      canvas.renderAll();
    }
  });

  // Export JSON
  $("#export-file-button").click(function () {
    // Broken in Safari
    var isSafari = navigator.vendor && navigator.vendor.indexOf('Apple') > -1 &&
      navigator.userAgent && !navigator.userAgent.match('CriOS');
    if (isSafari === true) {
      window.alert("Sorry, Safari does not support exporting your work. You can still use the sharing tool instead!");
      return;
    }

    var data = JSON.stringify(canvas);
    importExport.exportFile(data, 'design.logo');
  });

  // Import JSON
  $("#import-file-button").on("change", function (e) {
    $("#loading-spinner").removeClass("noshow");
    page.closePanel(null, true);

    var files = e.target.files;
    var reader = new FileReader();

    reader.onload = function (e) {
      try {
        var data = reader.result;
        importExport.importFile(data, function (data) {
          canvas.clear();
          canvas.loadFromJSON(data);
          utils.centerContent();
          $("#loading-spinner").addClass("noshow");
        });

        // Clear the form so you can load another file
        resetFormElement($("#import-wrapper"));
      } catch (err) {
        $("#loading-spinner").addClass("noshow");
      }
    };

    reader.readAsArrayBuffer(files[0]);
  });
}

/**
 * Initialize the search for art event handlers
 */
function initSearchArt() {
  $("#artwork-search-form").submit(function (e) {
    // Prevent form submission
    e.preventDefault();

    // Fetch artwork
    var term = $("#artwork-search").val().trim();
    var resultsDiv = $("#artwork-panel > .search-results");

    var isClipart = $("input[name=search-type]:checked").val() === "clipart";
    fetchApi.search(term,
      page.toggleArtworkSearchSpinner,
      page.toggleArtworkNoResults,
      resultsDiv,
      function (url) {
        utils.insertSvg(url, $("#loading-spinner"));
        page.closePanel(null, true);
      },
      isClipart);
  });

  $("#search-submit").click(function () {
    $('form[name=artwork-search-form]').submit();
  });

  // Search again if user changes search type
  $('input[type=radio][name=search-type]').change(function () {
    if ($("#artwork-search").val() !== "") {
      $('form[name=artwork-search-form]').submit();
    }
  });
}

/**
 * Initialize the basic text tool event handlers
 */
function initTextTools() {
  $("#toolbar-bold").click(function () {
    text.toggleBold();
    text.returnFocus();
  });

  $("#toolbar-italics").click(function () {
    text.toggleItalics();
    text.returnFocus();
  });

  $("#toolbar-underline").click(function () {
    text.toggleUnderline();
    text.returnFocus();
  });
}

/**
 * Initialize the text alignment tool event handler
 */
function initTextAlign() {
  var textAlignHandler = function () {
    var mode = $(this).text();
    utils.setTextAlign(mode);
    showCurrentTextAlign();
  };

  $("#text-align-left").click(textAlignHandler);
  $("#text-align-center").click(textAlignHandler);
  $("#text-align-right").click(textAlignHandler);
}

/**
 * Initialize the arrange tool event handlers
 */
function initArrangeTools() {
  $("#toolbar-send-back").click(function () {
    utils.sendToBack();
  });

  $("#toolbar-send-backward").click(function () {
    utils.sendBackward();
  });

  $("#toolbar-bring-forward").click(function () {
    utils.sendForward();
  });

  $("#toolbar-bring-front").click(function () {
    utils.sendToFront();
  });
}

/**
 * Initialize the center selection on page event handlers
 */
function initCentering() {
  $("#toolbar-horizontal-center").click(function () {
    utils.hCenterSelection();
  });

  $("#toolbar-vertical-center").click(function () {
    utils.vCenterSelection();
  });
}

/**
 * Initialize the effects tools event handlers
 */
function initEffectsTools() {
  $("#shadow-switch").change(function () {
    if ($(this).is(":checked")) {
      $("#glow-switch-label")[0].MaterialSwitch.off();
      $("#shadow-options").slideToggle(200);

      // Close other options
      if ($("#glow-options").css("display") !== "none") {
        $("#glow-options").slideToggle(200);
      }

      setShadow();

      var shadowColor = utils.getShadowColor();
      $("#shadow-color-hex").val(shadowColor);
    } else {
      utils.clearShadow();
      $("#shadow-options").slideToggle(200);
    }
  });

  $("#glow-switch").change(function () {
    if ($(this).is(":checked")) {
      $("#shadow-switch-label")[0].MaterialSwitch.off();
      $("#glow-options").slideToggle(200);

      // Close other options
      if ($("#shadow-options").css("display") !== "none") {
        $("#shadow-options").slideToggle(200);
      }

      setShadow();

      var shadowColor = utils.getShadowColor();
      $("#glow-color-hex").val(shadowColor);
    } else {
      utils.clearShadow();
      $("#glow-options").slideToggle(200);
    }
  });

  $("#shadow-blur-slider").change(function () {
    setShadow();
  });

  $("#shadow-offset-slider").change(function () {
    setShadow();
  });

  $("#glow-size-slider").change(function () {
    setShadow();
  });
}

/**
 * Initialize the sidebar event handlers
 */
function initSidebar() {
  $(".sidebar-item").click(function () {
    toggle($(this));
    return false;
  }).hover(function () {
    if (!$(this).hasClass("sidebar-item-active")) {
      $(this).addClass("sidebar-item-hover");
    }
  }, function () {
    $(this).removeClass("sidebar-item-hover");
  });
}

/**
 * Initialize the event handler for the select tool
 */
function initSelectTool() {
  $("#toolbar-select").click(function () {
    canvas.defaultCursor = 'auto';
    canvas.deactivateAllWithDispatch();
    canvas.renderAll();
    hideActiveTools();
  });
}

/**
 * Download the canvas content as the specified file type
 * 
 * @param {*} type 
 */
function downloadImage(type) {
  var rect;
  if (type === 'png' || type === 'jpeg') {
    canvas.setBackgroundColor("#FFFFFF");
    canvas.renderAll();
  } else {
    rect = new fabric.Rect({
      left: 0,
      top: 0,
      fill: 'white',
      width: canvas.width,
      height: canvas.height
    });
    canvas.add(rect);
    canvas.sendToBack(rect);
    canvas.renderAll();
  }

  utils.exportFile(type);
  hideActiveTools();

  // Cleanup background
  if (type === 'png' || type === 'jpeg') {
    canvas.setBackgroundColor("");
  } else {
    canvas.remove(rect);
  }
  canvas.renderAll();
}

/**
 * Read the contents of the given file and insert it as a string
 * 
 * @param {File} file - Web API File object to insert
 */
function readFromString(file) {
  var reader = new FileReader();

  reader.onload = function (ev) {
    utils.insertSvgFromString(ev.target.result, $("#loading-spinner"));
  };

  reader.readAsText(file);
}

function readFromData(file) {
  var reader = new FileReader();

  reader.onload = function (ev) {
    utils.insertImageFromData(ev.target.result, $("#loading-spinner"));
  };

  reader.readAsDataURL(file);
}

/**
 * Display the import from dialog and handle it's events
 * 
 * @param {string} type - the type of file "svg" or "png"
 */
function openImportDialog(type) {
  var dialog = $("#import-file-dialog").get(0);

  // For browsers that don't have the dialog element
  // if (!dialog.showModal) {
  //   dialogPolyfill.registerDialog(dialog);
  // }

  var mimeType = (type === "png") ? "image/png" : "image/svg+xml";
  var fileList = [];

  // Import button click handler. Process the list of files
  // that were dropped and insert the ones that have the 
  // specified mime type.
  $("#import-file-dialog-ok").click(function () {
    dialog.close();
    for (var i = 0; i < fileList.length; i++) {
      if (fileList[i].type === mimeType) {
        switch (type) {
          case "svg":
            readFromString(fileList[i]);
            break;
          case "png":
            readFromData(fileList[i]);
            break;
          default:
            // TODO: Error, unknown type
            break;
        }
      }
    }
  });

  // Cancel button click hander. 
  $("#import-file-dialog-cancel").click(function () {
    dialog.close();
  });

  // Drag over event handler. May not need this.
  $("#import-file-dialog-dropzone").on("dragover", function (ev) {
    ev.preventDefault();
    ev.stopPropagation();
  });

  // Drag enter event handler. May not need this.
  $("#import-file-dialog-dropzone").on("dragenter",function (ev) {
    ev.preventDefault();
    ev.stopPropagation();
  });

  // Drop event handler. Store the Web API File objects dropped 
  // on the drop zone for later processing.
  $("#import-file-dialog-dropzone").on("drop", function (ev) {
    ev.preventDefault();
    ev.stopPropagation();

    var files = ev.originalEvent.dataTransfer.files;
    for (var i = 0; i < files.length; i++) {
      fileList.push(files[i]);
    }
 });

  // Display the Import from file dialog
  dialog.showModal();
}

/**
 * Initialize the file tool
 */
function initFileTool() {
  // Import template
  $("#file-import-template").click(function () {
    // TODO: Inserting a template may need special treatment
    openImportDialog("svg");
  });

  // Import SVG
  $("#file-import-svg").click(function () {
    openImportDialog("svg");
  });  

  // Import image
  $("#file-import-image").click(function () {
    openImportDialog("png");
  });

  // Export SVG
  $("#file-export-svg").click(function () {
    downloadImage("svg");
  });

  // Export image
  $("#file-export-image").click(function () {
    downloadImage("png");
  });
}

/**
 * Initialize all the editor user interface event handlers
 */
function listeners() {
  initFontFamily();
  initFontSize();
  initOutlineWidth();
  initOutlineStyle();
  initCanvas();
  initUndo();
  initSidebar();
  initText();
  initSubmenus();
  initShapes();
  //initButtons();
  //initImportExport();
  //initSearchArt();
  initTextTools();
  initTextAlign();
  initArrangeTools();
  initCentering();
  initEffectsTools();
  initSelectTool();
  initFileTool();
}

/**
 * TODO: What does this do?
 */
function setCurrentShadowValues() {
  var shadowColor;
  if (utils.isShadow()) {
    $("#shadow-switch-label")[0].MaterialSwitch.on();
    $("#glow-switch-label")[0].MaterialSwitch.off();

    $("#shadow-offset-slider")[0].MaterialSlider.change(utils.getShadowOffset().x);
    $("#shadow-blur-slider")[0].MaterialSlider.change(utils.getShadowBlur());

    shadowColor = utils.getShadowColor();
    $("#shadow-color-picker").spectrum("set", shadowColor);
    $("#shadow-color-hex").val($("#shadow-color-picker").spectrum("get").toHexString());

    $("#shadow-options").show();
    $("#glow-options").hide();
  } else if (utils.isGlow()) {
    $("#shadow-switch-label")[0].MaterialSwitch.off();
    $("#glow-switch-label")[0].MaterialSwitch.on();

    $("#glow-size-slider")[0].MaterialSlider.change(utils.getShadowBlur());

    shadowColor = utils.getShadowColor();
    $("#glow-color-hex").val(shadowColor);
    $("#glow-color-picker").spectrum("set", shadowColor);

    $("#shadow-options").hide();
    $("#glow-options").show();
  } else {
    $("#glow-switch-label")[0].MaterialSwitch.off();
    $("#shadow-switch-label")[0].MaterialSwitch.off();
    $("#shadow-options").hide();
    $("#glow-options").hide();
  }
}

/**
 * TODO: What does this do?
 */
function setShadow() {
  var blur, color, offset;

  if ($("#shadow-switch").is(":checked")) {
    color = $("#shadow-color-picker").spectrum("get").toRgbString();
    blur = $("#shadow-blur-slider")[0].value;
    offset = $("#shadow-offset-slider")[0].value;
    utils.setShadow(color, blur, offset, offset);
  }

  if ($("#glow-switch").is(":checked")) {
    color = $("#glow-color-picker").spectrum("get").toHexString();
    blur = $("#glow-size-slider")[0].value;
    utils.setShadow(color, blur, 0, 0);
  }
}

/**
 * Event handler for canvas resize events
 */
function resizeHandler() {
  // Resize the canvas size
  //var width = $("#content").width() - 100;
  //var width = $("#content").width() - 40;
  var width = $("body").width() - 10;
  //var height = 600;
  var height = $("body").height() - 10;
  var toolbarHeight = $("#toolbar").height() + 4;
  canvas.setWidth(width);
  canvas.setHeight(height - toolbarHeight);
  //$("#canvas-container").css({ left: "50px", top: "40px", width: width });
  $("#canvas-container").css({ left: "0px", top: "0px", width: width, height: height });
  //canvas.setHeight(window.innerHeight - $("#toolbar").height() - 150);

  // Subtract the left and right padding values
  var padLeft = parseInt($("#toolbar").css("padding-left"));
  var padRight = parseInt($("#toolbar").css("padding-right"));
  $("#toolbar").css({ width: width - (padLeft + padRight) });

  // Resize the search results panel
  //page.fitArtworkResultsHeight();
}

/**
 * TODO: What does this do?
 * @param {*} sParam 
 */
var getUrlParameter = function getUrlParameter(sParam) {
  var sPageURL = decodeURIComponent(window.location.search.substring(1)),
    sURLVariables = sPageURL.split('&'),
    sParameterName,
    i;

  for (i = 0; i < sURLVariables.length; i++) {
    sParameterName = sURLVariables[i].split('=');

    if (sParameterName[0] === sParam) {
      return sParameterName[1] === undefined ? true : sParameterName[1];
    }
  }
};

/**
 * TODO: What does this do?
 * 
 * @param {*} url 
 * @param {*} title 
 * @param {*} w 
 * @param {*} h 
 */
function popupCenter(url, title, w, h) {
	// Fixes dual-screen position                         Most browsers      Firefox
	var dualScreenLeft = window.screenLeft !== undefined ? window.screenLeft : screen.left;
	var dualScreenTop = window.screenTop !== undefined ? window.screenTop : screen.top;

	var width = window.innerWidth ? window.innerWidth : document.documentElement.clientWidth ? document.documentElement.clientWidth : screen.width;
	var height = window.innerHeight ? window.innerHeight : document.documentElement.clientHeight ? document.documentElement.clientHeight : screen.height;

	var left = ((width / 2) - (w / 2)) + dualScreenLeft;
	var top = ((height / 3) - (h / 3)) + dualScreenTop;

	var newWindow = window.open(url, title, 'scrollbars=yes, width=' + w + ', height=' + h + ', top=' + top + ', left=' + left);

	// Puts focus on the newWindow
	if (newWindow && newWindow.focus) {
		newWindow.focus();
	}
}

/**
 * Initialize the module
 */
function HandlersModule() {
  if (!(this instanceof HandlersModule)) return new HandlersModule();

  // Show loading spinner until sample image has been loaded
  $("#loading-spinner").removeClass("noshow");

  // Initialize canvas
  fabric.Object.prototype.transparentCorners = false;
  window.addEventListener('resize', resizeHandler, false);
  resizeHandler();

  // Change fabric.js selection styles
  fabric.Object.prototype.set({
    borderColor: "#1c55d5",
    cornerColor: "#1c55d5",
    cornerSize: 8,
    rotatingPointOffset: 30
  });

  // Set some default values on the canvas
  utils.setFont("Liberation Sans");
  utils.setFontSize(18);
  utils.setFillColor("#ff0000");
  utils.setOutlineColor("#000000");
  utils.setOutlineWidth(3);

  // Preserve object layer order when selecting objects
  canvas.preserveObjectStacking = true;

  // Setup handlers
  deleteHandler();
  rightClick();
  listeners();

  // Load image
  /*
  var logoFile = getUrlParameter('i');
  if (logoFile !== null && logoFile !== undefined && logoFile !== "") {
    try {
      var url = config.icons.host + "/shared/" + logoFile;
      importExport.loadRemoteFile(url, function(decoded_data) {
        if (decoded_data !== null) {
          canvas.clear();
          canvas.loadFromJSON(decoded_data);
          utils.centerContent();
        }
        $("#loading-spinner").addClass("noshow");
      });
    } catch (err) {
      $("#loading-spinner").addClass("noshow");
    }
  } else {
    try {
      canvas.clear();
      //canvas.loadFromJSON(sampleImage); -- use this to load a default image
      //utils.centerContent();
      $("#loading-spinner").addClass("noshow");
    } catch (err) {
      $("#loading-spinner").addClass("noshow");
    }

    // Show popup tooltip on artwork search button when the page loads
    // $("#sidebar-artwork > .inactive > img").tooltipster({
    //   theme: 'tooltipster-daring',
    //   contentAsHTML: true,
    //   animation: 'grow',     // fade, grow, swing, slide, fall
    //   speed: 150,
    //   hideOnClick: true,
    //   interactive: false,
    //   interactiveTolerance: 350,
    //   onlyOne: true,
    //   position: 'right',
    //   content: "<p class='onload-tooltip'><strong>Start here!</strong> Search for an image <br/> to begin making your image.</p>",
    //   trigger: 'custom',
    //   offsetX: 18,
    //   offsetY: 5,
    //   functionReady: function(){
    //     $(document).click(function() {
    //       $("#sidebar-artwork > .inactive > img").tooltipster('hide');
    //     });
    // }
    // });
    // window.setTimeout(function() {
    //   $("#sidebar-artwork > .inactive > img").tooltipster('show');
    // }, 400);
  }
  */
  
  try {
    canvas.clear();
    $("#loading-spinner").addClass("noshow");
  } catch (err) {
    $("#loading-spinner").addClass("noshow");
  }


  // Undo redo
  canvas.on("object:modified", function() {
    state.save();
  });

  canvas.on("object:removed", function() {
    state.save();
  });

  canvas.on("object:statechange", function() {
    state.save();
  });

  isAppLoading = false;
}

/**
 * Module exports
 */
module.exports = HandlersModule;
