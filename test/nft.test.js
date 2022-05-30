const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("MyNFT", async function () {
  let myNFT, addr1, addr2;
  beforeEach(async function () {
    [addr1, addr2] = await ethers.getSigners();
    const MyNFT = await ethers.getContractFactory("MyNFT");
    myNFT = await MyNFT.deploy();
    await myNFT.deployed();
  });

  it("mint nft", async function () {
    const price = ethers.utils.parseEther("0.0001");

    console.log("price", price);

    const mintTx = await myNFT.mintNFT(
      addr1.address,
      "ipfs://bafyreic7tctlsccyl4hmenougvkkamqizucyybb5phpdkrzrk6njofljvm/metadata.json",
      price
    );

    const receipt = await mintTx.wait();
    let tokenId = null;
    for (const event of receipt.events) {
      if (event.event === "Transfer") {
        tokenId = event.args.tokenId.toString();
        break;
      }
    }

    expect(tokenId).to.equal("1");
  });

  it("buy NFT", async () => {
    const price = ethers.utils.parseEther("0.00001");

    const mintTx = await myNFT.mintNFT(
      addr1.address,
      "ipfs://bafyreic7tctlsccyl4hmenougvkkamqizucyybb5phpdkrzrk6njofljvm/metadata.json",
      price
    );

    const receipt = await mintTx.wait();
    let tokenId = null;
    for (const event of receipt.events) {
      if (event.event === "Transfer") {
        tokenId = event.args.tokenId.toString();
        break;
      }
    }

    const nftWithSinger = await myNFT.connect(addr2);

    const buyTx = await nftWithSinger.buy(addr1.address, tokenId, {
      value: price,
    });

    await buyTx.wait();

    const ret = await myNFT.ownerOf(tokenId);

    expect(ret).to.equal(addr2.address);
  });
});
