const AWS = require("./AWS");
const fs = require("fs");
const http = require("http");
const MineShell = require("./MineShell");

const FLAVOR_CONFIG_PATH = "/home/ec2-user/mc/autostack-config.json";

const RAM_ALLOCATION_MAP = {
	"t3.micro": "800M",
	"m5.large": "7G",
	"r5.large": "14G",
	"m5.xlarge": "14G",
	"r5.xlarge": "28G",
};

const DEFAULT_CONFIG = {
	syncFiles: [
		"banned-ips.json",
		"banned-players.json",
		"ops.json",
		"server.properties",
		"whitelist.json",
	],
	syncFolders: ["world"],
};

function exit(message) {
	console.error(message);
	process.exit(1);
}

function loadConfig() {
	if (!fs.existsSync(FLAVOR_CONFIG_PATH)) {
		return DEFAULT_CONFIG;
	}

	const rawConfig = fs.readFileSync(FLAVOR_CONFIG_PATH);
	let parsedConfig = DEFAULT_CONFIG;
	try {
		parsedConfig = JSON.parse(rawConfig);
	} catch (e) {
		exit(e);
	}

	for (const key in DEFAULT_CONFIG) {
		if (!(key in parsedConfig)) {
			parsedConfig[key] = DEFAULT_CONFIG[key];
		}
	}

	return parsedConfig;
}

function startMineShell(instanceType, worldUrl, stackName, config) {
	if (!(instanceType in RAM_ALLOCATION_MAP)) {
		exit(`Unkown instance type: ${instanceType}`);
	}

	const ram = RAM_ALLOCATION_MAP[instanceType];
	const mineShell = new MineShell(ram, worldUrl, stackName, config);

	// The SIGTERM event will be sent by systemctl when the service is stopped
	process.on("SIGTERM", () => {
		mineShell.shutdown();
	});
}

function main(args) {
	if (!args || args.length != 3) {
		exit("Usage: node Main.js <world url> <flavor url> <stack name>");
	}

	const worldUrl = args[0];
	const flavorUrl = args[1];
	const stackName = args[2];
	const config = loadConfig();

	AWS.sync(flavorUrl, "~/mc");
	AWS.sync(worldUrl, "~/mc");

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
				startMineShell(instanceType, worldUrl, stackName, config)
			);
		}
	).on("error", (e) => {
		exit(e.message);
	});
}

main(process.argv.slice(2));
