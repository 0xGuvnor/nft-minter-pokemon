const { network } = require("hardhat");

const sleep = (timeInMs) => {
	return new Promise((resolve) => setTimeout(resolve, timeInMs));
};

const mineBlocks = async (amount, sleepAmount = 0) => {
	console.log("Mining block(s)...");
	for (let index = 0; index < amount; index++) {
		await network.provider.request({ method: "evm_mine", params: [] });
		if (sleepAmount) {
			console.log(`Sleeping for ${sleepAmount / 1000}s`);
			await sleep(sleepAmount);
		}
	}
};

module.exports = { mineBlocks, sleep };
