const sinon = require("sinon");
const StreamWatcher = require("./../StreamWatcher");

function createStreamWatcher() {
	const mockChildProcess = sinon.mock();
	mockChildProcess.stdout = sinon.mock();
	mockChildProcess.stderr = sinon.mock();

	return new StreamWatcher(mockChildProcess);
}

module.exports.createStreamWatcher = createStreamWatcher;
