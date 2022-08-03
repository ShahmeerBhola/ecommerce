FROM node:12.13.0

RUN mkdir /app
WORKDIR /app

COPY package.json yarn.lock ./
RUN yarn

CMD [ "yarn", "run", "dev" ]
