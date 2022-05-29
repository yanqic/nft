// SPDX-License-Identifier: GPL-3.0
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/utils/Counters.sol";

contract MyNFT is ERC721URIStorage {
    using Counters for Counters.Counter;
    Counters.Counter private _tokenIds;

    constructor() ERC721("NFT STORE", "NFT") {
        _shopOwner = msg.sender;
    }

    mapping(uint256 => address) private _owner;
    mapping(uint256 => uint256) private _price;
    mapping(uint256 => string) private _tokenURIs;
    address private _shopOwner;

    function addNFT(
        address owner,
        string memory tokenURI,
        uint256 price
    ) public returns (uint256) {
        // require(owner == _shopOwner,"Sorry you cannot mint only shop owner can");
        _tokenIds.increment();
        uint256 newId = _tokenIds.current();
        _mint(owner, newId);
        _setPrice(newId, price);
        _setTokenURI(newId, tokenURI);
        _setOwner(owner, newId);
        return newId;
    }

    function totalNFTs() public view returns (uint256) {
        return _tokenIds.current();
    }

    function buy(address payable from, uint256 tokenid)
        public
        payable
        returns (bool)
    {
        require(_exists(tokenid), "NFT does not exists");
        require(_getPrice(tokenid) <= msg.value, "Not Enough Ether transfered");
        require(
            ownerOf(tokenid) != msg.sender,
            "Come on man its already yours"
        );
        _setOwner(msg.sender, tokenid);
        _transfer(from, msg.sender, tokenid);
        from.transfer(msg.value);
        return true;
    }

    function getOwners() public view returns (address[] memory) {
        address[] memory ret = new address[](totalNFTs());
        for (uint256 i = 0; i < totalNFTs(); i++) {
            ret[i] = _owner[i + 1];
        }
        return ret;
    }

    function getTokenURIs() public view returns (string[] memory) {
        string[] memory ret = new string[](totalNFTs());
        for (uint256 i = 0; i < totalNFTs(); i++) {
            ret[i] = _tokenURIs[i + 1];
        }
        return ret;
    }

    function getPrices() public view returns (uint256[] memory) {
        uint256[] memory ret = new uint256[](totalNFTs());
        for (uint256 i = 0; i < totalNFTs(); i++) {
            ret[i] = _price[i + 1];
        }
        return ret;
    }

    function _setTokenURI(uint256 tokenid, string memory tokenURI)
        internal
        override
    {
        require(
            _exists(tokenid),
            "ERC721URIStorage: URI set of nonexistent token"
        );
        _tokenURIs[tokenid] = tokenURI;
    }

    function _setPrice(uint256 tokenid, uint256 price) private {
        require(price > 0, "ERC721: Price cannot be 0");
        _price[tokenid] = price;
    }

    function _getPrice(uint256 tokenid) private view returns (uint256) {
        return _price[tokenid];
    }

    function _setOwner(address owner, uint256 tokenid) private {
        _owner[tokenid] = owner;
    }
}
