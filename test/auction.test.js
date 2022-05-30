const { expect } = require("chai");
const { ethers, waffle } = require("hardhat");

describe("NFT Auction", async function () {
  // eslint-disable-next-line no-unused-vars

  let tokenId;
  let addr1, addr2;
  let myNFT, auction;

  beforeEach(async function () {
    [addr1, addr2] = await ethers.getSigners();

    const NFTContract = await ethers.getContractFactory("MyNFT");

    myNFT = await NFTContract.deploy();

    await myNFT.deployed();

    const Auction = await ethers.getContractFactory("Auction");

    auction = await Auction.deploy();

    await auction.deployed();
    const price = ethers.utils.parseEther("0.0001");

    const mintTx = await myNFT.mintNFT(
      addr1.address,
      "ipfs://bafyreic7tctlsccyl4hmenougvkkamqizucyybb5phpdkrzrk6njofljvm/metadata.json",
      price
    );

    const receipt = await mintTx.wait();
    for (const event of receipt.events) {
      if (event.event === "Transfer") {
        tokenId = event.args.tokenId.toString();
        break;
      }
    }

    console.log("tokenId: " + JSON.stringify(tokenId));
    console.log("addr", addr1.address, addr2.address);
  });

  it("start auction", async function () {
    const acPrice = ethers.utils.parseEther("0.0002");
    const blockDuration = Math.floor(new Date().getTime() / 1000) + 3600;
    await myNFT.connect(addr1).approve(auction.address, tokenId);
    const tx = await auction.createTokenAuction(
      myNFT.address,
      tokenId,
      acPrice,
      blockDuration
    );

    await tx.wait();

    const auctionDetails = await auction.getTokenAuctionDetails(
      myNFT.address,
      tokenId
    );

    expect(auctionDetails.seller).to.equal(addr1.address);
    expect(auctionDetails.isActive).to.equal(true);
  });

  it("start bid", async () => {
    const acPrice = ethers.utils.parseEther("1");
    const blockDuration = Math.floor(new Date().getTime() / 1000) + 12;
    await myNFT.connect(addr1).approve(auction.address, tokenId);
    const tx = await auction.createTokenAuction(
      myNFT.address,
      tokenId,
      acPrice,
      blockDuration
    );

    await tx.wait();

    const bidPrice = ethers.utils.parseEther("2");
    const bidTx = await auction.connect(addr2).bid(myNFT.address, tokenId, {
      value: bidPrice,
    });

    await bidTx.wait();

    const auctionDetails = await auction.getTokenAuctionDetails(
      myNFT.address,
      tokenId
    );

    // console.log("auctionDetails: " + JSON.stringify(auctionDetails.maxBidUser));

    expect(auctionDetails.maxBidUser).to.equal(addr2.address);

    const balance2 = await waffle.provider.getBalance(addr2.address);

    console.log("balance2: ", ethers.utils.formatEther(balance2));

    await new Promise((resolve, reject) => setTimeout(resolve, 6000));
    const saleExecuteTx = await auction
      .connect(addr1)
      .executeSale(myNFT.address, tokenId);

    await saleExecuteTx.wait();

    const addr = await myNFT.ownerOf(tokenId);

    expect(addr).to.equal(addr2.address);
  });
});
