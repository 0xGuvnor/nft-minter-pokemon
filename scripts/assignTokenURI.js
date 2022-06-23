const { ethers } = require("hardhat");
const { pinToPinata } = require("../utils/pinToPinata");

async function main() {
    const pokedex = await ethers.getContract("Pokedex");
    const circulatingSupply = await pokedex._tokenCounter();

    for (let tokenId = 0; tokenId < circulatingSupply; tokenId++) {
        // extracting the isURIAssigned value from each token's pokemon struct
        if ((await pokedex.tokenIdToPokemon(tokenId))[2] == false) {
            const tokenURI = await pinToPinata(tokenId);
            await pokedex.setTokenURI(tokenId, tokenURI);
        }
    }
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });
