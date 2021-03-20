import Link from 'next/link';

const Header = () => {
  return (
    <header className="header sticky-top">
      <div className="container d-flex justify-content-between align-items-center flex-wrap">
        <Link href="/">
          <a className="color-brand">
            <h3 className="my-2 mr-2">musky.memes</h3>
          </a>
        </Link>
      </div>
    </header>
  );
};

export default Header;
