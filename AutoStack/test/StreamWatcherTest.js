const test = require("ava");
const sinon = require("sinon");
const { createStreamWatcher } = require("./Utils");

test("Regex matches input", (t) => {
	const watcher = createStreamWatcher();

	const callbackStub = sinon.spy();
	watcher.addWatcher(/abcd/, callbackStub);
	watcher._onData("abcd");
	t.true(callbackStub.calledOnce);
});

test("Regex doesn't match input", (t) => {
	const watcher = createStreamWatcher();

	const callbackStub = sinon.spy();
	watcher.addWatcher(/abcd/, callbackStub);
	watcher._onData("efgh");
	t.false(callbackStub.called);
});
