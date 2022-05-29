const { ethers } = require("hardhat");

async function main() {
  const FedNFT = await ethers.getContractFactory("MyNFT");

  // Start deployment, returning a promise that resolves to a contract object
  const fedNFT = await FedNFT.deploy();

  await fedNFT.deployed();
  console.log("Contract NFT deployed to address:", fedNFT.address);

  const Auction = await ethers.getContractFactory("Auction");
  // Start deployment, returning a promise that resolves to a contract object
  const auction = await Auction.deploy();

  await auction.deployed();
  console.log("Contract  Auction deployed to address:", auction.address);
}

main()
  .then(() => {
    console.log("deploy completed");
  })
  .catch((error) => {
    console.error("deploy error:", error);
  });
