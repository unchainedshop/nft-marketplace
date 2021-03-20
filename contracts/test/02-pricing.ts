import { expect } from 'chai';
import { ethers } from 'hardhat';
import { SignerWithAddress } from '@nomiclabs/hardhat-ethers/dist/src/signer-with-address';
import { BigNumber } from '@ethersproject/bignumber';

import { LissajousToken } from '../artifacts/typechain';
import { compareSimulation } from './utils/compareSimulation';
import { createFixedInterest } from './utils/bigNumberCompoundInterest';
import { expectBigNumberEqual } from './utils/expectBigNumberEqual';

/**
 *
 * const compoundInterest = (initialValue, interest, iterations) =>
  initialValue * (1 + interest) ** iterations;
 */

const START_BLOCK = 3; // First blocks are for contract creation
const END_BLOCK = 10000;
const START_PRICE = BigNumber.from('10').pow('16'); // 0.01 ETH
const RAINBOW_FREQUENCY = 12;

require('./01-walkthrough');

const calculatePrice = createFixedInterest(START_PRICE, 1001);

describe('LissajousToken Pricing', function () {
  let deployed: LissajousToken;
  let owner: SignerWithAddress;
  let someone: SignerWithAddress;
  let ownerAddress: string;

  it('Deploy', async function () {
    [owner, someone] = await ethers.getSigners();
    ownerAddress = await owner.getAddress();

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

    expect(await deployed.name()).to.equal('Lissajous Token');
    expect((await deployed.totalSupply()).toString()).to.equal('0');
  });

  it('start price', async () => {
    expectBigNumberEqual(await deployed.currentMinPrice(), START_PRICE);
  });

  it('increased price', async () => {
    await deployed.mint(ownerAddress, 1, { value: START_PRICE });

    expectBigNumberEqual(await deployed.currentMinPrice(), calculatePrice(1));

    await compareSimulation(deployed, 0, RAINBOW_FREQUENCY);
  });

  it('Higher value', async () => {
    await deployed.mint(ownerAddress, 1, {
      value: ethers.utils.parseEther('1'),
    });
    expectBigNumberEqual(await deployed.currentMinPrice(), calculatePrice(2));
    await compareSimulation(deployed, 1, RAINBOW_FREQUENCY);
  });

  it('Even Higher value', async () => {
    await deployed.mint(ownerAddress, 1, {
      value: ethers.utils.parseEther('2'),
    });
    expectBigNumberEqual(await deployed.currentMinPrice(), calculatePrice(3));
    await compareSimulation(deployed, 2, RAINBOW_FREQUENCY);
  });

  it('Ridiculous higher value', async () => {
    await deployed.mint(ownerAddress, 1, {
      value: ethers.utils.parseEther('200'),
    });
    expectBigNumberEqual(await deployed.currentMinPrice(), calculatePrice(4));
    await compareSimulation(deployed, 3, RAINBOW_FREQUENCY);
  });

  it('Ridiculous higher value', async () => {
    for (let i = 0; i < 100; i++) {
      await deployed.mint(ownerAddress, 1, {
        value: ethers.utils.parseEther('10'),
      });
    }

    expectBigNumberEqual(await deployed.currentMinPrice(), calculatePrice(104));
    await compareSimulation(deployed, 5, RAINBOW_FREQUENCY);
    await compareSimulation(deployed, 23, RAINBOW_FREQUENCY);
    await compareSimulation(deployed, 103, RAINBOW_FREQUENCY);
  });
});
