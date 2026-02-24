# Images Directory

This directory is for storing images used throughout the portfolio website.

## Image Placeholders & Specifications

### Hero Section
**File**: `hero-background.jpg` or `hero-background.png`
- **Location**: Used as background for the hero section
- **Recommended Dimensions**: 1920x1080px (Full HD)
- **Format**: JPG or PNG
- **Purpose**: Creates visual interest in the hero section behind the name and title
- **Notes**: Consider using a subtle tech-themed or abstract gradient image

### Profile Photo (Optional)
**File**: `profile.jpg` or `profile.png`
- **Location**: Can be added to About or Hero section
- **Recommended Dimensions**: 400x400px (square)
- **Format**: JPG or PNG
- **Purpose**: Professional headshot for personal branding
- **Notes**: Use a professional, well-lit photo with neutral background

### Project Thumbnails
**Files**: `project-1.jpg`, `project-2.jpg`, `project-3.jpg`, `project-4.jpg`
- **Location**: Project cards in the Projects section
- **Recommended Dimensions**: 800x600px (4:3 ratio)
- **Format**: JPG or PNG
- **Purpose**: Visual representation of each project
- **Projects**:
  1. CRM Data Integration System - Consider showing a dashboard or integration diagram
  2. Automated Document Management - Show DocuSign + SharePoint interface
  3. Engineer Appointment Validation System - Display validation interface
  4. Billing API Data Sync Workflow - Show workflow diagram or monitoring dashboard

### Blog Post Images
**Files**: `blog-1.jpg`, `blog-2.jpg`, `blog-3.jpg`
- **Location**: Blog cards in the Blog section
- **Recommended Dimensions**: 800x450px (16:9 ratio)
- **Format**: JPG or PNG
- **Purpose**: Visual headers for blog posts
- **Topics**:
  1. Modernizing ITSM with Power Platform - Tech transformation imagery
  2. AI-Driven Insights in Dynamics 365 - AI/machine learning themed
  3. Best Practices for Power Automate at Scale - Automation/workflow imagery

## Implementation Notes

### Adding Images to HTML
Once images are added to this directory, update the HTML as follows:

#### Hero Background (CSS update required):
```css
.hero-section {
  background-image: url('../assets/images/hero-background.jpg');
  background-size: cover;
  background-position: center;
  background-attachment: fixed;
}
```

#### Profile Photo:
```html
<img src="assets/images/profile.jpg" alt="Seun - Power Platform Developer" class="profile-photo">
```

#### Project Thumbnails:
```html
<div class="project-image">
  <img src="assets/images/project-1.jpg" alt="CRM Data Integration System">
</div>
```

#### Blog Images:
Replace the `.blog-image` div content with:
```html
<div class="blog-image">
  <img src="assets/images/blog-1.jpg" alt="Modernizing ITSM with Power Platform">
</div>
```

## Image Optimization Tips

1. **Compress images** before uploading to reduce file size without losing quality
   - Use tools like TinyPNG, ImageOptim, or Squoosh
   - Target file sizes: < 200KB for thumbnails, < 500KB for hero

2. **Use modern formats** when browser support allows
   - WebP for better compression with quality
   - Provide fallbacks for older browsers

3. **Responsive images** for different screen sizes
   - Consider using `<picture>` element with multiple sources
   - Use `srcset` attribute for different resolutions

4. **Lazy loading** for performance
   - Add `loading="lazy"` attribute to images below the fold
   - Hero image should load immediately

## Example WebP Implementation

```html
<picture>
  <source srcset="assets/images/project-1.webp" type="image/webp">
  <source srcset="assets/images/project-1.jpg" type="image/jpeg">
  <img src="assets/images/project-1.jpg" alt="CRM Data Integration System">
</picture>
```

## Color Scheme Reference
When creating custom graphics or screenshots, consider the site's color palette:
- Primary: #00a8ff (Blue)
- Accent: #00d4ff (Cyan)
- Background: #0a0e27 (Dark Navy)
- Surface: #151a36 (Lighter Navy)

## Resources for Placeholder Images
If you need temporary placeholders while gathering real images:
- **Unsplash**: https://unsplash.com (Free high-quality photos)
- **Pexels**: https://pexels.com (Free stock photos)
- **Placeholder Services**: placeholder.com, placehold.co

Search terms: "technology", "coding", "business", "automation", "cloud computing", "dashboard", "data visualization"
