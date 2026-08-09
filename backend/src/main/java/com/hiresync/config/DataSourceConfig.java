package com.hiresync.config;

import com.zaxxer.hikari.HikariDataSource;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.jdbc.DataSourceBuilder;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Primary;
import org.springframework.scheduling.annotation.EnableScheduling;

import javax.sql.DataSource;

@Configuration
@EnableScheduling
public class DataSourceConfig {

    @Value("${spring.datasource.url}")
    private String databaseUrl;

    @Value("${spring.datasource.username}")
    private String databaseUsername;

    @Value("${spring.datasource.password}")
    private String databasePassword;

    @Bean
    @Primary
    public DataSource dataSource() {

        HikariDataSource dataSource = (HikariDataSource) DataSourceBuilder.create()
                .url(databaseUrl)
                .username(databaseUsername)
                .password(databasePassword)
                .driverClassName("org.postgresql.Driver")
                .build();

        dataSource.setConnectionTimeout(10000);
        dataSource.setValidationTimeout(3000);
        dataSource.setMaximumPoolSize(10);
        dataSource.setMinimumIdle(2);

        return dataSource;
    }
}