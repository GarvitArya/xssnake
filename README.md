XSSNAKE
===
**Note: XSSNAKE is in an early stage of development.**

XSSNAKE is an HTML5 online multiplayer game where the winner of the game is
allowed to execute a JavaScript file in the opponent's browser.

XSSNAKE is written in JavaScript. It uses Node.js for the server, Socket.IO for
client–server communication, and Google Closure Compiler with Advanced
compilation to compile to compacter and faster code.

XSSNAKE does not require browser plugins to work, but HTML5's Canvas must be
supported in order to work. Works in all modern browsers, including
Internet Explorer 9 and up.

Initial Setup
---
 * Clone or download XSSNAKE from https://github.com/BlaiseKal/XSSNAKE.git
 * Create a configuration file by renaming `server/shared/config.example.js` to
   `server/shared/config.js`
 * Adjust the contents of `server/shared/config.js` to match your environment
 * Download and install [node.js](http://nodejs.org/)
 * Install [socket.io](https://npmjs.org/package/socket.io) by running
   `npm install socket.io`
 * Install [GccRest](https://github.com/BlaiseKal/GccRest) by running
   `npm install gcc-rest`

Production
---
 * Compile the source: `node build/compile_source.js`
 * Make sure the `www` dir is accessible by browsers
 * Make sure the `server` dir is accessible by node.js
 * Run the game server: `node server/start.js`
 * Access the game by navigating your browser to the `www` dir's public address

Developing and Testing
---
 * Run the game server: `node server/start.js`
 * Access the game by opening `source/source.html` in your browser

While testing, it can be useful to automatically reload the server when you
change something. You can do this by installing supervisor: `npm install
supervisor -g`. Run it using `supervisor -w server -n exit server/start.js`.

If you open `source/source.html` from a local disk in Chrome (`file://...`), you
have to start the browser with the `--disable-web-security` parameter to
work around an Access-Control restriction.

Creating/Updating Levels
---
If you adjusted one of the level images, you have to rebuild
`server/shared/levels.js`. See instructions below. More info on level images
can be found in `source/levels/README.md`.

 * Install [png-js](https://npmjs.org/package/png-js) by running
   `npm install png-js`
 * Run `node build/parse_levels.js`