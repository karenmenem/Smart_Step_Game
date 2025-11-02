CREATE TABLE IF NOT EXISTS parent (
    parent_id INT AUTO_INCREMENT PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

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

CREATE TABLE IF NOT EXISTS subject (
    subject_id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(50) NOT NULL UNIQUE,
    description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

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

CREATE TABLE IF NOT EXISTS question (
    question_id INT AUTO_INCREMENT PRIMARY KEY,
    activity_id INT NOT NULL,
    question_text TEXT NOT NULL,
    question_type ENUM('multiple_choice', 'true_false', 'fill_blank', 'drag_drop') NOT NULL,
    correct_answer TEXT NOT NULL,
    options JSON,
    explanation TEXT,
    difficulty_level INT DEFAULT 1,
    points_value INT DEFAULT 1,
    order_index INT DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (activity_id) REFERENCES activity(activity_id) ON DELETE CASCADE
);

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

CREATE TABLE IF NOT EXISTS attempt (
    attempt_id INT AUTO_INCREMENT PRIMARY KEY,
    child_id INT NOT NULL,
    question_id INT NOT NULL,
    selected_answer TEXT,
    is_correct BOOLEAN NOT NULL,
    points_earned INT DEFAULT 0,
    time_taken INT,
    attempted_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (child_id) REFERENCES child(child_id) ON DELETE CASCADE,
    FOREIGN KEY (question_id) REFERENCES question(question_id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS achievement (
    achievement_id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    description TEXT,
    icon VARCHAR(255),
    points_required INT DEFAULT 0,
    level_required INT DEFAULT 1,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS achievement_child (
    achievement_child_id INT AUTO_INCREMENT PRIMARY KEY,
    child_id INT NOT NULL,
    achievement_id INT NOT NULL,
    earned_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (child_id) REFERENCES child(child_id) ON DELETE CASCADE,
    FOREIGN KEY (achievement_id) REFERENCES achievement(achievement_id) ON DELETE CASCADE,
    UNIQUE KEY unique_child_achievement (child_id, achievement_id)
);

-- Insert basic subjects if they don't exist
INSERT IGNORE INTO subject (subject_id, name, description) VALUES 
(1, 'Math', 'Mathematics learning activities'),
(2, 'English', 'English language learning activities');

-- Insert basic sections if they don't exist
INSERT IGNORE INTO section (section_id, subject_id, level, name, description, order_index) VALUES 
(1, 1, 1, 'Beginner Addition', 'Basic addition problems for beginners', 1),
(2, 1, 2, 'Intermediate Addition', 'More complex addition problems', 2),
(3, 1, 3, 'Advanced Addition', 'Advanced addition challenges', 3);

-- Insert some basic activities
INSERT IGNORE INTO activity (activity_id, section_id, name, description, activity_type, points_value, order_index) VALUES 
(1, 1, 'addition_level_1_1', 'Addition Level 1 Sublevel 1', 'quiz', 10, 1),
(2, 1, 'addition_level_1_2', 'Addition Level 1 Sublevel 2', 'quiz', 10, 2),
(3, 1, 'addition_level_1_3', 'Addition Level 1 Sublevel 3', 'quiz', 10, 3);

INSERT IGNORE INTO subject (name, description) VALUES 
('Math', 'Mathematics learning activities'),
('English', 'English language learning activities');

INSERT IGNORE INTO achievement (name, description, icon, points_required, level_required) VALUES
('First Steps', 'Complete your first activity', '🌟', 10, 1),
('Quick Learner', 'Complete 5 activities in one day', '⚡', 50, 1),
('Math Wizard', 'Complete all level 1 math activities', '🧙‍♂️', 100, 1),
('Word Master', 'Complete all level 1 English activities', '📚', 100, 1),
('Persistent', 'Complete an activity after 3 attempts', '💪', 25, 1);