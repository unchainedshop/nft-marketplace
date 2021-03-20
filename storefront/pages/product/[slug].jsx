import { useRouter } from 'next/router';

import Footer from '../../modules/layout/components/Footer';
import Header from '../../modules/layout/components/Header';
import useProductDetailQuery from '../../modules/products/hooks/useProductDetailQuery';

const ProductDetail = () => {
  const router = useRouter();
  const { product } = useProductDetailQuery({ slug: router.query.slug });

  return (
    <div className="container">
      <Header />
      <h1>Detail</h1>
      <Footer />
    </div>
  );
};

export default ProductDetail;
