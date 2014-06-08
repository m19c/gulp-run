/// gulp-run
/// ==================================================
/// Pipe to shell commands in gulp.

'use strict';

var childProcess = require('child_process');
var pathlib = require('path');
var stream = require('stream');

var _ = require('lodash');
var color = require('cli-color');
var Vinyl = require('vinyl');

var Logger = require('./lib/logger');


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
///     - `env` *(Object)*: The environmental variables for the child process. Defaults to
///         `process.env`. The path `node_modules/.bin` is automatically prepended to the PATH.
///     - `cwd` *(String)*: The initial working directory for the child process. Defaults to
///         `process.cwd()`.
///     - `silent` *(Boolean)*: If true, do not print the command's output. This is the same as
///         setting verbosity to 1. Defaults to `false`.
///     - `verbosity` *(Number)*: Sets the verbosity level. Defaults to `2`.
///         - `0` never outputs anything.
///         - `1` outputs basic logs.
///         - `2` outputs basic logs and the stdout of the child process.
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

module.exports = function (command, opts) {
	var commandStream = new stream.Transform({objectMode: true}); // The stream of vinyl files.

	// Options
	opts = _.defaults(opts||{}, {
		cwd: process.cwd(),
		env: process.env,
		silent: false,
		verbosity: (opts && opts.silent) ? 1 : 2
	});

	// If `opts.silent` and `opts.verbosity` disagree, verbosity wins
	opts.silent = (opts && opts.verbosity < 2) ? true : false;

	// Compile the command template.
	var commandTemplate = _.template(command);


	// exec(command, [input], [callback])
	// --------------------------------------------------
	// TODO: Document

	var exec = function (command, input, callback) {
		var child; // The child process.
		var outStream; // The contents of the returned vinyl file.

		// Parse arguments.
		if (typeof arguments[1] === 'function') {
			input = null;
			callback = arguments[1];
		}

		// Setup logging.
		var logger = new Logger(opts.verbosity);
		logger.stream.pipe(process.stdout);

		// Log start message.
		var startMessage = '$ ' + color.cyan(command);
		if (input && input.relative) {
			startMessage += ' < ' + color.magenta(input.relative);
		}
		if (opts.silent) {
			startMessage += color.blackBright(' # Silenced');
		}
		logger.log(1, startMessage);

		// Setup environment of child process.
		opts.env.PATH = pathlib.join(__dirname, '../../node_modules', '.bin') + ':' + opts.env.PATH;

		// Spawn the process.
		child = childProcess.spawn('sh', ['-c', command], {env:opts.env, cwd:opts.cwd});

		// When the child process is done.
		child.on('close', function (code) {
			var err; // Only defined if an error occured

			// Handle errors
			if (code !== 0) {
				var errorMessage = "`" + command + "` exited with code " + code;
				err = new Error(errorMessage);
				logger.log(1, errorMessage);
			}

			if (typeof callback === 'function') {
				process.nextTick(callback.bind(undefined, err));
			}
		});

		// Handle input.
		if (input && typeof input.pipe === 'function') {
			input.pipe(child.stdin);
		} else if (input !== undefined && input !== null) {
			child.stdin.end(input.toString());
		} else {
			child.stdin.end();
		}

		// Handle output.
		outStream = new stream.Transform();
		outStream._transform = function (chunk, enc, callback) {
			outStream.push(chunk);
			logger.write(2, chunk, enc, callback);
		};
		child.stdout.pipe(outStream);
		child.stderr.pipe(logger.stream);

		// Return a vinyl file wrapping the command's stdout.
		return new Vinyl({
			path: command.split(/\s+/)[0], // first word of the command
			contents: outStream
		});

	};


	// The stream.Transform interface
	// --------------------------------------------------
	// This method is called automatically for each file piped into the stream. It spawns a
	// command for each file, using the file's contents as stdin, and pushes downstream a new file
	// wrapping stdout.

	commandStream._transform = function (file, enc, done) {
		var output;

		file.base = process.cwd();

		// Spawn the command.
		output = exec(commandTemplate({file:file}), file, function (err) {
			if (err) commandStream.emit('error', err);
			else process.nextTick(done);
		});

		// Push downstream a vinyl file wrapping the command's stdout.
		commandStream.push(output);
	};


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

	commandStream.exec = function (callback) {
		var output; // A vinyl file whose contents is the stdout of the command.
		var wrapper; // The higher-level vinyl stream. `output` is the only thing piped through.

		// Spawn the command.
		output = exec(commandTemplate(), null, function (err) {
			if (err) wrapper.emit('error', err);
			if (typeof callback === 'function') {
				process.nextTick(callback.bind(undefined, err));
			}
		});

		// Wrap the output in a vinyl stream.
		wrapper = new stream.PassThrough({objectMode:true});
		wrapper.end(output);

		return wrapper;
	};

	return commandStream;
};
