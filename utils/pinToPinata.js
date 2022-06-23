const pinataSDK = require("@pinata/sdk");

const pinata = pinataSDK(process.env.PINATA_API_KEY, process.env.PINATA_API_SECRET);
const pokemonIdAdjustment = { gen1: 1, gen2: 152, gen3: 252, gen4: 387, gen5: 494 };
const pokemonAPI = "https://pokeapi.co/api/v2/pokemon/";
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

const pinToPinata = async (tokenId) => {};

module.exports = { pinToPinata };
