FROM node:12-alpine

ENV NODE_ENV production

# Create app directory
RUN mkdir -p /usr/src/app
WORKDIR /usr/src/app

# Install app dependencies
COPY . /usr/src/app
RUN NODE_ENV=development npm install
RUN npm run build
RUN npm prune

EXPOSE 3000
CMD [ "npm", "run", "start" ]
