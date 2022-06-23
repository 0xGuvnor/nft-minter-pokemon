const { network, ethers } = require("hardhat");
const {
    developmentChains,
    BLOCK_CONFIRMATIONS,
    networkConfig,
} = require("../helper-hardhat-config");
const { verify } = require("../utils/verify");

module.exports = async ({ deployments, getNamedAccounts }) => {
    const { deploy, log } = deployments;
    const { deployer } = await getNamedAccounts();
    const chainId = network.config.chainId;
    log("====================================================================");

    // instantiate constructor ar
    let vrfCoordinatorV2Address, subscriptionId;
    const maxSupply = 200;
    const keyHash = networkConfig[chainId].keyHash;
    const callbackGasLimit = networkConfig[chainId].callbackGasLimit;
    const mintFee = networkConfig[chainId].mintFee;
    const numOfGenerations = 5;
    const numPerGeneration = [151, 100, 135, 107, 156];

    // grabbing VRF args from mock or live network(s)
    if (developmentChains.includes(network.name)) {
        const vrfMock = await ethers.getContract("VRFCoordinatorV2Mock");
        vrfCoordinatorV2Address = vrfMock.address;

        const tx = await vrfMock.createSubscription();
        const txReceipt = await tx.wait(1);
        subscriptionId = txReceipt.events[0].args[0];

        await vrfMock.fundSubscription(subscriptionId, ethers.utils.parseEther("20"));
    } else {
        vrfCoordinatorV2Address = networkConfig[chainId].vrfCoordinatorV2Address;
        subscriptionId = networkConfig[chainId].subscriptionId;
    }

    const args = [
        maxSupply,
        vrfCoordinatorV2Address,
        subscriptionId,
        keyHash,
        callbackGasLimit,
        mintFee,
        numOfGenerations,
        numPerGeneration,
    ];
    const waitConfirmations = developmentChains.includes(network.name) ? 1 : BLOCK_CONFIRMATIONS;
    const pokedex = await deploy("Pokedex", {
        from: deployer,
        args,
        log: true,
        waitConfirmations,
    });

    if (!developmentChains.includes(network.name)) {
        await verify(pokedex.address, args);
    }
};

module.exports.tags = ["all", "pokedex"];
