/**
 * Compiles XSSNAKE's client files to compiled.js
 */

/*jshint globalstrict:true */
'use strict';


var closure = require('./lib/closure.js'),
    home = __dirname + '/../',
    file = home + 'compiled.js',
    conf = { externs_url: 'http://closure-compiler.googlecode.com/svn/trunk/contrib/externs/jquery-1.7.js' };

closure.addFiles(
    home + 'client/js/init.js',
    home + 'client/js/drawables.js',
    home + 'client/js/canvas.js',
    home + 'client/js/effects.js',
    home + 'client/js/font.js',
    home + 'client/js/stageclasses.js',
    home + 'client/js/stageobjects.js',
    home + 'client/js/socket.js',
    home + 'client/js/client.js',
    home + 'client/js/game.js'
);

closure.replace(/'use strict';/g, '');
closure.compile(file, conf);