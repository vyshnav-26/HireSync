package com.hiresync.config;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import software.amazon.awssdk.auth.credentials.AwsBasicCredentials;
import software.amazon.awssdk.auth.credentials.StaticCredentialsProvider;
import software.amazon.awssdk.regions.Region;
import software.amazon.awssdk.services.s3.S3Client;
import software.amazon.awssdk.services.s3.S3Configuration;

import java.net.URI;

@Configuration
public class S3Config {

    @Value("${cloudflare.r2.endpoint:https://example.r2.cloudflarestorage.com}")
    private String endpoint;

    @Value("${cloudflare.r2.access-key:default}")
    private String accessKey;

    @Value("${cloudflare.r2.secret-key:default}")
    private String secretKey;

    @Value("${cloudflare.r2.region:auto}")
    private String region;

    @Bean
    public S3Client s3Client() {
        AwsBasicCredentials credentials = AwsBasicCredentials.create(accessKey, secretKey);

        return S3Client.builder()
                .credentialsProvider(StaticCredentialsProvider.create(credentials))
                .endpointOverride(URI.create(endpoint))
                .region(Region.of(region))
                .serviceConfiguration(S3Configuration.builder()
                        .chunkedEncodingEnabled(false) // Crucial for R2
                        .pathStyleAccessEnabled(true)
                        .build())
                .build();
    }
}
