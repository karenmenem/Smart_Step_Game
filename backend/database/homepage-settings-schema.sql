-- Homepage Settings Table
-- This table stores all customizable settings for the homepage

CREATE TABLE IF NOT EXISTS homepage_settings (
    id INT AUTO_INCREMENT PRIMARY KEY,
    setting_key VARCHAR(100) UNIQUE NOT NULL,
    setting_value TEXT,
    setting_type ENUM('text', 'color', 'number', 'boolean', 'json', 'css') DEFAULT 'text',
    category VARCHAR(50),
    description TEXT,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    updated_by INT,
    FOREIGN KEY (updated_by) REFERENCES admin(admin_id)
);

-- Insert default homepage settings
INSERT INTO homepage_settings (setting_key, setting_value, setting_type, category, description) VALUES
-- Header Settings
('header_background_color', '#ffffff', 'color', 'header', 'Header background color'),
('header_text_color', '#333333', 'color', 'header', 'Header text color'),
('logo_text', 'SmartStep', 'text', 'header', 'Main logo text'),
('logo_accent_text', 'Step', 'text', 'header', 'Logo accent text'),
('logo_accent_color', '#ff6b6b', 'color', 'header', 'Logo accent color'),

-- Navigation Buttons
('nav_buttons', '[{"text":"🏠","action":"home"},{"text":"Dashboard","action":"dashboard"},{"text":"Achievements","action":"achievements"}]', 'json', 'navigation', 'Navigation buttons configuration'),
('nav_button_bg_color', '#f0f0f0', 'color', 'navigation', 'Navigation button background color'),
('nav_button_text_color', '#333333', 'color', 'navigation', 'Navigation button text color'),
('nav_button_hover_bg', '#e0e0e0', 'color', 'navigation', 'Navigation button hover background color'),

-- Main Content
('main_title', 'Make Learning Fun<br/>with Smart Step!', 'text', 'main', 'Main page title'),
('main_subtitle', 'Let\'s learn with words, numbers, and signs!', 'text', 'main', 'Main page subtitle'),
('main_background_color', '#f8f9fa', 'color', 'main', 'Main section background color'),
('main_title_color', '#2c3e50', 'color', 'main', 'Main title color'),
('main_subtitle_color', '#7f8c8d', 'color', 'main', 'Main subtitle color'),

-- Call-to-Action Buttons
('cta_buttons', '[{"text":"📊 Go to Dashboard","action":"dashboard","type":"secondary"},{"text":"Play Now","action":"subjects","type":"primary"}]', 'json', 'buttons', 'Call-to-action buttons configuration'),
('primary_button_bg', '#4CAF50', 'color', 'buttons', 'Primary button background color'),
('primary_button_text', '#ffffff', 'color', 'buttons', 'Primary button text color'),
('primary_button_hover_bg', '#45a049', 'color', 'buttons', 'Primary button hover background'),
('secondary_button_bg', '#2196F3', 'color', 'buttons', 'Secondary button background color'),
('secondary_button_text', '#ffffff', 'color', 'buttons', 'Secondary button text color'),
('secondary_button_hover_bg', '#0b7dda', 'color', 'buttons', 'Secondary button hover background'),

-- Floating Bubbles/Animations
('show_math_bubbles', 'true', 'boolean', 'animations', 'Show floating math symbols'),
('math_bubbles', '[{"symbol":"+","position":1},{"symbol":"A","position":2},{"symbol":"÷","position":3},{"symbol":"B","position":4},{"symbol":"=","position":5},{"symbol":"C","position":6}]', 'json', 'animations', 'Math bubbles configuration'),
('bubble_color', '#ff6b6b', 'color', 'animations', 'Bubble background color'),
('bubble_text_color', '#ffffff', 'color', 'animations', 'Bubble text color'),

('show_english_items', 'true', 'boolean', 'animations', 'Show floating English items'),
('english_items', '[{"symbol":"ABC","position":1},{"symbol":"📖","position":2},{"symbol":"✏️","position":3},{"symbol":"123","position":4}]', 'json', 'animations', 'English items configuration'),

-- Features Section
('features_title', 'Why Kids Love Smart Step', 'text', 'features', 'Features section title'),
('features_list', '[{"icon":"🎮","title":"Interactive Learning","description":"Learn math and English through fun, engaging games that make education enjoyable!","color":"orange"},{"icon":"📚","title":"Multiple Subjects","description":"Master both mathematics and English language skills in one comprehensive platform!","color":"blue"},{"icon":"🏆","title":"Earn Achievements","description":"Collect badges and unlock rewards as you progress and improve your skills!","color":"green"},{"icon":"📊","title":"Track Progress","description":"Monitor your learning journey with detailed progress tracking and personalized feedback!","color":"purple"}]', 'json', 'features', 'Features list configuration'),

-- Custom CSS
('custom_css', '', 'css', 'advanced', 'Custom CSS for additional styling'),

-- General Settings
('site_name', 'Smart Step', 'text', 'general', 'Website name'),
('show_progress_bar', 'true', 'boolean', 'general', 'Show progress bar section'),
('progress_bar_emoji', '😊', 'text', 'general', 'Progress bar emoji'),
('progress_bar_text', 'What We Learn in Smart Step!', 'text', 'general', 'Progress bar text')

ON DUPLICATE KEY UPDATE setting_value = VALUES(setting_value);
