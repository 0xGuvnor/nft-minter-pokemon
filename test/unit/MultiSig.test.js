const { network, ethers, deployments } = require("hardhat");
const { developmentChains } = require("../../helper-hardhat-config");
const { expect } = require("chai");

!developmentChains.includes(network.name)
    ? describe.skip
    : describe("MultiSig Unit Tests 🧪", () => {
          let deployer, otherSigner, multiSig, pokedex;

          beforeEach(async () => {
              [deployer, otherSigner] = await ethers.getSigners();
              await deployments.fixture(["all"]);
          });
      });
