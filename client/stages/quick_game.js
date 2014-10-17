'use strict';

/**
 * @extends {xss.stage.Game}
 * @implements {xss.StageInterface}
 * @constructor
 */
xss.stage.QuickGame = function() {
    xss.stage.Game.call(this);
};

xss.util.extend(xss.stage.QuickGame.prototype, xss.stage.Game.prototype);
xss.util.extend(xss.stage.QuickGame.prototype, {

    getSerializedGameOptions: function(name) {
        var options = new xss.room.ClientOptions(name);
        options.isQuickGame = true;
        return options.serialize();
    }

});
