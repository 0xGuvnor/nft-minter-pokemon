const pinataSDK = require("@pinata/sdk");
const fetch = require("node-fetch");

const pinata = pinataSDK(process.env.PINATA_API_KEY, process.env.PINATA_API_SECRET);
// official Pokemon ID as per https://en.wikipedia.org/wiki/List_of_Pok%C3%A9mon#List_of_species
const pokemonIdAdjustment = { 0: 1, 1: 152, 2: 252, 3: 387, 4: 494 };
const pokemonAPI = (id) => `https://pokeapi.co/api/v2/pokemon/${id}`;
const uriUrlPrefix = "https://gateway.pinata.cloud/ipfs/";
const uriTemplate = {
    tokenId: "",
    name: "",
    description: "",
    image: "",
    attributes: [
        {
            traitType: "ID",
            value: "",
        },
        {
            traitType: "Type",
            value: [],
        },
        {
            traitType: "Abilities",
            value: [],
        },
        {
            traitType: "Weight",
            value: "",
        },
        {
            traitType: "Height",
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
    tokenURI.tokenId = tokenId.toNumber();
    tokenURI.name = capitalizeWord(pokemonData.name);
    tokenURI.description = `A wild ${tokenURI.name} appeared!`;
    tokenURI.image = pokemonData.sprites.other["official-artwork"].front_default;
    tokenURI.attributes[0].value = pokemonData.id;
    for (const type of pokemonData.types) {
        tokenURI.attributes[1].value.push(capitalizeWord(type.type.name));
    }
    for (const ability of pokemonData.abilities) {
        tokenURI.attributes[2].value.push(capitalizeWord(ability.ability.name));
    }
    tokenURI.attributes[3] = `${pokemonData.weight / 10}kg`;
    tokenURI.attributes[4] = `${pokemonData.height / 10}m`;

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
