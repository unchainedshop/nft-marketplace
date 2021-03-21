import Link from 'next/link';

const Header = () => {
  return (
    <header className="header sticky-top">
      <div className="container d-flex justify-content-between align-items-center flex-wrap">
        <Link href="/">
          <a className="color-brand m-0 p-0 d-block w-100 text-center">
            <h2 className="m-0 p-0">
              {' '}
              <i> Mint a Musky </i>{' '}
            </h2>
          </a>
        </Link>
      </div>
    </header>
  );
};

export default Header;
