import addresses from './addresses.json';
import simulateLissajousArgs, {
  LissajousArgs,
  colorFromPrice,
} from './lib/simulateLissajousArgs';

export * from './artifacts/typechain';

export { addresses, simulateLissajousArgs, colorFromPrice };
export type { LissajousArgs };
