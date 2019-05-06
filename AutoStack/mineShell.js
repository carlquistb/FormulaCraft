/*
	Project: FormulaCraft
	
	mineShell is a Node script that will be executed by the userdata of ec2 instances brought online by the AutoStack Cloudformation stack.

	this utilizes the a child process to run Minecraft Server inside this script.

	This script will handle boot up and boot down of the .jar file.

	This script will not handle boot up and boot down of autoStacks.
	

*/
//load libraries
const fs = require('fs'); //fileserver library
const spawn = require('child_process').spawn; //this function creates a child process (basically another shell for Minecraft to run in)

//spawn a child_process to run java. reference: child_process.spawn(command[, args][, options])
const child = spawn('java',['-jar','server.jar','nogui'],{cwd: '/home/ec2-user/mc',stdio: ['pipe','pipe','pipe']});

//set eventlisteners for each pipe received data. reference: child_process<EventEmitter>
child.stdout.on('data', onData); //stdout for subprocess
child.stderr.on('data', onData); //stderr for subprocess
child.on('exit', function onExit() {
	console.log('mcserver exited through onExit function in mineShell.js');
	process.exit(0);
});

//pipe data received from the shell into the subprocess, and from the subprocess through to the shell.
child.stdout.pipe(process.stdout);
child.stderr.pipe(process.stderr);

/*
//runs on a set interval.
function recurringSave() {
	child.stdin.write('/say hello world\n');
	console.log("DEBUG: write hello world");
	child.stdin.write('/save-all\n');
}

var saveInterval = setInterval(recurringSave,1000*10); //run the recurringSave method every 5 seconds.
*/

//event-listener function. Runs each time a server line-item is printed.
function onData(data) {
	console.log('onData entered');
	//if the player says the answer, save and exit the server.
	if(String(data).includes("the answer is 42")) {
		//clearInterval(saveInterval);
		child.stdin.write('/stop\n');
	} else if(String(data).includes("I need help")) {
		console.log(JSON.stringify(child.stdin));
		child.stdin.write('/say your wish is my command\n');
	}
}
