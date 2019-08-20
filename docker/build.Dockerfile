FROM alpine:3.10
RUN apk --update upgrade
RUN apk --no-cache add tzdata make go nodejs npm
RUN cp /usr/share/zoneinfo/Asia/Shanghai /etc/localtime
RUN echo "Asia/Shanghai" > /etc/timezone
