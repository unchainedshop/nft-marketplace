// SPDX-License-Identifier: MIT

pragma solidity ^0.7.3;

import '@openzeppelin/contracts/access/Ownable.sol';
import '@openzeppelin/contracts/math/SafeMath.sol';
import '@openzeppelin/contracts/utils/Context.sol';
import '@openzeppelin/contracts/token/ERC721/ERC721.sol';

import 'hardhat/console.sol';

// https://docs.opensea.io/docs/metadata-standards
contract LissajousToken is Context, Ownable, ERC721 {
    using SafeMath for uint256;

    constructor(
    ) ERC721('Unchained Cryptomarket NFT', 'UCNFT') {
        uint256 id;
        assembly {
            id := chainid()
        }
        if (id == 56) revert('Nope!');
        if (id == 97) revert('Nope!');
        _setBaseURI('https://lissajous.art/api/token/');

    }


    function mint(address to, uint8 amount) public payable {

    }


    function withdraw() public onlyOwner {
        uint256 balance = address(this).balance;
        msg.sender.transfer(balance);
    }
}
