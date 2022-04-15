const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("xCoinStaking", function () {
  it("The contract is ok", async function () {
    const ownerAddress = "0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266";
    const XCoinStaking = await ethers.getContractFactory("XCoinStaking");
    const xcoinStaking = await XCoinStaking.deploy();

    await xcoinStaking.deployed();
    await xcoinStaking.stake(1);
    await xcoinStaking.stake(2);
    await xcoinStaking.stake(3);
    await xcoinStaking.withdrawStake(0);
    const value = await xcoinStaking.convertDigitsToToken(5);
    expect(await xcoinStaking.totalStakesPerUser(ownerAddress)).to.equal(value);
    // const data = await xcoinStaking.getMyStakes();
    // data.map((item) => console.log(parseInt(item._hex)));
  });
});
