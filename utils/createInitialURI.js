const pinataSDK = require("@pinata/sdk");

const pinata = pinataSDK(process.env.PINATA_API_KEY, process.env.PINATA_API_SECRET);
const uriUrlPrefix = "ipfs://";
const uriTemplate = {
    name: "",
    description: "",
    image: "",
};

const createInitialURI = async () => {
    let initialURI = { ...uriTemplate };
    initialURI.name = "Unhatched Pokémon Egg";
    initialURI.description = "A Pokémon egg is hatching soon...";
    initialURI.image =
        "https://static.wikia.nocookie.net/pokeverse/images/1/14/Egg_Hatching.gif/revision/latest?cb=20180518195439";

    // pin to Pinata
    try {
        const options = { pinataMetadata: { name: `Pokémon - ${initialURI.name}` } };
        const pinataResponse = await pinata.pinJSONToIPFS(initialURI, options);
        return `${uriUrlPrefix}${pinataResponse.IpfsHash}`;
    } catch (error) {
        console.log(error);
        return null;
    }
};

module.exports = { createInitialURI };
