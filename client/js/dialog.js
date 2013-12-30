'use strict';

/** @typedef {{
     keysBlocked: (boolean|undefined),
     type       : (number|undefined),
     width      : (number|undefined),
     ok         : (Function|undefined),
     cancel     : (Function|undefined)
   }} */
xss.DialogSettings;

/**
 * @param {string} header
 * @param {string} body
 * @param {xss.DialogSettings|Object=} settings
 * @constructor
 */
xss.Dialog = function(header, body, settings) {
    this._header = header;
    this._body = body;

    /** @type {xss.DialogSettings} */
    this.settings = {
        keysBlocked: true,
        type       : xss.Dialog.TYPE.INFO,
        width      : xss.Dialog.MIN_WIDTH,
        ok         : xss.util.dummy,
        cancel     : xss.util.dummy
    };

    xss.util.extend(this.settings, settings);

    this._bindEvents();
    this._updateShape();
    // TODO: Play a bubble sound
};

xss.Dialog.MIN_WIDTH = 80;
xss.Dialog.STR_OK = 'OK';
xss.Dialog.STR_CANCEL = 'CANCEL';

/** @enum {number} */
xss.Dialog.TYPE = {
    INFO   : 0, // No buttons, not closable
    ALERT  : 1, // OK button, closable
    CONFIRM: 2  // OK and CANCEL button
};

xss.Dialog.prototype = {

    destruct: function() {
        xss.shapes.dialog = null;
        xss.keysBlocked = false;
        xss.event.off(xss.EVENT_KEYDOWN, xss.NS_DIALOG);
    },

    restore: function() {
        this._bindEvents();
        this._updateShape();
    },

    ok: function() {
        this.destruct();
        this.settings.ok();
    },

    cancel: function() {
        this.destruct();
        this.settings.cancel();
    },

//    /**
//     * @param {string} header
//     */
//    setHeader: function(header) {
//        xss.play.menu_alt();
//        this._header = header;
//        this._updateShape();
//    },

    /**
     * @param {string} body
     */
    setBody: function(body) {
        xss.play.menu_alt();
        this._body = body;
        this._updateShape();
    },

    /**
     * @private
     */
    _bindEvents: function() {
        xss.keysBlocked = this.settings.keysBlocked;
        if (this.settings.type !== xss.Dialog.TYPE.INFO) {
            xss.event.on(xss.EVENT_KEYDOWN, xss.NS_DIALOG, this._handleKeys.bind(this));
        }
        if (this.settings.type === xss.Dialog.TYPE.ALERT) {
            this._okSelected = true;
        } else if (this.settings.type === xss.Dialog.TYPE.CONFIRM) {
            this._okSelected = false;
        }
    },

    /**
     * @param {Event} ev
     * @private
     */
    _handleKeys: function(ev) {
        switch (ev.keyCode) {
            case xss.KEY_LEFT:
            case xss.KEY_UP:
            case xss.KEY_DOWN:
            case xss.KEY_RIGHT:
                if (this.settings.type === xss.Dialog.TYPE.CONFIRM) {
                    xss.play.menu_alt();
                    this._okSelected = !this._okSelected;
                    this._updateShape();
                }
                break;
            case xss.KEY_BACKSPACE:
            case xss.KEY_ESCAPE:
                if (this.settings.type === xss.Dialog.TYPE.CONFIRM) {
                    this.cancel();
                } else {
                    this.ok();
                }
                break;
            case xss.KEY_ENTER:
                if (this._okSelected) {
                    this.ok();
                } else {
                    this.cancel();
                }
                break;
        }
    },

    /**
     * @return {number}
     * @private
     */
    _getAreaHeight: function() {
        var height = xss.HEIGHT;
        if (xss.shapes.level) {
            height = xss.shapes.level.bbox().height / xss.GAME_TILE;
        }
        return height;
    },

    /**
     * @return {number}
     * @private
     */
    _getContentWidth: function() {
        return Math.max(
            this.settings.width,
            -2 + xss.font.width(this._header) * 2
        );
    },

    /**
     * @return {number}
     * @private
     */
    _getButtonPosition: function() {
        var bodyBBox = this._getBodyPixels().bbox();
        return xss.Font.MAX_HEIGHT * 3 + bodyBBox.height + 4;
    },

    /**
     * @return {xss.ShapePixels}
     * @private
     */
    _getHeaderPixels: function() {
        var header;
        header = xss.font.pixels(this._header, 0, 0);
        header = xss.transform.zoomX2(header, 0, 0, true);
        return header;
    },

    /**
     * @return {xss.ShapePixels}
     * @private
     */
    _getBodyPixels: function() {
        var y, settings = {wrap: this._getContentWidth()};
        y = 1 + xss.Font.MAX_HEIGHT * 2;
        return xss.font.pixels(this._body, 0, y, settings);
    },

    /**
     * @param {number} y
     * @return {xss.ShapePixels}
     * @private
     */
    _getLine: function(y) {
        return xss.shapegen.line(0, y - 5, this._getContentWidth(), y - 5);
    },

    /**
     * @param {number} x
     * @param {number} y
     * @return {xss.ShapePixels}
     * @private
     */
    _getCancelButton: function(x, y) {
        var settings = {invert: !this._okSelected};
        return xss.font.pixels(xss.Dialog.STR_CANCEL, x, y, settings);
    },

    /**
     * @param {number} x
     * @param {number} y
     * @return {xss.ShapePixels}
     * @private
     */
    _getOkButton: function(x, y) {
        var settings = {invert: this._okSelected};
        return xss.font.pixels(xss.Dialog.STR_OK, x, y, settings);
    },

    /**
     * @return {xss.ShapePixels}
     * @private
     */
    _getAlertPixels: function() {
        var y, ok, line;

        y = this._getButtonPosition();
        ok = this._getOkButton(1, y);
        line = this._getLine(y);

        return new xss.Shape(ok, line).pixels;
    },

    /**
     * @return {xss.ShapePixels}
     * @private
     */
    _getConfirmPixels: function() {
        var x, y, cancel, ok, line;

        x = xss.font.width(xss.Dialog.STR_CANCEL) + 5;
        y = this._getButtonPosition();
        cancel = this._getCancelButton(1, y);
        ok = this._getOkButton(x, y);
        line = this._getLine(y);

        return new xss.Shape(ok, cancel, line).pixels;
    },

    /**
     * @private
     */
    _updateShape: function() {
        var shape, header, body, buttons = new xss.ShapePixels();

        header = this._getHeaderPixels();
        body = this._getBodyPixels();

        switch (this.settings.type) {
            case xss.Dialog.TYPE.ALERT:
                buttons = this._getAlertPixels();
                break;
            case xss.Dialog.TYPE.CONFIRM:
                buttons = this._getConfirmPixels();
                break;
        }

        shape = new xss.Shape(header, body, buttons);
        shape.clearBBox = true;

        shape.outline();
        shape.center(0, this._getAreaHeight());

        xss.shapes.dialog = shape;
    }

};
