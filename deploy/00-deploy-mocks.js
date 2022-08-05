const { network } = require("hardhat");
const { developmentChains } = require("../helper-hardhat-config");

module.exports = async ({ deployments, getNamedAccounts }) => {
    const { deploy, log } = deployments;
    const { deployer } = await getNamedAccounts();

    if (developmentChains.includes(network.name)) {
        log("====================================================================");
        log("Deploying mocks...");

        await deploy("VRFCoordinatorV2Mock", {
            from: deployer,
            args: [1, 1],
            log: true,
        });
    }
};

module.exports.tags = ["all", "mocks"];
