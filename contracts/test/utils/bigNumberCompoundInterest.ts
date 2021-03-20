import { BigNumber } from '@ethersproject/bignumber';

export const bigNumberCompoundInterest = (
  initialValue: BigNumber,
  interest: number,
  iterations: number,
): BigNumber =>
  Array(iterations)
    .fill(0)
    .reduce((acc: BigNumber) => acc.mul(interest).div(1000), initialValue);

export const createFixedInterest = (
  initialValue: BigNumber,
  interest: number,
) => (iterations: number) =>
  bigNumberCompoundInterest(initialValue, interest, iterations);
