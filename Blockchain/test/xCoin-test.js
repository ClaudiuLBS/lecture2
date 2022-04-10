const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("xCoin", function () {
  it("Name should be xCoin", async function () {
    const XCoin = await ethers.getContractFactory("XCoin");
    const xcoin = await XCoin.deploy();
    await xcoin.deployed();
    expect(await xcoin.name()).to.equal("xCoin");
  });
  it("Supply should be 56", async function () {
    const XCoin = await ethers.getContractFactory("XCoin");
    const xcoin = await XCoin.deploy();
    await xcoin.deployed();
    expect(await xcoin.totalSupply()).to.equal(56);
  });
});
