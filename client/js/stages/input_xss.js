'use strict';

/**
 * @extends {xss.InputStage}
 * @implements {xss.StageInterface}
 * @constructor
 */
xss.InputXssStage = function() {

    this.name = xss.STORAGE_XSS;
    this.header = 'ENTER YOUR EVAL';
    this.label = '' +
        'Paste your JS. Keep it short; max 256 chars.\n' +
        'Line breaks will be removed.\n\n' +
        '> ';

    this.minChars = 2;
    this.maxChars = 256;
    this.displayWidth = xss.MENU_WIDTH - xss.font.width('> ');
    this.next = xss.StartGameStage;

    xss.InputStage.call(this);

    this.value = this.value || 'document.title = "LOSER!!"';
};

xss.util.extend(xss.InputXssStage.prototype, xss.InputStage.prototype);
xss.util.extend(xss.InputXssStage.prototype, /** @lends xss.InputXssStage.prototype */ {

    getData: function() {
        return {
            xss: this.getValue()
        };
    }
});

