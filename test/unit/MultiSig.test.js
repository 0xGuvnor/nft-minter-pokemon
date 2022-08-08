const { network, ethers, deployments } = require("hardhat");
const { developmentChains } = require("../../helper-hardhat-config");
const { expect } = require("chai");

!developmentChains.includes(network.name)
    ? describe.skip
    : describe("MultiSig Unit Tests 🧪", () => {
          let deployer, otherSigner, multiSig, pokedex;

          beforeEach(async () => {
              [deployer, otherSigner] = await ethers.getSigners();
              await deployments.fixture("all");
              multiSig = await ethers.getContract("MultiSig", deployer);
              pokedex = await ethers.getContract("Pokedex", deployer);
          });

          it("Can add an additional owner to the MultiSig", async () => {
              let txId;
              const funcData = multiSig.interface.encodeFunctionData("addOwner", [
                  otherSigner.address,
              ]);

              await new Promise(async (resolve) => {
                  multiSig.once("TransactionSubmitted", async (sender, txIndex) => {
                      txId = txIndex;
                      resolve();
                  });
                  await multiSig.submitTransaction(
                      multiSig.address,
                      0,
                      funcData,
                      "Adding new owner to MultiSig"
                  );
              });

              await multiSig.confirmTransaction(txId);
              await multiSig.executeTransaction(txId);

              expect(await multiSig.isOwner(otherSigner.address)).to.be.true;

              const owners = await multiSig.getOwners();
              expect(owners[0]).to.equal(deployer.address);
              expect(owners[1]).to.equal(otherSigner.address);
          });

          it("Can remove an owner from the MultiSig", async () => {});
      });
