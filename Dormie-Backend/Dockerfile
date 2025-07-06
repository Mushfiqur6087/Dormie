# ───────── 1. build stage ─────────
FROM eclipse-temurin:17-jdk-alpine AS build
WORKDIR /app

# copy build metadata first so Maven cache is reused
COPY mvnw pom.xml ./
COPY .mvn .mvn
RUN ./mvnw -B dependency:go-offline

# copy sources and build
COPY src src
RUN ./mvnw -B -DskipTests package

# ───────── 2. runtime stage ───────
FROM eclipse-temurin:17-jre-alpine AS runtime
WORKDIR /app

# copy only the final JAR
COPY --from=build /app/target/*.jar app.jar

EXPOSE 8080
ENTRYPOINT ["java","-jar","app.jar"]

# ───────── 3. production stage ────
FROM runtime AS prod
# Production stage is the same as runtime for this application
