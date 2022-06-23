const { pinToPinata } = require("../utils/pinToPinata");

async function main() {
    pinToPinata();
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });
