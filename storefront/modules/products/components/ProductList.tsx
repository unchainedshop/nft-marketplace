import useProductListQuery from '../hooks/useProductListQuery';
import ProductListItem from './ProductListItem'

const ProductList = () => {
  const { products } = useProductListQuery();

  return (
    <div className="container">
      <div className="row">
        {products.map((product) => (
          <div key={product._id} className="col-sm-6 col-lg-6 mb-4 mx-auto">
          <ProductListItem product={product} />
          </div>
          
        ))}
      </div>
    </div>
  );
};

export default ProductList;
