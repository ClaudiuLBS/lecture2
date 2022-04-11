const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("xCoinStaking", function () {
  it("The balance of the owner is setted", async function () {
    // const ownerAddress = "0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266";
    const XCoinStaking = await ethers.getContractFactory("XCoinStaking");
    const xcoinStaking = await XCoinStaking.deploy(ownerAddress, 50000000);

    const myAddress = await xcoinStaking.getUser();
    await xcoinStaking.deployed();
    await xcoinStaking.stake(800);
    await xcoinStaking.stake(200);
    const x = await xcoinStaking.getMyStakesNumber();
    console.log(x);
    // cred ca putem trece la partea de react
  });
});
