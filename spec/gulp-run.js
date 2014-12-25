'use strict';

/* global describe, it */

var pathlib = require('path');
var Stream = require('stream');
var expect = require('chai').expect;
var gulp = require('gulp');
var rename = require('gulp-rename');

var run = require('../');


// We have a lot of loggers listening on stdout
// process.stdout.setMaxListeners(Infinity);


describe('gulp-run', function () {

	var sampleFilename = pathlib.join(__dirname, 'sample.input.txt');


	it('includes `node_modules/.bin` on the PATH', function (done) {
		var nodeModulesPath = pathlib.join(__dirname, '..', '..', '.bin');
		run('echo $PATH', {verbosity:0}).exec()
			.pipe(compare(new RegExp('^' + nodeModulesPath)))
			.pipe(call(done));
	});


	it('lets you set the initial cwd of the command', function (done) {
		run('pwd', {cwd:'/', verbosity:0}).exec()
			.pipe(compare('/\n'))
			.pipe(call(done));
	});


	it('supports verbosity levels', function (done) {
		var colors = require('gulp-util').colors;

		// Stub out stdout.write
		var stdoutWrite = process.stdout.write;
		var writtenOutput = '';
		process.stdout.write = function (chunk, enc, callback) {
			writtenOutput += chunk.toString(enc);
			if (typeof callback === 'function') process.nextTick(callback);
		};

		var count = 0;
		function almostDone() {
			count += 1;
			if (count >= 3) {
				process.stdout.write = stdoutWrite;
				return done();
			}
		}

		(new run.Command('echo "testing verbosity:0"', {verbosity:0})).exec(function () {
			expect(writtenOutput).to.match(/^$/);
			writtenOutput = '';
			almostDone();
		});

		(new run.Command('echo "testing verbosity:1"', {verbosity:1})).exec(function () {
			var output = colors.stripColor(writtenOutput);
			expect(output).to.match(/\[.*\] \$ echo "testing verbosity:1" # Silenced\s*\n/);
			writtenOutput = '';
			almostDone();
		});

		(new run.Command('echo "testing verbosity:2"', {verbosity:2})).exec(function () {
			var output = colors.stripColor(writtenOutput);
			expect(output).to.match(/\[.*\] \$ echo "testing verbosity:2"\s*\ntesting verbosity:2/);
			almostDone();
		});
	});


	describe('in a vinyl pipeline', function () {

		it('works with buffers', function (done) {
			gulp.src(sampleFilename, {buffer:true})            // Each line is the line number.
				.pipe(run('awk "NR % 2 == 0"', {verbosity:0})) // Get the even lines with awk.
				.pipe(compare('2\n4\n6\n8\n10\n12\n'))         // Compare the output.
				.pipe(call(done));                             // Profit.
		});


		it('works with streams', function (done) {
			gulp.src(sampleFilename, {buffer:false})           // Each line is the line number.
				.pipe(run('awk "NR % 2 == 0"', {verbosity:0})) // Get the even lines with awk.
				.pipe(compare('2\n4\n6\n8\n10\n12\n'))         // Compare the output.
				.pipe(call(done));                             // Profit.
		});


		it('supports command templates, i.e. `echo <%= file.path %>`', function (done) {
			gulp.src(sampleFilename)
				.pipe(run('echo <%= file.path %>', {verbosity:0})) // echo the name of the file.
				.pipe(compare(sampleFilename + '\n'))
				.pipe(call(done));
		});


		it('emits an `error` event on a failed command', function (done) {
				gulp.src(sampleFilename)
					.pipe(run('exit 1', {verbosity:0})) // Non-zero exit code
					.on('error', function () {
						done();
					});
		});

	});


	describe('direct execution (`.exec`)', function () {

		it('is asynchronous (this test sleeps for 1s)', function (done) {
			var startTime = process.hrtime()[0]; // Current time in seconds
			run('sleep 1', {verbosity:0}).exec(function () {
				var delta = process.hrtime()[0] - startTime; // Time in seconds
				expect(delta).to.equal(1);
				done();
			});
		});


		it('returns a vinyl stream wrapping stdout', function (done) {
			run('echo Hello World', {verbosity:0}).exec() // Start a command with `.exec()`.
				.pipe(compare('Hello World\n'))           // stdout piped as a Vinyl file.
				.pipe(call(done));
		});


		it('emits an `error` event on a failed command', function (done) {
			run('exit 1', {verbosity:0}).exec() // Non-zero exit code
				.on('error', function () {
					done();
				});
		});

	});


	describe('reported issues', function () {

		it('#18', function (done) {
			run("echo hello world", {cwd: './', verbosity:0}).exec()
				.pipe(rename("dest.txt"))
				.pipe(call(done));
		});

	});
});



/// Helpers
/// --------------------------------------------------

// A stream that calls a function whenever a file is piped in.
function call(callback1) {
	var stream = new Stream.Transform({objectMode:true});
	stream._transform = function (file, enc, callback2) {
		this.push(file);
		callback1();
		process.nextTick(callback2);
	};
	return stream;
}


// A stream that throws if the contents of the incoming file doesn't match the argument.
function compare(match) {
	if (!(match instanceof RegExp)) {
		match = new RegExp('^' + match.toString() + '$');
	}
	var stream = new Stream.Transform({objectMode:true});
	stream._transform = function (file, end, callback) {
		var contents;

		if (file.isStream()) {
			var newFile = file.clone();
			newFile.contents = new Stream.Transform();
			newFile.contents._transform = function (chunk, enc, callback) {
				newFile.contents.push(chunk);
				return callback();
			};
			contents = '';
			file.contents.on('readable', function () {
				var chunk;
				(function loop() {
					chunk = file.contents.read();
					if (chunk) {
						contents += chunk;
						loop();
					}
				})();
			});
			file.contents.on('end', function () {
				expect(contents).to.match(match);
				newFile.contents.push(contents);
				newFile.contents.end();
				stream.push(newFile);
				process.nextTick(callback);
			});
			return;
		}

		contents = (file.isBuffer()) ? file.contents.toString() : file.contents;
		expect(contents).to.match(match);
		stream.push(file);
		process.nextTick(callback);
		return;
	};
	return stream;
}
