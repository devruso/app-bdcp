FROM node:20-alpine AS build
WORKDIR /app
ARG API_URL
ADD package.json yarn.lock /app/
RUN yarn install
ADD . /app/
RUN REACT_APP_API_URL=${API_URL} \
  yarn build

FROM nginx:alpine
ENV PORT 8080

COPY --from=build /app/build/ /usr/share/nginx/html

COPY nginx.conf /etc/nginx/conf.d/default.conf

CMD sed -i -e 's/$PORT/'"$PORT"'/g' /etc/nginx/conf.d/default.conf && nginx -g 'daemon off;'
