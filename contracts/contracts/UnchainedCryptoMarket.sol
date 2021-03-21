// SPDX-License-Identifier: MIT

pragma solidity ^0.7.3;

import '@openzeppelin/contracts/access/Ownable.sol';
// import '@openzeppelin/contracts/math/SafeMath.sol';
import '@openzeppelin/contracts/utils/Context.sol';
import '@openzeppelin/contracts/token/ERC721/ERC721.sol';

// import 'hardhat/console.sol';

// https://docs.opensea.io/docs/metadata-standards
contract UnchainedCryptoMarket is Context, Ownable, ERC721 {
    // using SafeMath for uint256;

    uint256 public pricePerToken;

    mapping(bytes32 => bool) private _contentHashes;
    mapping(uint256 => bytes32) public tokenContentHashes;

    constructor(uint256 pricePerToken_)
        ERC721('Unchained Cryptomarket NFT', 'UCNFT')
    {
        _setBaseURI('https://musky.memes/api/token/');
        pricePerToken = pricePerToken_;
    }

    function mintAndBuy(address to, bytes32 contentHash) public payable {
        require(msg.value == pricePerToken, 'Min price not met');
        require(!_contentHashes[contentHash], 'Media already minted');
        uint256 tokenId = totalSupply();
        _safeMint(to, tokenId);
        _contentHashes[contentHash] = true;
        tokenContentHashes[tokenId] = contentHash;
    }

    function withdraw() public onlyOwner {
        uint256 balance = address(this).balance;
        msg.sender.transfer(balance);
    }
}
