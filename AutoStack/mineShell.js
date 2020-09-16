/*
	Project: FormulaCraft

	mineShell is a Node script that will be executed by the userdata of ec2 instances brought online
	by the AutoStack Cloudformation stack.  This utilizes a child process to run Minecraft Server
	inside this script.

	This script will handle boot up and boot down of the .jar file.

*/
const StreamWatcher = require("./StreamWatcher.js");
const PlayerWatcher = require("./PlayerWatcher.js");
const fs = require("fs"); //fileserver library
const spawn = require("child_process").spawn; //this function creates a child process (basically another shell for Minecraft to run in)
const execFile = require("child_process").execFile;

//read in available RAM
const instance_data = JSON.parse(
	fs.readFileSync("/home/ec2-user/autostack-scripts/instance_data.json")
);
const ram = instance_data["available_ram"];

//create writeable stream for the childprocess stdio.
const mclogWriteStream = fs.createWriteStream("/var/log/mclog.txt");

//spawn a child_process to run java. reference: child_process.spawn(command[, args][, options])
const commandLineOpts = [
	"-Xmx" + ram,
	"-Xms" + ram,
	"-jar",
	"server.jar",
	"nogui",
];
const spawnOpts = { cwd: "/home/ec2-user/mc", stdio: ["pipe", "pipe", "pipe"] };
const child = spawn("java", commandLineOpts, spawnOpts);

child.stdout.pipe(mclogWriteStream);
child.stderr.pipe(mclogWriteStream);

function uploadWorld() {
	log("Uploading world...");
	execFile(
		"/home/ec2-user/autostack-scripts/uploadworld",
		[instance_data["world_url"]],
		function (error, stdout, stderr) {
			if (error) {
				log("Problem uploading world: " + error);
			} else if (stderr.length != 0) {
				log("Error while uploading world: " + stderr);
			}
		}
	);
}

function closeStack() {
	log("closing stack...");
	execFile(
		"/home/ec2-user/autostack-scripts/closestack",
		[instance_data["stack_name"]],
		function (error, stdout, stderr) {
			if (error) {
				log("problem closing stack: " + error);
			} else if (stderr.length != 0) {
				log("Error while closing stack: " + stderr);
			}
		}
	);
}

function shutdown() {
	child.stdin.write("stop\n");
}

function log(str) {
	console.log("[mineShell] " + str);
}

const streamWatcher = new StreamWatcher(child);
streamWatcher.addOnExit(function () {
	uploadWorld();
	closeStack();
	mclogWriteStream.end();
	process.exit(0);
});

streamWatcher.addWatcher(/the answer is 42/, function () {
	shutdown();
});

streamWatcher.addWatcher(/I need help/, function (stdin) {
	stdin.write("say your wish is my command\n");
});

streamWatcher.addWatcher(/give ([\S]+) the power/, function (stdin, regexData) {
	log(`Player name:  ${regexData[1]}`);
	stdin.write(`op ${regexData[1]}\n`);
	stdin.write(`tell ${regexData[1]} you have the power\n`);
});

streamWatcher.addWatcher(/take the power from ([\S]+)/, function (
	stdin,
	regexData
) {
	log("player name: " + regexData[1]);
	stdin.write(`deop ${regexData[1]}\n`);
	stdin.write(`tell ${regexData[1]} you have lost the power\n`);
});

streamWatcher.addWatcher(/supersave/, function (stdin) {
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

streamWatcher.addWatcher(/shut it down!!!/, function (stdin) {
	stdin.write(
		"say This server is shutting down! Evacuate! Burn the diamonds!\n"
	);
	shutdown();
});

const playerWatcher = new PlayerWatcher(shutdown);
playerWatcher.registerWithStreamWatcher(streamWatcher);

// The SIGTERM event will be sent by systemctl when the service is stopped
process.on("SIGTERM", function () {
	log("[mineShell] Shutting down server...");
	child.stdin.write("say Server shutting down\n");
	shutdown();
});

setInterval(uploadWorld, 1000 * 60 * 15); //run the uploadWorld method every 15 minutes.
