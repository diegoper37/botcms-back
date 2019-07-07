FROM node:11-alpine
MAINTAINER Diego Pimentel & Filipe Kalicki

RUN mkdir -p /app/node_modules && chown -R node:node /app

WORKDIR /app
RUN apk --no-cache add --virtual builds-deps build-base python

COPY package*.json ./

RUN npm install
RUN npm rebuild bcrypt --build-from-source

COPY . .

COPY --chown=node:node . .

USER node

EXPOSE 3000

CMD ["npm", "run", "start"]
