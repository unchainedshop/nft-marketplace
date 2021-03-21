import Link from 'next/link';

const Header = () => {
  return (
    <header className="header sticky-top">
      <div className="container d-flex justify-content-between align-items-center flex-wrap">
        <Link href="/">
          <a className="color-brand">
            <img src="static/img/muskies.memes.png"/>
          </a>
        </Link>
      </div>
    </header>
  );
};

export default Header;
