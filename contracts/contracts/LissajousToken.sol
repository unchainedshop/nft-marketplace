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

    uint256 private _startBlock;
    uint256 private _endBlock;
    uint256 private _startPrice;
    uint32 private _rainbowFrequency;

    uint256 public constant _priceIncreasePromille = 1001;

    uint256[29] public priceSteps = [
        100 ether,
        10 ether,
        9 ether,
        8 ether,
        7 ether,
        6 ether,
        5 ether,
        4 ether,
        3 ether,
        2 ether,
        1 ether,
        0.9 ether,
        0.8 ether,
        0.7 ether,
        0.6 ether,
        0.5 ether,
        0.4 ether,
        0.3 ether,
        0.2 ether,
        0.1 ether,
        0.09 ether,
        0.08 ether,
        0.07 ether,
        0.06 ether,
        0.05 ether,
        0.04 ether,
        0.03 ether,
        0.02 ether,
        0.01 ether
    ];

    bytes3[29] public sortedColorList = [
        bytes3(0xE5E4E2),
        bytes3(0xffd700),
        bytes3(0xf2fa00),
        bytes3(0xbff600),
        bytes3(0x8df100),
        bytes3(0x5dec00),
        bytes3(0x2fe700),
        bytes3(0x03e300),
        bytes3(0x00de27),
        bytes3(0x00d950),
        bytes3(0x00d576),
        bytes3(0x00d09b),
        bytes3(0x00cbbf),
        bytes3(0x00adc7),
        bytes3(0x0084c2),
        bytes3(0x005dbd),
        bytes3(0x0037b8),
        bytes3(0x0014b4),
        bytes3(0x0e00af),
        bytes3(0x2e00aa),
        bytes3(0x4c00a6),
        bytes3(0x6900a1),
        bytes3(0x84009c),
        bytes3(0x980093),
        bytes3(0x930072),
        bytes3(0x8e0053),
        bytes3(0x890036),
        bytes3(0x85001b),
        bytes3(0x800002)
    ];

    struct TokenInfo {
        uint256 mintValue;
        uint256 mintBlock;
        uint256 minPrice; // used for next price calculation
    }

    mapping(uint256 => TokenInfo) private _tokenInfos;

    constructor(
        uint256 startBlock_,
        uint256 endBlock_, // Maybe 64 * 8192 (=~80 days)
        uint256 startPrice_, // 0.01 ether
        uint32 rainbowFrequency_ // 4'096
    ) ERC721('Lissajous Token', 'LISSA') {
        uint256 id;
        assembly {
            id := chainid()
        }
        if (id == 56) revert('Nope!');
        if (id == 97) revert('Nope!');
        _setBaseURI('https://lissajous.art/api/token/');
        _startBlock = startBlock_;
        _endBlock = endBlock_;
        _startPrice = startPrice_;
        _rainbowFrequency = rainbowFrequency_;
    }

    function minPrice(uint256 tokenIndex) public view returns (uint256) {
        if (tokenIndex == 0) return _startPrice;
        uint256 lastMinPrice = _tokenInfos[tokenIndex - 1].minPrice;
        return (lastMinPrice * _priceIncreasePromille) / 1000;
    }

    function currentMinPrice() public view returns (uint256) {
        return minPrice(totalSupply());
    }

    function hashBlock(uint256 blockNumber) public view returns (bytes32) {
        return keccak256(abi.encode(blockNumber));
    }

    function isHashRainbow(bytes32 blockHash) public view returns (bool) {
        uint256 asInt = uint256(blockHash);
        return (asInt % (_rainbowFrequency)) == 0;
    }

    function isBlockRainbow(uint256 blockNumber) public view returns (bool) {
        return isHashRainbow(hashBlock(blockNumber));
    }

    /**
     * If minting more than one, the lower minimum mint price is used for all tokens
     *
     * Returns change:
     * - If current minPrice is 0.15 and the sender sends 0.19 -> 0.04 change
     * - If current minPrice is 0.15 and the sender sends 0.2 (next price step) -> 0 change
     * - If current minPrice is 0.15 and the sender sends 0.21 (down to next price step) -> 0.01 change
     */
    function mint(address to, uint8 amount) public payable {
        require(amount > 0, 'Mint at least one token');
        require(amount <= 16, 'Only 16 token at a time');
        require(block.number > _startBlock, 'Sale not yet started');
        require(block.number < _endBlock, 'Sale ended');

        uint256 txMinPrice = currentMinPrice().mul(amount);

        require(msg.value >= txMinPrice, 'Min price not met');
        require(msg.value <= 1000 ether, 'Way too much ETH!');

        uint256 pricePerToken = msg.value.div(amount);
        uint256 priceStep = priceStepFromValue(pricePerToken);
        uint256 aboveMinPrice = pricePerToken.sub(currentMinPrice());
        uint256 abovePriceStep = pricePerToken.sub(priceStep);
        uint256 changePerToken = 0;
        uint256 change = 0;

        if (aboveMinPrice < abovePriceStep) {
            changePerToken = aboveMinPrice;
        } else {
            changePerToken = abovePriceStep;
        }

        for (uint8 i = 0; i < amount; i++) {
            bool rainbow = isBlockRainbow(block.number.add(i));
            uint256 tokenIndex = totalSupply();
            uint256 minPriceBefore = minPrice(tokenIndex);

            if (!rainbow) {
                _safeMint(to, tokenIndex);
                _tokenInfos[tokenIndex] = TokenInfo(
                    pricePerToken,
                    block.number.add(i),
                    minPriceBefore
                );
                // Return the normal change
                change = change.add(changePerToken);
            } else if (rainbow && i == 0) {
                // Rainbow can not be minted in a set
                _safeMint(to, tokenIndex);
                _tokenInfos[tokenIndex] = TokenInfo(
                    minPriceBefore,
                    block.number.add(i),
                    minPriceBefore
                );
                // Return the excess over the minPrice
                change = change.add(pricePerToken.sub(minPriceBefore));
            } else {
                // If rainbow would be part of a set, return that money
                change = change.add(pricePerToken);
            }
        }

        msg.sender.transfer(change);
    }

    function tokenMintValue(uint256 tokenIndex) public view returns (uint256) {
        return _tokenInfos[tokenIndex].mintValue;
    }

    function tokenMintBlock(uint256 tokenIndex) public view returns (uint256) {
        return _tokenInfos[tokenIndex].mintBlock;
    }

    function tokenMintBlockHash(uint256 tokenIndex)
        public
        view
        returns (bytes32)
    {
        return keccak256(abi.encode(_tokenInfos[tokenIndex].mintBlock));
    }

    function tokenColor(uint256 tokenIndex) public view returns (bytes3) {
        uint256 mintValue = tokenMintValue(tokenIndex);

        for (uint256 i; i < priceSteps.length; i++) {
            if (mintValue >= priceSteps[i]) {
                return sortedColorList[i];
            }
        }

        return sortedColorList[sortedColorList.length - 1];
    }

    function priceStepFromValue(uint256 valuePerToken)
        public
        view
        returns (uint256)
    {
        for (uint256 i; i < priceSteps.length; i++) {
            if (valuePerToken >= priceSteps[i]) {
                return priceSteps[i];
            }
        }

        return 0;
    }

    function aspectRatio(uint256 tokenIndex)
        public
        view
        returns (uint8 height, uint8 width)
    {
        bytes32 mintBlockHash = tokenMintBlockHash(tokenIndex);
        uint8 first = uint8(mintBlockHash[0]);

        if (first % 8 == 0) {
            return (16, 16);
        } else if (first % 8 == 1) {
            return (16, 9);
        } else if (first % 8 == 2) {
            return (9, 16);
        } else if (first % 8 == 3) {
            return (12, 16);
        } else if (first % 8 == 4) {
            return (16, 12);
        } else if (first % 8 == 5) {
            return (3, 16);
        } else if (first % 8 == 6) {
            return (16, 3);
        }

        return (10, 10);
    }

    function lissajousArguments(uint256 tokenIndex)
        public
        view
        returns (
            uint8 frequenceX,
            uint8 frequenceY,
            uint8 phaseShift,
            uint8 totalSteps,
            uint8 startStep,
            bool rainbow
        )
    {
        bytes32 mintBlockHash = tokenMintBlockHash(tokenIndex);

        uint8 second = uint8(mintBlockHash[1]);
        uint8 third = uint8(mintBlockHash[2]);
        uint8 fourth = uint8(mintBlockHash[3]);
        uint8 fifth = uint8(mintBlockHash[4]);
        uint8 sixth = uint8(mintBlockHash[5]);
        bool rainbow = isHashRainbow(mintBlockHash);

        return (
            (second % 16) + 1,
            (third % 16) + 1,
            fourth % 16,
            (fifth % 16) + 1,
            (sixth % 16) + 1,
            rainbow
        );
    }

    function startBlock() public view returns (uint256) {
        return _startBlock;
    }

    function endBlock() public view returns (uint256) {
        return _endBlock;
    }

    function rainbowFrequency() public view returns (uint32) {
        return _rainbowFrequency;
    }

    function withdraw() public onlyOwner {
        uint256 balance = address(this).balance;
        msg.sender.transfer(balance);
    }
}
