import Link from 'next/link';
import getProductMediaUrl from '../utils/getProductMediaUrl';

const ProductListItem = ({product}) => {


    return (
        <div key={product._id}>
          <Link href="/product/[slug]" as={`/product/${product.texts?.slug}`}>
            <a className="list-item">
                <div className="sold-label position-relative text-uppercase">
                  Sold
                </div>
    
              <figure className="list-item-image">
                <img src={getProductMediaUrl(product)} />
              </figure>
              <div className="list-item-text p-1 text-center">
                <small className="mt-1 d-block mb-0 opacity-8">
                  <i>{product?.texts?.title}</i>
                </small>
                  <small className="mt-2 d-block">
                    {product?.simulatedPrice?.price}
                  </small>
              </div>
            </a>
          </Link>
        </div>
    )
}


export default ProductListItem