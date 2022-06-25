const pinataSDK = require("@pinata/sdk");
const fetch = require("node-fetch");

const pinata = pinataSDK(process.env.PINATA_API_KEY, process.env.PINATA_API_SECRET);
// official Pokemon ID as per https://en.wikipedia.org/wiki/List_of_Pok%C3%A9mon#List_of_species
const pokemonIdAdjustment = { 0: 1, 1: 152, 2: 252, 3: 387, 4: 494 };
const pokemonAPI = (id) => `https://pokeapi.co/api/v2/pokemon/${id}`;
const uriUrlPrefix = "ipfs://";
const uriTemplate = {
    name: "",
    description: "",
    image: "",
    attributes: [
        {
            trait_type: "ID",
            value: "",
        },
        {
            trait_type: "Weight",
            value: "",
        },
        {
            trait_type: "Height",
            value: "",
        },
    ],
};
const capitalizeWord = (word) => {
    return word.charAt(0).toUpperCase() + word.slice(1, word.length);
};

const pinToPinata = async ({ generation, id, tokenId }) => {
    const pokemonId = id.toNumber(); /* id within a generation */
    const pokemonGeneration = generation.toNumber();
    const adjustedPokemonId = pokemonId + pokemonIdAdjustment[pokemonGeneration]; /* overall id */

    // retrive data from the Pokemon API
    const pokemonResponse = await fetch(pokemonAPI(adjustedPokemonId));
    const pokemonData = await pokemonResponse.json();

    // Populating the token URI with relevant data
    let tokenURI = { ...uriTemplate };
    tokenURI.name = `#${tokenId.toNumber()} ${capitalizeWord(pokemonData.name)}`;
    tokenURI.description = `A wild ${capitalizeWord(pokemonData.name)} appeared!`;
    tokenURI.image = pokemonData.sprites.other["official-artwork"].front_default;
    tokenURI.attributes[0].value = pokemonData.id.toString();
    tokenURI.attributes[1].value = pokemonData.weight / 10;
    tokenURI.attributes[2].value = pokemonData.height / 10;
    for (const type of pokemonData.types) {
        tokenURI.attributes.push({
            trait_type: "Type",
            value: capitalizeWord(type.type.name),
        });
    }
    for (const ability of pokemonData.abilities) {
        tokenURI.attributes.push({
            trait_type: "Ability",
            value: capitalizeWord(ability.ability.name),
        });
    }

    // pin token URI JSON to pinata
    console.log(`Pinning token ID #${tokenId.toNumber()}'s URI to Pinata...`);
    try {
        const options = { pinataMetadata: { name: `Pokemon - ${tokenURI.name}` } };
        const pinataResponse = await pinata.pinJSONToIPFS(tokenURI, options);
        return `${uriUrlPrefix}${pinataResponse.IpfsHash}`;
    } catch (error) {
        console.log(error);
        return null;
    }
};

module.exports = { pinToPinata };
