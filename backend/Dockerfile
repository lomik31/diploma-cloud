FROM python:3.13.5-slim-bookworm AS base

ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1

WORKDIR /app

FROM base AS build

RUN apt-get update && apt-get install -y --no-install-recommends curl ca-certificates

ADD https://astral.sh/uv/install.sh /uv-installer.sh

RUN sh /uv-installer.sh && rm /uv-installer.sh
ENV PATH="/root/.local/bin/:$PATH"

COPY uv.lock /app
COPY pyproject.toml /app

RUN uv sync --no-group dev --no-cache-dir

FROM build AS lint

COPY ./ruff.toml /app/
COPY ./pyproject.toml /app/
COPY ./src /app/src/

CMD ["uv", "run", "lint"]

FROM build AS dev

RUN uv sync

RUN rm -rf /app

WORKDIR /app/src

COPY docker-entrypoint.dev.sh /usr/local/bin/
RUN chmod +x /usr/local/bin/docker-entrypoint.dev.sh

ENTRYPOINT ["docker-entrypoint.dev.sh"]
CMD ["uv", "run", "debugpy", "--listen", "0.0.0.0:5678", "manage.py", "runserver", "0.0.0.0:8000"]

FROM base AS prod

COPY --from=build /app/.venv /app/.venv
COPY ./src ./

COPY docker-entrypoint.sh /usr/local/bin/
RUN chmod +x /usr/local/bin/docker-entrypoint.sh

ENTRYPOINT ["docker-entrypoint.sh"]
CMD [".venv/bin/uvicorn", "utils.asgi:application", "--host", "0.0.0.0"]
