const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("xCoinStaking", function () {
  it("The balance of the owner is setted", async function () {
    // const ownerAddress = "0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266";
    const XCoinStaking = await ethers.getContractFactory("XCoinStaking");
    const xcoinStaking = await XCoinStaking.deploy(50000000);

    // const myAddress = await xcoinStaking.getUser();
    await xcoinStaking.deployed();
    await xcoinStaking.stake(800);
    await xcoinStaking.stake(200);
    const x = await xcoinStaking.getMyStakesNumber();
    const data = await xcoinStaking.swapEthToXCoin(10);
    console.log(data);
    // cred ca putem trece la partea de react
  });
});
