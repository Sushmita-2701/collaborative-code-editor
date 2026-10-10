FROM node:20-alpine

# Create a restricted non-root execution user
RUN addgroup -S runner && adduser -S runner -G runner

WORKDIR /app
RUN chown -R runner:runner /app

USER runner

CMD ["node", "code.js"]
