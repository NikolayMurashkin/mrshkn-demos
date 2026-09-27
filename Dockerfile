FROM node:24-alpine AS base
WORKDIR /app
ENV NEXT_TELEMETRY_DISABLED=1
RUN corepack enable

FROM base AS build
ARG APP=template
COPY . .
RUN yarn install --immutable
RUN yarn workspace @mrshkn/demo-$APP build

FROM node:24-alpine AS runner
ARG APP=template
WORKDIR /app
ENV NODE_ENV=production NEXT_TELEMETRY_DISABLED=1 PORT=3000 HOSTNAME=0.0.0.0 MIGRATE_ON_START=true APP=$APP
COPY --from=build --chown=node:node /app/apps/$APP/.next/standalone ./
COPY --from=build --chown=node:node /app/apps/$APP/.next/static ./apps/$APP/.next/static
COPY --from=build --chown=node:node /app/apps/$APP/public ./apps/$APP/public
USER node
EXPOSE 3000
CMD ["sh", "-c", "exec node apps/$APP/server.js"]
