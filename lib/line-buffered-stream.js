'use strict';

var stream = require('stream');


/// LineBufferedStream
/// ==================================================
/// A transform stream that buffers the input until a newline is written.

var LineBufferedStream = module.exports = function () {
	stream.Transform.apply(this, {
		decodeStrings: false
	});

	// The line buffer.
	var buffer = '';

	// Pushes the buffer contents downstream.
	var flush = function () {
		this.push(buffer);
		buffer = '';
	}.bind(this);


	this._transform = function (chunk, encoding, callback) {
		if (typeof chunk === 'string') {
			chunk = chunk.toString();
		}

		// Write to the buffer, flushing on newlines.
		(function writeToBuffer(str) {
			var lineBreak = str.indexOf('\n') + 1;
			var line = str.substring(0, lineBreak);
			var remainder = str.substring(lineBreak);
			buffer += line;
			if (lineBreak > 0) {
				flush();
				writeToBuffer(remainder);
			} else {
				buffer += remainder;
			}
		})(chunk);

		process.nextTick(callback);
	};

	this._flush = function (callback) {
		flush();
		process.nextTick(callback);
	};
};


LineBufferedStream.prototype = Object.create(stream.Transform.prototype);
