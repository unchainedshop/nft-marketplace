import Link from 'next/link';

const Header = () => {
  return (
    <header className="header sticky-top">
      <div className="container d-flex justify-content-between align-items-center flex-wrap">
        <Link href="/">
        
          <a className="color-brand">
          <img src="https://i.ibb.co/8z94KVL/muskies-lol.png" alt="muskies-lol" border="0" />
          </a>
        </Link>
      </div>
    </header>
  );
};

export default Header;
