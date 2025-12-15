FROM node:22-alpine3.20 AS compile-image

# npm install frontend
COPY ./frontend/package.json /home/node/app/frontend/package.json
COPY ./frontend/package-lock.json /home/node/app/frontend/package-lock.json
WORKDIR /home/node/app/frontend
RUN npm install --quiet

# npm install backend
COPY ./backend/package.json /home/node/app/backend/package.json
WORKDIR /home/node/app/backend
RUN npm install --quiet

# Build frontend
COPY ./frontend/ /home/node/app/frontend
WORKDIR /home/node/app/frontend
RUN npm run build

# Build backend
COPY ./backend /home/node/app/backend
WORKDIR /home/node/app/backend
RUN npm run build

# Build app container
FROM node:22-alpine3.20 AS runtime-image
WORKDIR /usr/src/app
COPY --from=compile-image /home/node/app/backend/build/ /usr/src/app
COPY --from=compile-image /home/node/app/frontend/dist /usr/src/app/public
COPY --from=compile-image /home/node/app/backend/node_modules/ /usr/src/app/node_modules/

CMD ["node", "./index.js"]
