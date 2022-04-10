const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("xCoinStaking", function () {
  it("The balance of the owner is setted", async function () {
    const ownerAddress = "0xB6255fa0FB00A23fcA93949D156Bd546c30A6EFF";
    const XCoinStaking = await ethers.getContractFactory("XCoinStaking");
    const xcoinStaking = await XCoinStaking.deploy(ownerAddress, 50);
    await xcoinStaking.deployed();
    expect(await xcoinStaking.balanceOf(ownerAddress)).to.equal(50);
    expect(await xcoinStaking.balanceOf(ownerAddress)).to.equal(50);
    await xcoinStaking.giveTokens();
    const myAddress = await xcoinStaking.getUser();
    // console.log(myAddress);
    await xcoinStaking.stake(800);
    await xcoinStaking.stake(200);
    expect(await xcoinStaking.totalStakes()).to.equal(1000);
    expect(await xcoinStaking.stakeOf(myAddress)).to.equals(1000);
    await xcoinStaking.withdrawStake(0);
    expect(await xcoinStaking.stakeOf(myAddress)).to.equal(200);
    await xcoinStaking.distributeRewards();
    expect(await xcoinStaking.rewardOf(myAddress)).to.equal(2);
    // cred ca putem trece la partea de react
  });
});
