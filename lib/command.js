'use strict';

var childProcess = require('child_process');
var pathlib = require('path');
var stream = require('stream');
var util = require('util');

var _ = require('lodash');
var Vinyl = require('vinyl');
var gutil = require('gulp-util');


// new Command(commandTemplate, [opts])
// --------------------------------------------------
// Creates a command that can be executed later.

module.exports = function Command(commandTemplate, opts) {

	// We're on Windows if `process.platform` starts with "win", i.e. "win32" or "win64".
	var isWindows = (process.platform.lastIndexOf('win') === 0);

	// The cwd and environment of the command are the same as the main node process by default.
	opts = _.defaults(opts||{}, {
		cwd: process.cwd(),
		env: process.env,
		silent: false,
		verbosity: (opts && opts.silent) ? 1 : 2
	});

	// Include node_modules/.bin on the path when we execute the command.
	var oldPath = opts.env.PATH;
	opts.env.PATH = pathlib.join(__dirname, '..', '..', '.bin');
	opts.env.PATH += pathlib.delimiter;
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
			var defaultName = commandTemplate.split(' ')[0];
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
		var command = _.template(commandTemplate, {file:stdin});
		var subshell;
		if (isWindows) {
			subshell = childProcess.spawn('cmd.exe', ['/c', command], {env:opts.env, cwd:opts.cwd});
		} else {
			subshell = childProcess.spawn('sh', ['-c', command], {env:opts.env, cwd:opts.cwd});
		}

		// Setup the logs. The stdout of the command is only logged if the verbosity is greater
		// than 2. The stderr is always logged.
		var logStream = new stream.PassThrough();
		if (opts.verbosity >= 2) {
			subshell.stdout.pipe(logStream);
		}
		subshell.stderr.pipe(logStream);

		// Invoke the callback once the command has finished.
		subshell.once('close', function (code) {

			// Print the logs (i.e. the stdout and stderr). We wait until the subshell has closed
			// to write all of the logs at once, avoiding race conditions with concurrent commands.
			if (opts.verbosity >= 1) {
				var logTitle = util.format(
					'$ %s %s',
					gutil.colors.blue(command),
					(opts.verbosity < 2) ? gutil.colors.grey('# Silenced') : ''
				);
				gutil.log(logTitle);
				var logContents = logStream.read();
				if (logContents !== null) process.stdout.write(logContents);
			}

			// We consider it an error if the command exited with a non-zero exit code.
			if (code !== 0) {
				var errmsg = util.format('Command `%s` exited with code %s', command, code);
				var err = new Error(errmsg);
				err.status = code;
				return callback(err);
			}

			callback(null);
		});

		// Get the party started by writing to the subshell's stdin
		// and return a Vinyl file wrapping subshell's stdout.
		var stdout = new Vinyl(stdin);
		stdout.contents = subshell.stdout.pipe(new stream.PassThrough());
		stdin.pipe(subshell.stdin);
		return stdout;
	};


	// Command#toString()
	// --------------------------------------------------
	// Returns the command template

	this.toString = function toString() {
		return commandTemplate;
	};

};
