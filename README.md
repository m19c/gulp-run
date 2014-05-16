gulp-run
==================================================
Use shell commands in your gulp or vinyl pipeline.

Many Unix commands are built around the idea of piping. Let's take advantage of that in our Gulp pipeline! This plugin is inspired by [gulp-shell] and [gulp-spawn] and attempts to improve upon their great work.


Usage
--------------------------------------------------

### `var run = require('gulp-run')`


API
--------------------------------------------------

### `var cmd = run(command, [options])`

Gets a through stream for a shell command to which you can pipe vinyl files. For each file piped, a new process is spawned, the file is read into the processes's stdin, and a file containing the processes's stdout is pushed.

Additionally, `./node_modules/.bin` is prepended to the PATH for the child process, so you have access to all the binaries provided by your module's dependencies.

#### Arguments
1. `command` *(String)*: The command to run. It can be a [template] interpolating the vinyl file as the variable `file`.
2. `[options]` *(Object)*: If `options` is `true`, it is treated as `{print: true}`.
    - `print` *(Boolean)*: If true, tee the command's output to `process.stdout` with each
        line prepended by the string **"[*title*] "** where *title* is the command's name.
        Defaults to `false`.
    - `color` *(String)*: The color in which the title is printed. Defaults to `'cyan'` to
        distinguish the output of `gulp-run` from `gulp` proper.

#### Returns
*(Stream.Transform in Object Mode)*: The through stream you so desire.

#### Example
```javascript
gulp.task('even-lines', function () {
    gulp.src('path/to/input/*')            // Get input files.
        .pipe(run('awk "NR % 2 == 0"'))    // Use awk to extract the even lines.
        .pipe(gulp.dest('path/to/output')) // Profit.
})
```


### `cmd.exec([options], [callback])`

Executes the command immediately, returning the output as a stream of vinyl. Use this
method to start a pipeline in gulp. The name of the file pushed down the pipe is the first
word of the command. I recommend [gulp-rename] for renaming.

#### Arguments
1. `[callback]` *(Function)*: Execution is asynchronous. The callback is called once the
    command's stdout has closed.

#### Returns
*(Stream.Readable in Object Mode)*: A stream containing exactly one vinyl file. The file's contents is the stdout stream of the command.

#### Example
```javascript
gulp.task('hello-world', function () {
    run('echo Hello World').exec(true) // prints "[echo] Hello World\n"
        .pipe(gulp.dest('output/dir')) // Writes "Hello World\n" to output/dir/echo
})
```


The ISC License
--------------------------------------------------

Copyright (c) 2014 Chris Barrick <cbarrick1@gmail.com>

Permission to use, copy, modify, and/or distribute this software for any purpose with or without fee is hereby granted, provided that the above copyright notice and this permission notice appear in all copies.

THE SOFTWARE IS PROVIDED "AS IS" AND THE AUTHOR DISCLAIMS ALL WARRANTIES WITH REGARD TO THIS SOFTWARE INCLUDING ALL IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS. IN NO EVENT SHALL THE AUTHOR BE LIABLE FOR ANY SPECIAL, DIRECT, INDIRECT, OR CONSEQUENTIAL DAMAGES OR ANY DAMAGES WHATSOEVER RESULTING FROM LOSS OF USE, DATA OR PROFITS, WHETHER IN AN ACTION OF CONTRACT, NEGLIGENCE OR OTHER TORTIOUS ACTION, ARISING OUT OF OR IN CONNECTION WITH THE USE OR PERFORMANCE OF THIS SOFTWARE.



[gulp-rename]: https://github.com/hparra/gulp-rename
[gulp-shell]: https://github.com/sun-zheng-an/gulp-shell
[gulp-spawn]: https://github.com/hparra/gulp-spawn
[template]: http://lodash.com/docs#template
