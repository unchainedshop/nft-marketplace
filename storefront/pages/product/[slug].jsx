import { useRouter } from 'next/router';

import Header from '../../modules/layout/components/Header';
import useProductDetailQuery from '../../modules/products/hooks/useProductDetailQuery';
import ProductDetail from '../../modules/products/components/ProductDetail';
import { useAppContext } from '../../modules/ethereum/AppContextWrapper';

const ProductDetailView = () => {
  const router = useRouter();
  const { mint } = useAppContext();
  const { product, loading } = useProductDetailQuery({
    slug: router.query.slug,
  });

  const handleClick = async () => {
    return mint(product._id);
  };

  console.log(product);

  return (
    <div className="container">
      <Header />
      <div className="container mt-5">
        {!product ? (
          <span>loading...</span>
        ) : (
          <ProductDetail product={product} onClick={handleClick} />
        )}
      </div>
    </div>
  );
};

export default ProductDetailView;
