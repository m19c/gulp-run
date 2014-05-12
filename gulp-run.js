/// gulp-run
/// ==================================================
/// Pipe to shell commands in gulp.

'use strict';

var child_process = require('child_process');
var Stream = require('stream');

var _ = require('lodash');
var colorize = require('ansi-color').set;
var Vinyl = require('vinyl');


/// `var cmd = run(command)`
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
///
/// [template]: http://lodash.com/docs#template
///
/// ### Returns
/// *(Stream.Transform in Object Mode)*: The through stream you so desire.
///
/// ### Example
/// ```javascript
/// gulp.task('even-lines', function () {
/// 	gulp.src('path/to/input/*')            // Get input files.
/// 		.pipe(run('awk "NR % 2 == 0"'))    // Use awk to extract the even lines.
/// 		.pipe(gulp.dest('path/to/output')) // Profit.
/// })
/// ```

var run = module.exports = function (command) {

	// The environment for the child process.
	var env = process.env;
	env.PATH = './node_modules/.bin:' + env.PATH;

	// Compile the command template
	command = _.template(command);

	// The object we return.
	var command_stream = new Stream.Transform({objectMode: true});
	command_stream._transform = function (file, enc, done) {

		// Null files pass through
		if (file.isNull()) {
			command_stream.push(file);
			process.nextTick(done);
			return;
		}

		// Spawn the command
		var child = child_process.spawn('sh', ['-c', command({file:file})], {env:env});
		child.stdin.on('error', command_stream.emit.bind(command_stream, 'error'));
		child.stdout.on('error', command_stream.emit.bind(command_stream, 'error'));
		file.pipe(child.stdin);

		// Streams - pass the child's stdout through
		if (file.isStream()) {
			file.contents = child.stdout;
			command_stream.push(file);
			process.nextTick(done);
			return;
		}

		// Buffers - buffer the entire output before continuing the pipeline
		if (file.isBuffer()) {
			file.contents = new Buffer(0);
			var stdout = child.stdout;
			stdout.on('readable', function () {
				var chunk = stdout.read()
				if (chunk !== null) {
					file.contents = Buffer.concat(
						[file.contents, chunk],
						file.contents.length + chunk.length
					);
				}
			});
			stdout.on('end', function () {
				command_stream.push(file);
				process.nextTick(done);
			});
			return;
		}

		// Else - can't handle the file
		command_stream.emit('error');
		throw new Error("Received a file that is neither a stream nor a buffer");
	}


	/// `cmd.exec([options], [callback])`
	/// --------------------------------------------------
	/// Executes the command immediately, returning the output as a stream of vinyl. Use this
	/// method to start a pipeline in gulp. The name of the file pushed down the pipe is the first
	/// word of the command. I recommend [gulp-rename] for renaming.
	///
	/// ### Arguments
	/// 1. `[options]` *(Object)*: If `options` is `true`, it is treated as `{print: true}`.
	///     - `print` *(Boolean)*: If true, tee the command's output to `process.stdout` with each
	///         line prepended by the string **"[*title*] "** where *title* is the command's name.
	///         Defaults to `false`.
	///     - `color` *(String)*: The color in which the title is printed. Defaults to `'cyan'` to
	///         distinguish the output of `gulp-run` from `gulp` proper.
	/// 2. `[callback]` *(Function)*: Execution is asynchronous. The callback is called once the
	///     command's stdout has closed.
	///
	/// ### Returns
	/// *(Stream.Readable in Object Mode)*: A stream containing exactly one vinyl file. The file's
	/// contents is the stdout stream of the command.
	///
	/// ### Example
	/// ```javascript
	/// gulp.task('hello-world', function () {
	/// 	run('echo Hello World').exec(true) // prints "[echo] Hello World\n"
	/// 		.pipe(gulp.dest('output/dir')) // Writes "Hello World\n" to output/dir/echo
	/// })
	/// ```

	command_stream.exec = function (opts, callback) {
		// Parse arguments
		if (typeof arguments[0] === 'function') {
			callback = arguments[0];
			opts = undefined;
		}
		if (opts === true) {
			opts = {
				print: true
			}
		}
		opts = _.defaults(opts||{}, {
			print: false,
			color: 'cyan'
		});

		// Spawn the command
		var cmd = command({file:file});
		var title = cmd.split(/\s+/)[0];
		var child = child_process.spawn('sh', ['-c', command({file:file})], {env:env});
		child.stdin.end();

		// Setup callback
		if (typeof callback === 'function') {
			child.stdout.on('end', callback);
		}

		// A stream to tee input to stdout
		var tee = new Stream.Transform();
		tee._transform = function (chunk, enc, done) {
			var lines = chunk.toString().split('\n');
			lines.forEach(function (line, index) {
				// Skip the last line if it's blank
				if (index === lines.length - 1 && line.length <= 1) return;
				process.stdout.write('[' + colorize(title, opts.color) + '] ' + line + '\n');
			});
			tee.push(chunk);
			process.nextTick(done);
			return;
		}

		// The file to be pushed down stream
		var file = new Vinyl({
			contents: (opts.print) ? child.stdout.pipe(tee) : child.stdout,
			path: title
		});

		// The vinyl stream
		var stream = new Stream.Transform({objectMode:true});
		stream._transform = function (file, enc, done) {
			stream.push(file);
			process.nextTick(done);
		};
		stream.end(file);
		child.stdin.on('error', stream.emit.bind(stream, 'error'));
		child.stdout.on('error', stream.emit.bind(stream, 'error'));
		return stream;
	}

	return command_stream;
}
