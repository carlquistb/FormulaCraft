/*
	Project: FormulaCraft

	mineShell is a Node script that will be executed by the userdata of ec2 instances brought online
	by the AutoStack Cloudformation stack.  This utilizes a child process to run Minecraft Server
	inside this script.

	This script will handle boot up and boot down of the .jar file.

*/
const StreamWatcher = require("./StreamWatcher");
const PlayerWatcher = require("./PlayerWatcher");
const fs = require("fs"); //fileserver library
const AWS = require("./AWS");
const { spawn } = require("child_process"); //this function creates a child process (basically another shell for Minecraft to run in)

const SERVER_FOLDER_PATH = "/home/ec2-user/mc/";

function MineShell(ram, worldUrl, stackName, config) {
	this._ram = ram;
	if (worldUrl.charAt(worldUrl.length - 1) != "/") {
		worldUrl += "/";
	}
	this._worldUrl = worldUrl;
	this._stackName = stackName;
	this._config = config;
	this._logFile = fs.createWriteStream("/home/ec2-user/mclog.txt");

	//spawn a child_process to run java. reference: child_process.spawn(command[, args][, options])
	const commandLineOpts = [
		"-Xmx" + this._ram,
		"-Xms" + this._ram,
		"-jar",
		"server.jar",
		"nogui",
	];
	const spawnOpts = {
		cwd: "/home/ec2-user/mc",
		stdio: ["pipe", "pipe", "pipe"],
	};

	this._child = spawn("java", commandLineOpts, spawnOpts);
	this._child.stdout.pipe(this._logFile);
	this._child.stderr.pipe(this._logFile);

	this._initWatchers();
}

MineShell.prototype._initWatchers = function () {
	const streamWatcher = new StreamWatcher(this._child);
	streamWatcher.addOnExit(() => this._exit());

	streamWatcher.addWatcher(/the answer is 42/, () => {
		this.shutdown();
	});

	streamWatcher.addWatcher(/I need help/, (stdin) => {
		stdin.write("say your wish is my command\n");
	});

	streamWatcher.addWatcher(/give ([\S]+) the power/, (stdin, regexData) => {
		this._log(`Player name:  ${regexData[1]}`);
		stdin.write(`op ${regexData[1]}\n`);
		stdin.write(`tell ${regexData[1]} you have the power\n`);
	});

	streamWatcher.addWatcher(
		/take the power from ([\S]+)/,
		(stdin, regexData) => {
			this._log("player name: " + regexData[1]);
			stdin.write(`deop ${regexData[1]}\n`);
			stdin.write(`tell ${regexData[1]} you have lost the power\n`);
		}
	);

	streamWatcher.addWatcher(/supersave/, (stdin) => {
		this._log("player initiated save");
		stdin.write("say local save initiated\n");
		stdin.write("save-all\n");
		// I am using a 5 second timeout for right now, but I think we can implement this with a second
		// watcher that waits for the save to be completed.
		setTimeout(() => {
			this._uploadWorld();
		}, 5000);
	});

	streamWatcher.addWatcher(/shut it down!!!/, (stdin) => {
		stdin.write(
			"say This server is shutting down! Evacuate! Burn the diamonds!\n"
		);
		this.shutdown();
	});

	const playerWatcher = new PlayerWatcher(() => this.shutdown());
	playerWatcher.registerWithStreamWatcher(streamWatcher);

	setInterval(() => this._uploadWorld(), 1000 * 60 * 15); //run the uploadWorld method every 15 minutes.
};

MineShell.prototype.shutdown = function () {
	this._log("Shutting down server...");
	this._child.stdin.write("say Server shutting down\n");
	this._child.stdin.write("stop\n");
};

MineShell.prototype._exit = function () {
	this._uploadWorld();
	this._closeStack();
	this._logFile.end();
	process.exit(0);
};

MineShell.prototype._uploadWorld = function () {
	this._log("Uploading world...");
	this._child.stdin.write("say cloud save initiated, server saving halted\n");
	this._child.stdin.write("save-off\n");
	try {
		for (const folder of this._config.syncFolders) {
			AWS.sync(SERVER_FOLDER_PATH + folder, this._worldUrl + folder);
		}
		for (const file of this._config.syncFiles) {
			AWS.cp(SERVER_FOLDER_PATH + file, this._worldUrl + file);
		}
	} catch (e) {
		this._child.stdin.stdin.write(
			"say cloud error occured! Attempt to save again or contact your system administrator before exiting.\n"
		);
		this._log(e.message);
	}
	if (!this._child.stdin.writeableEnded) {
		this._child.stdin.stdin.write("save-on\n");
		this._child.stdin.stdin.write(
			"say cloud save completed, server saving resumed\n"
		);
	}
};

MineShell.prototype._closeStack = function () {
	this._log("closing stack...");
	try {
		AWS.deleteStack(this._stackName);
	} catch (e) {
		this._log("unable to delete stack");
	}
};

MineShell.prototype._log = function (str) {
	console.log(`[mineShell] ${str}`);
};

module.exports = MineShell;
