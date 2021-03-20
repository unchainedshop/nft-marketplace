import fs from 'fs';
import { BigNumber } from '@ethersproject/bignumber';

async function main() {
  const START_BLOCK = 12070120; // Ziel: 17:00. Jetzt (06:37): 12067600, avg Blocktime: 14. 4 Block pro minute => 240 pro stunde. 2520
  const END_BLOCK = START_BLOCK + 524288;
  const START_PRICE = BigNumber.from('10').pow('16'); // 0.01 ETH
  const RAINBOW_FREQUENCY = 16384; // Will be 4096

  const LissajousTokenFactory = await global.ethers.getContractFactory(
    'LissajousToken',
  );
  const { chainId } = await global.ethers.provider.getNetwork();
  const LissajousToken = await LissajousTokenFactory.deploy(
    START_BLOCK,
    END_BLOCK,
    START_PRICE,
    RAINBOW_FREQUENCY,
    { gasPrice: BigNumber.from(120).mul(1000000000) },
  );

  const addresses = fs.readFileSync(`./addresses.json`);

  const newAddresses = {
    ...JSON.parse(addresses),
    [chainId]: {
      LissajousToken: LissajousToken.address,
    },
  };

  fs.writeFileSync(`./addresses.json`, JSON.stringify(newAddresses, null, 2));

  console.log('Contract deployed to:', LissajousToken.address);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
