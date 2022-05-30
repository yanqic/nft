const { ethers } = require("hardhat");

async function main() {
  const MyNFT = await ethers.getContractFactory("MyNFT");
  const myNFT = await MyNFT.deploy();

  await myNFT.deployed();

  console.log("Contract MyNFT deployed to:", myNFT.address);

  const Auction = await ethers.getContractFactory("Auction");
  // Start deployment, returning a promise that resolves to a contract object
  const auction = await Auction.deploy();

  await auction.deployed();
  console.log("Contract  Auction deployed to:", auction.address);
}

main()
  .then(() => {
    console.log("deploy completed");
  })
  .catch((error) => {
    console.error("deploy error:", error);
  });
