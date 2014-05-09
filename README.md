gulp-run
==================================================
Pipe to shell commands in gulp.

`var run = require('gulp-run')`


`var cmd = run(command)`
--------------------------------------------------
Gets a stream for a Unix shell command to which you can pipe vinyl files (the stuff gulp
passes around). A child process is spawned for each file piped in, and the file is read into
the child processes's stdin. You can also run the command directly with
`run(command).exec(callback)`.

Additionally, `./node_modules/.bin` is prepended to the PATH for the child process, so you have
access to all the binaries provided by your module's dependencies.

### Arguments
1. `command` *(String)*: The command to run.

### Returns
*(Stream.Transform in Object Mode)*: The stream you always wanted.


`readable.pipe(cmd)` and `cmd.pipe(writeable)`
--------------------------------------------------
Use Unix commands in your pipeline.

Spawns a new child process of the command for each vinyl file piped. The file is taken as
the command's stdin, and a new vinyl file pushed containing the command's stdout.

### Example

```javascript
gulp.task('even-lines', function () {
    gulp.src('path/to/input/*')         // Get input files.
    .pipe(run('awk "NR % 2 == 0"'))     // Use awk to extract the even lines.
    .pipe(gulp.dest('path/to/output')); // Profit.
});
```


`cmd.exec([print])`
--------------------------------------------------
Executes the command immediatly, returning the output as a stream of vinyl.
Use this method to start a pipeline in gulp.


### Arguments
1. `[print]` *(Boolean)*: If true, tee the command's output to `process.stdout` with
each line prepended by the string "[*title*] " where *title* is the command's name.

### Returns
*(Stream.Readable in Object Mode)*: A stream containing exactly one vinyl file. The file's
contents is the stdout stream of the file.

### Example

```javascript
gulp.task('hello-world', function (callback) {
    run('echo Hello World').exec(true);
    // prints "[echo] Hello World\n"
});
```
