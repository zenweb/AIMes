FROM mcr.microsoft.com/dotnet/sdk:10.0 AS build
WORKDIR /src

COPY . .

RUN dotnet restore src/MES.Api/MES.Api.csproj
RUN dotnet publish src/MES.Api/MES.Api.csproj -c Release -o /app/publish

FROM node:22-alpine AS frontend-build
WORKDIR /frontend
COPY frontend/ .
RUN npm ci && npm run build

FROM mcr.microsoft.com/dotnet/aspnet:10.0 AS final
WORKDIR /app
EXPOSE 5000

COPY --from=build /app/publish .
COPY --from=frontend-build /frontend/dist ./wwwroot/scheduling

ENV ASPNETCORE_URLS=http://+:5000
ENV ASPNETCORE_ENVIRONMENT=Production

ENTRYPOINT ["dotnet", "MES.Api.dll"]
