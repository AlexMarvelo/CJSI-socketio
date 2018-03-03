FROM node:8.9 AS build
WORKDIR /
ADD package.json .
RUN npm install
ADD . .

FROM node:8.9
COPY --from=build / .
EXPOSE 3000
CMD ["npm", "start"]
