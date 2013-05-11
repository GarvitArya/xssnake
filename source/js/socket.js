/*jshint globalstrict:true, es5:true, sub:true*/
/*globals XSS, Client, Room, Game, Apple, Powerup, Shape, StageFlow, SockJS*/

'use strict';

/**
 * Client-Server communication
 * @param callback {function({Socket})}
 * @constructor
 */
function Socket(callback) {
    this.map = this._bindEvents();
    this.connection = new SockJS(XSS.config.SERVER_ENDPOINT);
    this.connection.onopen = callback.bind(this);
    this.connection.onclose = this.disconnect.bind(this);
    this.connection.onmessage = this.handleMessage.bind(this);
}

Socket.prototype = {

    /**
     * @param {string} type
     * @param {*} data
     */
    emit: function(type, data) {
        this.connection.send(JSON.stringify([type, data]));
    },

    handleMessage: function(e) {
        var data, type, map = this.map;

        data = JSON.parse(e.data);
        type = data[0];

        if (map[type]) {
            map[type](data[1]);
        } else {
            throw new Error('Unregistered event: ' + type);
        }
    },

    /**
     * @private
     */
    _bindEvents: function() {
        var events = XSS.events, map = {};

        map[events.CLIENT_PING]           = this.clientPing.bind(this);
        map[events.CLIENT_COMBI_EVENTS]   = this.combinedEvents.bind(this);
        map[events.CLIENT_ROOM_INDEX]     = this.roomIndex.bind(this);
        map[events.CLIENT_ROOM_SCORE]     = this.updateScore.bind(this);
        map[events.CLIENT_ROOM_STATUS]    = this.roomStatus.bind(this);
        map[events.CLIENT_CHAT_MESSAGE]   = this.chatMessage.bind(this);
        map[events.CLIENT_CHAT_NOTICE]    = this.chatNotice.bind(this);
        map[events.CLIENT_GAME_COUNTDOWN] = this.gameCountdown.bind(this);
        map[events.CLIENT_GAME_START]     = this.gameStart.bind(this);
        map[events.CLIENT_GAME_SNAKES]    = this.gameSnakes.bind(this);
        map[events.CLIENT_SNAKE_UPDATE]   = this.snakeUpdate.bind(this);
        map[events.CLIENT_SNAKE_SIZE]     = this.snakeSize.bind(this);
        map[events.CLIENT_SNAKE_CRASH]    = this.snakeCrash.bind(this);
        map[events.CLIENT_SNAKE_ACTION]   = this.snakeAction.bind(this);
        map[events.CLIENT_APPLE_HIT]      = this.appleHit.bind(this);
        map[events.CLIENT_APPLE_SPAWN]    = this.appleSpawn.bind(this);
        map[events.CLIENT_POWERUP_HIT]    = this.powerupHit.bind(this);
        map[events.CLIENT_POWERUP_SPAWN]  = this.powerupSpawn.bind(this);
        map[events.CLIENT_SNAKE_SPEED]    = this.snakeSpeed.bind(this);

        return map;
    },

    disconnect: function() {
        XSS.util.error('CONNECTION LOST', function() {
            if (XSS.room) {
                XSS.room.destruct();
            }
        });
    },

    /**
     * @param {number} time
     */
    clientPing: function(time) {
        XSS.socket.emit(XSS.events.SERVER_PING, time);
    },

    /**
     * Combined package, delegate.
     * @param {Array.<Array>} data
     */
    combinedEvents: function(data) {
        for (var i = 0, m = data.length; i < m; i++) {
            this.handleMessage({
                data: data[i]
            });
        }
    },

    /**
     * @param {Array} data
     */
    roomStatus: function(data) {
        XSS.pubsub.publish(XSS.PUB_ROOM_STATUS, data);
    },

    /**
     * @param {Array} data
     */
    roomIndex: function(data) {
        if (!XSS.room) {
            XSS.room = new Room(
                data[0], // index
                data[1], // capacity
                data[2], // round
                data[3], // key
                data[4], // level
                data[5], // names
                data[6]  // score
            );
        } else {
            XSS.room.update.apply(XSS.room, data);
        }
    },

    /**
     * @param {Array} data
     */
    updateScore: function(data) {
        XSS.room.score.updateScore(data[0], data[1]);
    },

    /**
     * @param {Array} data
     */
    chatMessage: function(data) {
        XSS.room.chat.add({author: data[0], body: data[1]});
    },

    /**
     * @param {string} notice
     */
    chatNotice: function(notice) {
        if (XSS.room) {
            XSS.room.chat.add({body: notice});
        }
    },

    gameCountdown: function() {
        XSS.room.game.countdown();
        XSS.room.unbindKeys();
    },

    gameStart: function() {
        XSS.room.game.start();
    },

    /**
     * Combined package, delegate.
     * @param {Array.<Array>} data
     */
    gameSnakes: function(data) {
        for (var i = 0, m = data.length; i < m; i++) {
            this.snakeUpdate(data[i]);
        }
    },

    /**
     * @param {Array} data
     */
    snakeUpdate: function(data) {
        var snake = XSS.room.game.snakes[data[0]];
        snake.limbo = false;
        snake.parts = data[1];
        snake.direction = data[2];
    },

    /**
     * @param {Array} data
     */
    snakeSize: function(data) {
        var snake = XSS.room.game.snakes[data[0]];
        snake.size = data[1];
    },

    /**
     * @param {Array} data
     */
    snakeCrash: function(data) {
        var snake;
        snake = XSS.room.game.snakes[data[0]];
        snake.parts = data[1];
        snake.crash();
    },

    /**
     * @param {Array} data
     */
    snakeAction: function(data) {
        var snake = XSS.room.game.snakes[data[0]];
        snake.showAction(data[1]);
    },

    /**
     * @param {Array} data
     */
    appleHit: function(data) {
        var game = XSS.room.game;
        game.snakes[data[0]].size = data[1];
        game.apples[data[2]].destruct();
        game.apples[data[2]] = null;
    },

    /**
     * @param {Array} data
     */
    appleSpawn: function(data) {
        var index = data[0], location = data[1];
        XSS.room.game.apples[index] = new Apple(index, location[0], location[1]);
    },

    /**
     * @param {Array} data
     */
    powerupHit: function(data) {
        var game = XSS.room.game;
        game.powerups[data[1]].destruct();
        game.powerups[data[1]] = null;
    },

    /**
     * @param {Array} data
     */
    powerupSpawn: function(data) {
        var index = data[0], location = data[1];
        XSS.room.game.powerups[index] = new Powerup(index, location[0], location[1]);
    },

    /**
     * @param {Array} data
     */
    snakeSpeed: function(data) {
        var game = XSS.room.game;
        game.snakes[data[0]].speed = data[1];
    }

};
