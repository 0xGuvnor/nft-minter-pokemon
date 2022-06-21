const { expect } = require("chai")
const { developmentChains } = require("../../helper-hardhat-config");
const { network, ethers } = require("hardhat")

developmentChains.includes(network.name)
    ? describe.skip
    : describe("Sample Unit Tests", () => {})