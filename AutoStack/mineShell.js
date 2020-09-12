/*
	Project: FormulaCraft

	mineShell is a Node script that will be executed by the userdata of ec2 instances brought online
	by the AutoStack Cloudformation stack.  This utilizes a child process to run Minecraft Server
	inside this script.

	This script will handle boot up and boot down of the .jar file.

*/
const StreamWatcher = require('./StreamWatcher.js');
const fs = require('fs');
const spawn = require('child_process').spawn;
const execFile = require('child_process').execFile;

//read in available RAM
let instance_data = JSON.parse(fs.readFileSync("/home/ec2-user/autostack-scripts/instance_data.json"));
let ram = instance_data["available_ram"];

//create writeable stream for the childprocess stdio.
let mclogWriteStream = fs.createWriteStream('mclog.txt');

//spawn a child_process to run java. reference: child_process.spawn(command[, args][, options])
let commandLineOpts = ["-Xmx" + ram, "-Xms" + ram, "-jar", "server.jar", "nogui"];
let spawnOpts = { "cwd": "/home/ec2-user/mc", "stdio": ["pipe", mclogWriteStream, mclogWriteStream] };
const child = spawn('java', commandLineOpts, spawnOpts);

function uploadWorld() {
	log("Uploading world...");
	execFile("/home/ec2-user/autostack-scripts/uploadworld",
		[instance_data["world_url"]],
		function (error, stdout, stderr) {
			if (error) {
				log("Problem uploading world: " + error);
			} else if (stderr.length != 0) {
				log("Error while uploading world: " + stderr);
			}
		});
}

function closeStack() {
	log("closing stack...");
	execFile("/home/ec2-user/autostack-scripts/closestack",
		[instance_data["stack_name"]],
		function (error, stdout, stderr) {
			if (error) {
				log("problem closing stack: " + error);
			} else if (stderr.length != 0) {
				log("Error while closing stack: " + stderr);
			}
		});
}

function log(str) {
	console.log("[mineShell] " + str);
}

let streamWatcher = new StreamWatcher(child);
streamWatcher.addOnExit(function () {
	uploadWorld();
	process.exit(0);
});

streamWatcher.addWatcher(/the answer is 42/, function (stdin, regexData) {
	stdin.write("stop\n");
});

streamWatcher.addWatcher(/I need help/, function (stdin, regexData) {
	stdin.write("say your wish is my command\n");
});

streamWatcher.addWatcher(/give ([\S]+) the power/, function (stdin, regexData) {
	log(`Player name:  ${regexData[1]}`);
	stdin.write(`op ${regexData[1]}\n`);
	stdin.write(`tell ${regexData[1]} you have the power\n`);
});

streamWatcher.addWatcher(/take the power from ([\S]+)/, function (stdin, regexData) {
	log("player name: " + regexData[1]);
	stdin.write(`deop ${regexData[1]}\n`);
	stdin.write(`tell ${regexData[1]} you have lost the power\n`);
});

streamWatcher.addWatcher(/supersave/, function (stdin, regexData) {
	log("player initiated save");
	stdin.write("say local save initiated\n");
	stdin.write("save-all\n");
	// I am using a 5 second timeout for right now, but I think we can implement this with a second
	// watcher that waits for the save to be completed.
	setTimeout(function () {
		uploadWorld();
		stdin.write("say cloud save initiated\n");
	}, 5000);
});

streamWatcher.addWatcher(/shut it down!!!/, function (stdin, regexData) {
	stdin.write("say This server is shutting down! Evacuate! Burn the diamonds!\n");
	closeStack();
});

// The SIGTERM event will be sent by systemctl when the service is stopped
process.on("SIGTERM", function () {
	log("[mineShell] Shutting down server...");
	child.stdin.write("say Server shutting down\n");
	child.stdin.write("stop\n");
});

setInterval(uploadWorld, 1000 * 60 * 15); //run the uploadWorld method every 15 minutes.
