
//load libraries
const fs = require('fs'); //fileserver library
const spawn = require('child_process').spawn; //this function creates a child process (basically another shell for Minecraft to run in)

//spawn a child_process to run java. reference: child_process.spawn(command[, args][, options])
var minecraft = spawn('sudo java',['-jar','server.jar','nogui'],{cwd: '/home/ec2-user/mc',stdio: ['pipe','pipe','pipe']});

//set eventlisteners for each pipe received data. reference: child_process<EventEmitter>
process.stdin.on('data', onMinecraftData); //stdin for process
minecraft.stdout.on('data', onMinecraftData); //stdout for subprocess
minecraft.stderr.on('data', onMinecraftData); //stderr for subprocess
minecraft.on('exit', function onExit() {
	console.log('minecraft server exited through onExit function in mineShell.js');
	process.exit(0);
}

function onMinecraftData() {
	//if the player says something, save and exit the server. somehow, begin aws sync script?
}

//pipe data received from the shell into the subprocess, and from the subprocess through to the shell.
process.stdin.pipe(minecraft.stdin);
minecraft.stdout.pipe(process.stdout);
minecraft.stderr.pipe(process.stderr);

//also, pipe all this into a log output file here.
var logfile = fs.createWriteStream('mineShellLog.txt');
process.stdin.pipe(logfile);
minecraft.stdout.pipe(logfile);
minecraft.stderr.pipe(logfile);

/* 
TODO:find a way to shut down the MS server...
This may require listening for a player to say a certain sentence, or something like that. Brainstorming will commence.
*/
var exitTimer = 0;
function sayOnServer() {
	minecraft.stdin.write('/say hello world ' + exitTimer + '\n');
	if(exitTimer > 60) {
		minecraft.stdin.write('/stop\n');
	}
	exitTimer++;
}

setInterval(sayOnServer,1000*5); //run the sayOnServer method every 5 seconds.