package com.hiresync.service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;

@Service
public class EmailService {

    @Autowired(required = false)
    private JavaMailSender mailSender;

    @Value("${spring.mail.username:dummy_brevo_user}")
    private String mailUsername;

    public String sendInitialRejectionEmail(String email, String candidateName, String jobTitle, String companyName) {
        String subject = "Application Update: " + jobTitle + " at " + companyName;
        String body = String.format(
            "Dear %s,\n\n" +
            "Thank you for applying for the position of %s at %s. " +
            "After careful review of your profile and qualifications during our initial screening phase, we regret to inform you that we will not be moving forward with your application at this time.\n\n" +
            "We wish you all the best in your job search and future professional endeavors.\n\n" +
            "Best regards,\nRecruiting Team at %s",
            candidateName, jobTitle, companyName, companyName
        );
        dispatchEmail(email, subject, body);
        return formatLogJson(subject, body, "INITIAL_REJECTION");
    }

    public String sendPhaseAdvancementEmail(String email, String candidateName, String jobTitle, String companyName, String currentPhaseName, String nextPhaseName) {
        String subject = "Congratulations! Next Phase for " + jobTitle + " at " + companyName;
        String body = String.format(
            "Dear %s,\n\n" +
            "Great news! You have successfully passed the '%s' round for the %s position at %s.\n\n" +
            "You are now advancing to the next round: '%s'. Our recruiting team will reach out shortly with details for this upcoming phase.\n\n" +
            "Congratulations and best of luck!\n\n" +
            "Best regards,\nRecruiting Team at %s",
            candidateName, currentPhaseName, jobTitle, companyName, nextPhaseName, companyName
        );
        dispatchEmail(email, subject, body);
        return formatLogJson(subject, body, "PHASE_ADVANCED");
    }

    public String sendPhaseRejectionEmail(String email, String candidateName, String jobTitle, String companyName, String failedPhaseName) {
        String subject = "Application Update: " + jobTitle + " at " + companyName;
        String body = String.format(
            "Dear %s,\n\n" +
            "Thank you for participating in the '%s' round for the %s position at %s.\n\n" +
            "While we were impressed with your background, after evaluating the candidates in this round, we have decided to move forward with other applicants. As a result, you will not be advancing further in the hiring process.\n\n" +
            "We appreciate the time you invested with us and wish you success in your career.\n\n" +
            "Best regards,\nRecruiting Team at %s",
            candidateName, failedPhaseName, jobTitle, companyName, companyName
        );
        dispatchEmail(email, subject, body);
        return formatLogJson(subject, body, "PHASE_REJECTION");
    }

    public String sendFinalOfferEmail(String email, String candidateName, String jobTitle, String companyName) {
        String subject = "Job Offer: " + jobTitle + " at " + companyName + "!";
        String body = String.format(
            "Dear %s,\n\n" +
            "We are thrilled to inform you that you have successfully cleared all hiring rounds for the %s position at %s!\n\n" +
            "Our team is excited about the prospect of having you join us. We will be sending over the formal offer letter and onboarding information shortly.\n\n" +
            "Congratulations!\n\n" +
            "Warm regards,\nRecruiting Team at %s",
            candidateName, jobTitle, companyName, companyName
        );
        dispatchEmail(email, subject, body);
        return formatLogJson(subject, body, "FINAL_OFFER");
    }

    private void dispatchEmail(String recipient, String subject, String body) {
        // Run email dispatch asynchronously in background thread so HTTP requests respond instantly
        java.util.concurrent.CompletableFuture.runAsync(() -> {
            if (mailSender != null && mailUsername != null && !mailUsername.contains("dummy")) {
                try {
                    SimpleMailMessage msg = new SimpleMailMessage();
                    msg.setTo(recipient);
                    msg.setFrom(mailUsername);
                    msg.setSubject(subject);
                    msg.setText(body);
                    mailSender.send(msg);
                    System.out.println("[BREVO SMTP DELIVERED] Email sent to: " + recipient);
                    return;
                } catch (Exception e) {
                    System.err.println("[BREVO SMTP NOTICE] Real SMTP send failed: " + e.getMessage());
                }
            }

            // Safe fallback logging
            System.out.println("==================================================");
            System.out.println("[EMAIL NOTIFICATION DISPATCHED]");
            System.out.println("TO: " + recipient);
            System.out.println("DATE: " + LocalDateTime.now());
            System.out.println("SUBJECT: " + subject);
            System.out.println("==================================================");
        });
    }

    private String formatLogJson(String subject, String body, String type) {
        return String.format(
            "{\"timestamp\":\"%s\",\"type\":\"%s\",\"subject\":\"%s\",\"body\":\"%s\"}",
            LocalDateTime.now(),
            type,
            subject.replace("\"", "\\\""),
            body.replace("\"", "\\\"").replace("\n", "\\n")
        );
    }
}
