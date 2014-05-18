/// gulp-run
/// ==================================================
/// Pipe to shell commands in gulp.

'use strict';

var child_process = require('child_process');
var stream = require('stream');

var _ = require('lodash');
var colorize = require('ansi-color').set;
var Vinyl = require('vinyl');


/// `var cmd = run(command, [options])`
/// --------------------------------------------------
/// Gets a through stream for a shell command to which you can pipe vinyl files. For each file
/// piped, a new process is spawned, the file is read into the processes's stdin, and a file
/// containing the processes's stdout is pushed.
///
/// Additionally, `./node_modules/.bin` is prepended to the PATH for the child process, so you have
/// access to all the binaries provided by your module's dependencies.
///
/// ### Arguments
/// 1. `command` *(String)*: The command to run. It can be a [template] interpolating the vinyl file
///     as the variable `file`.
/// 2. `[options]` *(Object)*:
///     - `silent` *(Boolean)*: If true, tee the command's output to `process.stdout` and
///         `process.stderr` where appropriate with each line prepended by the string **"[*title*]
///         "** where *title* is the command's name. Defaults to `false`.
///     - `color` *(String)*: The color in which the title is printed. Defaults to `'cyan'` to
///         distinguish the output of `gulp-run` from `gulp` proper.
///
/// [template]: http://lodash.com/docs#template
///
/// ### Returns
/// *(stream.Transform in Object Mode)*: The through stream you so desire.
///
/// ### Example
/// ```javascript
/// gulp.task('even-lines', function () {
///     gulp.src('path/to/input/*')            // Get input files.
///         .pipe(run('awk "NR % 2 == 0"'))    // Use awk to extract the even lines.
///         .pipe(gulp.dest('path/to/output')) // Profit.
/// })
/// ```

var run = module.exports = function (command, opts) {
	var command_stream = new stream.Transform({objectMode: true}); // The stream of vinyl files.

	// Options
	opts = _.defaults(opts||{}, {
		color: 'cyan',
		silent: false
	});

	// Compile the command template
	var command_template = _.template(command);


	// `exec(command, [stdin], [callback])`
	// --------------------------------------------------
	// TODO: Document

	var exec = function (command, stdin, callback) {
		var child; // The child process.
		var env; // The environmental variables for the child.
		var out_stream; // The contents of the returned vinyl file.

		// Parse arguments.
		if (typeof arguments[1] === 'function') {
			stdin = null;
			callback = arguments[1];
		}

		// Message.
		if (!opts.silent) console.log('[' + colorize('gulp-run', 'green') + '] ' + command);

		// Setup env.
		env = process.env;
		env.PATH = './node_modules/.bin:' + env.PATH;

		// Spawn the process.
		child = child_process.spawn('sh', ['-c', command], {env:env});
		child.on('close', function (code) {
			var err;
			if (code !== 0) {
				err = 'Exited with status code ' + code;
				if (!opts.silent) console.error('[' + colorize('gulp-run', 'red') + '] ' + err);
			}
			if (typeof callback === 'function') {
				process.nextTick(callback.bind(undefined, err));
			}
		});

		// Handle input.
		if (stdin && typeof stdin.pipe === 'function') {
			stdin.pipe(child.stdin);
		} else if (stdin !== undefined && stdin !== null) {
			child.stdin.end(stdin.toString());
		} else {
			child.stdin.end();
		}

		// Handle output.
		out_stream = new stream.Transform();
		out_stream._transform = function (chunk, enc, callback) {
			out_stream.push(chunk);
			if (!opts.silent) process.stdout.write(chunk.toString());
			process.nextTick(callback);
		};
		child.stdout.pipe(out_stream);

		// Return a vinyl file wrapping the command's stdout.
		return new Vinyl({
			path: command.split(/\s+/)[0], // first word of the command
			contents: out_stream
		});

	}


	// This method is called automatically for each file piped into the stream. It spawns a
	// command for each file, using the file's contents as stdin, and pushes downstream a new file
	// wrapping stdout.

	command_stream._transform = function (file, enc, done) {
		var output;

		// Null files pass through
		if (file.isNull()) {
			command_stream.push(file);
			process.nextTick(done);
			return;
		}

		// Spawn the command.
		output = exec(command_template({file:file}), file, function (err) {
			if (err) command_stream.emit('error', err);
		});

		// Push downstream a vinyl file wrapping the command's stdout.
		command_stream.push(output);
	}


	/// `cmd.exec([callback])`
	/// --------------------------------------------------
	/// Executes the command immediately, returning a stream of vinyl. A single file containing
	/// the command's stdout is pushed down the stream.
	///
	/// The name of the file pushed down the stream is the first word of the command.
	/// See [gulp-rename] if you need more flexibility.
	///
	/// ### Arguments
	/// 1. `[callback]` *(Function)*: Execution is asynchronous. The callback is called once the
	///     command's stdout has closed.
	///
	/// ### Returns
	/// *(stream.Readable in Object Mode)*: A stream containing exactly one vinyl file. The file's
	/// contents is the stdout stream of the command.
	///
	/// ### Example
	/// ```javascript
	/// gulp.task('hello-world', function () {
	///     run('echo Hello World').exec() // prints "[echo] Hello World\n"
	///         .pipe(gulp.dest('output')) // Writes "Hello World\n" to output/echo
	/// })
	/// ```

	command_stream.exec = function (callback) {
		var output; // A vinyl file whose contents is the stdout of the command.
		var wrapper; // The higher-level vinyl stream. `output` is the only thing piped through.

		// Spawn the command.
		output = exec(command_template(), null, function (err) {
			if (err) wrapper.emit('error', err);
			if (typeof callback === 'function') {
				process.nextTick(callback.bind(undefined, err));
			}
		});

		// Wrap the output in a vinyl stream.
		wrapper = new stream.PassThrough({objectMode:true});
		wrapper.end(output);

		return wrapper;
	}

	return command_stream;
}
