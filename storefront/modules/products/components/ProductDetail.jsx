import { ethers } from 'ethers';
import { useEffect, useState } from 'react';
import { useAppContext } from '../../ethereum/AppContextWrapper';
import getProductMediaUrl from '../utils/getProductMediaUrl';

const ProductDetail = ({ product, onClick }) => {
  const [owner, setOwner] = useState();
  const { readContract } = useAppContext();

  useEffect(() => {
    if (readContract) {
      (async () => {
        const contentHex = ethers.utils.formatBytes32String(product._id);
        const contentHash = ethers.utils.sha256(contentHex);
        const contentHashBytes = ethers.utils.arrayify(contentHash);
        const isSold = await readContract.contentHashes(contentHashBytes);
        const tokenId = await readContract.hashToTokenId(contentHashBytes);

        // console.log(tokenId, isSold);
        // if (!isSold) {
        //   setOwner(await readContract.ownerOf(tokenId));
        // } else {
        //   setOwner(null);
        // }
      })();
    }
  }, [readContract]);

  return (
    <div className="row">
      <div className="col-md-8">
        <img src={getProductMediaUrl(product)} />
      </div>
      <div className="col-md-4">
        <h3 className="px-2 mt-md-0">{product?.texts?.title}</h3>
        <div className="p-2">
          <h3 className="my-0">
            ETH{' '}
            {product?.simulatedPrice?.price
              ? product?.simulatedPrice?.price?.amount / 100
              : 0}{' '}
          </h3>
          <h4 className="mb-0">{product?.texts?.subtitle}</h4>
          {product?.texts?.description?.split('\n').map((line, i) => (
            <p key={i}>{line}</p>
          ))}
        </div>
        <button
          type="button"
          className="button button--primary button--big mb-5 text-uppercase"
          onClick={onClick}
        >
          Mint
        </button>
      </div>
    </div>
  );
};

export default ProductDetail;
