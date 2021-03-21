import { expect } from 'chai';
import { BigNumber } from '@ethersproject/bignumber';

export const expectBigNumberEqual = (a: BigNumber, b: BigNumber) =>
  expect(a.toString()).eq(b.toString());
