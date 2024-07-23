FROM node:20 AS build-stage
WORKDIR /usr/src/eLection-front

COPY . .

RUN npm ci

RUN CI=true npm test

ENV VITE_BACKEND_URL=./api

RUN npm run build

# This is a new stage, everything before this is gone, except the files we want to COPY

FROM nginx:1.20-alpine
# COPY the directory build from build-stage to /usr/share/nginx/html
# The target location here was found from the Docker hub page

COPY --from=build-stage /usr/src/eLection-front/dist /usr/share/nginx/html