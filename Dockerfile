FROM mcr.microsoft.com/dotnet/sdk:10.0@sha256:c0790639332692a0d56cdd81ed581cfd24d040d9839764c138994866df89a3b6 AS build
WORKDIR /src

COPY Directory.Build.props Directory.Packages.props ./
COPY src/backend/AIMes.slnx src/backend/
COPY src/backend/MES.AI/MES.AI.csproj src/backend/MES.AI/
COPY src/backend/MES.Api/MES.Api.csproj src/backend/MES.Api/
COPY src/backend/MES.Application/MES.Application.csproj src/backend/MES.Application/
COPY src/backend/MES.Domain/MES.Domain.csproj src/backend/MES.Domain/
COPY src/backend/MES.Infrastructure/MES.Infrastructure.csproj src/backend/MES.Infrastructure/
RUN dotnet restore src/backend/MES.Api/MES.Api.csproj

COPY src/backend src/backend
RUN dotnet publish src/backend/MES.Api/MES.Api.csproj -c Release -o /app/publish --no-restore

FROM mcr.microsoft.com/devcontainers/javascript-node:1-22-bookworm@sha256:0d29e5fdc64f8397cd502223e0c4679f1e60877ca0fd2db4f2e2e0028e4271af AS frontend-build
WORKDIR /frontend

COPY src/frontend/package.json src/frontend/package-lock.json ./
RUN npm ci
COPY src/frontend/ ./
RUN npm run build

FROM mcr.microsoft.com/dotnet/aspnet:10.0@sha256:8c0b6857eab7b2aa57884c839bf4678414606bd7d17370f18a842ac5cf414711 AS final
WORKDIR /app
EXPOSE 5000

COPY --from=build /app/publish .
COPY --from=frontend-build /frontend/.output/public ./wwwroot/scheduling

ENV ASPNETCORE_URLS=http://+:5000
ENV ASPNETCORE_ENVIRONMENT=Production
USER $APP_UID

ENTRYPOINT ["dotnet", "MES.Api.dll"]
