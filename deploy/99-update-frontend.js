const fs = require("fs");
const { ethers, network } = require("hardhat");

const frontendContractsFile = "../nft-minter-pokemon-frontend/constants/networkMapping.json";
const frontendAbiLocation = "../nft-minter-pokemon-frontend/constants/";

module.exports = async () => {
    if (process.env.UPDATE_FRONTEND == "true") {
        console.log("Updating frontend...");
        await updateContractAddresses();
        await updateContractABI();
        console.log("Frontend updated!");
    }
};

async function updateContractAddresses() {
    const pokedex = await ethers.getContract("Pokedex");
    const chainId = network.config.chainId.toString();
    const contractAddresses = JSON.parse(fs.readFileSync(frontendContractsFile, "utf8"));

    if (chainId in contractAddresses) {
        if (!contractAddresses[chainId]["Pokedex"].includes(pokedex.address)) {
            contractAddresses[chainId]["Pokedex"].push(pokedex.address);
        }
    } else {
        contractAddresses[chainId] = { Pokedex: [pokedex.address] };
    }

    fs.writeFileSync(frontendContractsFile, JSON.stringify(contractAddresses));
}

async function updateContractABI() {
    const pokedex = await ethers.getContract("Pokedex");

    fs.writeFileSync(
        `${frontendAbiLocation}Pokedex.json`,
        pokedex.interface.format(ethers.utils.FormatTypes.json)
    );
}

module.exports.tags = ["all", "frontend"];
