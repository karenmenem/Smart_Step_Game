# Homepage Customization Feature

## Overview
The admin panel now includes a comprehensive Homepage Customizer that allows admins to control **every aspect** of the homepage without touching code.

## Features Controllable by Admin

### 🎨 Visual Customization
- **Header**: Background color, text color
- **Logo**: Text content, accent text, accent color
- **Navigation**: Button colors (normal and hover states)
- **Main Content**: Background, title color, subtitle color
- **Buttons**: Primary and secondary button colors (normal and hover)
- **Animations**: Floating bubbles and design elements colors

### 📝 Content Management
- **Site Name**: Change "Smart Step" to any name
- **Main Title**: Customize the hero title
- **Main Subtitle**: Customize the tagline
- **Features Section**: 
  - Title
  - Individual feature cards (icon, title, description, color)
- **Progress Bar**: Emoji, text, show/hide toggle

### 🎯 Interactive Elements
- **Navigation Buttons**: Add, remove, or modify navigation items (JSON)
- **CTA Buttons**: Configure call-to-action buttons with custom text and actions (JSON)
- **Floating Bubbles**: Math symbols - show/hide, customize symbols
- **English Items**: Design elements - show/hide, customize items

### 🔧 Advanced
- **Custom CSS**: Add any custom CSS for advanced styling
- **JSON Configuration**: For complex elements like button arrays and feature lists

## How to Access

1. **Login to Admin Panel**: `/admin/login`
2. **Navigate to Homepage Customizer**: Click "🎨 Homepage Customizer" in the sidebar
3. **Or direct link**: `/admin/homepage-customizer`

## Using the Customizer

### Interface Sections
1. **Categories Sidebar**: Navigate between different customization categories
   - General
   - Header
   - Navigation
   - Main Content
   - Buttons
   - Animations
   - Features
   - Advanced

2. **Settings Panel**: Edit settings with appropriate controls
   - Color pickers for colors
   - Toggle switches for show/hide options
   - Text inputs for text content
   - Textareas for JSON and CSS

3. **Action Buttons**:
   - **Save Changes**: Apply all modifications
   - **Reset to Defaults**: Restore original settings
   - **Preview Homepage**: Open homepage in new tab

## Database Schema

**Table**: `homepage_settings`

| Column | Type | Description |
|--------|------|-------------|
| id | INT | Primary key |
| setting_key | VARCHAR(100) | Unique setting identifier |
| setting_value | TEXT | Setting value |
| setting_type | ENUM | Type: text, color, number, boolean, json, css |
| category | VARCHAR(50) | Grouping category |
| description | TEXT | Human-readable description |
| updated_at | TIMESTAMP | Last update time |
| updated_by | INT | Admin who made the update |

## API Endpoints

### Public
- `GET /api/homepage` - Fetch all homepage settings (used by frontend)

### Admin (Protected)
- `GET /api/admin/homepage-settings` - Get all settings with metadata
- `PUT /api/admin/homepage-settings/:id` - Update single setting
- `POST /api/admin/homepage-settings/bulk-update` - Update multiple settings
- `POST /api/admin/homepage-settings/reset` - Reset to defaults

## Setup Instructions

1. **Database Setup** (Already completed):
   ```bash
   cd backend
   node setup-homepage-settings.js
   ```

2. **Verify Tables**:
   - `homepage_settings` table created
   - 34 default settings inserted

3. **Start Backend**:
   ```bash
   cd backend
   npm start
   ```

4. **Start Frontend**:
   ```bash
   cd frontend
   npm start
   ```

5. **Access Admin Panel**:
   - Login: `/admin/login`
   - Username: `admin`
   - Password: `admin123`

## Example Customizations

### Change Color Scheme
1. Go to **Header** category
2. Modify `header_background_color`
3. Modify `header_text_color`
4. Save changes

### Add/Remove Buttons
1. Go to **Buttons** category
2. Edit `cta_buttons` JSON:
   ```json
   [
     {"text":"Get Started","action":"subjects","type":"primary"},
     {"text":"Learn More","action":"about","type":"secondary"}
   ]
   ```
3. Save changes

### Custom Branding
1. Go to **Header** category
2. Change `logo_text` from "SmartStep" to your brand
3. Modify `logo_accent_color`
4. Save changes

### Hide Animations
1. Go to **Animations** category
2. Toggle off `show_math_bubbles`
3. Toggle off `show_english_items`
4. Save changes

## Files Created/Modified

### Backend
- ✅ `database/homepage-settings-schema.sql` - Database schema
- ✅ `controllers/adminController.js` - Added homepage settings methods
- ✅ `routes/admin.js` - Added protected routes
- ✅ `routes/homepage.js` - Public settings endpoint
- ✅ `server.js` - Registered homepage routes
- ✅ `setup-homepage-settings.js` - Setup script

### Frontend
- ✅ `pages/HomepageCustomizer.js` - Admin customizer UI
- ✅ `styles/HomepageCustomizer.css` - Customizer styling
- ✅ `pages/Home.js` - Updated to use dynamic settings
- ✅ `routes/AppRoutes.js` - Added customizer route
- ✅ `pages/AdminDashboard.js` - Added navigation button

## Security Notes

- All admin endpoints are protected with JWT authentication
- Only authenticated admins can modify settings
- Public endpoint is read-only
- Changes are tracked with `updated_by` and `updated_at`

## Future Enhancements

Potential additions:
- Image upload for logo
- Theme presets (light/dark)
- A/B testing different designs
- Backup/restore settings
- Version history
- Multi-language support
