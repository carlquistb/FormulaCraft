/*
	Project: FormulaCraft

	mineShell is a Node script that will be executed by the userdata of ec2 instances brought online by the AutoStack Cloudformation stack.

	this utilizes the a child process to run Minecraft Server inside this script.

	This script will handle boot up and boot down of the .jar file.

	This script will not handle boot up and boot down of autoStacks.


*/
//load libraries
const StreamWatcher = require('./StreamWatcher.js');
const fs = require('fs'); //fileserver library
const spawn = require('child_process').spawn; //this function creates a child process (basically another shell for Minecraft to run in)
const execFile = require('child_process').execFile;

let instance_data = JSON.parse(fs.readFileSync("/home/ec2-user/scripts/instance_data.json"));
let ram = instance_data["available_ram"];

//spawn a child_process to run java. reference: child_process.spawn(command[, args][, options])
let commandLineOpts = ["-Xmx" + ram, "-Xms" + ram, "-jar", "server.jar", "nogui"];
let spawnOpts = {"cwd": "/home/ec2-user/mc", "stdio": ["pipe", "pipe", "pipe"]};
const child = spawn('java', commandLineOpts, spawnOpts);

function uploadWorld() {
	log("Uploading world...");
	execFile("/home/ec2-user/scripts/uploadworld",
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
	execFile("/home/ec2-user/scripts/closestack",
					[instance_data["stack_name"]],
					function (error, stdout, stderr) {
		if(error) {
			log("problem closing stack: " + error);
		} else if (stderr.length != 0) {
			log("Error while closing stack: " + stderr);
		}
	});
}

function log(str) {
	console.log("[mineShell] " + str);
}

//pipe data received from the shell into the subprocess, and from the subprocess through to the shell.
child.stdout.pipe(process.stdout);
child.stderr.pipe(process.stderr);

let streamWatcher = new StreamWatcher(child);
streamWatcher.addOnExit(function () {
	uploadWorld();
	process.exit(0);
});

let regex42 = /the answer is 42/;
let regexHelp = /I need help/;
let regexOP = /give ([\S]*) the power/;
let regexDEOP = /take the power from ([/S]*)/;
let regexSave = /supersave/;
let regexClose = /shut it down!!!/;

streamWatcher.addWatcher(regex42, function (stdin, regexData) {
	stdin.write("stop\n");
});

streamWatcher.addWatcher(regexHelp, function (stdin, regexData) {
	stdin.write("say your wish is my command\n");
});

streamWatcher.addWatcher(regexOP, function (stdin, regexData) {
	if(regexData.length < 1) {
		stdin.write("say who said that?\n");
		log("regexOP unable to capture player name.");
	}
	else {
		log("player name: " + regexData[1]);
		stdin.write("op " + regexData[1] + "\n"); //regexData[1] = first parenthesized result, the player name.
		stdin.write("tell " + regexData[1] + "you have the power\n");
	}
});

streamWatcher.addWatcher(regexDEOP, function (stdin, regexData) {
	if(regexData.length < 1) {
		stdin.write("say who said that?\n");
		log("regexDEOP unable to capture player name.");
	}
	else {
		log("player name: " + regexData[1]);
		stdin.write("deop " + regexData[1] + "\n"); //regexData[1] = first parenthesized result, the player name.
		stdin.write("tell " + regexData[1] + "you have lost the power\n");
	}
});

streamWatcher.addWatcher(regexSave, function (stdin, regexData) {
	log("player initiated save");
	stdin.write("save-all\n");
	stdin.write("say local save initiated\n");
	// I am using a 5 second timeout for right now, but I think we can implement this with a second watcher that waits for the save to be completed.
	setTimeout(function() {
		uploadWorld();
		stdin.write("say cloud save initiated\n");
	}, 5000);
});

streamWatcher.addWatcher(regexClose, function (stdin, regexData) {
	stdin.write("say This server is shutting down! Evacuate! Burn the diamonds!\n");
	closeStack();
});

// The SIGTERM event will be sent by systemctl when the service is stopped
process.on("SIGTERM", function () {
	log("[mineShell] Shutting down server...");
	child.stdin.write("say Server shutting down\n");
	child.stdin.write("stop\n");
});

var saveInterval = setInterval(uploadWorld,1000*60*15); //run the uploadWorld method every 15 minutes.
