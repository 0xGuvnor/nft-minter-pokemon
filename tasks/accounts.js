task("accounts", "Prints the list of accounts", async () => {
	const accounts = await ethers.getSigners();
	const provider = ethers.provider;
	let id = 0;

	for (const account of accounts) {
		const balance = await provider.getBalance(account.address);
		console.log(
			`[${id < 10 ? "0" + id.toString() : id}] ${
				account.address
			} -- ${ethers.utils.formatEther(balance)} ETH`
		);
		id++;
	}
});

module.exports = {};
