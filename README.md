gulp-run
==================================================
Pipe to shell commands in gulp.

`var run = require('gulp-run')`

`run(command)`
--------------------------------------------------
Gets a stream for a unix shell command to which you can pipe vinyl files (the stuff gulp
passes around). A child process is spawned for each file piped in, and the file is read into
the child processes's stdin. You can also run the command directly with
`run(command).exec(callback)`.

Additionally, `./node_modules/.bin` is prepended to the PATH for the child process, so you have
access to all the binaries provided by your module's dependencies.

### Arguments
1. `command` *(String)*: The command to run.

### Returns
*(stream.Transform in Object Mode)*: The stream you always wanted.

Use gulp-run in your pipeline
--------------------------------------------------
### Example

```javascript
gulp.task('even-lines', function () {
    // Extracts the even lines from the input files
    gulp.src('path/to/input/*')
        .pipe(run('awk "NR % 2 == 0"'))
        .pipe(gulp.dest('path/to/output'));
});
```

Use gulp-run as a standalone
--------------------------------------------------
### Example

```javascript
gulp.task('hello-world', function (callback) {
    run('echo Hello World').exec(callback);
});
```
