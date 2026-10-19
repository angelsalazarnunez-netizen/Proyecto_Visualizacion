# Compila el frontend con Vite y lo sirve con nginx, que además reenvía /api al backend.
FROM node:22-alpine AS compilacion
WORKDIR /fuente
COPY package.json package-lock.json ./
RUN npm ci
COPY . .
RUN npm run build

FROM nginx:1.27-alpine
# Valores por defecto para docker compose. En Railway se cambian con variables del servicio.
ENV PORT=80 \
    BACKEND_URL=http://backend:8080 \
    NGINX_ENTRYPOINT_LOCAL_RESOLVERS=1
COPY nginx.conf.template /etc/nginx/templates/default.conf.template
COPY --from=compilacion /fuente/dist /usr/share/nginx/html
EXPOSE 80
