'use strict';

/* global describe, it */

var pathlib = require('path');
var Stream = require('stream');
var expect = require('chai').expect;
var gulp = require('gulp');
var rename = require('gulp-rename');

var run = require('../');


describe('gulp-run', function () {

	var sampleFilename = pathlib.join(__dirname, 'sample.input.txt');


	it('includes `node_modules/.bin` on the PATH', function (done) {
		var nodeModulesPath = pathlib.join(__dirname, '..', '..', '.bin');
		run('echo $PATH', {verbosity:0}).exec()
			.pipe(compare(new RegExp('^' + nodeModulesPath)))
			.on('finish', done);
	});


	it('lets you set the initial cwd of the command', function (done) {
		run('pwd', {cwd:'/', verbosity:0}).exec()
			.pipe(compare('/\n'))
			.on('finish', done);
	});


	it('supports verbosity levels', function (done) {
		var colors = require('gulp-util').colors;

		// Stub out stdout.write to write into the string `writtenOutput`
		var stdoutWrite = process.stdout.write;
		var writtenOutput = '';
		process.stdout.write = function (chunk, enc, callback) {
			writtenOutput += chunk.toString(enc);
			if (typeof callback === 'function') process.nextTick(callback);
		};

		var s = new Semaphore(3, function() {
			// Restore process.stdout before exiting
			process.stdout.write = stdoutWrite;
			return done();
		});

		(new run.Command('echo "testing verbosity:0"', {verbosity:0}))
			.exec(function () {
				expect(writtenOutput).to.match(/^$/);
				writtenOutput = '';
				s.done();
			});

		(new run.Command('echo "testing verbosity:1"', {verbosity:1}))
			.exec(function () {
				var output = colors.stripColor(writtenOutput);
				expect(output).to.match(/\[.*\] \$ echo "testing verbosity:1" # Silenced\s*\n/);
				writtenOutput = '';
				s.done();
			});

		(new run.Command('echo "testing verbosity:2"', {verbosity:2}))
			.exec(function () {
				var output = colors.stripColor(writtenOutput);
				expect(output).to.match(/\[.*\] \$ echo "testing verbosity:2"\s*\ntesting verbosity:2/);
				s.done();
			});
	});


	describe('in a vinyl pipeline', function () {

		it('works with buffers', function (done) {
			// Use awk to extract the even lines of a file
			gulp.src(sampleFilename, {buffer:true})
				.pipe(run('awk "NR % 2 == 0"', {verbosity:0}))
				.pipe(compare('2\n4\n6\n8\n10\n12\n'))
				.on('finish', done);
		});


		it('works with streams', function (done) {
			// Use awk to extract the even lines of a file
			gulp.src(sampleFilename, {buffer:false})
				.pipe(run('awk "NR % 2 == 0"', {verbosity:0}))
				.pipe(compare('2\n4\n6\n8\n10\n12\n'))
				.on('finish', done);
		});


		it('supports command templates, i.e. `echo <%= file.path %>`', function (done) {
			gulp.src(sampleFilename)
				.pipe(run('echo <%= file.path %>', {verbosity:0}))
				.pipe(compare(sampleFilename + '\n'))
				.on('finish', done);
		});


		it('emits an `error` event on a failed command', function (done) {
				gulp.src(sampleFilename)
					.pipe(run('exit 1', {verbosity:0}))
					.on('error', noop(done));
		});

	});


	describe('direct execution (`.exec`)', function () {

		it('is asynchronous (this test sleeps for 1s)', function (done) {
			var s = new Semaphore(2, done);
			var startTime = process.hrtime()[0]; // Current time in seconds

			for (var i = 0; i < 2; i += 1) {
				run('sleep 1', {verbosity:0})
					.exec(function () {
						var delta = process.hrtime()[0] - startTime;
						expect(delta).to.equal(1);
						s.done();
					});
			}
		});


		it('returns a vinyl stream wrapping stdout', function (done) {
			run('echo Hello World', {verbosity:0})
				.exec()
				.pipe(compare('Hello World\n'))
				.on('finish', done);
		});


		it('emits an `error` event on a failed command', function (done) {
			run('exit 1', {verbosity:0})
				.exec()
				.on('error', noop(done));
		});


		it('closes the stream when done', function (done) {
			run('echo Hello World', {verbosity:0})
				.exec()
				.on('finish', done);
		});

	});


	describe('reported issues', function () {

		it('#18 -- file names and paths', function (done) {
			run("echo hello world", {cwd: './', verbosity:0}).exec()
				.pipe(rename("dest.txt"))
				.on('finish', done);
		});

	});
});



/// Helpers
/// --------------------------------------------------

// Returns a no-op function. If a callback is given, it is called when the
// returned function is called. This is useful for wrapping functions to ignore
// arguments.
function noop(callback) {
	if (typeof callback != 'function') {
		callback = function(){};
	}
	return function () {
		callback()
	};
}

// Constructs an async-semaphore that calls back when semaphore#done()
// has been called a given number of times.
function Semaphore(count, callback) {
	this.done = function () {
		count -= 1;
		return (count <= 0) ? callback() : this;
	};
	return this;
}


// Returns a pass-through Vinyl stream that throws an error if the contents of
// the incoming file doesn't match a pattern.
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
