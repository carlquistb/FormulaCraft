/*
	Project: FormulaCraft

	mineShell is a Node script that will be executed by the userdata of ec2 instances brought online
	by the AutoStack Cloudformation stack.  This utilizes a child process to run Minecraft Server
	inside this script.

	This script will handle boot up and boot down of the .jar file.

*/
const StreamWatcher = require('./StreamWatcher.js');
const PlayerWatcher = require('./PlayerWatcher.js');
const fs = require('fs'); //fileserver library
const spawn = require('child_process').spawn; //this function creates a child process (basically another shell for Minecraft to run in)
const execFileSync = require('child_process').execFileSync;

function MineShell(ram, worldUrl, stackName) {
	this._ram = ram;
	this._worldUrl = worldUrl;
	this._stackName = stackName;
	this._logFile = fs.createWriteStream('/home/ec2-user/mclog.txt');

	//spawn a child_process to run java. reference: child_process.spawn(command[, args][, options])
	let commandLineOpts = ["-Xmx" + this._ram, "-Xms" + this._ram, "-jar", "server.jar", "nogui"];
	let spawnOpts = { "cwd": "/home/ec2-user/mc", "stdio": ["pipe", "pipe", "pipe"] };

	this._child = spawn('java', commandLineOpts, spawnOpts);
	this._child.stdout.pipe(this._logFile);
	this._child.stderr.pipe(this._logFile);

	this._initWatchers();
}

MineShell.prototype._initWatchers = function() {
	let streamWatcher = new StreamWatcher(this._child);
	streamWatcher.addOnExit(() => this._exit());

	streamWatcher.addWatcher(/the answer is 42/, (stdin, regexData) => {
		this.shutdown();
	});

	streamWatcher.addWatcher(/I need help/, (stdin, regexData) => {
		stdin.write("say your wish is my command\n");
	});

	streamWatcher.addWatcher(/give ([\S]+) the power/, (stdin, regexData) => {
		this._log(`Player name:  ${regexData[1]}`);
		stdin.write(`op ${regexData[1]}\n`);
		stdin.write(`tell ${regexData[1]} you have the power\n`);
	});

	streamWatcher.addWatcher(/take the power from ([\S]+)/, (stdin, regexData) => {
		this._log("player name: " + regexData[1]);
		stdin.write(`deop ${regexData[1]}\n`);
		stdin.write(`tell ${regexData[1]} you have lost the power\n`);
	});

	streamWatcher.addWatcher(/supersave/, (stdin, regexData) => {
		this._log("player initiated save");
		stdin.write("say local save initiated\n");
		stdin.write("save-all\n");
		// I am using a 5 second timeout for right now, but I think we can implement this with a second
		// watcher that waits for the save to be completed.
		setTimeout(() => {
			this._uploadWorld();
			stdin.write("say cloud save initiated\n");
		}, 5000);
	});

	streamWatcher.addWatcher(/shut it down!!!/, (stdin, regexData) => {
		stdin.write("say This server is shutting down! Evacuate! Burn the diamonds!\n");
		this.shutdown();
	});


	let playerWatcher = new PlayerWatcher(() => this.shutdown());
	playerWatcher.registerWithStreamWatcher(streamWatcher);

	setInterval(() => this._uploadWorld(), 1000 * 60 * 15); //run the uploadWorld method every 15 minutes.
}

MineShell.prototype.shutdown = function () {
	this._log("Shutting down server...");
	this._child.stdin.write("say Server shutting down\n");
	this._child.stdin.write("stop\n");
}

MineShell.prototype._exit = function () {
	this._uploadWorld();
	this._closeStack();
	this._logFile.end();
	process.exit(0);
}

MineShell.prototype._uploadWorld = function () {
	this._log("Uploading world...");
	execFileSync("/home/ec2-user/autostack-scripts/uploadworld", [this._worldUrl]);
}

MineShell.prototype._closeStack = function () {
	this._log("closing stack...");
	execFileSync("/home/ec2-user/autostack-scripts/closestack",
		[this._stackName]);
}

MineShell.prototype._log = function (str) {
	console.log(`[mineShell] ${str}`);
}

module.exports = MineShell;