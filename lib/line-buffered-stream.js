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
		(typeof chunk === 'string') || (chunk = chunk.toString());

		// Write to the buffer, flushing on newlines.
		(function writeToBuffer(str) {
			var line_break = str.indexOf('\n') + 1;
			var line = str.substring(0, line_break);
			var remainder = str.substring(line_break);
			buffer += line;
			if (line_break > 0) {
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
}


LineBufferedStream.prototype = Object.create(stream.Transform.prototype);
