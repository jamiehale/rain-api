FROM node:14

RUN mkdir -p /usr/src/app
WORKDIR /usr/src/app

ADD package.json yarn.lock /usr/src/app
RUN yarn install --frozen-lockfile

ADD . /usr/src/app

EXPOSE 8080

CMD ["yarn", "start"]

