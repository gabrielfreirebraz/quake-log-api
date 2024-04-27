FROM node:18.16.1-alpine

WORKDIR /api

COPY package.json .

RUN yarn install

COPY . .

RUN yarn build

RUN rm -rf node_modules
RUN yarn install --production

EXPOSE 4000

CMD ["yarn", "start"]