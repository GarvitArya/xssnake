'use strict';

/**
 * Level Registry
 * @constructor
 */
xss.LevelRegistry = function() {
    this._numLevelsRegistered = 0;
    this._numLevelsLoaded = 0;

    this.allImagesLoaded = xss.util.dummy;

    /**
     * @type {Array.<xss.LevelData>}
     */
    this.levelDatas = [];

    this._registerAll(xss.data.levels);
    xss.data.levelImages = null;
};

xss.LevelRegistry.prototype = {

    /**
     * @param {string} binaryData
     * @param {Function=} animation
     */
    register: function(binaryData, animation) {
        var index = this.levelDatas.push(undefined) - 1;
        this._numLevelsRegistered++;

        // Which levelImageLoader is used depends on client or server context.
        xss.levelImageLoader(binaryData, function(imageData) {
            var parser = new xss.LevelParser(imageData, animation);
            this.levelDatas[index] = parser.getParsedLevel();

            // All finished loading
            if (this._numLevelsRegistered === ++this._numLevelsLoaded) {
                this.allImagesLoaded();
            }
        }.bind(this));
    },

    /**
     * @param index
     * @returns {xss.LevelData}
     */
    getLevelData: function(index) {
        return this.levelDatas[index];
    },

    /**
     * @private
     */
    _registerAll: function(levels) {
        for (var i = 0, m = levels.length; i < m; i++) {
            this.register(levels[i].image, levels[i].animation);
        }
    }

};
