const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("Greeter", function () {
  it("Should return the new greeting once it's changed", async function () {
    const SwapContract = await ethers.getContractFactory("SwapContract");
    const swapContract = await SwapContract.deploy();
    await swapContract.deployed();
    await swapContract.fromETHtoTokens({
      value: 10,
    });
    console.log("ye");
  });
});
