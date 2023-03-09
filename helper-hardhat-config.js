const { ethers } = require("hardhat");

const networkConfig = {
    31337: {
        name: "hardhat",
        keyHash: "0xd89b2bf150e3b9e13446986e571fb9cab24b13cea0a43ea20a6049a85cc807cc",
        callbackGasLimit: 500_000,
        mintFee: ethers.utils.parseEther("0.1"),
    },
    1: {
        name: "mainnet",
    },
    5: {
        name: "goerli",
        vrfCoordinatorV2Address: "0x2Ca8E0C643bDe4C2E08ab1fA0da3401AdAD7734D",
        linkToken: "0x326C977E6efc84E512bB9C30f76E30c160eD06FB",
        keyHash: "0x79d3d8832d904592c0bf9818b621522c988bb8b0c05cdc3b15aea1b6e8db0c15",
        subscriptionId: 10581,
        callbackGasLimit: 500_000,
        mintFee: ethers.utils.parseEther("0.01"),
    },
    137: {
        name: "polygonMumbai",
    },
    4002: {
        name: "ftmTestnet",
    },
    97: {
        name: "bscTestnet",
        vrfCoordinatorV2Address: "0x6A2AAd07396B36Fe02a22b33cf443582f682c82f",
        linkToken: "0x84b9b910527ad5c03a9ca831909e21e236ea7b06",
        keyHash: "0xd4bb89654db74673a187bd804519e65e3f71a52bc55f11da7601a13dcf505314",
        subscriptionId: 4446,
        callbackGasLimit: 500_000,
        mintFee: ethers.utils.parseEther("0.1"),
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
