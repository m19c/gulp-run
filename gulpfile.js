var gulp = require('gulp');
var run = require('./');


gulp.task('build-parser', function (done) {
	run('canopy lib/command-parser.peg').exec(true)
		.pipe(call(done))
});


gulp.task('default', ['build-parser']);


/// Helpers
/// --------------------------------------------------
var Stream = require('stream');

// Get a vinyl stream that calls a function whenever a file is piped in.
var call = function (callback1) {
	var stream = new Stream.Transform({objectMode:true});
	stream._transform = function (file, enc, callback2) {
		this.push(file);
		process.nextTick(callback2);
		process.nextTick(callback1);
	}
	return stream;
}
