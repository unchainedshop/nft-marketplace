import React, { useState, useContext, useEffect } from 'react';
import { BigNumber, ethers } from 'ethers';
import {
  addresses,
  UnchainedCryptoMarket,
  UnchainedCryptoMarket__factory,
} from '@private/contracts';

type Transaction = {
  amount: number;
  price: BigNumber;
  tx?: ethers.ContractTransaction;
};

type Token = {
  id: BigNumber;
  owner: string;
  hash: string;
};

const chainIdMap = {
  1: 'mainnet',
  3: 'ropsten',
  4: 'rinkeby',
  42: 'kovan',
  5: 'goerli',
};

export const AppContext = React.createContext<{
  hasSigner?: boolean;
  accounts: string[];
  totalSupply?: number;
  connect: () => Promise<void>;
  readContract?: UnchainedCryptoMarket;
  writeContract?: UnchainedCryptoMarket;
  transactions: Transaction[];
  addTransaction: (t: Transaction) => void;
  tokens: Token[];
  recordToken: (t: Token) => void;
  balance?: BigNumber;
}>({
  accounts: [],
  connect: () => null,
  transactions: [],
  addTransaction: () => null,
  tokens: [],
  recordToken: () => null,
});

export const useAppContext = () => useContext(AppContext);

const ethereum = (global as any).ethereum;

// const unique = (arr) => arr.filter((v, i, a) => a.indexOf(v) === i);
const uniqueToken = (tokens: Token[]) =>
  tokens.filter(
    ({ owner, hash }, i, ts) =>
      ts.findIndex(
        (t) => t.owner.toLowerCase() === owner.toLowerCase() && t.hash === hash,
      ) === i,
  );

export const AppContextWrapper = ({ children }) => {
  const [transactions, setTransactions] = useState<Transaction[]>([
    // { amount: 5, price: ethers.utils.parseEther('2') },
  ]);
  const [tokens, setTokens] = useState<Token[]>([]);
  const [provider, setProvider] = useState<ethers.providers.BaseProvider>();
  const [accounts, setAccounts] = useState<string[]>([]);
  const [totalSupply, setTotalSupply] = useState<number>();
  const [contractAddress, setContractAddress] = useState<string>('');
  const [readContract, setReadContract] = useState<UnchainedCryptoMarket>();
  const [writeContract, setWriteContract] = useState<UnchainedCryptoMarket>();
  const [balance, setBalance] = useState<BigNumber>();

  const recordToken = (token: Token) =>
    setTokens((tokens) => uniqueToken([token, ...tokens]));

  useEffect(() => {
    (async () => {
      const scopedProvider = ethereum
        ? new ethers.providers.Web3Provider(ethereum)
        : ethers.getDefaultProvider('rinkeby', {
            alchemy: 'IAShCvvktlU_ZEHJOvhLYXngadTDjBdX',
          });

      setProvider(scopedProvider);

      const { chainId } = await scopedProvider.getNetwork();

      ethereum?.on('chainChanged', () => window.location.reload());

      if (chainId !== 4) {
        alert(
          `You are on ${chainIdMap[chainId]}. Please switch to Rinkeby or you won't be able to mint here`,
        );
        return;
      }

      const contractAddress = addresses[chainId].UnchainedCryptoMarket;
      setContractAddress(addresses[chainId].UnchainedCryptoMarket);

      const contract = UnchainedCryptoMarket__factory.connect(
        contractAddress,
        scopedProvider,
      );

      setReadContract(contract);

      setTotalSupply((await contract.totalSupply()).toNumber());

      contract.on('Transfer', async (from, to, id) => {
        setTotalSupply((await contract.totalSupply()).toNumber());
        const hash = await contract.tokenContentHashes(id);
        recordToken({ hash, owner: to, id });
      });

      if (ethereum) {
        const accounts = await ethereum.request({
          method: 'eth_accounts',
        });

        setAccounts(accounts);

        scopedProvider.on('accountsChanged', (accounts) => {
          console.log('accounts changed');
          setAccounts(accounts);
        });
      }
    })();
  }, []);

  useEffect(() => {
    if (!(provider as any)?.getSigner) return;

    (async () => {
      const signer = await (provider as any).getSigner();

      const contract = UnchainedCryptoMarket__factory.connect(
        contractAddress,
        signer,
      );

      setWriteContract(contract);
    })();
  }, [accounts]);

  const connect = async () => {
    await ethereum.request({ method: 'eth_requestAccounts' });
    const accounts = await ethereum.request({
      method: 'eth_accounts',
    });
    setAccounts(accounts);
  };

  const addTransaction = (tx) => {
    setTransactions((current) => [
      { ...tx, amount: parseInt(tx.amount.toString(), 10) }, // HACK to ensure amount is a number
      ...current,
    ]);
    tx.tx.wait().then(() => {
      setTransactions((current) =>
        current.filter(
          (t) => t.tx.nonce !== tx.tx.nonce && tx.tx.from !== t.tx.from,
        ),
      );
    });
  };

  return (
    <AppContext.Provider
      value={{
        hasSigner: !!ethereum,
        accounts,
        totalSupply,
        connect,
        readContract,
        writeContract,
        transactions,
        addTransaction,
        tokens,
        recordToken,
        balance,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};
