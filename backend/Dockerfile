# ==============================================================================
# Stage 1: Build & Package the Application
# ==============================================================================
FROM maven:3.9.6-eclipse-temurin-17-alpine AS builder

WORKDIR /app

# Copy Maven POM and download dependencies to leverage Docker layer caching
COPY pom.xml .
RUN mvn dependency:go-offline -B

# Copy source code and build the production executable JAR
COPY src ./src
RUN mvn clean package -DskipTests -B

# ==============================================================================
# Stage 2: Ultra-Lightweight Production Runtime
# ==============================================================================
FROM eclipse-temurin:17-jre-alpine

WORKDIR /app

# Create a non-root application user for container security
RUN addgroup -S hiresync && adduser -S hiresync -G hiresync
USER hiresync

# Copy the built JAR artifact from the builder stage
COPY --from=builder /app/target/backend-0.0.1-SNAPSHOT.jar app.jar

# Render injects dynamic PORT environment variable (default: 8080)
ENV PORT=8080
EXPOSE 8080

# Production JVM optimizations for Render Free Tier (512MB RAM ceiling)
ENV JAVA_OPTS="-Xmx384m -Xms128m -XX:+UseG1GC -XX:+ExitOnOutOfMemoryError"

# Launch Spring Boot with dynamic port binding
ENTRYPOINT ["sh", "-c", "java $JAVA_OPTS -Dserver.port=${PORT} -jar app.jar"]
