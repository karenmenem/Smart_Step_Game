-- Smart Step Educational Game Database Schema
-- Complete schema with all foreign key relationships

-- Enable foreign key checks
SET foreign_key_checks = 1;

-- 1. Admin Table
CREATE TABLE admin (
    admin_id INT PRIMARY KEY AUTO_INCREMENT,
    email VARCHAR(255) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL, -- Will store hashed passwords
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- 2. Parent Table
CREATE TABLE parent (
    parent_id INT PRIMARY KEY AUTO_INCREMENT,
    email VARCHAR(255) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL, -- Will store hashed passwords
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- 3. Subject Table (Created before activity for foreign key reference)
CREATE TABLE subject (
    subject_id INT PRIMARY KEY AUTO_INCREMENT,
    subject_name VARCHAR(100) NOT NULL,
    description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- 4. Activity Table
CREATE TABLE activity (
    activity_id INT PRIMARY KEY AUTO_INCREMENT,
    subject_id INT NOT NULL,
    activity_name VARCHAR(255) NOT NULL,
    level INT NOT NULL CHECK (level >= 1 AND level <= 10),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    -- Foreign Key Constraints
    CONSTRAINT fk_activity_subject 
        FOREIGN KEY (subject_id) 
        REFERENCES subject(subject_id) 
        ON DELETE CASCADE 
        ON UPDATE CASCADE
);

-- 5. Child Table
CREATE TABLE child (
    child_id INT AUTO_INCREMENT,
    parent_id INT NOT NULL,
    name VARCHAR(100) NOT NULL,
    age INT NOT NULL CHECK (age >= 3 AND age <= 18),
    current_math_level INT DEFAULT 1 CHECK (current_math_level >= 1 AND current_math_level <= 10),
    current_english_level INT DEFAULT 1 CHECK (current_english_level >= 1 AND current_english_level <= 10),
    volume_level INT DEFAULT 50 CHECK (volume_level >= 0 AND volume_level <= 100),
    audio_enable BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    -- Primary Key (Compound)
    PRIMARY KEY (child_id, parent_id),
    
    -- Foreign Key Constraints
    CONSTRAINT fk_child_parent 
        FOREIGN KEY (parent_id) 
        REFERENCES parent(parent_id) 
        ON DELETE CASCADE 
        ON UPDATE CASCADE
);

-- 6. Achievement Table
CREATE TABLE achievement (
    achievement_id INT PRIMARY KEY AUTO_INCREMENT,
    level_required INT NOT NULL CHECK (level_required >= 1 AND level_required <= 10),
    badge_name VARCHAR(100) NOT NULL,
    description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- 7. Question Table
CREATE TABLE question (
    question_id INT PRIMARY KEY AUTO_INCREMENT,
    activity_id INT NOT NULL,
    text TEXT NOT NULL, -- Fixed from "tex" to "text"
    audio_url VARCHAR(500),
    asl_url VARCHAR(500), -- ASL (American Sign Language) video URL
    correct_answer CHAR(1) NOT NULL CHECK (correct_answer IN ('A', 'B', 'C', 'D')),
    choice_a TEXT NOT NULL,
    choice_b TEXT NOT NULL,
    choice_c TEXT,
    choice_d TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    -- Foreign Key Constraints
    CONSTRAINT fk_question_activity 
        FOREIGN KEY (activity_id) 
        REFERENCES activity(activity_id) 
        ON DELETE CASCADE 
        ON UPDATE CASCADE
);

-- 8. Attempts Table
CREATE TABLE attempts (
    attempt_id INT PRIMARY KEY AUTO_INCREMENT, -- Added primary key
    child_id INT NOT NULL,
    parent_id INT NOT NULL, -- Added to match child table compound key
    question_id INT NOT NULL,
    activity_id INT NOT NULL,
    duration INT NOT NULL, -- Duration in seconds
    selected_answer CHAR(1) CHECK (selected_answer IN ('A', 'B', 'C', 'D')),
    percentage DECIMAL(5,2) CHECK (percentage >= 0 AND percentage <= 100),
    attempted_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    -- Foreign Key Constraints
    CONSTRAINT fk_attempts_child 
        FOREIGN KEY (child_id, parent_id) 
        REFERENCES child(child_id, parent_id) 
        ON DELETE CASCADE 
        ON UPDATE CASCADE,
    
    CONSTRAINT fk_attempts_question 
        FOREIGN KEY (question_id) 
        REFERENCES question(question_id) 
        ON DELETE CASCADE 
        ON UPDATE CASCADE,
    
    CONSTRAINT fk_attempts_activity 
        FOREIGN KEY (activity_id) 
        REFERENCES activity(activity_id) 
        ON DELETE CASCADE 
        ON UPDATE CASCADE
);

-- Create indexes for better performance
CREATE INDEX idx_child_parent ON child(parent_id);
CREATE INDEX idx_activity_subject ON activity(subject_id);
CREATE INDEX idx_question_activity ON question(activity_id);
CREATE INDEX idx_attempts_child ON attempts(child_id, parent_id);
CREATE INDEX idx_attempts_activity ON attempts(activity_id);
CREATE INDEX idx_attempts_question ON attempts(question_id);
CREATE INDEX idx_attempts_date ON attempts(attempted_at);
CREATE INDEX idx_parent_email ON parent(email);
CREATE INDEX idx_admin_email ON admin(email);

-- Insert sample subjects
INSERT INTO subject (subject_name, description) VALUES 
('Mathematics', 'Mathematical concepts and problem solving'),
('English', 'English language learning and comprehension');

-- Insert sample achievements
INSERT INTO achievement (level_required, badge_name, description) VALUES 
(1, 'First Steps', 'Complete your first level'),
(3, 'Getting Better', 'Reach level 3 in any subject'),
(5, 'Halfway Hero', 'Reach level 5 in any subject'),
(7, 'Almost Expert', 'Reach level 7 in any subject'),
(10, 'Master Student', 'Complete level 10 in any subject');

-- Create a junction table for child achievements (Recommended addition)
CREATE TABLE child_achievement (
    child_id INT NOT NULL,
    parent_id INT NOT NULL,
    achievement_id INT NOT NULL,
    earned_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    PRIMARY KEY (child_id, parent_id, achievement_id),
    
    CONSTRAINT fk_child_achievement_child 
        FOREIGN KEY (child_id, parent_id) 
        REFERENCES child(child_id, parent_id) 
        ON DELETE CASCADE 
        ON UPDATE CASCADE,
    
    CONSTRAINT fk_child_achievement_achievement 
        FOREIGN KEY (achievement_id) 
        REFERENCES achievement(achievement_id) 
        ON DELETE CASCADE 
        ON UPDATE CASCADE
);

CREATE INDEX idx_child_achievement_child ON child_achievement(child_id, parent_id);
CREATE INDEX idx_child_achievement_achievement ON child_achievement(achievement_id);