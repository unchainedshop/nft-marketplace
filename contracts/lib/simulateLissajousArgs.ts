import { BigNumber, ethers } from 'ethers';

const aspectRatios = [
  { h: 16, w: 16 },
  { h: 16, w: 9 },
  { h: 9, w: 16 },
  { h: 12, w: 16 },
  { h: 16, w: 12 },
  { h: 3, w: 16 },
  { h: 16, w: 3 },
  { h: 10, w: 10 },
];

const priceColorMap = [
  ['100', '#E5E4E2'],
  ['10', '#ffd700'],
  ['9', '#f2fa00'],
  ['8', '#bff600'],
  ['7', '#8df100'],
  ['6', '#5dec00'],
  ['5', '#2fe700'],
  ['4', '#03e300'],
  ['3', '#00de27'],
  ['2', '#00d950'],
  ['1', '#00d576'],
  ['0.9', '#00d09b'],
  ['0.8', '#00cbbf'],
  ['0.7', '#00adc7'],
  ['0.6', '#0084c2'],
  ['0.5', '#005dbd'],
  ['0.4', '#0037b8'],
  ['0.3', '#0014b4'],
  ['0.2', '#0e00af'],
  ['0.1', '#2e00aa'],
  ['0.09', '#4c00a6'],
  ['0.08', '#6900a1'],
  ['0.07', '#84009c'],
  ['0.06', '#980093'],
  ['0.05', '#930072'],
  ['0.04', '#8e0053'],
  ['0.03', '#890036'],
  ['0.02', '#85001b'],
  ['0.01', '#800002'],
];

export type LissajousArgs = {
  height: number;
  width: number;
  frequenceX: number;
  frequenceY: number;
  lineWidth?: number;
  phaseShift: number;
  totalSteps: number;
  startStep: number;
  rainbow: boolean;
  strokeColor?: string;
  animated?: boolean;
  gradient?: boolean;
};

export const getBlockHash = (blockNumber: number) =>
  ethers.utils.solidityKeccak256(['uint256'], [blockNumber]);

export const colorFromPrice = (
  tokenPrice: BigNumber = BigNumber.from(0),
): string => {
  const [, color] = priceColorMap.find(([price]) =>
    tokenPrice.gte(ethers.utils.parseEther(price)) ? true : false,
  ) || [, '#555555'];

  return color.toLocaleLowerCase();
};

const simulateLissajousArgs = (
  blockNumber: number,
  tokenPrice: BigNumber = BigNumber.from(0),
  rainbowFrequency: number = 16384,
): LissajousArgs => {
  const currentHash = getBlockHash(blockNumber);
  const array = ethers.utils.arrayify(currentHash);
  const aspectRatio = aspectRatios[array[0] % 8];

  return {
    height: aspectRatio.h,
    width: aspectRatio.w,
    frequenceX: (array[1] % 16) + 1,
    frequenceY: (array[2] % 16) + 1,
    phaseShift: (1 / 16) * (array[3] % 16),
    totalSteps: (array[4] % 16) + 1,
    startStep: (array[5] % 16) + 1,
    lineWidth: 8,
    strokeColor: colorFromPrice(tokenPrice),
    rainbow: BigNumber.from(currentHash).mod(rainbowFrequency).eq(0),
  };
};

export default simulateLissajousArgs;
