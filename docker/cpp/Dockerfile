FROM alpine:3.19

RUN apk add --no-cache g++ musl-dev

# Create a restricted non-root execution user
RUN addgroup -S runner && adduser -S runner -G runner

WORKDIR /app
RUN chown -R runner:runner /app

USER runner

CMD ["sh", "-c", "g++ -O2 -std=c++17 code.cpp -o code.out && ./code.out"]
