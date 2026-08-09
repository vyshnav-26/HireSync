package com.hiresync.config;

import com.zaxxer.hikari.HikariDataSource;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.jdbc.DataSourceBuilder;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Primary;

import org.springframework.scheduling.annotation.EnableScheduling;
import org.springframework.scheduling.annotation.Scheduled;

import javax.sql.DataSource;
import java.sql.Connection;
import java.sql.ResultSet;
import java.sql.SQLException;
import java.sql.Statement;
import java.util.List;

@Configuration
@EnableScheduling
@Slf4j
public class DataSourceConfig {

    @Value("${spring.datasource.url}")
    private String pgUrl;

    @Value("${spring.datasource.username}")
    private String pgUsername;

    @Value("${spring.datasource.password}")
    private String pgPassword;

    @Value("${app.datasource.mysql.url}")
    private String mysqlUrl;

    @Value("${app.datasource.mysql.username}")
    private String mysqlUsername;

    @Value("${app.datasource.mysql.password}")
    private String mysqlPassword;

    private HikariDataSource activeDataSource;

    @Bean
    @Primary
    public DataSource dataSource() {
        log.info("Initializing HireSync High-Performance DataSource (Preference: PostgreSQL IPv4 -> Localhost -> IPv6 -> MySQL)...");

        record PgCandidate(String name, String host, String dbUrl, String user, String pass) {}
        List<PgCandidate> pgCandidates = new java.util.ArrayList<>();

        // 1. Check if Render / Cloud DATABASE_URL is provided (e.g. postgres://user:pass@host:port/db)
        String envDbUrl = System.getenv("DATABASE_URL");
        if (envDbUrl != null && !envDbUrl.isBlank()) {
            try {
                if (envDbUrl.startsWith("postgres://") || envDbUrl.startsWith("postgresql://")) {
                    String cleanUrl = envDbUrl.replaceFirst("^postgres(ql)?://", "http://");
                    java.net.URI uri = new java.net.URI(cleanUrl);
                    String host = uri.getHost();
                    int port = uri.getPort() != -1 ? uri.getPort() : 5432;
                    String path = uri.getPath() != null && !uri.getPath().isBlank() ? uri.getPath() : "/hiresync";
                    String query = uri.getQuery() != null ? "?" + uri.getQuery() : "?sslmode=require";
                    String jdbcUrl = "jdbc:postgresql://" + host + ":" + port + path + query;
                    
                    String parsedUser = pgUsername;
                    String parsedPass = pgPassword;
                    if (uri.getUserInfo() != null && uri.getUserInfo().contains(":")) {
                        String[] userParts = uri.getUserInfo().split(":", 2);
                        parsedUser = userParts[0];
                        parsedPass = userParts[1];
                    }

                    log.info("Detected Render/Cloud DATABASE_URL. Resolved target: jdbc:postgresql://{}:{}{}", host, port, path);
                    pgCandidates.add(new PgCandidate("Render DATABASE_URL (" + host + ")", host, jdbcUrl, parsedUser, parsedPass));
                } else if (envDbUrl.startsWith("jdbc:")) {
                    pgCandidates.add(new PgCandidate("Render DATABASE_URL JDBC", "Cloud Host", envDbUrl, pgUsername, pgPassword));
                }
            } catch (Exception e) {
                log.warn("Notice parsing cloud DATABASE_URL: {}", e.getMessage());
            }
        }

        // 2. Check if a custom cloud/remote database URL is injected via SPRING_DATASOURCE_URL
        if (pgUrl != null && !pgUrl.isBlank() && !pgUrl.contains("127.0.0.1") && !pgUrl.contains("localhost") && !pgUrl.contains("[::1]")) {
            pgCandidates.add(new PgCandidate(
                "Configured Cloud PostgreSQL (" + pgUrl + ")",
                "Cloud Host",
                pgUrl,
                pgUsername,
                pgPassword
            ));
        }

        // 3. Standard ordered local database candidate URLs for local developer machines
        pgCandidates.add(new PgCandidate(
            "PostgreSQL IPv4 (127.0.0.1:5432)",
            "127.0.0.1:5432",
            "jdbc:postgresql://127.0.0.1:5432/hiresync?sslmode=disable&connectTimeout=10&loginTimeout=10",
            pgUsername,
            pgPassword
        ));
        pgCandidates.add(new PgCandidate(
            "PostgreSQL Localhost (localhost:5432)",
            "localhost:5432",
            "jdbc:postgresql://localhost:5432/hiresync?sslmode=disable&connectTimeout=10&loginTimeout=10",
            pgUsername,
            pgPassword
        ));
        pgCandidates.add(new PgCandidate(
            "PostgreSQL IPv6 ([::1]:5432)",
            "[::1]:5432",
            "jdbc:postgresql://[::1]:5432/hiresync?sslmode=disable&connectTimeout=10&loginTimeout=10",
            pgUsername,
            pgPassword
        ));

        for (PgCandidate candidate : pgCandidates) {
            try {
                HikariDataSource pgDataSource = (HikariDataSource) DataSourceBuilder.create()
                        .url(candidate.dbUrl)
                        .username(candidate.user)
                        .password(candidate.pass)
                        .driverClassName("org.postgresql.Driver")
                        .build();

                // Proactive connection pool lifecycle parameters (prevents server-side connection closure)
                pgDataSource.setConnectionTimeout(10000); // 10s connection acquisition timeout
                pgDataSource.setValidationTimeout(2000);  // 2s validation query timeout
                pgDataSource.setKeepaliveTime(30000);     // 30s keepalive heartbeats
                pgDataSource.setMaxLifetime(60000);       // 60s max lifetime (cleanly refreshes before PostgreSQL/OS kills socket)
                pgDataSource.setIdleTimeout(30000);       // 30s idle timeout
                pgDataSource.setMinimumIdle(2);           // 2 warm persistent connections
                pgDataSource.setMaximumPoolSize(10);      // 10 concurrent connections
                pgDataSource.setLeakDetectionThreshold(60000); // 60s leak warning
                
                // PostgreSQL Driver High-Performance Optimizations
                pgDataSource.addDataSourceProperty("tcpKeepAlive", "true");
                pgDataSource.addDataSourceProperty("reWriteBatchedInserts", "true");
                pgDataSource.addDataSourceProperty("ApplicationName", "HireSync");
                pgDataSource.addDataSourceProperty("socketTimeout", "0");
                pgDataSource.addDataSourceProperty("prepareThreshold", "3");
                pgDataSource.addDataSourceProperty("preparedStatementCacheQueries", "256");
                pgDataSource.addDataSourceProperty("preparedStatementCacheSizeMiB", "10");

                try (Connection conn = pgDataSource.getConnection()) {
                    log.info("===============================================================");
                    log.info(">>> ACTIVE DATABASE ENGINE: PostgreSQL Connected via {} <<<", candidate.name);
                    log.info("===============================================================");
                    this.activeDataSource = pgDataSource;
                    return pgDataSource;
                }
            } catch (Exception e) {
                log.info("PostgreSQL candidate {} connection attempt: {}", candidate.name, e.getMessage());
            }
        }

        log.info("===============================================================");
        log.info(">>> ACTIVE DATABASE ENGINE: MySQL Fallback Activated (127.0.0.1:3306) <<<");
        log.info("===============================================================");

        HikariDataSource mysqlDataSource = (HikariDataSource) DataSourceBuilder.create()
                .url(mysqlUrl)
                .username(mysqlUsername)
                .password(mysqlPassword)
                .driverClassName("com.mysql.cj.jdbc.Driver")
                .build();
        mysqlDataSource.setConnectionTimeout(10000);
        mysqlDataSource.setValidationTimeout(3000);
        mysqlDataSource.setKeepaliveTime(30000);
        mysqlDataSource.setMaxLifetime(600000);
        mysqlDataSource.setIdleTimeout(300000);
        mysqlDataSource.setMinimumIdle(3);
        mysqlDataSource.setMaximumPoolSize(15);
        this.activeDataSource = mysqlDataSource;
        return mysqlDataSource;
    }
}
