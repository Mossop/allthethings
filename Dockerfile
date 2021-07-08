FROM node:lts-alpine

RUN mkdir -p /allthethings

ADD . /allthethings/

WORKDIR /allthethings

RUN \
  yarn install --frozen-lockfile && \
  yarn build && \
  yarn install --frozen-lockfile --production && \
  yarn cache clean

ENTRYPOINT ["node", "dist/core/server"]
CMD ["/config.json"]
