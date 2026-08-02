-- Create the database (Run this separately if connecting to the default 'postgres' database)
-- CREATE DATABASE hiresync;
-- \c hiresync;

-- Drop tables if they exist to start fresh
DROP TABLE IF EXISTS applications CASCADE;
DROP TABLE IF EXISTS job_postings CASCADE;
DROP TABLE IF EXISTS profiles CASCADE;
DROP TABLE IF EXISTS users CASCADE;

-- 1. Users Table
CREATE TABLE users (
    id BIGSERIAL PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    role VARCHAR(50) NOT NULL
);

-- 2. Profiles Table
CREATE TABLE profiles (
    id BIGSERIAL PRIMARY KEY,
    user_id BIGINT NOT NULL UNIQUE,
    full_name VARCHAR(255),
    resume_uri TEXT,
    CONSTRAINT fk_profiles_user 
      FOREIGN KEY (user_id) 
      REFERENCES users(id) 
      ON DELETE CASCADE
);

-- 3. Job Postings Table
CREATE TABLE job_postings (
    id BIGSERIAL PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,
    start_date TIMESTAMP,
    end_date TIMESTAMP,
    recruiter_id BIGINT NOT NULL,
    custom_criteria JSONB,
    CONSTRAINT fk_jobs_recruiter 
      FOREIGN KEY (recruiter_id) 
      REFERENCES users(id) 
      ON DELETE CASCADE
);

-- 4. Applications Table
CREATE TABLE applications (
    id BIGSERIAL PRIMARY KEY,
    candidate_id BIGINT NOT NULL,
    job_posting_id BIGINT NOT NULL,
    resume_uri_snapshot TEXT,
    status VARCHAR(50) NOT NULL,
    custom_criteria_answers JSONB,
    fitness_score INT,
    ai_reasoning JSONB,
    CONSTRAINT fk_applications_candidate 
      FOREIGN KEY (candidate_id) 
      REFERENCES users(id) 
      ON DELETE CASCADE,
    CONSTRAINT fk_applications_job 
      FOREIGN KEY (job_posting_id) 
      REFERENCES job_postings(id) 
      ON DELETE CASCADE
);
