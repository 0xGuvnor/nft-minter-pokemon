const { ethers, network } = require("hardhat");
const { networkConfig } = require("../helper-hardhat-config");

const amountToMint = 3;

async function main(amountToMint) {
    const pokedex = await ethers.getContract("Pokedex");
    const chainId = network.config.chainId;
    const mintFee = networkConfig[chainId].mintFee;
    console.log(`Minting ${amountToMint} NFTs...`);
    await pokedex.requestMint(amountToMint, { value: mintFee.mul(amountToMint) });
}

main(amountToMint)
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });
