// gulp-run
// ==================================================
// Pipe to shell commands in gulp.

'use strict';

var Transform = require('stream').Transform;

var Command = require('./lib/command');


// run(template, [opts])  /  new GulpRunner(template, [opts])
// --------------------------------------------------
// Creates a vinyl stream that spawns a command to process the input.

var GulpRunner = module.exports = function run(template, opts) {
	if (!(this instanceof GulpRunner)) {
		return new GulpRunner(template, opts);
	}

	// The command to run when processing input.
	var command = new Command(template, opts);

	// A GulpRunner is a Vinyl transform stream that uses the `command` to process input.
	Transform.call(this, {objectMode:true});
	this._transform = function _transform(file, enc, callback) {
		var newfile = command.exec(file, callback);
		this.push(newfile);
	};


	// GulpRunner#exec([stdin], [callback])
	// --------------------------------------------------
	// Writes stdin to itself, causing the command to be executed with that input.

	this.exec = function exec(stdin, callback) {
		this.write(stdin, callback);
		return this;
	};

};

GulpRunner.prototype = Transform.prototype;

GulpRunner.Command = Command;
