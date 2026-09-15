# Multi-stage Dockerfile para DOSIER Frontend (React + Vite)

# Etapa 1: Compilación
FROM node:22-alpine AS build
WORKDIR /app

# Copiar archivos de dependencias
COPY package*.json ./

# Instalar dependencias
RUN npm install

# Copiar código fuente
COPY . .

# Compilar la aplicación para producción
RUN npm run build

# Etapa 2: Servidor Nginx de Producción
FROM nginx:alpine AS runtime

# Copiar configuración personalizada de Nginx
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Copiar artefactos estáticos generados por Vite
COPY --from=build /app/dist /usr/share/nginx/html

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
