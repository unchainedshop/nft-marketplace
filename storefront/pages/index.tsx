import Head from 'next/head';
import ProductList from '../modules/products/components/ProductList';

const Home = () => (
  <div>
    <Head>
      <title>Crypto Market</title>
    </Head>
    <ProductList/>
  </div>
);

export default Home;
