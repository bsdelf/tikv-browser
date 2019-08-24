FROM tikv-browser-golang:latest AS backend-builder
WORKDIR /work
COPY . .
RUN make server

FROM node:alpine AS frontend-builder
WORKDIR /work
COPY ./web .
RUN npm install
RUN npm run build

FROM alpine:latest
WORKDIR /root
COPY --from=backend-builder /work/staging/server .
COPY --from=frontend-builder /work/build ./web
EXPOSE 3000 3000
ENTRYPOINT [ "./server" ]
