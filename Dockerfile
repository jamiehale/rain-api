FROM node:18

RUN mkdir -p /usr/src/app && chown node:node /usr/src/app
WORKDIR /usr/src/app
USER node:node

COPY package.json yarn.lock /usr/src/app/
RUN yarn install --frozen-lockfile

COPY . /usr/src/app

EXPOSE 8080

CMD ["yarn", "start"]
