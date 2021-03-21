import { expect } from 'chai';
import { ethers } from 'hardhat';
import { BigNumber } from '@ethersproject/bignumber';

import { SignerWithAddress } from '@nomiclabs/hardhat-ethers/dist/src/signer-with-address';
import { UnchainedCryptoMarket } from '../artifacts/typechain';
import { expectBigNumberEqual } from './utils/expectBigNumberEqual';

describe('UnchainedCryptoMarket', function () {
  const PRICE_PER_TOKEN = ethers.utils.parseEther('0.1');

  let deployed: UnchainedCryptoMarket;
  let owner: SignerWithAddress;
  let someone: SignerWithAddress;
  let ownerAddress: string;
  let someoneAddress: string;

  it('Deploy', async function () {
    [owner, someone] = await ethers.getSigners();
    ownerAddress = await owner.getAddress();
    someoneAddress = await someone.getAddress();

    const UnchainedCryptoMarketContract = await ethers.getContractFactory(
      'UnchainedCryptoMarket',
    );
    const contract = await UnchainedCryptoMarketContract.deploy(
      PRICE_PER_TOKEN,
    );

    const tx = await contract.deployed();
    deployed = (tx as any) as UnchainedCryptoMarket;
    const receipt = await tx.deployTransaction.wait();

    expect(await deployed.name()).equal('Unchained Cryptomarket NFT');
    expect((await deployed.totalSupply()).toString()).equal('0');
  });

  it('Mint a token after starting block works with correct value', async () => {
    const contentHex = ethers.utils.formatBytes32String('HASH');
    const contentHash = ethers.utils.sha256(contentHex);
    const contentHashBytes = ethers.utils.arrayify(contentHash);
    await deployed.mintAndBuy(ownerAddress, contentHashBytes, {
      value: PRICE_PER_TOKEN,
    });
    expect((await deployed.totalSupply()).toString()).equal('1');
  });

  it('Only Owner can withdraw ether', async () => {
    try {
      await someone.sendTransaction(
        await deployed.populateTransaction.withdraw(),
      );
      expect(false).equal(true);
    } catch (e) {
      expect(e.message).to.include('from address mismatch');
    }
  });

  it('transfer a token', async () => {
    expectBigNumberEqual(
      await deployed.balanceOf(someoneAddress),
      BigNumber.from(0),
    );
    await deployed.transferFrom(ownerAddress, someoneAddress, 0);
    expectBigNumberEqual(
      await deployed.balanceOf(someoneAddress),
      BigNumber.from(1),
    );
  });

  it('owner cannot transfer anymore', async () => {
    try {
      await deployed.transferFrom(ownerAddress, someoneAddress, 0);
      expect(false).equal(true);
    } catch (e) {
      expect(e.message).to.include('transfer caller is not owner nor approved');
    }
  });
});
