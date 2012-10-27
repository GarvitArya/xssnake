/*jshint globalstrict:true, sub:true*/
/*globals XSS*/

'use strict';

/**
 * @param {number=} x1
 * @param {number=} y1
 * @param {number=} x2
 * @param {number=} y2
 * @constructor
 */
function BoundingBox(x1, y1, x2, y2) {
    this.x1 = x1 || 0;
    this.y1 = y1 || 0;
    this.x2 = x2 || 0;
    this.y2 = y2 || 0;
    this.updateSize();
}

BoundingBox.prototype = {

    /**
     * @param {Shape} shape
     * @return {BoundingBox}
     */
    ofShape: function(shape) {
        var pixels = shape.pixels,
            x1 = 0,
            x2 = 0,
            y1 = 0,
            y2 = 0;

        for (var i = 0, m = pixels.length; i < m; i++) {
            var x = pixels[i][0],
                y = pixels[i][1];
            x1 = Math.min(x1, x);
            x2 = Math.max(x2, x);
            y1 = Math.min(y1, y);
            y2 = Math.max(y2, y);
        }

        this.x1 = x1;
        this.x2 = x2 + 1;
        this.y1 = y1;
        this.y2 = y2 + 1;

        this.updateSize();

        return this;
    },

    /**
     * @param {number} expandBy
     * @return {BoundingBox}
     */
    expand: function(expandBy) {
        this.x1 -= expandBy;
        this.y1 -= expandBy;
        this.x2 += expandBy;
        this.y2 += expandBy;
        this.updateSize();
        return this;
    },

    /**
     * @return {BoundingBox}
     */
    updateSize: function() {
        this.width = this.x2 - this.x1;
        this.height = this.y2 - this.y1;
        return this;
    }

};