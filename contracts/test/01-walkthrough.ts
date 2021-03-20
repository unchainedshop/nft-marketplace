import { expect } from 'chai';
import { ethers } from 'hardhat';
import { BigNumber } from '@ethersproject/bignumber';

import { LissajousToken } from '../artifacts/typechain';
import { SignerWithAddress } from '@nomiclabs/hardhat-ethers/dist/src/signer-with-address';

import { bigNumberCompoundInterest } from './utils/bigNumberCompoundInterest';
import { compareSimulation } from './utils/compareSimulation';
import { expectBigNumberEqual } from './utils/expectBigNumberEqual';

describe('LissajousToken', function () {
  const START_BLOCK = 3; // First blocks are for contract creation
  const END_BLOCK = 20;
  const START_PRICE = BigNumber.from('10').pow('16'); // 0.01 ETH
  const SAFE_PRICE = BigNumber.from('10').pow('18'); // 1 ETH
  const BASE_URI = 'https://lissajous.art/api/token/';
  const RAINBOW_FREQUENCY = 4096;

  let deployed: LissajousToken;
  let owner: SignerWithAddress;
  let someone: SignerWithAddress;
  let ownerAddress: string;
  let someoneAddress: string;

  it('Deploy', async function () {
    [owner, someone] = await ethers.getSigners();
    ownerAddress = await owner.getAddress();
    someoneAddress = await someone.getAddress();

    const LissajousTokenContract = await ethers.getContractFactory(
      'LissajousToken',
    );
    const contract = await LissajousTokenContract.deploy(
      START_BLOCK,
      END_BLOCK,
      START_PRICE,
      RAINBOW_FREQUENCY,
    );

    const tx = await contract.deployed();
    deployed = (tx as any) as LissajousToken;
    const receipt = await tx.deployTransaction.wait();

    console.log(
      'Gas fees with 100 gwei gas price: ETH',
      ethers.utils.formatEther(receipt.gasUsed.mul(100).mul(1000000000)),
    );

    expect(await deployed.name()).equal('Lissajous Token');
    expect((await deployed.totalSupply()).toString()).equal('0');
  });

  it('Mint a token before starting block should fail', async () => {
    try {
      await deployed.mint(ownerAddress, 1, { value: SAFE_PRICE });
      expect(false).equal(true);
    } catch (e) {
      expect(e.message).to.include('Sale not yet started');
    }
  });

  it('Mine a block manually', async () => {
    const beforeBlock = await ethers.provider.getBlockNumber();
    await ethers.provider.send('evm_mine', []);
    const afterBlock = await ethers.provider.getBlockNumber();
    expect(afterBlock).to.be.greaterThan(beforeBlock);
    expect(afterBlock).to.be.greaterThan(START_BLOCK - 1);
  });

  it('Mint a token with too little value', async () => {
    try {
      await deployed.mint(ownerAddress, 1);
      expect(false).equal(true);
    } catch (e) {
      expect(e.message).to.include('Min price not met');
    }
  });

  it('Mint a token after starting block works with correct value', async () => {
    await deployed.mint(ownerAddress, 1, { value: START_PRICE });
    expect((await deployed.totalSupply()).toString()).equal('1');
  });

  it('Mint more token with the same value fails because of price increase', async () => {
    try {
      await deployed.mint(ownerAddress, 16, { value: START_PRICE });
      expect(false).equal(true);
    } catch (e) {
      expect(e.message).to.include('Min price not met');
    }
  });

  it('Mint more than 24 is forbidden', async () => {
    try {
      await deployed.mint(ownerAddress, 17, {
        value: START_PRICE.mul(1001).div(1000).mul(17),
      });

      expect(false).equal(true);
    } catch (e) {
      expect(e.message).to.include('Only 16 token at a time');
    }
  });

  it('Mint more token with the correct value', async () => {
    const tx = await deployed.mint(ownerAddress, 16, {
      value: START_PRICE.mul(1001).div(1000).mul(16),
    });
    const receipt = await tx.wait();
    console.log(receipt.gasUsed.toString());
    expect((await deployed.totalSupply()).toString()).equal('17');
  });

  it('Price is up after minting several tokens', async () => {
    const currentMinPrice = await deployed.currentMinPrice();

    expect(currentMinPrice.toString()).eq(
      bigNumberCompoundInterest(START_PRICE, 1001, 17).toString(),
    );
  });

  it('Return change if over minPrice', async () => {
    const tooHighPrice = ethers.utils.parseEther('0.019');
    const currentMinPrice = await deployed.currentMinPrice();
    const balanceBefore = await owner.getBalance();
    const txResponse = await owner.sendTransaction(
      await deployed.populateTransaction.mint(ownerAddress, 1, {
        value: tooHighPrice,
      }),
    );

    const txReceipt = await txResponse.wait();
    const gasCost = txReceipt.gasUsed.mul(txResponse.gasPrice);
    const balanceAfter = await owner.getBalance();

    expect(balanceAfter.add(gasCost).add(currentMinPrice).toString()).equals(
      balanceBefore.toString(),
    );
  });

  it('Minting after last block denied', async () => {
    for (let i = 0; i < 20; i++) {
      await ethers.provider.send('evm_mine', []);
    }
    try {
      await deployed.mint(ownerAddress, 1, { value: SAFE_PRICE });
      expect(false).equal(true);
    } catch (e) {
      expect(e.message).to.include('Sale ended');
    }
  });

  it('Owner can withdraw ether', async () => {
    const balanceBefore = await owner.getBalance();
    const contractBalance = await ethers.provider.getBalance(deployed.address);
    const txResponse = await owner.sendTransaction(
      await deployed.populateTransaction.withdraw(),
    );
    const txReceipt = await txResponse.wait();
    const gasCost = txReceipt.gasUsed.mul(txResponse.gasPrice);
    const balanceAfter = await owner.getBalance();

    expect(balanceAfter.add(gasCost).toString()).equals(
      balanceBefore.add(contractBalance).toString(),
    );
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

  it('Get token MetaData', async () => {
    const uri = await deployed.tokenURI(0);
    expect(uri).equal(`${BASE_URI}${0}`);

    const mintValue = await deployed.tokenMintValue(0);
    expect(mintValue.eq(START_PRICE));

    const mintBlock = await deployed.tokenMintBlock(0);
    expect(mintBlock.eq(4));

    const tokenColor = await deployed.tokenColor(0);
    expect(tokenColor).equal('0x800002');

    const aspectRatio = await deployed.aspectRatio(0);
    expect(aspectRatio.height).equal(12);
    expect(aspectRatio.width).equal(16);

    const lissajousArguments = await deployed.lissajousArguments(0);
    expect(lissajousArguments.frequenceX).equal(12);
    expect(lissajousArguments.frequenceY).equal(4);
    expect(lissajousArguments.phaseShift).equal(4);
    expect(lissajousArguments.totalSteps).equal(6);
    expect(lissajousArguments.startStep).equal(13);

    await compareSimulation(deployed, 5, RAINBOW_FREQUENCY);
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
