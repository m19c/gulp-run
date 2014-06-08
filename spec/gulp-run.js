'use strict';

var Path = require('path');
var Stream = require('stream');
var expect = require('chai').expect;
var gulp = require('gulp');
var run = require('../');


describe('gulp-run', function () {

	var sample_filename = Path.join(__dirname, 'sample.input.txt');


	it('includes `node_modules/.bin` on the PATH', function (done) {

		run('echo $PATH', {verbosity:0}).exec()
			.pipe(compare(/(^|:)[^:]+node_modules\/\.bin/))
			.pipe(call(done))

	});


	it('lets you set the initial cwd of the command', function (done) {

		run('pwd', {cwd:'/', verbosity:0}).exec()
			.pipe(compare('/\n'))
			.pipe(call(done))

	});


	describe('in a vinyl pipeline', function () {

		it('works with buffers', function (done) {

			gulp.src(sample_filename, {buffer:true})            // Each line is the line number.
				.pipe(run('awk "NR % 2 == 0"', {verbosity:0})) // Get the even lines with awk.
				.pipe(compare('2\n4\n6\n8\n10\n12\n'))         // Compare the output.
				.pipe(call(done))                              // Profit.

		});


		it('works with streams', function (done) {

			gulp.src(sample_filename, {buffer:false})           // Each line is the line number.
				.pipe(run('awk "NR % 2 == 0"', {verbosity:0})) // Get the even lines with awk.
				.pipe(compare('2\n4\n6\n8\n10\n12\n'))         // Compare the output.
				.pipe(call(done))                              // Profit.

		});


		it('supports command templates, i.e. `echo <%= file.path %>`', function (done) {

			gulp.src(sample_filename)
				.pipe(run('echo <%= file.path %>', {verbosity:0})) // echo the name of the file.
				.pipe(compare(sample_filename + '\n'))
				.pipe(call(done))

		});


		it('emits an `error` event on a failed command', function (done) {

				gulp.src(sample_filename)
					.pipe(run('exit 1', {verbosity:0})) // Non-zero exit code
					.on('error', function () {
						done();
					});

		});

	});


	describe('direct execution (`.exec`)', function () {

		it('is asynchronous (this test sleeps for 1s)', function (done) {

			var start_time = process.hrtime()[0]; // Current time in seconds

			// Sleep for 1s, then callback
			run('sleep 1', {verbosity:0}).exec(function () {
				var delta = process.hrtime()[0] - start_time; // Time in seconds
				expect(delta).to.equal(1);
				done();
			});

		});


		it('returns a vinyl stream wrapping stdout', function (done) {

			run('echo Hello World', {verbosity:0}).exec() // Start a command with `.exec()`.
				.pipe(compare('Hello World\n'))          // stdout piped as a Vinyl file.
				.pipe(call(done))

		});


		it('emits an `error` event on a failed command', function (done) {

			run('exit 1', {verbosity:0}).exec() // Non-zero exit code
				.on('error', function () {
					done();
				});

		});

	});
});



/// Helpers
/// --------------------------------------------------

// A stream that calls a function whenever a file is piped in.
var call = function (callback1) {
	var stream = new Stream.Transform({objectMode:true});
	stream._transform = function (file, enc, callback2) {
		this.push(file);
		process.nextTick(callback2);
		process.nextTick(callback1);
	}
	return stream;
}


// A stream that throws if the contents of the incoming file doesn't match the argument.
var compare = function (match) {
	if (!(match instanceof RegExp)) {
		match = new RegExp('^' + match.toString() + '$');
	}
	var stream = new Stream.Transform({objectMode:true});
	stream._transform = function (file, end, callback) {
		var contents;

		if (file.isStream()) {
			var new_file = file.clone();
			new_file.contents = new Stream.Transform();
			new_file.contents._transform = function (chunk, enc, callback) {
				new_file.contents.push(chunk);
				return callback();
			};
			contents = '';
			file.contents.on('readable', function () {
				var chunk;
				while (chunk = file.contents.read()) {
					contents += chunk;
				}
			});
			file.contents.on('end', function () {
				expect(contents).to.match(match);
				new_file.contents.push(contents);
				new_file.contents.end();
				stream.push(new_file);
				process.nextTick(callback);
			});
			return;
		}

		contents = (file.isBuffer()) ? file.contents.toString() : file.contents;
		expect(contents).to.match(match);
		stream.push(file);
		process.nextTick(callback);
		return;
	}
	return stream;
}


// A vinyl stream that tees the contents of the incoming file to the given text stream.
// Useful for debugging, like `stream.pipe(tee(process.stdout))` to print the stream.
var tee = function (out) {
	var stream = new Stream.Transform({objectMode:true});
	stream._transform = function (file, enc, callback) {
		var push = this.push.bind(this);

		if (file.isStream()) {
			var new_file = file.clone();
			new_file.contents = new Stream.Transform();
			new_file.contents._transform = function (chunk, enc, callback) {
				this.push(chunk);
				return callback();
			};
			file.contents.on('readable', function () {
				var chunk;
				while (chunk = file.contents.read()) {
					out.write(chunk);
					new_file.contents.write(chunk);
				}
			});
			file.contents.on('end', function () {
				new_file.contents.end();
				push(new_file);
				process.nextTick(callback);
			});
			return;
		}

		if (file.isBuffer()) {
			out.write(file.contents);
			push(file);
			process.nextTick(callback);
			return;
		}

		// Else - file.isNull()
		push(file);
		return;
	};
	return stream;
}
