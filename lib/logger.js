'use strict';

var events = require('events');
var util = require('util');

var StreamBuffer = require('stream-buffer');


/// Logger
/// ==================================================
/// This inherits `LineBufferedStream`. We don't really *need* line buffering anymore, but I
/// did the work already, so why not...

/// var logger = new Logger(verbosity)
/// --------------------------------------------------
/// Creates a new logger with the given verbosity.

var Logger = module.exports = function (verbosity) {
	this.stream = new StreamBuffer();
	this.verbosity = verbosity;

	this.stream.on('error', function () {
		this.emit.apply(this, arguments);
	}.bind(this));
};


Logger.prototype = Object.create(new events.EventEmitter());


/// Logger.prototype.write(level, chunk, [encoding], [callback])
/// --------------------------------------------------
/// Write a chunk to the stream at the given level.
/// If the level is greater than the logger's verbosity, nothing is written.

Logger.prototype.write = function write(level, chunk, encoding, callback) {
	if (level <= this.verbosity) {
		this.stream.write(chunk, encoding, callback);
	} else {
		if (typeof arguments[2] === 'function') callback = arguments[2];
		if (typeof callback === 'function') process.nextTick(callback);
	}
};


/// Logger.prototype.log(level, message, [...])
/// --------------------------------------------------
/// Logs a formatted message at the given level, like `console.log(message, [...])`.

Logger.prototype.log = function log(level, message) {
	var messageParts = Array.prototype.slice.call(arguments, 1);
	message = util.format.apply(util, messageParts);
	this.write(level, message + '\n');
};


/// Logger.prototype.close()
/// --------------------------------------------------
/// End the log stream and cleanup.

Logger.prototype.close = function close() {
	this.stream.end();
	this.stream.unpipe();
};
