const execSync = require("child_process").execSync;
const http = require("http");
const MineShell = require("./MineShell");

const RAM_ALLOCATION_MAP = {
	"t3.micro": "800M",
	"m5.large": "7G",
	"r5.large": "14G",
	"m5.xlarge": "14G",
	"r5.xlarge": "28G",
};

function exit(message) {
	console.error(message);
	process.exit(1);
}

function sync(from, to) {
	execSync(`aws s3 sync ${from} ${to}`);
}

function startMineShell(instanceType, worldUrl, stackName) {
	if (!(instanceType in RAM_ALLOCATION_MAP)) {
		exit(`Unkown instance type: ${instanceType}`);
	}

	const ram = RAM_ALLOCATION_MAP[instanceType];
	const mineShell = new MineShell(ram, worldUrl, stackName);

	// The SIGTERM event will be sent by systemctl when the service is stopped
	process.on("SIGTERM", () => {
		mineShell.shutdown();
	});
}

function main(args) {
	if (!args || args.length != 3) {
		console.error(
			"Usage: node Main.js <world url> <flavor url> <stack name>"
		);
		process.exit(1);
	}

	const worldUrl = args[0];
	const flavorUrl = args[1];
	const stackName = args[2];

	sync(flavorUrl, "~/mc");
	sync(worldUrl, "~/mc");

	http.get(
		"http://169.254.169.254/latest/meta-data/instance-type",
		(response) => {
			if (response.errorCode < 200 || response.errorCode >= 300) {
				throw new Error(
					`Couldn't get instance type, received error code '${response.statusMessage}'`
				);
			}

			let instanceType = "";
			response.on("data", (data) => (instanceType += data));
			response.on("end", () =>
				startMineShell(instanceType, worldUrl, stackName)
			);
		}
	).on("error", (e) => {
		exit(e.message);
	});
}

main(process.argv.slice(2));
