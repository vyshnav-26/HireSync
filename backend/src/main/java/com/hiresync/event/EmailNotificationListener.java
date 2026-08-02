package com.hiresync.event;

import com.hiresync.entity.Application;
import org.springframework.context.event.EventListener;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Component;
import lombok.RequiredArgsConstructor;

@Component
@RequiredArgsConstructor
public class EmailNotificationListener {

    private final JavaMailSender mailSender;

    @Async
    @EventListener
    public void handleApplicationStatusEvent(ApplicationStatusEvent event) {
        Application app = event.getApplication();
        String to = app.getCandidate().getEmail();
        String candidateName = app.getCandidate().getProfile() != null ? app.getCandidate().getProfile().getFullName() : "Candidate";
        String jobTitle = app.getJobPosting().getTitle();
        
        String subject;
        String text;

        switch (app.getStatus()) {
            case SCREENED:
            case ROUND_1:
                subject = "Congratulations! Next Steps for " + jobTitle;
                text = String.format("Dear %s,\n\nWe are pleased to inform you that you have moved to the %s round for the %s position.", candidateName, app.getStatus().name(), jobTitle);
                break;
            case REJECTED:
                subject = "Update on your application for " + jobTitle;
                text = String.format("Dear %s,\n\nThank you for applying to %s. Unfortunately, we will not be moving forward with your application at this time.", candidateName, jobTitle);
                break;
            default:
                return;
        }

        SimpleMailMessage message = new SimpleMailMessage();
        message.setTo(to);
        message.setSubject(subject);
        message.setText(text);
        message.setFrom("noreply@hiresync.com"); 
        mailSender.send(message);
    }
}
