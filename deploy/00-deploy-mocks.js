const { network } = require("hardhat");
const { developmentChains } = require("../helper-hardhat-config");

module.exports = async ({ deployments, getNamedAccounts }) => {
    const { deploy, log } = deployments;
    const { deployer } = await getNamedAccounts();

    if (developmentChains.includes(network.name)) {
        log("====================================================================");
        log("Deploying mocks...");

        const args = [1, 1];
        await deploy("VRFCoordinatorV2Mock", {
            from: deployer,
            args,
            log: true,
        });
    }
};

module.exports.tags = ["all", "mocks"];
