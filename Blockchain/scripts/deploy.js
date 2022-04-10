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
  const XCoin = await hre.ethers.getContractFactory("XCoin");
  const xcoin = await XCoin.deploy();

  await xcoin.deployed();

  const fse = require("fs-extra");

  const srcDir = `C:/Users/Claudiu/Desktop/Blockchain_Project/Lecture2/Blockchain/artifacts`;
  const destDir = `C:/Users/Claudiu/Desktop/Blockchain_Project/Lecture2/frontend/src/artifacts`;

  // To copy a folder or file
  fse.copySync(srcDir, destDir, { overwrite: true }, function (err) {
    if (err) {
      console.error(err); // add if you want to replace existing folder or file with same name
    } else {
      console.log("success!");
    }
  });

  console.log("xCoin deployed to: ", xcoin.address);
  fse.writeFileSync(
    `C:/Users/Claudiu/Desktop/Blockchain_Project/Lecture2/frontend/src/address.js`,
    `export const address = '${xcoin.address}'`,
    (err) => console.log(err)
  );
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
