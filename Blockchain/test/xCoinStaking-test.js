const { expect } = require("chai");
const { ethers } = require("hardhat");
const { time } = require("@openzeppelin/test-helpers");

async function wait(days) {
  await network.provider.send("evm_increaseTime", [86400 * days]);
  await network.provider.send("evm_mine");
}

describe("xCoinStaking", function () {
  it("The contract is ok", async function () {
    const ownerAddress = "0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266";
    const XCoinStaking = await ethers.getContractFactory("XCoinStaking");
    const xcoinStaking = await XCoinStaking.deploy();
    await xcoinStaking.deployed();
    await xcoinStaking.stake(10000);
    expect(await xcoinStaking.balanceOf(xcoinStaking.address)).to.equals(
      await xcoinStaking.convertTokensToDigits(10000)
    );

    await wait(30);
    await xcoinStaking.claim(0);

    expect(await xcoinStaking.balanceOf(ownerAddress)).to.equals(
      await xcoinStaking.convertTokensToDigits(90700)
    );

    let guaranty = await xcoinStaking.calculateGuaranty(9300, 1);
    await xcoinStaking.borrow(9300, 1, {
      value: guaranty,
    });

    expect((await xcoinStaking.loans(ownerAddress)).guaranty).to.equals(
      guaranty
    );
    // console.log(await xcoinStaking.loans(ownerAddress));

    expect(await xcoinStaking.balanceOf(xcoinStaking.address)).to.equals(0);
    for (let i = 1; i <= 12; i++) {
      await wait(33);
      await xcoinStaking.payRate();
    }
    // expect(await xcoinStaking.loans[ownerAddress].guaranty).to.equals(guaranty);
    expect((await xcoinStaking.loans(ownerAddress)).guaranty).to.equals(
      guaranty
    );
    guaranty = await xcoinStaking.calculateGuaranty(9300, 1);
    await xcoinStaking.borrow(9300, 1, {
      value: guaranty,
    });

    // expect(await xcoinStaking.balanceOf(xcoinStaking.address)).to.equals(0);
    // expect(await xcoinStaking.claim(0)).to.equals(700);
    // const value = await xcoinStaking.convertDigitsToTokens(5);
    // expect(await xcoinStaking.totalStakesPerUser(ownerAddress)).to.equal(value);

    // const data = await xcoinStaking.getMyStakes();
    // data.map((item) => console.log(parseInt(item.lastClaim._hex)));
  });
});
