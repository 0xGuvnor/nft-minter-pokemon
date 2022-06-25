const { ethers } = require("hardhat");

const networkConfig = {
    31337: {
        name: "hardhat",
        keyHash: "0xd89b2bf150e3b9e13446986e571fb9cab24b13cea0a43ea20a6049a85cc807cc",
        callbackGasLimit: 500_000,
        mintFee: ethers.utils.parseEther("0.1"),
    },
    42: {
        name: "kovan",
    },
    4: {
        name: "rinkeby",
        vrfCoordinatorV2Address: "0x6168499c0cFfCaCD319c818142124B7A15E857ab",
        linkToken: "0x01BE23585060835E02B77ef475b0Cc51aA1e0709",
        keyHash: "0xd89b2bf150e3b9e13446986e571fb9cab24b13cea0a43ea20a6049a85cc807cc",
        subscriptionId: 4446,
        callbackGasLimit: 500_000,
        mintFee: ethers.utils.parseEther("0.1"),
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
