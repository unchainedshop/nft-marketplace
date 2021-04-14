
# Cryptomarket Project


Technically it just lists products that are not minted yet. Once a user wants to buy an artwork, the image hash is minted just-in-time directly to the buyer's wallet.

Consists of the following micro-services that can be found under the subdirectories:

1. Engine
Open-Source E-Commerce Engine "Unchained Engine" (standard https://unchained.shop engine setup) that connects to a MongoDB to store product data and images.

Tech: Meteor (Node.js) + Apollo Server

2. Chaintailer
The Chaintailer connects to the Smart Contract with Alchemy and checks every minute which Musky has already been sold. Once a Musky has been sold, it emits a product update on Unchained tagging the musky as sold.

Tech: Node.js

3. Contracts
Smart Contract

4. Storefront

Tech: Next.js (Node.js) + Apollo Client

# License

EUPL 1.2. If that license does not fit your needs, just get in touch: hello@unchained.shop