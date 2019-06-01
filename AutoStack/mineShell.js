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

//spawn a child_process to run java. reference: child_process.spawn(command[, args][, options])
const child = spawn('java',['-jar','server.jar','nogui'],{cwd: '/home/ec2-user/mc',stdio: ['pipe','pipe','pipe']});

function uploadWorld() {
	log("Uploading world...");
	execFile("/home/ec2-user/scripts/uploadworld", 
	         ["world1"], 
	         function (error, stdout, stderr) {
		if (error) {
			log("Problem uploading world: " + error);
		} else if (stderr.length != 0) {
			log("Error while uploading world: " + error);
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

streamWatcher.addWatcher(regex42, function (stdin, regexData) {
	stdin.write("/say your wish is my command\n");
});

streamWatcher.addWatcher(regexHelp, function (stdin, regexData) {
	stdin.write("/say your wish is my command\n");
});

// The SIGTERM event will be sent by systemctl when the service is stopped
process.on("SIGTERM", function () {
	log("[mineShell] Shutting down server...");
	child.stdin.write("say Server shutting down\n");
	child.stdin.write("stop\n");
});

var saveInterval = setInterval(uploadWorld,1000*60*15); //run the recurringSave method every 15 minutes.
