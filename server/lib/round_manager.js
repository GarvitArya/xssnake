/*jshint globalstrict:true, es5:true, node:true, sub:true*/
'use strict';

var Score = require('./score.js');
var Round = require('./round.js');
var CONST = require('../shared/const.js');

/**
 * @param {Room} room
 * @constructor
 */
function RoundManager(room) {
    this.room = room;
    this.level = 0;
    this.round = new Round(room, this.level);
    this.score = new Score(room);
    this.started = false;

    this.roundsPlayed = 0;
}

module.exports = RoundManager;

RoundManager.prototype = {

    _nextRoundTimer: null,

    destruct: function() {
        clearTimeout(this._nextRoundTimer);
        this._xssRemoveListener();
        this.round.destruct();
        this.score.destruct();
        this.room = null;
        this.round = null;
        this.score = null;
    },

    start: function() {
        this.round.countdown();
        this.started = true;
    },

    addClient: function(client) {
        this.score.addClient(client);
    },

    removeClient: function(client) {
        this.round.removeClient(client);
        this.score.removeClient(client);
    },

    clientStart: function(client) {
        var room = this.room;
        if (room.isHost(client) && !this.started && room.clients.length > 1) {
            this.start();
        }
    },

    detectAutoStart: function() {
        if (this.room.isFull()) {
            this.start();
        }
    },

    delegateCrash: function() {
        this.score.dealKnockoutPoints(this.room);
        if (this.round.hasEnded() && !this.round.beingEnded) {
            this.round.beingEnded = true;
            this.endCurrentRound();
        }
    },

    /**
     * @return {boolean}
     */
    allRoundsPlayed: function() {
        return (this.roundsPlayed + 1 >= CONST.ROUNDS_MAX);
    },

    endCurrentRound: function() {
        var winner = this.score.getWinner();
        if (this.allRoundsPlayed() && winner) {
            this.endAllRounds(winner);
        } else {
            this.nextRoundStartDelay();
        }
    },

    nextRoundStartDelay: function() {
        var delay = this.round.allCrashed() ?
            CONST.TIME_ROUND_DELAY : CONST.TIME_GLOAT;

        this.room.emit(
            CONST.EVENT_CHAT_NOTICE, [CONST.NOTICE_NEW_ROUND, delay]
        );

        this._nextRoundTimer = setTimeout(
            this.nextRoundStart.bind(this), delay * 1000
        );
    },

    nextRoundStart: function() {
        this.roundsPlayed++;
        this.round.destruct();
        this.round = new Round(this.room, this.getNextLevel());
        this.round.countdown();
        this.room.emitState();
    },

    getNextLevel: function() {
        return ++this.level;
    },

    /**
     * @param {Client} winner
     */
    endAllRounds: function(winner) {
        if (this.room.options[CONST.FIELD_XSS]) {
            this._xssFetch(winner);
        } else {
            console.log('this.game.showHeaven(winner)');
        }
    },

    /**
     * @param {Client} winner
     */
    _xssFetch: function(winner) {
        var pubsub = this.room.server.pubsub;

        this._xssListener = function(xss, client) {
            if (client === winner) {
                this._xssFire(winner, xss);
                this._xssRemoveListener();
            }
        }.bind(this);

        setTimeout(this._xssRemoveListener.bind(this), 1000);

        pubsub.on(CONST.EVENT_XSS_REQ, this._xssListener);
        winner.emit(CONST.EVENT_XSS_REQ);
    },

    _xssRemoveListener: function() {
        this.room.server.pubsub.removeListener(
            CONST.EVENT_XSS_REQ, this._xssListener
        );
    },

    /**
     * @param {Client} winner
     * @param {string} xss
     */
    _xssFire: function(winner, xss) {
        winner.broadcast(CONST.EVENT_XSS_RES, xss);
    }

};
