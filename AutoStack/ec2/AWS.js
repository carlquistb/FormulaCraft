const { execSync } = require("child_process");

function sync(from, to) {
	execSync(`aws s3 sync ${from} ${to}`);
}

module.exports.sync = sync;

function cp(from, to) {
	execSync(`aws s3 cp ${from} ${to}`);
}

module.exports.cp = cp;

function deleteStack(stackName) {
	execSync(
		`aws cloudformation delete-stack --stack-name ${stackName} --region us-west-2`
	);
}

module.exports.deleteStack = deleteStack;
