-- Teacher Role System Schema
-- This schema supports teacher registration, approval workflow, content moderation, and messaging

-- Teachers table
CREATE TABLE IF NOT EXISTS teachers (
    id INT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    certificate_path VARCHAR(500),
    status ENUM('pending', 'approved', 'rejected') DEFAULT 'pending',
    rejection_reason TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    approved_at TIMESTAMP NULL,
    approved_by INT,
    FOREIGN KEY (approved_by) REFERENCES admins(id) ON DELETE SET NULL,
    INDEX idx_status (status),
    INDEX idx_email (email)
);

-- Teacher content submissions tracking
-- Links questions/passages to teachers with approval status
CREATE TABLE IF NOT EXISTS teacher_content (
    id INT PRIMARY KEY AUTO_INCREMENT,
    teacher_id INT NOT NULL,
    content_type ENUM('question', 'passage') NOT NULL,
    content_id INT NOT NULL,
    approval_status ENUM('pending', 'approved', 'rejected', 'pending_asl') DEFAULT 'pending',
    rejection_reason TEXT,
    submitted_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    reviewed_at TIMESTAMP NULL,
    reviewed_by INT,
    FOREIGN KEY (teacher_id) REFERENCES teachers(id) ON DELETE CASCADE,
    FOREIGN KEY (reviewed_by) REFERENCES admins(id) ON DELETE SET NULL,
    INDEX idx_teacher_content (teacher_id, content_type),
    INDEX idx_approval_status (approval_status),
    INDEX idx_content (content_type, content_id)
);

-- Messages table for teacher-admin communication
CREATE TABLE IF NOT EXISTS messages (
    id INT PRIMARY KEY AUTO_INCREMENT,
    sender_id INT NOT NULL,
    sender_type ENUM('admin', 'teacher') NOT NULL,
    recipient_id INT NOT NULL,
    recipient_type ENUM('admin', 'teacher') NOT NULL,
    message TEXT NOT NULL,
    related_content_type ENUM('question', 'passage', 'teacher_approval', 'general') DEFAULT 'general',
    related_content_id INT,
    is_read BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_recipient (recipient_type, recipient_id),
    INDEX idx_sender (sender_type, sender_id),
    INDEX idx_conversation (sender_type, sender_id, recipient_type, recipient_id),
    INDEX idx_unread (recipient_type, recipient_id, is_read)
);

-- Notifications table for real-time alerts
CREATE TABLE IF NOT EXISTS notifications (
    id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT NOT NULL,
    user_type ENUM('admin', 'teacher') NOT NULL,
    notification_type ENUM('teacher_pending', 'content_pending', 'content_approved', 'content_rejected', 'asl_pending', 'new_message') NOT NULL,
    title VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    related_id INT,
    is_read BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_user_notifications (user_type, user_id, is_read),
    INDEX idx_type (notification_type)
);

-- Add created_by tracking to question table
ALTER TABLE question ADD COLUMN IF NOT EXISTS created_by_type ENUM('admin', 'teacher') DEFAULT 'admin';
ALTER TABLE question ADD COLUMN IF NOT EXISTS created_by_id INT;
ALTER TABLE question ADD COLUMN IF NOT EXISTS has_required_asl BOOLEAN DEFAULT TRUE;

-- Add created_by tracking to reading_passage table
ALTER TABLE reading_passage ADD COLUMN IF NOT EXISTS created_by_type ENUM('admin', 'teacher') DEFAULT 'admin';
ALTER TABLE reading_passage ADD COLUMN IF NOT EXISTS created_by_id INT;
ALTER TABLE reading_passage ADD COLUMN IF NOT EXISTS has_required_asl BOOLEAN DEFAULT TRUE;
