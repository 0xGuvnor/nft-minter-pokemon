const pinataSDK = require("@pinata/sdk");

const pinata = pinataSDK(process.env.PINATA_API_KEY, process.env.PINATA_API_SECRET);
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

const pinToPinata = async () => {};

module.exports = { pinToPinata };
