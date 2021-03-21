import fs from 'fs';
import { BigNumber } from '@ethersproject/bignumber';

async function main() {
  const PRICE_PER_TOKEN = ethers.utils.parseEther('0.1');

  const UnchainedCryptoMarketContract = await global.ethers.getContractFactory(
    'UnchainedCryptoMarket',
  );
  const { chainId } = await global.ethers.provider.getNetwork();
  const UnchainedCryptoMarket = await UnchainedCryptoMarketContract.deploy(
    PRICE_PER_TOKEN,
    { gasPrice: BigNumber.from(4).mul(1000000000) },
  );

  console.log({
    chainId,
    UnchainedCryptoMarket: Object.keys(UnchainedCryptoMarket),
  });

  const tx = await UnchainedCryptoMarket.deployed();
  console.log({ tx });

  const receipt = await tx.deployTransaction.wait();

  console.log({ receipt });

  const addresses = fs.readFileSync(`./addresses.json`);

  const newAddresses = {
    ...JSON.parse(addresses),
    [chainId]: {
      UnchainedCryptoMarket: UnchainedCryptoMarket.address,
    },
  };

  fs.writeFileSync(`./addresses.json`, JSON.stringify(newAddresses, null, 2));

  console.log('Contract deployed to:', UnchainedCryptoMarket.address);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
