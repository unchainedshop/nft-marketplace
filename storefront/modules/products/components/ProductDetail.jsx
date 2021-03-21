import getProductMediaUrl from '../utils/getProductMediaUrl';

const ProductDetail = ({ product, onClick }) => {
  return (
    <div className="row">
      <div className="col-md-6">
        <img src={getProductMediaUrl(product)} />
      </div>
      <div className="col-md-6">
        <h2 className="px-2 mt-md-0">{product?.texts?.title}</h2>
        <div className="p-2">
          <h3 className="my-0">
            ETH{' '}
            {product?.simulatedPrice?.price?.amount
              ? product?.simulatedPrice?.price?.amount / 100
              : 0.1}{' '}
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
