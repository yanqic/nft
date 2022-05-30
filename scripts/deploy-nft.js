const { ethers } = require("hardhat");

async function main() {
  // We get the contract to deploy
  const MyNFT = await ethers.getContractFactory("MyNFT");
  const myNFT = await MyNFT.deploy();

  await myNFT.deployed();

  console.log("NFT deployed to:", myNFT.address);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
