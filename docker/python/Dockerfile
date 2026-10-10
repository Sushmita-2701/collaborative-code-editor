FROM python:3.11-alpine

# Create a restricted non-root execution user
RUN addgroup -S runner && adduser -S runner -G runner

WORKDIR /app
RUN chown -R runner:runner /app

USER runner

CMD ["python", "-u", "code.py"]
