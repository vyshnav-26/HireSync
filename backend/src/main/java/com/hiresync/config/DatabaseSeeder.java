package com.hiresync.config;

import com.hiresync.entity.*;
import com.hiresync.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

import java.time.LocalDateTime;
import java.util.List;

@Component
@RequiredArgsConstructor
@ConditionalOnProperty(
    name = "app.seed-data",
    havingValue = "true"
)
public class DatabaseSeeder implements CommandLineRunner {

    private final UserRepository userRepository;
    private final ProfileRepository profileRepository;
    private final JobPostingRepository jobPostingRepository;
    private final ApplicationRepository applicationRepository;
    private final PasswordEncoder passwordEncoder;

    @Override
    public void run(String... args) throws Exception {
        System.out.println(">>> SEEDING DATABASE WITH 10 MOCK CANDIDATES & RECRUITER ACCOUNTS <<<");

        // 1. Ensure Recruiter Demo Accounts exist
        User recruiter = userRepository.findByEmail("recruiter@example.com").orElseGet(() -> {
            User u = User.builder()
                    .email("recruiter@example.com")
                    .password(passwordEncoder.encode("password123"))
                    .role(Role.RECRUITER)
                    .build();
            u = userRepository.save(u);

            Profile p = Profile.builder()
                    .user(u)
                    .fullName("Alexander Vance")
                    .company("HireSync Enterprise")
                    .position("Director of Talent Acquisition")
                    .build();
            profileRepository.save(p);
            u.setProfile(p);
            return u;
        });

        // Also create recruiter@demo.com with password
        userRepository.findByEmail("recruiter@demo.com").orElseGet(() -> {
            User u = User.builder()
                    .email("recruiter@demo.com")
                    .password(passwordEncoder.encode("password"))
                    .role(Role.RECRUITER)
                    .build();
            u = userRepository.save(u);

            Profile p = Profile.builder()
                    .user(u)
                    .fullName("Demo Recruiter")
                    .company("HireSync Enterprise")
                    .position("Senior Talent Lead")
                    .build();
            profileRepository.save(p);
            u.setProfile(p);
            return u;
        });

        // Also create candidate@demo.com with password
        userRepository.findByEmail("candidate@demo.com").orElseGet(() -> {
            User u = User.builder()
                    .email("candidate@demo.com")
                    .password(passwordEncoder.encode("password"))
                    .role(Role.JOB_SEEKER)
                    .build();
            u = userRepository.save(u);

            Profile p = Profile.builder()
                    .user(u)
                    .fullName("Demo Candidate")
                    .headline("Full Stack Software Engineer")
                    .skills("Java,Spring Boot,React,TypeScript,PostgreSQL")
                    .experience("4 years")
                    .location("San Francisco, CA")
                    .bio("Passionate engineer building modern web applications.")
                    .extractedSkills("Java,Spring Boot,React,TypeScript,PostgreSQL")
                    .extractedExperienceYears(4)
                    .extractedEducation("B.S. Computer Science")
                    .extractedRoleSummary("Full Stack Software Engineer")
                    .extractedKeyHighlights("Built high-throughput cloud microservices.")
                    .resumeUri("local://client-device/demo_candidate_resume.pdf")
                    .build();
            profileRepository.save(p);
            u.setProfile(p);
            return u;
        });

        // 2. Ensure Primary Job Posting exists
        List<JobPosting> recruiterJobs = jobPostingRepository.findByRecruiterId(recruiter.getId());
        JobPosting job;
        if (recruiterJobs.isEmpty()) {
            job = JobPosting.builder()
                    .title("Senior Full Stack Java & React Engineer")
                    .company("HireSync Enterprise")
                    .location("San Francisco, CA (Hybrid)")
                    .workType("hybrid")
                    .status("open")
                    .salaryMin(140000)
                    .salaryMax(185000)
                    .salaryCurrency("USD")
                    .description("We are seeking an exceptional Senior Full Stack Engineer to lead our microservices architecture and cloud platforms. You will architect high-throughput backend APIs in Java/Spring Boot and build responsive frontend web applications in React and TypeScript.")
                    .requirements(List.of("Java", "Spring Boot", "React", "TypeScript", "PostgreSQL", "Docker", "Kubernetes", "System Design", "Microservices"))
                    .hiringPhases("[\"Resume Screening\",\"Online Coding / Aptitude Test\",\"Technical Interview 1 (Fundamentals)\",\"Technical Interview 2 (Live Coding & Architecture)\",\"System Design Round\",\"Managerial / Behavioral Round\",\"HR & Offer Negotiation\"]")
                    .questionnaire("[\"How many years of production experience do you have with Spring Boot?\",\"Have you architected distributed systems using PostgreSQL or Kafka?\"]")
                    .startDate(LocalDateTime.now())
                    .recruiter(recruiter)
                    .build();
            job = jobPostingRepository.save(job);
        } else {
            job = recruiterJobs.get(0);
        }

        // 3. Define 10 Mock Candidates with Varying Skills & AI Match Scores
        record CandidateMock(String name, String email, String headline, String skills, int exp, String edu, String roleSummary, String highlights, int score, String status, String phaseStatus, int phaseIdx) {}

        List<CandidateMock> mockList = List.of(
            new CandidateMock("Alex Rivera", "alex.rivera@example.com", "Senior Full Stack Engineer | Java & React Expert", "Java,Spring Boot,React,TypeScript,PostgreSQL,Docker,Kubernetes,Kafka,System Design", 6, "B.S. Computer Science, Stanford University", "Full Stack Architect specializing in high-scale cloud apps and distributed systems.", "Led microservices migration reducing latency by 40%. AWS Certified Solutions Architect.", 96, "APPLIED", "IN_PROGRESS", 0),
            new CandidateMock("Priya Sharma", "priya.sharma@example.com", "Principal Backend Architect | Microservices & Distributed Systems", "Java,Spring Boot,Distributed Systems,Redis,Kubernetes,PostgreSQL,Microservices,Kafka", 7, "M.S. Software Engineering, Carnegie Mellon", "Backend powerhouse with deep expertise in JVM concurrency and distributed caching.", "Built real-time transaction pipeline handling 50k RPS.", 92, "APPLIED", "IN_PROGRESS", 0),
            new CandidateMock("David Chen", "david.chen@example.com", "Lead Frontend & Full Stack Developer", "React,TypeScript,Next.js,Tailwind CSS,GraphQL,Node.js,PostgreSQL,REST APIs", 5, "B.S. Information Technology, UC Berkeley", "Frontend specialist with robust full-stack capabilities in Node and PostgreSQL.", "Created design system used by 2M+ monthly active users.", 88, "APPLIED", "IN_PROGRESS", 0),
            new CandidateMock("Emily Watson", "emily.watson@example.com", "DevOps & Cloud Infrastructure Specialist", "AWS,Docker,Kubernetes,Terraform,CI/CD,Linux,Python,PostgreSQL", 4, "B.S. Computer Engineering, University of Washington", "Cloud engineer focused on container orchestration, automated pipelines, and reliability.", "Automated zero-downtime multi-region Kubernetes deployments.", 82, "APPLIED", "IN_PROGRESS", 0),
            new CandidateMock("Rahul Patel", "rahul.patel@example.com", "Full Stack Developer | React & Node.js", "React,Node.js,Express,PostgreSQL,Docker,Git,TypeScript,Java", 3, "B.Tech Computer Science, IIT Bombay", "Full stack engineer proficient with modern web stacks, relational databases, and containers.", "Shipped 12+ end-to-end client applications with 99.9% uptime.", 78, "APPLIED", "IN_PROGRESS", 0),
            new CandidateMock("Sarah Jenkins", "sarah.jenkins@example.com", "Data Engineer & Backend Specialist", "Python,Spark,SQL,Kafka,PostgreSQL,Docker,Java Basics", 4, "B.S. Applied Mathematics & CS, UT Austin", "Data engineer building ETL data pipelines and distributed analytics systems.", "Optimized large-scale PostgreSQL queries cutting batch time in half.", 71, "APPLIED", "IN_PROGRESS", 0),
            new CandidateMock("Marcus Johnson", "marcus.johnson@example.com", "Junior Java & Backend Developer", "Java,Spring Boot Basics,SQL,Git,HTML/CSS,REST APIs", 1, "B.S. Computer Science, Georgia Tech", "Enthusiastic junior developer with foundational Java and Spring Boot knowledge.", "Top performer in university hackathons; built full-stack e-commerce capstone.", 62, "APPLIED", "IN_PROGRESS", 0),
            new CandidateMock("Elena Rostova", "elena.rostova@example.com", "QA & Test Automation Engineer", "Selenium,Cypress,Java,JUnit,TestNG,Jenkins,API Testing", 3, "B.S. Software Systems, Boston University", "Quality assurance automation specialist ensuring high reliability across enterprise stacks.", "Developed automated testing framework with 90%+ regression test coverage.", 51, "APPLIED", "IN_PROGRESS", 0),
            new CandidateMock("Liam O'Connor", "liam.oconnor@example.com", "Technical Product Manager", "Agile,Scrum,Product Roadmapping,SQL,JIRA,User Stories", 6, "MBA & B.S. Economics, NYU", "Product leader with strong technical communication and cross-functional leadership.", "Managed engineering sprint delivery for enterprise SaaS product.", 38, "APPLIED", "IN_PROGRESS", 0),
            new CandidateMock("Zoe Martinez", "zoe.martinez@example.com", "UI/UX Designer & Prototyping Specialist", "Figma,Adobe XD,Wireframing,User Research,HTML,CSS", 2, "B.A. Graphic & Digital Design, RISD", "Visual designer specialized in wireframing, high-fidelity prototypes, and user flows.", "Created mobile-first UI component library for fintech startup.", 27, "APPLIED", "IN_PROGRESS", 0)
        );

        for (CandidateMock mock : mockList) {
            User user = userRepository.findByEmail(mock.email).orElseGet(() -> {
                User u = User.builder()
                        .email(mock.email)
                        .password(passwordEncoder.encode("password123"))
                        .role(Role.JOB_SEEKER)
                        .build();
                return userRepository.save(u);
            });

            // Create or update AI-Extracted Profile
            Profile profile = user.getProfile();
            if (profile == null) {
                profile = Profile.builder()
                        .user(user)
                        .fullName(mock.name)
                        .headline(mock.headline)
                        .skills(mock.skills)
                        .experience(mock.exp + " years")
                        .location("San Francisco, CA")
                        .bio(mock.roleSummary + " " + mock.highlights)
                        .extractedSkills(mock.skills)
                        .extractedExperienceYears(mock.exp)
                        .extractedEducation(mock.edu)
                        .extractedRoleSummary(mock.roleSummary)
                        .extractedKeyHighlights(mock.highlights)
                        .resumeUri("local://client-device/" + mock.name.toLowerCase().replace(" ", "_") + "_resume.pdf")
                        .build();
                profileRepository.save(profile);
                user.setProfile(profile);
            }

            // Ensure Application for this candidate on the Job exists
            final JobPosting targetJob = job;
            final User targetUser = user;
            if (applicationRepository.findByCandidateIdAndJobPostingId(user.getId(), job.getId()).isEmpty()) {
                String coverLetter = String.format(
                    "Dear Hiring Team at %s,\n\n" +
                    "I am excited to submit my application for the %s role. " +
                    "With %d years of experience as a %s, my background in %s aligns strongly with your technical needs.\n\n" +
                    "Key Highlights:\n- %s\n- %s\n\n" +
                    "--- SCREENING QUESTIONNAIRE ---\n" +
                    "Q: How many years of production experience do you have with Spring Boot?\nA: %d years.\n\n" +
                    "Q: Have you architected distributed systems using PostgreSQL or Kafka?\nA: Yes, extensive production experience with PostgreSQL and distributed architectures.",
                    targetJob.getCompany(), targetJob.getTitle(), mock.exp, mock.roleSummary, mock.skills.replace(",", ", "),
                    mock.highlights, mock.edu, mock.exp
                );

                String aiReasoning = String.format(
                    "{\"fitnessScore\": %d, \"skills_matched\": [\"%s\"], \"summary\": \"%s Candidate exhibits %d years of experience with strong alignment to role requirements.\"}",
                    mock.score,
                    String.join("\",\"", mock.skills.split(",")),
                    mock.score >= 80 ? "Top-tier applicant with exceptional skill overlap." : mock.score >= 60 ? "Moderate match with relevant foundation." : "Limited overlap with required technical competencies.",
                    mock.exp
                );

                Application app = Application.builder()
                        .candidate(targetUser)
                        .jobPosting(targetJob)
                        .status(ApplicationStatus.valueOf(mock.status))
                        .fitnessScore(mock.score)
                        .aiReasoning(aiReasoning)
                        .customCriteriaAnswers(coverLetter)
                        .currentPhaseIndex(mock.phaseIdx)
                        .phaseStatus(mock.phaseStatus)
                        .emailLogs("")
                        .build();

                applicationRepository.save(app);
            }
        }

        System.out.println(">>> SEEDING COMPLETE: 10 DIVERSE CANDIDATES WITH AI SCORES READY FOR SCREENING! <<<");
    }
}
