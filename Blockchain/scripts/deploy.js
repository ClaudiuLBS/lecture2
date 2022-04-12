// We require the Hardhat Runtime Environment explicitly here. This is optional
// but useful for running the script in a standalone fashion through `node <script>`.
//
// When running the script with `npx hardhat run <script>` you'll find the Hardhat
// Runtime Environment's members available in the global scope.
const hre = require("hardhat");

async function main() {
  // Hardhat always runs the compile task when running scripts with its command
  // line interface.
  //
  // If this script is run directly using `node` you may want to call compile
  // manually to make sure everything is compiled
  // await hre.run('compile');

  // We get the contract to deploy
  const XCoinStaking = await hre.ethers.getContractFactory("XCoinStaking");
  const xcoinStaking = await XCoinStaking.deploy(1000000000000000);

  await xcoinStaking.deployed();

  const fse = require("fs-extra");
  const srcDir = `C:/Users/Claudiu/Desktop/Blockchain_Project/Lecture2/Blockchain/artifacts`;
  const destDir = `C:/Users/Claudiu/Desktop/Blockchain_Project/Lecture2/frontend/src/artifacts`;

  //copy artifacts to frontend/src
  fse.copySync(srcDir, destDir, { overwrite: true }, function (err) {
    if (err) {
      console.error(err);
    } else {
      console.log("success!");
    }
  });

  //copy the address to the address.js file from frontend/src
  fse.writeFileSync(
    `C:/Users/Claudiu/Desktop/Blockchain_Project/Lecture2/frontend/src/address.js`,
    `export const address = '${xcoinStaking.address}'`,
    (err) => console.log(err)
  );

  console.log("xCoin deployed to: ", xcoinStaking.address);
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
