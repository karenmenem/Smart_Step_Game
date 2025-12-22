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

CREATE TABLE IF NOT EXISTS reading_passage (
    passage_id INT AUTO_INCREMENT PRIMARY KEY,
    subject VARCHAR(50),
    topic VARCHAR(100),
    level INT DEFAULT 1,
    sublevel INT,
    title VARCHAR(255) NOT NULL,
    content TEXT NOT NULL,
    author VARCHAR(200),
    subject_id INT,
    difficulty ENUM('easy', 'medium', 'hard') DEFAULT 'easy',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (subject_id) REFERENCES subject(subject_id) ON DELETE SET NULL
);

CREATE TABLE IF NOT EXISTS question (
    question_id INT AUTO_INCREMENT PRIMARY KEY,
    activity_id INT NOT NULL,
    passage_id INT,
    question_text TEXT NOT NULL,
    question_type ENUM('multiple_choice', 'true_false', 'fill_blank', 'drag_drop') NOT NULL,
    correct_answer TEXT NOT NULL,
    options JSON,
    asl_signs JSON,
    asl_video_url VARCHAR(500),
    asl_type ENUM('numbers', 'video', 'both', 'none') DEFAULT 'numbers',
    explanation TEXT,
    difficulty_level INT DEFAULT 1,
    points_value INT DEFAULT 1,
    order_index INT DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (activity_id) REFERENCES activity(activity_id) ON DELETE CASCADE,
    FOREIGN KEY (passage_id) REFERENCES reading_passage(passage_id) ON DELETE SET NULL
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

CREATE TABLE IF NOT EXISTS child_achievement (
    child_id INT NOT NULL,
    achievement_id INT NOT NULL,
    earned_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (child_id, achievement_id),
    FOREIGN KEY (child_id) REFERENCES child(child_id) ON DELETE CASCADE,
    FOREIGN KEY (achievement_id) REFERENCES achievement(achievement_id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS admin (
    admin_id INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(100) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    last_login TIMESTAMP NULL
);

-- ASL Resources Table (for managing ASL videos from admin panel)
CREATE TABLE IF NOT EXISTS asl_resources (
    id INT AUTO_INCREMENT PRIMARY KEY,
    type ENUM('word', 'number', 'operation') NOT NULL,
    value VARCHAR(100) NOT NULL,
    filename VARCHAR(255) NOT NULL,
    aliases JSON,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    UNIQUE KEY unique_type_value (type, value)
);

-- Insert default admin user (password: admin123)
INSERT IGNORE INTO admin (username, password, email) VALUES
('admin', '$2b$10$rN7kYVZL.5lB9xJ0h3K5XOqPqPxJLKqWJ3xGz5mZ3kYVZL5lB9xJ0h', 'admin@smartstep.com');

INSERT IGNORE INTO subject (name, description) VALUES 
('Math', ''),
('English', '');

INSERT IGNORE INTO achievement (name, description, icon, points_required, level_required) VALUES
('First Steps', 'Complete your first activity', '🌟', 10, 1),
('Quick Learner', 'Complete 5 activities in one day', '⚡', 50, 1),
('Math Wizard', 'Complete all level 1 math activities', '🧙‍♂️', 100, 1),
('Word Master', 'Complete all level 1 English activities', '📚', 100, 1),
('Persistent', 'Complete an activity after 3 attempts', '💪', 25, 1);

-- Insert Math sections (levels)
INSERT IGNORE INTO section (section_id, subject_id, level, name, description, order_index) VALUES
(1, 1, 1, 'Beginner Addition', 'Learn basic addition with numbers 1-10', 1),
(2, 1, 2, 'Intermediate Addition', 'Practice addition with larger numbers', 2),
(3, 1, 3, 'Advanced Addition', 'Master complex addition problems', 3);

-- Insert Math activities
INSERT IGNORE INTO activity (activity_id, section_id, name, description, activity_type, points_value, order_index) VALUES
(1, 1, 'Addition Level 1', 'Basic addition quiz with ASL signs', 'quiz', 100, 1),
(2, 2, 'Addition Level 2', 'Intermediate addition quiz', 'quiz', 150, 1),
(3, 3, 'Addition Level 3', 'Advanced addition quiz', 'quiz', 200, 1);

-- Insert Level 1 Addition Questions with ASL signs
INSERT IGNORE INTO question (question_id, activity_id, question_text, question_type, correct_answer, options, asl_signs, asl_video_url, asl_type, difficulty_level, points_value, order_index) VALUES
(1, 1, 'What is 2 + 3?', 'multiple_choice', '5', '["4", "5", "6", "7"]', '[2, 3]', NULL, 'numbers', 1, 10, 1),
(2, 1, 'What is 1 + 4?', 'multiple_choice', '5', '["3", "4", "5", "6"]', '[1, 4]', NULL, 'numbers', 1, 10, 2),
(3, 1, 'What is 3 + 2?', 'multiple_choice', '5', '["4", "5", "6", "7"]', '[3, 2]', NULL, 'numbers', 1, 10, 3),
(4, 1, 'What is 4 + 1?', 'multiple_choice', '5', '["3", "4", "5", "6"]', '[4, 1]', NULL, 'numbers', 1, 10, 4),
(5, 1, 'What is 2 + 2?', 'multiple_choice', '4', '["3", "4", "5", "6"]', '[2, 2]', NULL, 'numbers', 1, 10, 5),
(6, 1, 'What is 3 + 3?', 'multiple_choice', '6', '["5", "6", "7", "8"]', '[3, 3]', NULL, 'numbers', 1, 10, 6),
(7, 1, 'What is 1 + 6?', 'multiple_choice', '7', '["6", "7", "8", "9"]', '[1, 6]', NULL, 'numbers', 1, 10, 7),
(8, 1, 'What is 5 + 2?', 'multiple_choice', '7', '["6", "7", "8", "9"]', '[5, 2]', NULL, 'numbers', 1, 10, 8),
(9, 1, 'What is 4 + 3?', 'multiple_choice', '7', '["6", "7", "8", "9"]', '[4, 3]', NULL, 'numbers', 1, 10, 9),
(10, 1, 'What is 2 + 6?', 'multiple_choice', '8', '["7", "8", "9", "10"]', '[2, 6]', NULL, 'numbers', 1, 10, 10);

-- Insert Level 2 Addition Questions with ASL video integration for numbers 10-50
INSERT IGNORE INTO question (question_id, activity_id, question_text, question_type, correct_answer, options, asl_signs, asl_video_url, asl_type, difficulty_level, points_value, order_index) VALUES
(21, 2, 'What is 15 + 12?', 'multiple_choice', '27', '["25", "26", "27", "28"]', NULL, 'https://www.youtube.com/embed/aQvGIIdgFDM', 'video', 2, 15, 1),
(22, 2, 'What is 23 + 14?', 'multiple_choice', '37', '["35", "36", "37", "38"]', NULL, 'https://www.youtube.com/embed/aQvGIIdgFDM', 'video', 2, 15, 2),
(23, 2, 'What is 18 + 19?', 'multiple_choice', '37', '["35", "36", "37", "38"]', NULL, 'https://www.youtube.com/embed/aQvGIIdgFDM', 'video', 2, 15, 3),
(24, 2, 'What is 25 + 22?', 'multiple_choice', '47', '["45", "46", "47", "48"]', NULL, 'https://www.youtube.com/embed/aQvGIIdgFDM', 'video', 2, 15, 4),
(25, 2, 'What is 30 + 17?', 'multiple_choice', '47', '["45", "46", "47", "48"]', NULL, 'https://www.youtube.com/embed/aQvGIIdgFDM', 'video', 2, 15, 5),
(26, 2, 'What is 12 + 11?', 'multiple_choice', '23', '["21", "22", "23", "24"]', NULL, 'https://www.youtube.com/embed/aQvGIIdgFDM', 'video', 2, 15, 6),
(27, 2, 'What is 28 + 15?', 'multiple_choice', '43', '["41", "42", "43", "44"]', NULL, 'https://www.youtube.com/embed/aQvGIIdgFDM', 'video', 2, 15, 7),
(28, 2, 'What is 35 + 14?', 'multiple_choice', '49', '["47", "48", "49", "50"]', NULL, 'https://www.youtube.com/embed/aQvGIIdgFDM', 'video', 2, 15, 8),
(29, 2, 'What is 20 + 29?', 'multiple_choice', '49', '["47", "48", "49", "50"]', NULL, 'https://www.youtube.com/embed/aQvGIIdgFDM', 'video', 2, 15, 9),
(30, 2, 'What is 16 + 24?', 'multiple_choice', '40', '["38", "39", "40", "41"]', NULL, 'https://www.youtube.com/embed/aQvGIIdgFDM', 'video', 2, 15, 10);

-- Insert Advanced Addition Questions with ASL video URLs for complex problems (100+)
INSERT IGNORE INTO question (question_id, activity_id, question_text, question_type, correct_answer, options, asl_signs, asl_video_url, asl_type, difficulty_level, points_value, order_index) VALUES
(11, 3, 'What is 100 + 167?', 'multiple_choice', '267', '["267", "257", "277", "367"]', NULL, 'https://www.youtube.com/embed/aQvGIIdgFDM', 'video', 3, 20, 1),
(12, 3, 'What is 234 + 456?', 'multiple_choice', '690', '["690", "680", "700", "790"]', NULL, 'https://www.youtube.com/embed/aQvGIIdgFDM', 'video', 3, 20, 2);

-- Insert English sections (levels)
INSERT IGNORE INTO section (section_id, subject_id, level, name, description, order_index) VALUES
(4, 2, 1, 'Beginner English', 'Learn basic English vocabulary', 1),
(5, 2, 2, 'Intermediate English', 'Practice English grammar and reading', 2),
(6, 2, 3, 'Advanced English', 'Master complex English concepts', 3);

-- Insert English activities
INSERT IGNORE INTO activity (activity_id, section_id, name, description, activity_type, points_value, order_index) VALUES
(4, 4, 'Vocabulary Level 1', 'Basic vocabulary quiz', 'quiz', 100, 1),
(5, 5, 'Grammar Level 2', 'Intermediate grammar quiz', 'quiz', 150, 1),
(6, 6, 'Reading Level 3', 'Advanced reading comprehension', 'quiz', 200, 1);