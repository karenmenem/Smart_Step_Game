-- Smart Step Learning Platform Database Schema
-- Create database (uncomment if needed)
-- CREATE DATABASE IF NOT EXISTS `Smart Step Learning1`;
-- USE `Smart Step Learning1`;

-- Table: parent
CREATE TABLE IF NOT EXISTS parent (
    parent_id INT AUTO_INCREMENT PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Table: child  
CREATE TABLE IF NOT EXISTS child (
    child_id INT AUTO_INCREMENT PRIMARY KEY,
    parent_id INT NOT NULL,
    name VARCHAR(100) NOT NULL,
    age INT NOT NULL,
    profile_picture VARCHAR(255),
    current_math_level INT DEFAULT 1,
    current_english_level INT DEFAULT 1,
    total_points INT DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (parent_id) REFERENCES parent(parent_id) ON DELETE CASCADE
);

-- Table: subject
CREATE TABLE IF NOT EXISTS subject (
    subject_id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(50) NOT NULL UNIQUE,
    description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Table: section
CREATE TABLE IF NOT EXISTS section (
    section_id INT AUTO_INCREMENT PRIMARY KEY,
    subject_id INT NOT NULL,
    level INT NOT NULL,
    name VARCHAR(100) NOT NULL,
    description TEXT,
    order_index INT DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (subject_id) REFERENCES subject(subject_id) ON DELETE CASCADE,
    UNIQUE KEY unique_subject_level (subject_id, level)
);

-- Table: activity
CREATE TABLE IF NOT EXISTS activity (
    activity_id INT AUTO_INCREMENT PRIMARY KEY,
    section_id INT NOT NULL,
    name VARCHAR(100) NOT NULL,
    description TEXT,
    activity_type ENUM('quiz', 'exercise', 'game') NOT NULL,
    points_value INT DEFAULT 10,
    order_index INT DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (section_id) REFERENCES section(section_id) ON DELETE CASCADE
);

-- Table: question
CREATE TABLE IF NOT EXISTS question (
    question_id INT AUTO_INCREMENT PRIMARY KEY,
    activity_id INT NOT NULL,
    question_text TEXT NOT NULL,
    question_type ENUM('multiple_choice', 'true_false', 'fill_blank', 'drag_drop') NOT NULL,
    correct_answer TEXT NOT NULL,
    options JSON, -- For multiple choice options
    explanation TEXT,
    difficulty_level INT DEFAULT 1,
    points_value INT DEFAULT 1,
    order_index INT DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (activity_id) REFERENCES activity(activity_id) ON DELETE CASCADE
);

-- Table: child_progress
CREATE TABLE IF NOT EXISTS child_progress (
    progress_id INT AUTO_INCREMENT PRIMARY KEY,
    child_id INT NOT NULL,
    activity_id INT NOT NULL,
    completed BOOLEAN DEFAULT FALSE,
    score INT DEFAULT 0,
    max_score INT DEFAULT 0,
    attempts INT DEFAULT 0,
    last_attempt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    completed_at TIMESTAMP NULL,
    FOREIGN KEY (child_id) REFERENCES child(child_id) ON DELETE CASCADE,
    FOREIGN KEY (activity_id) REFERENCES activity(activity_id) ON DELETE CASCADE,
    UNIQUE KEY unique_child_activity (child_id, activity_id)
);

-- Table: attempt
CREATE TABLE IF NOT EXISTS attempt (
    attempt_id INT AUTO_INCREMENT PRIMARY KEY,
    child_id INT NOT NULL,
    question_id INT NOT NULL,
    selected_answer TEXT,
    is_correct BOOLEAN NOT NULL,
    points_earned INT DEFAULT 0,
    time_taken INT, -- in seconds
    attempted_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (child_id) REFERENCES child(child_id) ON DELETE CASCADE,
    FOREIGN KEY (question_id) REFERENCES question(question_id) ON DELETE CASCADE
);

-- Table: achievement
CREATE TABLE IF NOT EXISTS achievement (
    achievement_id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    description TEXT,
    icon VARCHAR(255),
    points_required INT DEFAULT 0,
    level_required INT DEFAULT 1,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Table: child_achievement
CREATE TABLE IF NOT EXISTS child_achievement (
    child_id INT NOT NULL,
    achievement_id INT NOT NULL,
    earned_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (child_id, achievement_id),
    FOREIGN KEY (child_id) REFERENCES child(child_id) ON DELETE CASCADE,
    FOREIGN KEY (achievement_id) REFERENCES achievement(achievement_id) ON DELETE CASCADE
);

-- Insert default subjects
INSERT IGNORE INTO subject (name, description) VALUES 
('Math', 'Mathematics learning activities'),
('English', 'English language learning activities');

-- Insert sample achievements
INSERT IGNORE INTO achievement (name, description, icon, points_required, level_required) VALUES
('First Steps', 'Complete your first activity', '🌟', 10, 1),
('Quick Learner', 'Complete 5 activities in one day', '⚡', 50, 1),
('Math Wizard', 'Complete all level 1 math activities', '🧙‍♂️', 100, 1),
('Word Master', 'Complete all level 1 English activities', '📚', 100, 1),
('Persistent', 'Complete an activity after 3 attempts', '💪', 25, 1);