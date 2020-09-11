/**
 * A StreamWatcher object takes a process and monitors its standard out for 
 * certain user defined regex patterns.  When these patterns are seen, a 
 * registered callback function will be run.
 */

module.exports = StreamWatcher;

/**
 * Creates a new StreamWatcher that watches the given child_process
 * @param child_process the result of a call to child_process.spawn
 */
function StreamWatcher(childProcess) {
    if (!childeProcess)
        throw new Error("Invalid child process");

    this._process = childProcess;
    this._patterns = [];
    this._callbacks = [];
    this._process.stdout.on('data', (data) => this._onData(data));
    this._process.stderr.on('data', (data) => this._onData(data));
}

/**
 * Takes a regex pattern and a callback and exectues the callback whenever the
 * pattern matches the output from child_process.  It is not gauranteed that the
 * regex will only be run on a single line of output.
 *
 * @param pattern A regular expression
 * @pararm callback A callback that will be passed the child process's stdin
 *                  and the results of executing the pattern on the string when
 *                  the pattern matches.
 */
StreamWatcher.prototype.addWatcher = function(pattern, callback) {
    if (!pattern)
        throw new Error("Invalid pattern");
    if (!callback)
        throw new Error("Invalid callback");

    this._patterns.push(pattern);
    this._callbacks.push(callback);
}

/**
 * Adds a callback that will be executed when the child process finishes 
 * executing.
 *
 * @param callback The function to call on the child process's exit.
 */
StreamWatcher.prototype.addOnExit = function(callback) {
    this._process.on("exit", callback);
}

StreamWatcher.prototype._onData = function(data) {
    let strData = String(data);
    for (let i = 0; i < this._patterns.length; i++) {
        let pattern = this._patterns[i];
        let result = pattern.exec(strData);
        if (result != null) {
            let func = this._callbacks[i];
            func(this._process.stdin, result);
        }
    }
}