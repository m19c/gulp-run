'use strict';

var childProcess = require('child_process');
var pathlib = require('path');
var stream = require('stream');
var util = require('util');

var _ = require('lodash');
var Vinyl = require('vinyl');
var log = require('gulp-util').log;
var colors = require('gulp-util').colors;


// new Command(template, [opts])
// --------------------------------------------------
// Creates a command that can be executed later.

module.exports = function Command(template, opts) {

	// The first argument may be a template interpolating the vinyl file under the name `file`
	// We create a function that returns the command to execute as a string. See lodash templates
	var commandBuilder = _.template(template);

	// The cwd and environment of the command are the same as the main node process by default.
	opts = _.defaults(opts||{}, {
		cwd: process.cwd(),
		env: process.env,
		silent: false,
		verbosity: (opts && opts.silent) ? 1 : 2
	});

	// Include node_modules/.bin on the path when we execute the command.
	var isWindows = /^win/.test(process.platform);
	var oldPath = opts.env.PATH;
	opts.env.PATH = pathlib.join(__dirname, '..', '..', 'node_modules', '.bin');
	opts.env.PATH += (isWindows) ? ';' : ':';
	opts.env.PATH += oldPath;


	// Command#exec([stdin], [callback])
	// --------------------------------------------------
	// Execute the command, invoking the callback when the command exits.
	// Returns a Vinyl file wrapping the command's stdout.

	this.exec = function exec(stdin, callback) {

		// Parse the arguments, both are optional
		if (typeof arguments[0] === 'function') {
			callback = arguments[0];
			stdin = undefined;
		} else if (typeof callback !== 'function') {
			callback = function(){};
		}
		if (!(stdin instanceof Vinyl)) {
			var defaultName = template.split(' ')[0];
			if (typeof stdin === 'string') {
				stdin = new Vinyl({
					path: defaultName,
					contents: new Buffer(stdin)
				});
			} else if (stdin instanceof Buffer || stdin instanceof stream.Readable) {
				stdin = new Vinyl({
					path: defaultName,
					contents: stdin
				});
			} else {
				stdin = new Vinyl(stdin);
				if (stdin.path === null) stdin.path = defaultName;
			}
		}

		// We spawn the command in a subshell, so things like I/O redirection just work.
		// i.e. `echo hello world >> ./hello.txt` works as expected.
		var command = commandBuilder({file:stdin});
		var subshell;
		if (isWindows) {
			subshell = childProcess.spawn('cmd.exe', ['/c', command], {env:opts.env, cwd:opts.cwd});
		} else {
			subshell = childProcess.spawn('sh', ['-c', command], {env:opts.env, cwd:opts.cwd});
		}

		// Setup the logs. The stdout of the command only makes it to the logs if the verbosity
		// was greater than 2. The stderr is always written to the logs.
		var logStream = new stream.PassThrough();
		if (opts.verbosity >= 2) {
			subshell.stdout.pipe(logStream);
		}
		subshell.stderr.pipe(logStream);

		// Once the command is done, we print the logs to the main process's stdout and call
		// the callback. We consider it an error if the command returned a non-zero exit code.
		subshell.once('close', function (code) {
			if (opts.verbosity >= 1) {
				log('$ ' + colors.blue(command)
				    + ((opts.verbosity < 2) ? colors.grey(' # Silenced') : ''));
				var logContents = logStream.read();
				if (logContents !== null) process.stdout.write(logContents);
			}
			if (code !== 0) {
				var errmsg = util.format('Command `%s` exited with code %s', command, code);
				var err = new Error(errmsg);
				err.status = code;
				return callback(err);
			}
			callback(null);
		});

		// Get the party started by writing to the subshell's stdin
		// and return a vinyl file wrapping subshell's stdout.
		var stdout = new Vinyl(stdin);
		stdout.contents = subshell.stdout.pipe(new stream.PassThrough());
		stdin.pipe(subshell.stdin);
		return stdout;
	};


	// Command#toString()
	// --------------------------------------------------
	// Returns the command template

	this.toString = function toString() {
		return template;
	};

};
