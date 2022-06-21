const networkConfig = {
	31337: {
		name: "hardhat",
	},
	42: {
		name: "kovan",
	},
	4: {
		name: "rinkeby",
	},
	1: {
		name: "mainnet",
	},
	5: {
		name: "goerli",
	},
	137: {
		name: "polygonMumbai",
	},
	4002: {
		name: "ftmTestnet",
	},
	97: {
		name: "bscTestnet",
	},
	69: {
		name: "optimisticKovan",
	},
};

const developmentChains = ["hardhat", "localhost"];
const BLOCK_CONFIRMATIONS = 7;

module.exports = {
	networkConfig,
	developmentChains,
	BLOCK_CONFIRMATIONS,
};
