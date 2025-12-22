-- Teacher-Student Tracking System
-- Allows teachers to track student progress with parent permission

-- Teacher class codes for student linking
CREATE TABLE IF NOT EXISTS teacher_classes (
    id INT PRIMARY KEY AUTO_INCREMENT,
    teacher_id INT NOT NULL,
    class_name VARCHAR(255) NOT NULL,
    class_code VARCHAR(10) UNIQUE NOT NULL,
    description TEXT,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (teacher_id) REFERENCES teachers(id) ON DELETE CASCADE,
    INDEX idx_class_code (class_code),
    INDEX idx_teacher (teacher_id)
);

-- Parent permission and teacher linking
CREATE TABLE IF NOT EXISTS child_teacher_access (
    id INT PRIMARY KEY AUTO_INCREMENT,
    child_id INT NOT NULL,
    teacher_id INT NOT NULL,
    class_id INT,
    parent_approved BOOLEAN DEFAULT FALSE,
    share_progress BOOLEAN DEFAULT TRUE,
    share_scores BOOLEAN DEFAULT TRUE,
    share_time_spent BOOLEAN DEFAULT TRUE,
    linked_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    approved_at TIMESTAMP NULL,
    notes TEXT,
    is_active BOOLEAN DEFAULT TRUE,
    FOREIGN KEY (child_id) REFERENCES child(child_id) ON DELETE CASCADE,
    FOREIGN KEY (teacher_id) REFERENCES teachers(id) ON DELETE CASCADE,
    FOREIGN KEY (class_id) REFERENCES teacher_classes(id) ON DELETE SET NULL,
    UNIQUE KEY unique_child_teacher (child_id, teacher_id),
    INDEX idx_teacher_students (teacher_id, is_active),
    INDEX idx_child_teachers (child_id, is_active)
);

-- Enhanced progress tracking for detailed analytics
CREATE TABLE IF NOT EXISTS child_progress_history (
    id INT PRIMARY KEY AUTO_INCREMENT,
    child_id INT NOT NULL,
    activity_id INT NOT NULL,
    attempt_number INT DEFAULT 1,
    score INT NOT NULL,
    max_score INT NOT NULL,
    percentage DECIMAL(5,2),
    time_spent_seconds INT DEFAULT 0,
    questions_attempted INT DEFAULT 0,
    questions_correct INT DEFAULT 0,
    completed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (child_id) REFERENCES child(child_id) ON DELETE CASCADE,
    FOREIGN KEY (activity_id) REFERENCES activity(activity_id) ON DELETE CASCADE,
    INDEX idx_child_activity (child_id, activity_id),
    INDEX idx_completed (completed_at),
    INDEX idx_child_recent (child_id, completed_at DESC)
);

-- Teacher notes on student progress
CREATE TABLE IF NOT EXISTS teacher_student_notes (
    id INT PRIMARY KEY AUTO_INCREMENT,
    teacher_id INT NOT NULL,
    child_id INT NOT NULL,
    note TEXT NOT NULL,
    note_type ENUM('general', 'concern', 'achievement', 'recommendation') DEFAULT 'general',
    is_private BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (teacher_id) REFERENCES teachers(id) ON DELETE CASCADE,
    FOREIGN KEY (child_id) REFERENCES child(child_id) ON DELETE CASCADE,
    INDEX idx_teacher_child (teacher_id, child_id),
    INDEX idx_created (created_at DESC)
);

-- Teacher assignments for students
CREATE TABLE IF NOT EXISTS teacher_assignments (
    id INT PRIMARY KEY AUTO_INCREMENT,
    teacher_id INT NOT NULL,
    child_id INT,
    class_id INT,
    activity_id INT NOT NULL,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    due_date DATE,
    target_score INT DEFAULT 80,
    is_mandatory BOOLEAN DEFAULT FALSE,
    status ENUM('assigned', 'in_progress', 'completed', 'overdue') DEFAULT 'assigned',
    assigned_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    completed_at TIMESTAMP NULL,
    FOREIGN KEY (teacher_id) REFERENCES teachers(id) ON DELETE CASCADE,
    FOREIGN KEY (child_id) REFERENCES child(child_id) ON DELETE CASCADE,
    FOREIGN KEY (class_id) REFERENCES teacher_classes(id) ON DELETE CASCADE,
    FOREIGN KEY (activity_id) REFERENCES activity(activity_id) ON DELETE CASCADE,
    INDEX idx_teacher_assignments (teacher_id, status),
    INDEX idx_child_assignments (child_id, status),
    INDEX idx_due_date (due_date)
);
