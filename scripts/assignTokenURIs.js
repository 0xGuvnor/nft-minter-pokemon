const { ethers } = require("hardhat");
const { pinToPinata } = require("../utils/pinToPinata");

async function main() {
    const pokedex = await ethers.getContract("Pokedex");
    const circulatingSupply = await pokedex._tokenCounter();

    for (let tokenId = 0; tokenId < circulatingSupply; tokenId++) {
        // extracting the isURIAssigned value from each token's pokemon struct
        if ((await pokedex.tokenIdToPokemon(tokenId))[3] == false) {
            const pokemon = await pokedex.tokenIdToPokemon(tokenId);

            const tokenURI = await pinToPinata(pokemon);
            if (tokenURI) {
                await pokedex.setTokenURI(tokenId, tokenURI);
            } else {
                console.log("Token URI is empty!");
            }

            console.log(`Token URI assigned for token ID #${tokenId}!\n`);
        }
    }

    console.log("All token URIs have been asssigned!");
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });
