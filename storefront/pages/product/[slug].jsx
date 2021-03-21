import { useRouter } from 'next/router';

import Header from '../../modules/layout/components/Header';
import useProductDetailQuery from '../../modules/products/hooks/useProductDetailQuery';
import ProductDetail from '../../modules/products/components/ProductDetail';

const ProductDetailView = () => {
  const router = useRouter();
  const { product, loading } = useProductDetailQuery({
    slug: router.query.slug,
  });

  const handleClick = async () => {};

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
