require("@nomiclabs/hardhat-waffle");
require("@nomiclabs/hardhat-etherscan");
require("hardhat-deploy");
require("solidity-coverage");
require("hardhat-gas-reporter");
require("hardhat-contract-sizer");
require("./tasks");
require("@appliedblockchain/chainlink-plugins-fund-link");
require("dotenv").config();

/**
 * @type import('hardhat/config').HardhatUserConfig
 */

module.exports = {
    defaultNetwork: "hardhat",
    networks: {
        hardhat: {
            forking: {
                url: process.env.MAINNET_URL,
                blockNumber: ~~process.env.FORKING_BLOCK_NUMBER,
                enabled: !!process.env.MAINNET_FORKING,
            },
            chainId: 31337,
        },
        localhost: {
            chainId: 31337,
        },
        mainnet: {
            url: process.env.MAINNET_URL,
            accounts: [process.env.PRIVATE_KEY],
            saveDeployments: true,
            chainId: 1,
        },
        goerli: {
            url: process.env.GOERLI_URL,
            accounts: [process.env.PRIVATE_KEY],
            saveDeployments: true,
            chainId: 5,
        },
        polygonMumbai: {
            url: process.env.POLY_MUMBAI_URL,
            accounts: [process.env.PRIVATE_KEY],
            saveDeployments: true,
            chainId: 80001,
        },
        bscTestnet: {
            url: process.env.BSC_TESTNET_URL,
            accounts: [process.env.PRIVATE_KEY],
            chainId: 97,
            saveDeployments: true,
        },
        ftmTestnet: {
            url: process.env.FTM_TESTNET_URL,
            accounts: [process.env.PRIVATE_KEY],
            chainId: 4002,
            saveDeployments: true,
        },
        optimisticKovan: {
            url: process.env.OP_KOVAN_URL,
            accounts: [process.env.PRIVATE_KEY],
            chainId: 69,
            saveDeployments: true,
        },
    },
    etherscan: {
        apiKey: {
            goerli: process.env.ETHERSCAN_API_KEY,
            polygonMumbai: process.env.POLYSCAN_API_KEY,
            bscTestnet: process.env.BSCSCAN_API_KEY,
            ftmTestnet: process.env.FTMSCAN_API_KEY,
            optimisticKovan: process.env.OPSCAN_API_KEY,
        },
    },
    gasReporter: {
        enabled: process.env.REPORT_GAS,
        currency: "USD",
        outputFile: "gas-report.txt",
        noColors: true,
        coinmarketcap: process.env.COINMARKETCAP_API_KEY,
    },
    contractSizer: {
        runOnCompile: false,
        only: ["APIConsumer", "KeepersCounter", "PriceConsumerV3", "RandomNumberConsumerV2"],
    },
    namedAccounts: {
        deployer: {
            default: 0, // here this will by default take the first account as deployer
            1: 0, // similarly on mainnet it will take the first account as deployer. Note though that depending on how hardhat network are configured, the account 0 on one network can be different than on another
        },
        player: {
            default: 1,
        },
    },
    solidity: {
        compilers: [
            {
                version: "0.8.8",
            },
            {
                version: "0.6.6",
            },
            {
                version: "0.4.19",
            },
        ],
    },
    mocha: {
        timeout: 200_000, // 200 seconds max for running tests
    },
};
