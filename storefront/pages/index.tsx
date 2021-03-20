import Head from 'next/head';

import ProductList from '../modules/products/components/ProductList';
import Footer from '../modules/layout/components/Footer';
import Header from '../modules/layout/components/Header';

const Home = () => (
  <div>
    <Head>
      <title>Crypto Market</title>
    </Head>
    <div className="container">
      <Header />
      <ProductList />
      <Footer />
    </div>
  </div>
);

export default Home;
