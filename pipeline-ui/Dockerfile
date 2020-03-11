FROM node:12


WORKDIR /usr/src/app

# Install app dependencies
COPY src/package.json ./
COPY src/package-lock.json ./
RUN npm install

COPY src/ ./
RUN mkdir /usr/src/pipeline

CMD [ "node", "index.js" ]
