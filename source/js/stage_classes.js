/*jshint globalstrict:true, es5:true, expr:true, sub:true*/
/*globals XSS, CONST, Dialog, Shape, Socket, InputField, Font, Room, StageFlow*/
'use strict';


/**
 * @interface
 */
function StageInterface() {}

StageInterface.prototype = {

    /** @return {Shape} */
    getShape: function() {
        return new Shape();
    },

    /** @return */
    construct: function() {},

    /** @return */
    destruct: function() {}

};


/**
 * BaseInputStage
 * Stage with a form input
 * @param {string|null} name
 * @param {Function} nextStage
 * @param {string} header
 * @param {string} label
 * @implements {StageInterface}
 * @constructor
 */
function InputStage(name, nextStage, header, label) {
    this.name = name;
    this.nextStage = nextStage;
    this.header = header;
    this.label = label;

    this.minChars = 0;
    this.maxChars = 0;

    this.maxValWidth = 0; // Passed to InputField
    this.displayWidth = 0;

    this._val = XSS.util.storage(name);
    this._inputTop = CONST.MENU_TOP + 17;
    this._shape = this._getShape(true);
}

InputStage.prototype = {

    getShape: function() {
        return this._shape;
    },

    getValue: function() {
        return this._val;
    },

    construct: function() {
        XSS.pubsub.on(CONST.EVENT_KEYDOWN, CONST.NS_STAGES, this.handleKeys.bind(this));

        this.input = new InputField(CONST.MENU_LEFT, this._inputTop, this.label);
        this.input.maxValWidth = this.maxValWidth || this.input.maxValWidth;
        this.input.displayWidth = this.displayWidth || this.input.displayWidth;

        this.input.callback = function(value) {
            XSS.util.storage(this.name, value);
            this._val = value;
        }.bind(this);

        // Apply properties
        this.input.setValue(this._val);

        // Label and input are rendered separately by InputField
        XSS.shapes.stage = this._getShape(false);
    },

    destruct: function() {
        XSS.pubsub.off(CONST.EVENT_KEYDOWN, CONST.NS_STAGES);
        XSS.shapes.message = null;
        this._shape = this._getShape(true);
        this.input.destruct();
    },

    handleKeys: function(e) {
        var value, labelHeight, top;
        switch (e.keyCode) {
            case CONST.KEY_ESCAPE:
                XSS.flow.previousStage();
                e.preventDefault();
                break;
            case CONST.KEY_ENTER:
                value = this._val.trim();
                labelHeight = XSS.font.height(this.label);
                top = labelHeight + CONST.MENU_TOP + CONST.MENU_TITLE_HEIGHT - 3;
                this.inputSubmit(this._getInputError(value), value, top);
        }
    },

    /**
     * @param {string} error
     * @param {string} value
     * @param {number} top
     */
    inputSubmit: function(error, value, top) {
        if (!error && value && top) {
            XSS.flow.switchStage(this.nextStage);
            XSS.pubsub.off(CONST.EVENT_KEYDOWN, CONST.NS_INPUT);
        } else {
            XSS.shapes.message = XSS.font.shape(error, CONST.MENU_LEFT, top);
            XSS.shapes.message.lifetime(0, 500);
        }
    },

    /**
     * @param {string} val
     * @return {string}
     * @private
     */
    _getInputError: function(val) {
        if (val.length < this.minChars) {
            return 'Too short!!';
        } else if (this.maxChars && val.length > this.maxChars) {
            return 'Too long!!';
        }
        return '';
    },

    /**
     * @param {boolean} includeValue
     * @returns {Shape}
     * @private
     */
    _getShape: function(includeValue) {
        var shape = this._getHeaderShape();
        if (includeValue) {
            shape.add(this._getValueShape().pixels);
        }
        return shape;
    },

    /**
     * @return {Shape}
     * @private
     */
    _getHeaderShape: function() {
        var pixels = XSS.font.pixels(this.header);
        pixels = XSS.transform.zoomX2(pixels, CONST.MENU_LEFT, CONST.MENU_TOP, true);
        return new Shape(pixels);
    },

    /**
     * @return {Shape}
     * @private
     */
    _getValueShape: function() {
        var value = this.label + this._val;
        return new Shape(XSS.font.pixels(value, CONST.MENU_LEFT, this._inputTop));
    }

};


/**
 * BaseScreenStage
 * Stage with static content
 * @param {Shape} screen
 * @implements {StageInterface}
 * @constructor
 */
function ScreenStage(screen) {
    this._shape = screen;
}

ScreenStage.prototype = {

    getShape: function() {
        return this._shape;
    },

    construct: function() {
        XSS.pubsub.on(CONST.EVENT_KEYDOWN, CONST.NS_STAGES, this.handleKeys);
    },

    handleKeys: function(e) {
        switch (e.keyCode) {
            case CONST.KEY_BACKSPACE:
            case CONST.KEY_ESCAPE:
                XSS.flow.previousStage();
        }
    },

    destruct: function() {
        XSS.pubsub.off(CONST.EVENT_KEYDOWN, CONST.NS_STAGES);
        XSS.shapes.stage = null;
    }

};


/**
 * SelectStage
 * Stage with a vertical select menu
 * @param {SelectMenu} menu
 * @implements {StageInterface}
 * @constructor
 */
function SelectStage(menu) {
    this.menu = menu;
}

SelectStage.prototype = {

    getShape: function() {
        return this.menu.getShape();
    },

    construct: function() {
        XSS.pubsub.on(CONST.EVENT_KEYDOWN, CONST.NS_STAGES, this.handleKeys.bind(this));
    },

    destruct: function() {
        XSS.pubsub.off(CONST.EVENT_KEYDOWN, CONST.NS_STAGES);
        XSS.shapes.stage = null;
    },

    handleKeys: function(e) {
        if (XSS.keysBlocked) {
            return;
        }
        switch (e.keyCode) {
            case CONST.KEY_BACKSPACE:
            case CONST.KEY_ESCAPE:
                XSS.flow.previousStage();
                break;
            case CONST.KEY_ENTER:
                var nextStage = this.menu.getNextStage();
                if (nextStage) {
                    XSS.flow.switchStage(nextStage);
                } else {
                    XSS.flow.previousStage();
                }
                break;
            case CONST.KEY_UP:
                this.menu.select(-1);
                XSS.play.menu();
                XSS.flow.setStageShapes();
                break;
            case CONST.KEY_DOWN:
                this.menu.select(1);
                XSS.play.menu();
                XSS.flow.setStageShapes();
        }
    }

};

/**
 * Stage with a vertical form
 * @param {Form} form
 * @implements {StageInterface}
 * @constructor
 */
function FormStage(form) {
    this.form = form;
}

FormStage.prototype = {

    getShape: function() {
        return this.form.getShape();
    },

    construct: function() {
        XSS.pubsub.on(CONST.EVENT_KEYDOWN, CONST.NS_STAGES, this.handleKeys.bind(this));
    },

    destruct: function() {
        XSS.pubsub.off(CONST.EVENT_KEYDOWN, CONST.NS_STAGES);
        XSS.shapes.stage = null;
    },

    handleKeys: function(e) {
        if (XSS.keysBlocked) {
            return;
        }
        switch (e.keyCode) {
            case CONST.KEY_BACKSPACE:
            case CONST.KEY_ESCAPE:
                XSS.flow.previousStage();
                break;
            case CONST.KEY_ENTER:
                var nextStage = this.form.getNextStage();
                XSS.flow.switchStage(nextStage);
                break;
            case CONST.KEY_UP:
                this.form.selectField(-1);
                XSS.play.menu();
                XSS.flow.setStageShapes();
                break;
            case CONST.KEY_DOWN:
                this.form.selectField(1);
                XSS.play.menu();
                XSS.flow.setStageShapes();
                break;
            case CONST.KEY_LEFT:
                this.form.selectOption(-1);
                XSS.play.menu_alt();
                XSS.flow.setStageShapes();
                break;
            case CONST.KEY_RIGHT:
                this.form.selectOption(1);
                XSS.play.menu_alt();
                XSS.flow.setStageShapes();
                break;
        }
    }

};


/**
 * Game Stage
 * @implements {StageInterface}
 * @constructor
 */
function GameStage() {
}

GameStage.prototype = {

    getShape: function() {
        return new Shape();
    },

    construct: function() {
        this._destructMenu();
        this._joinGame();
        this._bindKeys();

        XSS.room = new Room();
    },

    destruct: function() {
        XSS.pubsub.off(CONST.EVENT_KEYDOWN, CONST.NS_STAGES);
    },

    _bindKeys: function() {
        XSS.pubsub.on(CONST.EVENT_KEYDOWN, CONST.NS_STAGES, this._exitKeys.bind(this));
    },

    _exitKeys: function(e) {
        if (!XSS.keysBlocked && e.keyCode === CONST.KEY_ESCAPE && XSS.room) {
            this.dialog = new Dialog(
                'LEAVING GAME',
                'Are you sure you want to leave this game?', {
                    ok: function() {
                        XSS.flow.restart();
                    }
                }
            );
        }
    },

    _destructMenu: function() {
        if (XSS.menuSnake) {
            XSS.menuSnake.destruct();
        }
        XSS.shapes.header = null;
    },

    _joinGame: function() {
        if (XSS.stages.autoJoinData) {
            var room = XSS.util.hash(CONST.HASH_ROOM);
            this._autoJoin(room);
            delete XSS.stages.autoJoinData;
        } else {
            this._matchRoom();
        }
    },

    _autoJoin: function(key) {
        var stages = XSS.flow.stageInstances;

        XSS.pubsub.once(CONST.EVENT_ROOM_STATUS, CONST.NS_STAGES, function(data) {
            if (!data[0]) {
                XSS.util.error(Room.prototype.errorCodeToStr(data[1]));
            }
        });

        XSS.socket.emit(
            CONST.EVENT_ROOM_JOIN,
            [key, stages.autoJoin.getValue()]
        );
    },

    _matchRoom: function() {
        var stages, data;

        stages = XSS.flow.stageInstances;
        data = stages.multiplayer.form.getValues();
        data[CONST.FIELD_NAME] = stages.inputName.getValue();

        XSS.socket = new Socket(function() {
            XSS.socket.emit(CONST.EVENT_ROOM_MATCH, data);
        });
    }

};
