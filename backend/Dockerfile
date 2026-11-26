# Multi-stage Dockerfile for HireSync Backend (Spring Boot 3.x, Java 21)

# Stage 1: Build stage
FROM maven:3.9.9-eclipse-temurin-21-alpine AS builder
WORKDIR /app

# Cache dependency layer
COPY pom.xml .
RUN mvn dependency:go-offline -B

# Build application package
COPY src ./src
RUN mvn clean package -DskipTests -B

# Stage 2: Minimal runtime stage
FROM eclipse-temurin:21-jre-alpine AS runtime
WORKDIR /app

# Install curl for container health check
RUN apk add --no-cache curl

# Run as non-root user for security
RUN addgroup -S appgroup && adduser -S appuser -G appgroup

# Copy compiled JAR from builder stage
COPY --from=builder /app/target/hiresync-backend-*.jar app.jar
RUN chown -R appuser:appgroup /app

USER appuser

EXPOSE 8080

HEALTHCHECK --interval=30s --timeout=5s --start-period=30s --retries=3 \
  CMD curl -f http://localhost:8080/api/v1/health || exit 1

ENTRYPOINT ["java", "-Djava.security.egd=file:/dev/./urandom", "-jar", "app.jar"]
