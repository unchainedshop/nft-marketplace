import React from 'react';
import Document, { Html, Head, Main, NextScript } from 'next/document';

class UnchainedDocument extends Document {
  static async getInitialProps(ctx) {
    const initialProps = await Document.getInitialProps(ctx);
    return { ...initialProps };
  }

  render() {
    return (
      <Html>
        <noscript
          // eslint-disable-next-line
          dangerouslySetInnerHTML={{
            __html: `
<!--

 _____ _____ _____ _____ _____ _____ _____ _____ ____
|  |  |   | |     |  |  |  _  |     |   | |   __|    \\
|  |  | | | |   --|     |     |-   -| | | |   __|  |  |
|_____|_|___|_____|__|__|__|__|_____|_|___|_____|____/


- Technology & Engineering by Unchained Commerce GmbH - https://unchained.shop

-->

  `,
          }}
        />
        <Head>
          <link
            rel="apple-touch-icon"
            sizes="180x180"
            href="/static/img/apple-touch-icon.png"
          />
          <link
            rel="icon"
            type="image/png"
            sizes="32x32"
            href="/static/img/favicon-32x32.png"
          />
          <link
            rel="icon"
            type="image/png"
            sizes="16x16"
            href="/static/img/favicon-16x16.png"
          />
          <link
            href="https://fonts.googleapis.com/css2?family=Barlow:wght@900&display=swap"
            rel="stylesheet"
          />
        </Head>
        <body>
          <Main />
          <NextScript />
        </body>
      </Html>
    );
  }
}

export default UnchainedDocument;
