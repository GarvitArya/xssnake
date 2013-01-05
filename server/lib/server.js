/*jshint globalstrict:true, es5:true, node:true*/
'use strict';

var http = require('http'),
    io = require('socket.io'),
    config = require('../shared/config.js'),
    EventHandler = require('./event_handler.js'),
    RoomManager = require('./room_manager.js'),
    Client = require('./client.js'),
    Ticker = require('./ticker.js');

/**
 * @constructor
 */
function Server() {
    /** @typedef {number} */
    this.inc = 0;
    /** @typedef {Object.<number, {Client}>} */
    this.clients = {};

    this.ticker = new Ticker(50);
    this.ticker.setMaxListeners(0);
    this.roomManager = new RoomManager(this);
    this.listen(config.SERVER_PORT);
}

module.exports = Server;

Server.prototype = {

    /**
     * @param {number} port
     */
    listen: function(port) {
        var server = http.createServer();
        this.io = io.listen(server, {log: false});

        this.io.set('browser client etag', true);
        this.io.set('browser client gzip', true);
        this.io.set('browser client minification', true);
        this.io.set('transports', ['websocket']);
        this.io.set('close timeout', 10);
        this.io.set('heartbeat timeout ', 10);

        this.io.sockets.on('connection', this.addClient.bind(this));

        server.listen(port);
    },

    /**
     * @param {EventEmitter} socket
     */
    addClient: function(socket) {
        var client, id = ++this.inc;
        client = new Client(id, this, socket);
        client.eventHandler = new EventHandler(this, client, socket);
        this.clients[id] = client;
    },

    /**
     * @param {Client} client
     */
    removeClient: function(client) {
        client.destruct();
        delete this.clients[client.id];
    }

};