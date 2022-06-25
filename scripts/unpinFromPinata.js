const pinataSDK = require("@pinata/sdk");

const pinata = pinataSDK(process.env.PINATA_API_KEY, process.env.PINATA_API_SECRET);

const main = async () => {
    const hashes = await retrievePinned();
    let counter = 1;
    for (const hash of hashes) {
        try {
            console.log(`Unpinning ${hash} from Pinata...`);
            const response = await pinata.unpin(hash);
            console.log(`[${counter}] ${response}`);
            counter++;
        } catch (err) {
            console.log(err);
        }
    }
};

const retrievePinned = async () => {
    const pinnedList = [];
    const filters = { status: "pinned" };
    const myPins = await pinata.pinList(filters);
    console.log(`Found ${myPins.count} pin(s)...`);
    for (const pin of myPins.rows) {
        pinnedList.push(pin.ipfs_pin_hash);
    }
    return pinnedList;
};

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });
