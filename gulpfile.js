var gulp = require('gulp');
var run = require('./');


gulp.task('build-parser', function (done) {
	run('canopy ./command-parser.peg').exec(done);
});


gulp.task('default', ['build-parser']);
