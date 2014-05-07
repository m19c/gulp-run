/// gulp-run
/// ==================================================
/// Pipe to shell commands in gulp.
///
/// `var run = require('gulp-run')`

'use strict';

var child_process = require('child_process');
var stream = require('stream');

var parser = require('./command-parser');


/// `run(command)`
/// --------------------------------------------------
/// Gets a stream for a unix shell command to which you can pipe vinyl files (the stuff gulp
/// passes around). A child process is spawned for each file piped in, and the file is read into
/// the child processes's stdin. You can also run the command directly with
/// `run(command).exec(callback)`.
///
/// Additionally, `./node_modules/.bin` is prepended to the PATH for the child process, so you have
/// access to all the binaries provided by your module's dependencies.
///
/// ### Arguments
/// 1. `command` *(String)*: The command to run.
///
/// ### Returns
/// *(stream.Transform in Object Mode)*: The stream you always wanted.

var run = module.exports = function (command) {

	// Parse the command.
	var ast = parser.parse(command);
	var cmd = ast.elements[0].textValue;
	var args = [];
	ast.elements[2].elements.forEach(function (arg_node) {
		args.push(arg_node.arg.textValue);
	});

	// The object we return.
	var ret = new stream.Transform({objectMode: true});

	// The environment for the child process.
	var env = process.env;
	env.PATH = './node_modules/.bin:' + env.PATH;


	/// Use gulp-run in your pipeline
	/// --------------------------------------------------
	/// ### Example
	///
	/// ```javascript
	/// gulp.task('even-lines', function () {
	///     // Extracts the even lines from the input files
	///     gulp.src('path/to/input/*')
	///         .pipe(run('awk "NR % 2 == 0"'))
	///         .pipe(gulp.dest('path/to/output'));
	/// });
	/// ```

	ret._transform = function (file, enc, done) {
		var push = this.push.bind(this);

		if (file.isNull()) {
			proc.stdin.push(null);
			push(file);
			return done();
		}

		var proc = child_process.spawn(cmd, args, {env:env});
		file.pipe(proc.stdin);

		if (file.isStream()) {
			proc.stdout.pipe(file.contents);
		} else {
			//asert(file.isBuffer());
			var transformed_text = '';
			proc.stdout.on('readable', function () {
				var chunk = proc.stdout.read();
				if (chunk != null) {
					transformed_text += chunk;
				}
			});
		}

		proc.stdout.on('close', function () {
			if (file.isBuffer()) {
				file.contents = new Buffer(transformed_text);
			}
			push(file);
			done();
		});
	}


	/// Use gulp-run as a standalone
	/// --------------------------------------------------
	/// ### Example
	///
	/// ```javascript
	/// gulp.task('hello-world', function (callback) {
	///     run('echo Hello World').exec(callback);
	/// });
	/// ```

	ret.exec = function (callback) {
		var proc = child_process.spawn(cmd, args, {env:env});

		proc.stdout.on('readable', function () {
			var line = proc.stdout.read(); // Assumes line buffering
			if (line !== null) {
				process.stdout.write('[' + cmd + ']' + ' ' + line);
			}
		})

		proc.stdout.on('close', function () {
			if (typeof callback === 'function') return callback();
		})
	}

	return ret;
}
