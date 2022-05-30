// We require the Hardhat Runtime Environment explicitly here. This is optional
// but useful for running the script in a standalone fashion through `node <script>`.
//
// When running the script with `npx hardhat run <script>` you'll find the Hardhat
// Runtime Environment's members available in the global scope.

require("@nomiclabs/hardhat-ethers");
const { ethers } = require("hardhat");
const path = require("path");
const fs = require("fs");
const { NFTStorage, File } = require("nft.storage");

// 调用dotenv配置方法
require("dotenv").config();

// NFT.storage 获取的API Token
const storageToken = process.env.NFT_STORAGE_TOKEN || "";

// NFTStorage 客户端实例
const client = new NFTStorage({ token: storageToken });

// NFT合约部署成功后的地址
const CONTRACT_ADDRESS = process.env.MY_NFT_CONTRACT_ADDRESS || "";

// 合约部署人
const OWNER = process.env.PUBLIC_KEY || "";

// 合约接口
const contractInterface =
  require("../artifacts/contracts/MyNFT.sol/MyNFT.json").abi;

// provider
const provider = new ethers.providers.InfuraProvider(
  process.env.NETWORK,
  process.env.PROJECT_ID
);

// 钱包实例
const wallet = new ethers.Wallet(process.env.PRIVATE_KEY, provider);

// 合约
const contract = new ethers.Contract(
  CONTRACT_ADDRESS,
  contractInterface,
  provider
);
const contractWithSigner = contract.connect(wallet);

// 上传文件到nft.storage
async function uploadNFTFile({ file, name, description }) {
  console.log("Uploading file to nft storage", { file, name, description });
  const metadata = await client.store({
    name,
    description,
    image: file,
  });
  return metadata;
}

// 铸造NFT
async function mintNFT({ filePath, name = "", description = "" }) {
  console.log("要铸造的NFT：", { filePath, name, description });
  const file = fs.readFileSync(filePath);

  const metaData = await uploadNFTFile({
    file: new File([file.buffer], name, {
      type: "image/jpg", // image/png
    }),
    name,
    description,
  });

  console.log("NFT Storage上存储的NFT数据：", metaData);

  const price = ethers.utils.parseEther("0.001");

  const mintTx = await contractWithSigner.mintNFT(OWNER, metaData?.url, price);

  const tx = await mintTx.wait();
  console.log("铸造的NFT区块地址：", tx.blockHash);
}

// 入口函数
async function main() {
  // 读取根目录下assets文件夹下的文件
  const files = fs.readdirSync(path.join(__dirname, "../assets"));

  for (const file of files) {
    const filePath = path.join(__dirname, "../assets", file);
    await mintNFT({
      filePath,
      name: file,
      description: path.join(file),
    });
  }
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main()
  .then(() => console.log("Done!"))
  .catch((error) => {
    console.error(error);
  });
