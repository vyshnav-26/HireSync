package com.hiresync.service;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import software.amazon.awssdk.core.sync.RequestBody;
import software.amazon.awssdk.services.s3.S3Client;
import software.amazon.awssdk.services.s3.model.PutObjectRequest;
import org.springframework.web.multipart.MultipartFile;
import java.io.IOException;
import java.util.UUID;

@Service
public class StorageService {

    private final S3Client s3Client;

    @Value("${cloudflare.r2.bucket}")
    private String bucketName;

    public StorageService(S3Client s3Client) {
        this.s3Client = s3Client;
    }

    public String uploadFile(MultipartFile file) throws IOException {
        String keyName = UUID.randomUUID() + "-" + (file.getOriginalFilename() != null ? file.getOriginalFilename().replaceAll("[^a-zA-Z0-9._-]", "_") : "resume.pdf");

        try {
            PutObjectRequest putObjectRequest = PutObjectRequest.builder()
                    .bucket(bucketName)
                    .key(keyName)
                    .contentType(file.getContentType())
                    .build();

            s3Client.putObject(putObjectRequest, RequestBody.fromInputStream(file.getInputStream(), file.getSize()));
            return "r2://" + bucketName + "/" + keyName; 
        } catch (Exception e) {
            System.err.println("Cloudflare R2 upload failed, falling back to local file storage: " + e.getMessage());
            java.io.File uploadDir = new java.io.File("uploads/resumes");
            if (!uploadDir.exists()) {
                uploadDir.mkdirs();
            }
            java.io.File destFile = new java.io.File(uploadDir, keyName).getAbsoluteFile();
            file.transferTo(destFile);
            return "/uploads/resumes/" + keyName;
        }
    }
}
