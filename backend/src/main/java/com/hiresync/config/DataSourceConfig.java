package com.hiresync.config;

import com.zaxxer.hikari.HikariDataSource;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.jdbc.DataSourceBuilder;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Primary;

import org.springframework.scheduling.annotation.EnableScheduling;

import javax.sql.DataSource;
import java.sql.Connection;
import java.sql.ResultSet;
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

    @Value("${spring.datasource.password:}")
    private String pgPassword;

    @Value("${app.datasource.mysql.url}")
    private String mysqlUrl;

    @Value("${app.datasource.mysql.username}")
    private String mysqlUsername;

    @Value("${app.datasource.mysql.password:}")
    private String mysqlPassword;

    private HikariDataSource activeDataSource;

    @Bean
    @Primary
    public DataSource dataSource() {
        log.info("Initializing HireSync High-Performance DataSource (Preference: PostgreSQL IPv4 -> Localhost -> IPv6 -> MySQL)...");

        // Ordered database candidate URLs: IPv4 first, then localhost, then IPv6
        record PgCandidate(String name, String host, String dbUrl, String adminUrl) {}
        List<PgCandidate> pgCandidates = List.of(
            new PgCandidate(
                "PostgreSQL IPv4 (127.0.0.1:5432)",
                "127.0.0.1:5432",
                "jdbc:postgresql://127.0.0.1:5432/hiresync?sslmode=disable&connectTimeout=10&loginTimeout=10",
                "jdbc:postgresql://127.0.0.1:5432/postgres?sslmode=disable&connectTimeout=5&loginTimeout=5"
            ),
            new PgCandidate(
                "PostgreSQL Localhost (localhost:5432)",
                "localhost:5432",
                "jdbc:postgresql://localhost:5432/hiresync?sslmode=disable&connectTimeout=10&loginTimeout=10",
                "jdbc:postgresql://localhost:5432/postgres?sslmode=disable&connectTimeout=5&loginTimeout=5"
            ),
            new PgCandidate(
                "PostgreSQL IPv6 ([::1]:5432)",
                "[::1]:5432",
                "jdbc:postgresql://[::1]:5432/hiresync?sslmode=disable&connectTimeout=10&loginTimeout=10",
                "jdbc:postgresql://[::1]:5432/postgres?sslmode=disable&connectTimeout=5&loginTimeout=5"
            )
        );

        for (PgCandidate candidate : pgCandidates) {
            try {
                // Ensure 'hiresync' database exists on PostgreSQL server
                try (Connection adminConn = java.sql.DriverManager.getConnection(candidate.adminUrl, pgUsername, pgPassword);
                     Statement stmt = adminConn.createStatement()) {
                    ResultSet rs = stmt.executeQuery("SELECT 1 FROM pg_database WHERE datname = 'hiresync'");
                    if (!rs.next()) {
                        log.info("Database 'hiresync' not found on {}. Creating database automatically...", candidate.name);
                        stmt.executeUpdate("CREATE DATABASE hiresync");
                        log.info("Database 'hiresync' created successfully on {}.", candidate.name);
                    }
                } catch (Exception e) {
                    log.debug("Database existence check on {} notice: {}", candidate.name, e.getMessage());
                }

                HikariDataSource pgDataSource = (HikariDataSource) DataSourceBuilder.create()
                        .url(candidate.dbUrl)
                        .username(pgUsername)
                        .password(pgPassword)
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
