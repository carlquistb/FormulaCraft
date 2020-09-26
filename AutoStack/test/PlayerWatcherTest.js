const test = require("ava");
const sinon = require("sinon");
const { createStreamWatcher } = require("./Utils");
const PlayerWatcher = require("./../ec2/PlayerWatcher");

function simulatePlayerJoined(streamWatcher, playerName, extraString) {
	extraString = extraString || "";
	streamWatcher._onData(
		`[00:00:00] [Server thread/INFO]${extraString}: ${playerName} joined the game\n`
	);
}

function simulatePlayerLeft(streamWatcher, playerName, extraString) {
	extraString = extraString || "";
	streamWatcher._onData(
		`[00:00:00] [Server thread/INFO]${extraString}: ${playerName} left the game\n`
	);
}

test.beforeEach((t) => {
	const streamWatcher = createStreamWatcher();
	const shutdownSpy = sinon.spy();
	const playerWatcher = new PlayerWatcher(shutdownSpy);
	playerWatcher.registerWithStreamWatcher(streamWatcher);

	t.context = {
		streamWatcher: streamWatcher,
		shutdownSpy: shutdownSpy,
		playerWatcher: playerWatcher,
	};
});

test("Player joins no shutdown", (t) => {
	const { streamWatcher, shutdownSpy, playerWatcher } = t.context;

	simulatePlayerJoined(streamWatcher, "TestAccount");
	playerWatcher._attemptShutdown();
	t.false(shutdownSpy.called);
});

test("No player joins shutdown", (t) => {
	const { shutdownSpy, playerWatcher } = t.context;

	playerWatcher._attemptShutdown();
	t.true(shutdownSpy.calledOnce);
});

test("Two players join then leave", (t) => {
	const account1 = "TestAccount1";
	const account2 = "TestAccount2";
	const { streamWatcher, shutdownSpy, playerWatcher } = t.context;

	simulatePlayerJoined(streamWatcher, account1);
	simulatePlayerJoined(streamWatcher, account2);
	playerWatcher._attemptShutdown();
	t.false(shutdownSpy.called);

	simulatePlayerLeft(streamWatcher, account1);
	simulatePlayerLeft(streamWatcher, account2);
	playerWatcher._attemptShutdown();
	t.true(shutdownSpy.calledOnce);
});

test("Player says left message in chat", (t) => {
	const { streamWatcher, shutdownSpy, playerWatcher } = t.context;

	simulatePlayerJoined(streamWatcher, "Test");
	streamWatcher._onData(
		"[00:00:00] [Server thread/INFO]: <Test> [00:00:00] [Server thread/INFO]: Test left the game\n"
	);
	playerWatcher._attemptShutdown();
	t.false(shutdownSpy.called);
});

test("Player says join message in chat", (t) => {
	const { streamWatcher, shutdownSpy, playerWatcher } = t.context;

	streamWatcher._onData(
		"[00:00:00] [Server thread/INFO]: <Test> [00:00:00] [Server thread/INFO]: Test joined the game\n"
	);
	playerWatcher._attemptShutdown();
	t.true(shutdownSpy.calledOnce);
});

test("Player join server with modded logging format", (t) => {
	const { streamWatcher, shutdownSpy, playerWatcher } = t.context;

	simulatePlayerJoined(streamWatcher, "Test", " [modded]");
	playerWatcher._attemptShutdown();
	t.false(shutdownSpy.called);

	simulatePlayerLeft(streamWatcher, "Test", " [modded");
	playerWatcher._attemptShutdown();
	t.true(shutdownSpy.calledOnce);
});
