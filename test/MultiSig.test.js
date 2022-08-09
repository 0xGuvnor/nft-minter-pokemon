const { network, ethers, deployments } = require("hardhat");
const { developmentChains } = require("../helper-hardhat-config");
const { expect } = require("chai");

!developmentChains.includes(network.name)
    ? describe.skip
    : describe("MultiSig Unit Tests 🧪", () => {
          let deployer, otherSigner, multiSig, pokedex, funcData;

          beforeEach(async () => {
              [deployer, otherSigner] = await ethers.getSigners();
              await deployments.fixture("all");
              multiSig = await ethers.getContract("MultiSig", deployer);
              pokedex = await ethers.getContract("Pokedex", deployer);
          });

          it("Can add an additional owner to the MultiSig 🙋‍♂️", async () => {
              funcData = multiSig.interface.encodeFunctionData("addOwner", [otherSigner.address]);
              const tx = await multiSig.submitTransaction(
                  multiSig.address,
                  0,
                  funcData,
                  "Adding new owner to MultiSig"
              );
              const txReceipt = await tx.wait();
              const txId = txReceipt.events[0].args.txIndex;

              await multiSig.confirmTransaction(txId);
              await expect(multiSig.executeTransaction(txId))
                  .to.emit(multiSig, "OwnerAdded")
                  .withArgs(otherSigner.address);

              expect(await multiSig.isOwner(otherSigner.address)).to.be.true;

              const owners = await multiSig.getOwners();
              expect(owners[0]).to.equal(deployer.address);
              expect(owners[1]).to.equal(otherSigner.address);
          });

          it("Can change the number of confirmations required #️⃣", async () => {
              // throws exception if num confirmations is greater than num owners
              funcData = multiSig.interface.encodeFunctionData("setNumConfirmationsRequired", [2]);
              const tx = await multiSig.submitTransaction(
                  multiSig.address,
                  0,
                  funcData,
                  "Update num confirmations required"
              );
              const txReceipt = await tx.wait();
              const txId = txReceipt.events[0].args.txIndex;
              await multiSig.confirmTransaction(txId);
              await expect(multiSig.executeTransaction(txId)).to.be.revertedWith(
                  "MultiSig__TxFailed"
              );

              // Adding new owner
              funcData = multiSig.interface.encodeFunctionData("addOwner", [otherSigner.address]);
              const txAdd = await multiSig.submitTransaction(
                  multiSig.address,
                  0,
                  funcData,
                  "Adding new owner to MultiSig"
              );
              const txAddReceipt = await txAdd.wait();
              const txAddId = txAddReceipt.events[0].args.txIndex;
              await multiSig.confirmTransaction(txAddId);
              await multiSig.executeTransaction(txAddId);

              // Update num confirmations
              funcData = multiSig.interface.encodeFunctionData("setNumConfirmationsRequired", [2]);
              const txNum = await multiSig.submitTransaction(
                  multiSig.address,
                  0,
                  funcData,
                  "Update num confirmations required"
              );
              const txNumReceipt = await txNum.wait();
              const txNumId = txNumReceipt.events[0].args.txIndex;

              const oldNumConfirmations = await multiSig.defaultNumConfirmationsRequired();
              expect(oldNumConfirmations).to.equal(1);

              await multiSig.confirmTransaction(txNumId);
              await expect(multiSig.executeTransaction(txNumId))
                  .to.emit(multiSig, "NumConfirmationsUpdated")
                  .withArgs(oldNumConfirmations, 2);

              const newNumConfirmations = await multiSig.defaultNumConfirmationsRequired();
              expect(newNumConfirmations).to.equal(2);
              expect(await multiSig.getTransactionCount()).to.equal(3);
          });

          it("Can remove an owner from the MultiSig 👋", async () => {
              // Adding new owner
              funcData = multiSig.interface.encodeFunctionData("addOwner", [otherSigner.address]);
              const txAdd = await multiSig.submitTransaction(
                  multiSig.address,
                  0,
                  funcData,
                  "Adding new owner"
              );
              const txAddReceipt = await txAdd.wait();
              const txAddId = txAddReceipt.events[0].args.txIndex;
              await multiSig.confirmTransaction(txAddId);
              await multiSig.executeTransaction(txAddId);

              // Removing owner
              funcData = multiSig.interface.encodeFunctionData("removeOwner", [deployer.address]);
              const txRemove = await multiSig.submitTransaction(
                  multiSig.address,
                  0,
                  funcData,
                  "Removing existing owner"
              );
              const txRemoveReceipt = await txRemove.wait();
              const txRemoveId = txRemoveReceipt.events[0].args.txIndex;

              await multiSig.confirmTransaction(txRemoveId);
              await expect(multiSig.executeTransaction(txRemoveId))
                  .to.emit(multiSig, "OwnerRemoved")
                  .withArgs(deployer.address);

              expect((await multiSig.transactions(txRemoveId)).isExecuted).to.be.true;
              expect(await multiSig.isOwner(deployer.address)).to.be.false;
              expect((await multiSig.getOwners()).length).to.equal(1);
              expect((await multiSig.getOwners())[0]).to.equal(otherSigner.address);
          });

          it("Can revoke a confirmed transaction ❌", async () => {
              const tx = await multiSig.submitTransaction(multiSig.address, 100, [], "Test tx");
              const txReceipt = await tx.wait();
              const txId = txReceipt.events[0].args.txIndex;

              await multiSig.confirmTransaction(txId);

              expect((await multiSig.getTransaction(txId)).numConfirmations).to.equal(1);
              expect(await multiSig.isConfirmed(txId, deployer.address)).to.be.true;

              await multiSig.revokeTransaction(txId);

              expect((await multiSig.getTransaction(txId)).numConfirmations).to.equal(0);
              expect(await multiSig.isConfirmed(txId, deployer.address)).to.be.false;
          });

          it("Can receive ETH 🤑", async () => {
              const provider = ethers.provider;

              expect(await provider.getBalance(multiSig.address)).to.equal(0);
              await deployer.sendTransaction({
                  to: multiSig.address,
                  value: ethers.utils.parseEther("1"),
              });
              expect(await provider.getBalance(multiSig.address)).to.equal(
                  ethers.utils.parseEther("1")
              );
          });

          it("Requires sufficient confirmations to execute a transaction 👯", async () => {
              const tx = await multiSig.submitTransaction(otherSigner.address, 99, [], "Test tx");
              const txReceipt = await tx.wait();
              const txId = txReceipt.events[0].args.txIndex;

              await expect(multiSig.executeTransaction(txId)).to.be.revertedWith(
                  "MultiSig__NotEnoughConfirmations"
              );
          });

          it("Requires a transaction to exist to confirm/execute it 🧩", async () => {
              await expect(multiSig.confirmTransaction(99)).to.be.revertedWith(
                  "MultiSig__TxDoesNotExist"
              );
              await expect(multiSig.executeTransaction(99)).to.be.revertedWith(
                  "MultiSig__TxDoesNotExist"
              );
          });

          it("Does not allow calling functions to add/remove owners and update num confirmations directly 😵", async () => {
              await expect(multiSig.addOwner(otherSigner.address)).to.be.revertedWith(
                  "MultiSig__NotContract"
              );
              await expect(multiSig.removeOwner(deployer.address)).to.be.revertedWith(
                  "MultiSig__NotContract"
              );
              await expect(multiSig.setNumConfirmationsRequired(1)).to.be.revertedWith(
                  "MultiSig__NotContract"
              );
          });
      });
