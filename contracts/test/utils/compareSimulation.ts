import { expect } from 'chai';
import simulateLissajousArgs, {
  getBlockHash,
} from '../../lib/simulateLissajousArgs';

const BASE_URI = 'https://lissajous.art/api/token/';

export const compareSimulation = async (
  deployed,
  tokenId,
  rainbowFrequency,
) => {
  const uri = await deployed.tokenURI(tokenId);
  expect(uri).equal(`${BASE_URI}${tokenId}`);

  const mintValue = await deployed.tokenMintValue(tokenId);
  const mintBlock = await deployed.tokenMintBlock(tokenId);
  const tokenColor = await deployed.tokenColor(tokenId);
  const aspectRatio = await deployed.aspectRatio(tokenId);
  const lissajousArguments = await deployed.lissajousArguments(tokenId);
  const tokenMintBlockHash = await deployed.tokenMintBlockHash(tokenId);

  expect(tokenMintBlockHash).equal(getBlockHash(mintBlock.toNumber()));

  const simulatedLissajousArgs = simulateLissajousArgs(
    mintBlock.toNumber(),
    mintValue,
    rainbowFrequency,
  );

  expect(tokenColor.replace('0x', '#')).equal(
    simulatedLissajousArgs.strokeColor,
  );
  expect(aspectRatio.height).equal(simulatedLissajousArgs.height);
  expect(aspectRatio.width).equal(simulatedLissajousArgs.width);
  expect(lissajousArguments.frequenceX).equal(
    simulatedLissajousArgs.frequenceX,
  );
  expect(lissajousArguments.frequenceY).equal(
    simulatedLissajousArgs.frequenceY,
  );
  expect((1 / 16) * lissajousArguments.phaseShift).equal(
    simulatedLissajousArgs.phaseShift,
  );
  expect(lissajousArguments.totalSteps).equal(
    simulatedLissajousArgs.totalSteps,
  );
  expect(lissajousArguments.startStep).equal(simulatedLissajousArgs.startStep);
  expect(lissajousArguments.rainbow).equal(simulatedLissajousArgs.rainbow);
};
